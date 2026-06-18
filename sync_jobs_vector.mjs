async function syncJobsToVectorDB() {
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

  console.log('Fetching existing jobs from normal DB...');
  let jobs = [];
  try {
    const res = await fetch('http://localhost:3000/api/v1/jobs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    jobs = Array.isArray(data.data) ? data.data : [];
    console.log(`Found ${jobs.length} jobs.`);
  } catch (err) {
    console.error('Failed to fetch jobs:', err.message);
    return;
  }

  if (jobs.length === 0) {
    console.log('No jobs found to sync.');
    return;
  }

  console.log('Starting sync to Vector DB (AI Tools)...');
  for (const job of jobs) {
    console.log(`Syncing job: "${job.title}" (ID: ${job.id})...`);
    try {
      const embedRes = await fetch('http://127.0.0.1:8000/api/v1/jobs/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          industry: job.industry,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          workAddress: job.workAddress,
          province: job.province,
          companyId: job.company?.id || job.companyId || 1,
          employerId: job.employer?.id || job.employerId || 1,
          companyName: job.company?.name || null
        })
      });

      if (embedRes.ok) {
        console.log(`✅ Queued embedding for "${job.title}"`);
      } else {
        const errData = await embedRes.text();
        console.error(`❌ Failed to queue "${job.title}":`, errData);
      }
    } catch (err) {
      console.error(`🚨 Error syncing "${job.title}":`, err.message);
      console.log('👉 Please ensure the ai-tools service is running on port 8000.');
      break; // stop if ai-tools is unreachable
    }
  }
  
  console.log('Done syncing to Vector DB!');
}

syncJobsToVectorDB();
