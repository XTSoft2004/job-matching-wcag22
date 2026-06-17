import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      companyId: 1, // Hardcoded for demo
      employerId: 1, // Hardcoded for demo
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      benefits: formData.get('benefits'),
      jobType: formData.get('jobType'),
      salaryMin: Number(formData.get('salaryMin')),
      salaryMax: Number(formData.get('salaryMax')),
      province: formData.get('province'),
      isSalaryNegotiable: formData.get('isSalaryNegotiable') === 'on'
    };

    try {
      await api.post('/jobs', data);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-8 md:p-10 border-b border-gray-200 bg-gray-50">
          <h1 className="text-3xl font-extrabold text-gray-900">Post a new job</h1>
          <p className="mt-2 text-gray-600">Fill out the details below to publish a job posting and embed it into our AI vector search.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8" aria-label="Job posting form">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md" role="status">
              <p className="text-green-700 font-medium">Job posted successfully! AI is currently generating embeddings. Redirecting...</p>
            </div>
          )}

          <fieldset className="space-y-6">
            <legend className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 w-full">Basic Information</legend>
            
            <div>
              <label htmlFor="title" className="label-text">Job Title <span className="text-red-500" aria-label="required">*</span></label>
              <input id="title" name="title" type="text" required className="input-field" placeholder="e.g. Senior React Developer" aria-required="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="label-text">Job Type <span className="text-red-500" aria-label="required">*</span></label>
                <select id="jobType" name="jobType" required className="input-field" aria-required="true">
                  <option value="">Select type</option>
                  <option value="Toàn thời gian">Full-time</option>
                  <option value="Bán thời gian">Part-time</option>
                  <option value="Làm từ xa">Remote</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label htmlFor="province" className="label-text">Location (Province)</label>
                <input id="province" name="province" type="text" className="input-field" placeholder="e.g. Ho Chi Minh City" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 w-full">Job Details</legend>
            
            <div>
              <label htmlFor="description" className="label-text">Job Description <span className="text-red-500" aria-label="required">*</span></label>
              <textarea id="description" name="description" rows={4} required className="input-field resize-y" placeholder="Describe the role and responsibilities..." aria-required="true"></textarea>
            </div>

            <div>
              <label htmlFor="requirements" className="label-text">Requirements</label>
              <textarea id="requirements" name="requirements" rows={4} className="input-field resize-y" placeholder="List the skills and qualifications..."></textarea>
            </div>

            <div>
              <label htmlFor="benefits" className="label-text">Benefits</label>
              <textarea id="benefits" name="benefits" rows={4} className="input-field resize-y" placeholder="List the perks and benefits..."></textarea>
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 w-full">Salary Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salaryMin" className="label-text">Minimum Salary (VND)</label>
                <input id="salaryMin" name="salaryMin" type="number" className="input-field" placeholder="e.g. 15000000" min="0" />
              </div>
              <div>
                <label htmlFor="salaryMax" className="label-text">Maximum Salary (VND)</label>
                <input id="salaryMax" name="salaryMax" type="number" className="input-field" placeholder="e.g. 30000000" min="0" />
              </div>
            </div>
            
            <div className="flex items-center">
              <input id="isSalaryNegotiable" name="isSalaryNegotiable" type="checkbox" className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="isSalaryNegotiable" className="ml-3 block text-sm text-gray-700 font-medium">
                Salary is negotiable
              </label>
            </div>
          </fieldset>

          <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" aria-busy={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
