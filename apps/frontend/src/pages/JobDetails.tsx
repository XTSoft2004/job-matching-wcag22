import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Mail
} from 'lucide-react';

interface JobDetailData {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  industry: string | null;
  jobType: string;
  experienceLevel: string | null;
  quantity: number;
  salaryMin: number | null;
  salaryMax: number | null;
  isSalaryNegotiable: boolean;
  workAddress: string | null;
  province: string | null;
  deadline: string | null;
  companyId: number;
  company?: {
    id: number;
    name: string;
    logo: string | null;
    website: string | null;
    address: string | null;
    description: string | null;
    companySize: string | null;
  };
  employer?: {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
  };
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<JobDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.message ||
          'Không thể tải thông tin chi tiết công việc này. Vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Handle Application Submit
  const handleApplyConfirm = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    // Simulate API delay for apply submission
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setApplying(false);
    setIsApplyModalOpen(false);
    setIsApplied(true);
  };

  // Helper to format salary
  const formatSalary = () => {
    if (!job) return '';
    if (job.isSalaryNegotiable) return 'Thỏa thuận';
    
    const min = job.salaryMin ? Number(job.salaryMin).toLocaleString() : null;
    const max = job.salaryMax ? Number(job.salaryMax).toLocaleString() : null;
    
    if (min && max) return `${min} - ${max} VND`;
    if (min) return `Từ ${min} VND`;
    if (max) return `Lên đến ${max} VND`;
    return 'Thỏa thuận';
  };

  // Helper to format deadline
  const formatDeadline = (dateStr: string | null) => {
    if (!dateStr) return 'Không xác định';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm max-w-3xl mx-auto my-12">
        <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-500 font-semibold text-lg">Đang tải thông tin chi tiết công việc...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm max-w-2xl mx-auto my-12 space-y-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy công việc</h1>
        <p className="text-gray-600">{error || 'Công việc này không tồn tại hoặc đã bị gỡ bỏ.'}</p>
        <div className="pt-2">
          <Link to="/" className="btn-primary inline-flex gap-2">
            <ChevronLeft className="w-5 h-5" />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in relative">
      {/* Back button */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold py-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Quay lại danh sách việc làm</span>
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Job Details content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card Header */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                {job.industry || 'Lĩnh vực công việc'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {job.title}
              </h1>
              <p className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                <span>{job.company?.name || 'Doanh nghiệp'}</span>
              </p>
            </div>

            {/* Quick summary badges grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Mức lương</span>
                  <span className="font-semibold text-gray-800 text-sm">{formatSalary()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Địa điểm</span>
                  <span className="font-semibold text-gray-800 text-sm">{job.province || 'Toàn quốc'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Kinh nghiệm</span>
                  <span className="font-semibold text-gray-800 text-sm">{job.experienceLevel || 'Không yêu cầu'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Hình thức</span>
                  <span className="font-semibold text-gray-800 text-sm">{job.jobType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job description section */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary-600 pl-3">
              Mô tả công việc
            </h2>
            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
              {job.description}
            </div>

            {job.requirements && (
              <>
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary-600 pl-3 pt-4">
                  Yêu cầu ứng viên
                </h2>
                <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {job.requirements}
                </div>
              </>
            )}

            {job.benefits && (
              <>
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary-600 pl-3 pt-4">
                  Quyền lợi được hưởng
                </h2>
                <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {job.benefits}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column: Company Info & Action Panel */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          
          {/* Action apply card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Ứng tuyển công việc này</h3>
            <p className="text-sm text-gray-500">Hồ sơ cá nhân và thông tin liên hệ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng.</p>
            
            {isApplied ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Đã nộp đơn ứng tuyển thành công!</span>
              </div>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-100 flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-primary-200"
              >
                <span>Ứng tuyển ngay</span>
              </button>
            )}

            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Hạn nộp hồ sơ: {formatDeadline(job.deadline)}</span>
            </div>
          </div>

          {/* Company details card */}
          {job.company && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Thông tin doanh nghiệp</h3>
              
              <div className="flex items-center gap-4">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={`Logo ${job.company.name}`}
                    className="w-14 h-14 rounded-xl object-contain border border-gray-100 bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">{job.company.name}</h4>
                  {job.company.companySize && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-500 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      <span>{job.company.companySize}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-gray-600">
                {job.company.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{job.company.address}</span>
                  </div>
                )}

                {job.company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 hover:text-primary-800 font-semibold flex items-center gap-1.5 transition-colors focus-visible:underline focus-visible:outline-none"
                      aria-label={`Ghé thăm website của ${job.company.name} (mở trong tab mới)`}
                    >
                      <span>Ghé thăm website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {job.employer?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={`mailto:${job.employer.email}`}
                      className="text-primary-700 hover:text-primary-800 font-semibold transition-colors focus-visible:underline focus-visible:outline-none"
                      aria-label={`Gửi email liên hệ tới ${job.employer.email}`}
                    >
                      <span>{job.employer.email}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Apply Modal Overlay */}
      {isApplyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal box */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden animate-slide-up">
            
            {/* Close button */}
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Đóng hộp thoại ứng tuyển"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4 pt-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-inner">
                <Briefcase className="h-6 w-6" aria-hidden="true" />
              </div>
              
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                Xác nhận ứng tuyển
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Bạn đang ứng tuyển cho công việc:<br />
                <strong className="text-gray-900 font-bold block mt-1 text-base">{job.title}</strong>
                tại <span className="font-semibold text-gray-800">{job.company?.name}</span>.
              </p>

              {user ? (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-left space-y-1 text-xs text-gray-600">
                  <p><strong>Người ứng tuyển:</strong> {user.fullName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.phone && <p><strong>Số điện thoại:</strong> {user.phone}</p>}
                </div>
              ) : null}

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="btn-secondary flex-1 py-2.5"
                  disabled={applying}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleApplyConfirm}
                  className="btn-primary flex-1 py-2.5 flex justify-center items-center gap-1.5"
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Xác nhận</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Simple Globe icon helper missing in default import of lucide-react if Globe isn't resolved
function Globe({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
