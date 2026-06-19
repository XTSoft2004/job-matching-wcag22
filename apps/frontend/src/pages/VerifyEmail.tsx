import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, Key, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Kích hoạt tài khoản | JobAccess";
    
    // Auto fill email from router state if available
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    if (!code) {
      setError('Vui lòng nhập mã OTP xác minh.');
      return;
    }
    if (code.length < 6) {
      setError('Mã OTP xác minh phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email.trim(), code.trim());
      // Successful verification
      navigate('/login', {
        state: {
          message: 'Tài khoản của bạn đã được kích hoạt thành công! Hãy đăng nhập để bắt đầu sử dụng.'
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Kích hoạt thất bại. Vui lòng kiểm tra lại địa chỉ email hoặc mã OTP.'
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

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-md p-5 sm:p-8 rounded-3xl border border-white/80 shadow-xl relative z-10 animate-slide-up text-left">
        <div>
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kích hoạt tài khoản
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vui lòng nhập mã OTP 6 chữ số được gửi tới hộp thư của bạn
          </p>
        </div>

        {/* Dynamic accessibility alert */}
        <div aria-live="polite" className="space-y-3">
          {success && !error && (
            <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-green-800 text-sm flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold block">Thông báo gửi mã:</span>
                <span>{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div 
              role="alert" 
              className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold block">Lỗi xác thực:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-verify" className="label-text">
                Địa chỉ Email đã đăng ký
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-verify"
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
              <label htmlFor="otp-code" className="label-text">
                Mã xác thực OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="otp-code"
                  name="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field pl-10 tracking-widest text-center text-lg font-bold"
                  placeholder="------"
                  aria-required="true"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xác minh...</span>
                </>
              ) : (
                <span>Xác thực & Kích hoạt</span>
              )}
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center pt-4 border-t border-gray-150">
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors focus-visible:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Đăng nhập</span>
          </Link>
          <p className="text-xs text-gray-400">JobAccess</p>
        </div>
      </div>
    </div>
  );
}
