import { useState } from 'react';
import { Award, CheckCircle, ShieldCheck, Star, ArrowRight, Check } from 'lucide-react';

export default function EmployerBadge() {
  const [checklist, setChecklist] = useState({
    profileComplete: true,
    verifiedLicense: false,
    responseRate: 85,
    wcagCompliance: true,
  });

  const [applied, setApplied] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleCheckboxChange = (field: 'profileComplete' | 'verifiedLicense' | 'wcagCompliance') => {
    setChecklist(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecklist(prev => ({
      ...prev,
      responseRate: parseInt(e.target.value) || 0,
    }));
  };

  const isQualified = checklist.profileComplete && checklist.verifiedLicense && checklist.responseRate >= 90 && checklist.wcagCompliance;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setShowStatus(true);
    if (isQualified) {
      setApplied(true);
    } else {
      setApplied(false);
    }
  };

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
          <Award className="w-4.5 h-4.5 text-emerald-650" aria-hidden="true" /> Chương trình xác thực uy tín nhà tuyển dụng
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
          Huy Hiệu Nhà Tuyển Dụng Uy Tín
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
          Nâng cao uy tín thương hiệu tuyển dụng của bạn, thu hút nhân tài vượt trội và thể hiện sự cam kết đồng hành cùng cộng đồng người khuyết tật.
        </p>
      </div>

      {/* Grid: Benefits and Badge Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch">
        {/* Left: Benefits (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between" aria-labelledby="benefits-heading">
          <div>
            <h2 id="benefits-heading" className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5.5 h-5.5 text-emerald-600" aria-hidden="true" />
              Lợi ích khi sở hữu Huy hiệu Uy tín
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-55 px-2.5 py-2 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">🚀</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Tăng 200% tỷ lệ nộp hồ sơ</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tin tuyển dụng có huy hiệu uy tín luôn hiển thị ở các vị trí ưu tiên và thu hút sự chú ý đặc biệt từ các ứng viên chất lượng cao.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-55 px-2.5 py-2 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">🔒</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Khẳng định thương hiệu nhân văn</h3>
                  <p className="text-xs text-gray-650 leading-relaxed">
                    Minh chứng cho nỗ lực của doanh nghiệp trong việc thúc đẩy bình đẳng cơ hội việc làm và tuân thủ các tiêu chuẩn tiếp cận số WCAG.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-55 px-2.5 py-2 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">🤝</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Hỗ trợ đặc quyền từ JobAccess</h3>
                  <p className="text-xs text-gray-650 leading-relaxed">
                    Được ưu tiên trải nghiệm trước các tính năng AI HR nâng cao, phân tích hồ sơ thông minh và báo cáo thị trường lao động định kỳ.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>* Huy hiệu được gia hạn tự động mỗi 3 tháng nếu duy trì đủ tiêu chuẩn.</span>
          </div>
        </section>

        {/* Right: Badge Visualization (5 cols) */}
        <section className="lg:col-span-5 bg-gradient-to-br from-[#004D25] to-[#002B14] text-white rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between items-center text-center" aria-labelledby="badge-heading">
          <h2 id="badge-heading" className="sr-only">Minh họa Huy hiệu</h2>
          <div className="my-auto py-6 space-y-6">
            {/* The Badge Graphic */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 border-4 border-white flex items-center justify-center shadow-xl">
                <ShieldCheck className="w-16 h-16 text-white" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-white/10">
                <Award className="w-4 h-4 text-emerald-400" /> JOBACCESS VERIFIED
              </div>
              <p className="text-lg font-black tracking-wide text-white">NHÀ TUYỂN DỤNG UY TÍN</p>
              <p className="text-xs text-emerald-250 max-w-xs mx-auto leading-relaxed">
                Biểu tượng minh chứng cho sự tin cậy, tốc độ phản hồi xuất sắc và cam kết hỗ trợ tiếp cận người khuyết tật.
              </p>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-white/10">
            <a href="#checker-section" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors focus:outline-none focus:underline">
              Kiểm tra điều kiện của bạn <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

      {/* Criteria and Qualification Checker */}
      <div id="checker-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Detailed Criteria List (6 cols) */}
        <section className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm" aria-labelledby="criteria-heading">
          <h2 id="criteria-heading" className="text-base font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            Tiêu chí xét duyệt Huy hiệu Uy tín
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Thông tin doanh nghiệp đầy đủ (100%)</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Cung cấp đầy đủ thông tin: Tên, logo, mã số thuế, địa chỉ trụ sở, quy mô nhân sự và mô tả chi tiết lĩnh vực hoạt động.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Xác thực đăng ký kinh doanh thành công</h3>
                <p className="text-xs text-gray-550 leading-relaxed mt-0.5">
                  Tải lên giấy phép đăng ký kinh doanh hợp lệ và được đội ngũ vận hành JobAccess duyệt thành công.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Tỷ lệ phản hồi ứng viên trên 90%</h3>
                <p className="text-xs text-gray-550 leading-relaxed mt-0.5">
                  Xử lý hồ sơ ứng viên (chấp nhận, từ chối hoặc lên lịch phỏng vấn) trong vòng tối đa 3 ngày làm việc kể từ lúc nhận đơn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Tuân thủ Tiếp cận Tin tuyển dụng (WCAG)</h3>
                <p className="text-xs text-gray-550 leading-relaxed mt-0.5">
                  Nội dung JD được viết rõ ràng, phân cấp mạch lạc, không dùng ảnh chụp thay văn bản và hỗ trợ tốt cho giọng đọc screen reader.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Interactive Qualification Checker Form (6 cols) */}
        <section className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm" aria-labelledby="form-heading">
          <h2 id="form-heading" className="text-base font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Công cụ kiểm tra &amp; Nộp hồ sơ nhận Huy hiệu
          </h2>

          <form onSubmit={handleApply} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-150 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col">
                  <label htmlFor="chk-profile" className="text-sm font-semibold text-gray-700">Hồ sơ doanh nghiệp đạt 100%</label>
                  <span className="text-xs text-gray-400">Đã cập nhật logo, mô tả doanh nghiệp và địa chỉ</span>
                </div>
                <input
                  type="checkbox"
                  id="chk-profile"
                  checked={checklist.profileComplete}
                  onChange={() => handleCheckboxChange('profileComplete')}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-150 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col">
                  <label htmlFor="chk-license" className="text-sm font-semibold text-gray-700">Đã gửi và duyệt Giấy phép kinh doanh</label>
                  <span className="text-xs text-gray-400">Được xác minh bởi đội ngũ JobAccess</span>
                </div>
                <input
                  type="checkbox"
                  id="chk-license"
                  checked={checklist.verifiedLicense}
                  onChange={() => handleCheckboxChange('verifiedLicense')}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl border border-gray-150 hover:bg-gray-50/50 transition-colors space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="rng-response" className="text-sm font-semibold text-gray-700">Tỷ lệ phản hồi ứng viên: <span className="text-emerald-700 font-bold">{checklist.responseRate}%</span></label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${checklist.responseRate >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'}`}>
                    {checklist.responseRate >= 90 ? 'Đạt tiêu chuẩn' : 'Chưa đạt (yêu cầu ≥ 90%)'}
                  </span>
                </div>
                <input
                  type="range"
                  id="rng-response"
                  min="50"
                  max="100"
                  value={checklist.responseRate}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-150 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col">
                  <label htmlFor="chk-wcag" className="text-sm font-semibold text-gray-700">Tin tuyển dụng thân thiện WCAG 2.2</label>
                  <span className="text-xs text-gray-400">JD sử dụng font chữ, màu sắc và cấu trúc đạt chuẩn tiếp cận</span>
                </div>
                <input
                  type="checkbox"
                  id="chk-wcag"
                  checked={checklist.wcagCompliance}
                  onChange={() => handleCheckboxChange('wcagCompliance')}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
            >
              Nộp đơn xin cấp Huy hiệu Uy tín
            </button>

            {/* Application Feedback - Accessibility friendly status */}
            {showStatus && (
              <div
                role="status"
                aria-atomic="true"
                className={`p-4 rounded-xl border text-sm font-medium ${applied ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-250 text-amber-900'}`}
              >
                {applied ? (
                  <div className="space-y-1.5">
                    <p className="font-extrabold flex items-center gap-1.5">🎉 Chúc mừng! Doanh nghiệp đủ điều kiện.</p>
                    <p className="text-xs text-emerald-705 leading-relaxed">
                      Yêu cầu xét duyệt của bạn đã được gửi lên hệ thống. Đội ngũ vận hành sẽ kích hoạt huy hiệu trên tài khoản của bạn trong vòng 24 giờ làm việc.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="font-extrabold flex items-center gap-1.5">⚠️ Chưa đủ điều kiện xét duyệt.</p>
                    <p className="text-xs text-amber-705 leading-relaxed">
                      Doanh nghiệp của bạn cần hoàn tất các tiêu chí chưa đạt (được đánh dấu màu đỏ hoặc chưa tích) để nộp đơn. Hãy cải thiện và thử lại nhé!
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
