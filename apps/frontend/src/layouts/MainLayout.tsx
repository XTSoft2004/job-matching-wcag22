import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Briefcase, PlusCircle, Search } from 'lucide-react';

export default function MainLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Accessible Navigation Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-black bg-gradient-to-r from-primary-700 to-blue-600 bg-clip-text text-transparent transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 rounded-md px-2 py-1"
                aria-label="JobMatch Home"
              >
                JobMatch
              </Link>
            </div>

            <nav className="hidden md:flex space-x-6" aria-label="Main Navigation">
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Search className="w-4 h-4" />
                Tìm việc làm
              </Link>
              <Link 
                to="/create-job" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng tin tuyển dụng
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Summary */}
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="hidden sm:inline font-semibold text-gray-700 text-sm max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                  </div>
                  
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
      <main id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center mt-auto border-t border-gray-800">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} JobMatch. All rights reserved. Designed with WCAG 2.2 accessibility in mind.
        </p>
      </footer>
    </div>
  );
}
