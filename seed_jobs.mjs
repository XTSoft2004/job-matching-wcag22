const jobs = [
  {
    title: 'Senior Frontend Developer (React/Vite)',
    companyName: 'TechCorp',
    description: 'We are looking for an experienced Frontend Developer to build highly accessible and performant web applications using React, Vite, and Tailwind CSS. You will work closely with our UI/UX team to implement WCAG 2.2 compliant interfaces.',
    requirements: '- 4+ years of experience with ReactJS.\n- Strong understanding of web accessibility (WCAG) and ARIA standards.\n- Experience with Tailwind CSS and responsive design.\n- Knowledge of TypeScript and modern JavaScript.',
    benefits: '- Competitive salary up to 40M VND.\n- 13th-month salary and performance bonus.\n- Flexible working hours and hybrid remote options.\n- Premium health insurance for you and your family.',
    jobType: 'Toàn thời gian',
    industry: 'IT / Software',
    experienceLevel: 'Senior',
    quantity: 2,
    salaryMin: 25000000,
    salaryMax: 40000000,
    isSalaryNegotiable: false,
    province: 'Hồ Chí Minh'
  },
  {
    title: 'Python Backend Developer (FastAPI)',
    companyName: 'InnoSoft',
    description: 'Join our AI engineering team to build robust backend systems and microservices using Python and FastAPI. You will integrate machine learning models, vector databases, and handle high-throughput asynchronous tasks.',
    requirements: '- 3+ years of Python backend development.\n- Solid experience with FastAPI or similar async frameworks.\n- Familiarity with Vector Databases (Pinecone, Milvus) and LLMs.\n- Understanding of SQL and NoSQL databases.',
    benefits: '- Salary up to 50M VND.\n- Provide Macbook Pro.\n- 14 days annual leave.\n- Annual team building trip.',
    jobType: 'Toàn thời gian',
    industry: 'IT / Software',
    experienceLevel: 'Mid-Senior',
    quantity: 1,
    salaryMin: 30000000,
    salaryMax: 50000000,
    isSalaryNegotiable: true,
    province: 'Hà Nội'
  },
  {
    title: 'Digital Marketing Specialist',
    companyName: 'TechCorp',
    description: 'We are seeking a creative Digital Marketing Specialist to manage our online presence and marketing campaigns. You will run ads, manage social media accounts, and analyze conversion metrics.',
    requirements: '- 2+ years of experience in Digital Marketing.\n- Proven track record in Facebook Ads and Google Ads.\n- Experience with SEO and Content Marketing.\n- Good English communication skills.',
    benefits: '- Dynamic, young working environment.\n- Commissions and KPIs bonuses.\n- Free snacks and drinks at the office.',
    jobType: 'Toàn thời gian',
    industry: 'Marketing',
    experienceLevel: 'Junior-Mid',
    quantity: 3,
    salaryMin: 12000000,
    salaryMax: 20000000,
    isSalaryNegotiable: true,
    province: 'Hồ Chí Minh'
  },
  {
    title: 'Product UI/UX Designer',
    companyName: 'DesignWorks',
    description: 'Looking for a passionate UI/UX Designer to craft beautiful and intuitive user experiences for our recruitment platform. You must ensure all designs meet WCAG 2.2 accessibility standards.',
    requirements: '- Proficient in Figma and prototyping tools.\n- Strong portfolio demonstrating web and mobile app design.\n- Understanding of user-centered design principles and accessibility guidelines.',
    benefits: '- Creative freedom and modern tech stack.\n- Monthly training budget.\n- Flexible remote working days.',
    jobType: 'Làm từ xa',
    industry: 'Design',
    experienceLevel: 'Mid',
    quantity: 1,
    salaryMin: 15000000,
    salaryMax: 25000000,
    isSalaryNegotiable: false,
    province: 'Đà Nẵng'
  },
  {
    title: 'Nhân viên kinh doanh (Sales Executive)',
    companyName: 'InnoSoft',
    description: 'Tìm kiếm và tư vấn khách hàng doanh nghiệp sử dụng dịch vụ nền tảng tuyển dụng của công ty. Đàm phán, ký kết hợp đồng và chăm sóc khách hàng.',
    requirements: '- Có ít nhất 1 năm kinh nghiệm B2B Sales.\n- Kỹ năng giao tiếp, thuyết phục tốt.\n- Nhiệt tình, năng động và chịu được áp lực doanh số.',
    benefits: '- Lương cứng + Hoa hồng không giới hạn.\n- Được đào tạo kỹ năng bán hàng chuyên sâu.\n- Lộ trình thăng tiến rõ ràng lên Team Leader.',
    jobType: 'Toàn thời gian',
    industry: 'Sales / Kinh doanh',
    experienceLevel: 'Junior',
    quantity: 5,
    salaryMin: 8000000,
    salaryMax: 15000000,
    isSalaryNegotiable: true,
    province: 'Hồ Chí Minh'
  }
];

