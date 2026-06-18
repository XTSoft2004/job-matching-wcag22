import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Briefcase, FileText, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Quản trị viên') return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, jobsRes, appsRes] = await Promise.all([
          api.get('/users?limit=1'),
          api.get('/jobs?limit=1'),
          api.get('/applications?limit=1')
        ]);
        setStats({
          users: usersRes.data?.meta?.totalItems || 0,
          jobs: jobsRes.data?.meta?.totalItems || 0,
          applications: appsRes.data?.meta?.totalItems || 0
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Auth Guard Layout
  if (!user || user.role !== 'Quản trị viên') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" aria-hidden="true" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
          Bạn không có quyền quản trị để truy cập trang này. Vui lòng đăng nhập bằng tài khoản quản trị viên.
        </p>
        <Link to="/" className="btn-primary mt-6">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in font-sans text-gray-800 text-left">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-primary-850 via-emerald-800 to-green-800 text-white rounded-3xl p-8 shadow-md relative overflow-hidden border border-emerald-900/10">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Hệ Thống Quản Trị JobMatch</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Tổng quan số liệu thống kê thời gian thực và quản lý tài nguyên, tin tuyển dụng, và hồ sơ ứng tuyển của người dùng.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Grid Stats Cards */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-36 animate-pulse space-y-4">
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Card 1: Users */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">TÀI KHOẢN ĐĂNG KÝ</p>
              <h2 className="text-4xl font-black text-gray-900">{stats.users}</h2>
              <p className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Hoạt động ổn định
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Users className="w-7 h-7" />
            </div>
          </div>

          {/* Card 2: Jobs */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">TIN TUYỂN DỤNG</p>
              <h2 className="text-4xl font-black text-gray-900">{stats.jobs}</h2>
              <p className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Nguồn việc dồi dào
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <Briefcase className="w-7 h-7" />
            </div>
          </div>

          {/* Card 3: Applications */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">HỒ SƠ ĐÃ NỘP</p>
              <h2 className="text-4xl font-black text-gray-900">{stats.applications}</h2>
              <p className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Kết nối liên tục
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
              <FileText className="w-7 h-7" />
            </div>
          </div>
        </div>
      )}

      {/* Action links */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Link users */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all">
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-900 text-lg">Quản Lý Tài Khoản Người Dùng</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Xem danh sách ứng viên, nhà tuyển dụng và admin. Khóa tài khoản tạm thời, thay đổi quyền hạn hoặc xóa thông tin tài khoản.
            </p>
          </div>
          <Link to="/admin/users" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm flex items-center gap-1">
            Đi đến quản lý User <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Link jobs */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all">
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-900 text-lg">Quản Lý Tin Đăng Tuyển Dụng</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Duyệt tin tuyển dụng của các doanh nghiệp đăng tải. Đóng tin hết hạn hoặc tin vi phạm nội quy đăng tuyển của hệ thống.
            </p>
          </div>
          <Link to="/admin/jobs" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm flex items-center gap-1">
            Đi đến quản lý Job <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
