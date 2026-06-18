import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Đăng nhập | JobAccess";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Đăng nhập hệ thống JobAccess để ứng tuyển các việc làm chất lượng cao hoặc tìm kiếm nhân sự tiềm năng.");
    }
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if redirected from register
  const successMsg = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple client-side validation
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glassmorphic shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-200/40 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-xl relative z-10 animate-slide-up">
        <div>
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <LogIn className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Chào mừng trở lại!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hãy đăng nhập để tiếp tục ứng tuyển và tìm kiếm việc làm
          </p>
        </div>

        {/* Dynamic accessibility alert for success or error */}
        <div aria-live="polite" className="space-y-3">
          {successMsg && !error && (
            <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-green-800 text-sm flex items-center gap-2">
              <span className="font-semibold">Đăng ký thành công!</span> {successMsg}
            </div>
          )}
          
          {error && (
            <div 
              role="alert" 
              className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <span className="font-semibold block">Lỗi đăng nhập:</span>
                <span>{error}</span>
                {error.includes('tạm khóa') && (
                  <p className="mt-2 text-xs font-bold">
                    Tài khoản chưa kích hoạt?{' '}
                    <Link to="/verify-email" state={{ email }} className="text-primary-700 hover:underline">
                      Kích hoạt tài khoản bằng mã OTP ngay
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="label-text">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@example.com"
                  aria-required="true"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  aria-required="true"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg relative flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-primary-700 hover:text-primary-800 transition-colors focus-visible:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
