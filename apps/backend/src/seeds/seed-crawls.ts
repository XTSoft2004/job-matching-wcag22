import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';
import { Company } from '../modules/companies/entities/company.entity';
import { Job, JobType, JobStatus } from '../modules/jobs/entities/job.entity';
import { HashUtil } from '../common/utils/hash.util';
import * as fs from 'fs';
import * as path from 'path';

// Helper: slugify string into non-accented alphanumeric format
function slugify(text: string): string {
  if (!text) return '';
  let str = text.toLowerCase().trim();
  // Normalization NFD to decompose characters
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Custom mapping for Vietnamese characters
  str = str.replace(/[đĐ]/g, 'd');
  // Remove special characters
  str = str.replace(/[^a-z0-9\s-]/g, '');
  // Replace spaces and consecutive hyphens with a single hyphen
  str = str.replace(/[\s-]+/g, '-');
  // Trim hyphens from starts and ends
  str = str.replace(/^-+|-+$/g, '');
  return str;
}

// Helper: clean layout text and remove redundant headers
function cleanText(text: string, headerPrefixPattern?: RegExp): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Standardize newlines
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (headerPrefixPattern) {
    cleaned = cleaned.replace(headerPrefixPattern, '');
  }
  // Trim spaces and clean up double spaces/newlines
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^\n+/, '').trim();
  return cleaned;
}

// Helper: remove TopCV image proxy to yield the direct URL
function cleanLogoUrl(url: string): string | null {
  if (!url) return null;
  const prefixes = [
    'https://cdn-new.topcv.vn/unsafe/',
    'https://cdn.topcv.vn/unsafe/'
  ];
  let cleaned = url.trim();
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
    }
  }
  return cleaned;
}

// Helper: parse TopCV's salary string into min/max numeric fields (VND)
function parseSalary(salaryStr: string): { salaryMin?: number; salaryMax?: number; isSalaryNegotiable: boolean } {
  if (!salaryStr) {
    return { isSalaryNegotiable: true };
  }

  const text = salaryStr.toLowerCase().trim();
  if (
    text.includes('thỏa thuận') ||
    text.includes('thoả thuận') ||
    text.includes('thương lượng') ||
    text.includes('negotiable')
  ) {
    return { isSalaryNegotiable: true };
  }

  let multiplier = 1;
  if (text.includes('triệu') || text.includes('tr')) {
    multiplier = 1000000;
  } else if (text.includes('$') || text.includes('usd')) {
    multiplier = 25000; // 1 USD = 25,000 VND exchange rate
  }

  // Remove commas to parse numbers cleanly (e.g. 1,000 -> 1000)
  const numbers = text.replace(/,/g, '').match(/\d+(\.\d+)?/g);

  if (!numbers || numbers.length === 0) {
    return { isSalaryNegotiable: true };
  }

  let min: number | undefined;
  let max: number | undefined;

  if (numbers.length >= 2) {
    min = parseFloat(numbers[0]) * multiplier;
    max = parseFloat(numbers[1]) * multiplier;
  } else {
    const val = parseFloat(numbers[0]) * multiplier;
    if (
      text.includes('từ') ||
      text.includes('trên') ||
      text.includes('min') ||
      text.includes('>') ||
      text.includes('+')
    ) {
      min = val;
    } else if (
      text.includes('đến') ||
      text.includes('tới') ||
      text.includes('dưới') ||
      text.includes('lên đến') ||
      text.includes('max') ||
      text.includes('<')
    ) {
      max = val;
    } else {
      min = val;
    }
  }

  return {
    salaryMin: min,
    salaryMax: max,
    isSalaryNegotiable: false,
  };
}

