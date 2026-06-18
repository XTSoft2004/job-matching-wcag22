import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng ký tài khoản | JobAccess";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Đăng ký tài khoản JobAccess mới cho ứng viên tìm việc làm và nhà tuyển dụng tìm kiếm nhân lực.");
    }
  }, []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Ứng viên');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!fullName) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
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
      await register(fullName, email, password, phone || undefined, role);
      // Redirect to login page with state containing success message
      navigate('/login', { 
        state: { 
          message: 'Tài khoản của bạn đã được đăng ký thành công! Hãy đăng nhập.' 
        } 
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin đăng ký.'
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
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Điền đầy đủ thông tin để kết nối với nhà tuyển dụng hàng đầu
          </p>
        </div>

        {/* Dynamic accessibility alert */}
        <div aria-live="polite">
          {error && (
            <div 
              role="alert" 
              className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold block">Lỗi đăng ký:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="label-text">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Nguyễn Văn A"
                  aria-required="true"
                  disabled={loading}
                />
              </div>
            </div>

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
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Tối thiểu 6 ký tự"
                  aria-required="true"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone-number" className="label-text">
                Số điện thoại (tùy chọn)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0912345678"
                  disabled={loading}
                />
              </div>
            </div>

            <fieldset className="border-0 p-0 m-0">
              <legend className="label-text block mb-2 font-semibold text-gray-700">Vai trò đăng ký</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary-500 ${role === 'Ứng viên' ? 'border-primary-600 bg-primary-50/50 text-primary-900' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Ứng viên"
                    checked={role === 'Ứng viên'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <span className="font-bold">Ứng viên</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Tìm việc làm & cơ hội mới</span>
                </label>
                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary-500 ${role === 'Nhà tuyển dụng' ? 'border-primary-600 bg-primary-50/50 text-primary-900' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Nhà tuyển dụng"
                    checked={role === 'Nhà tuyển dụng'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <span className="font-bold">Nhà tuyển dụng</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Đăng tin tuyển dụng & tìm ứng viên</span>
                </label>
              </div>
            </fieldset>
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
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <span>Đăng ký</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-primary-700 hover:text-primary-800 transition-colors focus-visible:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
