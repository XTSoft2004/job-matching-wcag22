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
  ChevronRight,
  Upload,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Eye
} from 'lucide-react';
import AccessibleModal, { ConfirmDialog } from '../components/ui/AccessibleModal';

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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
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
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'cv'>('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // CV Management States
  const [cvList, setCvList] = useState<any[]>([]);
  const [loadingCvs, setLoadingCvs] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvDescription, setCvDescription] = useState('');
  const [editingCvId, setEditingCvId] = useState<number | null>(null);
  const [editingDesc, setEditingDesc] = useState('');

  // CV Preview States
  const [previewCvUrl, setPreviewCvUrl] = useState<string | null>(null);
  const [previewCvTitle, setPreviewCvTitle] = useState<string>('');

  // Confirm Delete CV Dialog - thay thế window.confirm() - WCAG
  const [confirmDeleteCvId, setConfirmDeleteCvId] = useState<number | null>(null);

  const loadCvs = async (profileId: number) => {
    setLoadingCvs(true);
    try {
      const res: any = await api.get(`/candidate-cvs/profile/${profileId}`);
      const data = res.data?.data || res.data || [];
      setCvList(data);
    } catch (err) {
      console.error('Failed to load CVs:', err);
    } finally {
      setLoadingCvs(false);
    }
  };

  // Upload CV
  const handleCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateProfile || !cvFile) {
      setErrorMsg('Vui lòng chọn tệp tin CV cần tải lên.');
      return;
    }

    setUploadingCv(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Upload to Supabase Storage
      const { uploadCvToSupabase } = await import('../services/supabase');
      const publicUrl = await uploadCvToSupabase(cvFile);

      // 2. Create CV in backend database
      await api.post('/candidate-cvs', {
        profileId: candidateProfile.id,
        cvUrl: publicUrl,
        description: cvDescription.trim() || cvFile.name
      });

      setSuccessMsg('Tải lên CV thành công!');
      setCvFile(null);
      setCvDescription('');
      
      const fileInput = document.getElementById('cv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload CV list
      await loadCvs(candidateProfile.id);
    } catch (err: any) {
      console.error('Failed to upload CV:', err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tải lên CV.');
    } finally {
      setUploadingCv(false);
    }
  };

  // Delete CV - thực hiện sau khi confirm
  const handleCvDelete = async (id: number) => {
    setConfirmDeleteCvId(null); // close dialog
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.delete(`/candidate-cvs/${id}`);
      setSuccessMsg('Xóa CV thành công!');
      if (candidateProfile) {
        await loadCvs(candidateProfile.id);
      }
    } catch (err: any) {
      console.error('Failed to delete CV:', err);
      setErrorMsg('Có lỗi xảy ra khi xóa CV.');
    }
  };

  // Update CV Description
  const handleCvUpdateDesc = async (id: number) => {
    if (!editingDesc.trim()) {
      setErrorMsg('Mô tả CV không được để trống.');
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.patch(`/candidate-cvs/${id}`, {
        description: editingDesc.trim()
      });
      setSuccessMsg('Cập nhật mô tả CV thành công!');
      setEditingCvId(null);
      setEditingDesc('');
      if (candidateProfile) {
        await loadCvs(candidateProfile.id);
      }
    } catch (err: any) {
      console.error('Failed to update CV:', err);
      setErrorMsg('Có lỗi xảy ra khi cập nhật CV.');
    }
  };

  // Load profile data based on User Role
  useEffect(() => {
    if (!user) return;

    // Load base user info
    setFullName(user.fullName || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || user.avatar || '');

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

          if (data && data.id) {
            loadCvs(data.id);
          }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Tệp tin ảnh đại diện vượt quá dung lượng tối đa cho phép (15MB).');
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { uploadAvatarToSupabase } = await import('../services/supabase');
      const publicUrl = await uploadAvatarToSupabase(file);
      setAvatarUrl(publicUrl);
      setSuccessMsg('Tải lên ảnh đại diện thành công! Vui lòng nhấn lưu hoặc cập nhật tài khoản để lưu thay đổi.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tải ảnh đại diện lên Supabase.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

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
        avatarUrl: avatarUrl || null,
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
        avatarUrl: avatarUrl || null,
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
        avatarUrl: avatarUrl || null,
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
            <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-inner shrink-0">
              {user.avatarUrl || user.avatar ? (
                <img src={user.avatarUrl || user.avatar} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : user.fullName ? (
                <span className="text-4xl font-extrabold text-white">{user.fullName.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
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
        
        {/* Navigation Sidebar - WCAG tablist pattern */}
        <nav className="md:col-span-1 space-y-2.5" role="tablist" aria-label="Mục hồ sơ" aria-orientation="vertical">
          <button
            role="tab"
            onClick={() => setActiveTab('profile')}
            aria-selected={activeTab === 'profile'}
            aria-controls="tab-panel-profile"
            id="tab-profile"
            className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
              activeTab === 'profile' 
                ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {user.role === 'Nhà tuyển dụng' ? <Building2 className="w-4 h-4" aria-hidden="true" /> : <Briefcase className="w-4 h-4" aria-hidden="true" />}
              <span>{user.role === 'Nhà tuyển dụng' ? 'Hồ sơ doanh nghiệp' : 'Hồ sơ cá nhân'}</span>
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'profile' ? 'rotate-90' : ''}`} aria-hidden="true" />
          </button>

          <button
            role="tab"
            onClick={() => setActiveTab('account')}
            aria-selected={activeTab === 'account'}
            aria-controls="tab-panel-account"
            id="tab-account"
            className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
              activeTab === 'account' 
                ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>Tài khoản &amp; bảo mật</span>
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'account' ? 'rotate-90' : ''}`} aria-hidden="true" />
          </button>

          {user.role === 'Ứng viên' && (
            <button
              role="tab"
              onClick={() => setActiveTab('cv')}
              aria-selected={activeTab === 'cv'}
              aria-controls="tab-panel-cv"
              id="tab-cv"
              className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                activeTab === 'cv' 
                  ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Quản lý CV</span>
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'cv' ? 'rotate-90' : ''}`} aria-hidden="true" />
            </button>
          )}
        </nav>

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
          ) : activeTab === 'cv' && user.role === 'Ứng viên' ? (
            <div className="space-y-6">
              {/* CV Upload Card */}
              <form onSubmit={handleCvUpload} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="text-primary-700 w-5 h-5" />
                  Tải lên CV mới
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="cv-file-input" className="label-text">Chọn tệp tin CV (PDF, DOC, DOCX, Ảnh - Tối đa 5MB)</label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-primary-500 transition-colors relative bg-gray-50/50">
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="cv-file-input"
                            className="relative cursor-pointer bg-white rounded-md font-semibold text-primary-700 hover:text-primary-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 px-1.5"
                          >
                            <span>Tải lên một tệp tin</span>
                            <input
                              id="cv-file-input"
                              name="cv-file-input"
                              type="file"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              className="sr-only"
                              disabled={uploadingCv}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setCvFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo và thả vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, PNG, JPG lên đến 5MB</p>
                      </div>
                    </div>
                    {cvFile && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-xl">
                        <span className="text-xs font-semibold text-primary-900 truncate max-w-xs sm:max-w-md">
                          📄 {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCvFile(null);
                            const fileInput = document.getElementById('cv-file-input') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5"
                          aria-label="Hủy tệp tin đã chọn"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cvDescription" className="label-text">Mô tả / Tên gọi CV (ví dụ: CV Tiếng Anh - Developer)</label>
                    <input
                      id="cvDescription"
                      type="text"
                      value={cvDescription}
                      onChange={(e) => setCvDescription(e.target.value)}
                      className="input-field"
                      placeholder="Mô tả ngắn để phân biệt giữa các CV của bạn"
                      disabled={uploadingCv}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={uploadingCv || !cvFile}
                    className="btn-primary flex items-center gap-2"
                  >
                    {uploadingCv ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang tải lên Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Tải CV lên</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* CV List Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-primary-700 w-5 h-5" />
                  Danh sách CV của bạn ({cvList.length})
                </h2>

                {loadingCvs ? (
                  <div className="py-12 text-center">
                    <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Đang tải danh sách CV...</p>
                  </div>
                ) : cvList.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900">Không có CV nào</h3>
                    <p className="text-xs text-gray-500 mt-1">Tải CV đầu tiên của bạn lên bằng biểu mẫu phía trên để ứng tuyển nhanh.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {cvList.map((cv) => (
                      <div 
                        key={cv.id} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl gap-4 hover:shadow-md transition-all duration-300 animate-fade-in text-left"
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            {editingCvId === cv.id ? (
                              <div className="flex items-center gap-2 mt-1" role="group" aria-label={`Chỉnh sửa mô tả cho ${cv.description || 'CV'}`}>
                                <label htmlFor={`edit-cv-desc-${cv.id}`} className="sr-only">Mô tả CV mới</label>
                                <input
                                  id={`edit-cv-desc-${cv.id}`}
                                  type="text"
                                  value={editingDesc}
                                  onChange={(e) => setEditingDesc(e.target.value)}
                                  className="input-field text-xs py-1.5 px-3 max-w-xs sm:max-w-sm"
                                  placeholder="Mô tả CV mới"
                                />
                                <button
                                  onClick={() => handleCvUpdateDesc(cv.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCvId(null);
                                    setEditingDesc('');
                                  }}
                                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-bold text-gray-900 text-sm leading-snug break-all">{cv.description || 'CV file'}</h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <span>Tải lên: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t border-gray-100 sm:border-t-0 pt-3 sm:pt-0">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewCvUrl(cv.cvUrl);
                              setPreviewCvTitle(cv.description || 'Xem CV');
                            }}
                            className="p-2 border border-gray-200 hover:border-primary-500 hover:bg-primary-50 rounded-xl text-gray-600 hover:text-primary-750 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                            aria-label={`Xem chi tiết CV: ${cv.description || 'CV file'}`}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>

                          {/* Edit button */}
                          {editingCvId !== cv.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCvId(cv.id);
                                setEditingDesc(cv.description || '');
                              }}
                              className="p-2 border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 rounded-xl text-gray-600 hover:text-yellow-750 transition-all focus-visible:ring-2 focus-visible:ring-yellow-500"
                              aria-label={`Sửa tên CV: ${cv.description || 'CV file'}`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}

                          {/* Delete button - opens ConfirmDialog */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCvId(cv.id)}
                            className="p-2 border border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-750 transition-all focus-visible:ring-2 focus-visible:ring-red-500"
                            aria-label={`Xóa CV: ${cv.description || 'CV file'}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  <label htmlFor="avatarUrlInput" className="label-text">Ảnh đại diện (Avatar URL)</label>
                  <div className="flex items-center gap-4 mt-1.5">
                    {/* Clickable circular preview */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-file-input')?.click()}
                      className="h-14 w-14 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0 shadow-sm hover:ring-2 hover:ring-primary-500 focus:outline-none relative group"
                      title="Chọn ảnh đại diện mới để tải lên"
                      aria-label="Chọn ảnh đại diện mới"
                      disabled={submitting || uploadingAvatar}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Xem trước ảnh đại diện" className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold leading-tight text-center">Tải ảnh</span>
                      </div>
                    </button>

                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarUpload}
                      disabled={submitting || uploadingAvatar}
                    />

                    <input
                      id="avatarUrlInput"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Ví dụ: https://example.com/avatar.jpg hoặc nhấp tải ảnh lên..."
                      disabled={submitting || uploadingAvatar}
                    />

                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-file-input')?.click()}
                      disabled={submitting || uploadingAvatar}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      {uploadingAvatar ? (
                        <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-4 h-4 text-gray-500" />
                      )}
                      <span>{uploadingAvatar ? 'Đang tải...' : 'Tải lên ảnh'}</span>
                    </button>
                  </div>
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

      {/* CV Preview Modal */}
      {previewCvUrl && (
        <AccessibleModal
          isOpen={!!previewCvUrl}
          onClose={() => setPreviewCvUrl(null)}
          title={previewCvTitle || 'Xem CV'}
          maxWidth="max-w-5xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <span className="text-sm text-gray-500 font-medium">Bản xem trước trực tiếp trên hệ thống</span>
              <a
                href={previewCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 hover:shadow-md transition-all shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trong tab mới</span>
              </a>
            </div>
            
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[60vh] max-h-[75vh]">
              {previewCvUrl.split('?')[0].toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/) ? (
                <img
                  src={previewCvUrl}
                  alt={previewCvTitle || 'CV Preview'}
                  className="max-w-full max-h-[70vh] object-contain p-2"
                />
              ) : (
                <iframe
                  src={`${previewCvUrl}#toolbar=0`}
                  title="CV Preview"
                  className="w-full h-[70vh] border-0"
                />
              )}
            </div>
          </div>
        </AccessibleModal>
      )}

      {/* Accessible Delete Confirmation Dialog - thay thế window.confirm() */}
      <ConfirmDialog
        isOpen={confirmDeleteCvId !== null}
        onConfirm={() => confirmDeleteCvId !== null && handleCvDelete(confirmDeleteCvId)}
        onCancel={() => setConfirmDeleteCvId(null)}
        title="Xác nhận xóa CV"
        message="Bạn có chắc chắn muốn xóa CV này khỏi hệ thống? Hành động này không thể hoàn tác."
        confirmLabel="Xóa CV"
        cancelLabel="Hủy bỏ"
      />
        </div>
      </div>
    </div>
  );
}
