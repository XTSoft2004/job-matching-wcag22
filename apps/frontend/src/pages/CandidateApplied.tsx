import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, notification } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  FileText, 
  Briefcase, 
  Trash2, 
  AlertCircle, 
  ShieldAlert
} from 'lucide-react';

interface ApplicationItem {
  id: number;
  jobId: number;
  job: {
    title: string;
    company: {
      name: string;
    };
    province: string;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryNegotiable: boolean;
  };
  status: string;
  employerNote: string | null;
  createdAt: string;
}

export default function CandidateApplied() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch user's own applications
      const res: any = await api.get('/applications?limit=100');
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể tải lịch sử nộp hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Ứng viên') return;
    fetchApplications();
  }, [user]);

  // Withdraw Application (Soft Delete)
  const handleWithdraw = (app: ApplicationItem) => {
    Modal.confirm({
      title: 'Xác nhận rút hồ sơ ứng tuyển',
      content: `Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí "${app.job?.title}" tại công ty "${app.job?.company?.name}"? Thao tác này sẽ hủy bỏ hồ sơ nộp của bạn.`,
      okText: 'Rút hồ sơ',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/applications/${app.id}`);
          setApplications(prev => prev.filter(a => a.id !== app.id));
          notification.success({
            message: 'Rút đơn thành công',
            description: `Đã rút đơn ứng tuyển cho vị trí "${app.job?.title}".`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Rút đơn thất bại',
            description: err.response?.data?.message || 'Có lỗi xảy ra khi rút đơn ứng tuyển.'
          });
        }
      }
    });
  };

  const formatSalary = (job: any) => {
    if (job.isSalaryNegotiable) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(0)}Tr - ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    }
    if (job.salaryMin) return `Từ ${(job.salaryMin / 1000000).toFixed(0)}Tr`;
    if (job.salaryMax) return `Đến ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    return 'Lương cạnh tranh';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">Đã nộp hồ sơ</span>;
      case 'reviewing':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-100">Nhà tuyển dụng đang duyệt</span>;
      case 'approved':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-800 border border-green-100">Được chấp nhận tuyển</span>;
      case 'rejected':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-100">Hồ sơ chưa phù hợp</span>;
      default:
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-800 border border-gray-100">{status}</span>;
    }
  };

  if (!user || user.role !== 'Ứng viên') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm">Vui lòng đăng nhập bằng tài khoản Ứng viên để xem danh sách việc làm đã nộp.</p>
        <Link to="/" className="btn-primary mt-6">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800 text-left">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-emerald-700 w-8 h-8" />
            Việc Làm Đã Ứng Tuyển
          </h1>
          <p className="text-gray-500 text-sm font-medium">Theo dõi tình trạng đơn ứng tuyển và kết quả tuyển dụng từ doanh nghiệp</p>
        </div>
        <Link to="/" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm">
          Tìm thêm việc mới &rarr;
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-2.5" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm font-medium">Đang tải lịch sử ứng tuyển...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-gray-800 text-lg">Chưa nộp đơn tuyển dụng</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">Bạn chưa nộp hồ sơ ứng tuyển vào công việc nào. Khám phá hàng ngàn công việc trên JobMatch ngay!</p>
          <Link to="/" className="btn-primary mt-4 py-2 px-4 text-xs font-bold">Tìm việc ngay</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <article 
              key={app.id} 
              className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-left"
            >
              <div className="flex-grow space-y-2.5">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-gray-400 text-xs font-bold">Nộp ngày: {new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                  {getStatusBadge(app.status)}
                </div>

                <h3 className="font-black text-gray-900 text-lg hover:text-emerald-700 transition-colors leading-tight">
                  <Link to={`/jobs/${app.jobId}`}>{app.job?.title}</Link>
                </h3>

                <p className="font-bold text-gray-700 text-sm">{app.job?.company?.name}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                  <span>📍 {app.job?.province || 'Toàn quốc'}</span>
                  <span className="text-emerald-700 font-bold">💰 {formatSalary(app.job)}</span>
                </div>

                {/* Recruiter feedback notes */}
                {app.employerNote && (
                  <div className="mt-4 p-3 bg-emerald-50/20 border border-emerald-100/35 rounded-2xl text-xs text-gray-600">
                    <span className="font-bold text-emerald-800 block mb-0.5">Phản hồi từ Nhà tuyển dụng:</span>
                    <p className="italic leading-relaxed">{app.employerNote}</p>
                  </div>
                )}
              </div>

              {/* Actions panel */}
              <div className="shrink-0 flex items-center w-full md:w-auto md:border-l md:border-gray-100 md:pl-6 justify-end gap-3">
                <button
                  onClick={() => handleWithdraw(app)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors w-full md:w-auto justify-center"
                  title="Rút hồ sơ ứng tuyển"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Rút hồ sơ
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