// Helper: parse number of vacancies
function parseVacancies(vacStr: string): number {
  if (!vacStr) return 1;
  const cleaned = vacStr.toLowerCase().trim();
  if (cleaned.includes('không giới hạn') || cleaned.includes('không hạn chế')) {
    return 99;
  }
  const match = cleaned.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

// Helper: parse deadline from DD/MM/YYYY
function parseDeadline(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const trimmed = dateStr.trim();
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed in JS
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? undefined : d;
}

// Helper: map job type strings to JobType enum
function mapJobType(typeStr: string): JobType {
  if (!typeStr) return JobType.FULL_TIME;
  const t = typeStr.toLowerCase().trim();
  if (t.includes('bán thời gian') || t.includes('part')) {
    return JobType.PART_TIME;
  }
  if (t.includes('từ xa') || t.includes('remote')) {
    return JobType.REMOTE;
  }
  if (t.includes('freelance')) {
    return JobType.FREELANCE;
  }
  if (t.includes('thực tập') || t.includes('intern')) {
    return JobType.INTERN;
  }
  return JobType.FULL_TIME;
}

async function bootstrap() {
  console.log('--- Khởi động context NestJS ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('--- Bắt đầu quy trình làm sạch & nạp dữ liệu cào ---');

  try {
    const companyRepository = dataSource.getRepository(Company);
    const userRepository = dataSource.getRepository(User);
    const jobRepository = dataSource.getRepository(Job);

    console.log('1. Đang dọn sạch toàn bộ dữ liệu cũ trong Database...');
    await dataSource.query('TRUNCATE TABLE "jobs" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "companies" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');
    console.log('✅ Đã xóa toàn bộ dữ liệu.');

    console.log('2. Đang nạp các tài khoản người dùng mặc định...');
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(usersFilePath)) {
      const rawUsers = fs.readFileSync(usersFilePath, 'utf8');
      const usersData = JSON.parse(rawUsers);
      for (const item of usersData) {
        const passwordHash = await HashUtil.hash(item.password);
        const user = userRepository.create({
          email: item.email,
          passwordHash,
          fullName: item.fullName,
          phone: item.phone,
          role: item.role as UserRole,
          status: item.status as UserStatus,
          emailVerified: true,
          createdBy: 'seed',
          modifiedBy: 'seed',
        });
        await userRepository.save(user);
        console.log(`- Đã tạo user: ${item.email} (${item.role})`);
      }
    } else {
      console.warn(`⚠️ Cảnh báo: Không tìm thấy file users.json tại ${usersFilePath}`);
    }

    // Resolve crawls/data path safely
    const workspaceRoot = path.resolve(__dirname, '../../../../');
    const crawlsDir = path.join(workspaceRoot, 'crawls', 'data');
    console.log(`Thư mục dữ liệu cào: ${crawlsDir}`);

    if (!fs.existsSync(crawlsDir)) {
      throw new Error(`Không tìm thấy thư mục: ${crawlsDir}`);
    }

    const files = fs.readdirSync(crawlsDir).filter((file) => file.endsWith('.json'));
    console.log(`Tìm thấy ${files.length} tệp tin JSON tuyển dụng.`);

    let successJobs = 0;
    let skippedJobs = 0;
    let createdCompanies = 0;
    let createdRecruiters = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(crawlsDir, file);
      
      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const item = JSON.parse(rawContent);

        if (!item.company_name || !item.title) {
          console.log(`[Bỏ qua] Tệp ${file} thiếu thông tin company_name hoặc title.`);
          skippedJobs++;
          continue;
        }

        const companyName = item.company_name.trim().replace(/\s+/g, ' ');
        const jobTitle = item.title.trim().replace(/\s+/g, ' ');

        // 1. Check or Create Company
        let company = await companyRepository.findOne({
          where: { name: companyName },
        });

        if (!company) {
          company = companyRepository.create({
            name: companyName,
            logo: cleanLogoUrl(item.avatar),
            website: null,
            address: item.company_address ? item.company_address.trim().replace(/\s+/g, ' ') : null,
            companySize: item.company_scale ? item.company_scale.trim() : null,
            description: item.company_field ? `Lĩnh vực: ${item.company_field.trim()}` : null,
            createdBy: 'crawler_seed',
            modifiedBy: 'crawler_seed',
          });
          company = await companyRepository.save(company);
          createdCompanies++;
          console.log(`[Công ty mới] Đã tạo công ty: ${companyName}`);
        }

        // 2. Check or Create Recruiter User
        const companySlug = slugify(companyName).replace(/-/g, '_');
        const email = `employer_${companySlug}@employer.com`;

        let recruiter = await userRepository.findOne({
          where: { email },
        });

        if (!recruiter) {
          const passwordHash = await HashUtil.hash('123123');
          recruiter = userRepository.create({
            email,
            passwordHash,
            fullName: `HR ${companyName}`,
            role: UserRole.EMPLOYER,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            company: company,
            createdBy: 'crawler_seed',
            modifiedBy: 'crawler_seed',
          });
          recruiter = await userRepository.save(recruiter);
          createdRecruiters++;
          console.log(`[Tài khoản mới] Đã tạo recruiter: ${email}`);
        }

        // 3. Check or Create Job with unique slug
        const jobSlug = `${slugify(jobTitle)}-${item.id}`;
        const existingJob = await jobRepository.findOne({
          where: { slug: jobSlug },
        });

        if (existingJob) {
          console.log(`[Bỏ qua] Tin đăng "${jobTitle}" (${jobSlug}) đã tồn tại trong DB.`);
          skippedJobs++;
          continue;
        }

        // Clean content fields
        const cleanedDesc = cleanText(item.description, /^mô tả công việc\s*[\n\r:]*/i);
        const cleanedReqs = cleanText(item.requirements, /^yêu cầu ứng viên\s*[\n\r:]*|^yêu cầu công việc\s*[\n\r:]*/i);
        const cleanedBens = cleanText(item.benefits, /^quyền lợi\s*[\n\r:]*|^quyền lợi được hưởng\s*[\n\r:]*/i);

        // Parse fields
        const salaryInfo = parseSalary(item.salary);
        const quantity = parseVacancies(item.vacancies);
        const deadline = parseDeadline(item.deadline);

        const job = jobRepository.create({
          title: jobTitle,
          slug: jobSlug,
          description: cleanedDesc || 'Chưa cập nhật mô tả công việc.',
          requirements: cleanedReqs || null,
          benefits: cleanedBens || null,
          industry: item.industry ? item.industry.trim() : (item.company_field ? item.company_field.trim() : null),
          jobType: mapJobType(item.job_type),
          experienceLevel: item.experience ? item.experience.trim() : null,
          quantity: quantity,
          salaryMin: salaryInfo.salaryMin,
          salaryMax: salaryInfo.salaryMax,
          isSalaryNegotiable: salaryInfo.isSalaryNegotiable,
          workAddress: item.company_address ? item.company_address.trim().replace(/\s+/g, ' ') : null,
          province: item.location ? item.location.trim() : null,
          status: JobStatus.ACTIVE,
          employer: recruiter,
          company: company,
          postingStartAt: item.crawled_at ? new Date(item.crawled_at) : new Date(),
          deadline: deadline,
          createdBy: 'crawler_seed',
          modifiedBy: 'crawler_seed',
        } as any);

        await jobRepository.save(job);
        successJobs++;
        console.log(`[Tiến trình ${i + 1}/${files.length}] Đã nạp tin: "${jobTitle}"`);
      } catch (err) {
        console.error(`[Lỗi] Không thể nạp file ${file}:`, err.message);
        skippedJobs++;
      }
    }

    console.log('\n====== BÁO CÁO THỐNG KÊ ======');
    console.log(`- Số tin tuyển dụng nạp mới: ${successJobs}`);
    console.log(`- Số tin tuyển dụng bỏ qua/lỗi: ${skippedJobs}`);
    console.log(`- Số công ty tạo mới: ${createdCompanies}`);
    console.log(`- Số tài khoản recruiter tạo mới: ${createdRecruiters}`);
    console.log('==============================\n');

  } catch (error) {
    console.error('Lỗi nghiêm trọng khi chạy Seeding:', error);
  } finally {
    await app.close();
    console.log('Đã đóng kết nối cơ sở dữ liệu.');
  }
}

bootstrap();
