import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AccessibleModal from '../components/ui/AccessibleModal';
import { Modal, notification } from 'antd';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

interface ApplicationItem {
  id: number;
  jobId: number;
  job: {
    title: string;
  };
  profile: {
    id: number;
    title: string;
    summary: string | null;
    experienceLevel: string | null;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    province: string | null;
    user: {
      fullName: string;
      email: string;
      phone: string | null;
    };
  };
  candidateCv: {
    cvUrl: string;
    description: string | null;
  };
  coverLetter: string | null;
  status: string;
  employerNote: string | null;
  interviewTime?: string | null;
  createdAt: string;
}

export default function EmployerApplicants() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId');

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterJobTitle, setFilterJobTitle] = useState('');

  // Detail Modal States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [recruiterNote, setRecruiterNote] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // CV Preview States
  const [previewCvUrl, setPreviewCvUrl] = useState<string | null>(null);
  const [previewCvTitle, setPreviewCvTitle] = useState<string>('');

  // Refs for modal focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Helper to format Date to datetime-local string
  const formatDateTimeLocal = (dateStr?: string | Date | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (selectedApp) {
      triggerRef.current = document.activeElement as HTMLElement;

      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([-1])'
        );
        if (focusable && focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedApp(null);
          return;
        }

        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const elements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([-1])'
          );
          if (elements.length === 0) return;

          const firstEl = elements[0];
          const lastEl = elements[elements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastEl) {
              firstEl.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (triggerRef.current) {
          setTimeout(() => triggerRef.current?.focus(), 0);
        }
      };
    }
  }, [selectedApp]);

  const fetchApplications = async (page: number = currentPage, status: string = statusFilter) => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = `/applications?page=${page}&limit=10`;
      if (jobIdFilter) {
        url += `&jobId=${jobIdFilter}`;
      }
      if (status) {
        url += `&status=${status}`;
      }
      const res: any = await api.get(url);
      setApplications(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể tải danh sách hồ sơ ứng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Nhà tuyển dụng') return;
    fetchApplications(currentPage, statusFilter);

    if (jobIdFilter) {
      api.get(`/jobs/${jobIdFilter}`)
        .then((res: any) => {
          const jobData = res.data?.data || res.data;
          setFilterJobTitle(jobData?.title || '');
        })
        .catch((err) => {
          console.error('Failed to fetch job details:', err);
          setFilterJobTitle('');
        });
    } else {
      setFilterJobTitle('');
    }
  }, [user, currentPage, statusFilter, jobIdFilter]);

  const openAppDetails = (app: ApplicationItem) => {
    setSelectedApp(app);
    setRecruiterNote(app.employerNote || '');
    setInterviewTime(formatDateTimeLocal(app.interviewTime));
    setErrorMsg(null);
  };

  // Update applicant status or note
  const handleUpdateApplication = async (
    newStatus: string,
    noteText: string = recruiterNote,
    timeVal: string = interviewTime
  ) => {
    if (!selectedApp) return;

    // Validation for interview invitation
    if (newStatus === 'approved' && !timeVal) {
      notification.warning({
        message: 'Thiếu thời gian phỏng vấn',
        description: 'Vui lòng chọn thời gian phỏng vấn trước khi gửi lời mời cho ứng viên.'
      });
      return;
    }

    const performUpdate = async () => {
      setUpdatingStatus(true);
      setErrorMsg(null);
      try {
        const payload: any = {
          status: newStatus,
          employerNote: noteText || null,
          interviewTime: timeVal ? new Date(timeVal).toISOString() : null
        };

        await api.patch(`/applications/${selectedApp.id}`, payload);

        // Update state
        const updatedApp = {
          ...selectedApp,
          status: newStatus === 'approved' ? 'Phỏng vấn' : newStatus === 'rejected' ? 'Bị từ chối' : newStatus === 'reviewing' ? 'Đang xem xét' : newStatus,
          employerNote: noteText || null,
          interviewTime: timeVal ? new Date(timeVal).toISOString() : null
        };
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));

        const isStatusChange = ['approved', 'rejected', 'reviewing'].includes(newStatus);
        if (isStatusChange) {
          setSelectedApp(null);
        } else {
          setSelectedApp(updatedApp);
        }

        notification.success({
          message: 'Cập nhật thành công',
          description: newStatus === 'approved' 
            ? 'Đã cập nhật trạng thái và gửi thư mời phỏng vấn thành công qua email ứng viên.'
            : 'Hồ sơ ứng viên đã được cập nhật trạng thái và ghi chú.'
        });
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
        notification.error({
          message: 'Cập nhật thất bại',
          description: err.response?.data?.message || 'Không thể lưu các thay đổi của hồ sơ.'
        });
      } finally {
        setUpdatingStatus(false);
      }
    };

    // Confirm dialog if changing status directly
    if (newStatus !== selectedApp.status) {
      let label = 'Đang duyệt';
      if (newStatus === 'approved') label = 'Mời phỏng vấn & Gửi email';
      if (newStatus === 'rejected') label = 'Từ chối hồ sơ';

      Modal.confirm({
        title: 'Xác nhận thay đổi trạng thái',
        content: newStatus === 'approved' 
          ? `Hệ thống sẽ gửi email mời phỏng vấn chính thức vào lúc ${new Date(timeVal).toLocaleString('vi-VN')} cho ứng viên. Bạn có chắc chắn?`
          : `Bạn có chắc muốn chuyển hồ sơ của ứng viên sang trạng thái [${label}]?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        okButtonProps: { style: { backgroundColor: newStatus === 'rejected' ? '#ff4d4f' : '#00b14f', borderColor: newStatus === 'rejected' ? '#ff4d4f' : '#00b14f' } },
        onOk: performUpdate
      });
    } else {
      // Just saving notes or interview time, no confirmation needed
      await performUpdate();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'Đã nộp':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-850">Đã nộp</span>;
      case 'reviewing':
      case 'Đang xem xét':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-850">Đang duyệt</span>;
      case 'shortlisted':
      case 'Phỏng vấn':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-850">Phỏng vấn</span>;
      case 'approved':
      case 'Đã tuyển':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-850">Được nhận</span>;
      case 'rejected':
      case 'Bị từ chối':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-850">Không đạt</span>;
      default:
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (!user || user.role !== 'Nhà tuyển dụng') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm">Vui lòng đăng nhập bằng tài khoản Nhà tuyển dụng để truy cập trang này.</p>
        <Link to="/" className="btn-primary mt-6">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-emerald-700 w-8 h-8" />
            Danh Sách Ứng Viên
          </h1>
          <p className="text-gray-500 text-sm font-medium">Theo dõi và đánh giá hồ sơ ứng tuyển của các ứng viên vào công ty</p>
        </div>
        <Link to="/employer/jobs" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm">
          &larr; Quay lại quản lý tin đăng
        </Link>
      </div>

      {jobIdFilter && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-sm flex justify-between items-center">
          <span>🎯 Đang xem ứng viên của tin đăng: <strong>{filterJobTitle || `ID: ${jobIdFilter}`}</strong></span>
          <Link to="/employer/applicants" className="underline font-bold text-xs text-emerald-900">Xóa bộ lọc tin đăng</Link>
        </div>
      )}

      {/* Query panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-gray-500 text-sm font-bold shrink-0">Lọc trạng thái:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input-field py-2 text-sm max-w-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <option value="">Tất cả</option>
            <option value="submitted">Đã nộp (Submitted)</option>
            <option value="reviewing">Đang duyệt (Reviewing)</option>
            <option value="approved">Được nhận (Approved)</option>
            <option value="rejected">Không đạt (Rejected)</option>
          </select>
        </div>
        <span className="text-gray-500 text-sm font-bold">Trang {currentPage} / {totalPages}</span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-2.5" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Đang tải danh sách hồ sơ...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">Chưa có ứng viên nào nộp hồ sơ phù hợp.</p>
          </div>
        ) : (
          <>
            {/* Table layout for PC screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <caption className="sr-only">Danh sách hồ sơ ứng tuyển của ứng viên</caption>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th scope="col" className="px-6 py-4">Ứng Viên</th>
                    <th scope="col" className="px-6 py-4">Vị Trí Ứng Tuyển</th>
                    <th scope="col" className="px-6 py-4">Lương Mong Muốn</th>
                    <th scope="col" className="px-6 py-4">Ngày Nộp</th>
                    <th scope="col" className="px-6 py-4">Trạng thái</th>
                    <th scope="col" className="px-6 py-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{app.profile?.user?.fullName}</div>
                        <div className="text-gray-500 text-xs">{app.profile?.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 truncate max-w-xs">{app.job?.title}</div>
                        <div className="text-gray-500 text-xs">{app.profile?.title || 'Chưa cập nhật vị trí'}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {app.profile?.expectedSalaryMin ? `${(app.profile.expectedSalaryMin / 1000000).toFixed(0)}Tr` : 'Từ'} -
                        {app.profile?.expectedSalaryMax ? ` ${(app.profile.expectedSalaryMax / 1000000).toFixed(0)}Tr` : ' Thỏa thuận'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openAppDetails(app)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 mx-auto font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Eye className="w-4 h-4" /> Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list layout for mobile screens */}
            <div className="block md:hidden divide-y divide-gray-100">
              {applications.map((app) => (
                <div 
                  key={app.id} 
                  className="p-5 space-y-4 hover:bg-gray-50/30 transition-colors text-left"
                >
                  {/* Header: Candidate Name and status badge */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-gray-900 text-base leading-snug truncate">
                        {app.profile?.user?.fullName}
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5 truncate font-medium">
                        {app.profile?.user?.email}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Details list */}
                  <div className="space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Vị trí:</span>
                      <span className="text-gray-800 font-bold truncate max-w-xs">{app.job?.title}</span>
                    </div>
                    {app.profile?.title && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Chuyên môn:</span>
                        <span className="text-gray-700 truncate max-w-xs">{app.profile.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Lương:</span>
                      <span className="text-emerald-700 font-extrabold">
                        {app.profile?.expectedSalaryMin ? `${(app.profile.expectedSalaryMin / 1000000).toFixed(0)}Tr` : 'Từ'} -
                        {app.profile?.expectedSalaryMax ? ` ${(app.profile.expectedSalaryMax / 1000000).toFixed(0)}Tr` : ' Thỏa thuận'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Ngày nộp:</span>
                      <span className="text-gray-500">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2 border-t border-gray-50 flex justify-end">
                    <button
                      onClick={() => openAppDetails(app)}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-gray-200 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Xem hồ sơ &amp; Đánh giá</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm text-gray-500 font-bold">Trang {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Profile and Evaluation Details Modal Dialog */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="eval-modal-title"
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden relative animate-slide-up max-h-[80vh] flex flex-col text-left my-8 sm:my-0"
          >
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h3 id="eval-modal-title" className="font-extrabold text-gray-900 text-base">Đánh Giá Hồ Sơ Ứng Viên</h3>
                <p className="text-gray-500 text-xs mt-0.5">Nộp vào: {selectedApp.job?.title}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              {/* User Bio grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div>
                  <span className="text-gray-400 text-xs font-bold block uppercase tracking-wide">Họ và Tên</span>
                  <span className="font-extrabold text-gray-900 text-sm">{selectedApp.profile?.user?.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold block uppercase tracking-wide">Email</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedApp.profile?.user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold block uppercase tracking-wide">Số điện thoại</span>
                  <span className="font-semibold text-gray-850 text-sm">{selectedApp.profile?.user?.phone || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold block uppercase tracking-wide">Kinh nghiệm</span>
                  <span className="font-semibold text-gray-850 text-sm">{selectedApp.profile?.experienceLevel || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {/* Summary */}
              {selectedApp.profile?.summary && (
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">Tóm tắt giới thiệu</h4>
                  <p className="text-gray-600 text-sm leading-relaxed p-3 bg-gray-50 rounded-xl border border-gray-150/50">{selectedApp.profile.summary}</p>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">Thư giới thiệu ứng tuyển</h4>
                  <p className="text-gray-600 text-sm leading-relaxed p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/50 whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                </div>
              )}

              {/* Interview schedule notification if already scheduled */}
              {selectedApp.interviewTime && (
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-950 font-bold flex items-center gap-3 animate-fade-in shadow-inner">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-purple-600 animate-ping"></span>
                  <span>
                    Lịch phỏng vấn đã hẹn: <strong className="text-purple-900">{new Date(selectedApp.interviewTime).toLocaleString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</strong>
                  </span>
                </div>
              )}

              {/* CV File Attachment */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-sm">Hồ sơ đính kèm (CV)</h4>
                <div className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="font-bold block">{selectedApp.candidateCv?.description || 'Bản CV nộp tuyển'}</span>
                      <span className="text-gray-500 text-xs shrink-0 font-medium">Bản chính thức đính kèm</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCvUrl(selectedApp.candidateCv?.cvUrl || '');
                      setPreviewCvTitle(selectedApp.candidateCv?.description || 'Bản CV nộp tuyển');
                    }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors shrink-0 shadow-sm"
                  >
                    Xem CV <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recruiter Evaluation Panel */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-950 text-base">Ghi chú & Đánh giá nội bộ</h4>

                <div>
                  <label htmlFor="recruiter-notes" className="label-text">Ghi chú tuyển dụng (Chỉ doanh nghiệp xem)</label>
                  <textarea
                    id="recruiter-notes"
                    rows={3}
                    value={recruiterNote}
                    onChange={(e) => setRecruiterNote(e.target.value)}
                    placeholder="Ghi chú về buổi phỏng vấn, trình độ hoặc đánh giá ban đầu về ứng viên..."
                    className="input-field text-sm"
                    disabled={updatingStatus}
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="interview-time" className="label-text block font-bold text-gray-800 text-xs mb-1">
                    Chọn thời gian phỏng vấn (Bắt buộc để gửi email mời phỏng vấn)
                  </label>
                  <input
                    id="interview-time"
                    type="datetime-local"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="input-field text-sm py-2 px-3 bg-white"
                    disabled={updatingStatus}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateApplication(selectedApp.status, recruiterNote, interviewTime)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg text-xs"
                    disabled={updatingStatus}
                  >
                    Lưu ghi chú & thời gian
                  </button>
                </div>
              </div>
            </div>

            {/* Actions for Status updates */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-wrap gap-2 justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trạng thái:</span>
                {getStatusBadge(selectedApp.status)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateApplication('reviewing')}
                  disabled={updatingStatus}
                  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold text-xs py-2 px-4 rounded-lg border border-yellow-200 flex items-center gap-1 transition-colors"
                >
                  <Clock className="w-4 h-4" /> Đang duyệt
                </button>
                <button
                  onClick={() => handleUpdateApplication('rejected')}
                  disabled={updatingStatus}
                  className="bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs py-2 px-4 rounded-lg border border-red-200 flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
                <button
                  onClick={() => handleUpdateApplication('approved')}
                  disabled={updatingStatus}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Gửi lời mời phỏng vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {previewCvUrl && (
        <AccessibleModal
          isOpen={!!previewCvUrl}
          onClose={() => setPreviewCvUrl(null)}
          title={previewCvTitle || 'Xem CV'}
          maxWidth="max-w-5xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <span className="text-sm text-gray-500 font-medium">Bản xem trước trực tiếp trên hệ thống</span>
              <a
                href={previewCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 hover:shadow-md transition-all shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trong tab mới</span>
              </a>
            </div>
            
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[60vh] max-h-[75vh]">
              {previewCvUrl.split('?')[0].toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/) ? (
                <img
                  src={previewCvUrl}
                  alt={previewCvTitle || 'CV Preview'}
                  className="max-w-full max-h-[70vh] object-contain p-2"
                />
              ) : (
                <iframe
                  src={`${previewCvUrl}#toolbar=0`}
                  title="CV Preview"
                  className="w-full h-[70vh] border-0"
                />
              )}
            </div>
          </div>
        </AccessibleModal>
      )}
    </div>
  );
}
