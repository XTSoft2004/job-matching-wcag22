import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  Globe, 
  Users, 
  FileText,
  ChevronRight
} from 'lucide-react';

interface CandidateProfileData {
  id: number;
  userId: number;
  title: string;
  summary: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  province: string | null;
  experienceLevel: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  isOpenToWork: boolean;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  
  // Base User State (Name & Phone)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Candidate Profile State
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileData | null>(null);
  const [candTitle, setCandTitle] = useState('');
  const [candSummary, setCandSummary] = useState('');
  const [candDob, setCandDob] = useState('');
  const [candGender, setCandGender] = useState('');
  const [candAddress, setCandAddress] = useState('');
  const [candProvince, setCandProvince] = useState('');
  const [candExpLevel, setCandExpLevel] = useState('');
  const [candSalMin, setCandSalMin] = useState('');
  const [candSalMax, setCandSalMax] = useState('');
  const [candOpenToWork, setCandOpenToWork] = useState(true);

  // Company Profile State
  const [compName, setCompName] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compSize, setCompSize] = useState('');
  const [compDescription, setCompDescription] = useState('');

  // Page States
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load profile data based on User Role
  useEffect(() => {
    if (!user) return;

    // Load base user info
    setFullName(user.fullName || '');
    setPhone(user.phone || '');

    const loadData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        if (user.role === 'Ứng viên') {
          // Fetch candidate profile (lazy initialized by backend)
          const res: any = await api.get(`/candidate-profiles/user/${user.id}`);
          const data = res.data;
          setCandidateProfile(data);
          
          setCandTitle(data.title || '');
          setCandSummary(data.summary || '');
          setCandDob(data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '');
          setCandGender(data.gender || '');
          setCandAddress(data.address || '');
          setCandProvince(data.province || '');
          setCandExpLevel(data.experienceLevel || '');
          setCandSalMin(data.expectedSalaryMin ? String(Math.floor(data.expectedSalaryMin)) : '');
          setCandSalMax(data.expectedSalaryMax ? String(Math.floor(data.expectedSalaryMax)) : '');
          setCandOpenToWork(data.isOpenToWork !== false);
        } else if (user.role === 'Nhà tuyển dụng') {
          // If linked company exists
          if (user.companyId) {
            const res: any = await api.get(`/companies/${user.companyId}`);
            const data = res.data;
            
            setCompName(data.name || '');
            setCompLogo(data.logo || '');
            setCompWebsite(data.website || '');
            setCompAddress(data.address || '');
            setCompSize(data.companySize || '');
            setCompDescription(data.description || '');
          }
        }
      } catch (err: any) {
        console.error('Failed to load profile details:', err);
        setErrorMsg('Không thể tải thông tin hồ sơ của bạn. Vui lòng tải lại trang.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle Account Update (Base User)
  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // Update User Base Details
      await api.patch(`/users/${user.id}`, {
        fullName,
        phone: phone || null,
      });

      await refreshUser();
      setSuccessMsg('Cập nhật thông tin tài khoản thành công!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Candidate Profile Update
  const handleCandidateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !candidateProfile) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Update Base User Info
      await api.patch(`/users/${user.id}`, {
        fullName,
        phone: phone || null,
      });

      // 2. Update Candidate Profile Details
      await api.patch(`/candidate-profiles/${candidateProfile.id}`, {
        title: candTitle || null,
        summary: candSummary || null,
        dateOfBirth: candDob || null,
        gender: candGender || null,
        address: candAddress || null,
        province: candProvince || null,
        experienceLevel: candExpLevel || null,
        expectedSalaryMin: candSalMin ? Number(candSalMin) : null,
        expectedSalaryMax: candSalMax ? Number(candSalMax) : null,
        isOpenToWork: candOpenToWork,
      });

      await refreshUser();
      setSuccessMsg('Hồ sơ cá nhân của bạn đã được cập nhật thành công!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Company Profile (Create or Update)
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!compName) {
      setErrorMsg('Tên doanh nghiệp không được để trống.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Update Base User Info
      await api.patch(`/users/${user.id}`, {
        fullName,
        phone: phone || null,
      });

      if (user.companyId) {
        // 2. Update existing Company Profile
        await api.patch(`/companies/${user.companyId}`, {
          name: compName,
          logo: compLogo || null,
          website: compWebsite || null,
          address: compAddress || null,
          companySize: compSize || null,
          description: compDescription || null,
        });
        setSuccessMsg('Hồ sơ doanh nghiệp đã được cập nhật thành công!');
      } else {
        // 2. Create new Company Profile (will auto link in backend)
        await api.post('/companies', {
          name: compName,
          logo: compLogo || null,
          website: compWebsite || null,
          address: compAddress || null,
          companySize: compSize || null,
          description: compDescription || null,
        });
        setSuccessMsg('Khởi tạo hồ sơ doanh nghiệp thành công!');
      }

      await refreshUser();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thông tin công ty.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Vui lòng đăng nhập</h1>
        <p className="text-gray-600 mt-2">Bạn cần đăng nhập để xem thông tin trang cá nhân.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header glassmorphic card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-800 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
            <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-extrabold text-white shadow-inner">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.fullName}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {user.role}
                </span>
              </div>
              <p className="text-blue-100 mt-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
              activeTab === 'profile' 
                ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
          >
            <span className="flex items-center gap-2.5">
              {user.role === 'Nhà tuyển dụng' ? <Building2 className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              <span>{user.role === 'Nhà tuyển dụng' ? 'Hồ sơ doanh nghiệp' : 'Hồ sơ cá nhân'}</span>
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'profile' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
              activeTab === 'account' 
                ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            aria-current={activeTab === 'account' ? 'page' : undefined}
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Tài khoản & bảo mật</span>
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'account' ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Form area */}
        <div className="md:col-span-3 space-y-6">
          {/* Status alerts */}
          <div aria-live="polite" className="space-y-4">
            {successMsg && (
              <div className="flex items-start gap-2.5 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm shadow-sm animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Thành công:</span>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}
            
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm shadow-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Lỗi xảy ra:</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải thông tin hồ sơ của bạn...</p>
            </div>
          ) : activeTab === 'account' ? (
            /* Account details form */
            <form onSubmit={handleAccountUpdate} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-primary-700" />
                Thông tin tài khoản đăng nhập
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="label-text">Họ và Tên</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Nguyễn Văn A"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="label-text">Số điện thoại liên hệ</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="0912345678"
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="label-text">Địa chỉ Email (Không thể thay đổi)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      readOnly
                      value={user.email}
                      className="input-field pl-10 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật tài khoản'}
                </button>
              </div>
            </form>
          ) : user.role === 'Ứng viên' ? (
            /* Candidate Profile Form */
            <form onSubmit={handleCandidateUpdate} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="text-primary-700" />
                Thông tin hồ sơ ứng viên cá nhân
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="candTitle" className="label-text">Vị trí mong muốn ứng tuyển</label>
                  <input
                    id="candTitle"
                    type="text"
                    value={candTitle}
                    onChange={(e) => setCandTitle(e.target.value)}
                    className="input-field"
                    placeholder="Ví dụ: Senior Frontend Developer, Nhân viên Hành chính..."
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="fullNameCand" className="label-text">Họ và Tên</label>
                  <input
                    id="fullNameCand"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="phoneCand" className="label-text">Số điện thoại</label>
                  <input
                    id="phoneCand"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="candDob" className="label-text">Ngày sinh</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="candDob"
                      type="date"
                      value={candDob}
                      onChange={(e) => setCandDob(e.target.value)}
                      className="input-field pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="candGender" className="label-text">Giới tính</label>
                  <select
                    id="candGender"
                    value={candGender}
                    onChange={(e) => setCandGender(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="candExpLevel" className="label-text">Cấp bậc kinh nghiệm hiện tại</label>
                  <select
                    id="candExpLevel"
                    value={candExpLevel}
                    onChange={(e) => setCandExpLevel(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  >
                    <option value="">Chọn cấp bậc</option>
                    <option value="Intern">Intern / Thực tập sinh</option>
                    <option value="Fresher">Fresher / Mới ra trường</option>
                    <option value="Junior">Junior / Nhân viên ít kinh nghiệm</option>
                    <option value="Mid">Mid / Nhân viên có kinh nghiệm</option>
                    <option value="Senior">Senior / Chuyên viên cao cấp</option>
                    <option value="Manager">Manager / Quản lý</option>
                    <option value="Director">Director / Giám đốc</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="candProvince" className="label-text">Tỉnh/Thành phố làm việc</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="candProvince"
                      type="text"
                      value={candProvince}
                      onChange={(e) => setCandProvince(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ví dụ: Hồ Chí Minh, Hà Nội"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="candAddress" className="label-text">Địa chỉ chi tiết</label>
                  <input
                    id="candAddress"
                    type="text"
                    value={candAddress}
                    onChange={(e) => setCandAddress(e.target.value)}
                    className="input-field"
                    placeholder="Nhập địa chỉ nhà, số đường, quận huyện..."
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="candSalMin" className="label-text">Lương mong muốn tối thiểu (VND)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      id="candSalMin"
                      type="number"
                      value={candSalMin}
                      onChange={(e) => setCandSalMin(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ví dụ: 10000000"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="candSalMax" className="label-text">Lương mong muốn tối đa (VND)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      id="candSalMax"
                      type="number"
                      value={candSalMax}
                      onChange={(e) => setCandSalMax(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ví dụ: 25000000"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="candSummary" className="label-text">Giới thiệu bản thân / Tóm tắt nghề nghiệp</label>
                  <textarea
                    id="candSummary"
                    rows={4}
                    value={candSummary}
                    onChange={(e) => setCandSummary(e.target.value)}
                    className="input-field resize-y min-h-[100px]"
                    placeholder="Mô tả kỹ năng nổi bật, định hướng công việc và thành tựu cá nhân của bạn..."
                    disabled={submitting}
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <input
                      id="candOpenToWork"
                      type="checkbox"
                      checked={candOpenToWork}
                      onChange={(e) => setCandOpenToWork(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      disabled={submitting}
                    />
                    <label htmlFor="candOpenToWork" className="font-semibold text-gray-800 cursor-pointer text-sm">
                      Sẵn sàng tìm kiếm công việc mới (Mở trạng thái Open to Work)
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu hồ sơ cá nhân'}
                </button>
              </div>
            </form>
          ) : (
            /* Employer (Company) Profile Form */
            <form onSubmit={handleCompanySubmit} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="text-primary-700" />
                  {user.companyId ? 'Thông tin hồ sơ doanh nghiệp' : 'Thiết lập hồ sơ doanh nghiệp mới'}
                </h2>
                {!user.companyId && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Chưa tạo hồ sơ công ty
                  </span>
                )}
              </div>

              {!user.companyId && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-amber-900 text-sm flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Lưu ý:</strong> Tài khoản nhà tuyển dụng cần liên kết với một hồ sơ công ty trước khi đăng tin tuyển dụng lên hệ thống. Hãy điền thông tin bên dưới để bắt đầu.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="compName" className="label-text">Tên công ty/Doanh nghiệp <span className="text-red-500">*</span></label>
                  <input
                    id="compName"
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="input-field"
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="compSize" className="label-text">Quy mô doanh nghiệp (Số lượng nhân sự)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <select
                      id="compSize"
                      value={compSize}
                      onChange={(e) => setCompSize(e.target.value)}
                      className="input-field pl-10"
                      disabled={submitting}
                    >
                      <option value="">Chọn quy mô nhân sự</option>
                      <option value="Dưới 10 nhân viên">Dưới 10 nhân viên</option>
                      <option value="10-49 nhân viên">10-49 nhân viên</option>
                      <option value="50-99 nhân viên">50-99 nhân viên</option>
                      <option value="100-499 nhân viên">100-499 nhân viên</option>
                      <option value="500-999 nhân viên">500-999 nhân viên</option>
                      <option value="Trên 1000 nhân viên">Trên 1000 nhân viên</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="fullNameEmp" className="label-text">Họ tên người đại diện tuyển dụng</label>
                  <input
                    id="fullNameEmp"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="phoneEmp" className="label-text">Số điện thoại liên hệ doanh nghiệp</label>
                  <input
                    id="phoneEmp"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="compWebsite" className="label-text">Website công ty</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      id="compWebsite"
                      type="url"
                      value={compWebsite}
                      onChange={(e) => setCompWebsite(e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://example.com"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="compLogo" className="label-text">URL ảnh Logo công ty</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      id="compLogo"
                      type="url"
                      value={compLogo}
                      onChange={(e) => setCompLogo(e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://example.com/logo.png"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="compAddress" className="label-text">Địa chỉ trụ sở chính</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="compAddress"
                      type="text"
                      value={compAddress}
                      onChange={(e) => setCompAddress(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Nhập đầy đủ số nhà, tên đường, phường, quận, tỉnh thành..."
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="compDescription" className="label-text">Giới thiệu ngắn gọn về công ty</label>
                  <textarea
                    id="compDescription"
                    rows={4}
                    value={compDescription}
                    onChange={(e) => setCompDescription(e.target.value)}
                    className="input-field resize-y min-h-[100px]"
                    placeholder="Mô tả ngành nghề kinh doanh, văn hóa doanh nghiệp và sứ mệnh của công ty..."
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Đang lưu...' : user.companyId ? 'Lưu hồ sơ doanh nghiệp' : 'Tạo hồ sơ doanh nghiệp'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
