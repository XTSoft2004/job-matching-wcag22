import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';
import { Company } from '../modules/companies/entities/company.entity';
import { Job, JobType, JobStatus } from '../modules/jobs/entities/job.entity';
import { HashUtil } from '../common/utils/hash.util';
import * as fs from 'fs';
import * as path from 'path';

// Trình tạo slug đơn giản cho job
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('\n=========================================');
  console.log('🏁  BẮT ĐẦU LUỒNG KIỂM TRA ĐĂNG KÝ & ĐĂNG BÀI  🏁');
  console.log('=========================================');

  try {
    const userRepository = dataSource.getRepository(User);
    const companyRepository = dataSource.getRepository(Company);
    const jobRepository = dataSource.getRepository(Job);

    const email = 'thuthua@test.com';
    const passwordRaw = '123123';
    const companyName = 'Công ty Cổ phần Đầu tư Phát triển Thủ Thừa';

    console.log('\n👉 Bước 1: Dọn dẹp dữ liệu cũ (Clean Up)...');
    
    // Tìm user cũ
    const oldUser = await userRepository.findOne({ where: { email } });
    if (oldUser) {
      console.log(`- Đã tìm thấy tài khoản cũ ${email}, tiến hành xóa...`);
      // Xóa job, company liên kết trước
      if (oldUser.companyId) {
        await jobRepository.delete({ companyId: oldUser.companyId });
        await companyRepository.delete(oldUser.companyId);
      }
      await userRepository.delete(oldUser.id);
      console.log('✅ Đã dọn dẹp dữ liệu cũ.');
    } else {
      // Đảm bảo không trùng tên công ty
      const oldComp = await companyRepository.findOne({ where: { name: companyName } });
      if (oldComp) {
        await jobRepository.delete({ companyId: oldComp.id });
        await companyRepository.delete(oldComp.id);
        console.log('- Đã dọn dẹp công ty trùng tên.');
      }
    }

    console.log('\n👉 Bước 2: Đăng ký tài khoản Nhà tuyển dụng mới...');
    const passwordHash = await HashUtil.hash(passwordRaw);
    const user = userRepository.create({
      email,
      passwordHash,
      fullName: 'Đại diện tuyển dụng Thủ Thừa',
      phone: '0988777666',
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE, // Kích hoạt ngay lập tức
      emailVerified: true,
      createdBy: 'test-workflow',
      modifiedBy: 'test-workflow',
    });
    const savedUser = await userRepository.save(user);
    console.log(`✅ Đã đăng ký & kích hoạt thành công tài khoản: ${savedUser.email}`);

    console.log('\n👉 Bước 3: Đọc hồ sơ doanh nghiệp từ file JSON crawls/data/1932590.json...');
    
    // Đọc file crawls/data/1932590.json
    // Lưu ý đường dẫn tương đối từ thư mục apps/backend
    const crawlFilePath = path.join(__dirname, '..', '..', '..', '..', 'crawls', 'data', '1932590.json');
    if (!fs.existsSync(crawlFilePath)) {
      throw new Error(`Không tìm thấy file crawl tại đường dẫn: ${crawlFilePath}`);
    }

    const crawlData = JSON.parse(fs.readFileSync(crawlFilePath, 'utf8'));
    console.log(`- Đã đọc dữ liệu cào của: "${crawlData.company_name}"`);

    console.log('\n👉 Bước 4: Tạo hồ sơ doanh nghiệp...');
    const company = companyRepository.create({
      name: crawlData.company_name,
      logo: crawlData.avatar,
      website: 'https://thuthualand.vn', // Giả lập website công ty
      address: crawlData.company_address,
      companySize: crawlData.company_scale,
      description: `Lĩnh vực hoạt động: ${crawlData.company_field || 'Bất động sản'}`,
      createdBy: 'test-workflow',
      modifiedBy: 'test-workflow',
    });
    const savedCompany = await companyRepository.save(company);
    console.log(`✅ Đã tạo hồ sơ công ty: "${savedCompany.name}" (ID: ${savedCompany.id})`);

    // Liên kết tài khoản Nhà tuyển dụng với công ty vừa tạo
    savedUser.companyId = savedCompany.id;
    await userRepository.save(savedUser);
    console.log(`✅ Đã liên kết tài khoản ${savedUser.email} với công ty ID ${savedCompany.id}`);

    console.log('\n👉 Bước 5: Phân tích thông tin và Đăng tuyển Job...');
    
    // Parse salary
    let salaryMin = 8000000;
    let salaryMax = 50000000;
    let isSalaryNegotiable = false;
    
    if (crawlData.salary.includes('Thỏa thuận') || crawlData.salary.includes('Thoả thuận')) {
      isSalaryNegotiable = true;
    }
    
    // Parse vacancies (ví dụ: "5 người" -> 5)
    let quantity = 1;
    const qtyMatch = crawlData.vacancies ? crawlData.vacancies.match(/\d+/) : null;
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[0], 10);
    }

    // Parse deadline "10/07/2026" -> Date
    let deadline: Date | undefined = undefined;
    if (crawlData.deadline) {
      const parts = crawlData.deadline.split('/');
      if (parts.length === 3) {
        deadline = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    const job = jobRepository.create({
      employerId: savedUser.id,
      companyId: savedCompany.id,
      title: crawlData.title,
      slug: generateSlug(crawlData.title),
      description: crawlData.description || 'Mô tả công việc chi tiết',
      requirements: crawlData.requirements || 'Yêu cầu ứng viên',
      benefits: crawlData.benefits || 'Quyền lợi được hưởng',
      industry: crawlData.industry || 'Bất động sản',
      jobType: JobType.FULL_TIME,
      experienceLevel: crawlData.experience || '1 năm',
      quantity,
      salaryMin,
      salaryMax,
      isSalaryNegotiable,
      workAddress: crawlData.location,
      province: 'Hồ Chí Minh',
      status: JobStatus.ACTIVE,
      deadline,
      createdBy: 'test-workflow',
      modifiedBy: 'test-workflow',
    });

    const savedJob = await jobRepository.save(job);
    console.log(`✅ Đăng bài tuyển dụng thành công: "${savedJob.title}"`);
    console.log(`- Mã tin tuyển dụng: ${savedJob.id}`);
    const printMin = savedJob.salaryMin ? Number(savedJob.salaryMin).toLocaleString() : '0';
    const printMax = savedJob.salaryMax ? Number(savedJob.salaryMax).toLocaleString() : '0';
    console.log(`- Mức lương: ${printMin} - ${printMax} VND`);
    console.log(`- Số lượng tuyển: ${savedJob.quantity} người`);
    console.log(`- Hạn nộp: ${savedJob.deadline ? savedJob.deadline.toISOString().substring(0, 10) : 'Không có'}`);

    console.log('\n=========================================');
    console.log('🎉  HOÀN THÀNH LUỒNG TỰ ĐỘNG HÓA THÀNH CÔNG!  🎉');
    console.log('=========================================');
    console.log(`Tài khoản test đăng nhập:\nEmail: ${email}\nMật khẩu: ${passwordRaw}`);

  } catch (error) {
    console.error('🚨 Lỗi khi thực hiện luồng:', error);
  } finally {
    await app.close();
    console.log('\nĐã đóng kết nối CSDL.');
  }
}

bootstrap();
