import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Modal, notification } from 'antd';
import { 
  Briefcase, 
  PlusCircle, 
  Trash2, 
  Power, 
  Users, 
  ChevronRight, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface JobItem {
  id: number;
  title: string;
  province: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable: boolean;
  status: string;
  createdAt: string;
  applicationCount: number;
}

export default function EmployerJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployerJobs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch jobs where employerId equals current user id
      const res: any = await api.get(`/jobs?employerId=${user.id}&limit=100`);
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách bài tuyển dụng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Nhà tuyển dụng') return;
    fetchEmployerJobs();
  }, [user]);

  // Toggle active/closed status using Antd Confirm
  const handleToggleStatus = (job: JobItem) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    const actionName = nextStatus === 'active' ? 'mở nhận hồ sơ' : 'đóng nhận hồ sơ';
    
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${actionName} bài tuyển dụng "${job.title}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { style: { backgroundColor: '#00b14f', borderColor: '#00b14f' } },
      onOk: async () => {
        try {
          await api.patch(`/jobs/${job.id}`, { status: nextStatus });
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: nextStatus } : j));
          notification.success({
            message: 'Cập nhật thành công',
            description: `Đã ${actionName} bài đăng "${job.title}".`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Cập nhật thất bại',
            description: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái bài đăng.'
          });
        }
      }
    });
  };

  // Delete Job Posting using Antd Confirm
  const handleDeleteJob = (job: JobItem) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài tuyển dụng',
      content: `Bạn có chắc muốn xóa tin tuyển dụng "${job.title}"? Hành động này sẽ gỡ bỏ tin khỏi hệ thống và không thể phục hồi!`,
      okText: 'Xóa bài đăng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/jobs/${job.id}`);
          setJobs(prev => prev.filter(j => j.id !== job.id));
          notification.success({
            message: 'Xóa bài tuyển dụng thành công',
            description: `Bài đăng "${job.title}" đã được gỡ khỏi hệ thống.`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Lỗi khi xóa bài đăng',
            description: err.response?.data?.message || 'Lỗi khi xóa bài tuyển dụng.'
          });
        }
      }
    });
  };

  const formatSalary = (job: JobItem) => {
    if (job.isSalaryNegotiable) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(0)}Tr - ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    }
    if (job.salaryMin) return `Từ ${(job.salaryMin / 1000000).toFixed(0)}Tr`;
    if (job.salaryMax) return `Đến ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    return 'Lương cạnh tranh';
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
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-emerald-700 w-8 h-8" />
            Tin Tuyển Dụng Đã Đăng
          </h1>
          <p className="text-gray-500 text-sm font-medium">Quản lý và điều chỉnh các cơ hội việc làm của doanh nghiệp bạn</p>
        </div>
        <Link 
          to="/dang-tin" 
          className="btn-primary py-2.5 px-5 text-sm flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Đăng tin mới
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-2.5" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Listings */}
      {loading ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm font-medium">Đang tải danh sách bài đăng...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-gray-800 text-lg">Chưa có bài đăng tuyển dụng</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">Doanh nghiệp của bạn chưa đăng tải cơ hội việc làm nào lên JobMatch.</p>
          <Link to="/dang-tin" className="btn-primary mt-4 py-2 px-4 text-xs font-bold">Đăng tin ngay</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <article 
              key={job.id} 
              className="bg-white border border-gray-250 hover:border-emerald-200 hover:shadow-lg transition-all rounded-3xl p-6 flex flex-col justify-between relative"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status === 'active' ? 'Đang tuyển' : 'Tạm đóng'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        job.status === 'active' 
                          ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' 
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                      title={job.status === 'active' ? 'Tạm đóng bài tuyển dụng' : 'Mở tuyển nhận hồ sơ'}
                      aria-label={job.status === 'active' ? 'Tạm đóng bài tuyển dụng' : 'Mở tuyển nhận hồ sơ'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Xóa bài đăng"
                      aria-label="Xóa bài đăng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-gray-900 text-lg hover:text-emerald-700 transition-colors leading-snug">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                  <span>📍 {job.province || 'Toàn quốc'}</span>
                  <span>💼 {job.jobType}</span>
                  <span className="text-emerald-700 font-bold">💰 {formatSalary(job)}</span>
                </div>
              </div>

              {/* Bottom statistics panel */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <Link 
                  to={`/employer/applicants?jobId=${job.id}`} 
                  className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-700 font-bold"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{job.applicationCount || 0} hồ sơ ứng tuyển</span>
                </Link>
                
                <Link 
                  to={`/employer/applicants?jobId=${job.id}`}
                  className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-0.5"
                >
                  Xem danh sách <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
