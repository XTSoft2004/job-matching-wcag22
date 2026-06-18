import { useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, PlusCircle, Search } from 'lucide-react';
import logoUrl from '../public/logo.jpg';

export default function MainLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl z-[100] shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Chuyển nhanh đến nội dung chính
      </a>
      {/* Top green announcement banner */}
      <div className="bg-primary-950 text-primary-100 py-2 px-4 text-center text-xs font-semibold tracking-wide sm:text-sm border-b border-primary-900 shadow-sm relative z-50">
        ✨ Hệ thống tìm kiếm việc làm thông minh AI & Giọng nói hỗ trợ người khiếm thị / khuyết tật đạt tiêu chuẩn WCAG 2.2
      </div>

      {/* Accessible Navigation Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-2xl font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 rounded-md px-2 py-1"
                aria-label="JobAccess Home"
              >
                <img src={logoUrl} alt="Logo JobAccess" className="h-9 w-auto rounded-lg" />
                <span className="bg-gradient-to-r from-primary-700 to-emerald-500 bg-clip-text text-transparent">JobAccess</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-4 items-center" aria-label="Main Navigation">
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Search className="w-4 h-4" />
                Tìm việc làm
              </Link>
              
              {user?.role === 'Nhà tuyển dụng' && (
                <>
                  <Link 
                    to="/employer/jobs" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Tin đã đăng
                  </Link>
                  <Link 
                    to="/employer/applicants" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Quản lý ứng viên
                  </Link>
                  <Link 
                    to="/dang-tin" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Đăng tin
                  </Link>
                </>
              )}

              {user?.role === 'Ứng viên' && (
                <Link 
                  to="/candidate/applied" 
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Việc làm đã nộp
                </Link>
              )}

              {user?.role === 'Quản trị viên' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Thống kê
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Quản lý User
                  </Link>
                  <Link 
                    to="/admin/jobs" 
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Quản lý Job
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Link */}
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 shrink-0"
                    aria-label={user.role === 'Nhà tuyển dụng' ? 'Xem trang hồ sơ doanh nghiệp' : 'Xem trang hồ sơ cá nhân'}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {user.avatarUrl || user.avatar ? (
                        <img src={user.avatarUrl || user.avatar} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : user.fullName ? (
                        <span className="text-primary-700 font-bold text-sm">{user.fullName.charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-4 h-4 text-primary-700" />
                      )}
                    </div>
                    <span className="hidden sm:inline font-semibold text-sm max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                  </Link>
                  
                  {/* Log Out Button */}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 font-medium text-sm py-2 px-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Đăng xuất khỏi hệ thống"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800 font-sans" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
            {/* Column 1: Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="" className="h-8 w-auto rounded-md" aria-hidden="true" />
                <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                  JobAccess
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng tìm kiếm việc làm bằng giọng nói thông minh hỗ trợ người khuyết tật đầu tiên tại Việt Nam. Đáp ứng tiêu chuẩn tiếp cận WCAG 2.2.
              </p>
              <div className="text-sm space-y-2 text-gray-400">
                <p>📍 Địa chỉ: Cầu Giấy, Hà Nội</p>
                <p>📞 Hotline: 1900 068 889 (Nhánh 2)</p>
                <p>✉️ Email: hotro@jobmatch.vn</p>
              </div>
            </div>

            {/* Column 2: Job Seekers */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Dành Cho Ứng Viên</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Tìm kiếm việc làm</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Viết CV chuyên nghiệp</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Tính lương Gross to Net</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Cẩm nang nghề nghiệp</Link></li>
              </ul>
            </div>

            {/* Column 3: Employers */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Dành Cho Nhà Tuyển Dụng</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dang-tin" className="hover:text-primary-400 transition-colors">Đăng tin tuyển dụng</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Tìm kiếm hồ sơ ứng viên</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Giải pháp nhân sự AI</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Huy hiệu nhà tuyển dụng uy tín</Link></li>
              </ul>
            </div>

            {/* Column 4: Policy & Ecosystem */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Điều Khoản & Chính Sách</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Quy chế hoạt động</Link></li>
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Báo cáo WCAG 2.2 AA</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} JobAccess. Tất cả các quyền được bảo lưu.</p>
            <p className="flex items-center gap-2">
              <span>Thiết kế theo tiêu chuẩn tiếp cận</span>
              <span className="px-2 py-0.5 bg-primary-950 text-primary-400 border border-primary-800 rounded text-xs font-semibold">WCAG 2.2 AA</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
