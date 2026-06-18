import { useState } from 'react';
import { Search, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import AccessibleModal from '../../components/ui/AccessibleModal';

interface Article {
  id: number;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tags: string[];
}

export default function CareerHandbook() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ['Tất cả', 'Viết CV & Hồ sơ', 'Kinh nghiệm phỏng vấn', 'Phát triển bản thân', 'Tiếp cận WCAG'];

  const articles: Article[] = [
    {
      id: 1,
      title: 'Bí quyết viết CV chuẩn ATS chinh phục nhà tuyển dụng IT',
      category: 'Viết CV & Hồ sơ',
      readTime: '5 phút đọc',
      summary: 'Học cách thiết kế và cấu trúc hóa CV của bạn để vượt qua bộ lọc ATS (Applicant Tracking System) tự động của các công ty công nghệ lớn một cách dễ dàng.',
      content: 'Hệ thống ATS ngày càng phổ biến trong các quy trình tuyển dụng hiện đại. Để CV của bạn không bị loại bỏ ngay từ "vòng gửi xe", hãy chú ý những điểm sau:\n\n1. Sử dụng định dạng văn bản đơn giản (Word hoặc PDF sạch).\n2. Tránh các thiết kế đồ họa phức tạp, bảng biểu phức tạp trong phần nội dung chính.\n3. Rải các từ khóa chính xác trích từ mô tả công việc (Job Description).\n4. Định lượng hóa các kết quả đạt được (ví dụ: "Tăng 30% hiệu năng", "Lãnh đạo nhóm 5 người").\n5. Sử dụng font chữ phổ thông như Inter, Roboto, Arial.',
      tags: ['CV', 'ATS', 'Kinh nghiệm']
    },
    {
      id: 2,
      title: 'Làm thế nào để nổi bật trong buổi phỏng vấn trực tuyến?',
      category: 'Kinh nghiệm phỏng vấn',
      readTime: '6 phút đọc',
      summary: 'Chia sẻ các bước chuẩn bị kỹ thuật, tác phong chuyên nghiệp và cách giao tiếp hiệu quả qua camera để ghi điểm tuyệt đối trong mắt nhà tuyển dụng.',
      content: 'Phỏng vấn online đòi hỏi sự chuẩn bị kỹ lưỡng về cả mặt công nghệ lẫn hình thức bên ngoài:\n\n1. Kiểm tra kỹ đường truyền Internet, camera và microphone trước 15 phút.\n2. Lựa chọn góc phòng yên tĩnh, có ánh sáng tốt (tránh ngược sáng).\n3. Tác phong ăn mặc lịch sự như đi phỏng vấn trực tiếp.\n4. Giữ giao tiếp bằng mắt bằng cách nhìn thẳng vào camera chứ không nhìn vào hình ảnh của bản thân.\n5. Chuẩn bị sẵn một ly nước ấm bên cạnh để giữ giọng nói rõ ràng.',
      tags: ['Phỏng vấn', 'Online', 'Giao tiếp']
    },
    {
      id: 3,
      title: 'Học lập trình web tiếp cận (Web Accessibility) để tạo ra giá trị bền vững',
      category: 'Tiếp cận WCAG',
      readTime: '8 phút đọc',
      summary: 'Tại sao việc thiết kế website hỗ trợ người khuyết tật theo chuẩn WCAG 2.2 lại trở thành xu hướng bắt buộc của các doanh nghiệp toàn cầu hiện nay.',
      content: 'Web Accessibility (Khả năng tiếp cận Web) không chỉ là trách nhiệm xã hội mà còn giúp mở rộng tối đa tệp khách hàng tiềm năng cho doanh nghiệp:\n\n1. Đảm bảo hỗ trợ Screen Reader (Trình đọc màn hình) cho người khiếm thị.\n2. Tối ưu hóa phím tắt và khả năng duyệt web bằng bàn phím.\n3. Đảm bảo tỷ lệ tương phản màu sắc (Color Contrast) tối thiểu đạt 4.5:1 cho văn bản thông thường.\n4. Sử dụng đúng semantic HTML (nav, main, footer, article).\n5. Thiết kế Tap Targets (kích thước chạm) tối thiểu 44x44px trên di động.',
      tags: ['WCAG 2.2', 'Accessibility', 'Frontend']
    },
    {
      id: 4,
      title: 'Xây dựng thương hiệu cá nhân thông qua dự án Github và Portfolio',
      category: 'Phát triển bản thân',
      readTime: '7 phút đọc',
      summary: 'Hướng dẫn xây dựng trang Github cá nhân ấn tượng và tạo website Portfolio chuyên nghiệp để thu hút nhà tuyển dụng chủ động liên hệ.',
      content: 'Thương hiệu cá nhân trực quan là đòn bẩy mạnh mẽ nhất giúp bạn thương lượng mức lương mong muốn:\n\n1. Tạo file README.md cực đẹp cho trang cá nhân Github giới thiệu các công nghệ sử dụng.\n2. Đóng gói các dự án tiêu biểu thành bản demo chạy trực tuyến (live preview).\n3. Viết blog hoặc bài chia sẻ kỹ thuật ngắn trên LinkedIn/Medium.\n4. Đóng góp tích cực vào các dự án mã nguồn mở (Open Source).\n5. Cập nhật hồ sơ LinkedIn thường xuyên và bật chế độ "Open to Work" đúng mục tiêu.',
      tags: ['Github', 'LinkedIn', 'Personal Brand']
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Cẩm nang phát triển sự nghiệp
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Cẩm Nang Nghề Nghiệp & Tiếp Cận
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Nơi tổng hợp kiến thức chuyên môn, các bài viết hữu ích về cách ứng tuyển, phát triển bản thân và tối ưu hóa hệ thống tiếp cận.
        </p>
      </div>

      {/* Search Bar & Categories */}
      <section className="mb-10 space-y-6" aria-label="Bộ lọc cẩm nang">
        <div className="relative max-w-lg mx-auto rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            id="search-handbook"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-base"
            placeholder="Tìm kiếm bài viết..."
            aria-label="Tìm kiếm bài viết cẩm nang"
          />
        </div>

        {/* Categories navigation list */}
        <nav className="flex justify-center flex-wrap gap-2 pt-2" aria-label="Danh mục cẩm nang">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${selectedCategory === cat ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-gray-650 border border-gray-250 hover:bg-gray-50'}`}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </nav>
      </section>

      {/* Articles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Danh sách bài viết">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-gray-250 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-550 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 hover:text-emerald-700 transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.summary}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-2xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
                aria-label={`Đọc bài viết: ${article.title}`}
              >
                Đọc bài viết <ArrowRight className="w-4 h-4" />
              </button>
            </article>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 bg-white border border-gray-250 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Không tìm thấy bài viết phù hợp.</p>
          </div>
        )}
      </section>

      {/* Accessible Detail Modal */}
      {activeArticle && (
        <AccessibleModal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
        >
          <div className="space-y-4 text-gray-800">
            <div className="flex justify-between items-center gap-2 border-b border-gray-150 pb-2.5 text-xs text-gray-500">
              <span className="font-bold text-emerald-700 uppercase">{activeArticle.category}</span>
              <span>{activeArticle.readTime}</span>
            </div>
            
            <p className="text-sm font-semibold text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150">
              {activeArticle.summary}
            </p>
            
            <div className="text-sm leading-relaxed whitespace-pre-line text-justify space-y-4">
              {activeArticle.content}
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-150">
              {activeArticle.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold text-gray-750 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </AccessibleModal>
      )}
    </main>
  );
}