async function seedJobs() {
  console.log('Logging in to get token...');
  let token = '';
  try {
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@jobmatching.com', password: 'Admin123@' })
    });
    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(loginData.message || 'Login failed');
    }
    token = loginData.data?.accessToken || loginData.accessToken || loginData.token;
    console.log('✅ Logged in successfully!');
  } catch (error) {
    console.error('🚨 Failed to login:', error.message);
    return;
  }

  console.log('Fetching user profile...');
  let adminUserId = 1;
  try {
    const profileRes = await fetch('http://localhost:3000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      adminUserId = profileData.data?.id || profileData.id || 1;
      console.log('✅ Admin User ID:', adminUserId);
    }
  } catch (err) {
    console.error('🚨 Could not fetch profile, defaulting to ID 1', err.message);
  }

  console.log('Fetching or creating companies...');
  let companies = [];
  try {
    let companiesRes = await fetch('http://localhost:3000/api/v1/companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let companiesData = await companiesRes.json();
    companies = Array.isArray(companiesData.data) ? companiesData.data : [];
    
    const companyNames = [...new Set(jobs.map(j => j.companyName))];
    let createdAny = false;
    
    for (const name of companyNames) {
      if (!companies.find(c => c.name === name)) {
        const createRes = await fetch('http://localhost:3000/api/v1/companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name,
            companySize: '100-500',
            description: 'A great company to work for.'
          })
        });
        if (createRes.ok) {
          console.log(`✅ Created company: ${name}`);
          createdAny = true;
        } else {
          const createData = await createRes.json();
          console.error(`❌ Failed to create company ${name} -`, createData.message);
        }
      } else {
        console.log(`⏩ Bỏ qua: Company "${name}" đã tồn tại`);
      }
    }
    
    if (createdAny) {
      console.log('⏳ Đợi 2 giây để CSDL cập nhật...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Fetch again to get the new IDs
      companiesRes = await fetch('http://localhost:3000/api/v1/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      companiesData = await companiesRes.json();
      companies = Array.isArray(companiesData.data) ? companiesData.data : [];
    }
    
    console.log('✅ Các Company đã lấy được từ DB:', companies.map(c => `${c.id}: ${c.name}`).join(', '));
  } catch (err) {
    console.error('🚨 Failed to process companies', err.message);
  }

  console.log('Fetching existing jobs...');
  let existingJobs = [];
  try {
    const jobsRes = await fetch('http://localhost:3000/api/v1/jobs?limit=1000', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const jobsData = await jobsRes.json();
    existingJobs = Array.isArray(jobsData.data) ? jobsData.data : [];
  } catch (err) {
    console.error('🚨 Failed to fetch existing jobs');
  }

  console.log('Starting to seed jobs...');

  for (const job of jobs) {
    if (existingJobs.find(j => j.title === job.title)) {
      console.log(`⏩ Bỏ qua: Job "${job.title}" đã tồn tại`);
      continue;
    }

    const company = companies.find(c => c.name === job.companyName);
    if (!company) {
      console.error(`❌ Lỗi: Không tìm thấy Company "${job.companyName}" trong DB cho job "${job.title}"`);
      continue;
    }
    
    const payload = { ...job, employerId: adminUserId, companyId: company.id };
    delete payload.companyName;

    try {
      const response = await fetch('http://localhost:3000/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Success: Added "${job.title}" (Company: ${company.name} - ID: ${company.id})`);
      } else {
        console.error(`❌ Failed: "${job.title}" -`, data);
      }
    } catch (error) {
      console.error(`🚨 Error pushing "${job.title}":`, error.message);
    }
    // Wait for 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  console.log('Seeding completed! Check your vector database.');
}

seedJobs();

