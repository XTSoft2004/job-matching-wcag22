import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Modal, notification } from 'antd';
import { 
  Briefcase, 
  Search, 
  ShieldAlert, 
  Trash2, 
  Eye, 
  Power, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface JobItem {
  id: number;
  title: string;
  company: { name: string };
  province: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable: boolean;
  status: string;
  createdAt: string;
}

export default function AdminJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchJobs = async (page: number = currentPage, search: string = searchQuery) => {
    setLoading(true);
    setActionError(null);
    try {
      const url = search 
        ? `/jobs?page=${page}&limit=10&search=${encodeURIComponent(search)}` 
        : `/jobs?page=${page}&limit=10`;
      const res: any = await api.get(url);
      setJobs(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setActionError('Không thể tải danh sách bài tuyển dụng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Quản trị viên') return;
    fetchJobs(currentPage);
  }, [user, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs(1, searchQuery);
  };

  // Toggle active/closed status using Antd Confirm
  const handleToggleStatus = (job: JobItem) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    const actionMsg = nextStatus === 'active' ? 'mở tuyển lại' : 'đóng tuyển';
    
    Modal.confirm({
      title: 'Thay đổi trạng thái tin tuyển dụng',
      content: `Bạn có chắc muốn ${actionMsg} bài tuyển dụng "${job.title}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { style: { backgroundColor: '#00b14f', borderColor: '#00b14f' } },
      onOk: async () => {
        try {
          await api.patch(`/jobs/${job.id}`, { status: nextStatus });
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: nextStatus } : j));
          notification.success({
            message: 'Cập nhật thành công',
            description: `Đã ${actionMsg} bài đăng "${job.title}".`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Cập nhật thất bại',
            description: err.response?.data?.message || 'Không thể cập nhật trạng thái tin đăng.'
          });
        }
      }
    });
  };

  // Delete Job Listing using Antd Confirm
  const handleDeleteJob = (job: JobItem) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài tuyển dụng',
      content: `CẢNH BÁO: Bạn có chắc chắn muốn xóa bài tuyển dụng "${job.title}"? Hành động này sẽ gỡ bỏ tin khỏi hệ thống và không thể phục hồi!`,
      okText: 'Xóa bài đăng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/jobs/${job.id}`);
          setJobs(prev => prev.filter(j => j.id !== job.id));
          notification.success({
            message: 'Xóa bài đăng thành công',
            description: `Bài đăng "${job.title}" đã được gỡ khỏi hệ thống.`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Xóa bài tuyển dụng thất bại',
            description: err.response?.data?.message || 'Lỗi khi xóa bài đăng tuyển dụng.'
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

  if (!user || user.role !== 'Quản trị viên') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm">Vui lòng sử dụng tài khoản Admin để truy cập trang này.</p>
        <Link to="/" className="btn-primary mt-6">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800 text-left">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-emerald-700 w-8 h-8" />
            Quản Lý Tin Tuyển Dụng
          </h1>
          <p className="text-gray-500 text-sm font-medium">Theo dõi và quản trị các tin đăng tuyển dụng của nhà tuyển dụng</p>
        </div>
        <Link to="/admin/dashboard" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm">
          &larr; Quay lại dashboard
        </Link>
      </div>

      {/* Query controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <label htmlFor="search-input" className="sr-only">Tìm kiếm tin tuyển dụng</label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề tin hoặc công ty..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0 py-2.5 px-5 text-sm">Tìm kiếm</button>
        </form>
        <span className="text-gray-500 text-sm font-bold">Trang {currentPage} / {totalPages}</span>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-2.5" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Đang tải danh sách tin đăng...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">Không tìm thấy bài tuyển dụng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <th scope="col" className="px-6 py-4">Tin Tuyển Dụng & Doanh Nghiệp</th>
                  <th scope="col" className="px-6 py-4">Địa điểm</th>
                  <th scope="col" className="px-6 py-4">Mức Lương</th>
                  <th scope="col" className="px-6 py-4">Trạng thái</th>
                  <th scope="col" className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{j.title}</div>
                      <div className="text-gray-500 text-xs">{j.company?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{j.province || 'Toàn quốc'} ({j.jobType})</td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">{formatSalary(j)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        j.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {j.status === 'active' ? 'Đang tuyển' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          to={`/jobs/${j.id}`}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Xem chi tiết tin đăng"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(j)}
                          className={`p-1.5 rounded-lg border ${j.status === 'active' ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'} transition-colors`}
                          title={j.status === 'active' ? 'Đóng tin tuyển dụng' : 'Mở lại tin tuyển dụng'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(j)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 transition-colors"
                          title="Xóa tin đăng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm text-gray-500 font-bold">Trang {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
