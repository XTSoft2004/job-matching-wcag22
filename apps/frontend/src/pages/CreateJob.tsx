import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, notification } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Building,
  Plus,
  ChevronLeft,
  AlertTriangle,
  Send,
  Globe,
  Users2,
  Info,
  Building2,
  Sparkles
} from 'lucide-react';

export default function CreateJob() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(false);

  // Company state
  const [myCompany, setMyCompany] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // Modal state for creating a new company
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    logo: '',
    website: '',
    address: '',
    companySize: '10-50 nhân viên',
    description: ''
  });

  // Salary Negotiation state
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(false);

  // Load recruiter's company or all companies
  const loadCompanyContext = async () => {
    if (!user) return;

    // 1. If user has companyId, fetch that company
    if (user.companyId) {
      setFetchingCompany(true);
      try {
        const res: any = await api.get(`/companies/${user.companyId}`);
        setMyCompany(res.data || null);
        setSelectedCompanyId(user.companyId);
      } catch (err) {
        console.error('Lỗi khi tải thông tin công ty:', err);
      } finally {
        setFetchingCompany(false);
      }
    } else {
      // 2. Otherwise, fetch list of all companies so they can select
      setFetchingCompany(true);
      try {
        const res: any = await api.get('/companies?limit=100');
        setCompanies(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách công ty:', err);
      } finally {
        setFetchingCompany(false);
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'Nhà tuyển dụng' && user.role !== 'Quản trị viên') return;
    loadCompanyContext();
  }, [user]);

  // Handle company registration modal submission
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      notification.error({
        message: 'Lỗi nhập liệu',
        description: 'Vui lòng nhập tên công ty.'
      });
      return;
    }

    setCompanyLoading(true);
    try {
      await api.post('/companies', newCompany);
      notification.success({
        message: 'Tạo công ty thành công',
        description: `Doanh nghiệp "${newCompany.name}" đã được tạo và liên kết với tài khoản của bạn.`
      });

      // Refresh Auth User context so user.companyId is populated
      await refreshUser();

      // Reset modal and reload
      setIsCompanyModalOpen(false);
      setNewCompany({
        name: '',
        logo: '',
        website: '',
        address: '',
        companySize: '10-50 nhân viên',
        description: ''
      });
    } catch (err: any) {
      console.error(err);
      notification.error({
        message: 'Không thể tạo công ty',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi khởi tạo doanh nghiệp.'
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  // Job Submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetCompId = user?.role === 'Quản trị viên' ? selectedCompanyId : (user?.companyId || selectedCompanyId);

    if (!targetCompId) {
      notification.warning({
        message: 'Chưa liên kết doanh nghiệp',
        description: 'Vui lòng liên kết tài khoản của bạn với một doanh nghiệp hoặc tạo doanh nghiệp mới trước khi đăng tin.'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Parse salary values
    const salaryMinVal = formData.get('salaryMin');
    const salaryMaxVal = formData.get('salaryMax');
    const salaryMin = salaryMinVal ? Number(salaryMinVal) : undefined;
    const salaryMax = salaryMaxVal ? Number(salaryMaxVal) : undefined;

    // Validation
    if (!isSalaryNegotiable && salaryMin && salaryMax && salaryMin > salaryMax) {
      notification.error({
        message: 'Lỗi nhập lương',
        description: 'Mức lương tối thiểu không được lớn hơn mức lương tối đa.'
      });
      setLoading(false);
      return;
    }

    const data = {
      title: formData.get('title'),
      companyId: Number(targetCompId),
      employerId: user?.id,
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      benefits: formData.get('benefits'),
      jobType: formData.get('jobType'),
      industry: formData.get('industry'),
      experienceLevel: formData.get('experienceLevel'),
      quantity: formData.get('quantity') ? Number(formData.get('quantity')) : 1,
      salaryMin: isSalaryNegotiable ? undefined : salaryMin,
      salaryMax: isSalaryNegotiable ? undefined : salaryMax,
      isSalaryNegotiable,
      province: formData.get('province'),
      workAddress: formData.get('workAddress')
    };

    try {
      await api.post('/jobs', data);
      notification.success({
        message: 'Đăng tin thành công',
        description: 'Tin tuyển dụng mới đã được đăng tải và đưa vào hệ thống phân tích AI.'
      });

      // Redirect
      if (user?.role === 'Quản trị viên') {
        navigate('/admin/jobs');
      } else {
        navigate('/employer/jobs');
      }
    } catch (err: any) {
      console.error(err);
      notification.error({
        message: 'Đăng tin thất bại',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi tạo tin tuyển dụng mới.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Guard access
  if (!user || (user.role !== 'Nhà tuyển dụng' && user.role !== 'Quản trị viên')) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8 animate-slide-up">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm">Vui lòng đăng nhập với tài khoản Nhà tuyển dụng hoặc Quản trị viên để đăng tin tuyển dụng.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-6">Quay lại trang chủ</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up text-left font-sans text-gray-800">

      {/* Navigation Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500 font-semibold">Nhà tuyển dụng / Đăng tin</span>
      </div>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-700 to-primary-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Đăng tin tuyển dụng
          </span>
          <p className="text-primary-100 text-sm leading-relaxed font-medium">
            Thông tin tin tuyển dụng sẽ được hệ thống vector nhúng AI phân tích tự động, giúp đề xuất và tiếp cận chính xác các ứng viên có kỹ năng phù hợp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6" aria-label="Biểu mẫu đăng tin tuyển dụng">

          {/* Section 1: Doanh nghiệp đăng tuyển (Nếu chưa có công ty) */}
          {user.role === 'Nhà tuyển dụng' && !user.companyId && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-amber-900 text-base">Tài khoản chưa liên kết doanh nghiệp</h3>
                  <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                    Bạn cần liên kết tài khoản tuyển dụng với một doanh nghiệp hoặc tạo mới một thông tin công ty để đăng tin tuyển dụng.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex-grow">
                  <label htmlFor="selectCompany" className="sr-only">Chọn công ty có sẵn</label>
                  <select
                    id="selectCompany"
                    className="w-full input-field border-amber-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">-- Chọn doanh nghiệp hiện có --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Tạo doanh nghiệp mới
                </button>
              </div>
            </div>
          )}

          {/* Section 1.1: Quản trị viên chọn doanh nghiệp */}
          {user.role === 'Quản trị viên' && (
            <div className="bg-white border border-gray-250 rounded-3xl p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Building className="text-primary-700 w-5 h-5" />
                Doanh Nghiệp Đăng Tuyển (Quản trị viên)
              </h2>
              <div>
                <label htmlFor="adminSelectCompany" className="label-text">Chọn doanh nghiệp đại diện <span className="text-red-500">*</span></label>
                <select
                  id="adminSelectCompany"
                  required
                  className="input-field mt-1.5"
                  value={selectedCompanyId || ''}
                  onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">-- Chọn công ty --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 2: Thông tin chung */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Briefcase className="text-primary-700 w-5 h-5" />
              Thông Tin Tuyển Dụng
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="label-text">Tiêu đề tin tuyển dụng <span className="text-red-500">*</span></label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="input-field mt-1.5"
                  placeholder="Ví dụ: Nhân viên Thiết kế Đồ họa (Photoshop, Illustrator)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="label-text">Lĩnh vực / Ngành nghề</label>
                  <select id="industry" name="industry" className="input-field mt-1.5">
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Kinh doanh / Bán hàng">Kinh doanh / Bán hàng</option>
                    <option value="Hành chính / Nhân sự">Hành chính / Nhân sự</option>
                    <option value="Marketing / Truyền thông">Marketing / Truyền thông</option>
                    <option value="Tài chính / Ngân hàng">Tài chính / Ngân hàng</option>
                    <option value="Y tế / Dược phẩm">Y tế / Dược phẩm</option>
                    <option value="Giáo dục / Đào tạo">Giáo dục / Đào tạo</option>
                    <option value="Dịch vụ khách hàng">Dịch vụ khách hàng</option>
                    <option value="Sản xuất / Kỹ thuật">Sản xuất / Kỹ thuật</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="jobType" className="label-text">Loại hình làm việc <span className="text-red-500">*</span></label>
                  <select id="jobType" name="jobType" required className="input-field mt-1.5">
                    <option value="Toàn thời gian">Toàn thời gian (Full-time)</option>
                    <option value="Bán thời gian">Bán thời gian (Part-time)</option>
                    <option value="Làm từ xa">Làm từ xa (Remote)</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Thực tập">Thực tập (Internship)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experienceLevel" className="label-text">Yêu cầu kinh nghiệm</label>
                  <select id="experienceLevel" name="experienceLevel" className="input-field mt-1.5">
                    <option value="Không yêu cầu kinh nghiệm">Không yêu cầu kinh nghiệm</option>
                    <option value="Dưới 1 năm">Dưới 1 năm</option>
                    <option value="1 năm">1 năm</option>
                    <option value="2 năm">2 năm</option>
                    <option value="3 năm">3 năm</option>
                    <option value="4 năm">4 năm</option>
                    <option value="5 năm">5 năm</option>
                    <option value="Trên 5 năm">Trên 5 năm</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="label-text">Số lượng cần tuyển</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="input-field mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Địa điểm và Mức lương */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="text-primary-700 w-5 h-5" />
              Địa Điểm & Mức Lương
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="province" className="label-text">Tỉnh / Thành phố làm việc</label>
                  <select id="province" name="province" className="input-field mt-1.5">
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Toàn quốc">Toàn quốc</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="workAddress" className="label-text">Địa chỉ cụ thể</label>
                  <input
                    id="workAddress"
                    name="workAddress"
                    type="text"
                    placeholder="Ví dụ: Lầu 5, Tòa nhà ABC, 123 Nguyễn Huệ, Q.1"
                    className="input-field mt-1.5"
                  />
                </div>
              </div>

              {/* Salary Section */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center">
                  <input
                    id="isSalaryNegotiable"
                    name="isSalaryNegotiable"
                    type="checkbox"
                    checked={isSalaryNegotiable}
                    onChange={(e) => setIsSalaryNegotiable(e.target.checked)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isSalaryNegotiable" className="ml-3 text-sm text-gray-700 font-bold cursor-pointer">
                    Mức lương Thỏa thuận (Không công khai số tiền cụ thể)
                  </label>
                </div>

                {!isSalaryNegotiable ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="salaryMin" className="label-text flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        Lương tối thiểu (VND)
                      </label>
                      <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 10000000"
                        className="input-field mt-1.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="salaryMax" className="label-text flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        Lương tối đa (VND)
                      </label>
                      <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 15000000"
                        className="input-field mt-1.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-primary-50/40 border border-primary-100 rounded-2xl text-xs text-primary-800 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Mức lương hiển thị với ứng viên sẽ là <strong>Thỏa thuận</strong>. Bạn vẫn có thể thỏa thuận trực tiếp khi phỏng vấn.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Yêu cầu chi tiết */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="text-primary-700 w-5 h-5" />
              Mô Tả Chi Tiết Công Việc
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="label-text">Mô tả công việc <span className="text-red-500">*</span></label>
                <p className="text-gray-400 text-xs mt-0.5">Nhiệm vụ, công việc hàng ngày ứng viên phải thực hiện.</p>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  className="input-field mt-1.5 resize-y text-sm"
                  placeholder="- Thực hiện thiết kế banner, hình ảnh marketing...&#10;- Phối hợp với team content lên ý tưởng thiết kế...&#10;- Báo cáo tiến độ công việc hàng tuần..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="requirements" className="label-text">Yêu cầu ứng viên</label>
                <p className="text-gray-400 text-xs mt-0.5">Kỹ năng chuyên môn, kinh nghiệm, bằng cấp tối thiểu cần có.</p>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  className="input-field mt-1.5 resize-y text-sm"
                  placeholder="- Tốt nghiệp chuyên ngành thiết kế đồ họa hoặc tương đương...&#10;- Có tối thiểu 1 năm kinh nghiệm sử dụng Photoshop, Illustrator...&#10;- Có tư duy sáng tạo tốt, có portfolio đính kèm..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="benefits" className="label-text">Quyền lợi được hưởng</label>
                <p className="text-gray-400 text-xs mt-0.5">Chế độ đãi ngộ, bảo hiểm, lương thưởng, môi trường làm việc.</p>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={4}
                  className="input-field mt-1.5 resize-y text-sm"
                  placeholder="- Lương tháng 13, thưởng hiệu quả công việc...&#10;- Hưởng đầy đủ chế độ BHXH, BHYT...&#10;- Được tham gia teambuilding hàng năm..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-8 text-sm font-bold flex items-center gap-1.5 shadow-md shadow-primary-100"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Đăng tin tuyển dụng
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Information & Guidelines */}
        <aside className="space-y-6">

          {/* Card 1: Doanh nghiệp thông tin */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider">Doanh nghiệp của bạn</h3>

            {fetchingCompany ? (
              <div className="flex items-center gap-2 text-gray-500 py-4 text-xs font-semibold">
                <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tải thông tin doanh nghiệp...</span>
              </div>
            ) : myCompany ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg border border-primary-100 shrink-0">
                    {myCompany.logo ? (
                      <img src={myCompany.logo} alt={myCompany.name} className="h-full w-full object-contain rounded-xl" />
                    ) : (
                      myCompany.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{myCompany.name}</h4>
                    {myCompany.website && (
                      <a href={myCompany.website} target="_blank" rel="noreferrer" className="text-primary-700 hover:underline text-xs flex items-center gap-1 font-semibold mt-0.5">
                        <Globe className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500 font-semibold border-t border-gray-100 pt-3">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{myCompany.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Quy mô: {myCompany.companySize || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-xs font-semibold">
                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>Tài khoản chưa được liên kết với doanh nghiệp tuyển dụng.</p>
              </div>
            )}
          </div>

          {/* Card 2: Mẹo đăng tin tuyển dụng */}
          <div className="bg-gradient-to-b from-primary-50/20 to-blue-50/10 border border-primary-100/50 rounded-3xl p-6 space-y-4">
            <h3 className="text-primary-800 font-extrabold text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Mẹo Đăng Tin Hiệu Quả
            </h3>
            <ul className="space-y-3 text-xs text-gray-600 leading-relaxed font-semibold">
              <li className="flex gap-2">
                <span className="text-primary-700 font-bold">•</span>
                <span><strong>Tiêu đề rõ ràng:</strong> Ghi rõ tên vị trí và các kỹ năng quan trọng nhất (ví dụ: Thay vì "Kỹ sư phần mềm" hãy ghi "Kỹ sư Front-end ReactJS").</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-700 font-bold">•</span>
                <span><strong>Mô tả chi tiết:</strong> Nêu rõ nhiệm vụ cụ thể hàng ngày để tránh ứng viên hiểu nhầm công việc.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-700 font-bold">•</span>
                <span><strong>Lương & Phúc lợi:</strong> Tin đăng có ghi rõ khoảng lương hoặc phúc lợi (BHXH, du lịch, thưởng) thường tăng 80% tỷ lệ nộp hồ sơ.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Cơ chế vector nhúng AI */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm space-y-3.5">
            <h3 className="text-gray-900 font-extrabold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              AI Kết Nối Thông Minh
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Hệ thống sẽ tự động chuyển đổi tin tuyển dụng này thành một vector nhúng. Khi ứng viên tìm việc bằng ngôn ngữ tự nhiên (ví dụ: "Tôi muốn tìm việc dev lương 15tr"), AI sẽ tự động phân tích độ tương đồng ngữ nghĩa và đưa tin tuyển dụng này lên hàng đầu nếu phù hợp.
            </p>
          </div>
        </aside>
      </div>

      {/* Modal: Tạo doanh nghiệp mới */}
      <Modal
        title={
          <div className="font-black text-lg text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <Building className="text-primary-700" /> Tạo Hồ Sơ Doanh Nghiệp Mới
          </div>
        }
        open={isCompanyModalOpen}
        onCancel={() => setIsCompanyModalOpen(false)}
        footer={null}
        width={600}
        centered
        className="font-sans"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4 pt-4 text-left">
          <div>
            <label htmlFor="companyName" className="label-text">Tên doanh nghiệp / công ty <span className="text-red-500">*</span></label>
            <input
              id="companyName"
              type="text"
              required
              className="input-field mt-1.5"
              placeholder="Ví dụ: Công ty Cổ phần Công nghệ JobMatch Việt Nam"
              value={newCompany.name}
              onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyWebsite" className="label-text">Website công ty</label>
              <input
                id="companyWebsite"
                type="url"
                className="input-field mt-1.5"
                placeholder="Ví dụ: https://jobmatch.vn"
                value={newCompany.website}
                onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="companySize" className="label-text">Quy mô nhân sự</label>
              <select
                id="companySize"
                className="input-field mt-1.5"
                value={newCompany.companySize}
                onChange={(e) => setNewCompany(prev => ({ ...prev, companySize: e.target.value }))}
              >
                <option value="Dưới 10 nhân viên">Dưới 10 nhân viên</option>
                <option value="10-50 nhân viên">10-50 nhân viên</option>
                <option value="50-100 nhân viên">50-100 nhân viên</option>
                <option value="100-500 nhân viên">100-500 nhân viên</option>
                <option value="Trên 500 nhân viên">Trên 500 nhân viên</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="companyLogo" className="label-text">URL Logo doanh nghiệp</label>
            <input
              id="companyLogo"
              type="url"
              className="input-field mt-1.5"
              placeholder="Ví dụ: https://jobmatch.vn/logo.png"
              value={newCompany.logo}
              onChange={(e) => setNewCompany(prev => ({ ...prev, logo: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="companyAddress" className="label-text">Địa chỉ trụ sở chính</label>
            <input
              id="companyAddress"
              type="text"
              className="input-field mt-1.5"
              placeholder="Ví dụ: 123 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM"
              value={newCompany.address}
              onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="companyDescription" className="label-text">Mô tả ngắn về doanh nghiệp</label>
            <textarea
              id="companyDescription"
              rows={3}
              className="input-field mt-1.5 resize-y"
              placeholder="Giới thiệu về tầm nhìn, sứ mệnh hoặc sản phẩm dịch vụ của công ty..."
              value={newCompany.description}
              onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCompanyModalOpen(false)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={companyLoading}
              className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              {companyLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo & Liên kết
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
