import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AccessibleModal from '../components/ui/AccessibleModal';
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
  Mail,
  User,
  Phone,
  FileText,
  ChevronDown,
  Upload,
  Paperclip
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

  // Application Form States
  const [profileId, setProfileId] = useState<number | null>(null);
  const [cvList, setCvList] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [isNewCv, setIsNewCv] = useState(false);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [newCvDesc, setNewCvDesc] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Focus returning ref
  const applyBtnRef = useRef<HTMLButtonElement>(null);

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

  // Check if candidate has already applied
  useEffect(() => {
    const checkAppliedStatus = async () => {
      if (user && user.role === 'Ứng viên' && id) {
        try {
          const res: any = await api.get('/applications?limit=100');
          const apps = res.data?.data || res.data || [];
          const hasApplied = apps.some((app: any) => app.jobId === Number(id));
          setIsApplied(hasApplied);
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkAppliedStatus();
  }, [user, id]);

  // Handle Opening Apply Modal
  const handleOpenApplyModal = async () => {
    if (!user) {
      notification.warning({
        message: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập với tài khoản Ứng viên để nộp hồ sơ ứng tuyển.'
      });
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user.role !== 'Ứng viên') {
      notification.error({
        message: 'Quyền truy cập hạn chế',
        description: 'Chỉ tài khoản vai trò Ứng viên mới có thể nộp hồ sơ ứng tuyển cho công việc này.'
      });
      return;
    }

    setIsApplyModalOpen(true);
    setModalLoading(true);
    try {
      // Fetch profile (automatically initialized by backend if not exist)
      const profileRes: any = await api.get(`/candidate-profiles/user/${user.id}`);
      const profileData = profileRes.data?.data || profileRes.data || null;
      if (!profileData) {
        throw new Error('Không tìm thấy thông tin hồ sơ của bạn.');
      }
      setProfileId(profileData.id);

      // Fetch CVs list
      const cvsRes: any = await api.get(`/candidate-cvs/profile/${profileData.id}`);
      const cvs = cvsRes.data?.data || cvsRes.data || [];
      setCvList(cvs);

      if (cvs.length > 0) {
        setSelectedCvId(cvs[0].id);
        setIsNewCv(false);
      } else {
        setIsNewCv(true);
      }
    } catch (err: any) {
      console.error(err);
      notification.error({
        message: 'Lỗi tải hồ sơ',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi tải hồ sơ ứng tuyển.'
      });
      setIsApplyModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Application Submit
  const handleApplyConfirm = async () => {
    if (!user || !profileId) return;

    setApplying(true);
    try {
      let cvIdToSubmit = selectedCvId;

      // Create CV inline if selected new CV
      if (isNewCv || cvList.length === 0) {
        if (!newCvFile) {
          notification.error({
            message: 'Thiếu tệp tin CV',
            description: 'Vui lòng chọn tệp tin CV của bạn để tải lên.'
          });
          setApplying(false);
          return;
        }

        // Upload to Supabase Storage
        const { uploadCvToSupabase } = await import('../services/supabase');
        const publicUrl = await uploadCvToSupabase(newCvFile);

        // Add new CV
        await api.post('/candidate-cvs', {
          profileId: profileId,
          cvUrl: publicUrl,
          description: newCvDesc.trim() || newCvFile.name
        });

        // Fetch CVs list again to get the newly created CV's ID (at index 0)
        const cvsRes: any = await api.get(`/candidate-cvs/profile/${profileId}`);
        const cvs = cvsRes.data?.data || cvsRes.data || [];
        if (cvs.length === 0) {
          throw new Error('Không thể đồng bộ CV vừa tải lên.');
        }
        cvIdToSubmit = cvs[0].id;
      }

      if (!cvIdToSubmit) {
        notification.error({
          message: 'Thiếu thông tin CV',
          description: 'Vui lòng chọn hoặc tải lên một bản CV để ứng tuyển.'
        });
        setApplying(false);
        return;
      }

      // Submit application to DB
      await api.post('/applications', {
        jobId: Number(id),
        profileId: profileId,
        candidateCvId: cvIdToSubmit,
        coverLetter: coverLetter
      });

      notification.success({
        message: 'Ứng tuyển thành công!',
        description: `Hồ sơ của bạn đã được gửi trực tiếp đến nhà tuyển dụng cho vị trí "${job?.title}".`
      });

      setIsApplied(true);
      setIsApplyModalOpen(false);

      // Reset form fields
      setNewCvFile(null);
      setNewCvDesc('');
      setCoverLetter('');
    } catch (err: any) {
      console.error(err);
      notification.error({
        message: 'Nộp đơn thất bại',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển.'
      });
    } finally {
      setApplying(false);
    }
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
                ref={applyBtnRef}
                onClick={handleOpenApplyModal}
                className="btn-primary w-full py-3 px-6 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>Ứng tuyển ngay</span>star
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
      <AccessibleModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Ứng tuyển công việc"
        triggerRef={applyBtnRef}
      >
        {modalLoading ? (
          <div className="py-12 text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-semibold text-sm">Đang tải hồ sơ ứng tuyển của bạn...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-100">
                <Briefcase className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs mt-1 truncate font-semibold" title={job.title}>
                  Vị trí tuyển dụng: <strong className="text-gray-900">{job.title}</strong>
                </p>
              </div>
            </div>

            {/* Candidate Summary */}
            {user && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-150/30 rounded-2xl border border-gray-100 space-y-3 shadow-inner">
                <p className="text-gray-900 font-extrabold text-[10px] tracking-wider uppercase">Thông tin liên hệ ứng tuyển</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Ứng viên: <strong className="text-gray-950">{user.fullName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate" title={user.email}>Email: <strong className="text-gray-950">{user.email}</strong></span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-700 font-semibold bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm sm:col-span-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Số điện thoại: <strong className="text-gray-950">{user.phone}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CV Selection / Creation Section */}
            <div className="space-y-3.5">
              <div>
                <label htmlFor="cv-select" className="label-text block font-bold text-gray-800 text-sm mb-1.5">Chọn CV ứng tuyển <span className="text-red-500">*</span></label>
                {cvList.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <select
                        id="cv-select"
                        value={isNewCv ? 'new' : (selectedCvId || '')}
                        onChange={(e) => {
                          if (e.target.value === 'new') {
                            setIsNewCv(true);
                          } else {
                            setIsNewCv(false);
                            setSelectedCvId(Number(e.target.value));
                          }
                        }}
                        className="input-field pl-10 pr-10 text-sm py-2.5 appearance-none w-full bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 cursor-pointer shadow-sm font-medium text-gray-800"
                      >
                        {cvList.map(cv => (
                          <option key={cv.id} value={cv.id}>
                            {cv.description || `CV file (${cv.cvUrl.split('/').pop() || 'Liên kết'})`}
                          </option>
                        ))}
                        <option value="new">➕ Tải lên tệp CV mới...</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5 font-semibold mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Bạn chưa tải lên CV nào. Vui lòng chọn tệp tin CV bên dưới để tải lên và tiếp tục ứng tuyển.</span>
                  </div>
                )}
              </div>

              {/* Inline upload fields if chosen New CV */}
              {(isNewCv || cvList.length === 0) && (
                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-3.5 animate-fade-in text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Tải lên tệp CV mới</span>
                    {cvList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsNewCv(false)}
                        className="text-emerald-700 hover:text-emerald-850 font-bold text-xs hover:underline transition-colors"
                      >
                        Quay lại chọn CV cũ
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative border-2 border-emerald-200 border-dashed hover:border-emerald-500 rounded-2xl p-5 bg-white text-center cursor-pointer transition-all hover:bg-emerald-50/10 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200">
                      <label htmlFor="cv-file-upload" className="sr-only">Tải lên tệp CV mới</label>
                      <input
                        id="cv-file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setNewCvFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-emerald-600 animate-pulse" />
                        <div className="text-xs text-gray-600 font-medium">
                          {newCvFile ? (
                            <span className="text-emerald-800 font-bold">📄 {newCvFile.name} ({(newCvFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          ) : (
                            <span>Kéo thả tệp tin hoặc <strong className="text-emerald-700">chọn từ thiết bị</strong></span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">Hỗ trợ PDF, DOC, DOCX, JPG, PNG lên đến 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="newCvDesc" className="text-xs text-gray-500 font-bold block mb-1">
                      Tên gọi CV / Mô tả ngắn
                    </label>
                    <input
                      id="newCvDesc"
                      type="text"
                      placeholder="Ví dụ: CV tiếng Anh - React Developer"
                      className="input-field text-xs py-2 px-3 bg-white"
                      value={newCvDesc}
                      onChange={(e) => setNewCvDesc(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cover letter field */}
            <div className="space-y-1">
              <label htmlFor="coverLetter" className="label-text block font-bold text-gray-800 text-sm">Thư giới thiệu (Cover Letter)</label>
              <p className="text-gray-400 text-[10px] font-semibold mb-1">Gợi ý: Nhập lời giới thiệu ngắn gọn, súc tích giúp bạn nổi bật hơn trong mắt nhà tuyển dụng.</p>
              <div className="relative">
                <textarea
                  id="coverLetter"
                  rows={3}
                  placeholder="Kính chào nhà tuyển dụng, tôi rất ấn tượng với cơ hội nghề nghiệp này và mong muốn được ứng tuyển. Với kinh nghiệm..."
                  className="input-field resize-y text-xs pl-3 pr-3 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 w-full"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Confirm actions */}
            <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold rounded-2xl text-xs transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={applying}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyConfirm}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex justify-center items-center gap-1.5 shadow-md shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                disabled={applying}
              >
                {applying ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Nộp đơn ứng tuyển</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </AccessibleModal>
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
