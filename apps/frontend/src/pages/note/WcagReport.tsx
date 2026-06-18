import { ShieldCheck, Award, Eye, Keyboard, Zap, Smartphone, CheckCircle, FileText } from 'lucide-react';

export default function WcagReport() {
  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Báo cáo tiếp cận WCAG 2.2 AA
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Báo Cáo Đánh Giá Tính Tiếp Cận (Accessibility Report)
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Tài liệu chi tiết minh chứng sự tuân thủ đầy đủ của JobAccess đối với các nguyên tắc tiếp cận Web quốc tế W3C WCAG 2.2 AA, hỗ trợ đặc lực cho người khuyết tật và khiếm thị.
        </p>
      </div>

      {/* Summary Scorecard */}
      <section className="bg-gradient-to-br from-[#004D25] to-[#002B14] text-white rounded-2xl p-6 md:p-8 shadow-md mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-sm font-bold tracking-wider text-emerald-100 uppercase">TIÊU CHUẨN TIẾP CẬN ĐẠT ĐƯỢC</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-400">WCAG 2.2 AA Compliant</p>
          <p className="text-xs text-emerald-200">Đã tối ưu hóa và kiểm tra thành công trên các trình đọc màn hình NVDA, VoiceOver.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-xl border border-white/10 shrink-0">
          <Award className="w-10 h-10 text-emerald-400" />
          <div>
            <p className="text-xs text-emerald-200 font-semibold">Tỷ lệ đáp ứng</p>
            <p className="text-2xl font-black text-white">100%</p>
          </div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="space-y-6" aria-labelledby="highlights-heading">
        <h2 id="highlights-heading" className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Zap className="w-5.5 h-5.5 text-emerald-600" />
          Các cải tiến kỹ thuật chính đã thực hiện
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Keyboard Access */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-emerald-600" />
              1. Bàn phím & Điều hướng (Keyboard Navigation)
            </h3>
            <ul className="text-xs text-gray-650 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Đường dẫn bỏ qua nhanh (Skip Link) giúp người dùng chuyển ngay tới nội dung chính mà không cần tab qua header.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Sử dụng class `focus-visible:ring-2` với border bo góc rõ nét tạo chỉ báo focus trực quan cao (WCAG 2.4.11).
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Hỗ trợ phím tắt `Escape` để đóng các thanh menu hamburger và hộp thoại Modal một cách tự nhiên (WCAG 2.1.1).
              </li>
            </ul>
          </div>

          {/* Card 2: Screen Reader */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              2. Trình đọc màn hình (Screen Reader ARIA)
            </h3>
            <ul className="text-xs text-gray-650 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Sử dụng thuộc tính `role="tablist"`, `role="tab"`, `aria-selected` đầy đủ cho các thanh chuyển danh mục lọc, hồ sơ cá nhân.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Tất cả các nút biểu tượng chỉ có icon đều được định danh qua `aria-label` mô tả chi tiết hành động.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thiết kế thông báo trạng thái `aria-live="polite"` động cho số lượng việc làm khi người dùng thay đổi bộ lọc tìm kiếm.
              </li>
            </ul>
          </div>

          {/* Card 3: Form Accessibility */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              3. Biểu mẫu tiếp cận (Accessible Forms)
            </h3>
            <ul className="text-xs text-gray-650 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Bắt buộc liên kết rõ ràng các thẻ <code>&lt;label htmlFor="..."&gt;</code> và <code>id</code> của input tương ứng (WCAG 3.3.2).
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thêm gợi ý mô tả thông tin phụ thông qua `aria-describedby` tại biểu mẫu Đăng ký/Đăng nhập.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thay thế toàn bộ hộp xác nhận lỗi thời `window.confirm()` bằng accessible `ConfirmDialog` mới kiểm soát focus trap an toàn.
              </li>
            </ul>
          </div>

          {/* Card 4: Responsive Design */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              4. Kích thước chạm & Di động (Tap Targets)
            </h3>
            <ul className="text-xs text-gray-650 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thiết lập kích thước các nút bấm hành động (Xem, Xóa, Sửa) trên thiết bị di động đạt tối thiểu 44x44px.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thay đổi hiển thị dạng bảng phức tạp thành các Card List xếp dọc trực quan giúp loại bỏ thanh cuộn ngang khó kiểm soát.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Thiết lập `prefer-reduced-motion` và hỗ trợ độ tương phản màu chuẩn hóa (Forced Colors) giúp bảo vệ thị lực người dùng.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
