import { useState } from 'react';
import { FileText, ShieldAlert, Scale } from 'lucide-react';

export default function TermsAndPolicies() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'regulations'>('terms');

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Điều Khoản & Chính Sách Pháp Lý
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Cung cấp đầy đủ thông tin pháp lý về quy chế hoạt động, quyền lợi bảo mật thông tin và điều khoản hợp tác sử dụng cổng thông tin JobAccess.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left tabs (4 cols) */}
        <nav className="lg:col-span-4 bg-white border border-gray-250 rounded-2xl p-5 shadow-sm space-y-2" aria-label="Danh mục tài liệu pháp lý">
          <button
            role="tab"
            aria-selected={activeTab === 'terms'}
            aria-controls="panel-terms"
            id="tab-terms"
            onClick={() => setActiveTab('terms')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${activeTab === 'terms' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-650 hover:bg-gray-50'}`}
          >
            <Scale className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Điều khoản dịch vụ</span>
          </button>
          
          <button
            role="tab"
            aria-selected={activeTab === 'privacy'}
            aria-controls="panel-privacy"
            id="tab-privacy"
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${activeTab === 'privacy' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-650 hover:bg-gray-50'}`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Chính sách bảo mật</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'regulations'}
            aria-controls="panel-regulations"
            id="tab-regulations"
            onClick={() => setActiveTab('regulations')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${activeTab === 'regulations' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-650 hover:bg-gray-50'}`}
          >
            <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Quy chế hoạt động</span>
          </button>
        </nav>

        {/* Right document reader (8 cols) */}
        <section className="lg:col-span-8 bg-white border border-gray-250 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]" aria-label="Nội dung tài liệu">
          {/* Tab 1: Terms */}
          <div
            role="tabpanel"
            id="panel-terms"
            aria-labelledby="tab-terms"
            className={activeTab === 'terms' ? 'block space-y-6 text-gray-700' : 'hidden'}
          >
            <h2 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Scale className="w-5.5 h-5.5 text-emerald-600" />
              Điều Khoản Dịch Vụ Hợp Tác
            </h2>
            <div className="text-sm leading-relaxed text-justify space-y-4">
              <p>Chào mừng bạn đến với JobAccess. Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ toàn bộ các điều khoản và quy định pháp lý được nêu dưới đây:</p>
              
              <h3 className="font-bold text-gray-900 text-base mt-4">1. Tài khoản người dùng</h3>
              <p>Người dùng có trách nhiệm tự bảo mật thông tin tài khoản đăng nhập cá nhân (Email, Mật khẩu). Mọi hành động phát sinh từ tài khoản của bạn được coi là do chính chủ sở hữu tài khoản thực hiện. Bạn cần thông báo ngay cho ban quản trị nếu phát hiện xâm nhập trái phép.</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">2. Quy định tin đăng tuyển dụng</h3>
              <p>Các doanh nghiệp cam kết đăng thông tin tuyển dụng chính xác, minh bạch về mức lương, địa chỉ, hình thức làm việc và không vi phạm thuần phong mỹ tục hay pháp luật Việt Nam. Ban quản trị có quyền gỡ bỏ các tin đăng không đáp ứng tiêu chuẩn mà không cần báo trước.</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">3. Tuyên bố từ chối trách nhiệm</h3>
              <p>JobAccess là nền tảng kết nối ứng viên và nhà tuyển dụng. Chúng tôi không can thiệp trực tiếp vào thỏa thuận làm việc cá nhân hay chịu trách nhiệm pháp lý đối với bất kỳ tranh chấp phát sinh nào giữa hai bên trong quá trình hợp tác làm việc thực tế.</p>
            </div>
          </div>

          {/* Tab 2: Privacy */}
          <div
            role="tabpanel"
            id="panel-privacy"
            aria-labelledby="tab-privacy"
            className={activeTab === 'privacy' ? 'block space-y-6 text-gray-700' : 'hidden'}
          >
            <h2 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5.5 h-5.5 text-emerald-600" />
              Chính Sách Bảo Mật Thông Tin
            </h2>
            <div className="text-sm leading-relaxed text-justify space-y-4">
              <p>JobAccess cam kết bảo vệ quyền riêng tư và thông tin cá nhân của toàn bộ ứng viên và nhà tuyển dụng sử dụng hệ thống của chúng tôi:</p>
              
              <h3 className="font-bold text-gray-900 text-base mt-4">1. Thu thập dữ liệu</h3>
              <p>Chúng tôi chỉ thu thập các thông tin cá nhân cần thiết phục vụ cho mục đích tìm kiếm việc làm bao gồm: Họ tên, Email, Số điện thoại, CV, lịch sử nộp hồ sơ ứng tuyển và ghi âm giọng nói (nếu sử dụng tính năng tìm kiếm bằng giọng nói).</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">2. Mục đích sử dụng</h3>
              <p>Dữ liệu của bạn được sử dụng để đề xuất việc làm thích hợp thông qua thuật toán thông minh, cho phép nhà tuyển dụng chủ động xem CV và gửi thư mời làm việc phù hợp.</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">3. Bảo mật và chia sẻ</h3>
              <p>Chúng tôi cam kết tuyệt đối không bán hoặc trao đổi thông tin người dùng cho bên thứ ba vì mục đích quảng cáo. Dữ liệu giọng nói hỗ trợ khiếm thị được bảo mật cục bộ và mã hóa truyền gửi an toàn.</p>
            </div>
          </div>

          {/* Tab 3: Regulations */}
          <div
            role="tabpanel"
            id="panel-regulations"
            aria-labelledby="tab-regulations"
            className={activeTab === 'regulations' ? 'block space-y-6 text-gray-700' : 'hidden'}
          >
            <h2 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileText className="w-5.5 h-5.5 text-emerald-600" />
              Quy Chế Hoạt Động Của Sàn Giao Dịch
            </h2>
            <div className="text-sm leading-relaxed text-justify space-y-4">
              <p>Quy chế hoạt động chính thức của sàn giao dịch thương mại điện tử tuyển dụng và việc làm JobAccess:</p>
              
              <h3 className="font-bold text-gray-900 text-base mt-4">1. Nguyên tắc hoạt động</h3>
              <p>Bảo đảm cung cấp cổng thông tin minh bạch, bình đẳng, không phân biệt đối xử và hướng đến việc hỗ trợ tối đa người khuyết tật, người khiếm thị tìm kiếm công việc phù hợp dễ dàng bằng công nghệ giọng nói AI.</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">2. Quyền và nghĩa vụ người dùng</h3>
              <p>Mọi ứng viên có quyền được ứng tuyển tự do, đánh giá các nhà tuyển dụng và sử dụng các công cụ tính lương hay viết CV hoàn toàn miễn phí. Người dùng có nghĩa vụ tuân thủ các quy tắc ứng xử chuẩn mực cộng đồng.</p>

              <h3 className="font-bold text-gray-900 text-base mt-4">3. Quy trình giải quyết tranh chấp</h3>
              <p>Khi có khiếu nại, người dùng gửi thông tin qua hòm thư điện tử `hotro@jobmatch.vn`. Ban quản lý sàn sẽ đóng vai trò trung gian tiến hành điều tra làm rõ và có biện pháp xử lý thỏa đáng đối với tài khoản vi phạm quy chế sàn.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
