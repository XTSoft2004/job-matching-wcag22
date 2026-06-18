import { useState } from 'react';
import { Search, MapPin, Briefcase, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import AccessibleModal from '../../components/ui/AccessibleModal';

interface Candidate {
  id: number;
  name: string;
  title: string;
  province: string;
  experience: string;
  skills: string[];
  bio: string;
  email: string;
  phone: string;
  gpa: string;
  education: string;
}

export default function CandidateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Tất cả');
  const [selectedExperience, setSelectedExperience] = useState('Tất cả');
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const provinces = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Thừa Thiên Huế'];
  const experiences = ['Tất cả', 'Dưới 1 năm', '1 - 3 năm', '3 - 5 năm', 'Trên 5 năm'];

  const candidates: Candidate[] = [
    {
      id: 1,
      name: 'Phan Thanh Hải',
      title: 'Lập trình viên React & Frontend',
      province: 'TP. Hồ Chí Minh',
      experience: '3 - 5 năm',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'WCAG 2.2', 'Git'],
      bio: 'Lập trình viên Frontend đam mê tối ưu hóa khả năng tiếp cận và tối đa hóa hiệu năng. Có nhiều kinh nghiệm phát triển các SPA phức tạp cho khách hàng tài chính.',
      email: 'thanhhai.phan@email.com',
      phone: '091 888 7766',
      gpa: '3.5 / 4.0',
      education: 'Đại học Công nghệ Thông tin TP.HCM'
    },
    {
      id: 2,
      name: 'Trần Thị Mỹ Linh',
      title: 'UI/UX Designer & Accessibility Advocate',
      province: 'Hà Nội',
      experience: '1 - 3 năm',
      skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Accessibility Audit'],
      bio: 'Nhà thiết kế sản phẩm tập trung vào tính tiếp cận và bao trùm. Chuyên kiến thiết hệ thống thiết kế (Design System) chuẩn tương phản cao.',
      email: 'mylinh.tran@email.com',
      phone: '097 555 4433',
      gpa: '3.8 / 4.0',
      education: 'Đại học Mỹ thuật Công nghiệp Hà Nội'
    },
    {
      id: 3,
      name: 'Nguyễn Minh Quân',
      title: 'Node.js & Backend Developer',
      province: 'Đà Nẵng',
      experience: 'Dưới 1 năm',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis'],
      bio: 'Lập trình viên backend mới tốt nghiệp với kỹ năng lập trình hướng đối tượng vững vàng, đam mê thiết kế các hệ thống cơ sở dữ liệu mở rộng.',
      email: 'minhquan.nguyen@email.com',
      phone: '093 222 1100',
      gpa: '3.4 / 4.0',
      education: 'Đại học Bách Khoa Đà Nẵng'
    },
    {
      id: 4,
      name: 'Lê Hoàng Phong',
      title: 'Full Stack Engineer (NestJS & React)',
      province: 'Thừa Thiên Huế',
      experience: 'Trên 5 năm',
      skills: ['NestJS', 'React', 'MongoDB', 'AWS', 'CI/CD'],
      bio: 'Kỹ sư Full Stack kinh nghiệm triển khai dự án đám mây, tích hợp các công cụ AI hỗ trợ tuyển dụng tự động hóa hiệu quả cao.',
      email: 'hoangphong.le@email.com',
      phone: '090 999 8888',
      gpa: '3.7 / 4.0',
      education: 'Đại học Khoa học Huế'
    }
  ];

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cand.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProvince = selectedProvince === 'Tất cả' || cand.province === selectedProvince;
    const matchesExperience = selectedExperience === 'Tất cả' || cand.experience === selectedExperience;

    return matchesSearch && matchesProvince && matchesExperience;
  });

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Tìm Kiếm Hồ Sơ Ứng Viên
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Dành riêng cho Nhà tuyển dụng. Tra cứu và kết nối nhanh chóng với các ứng viên tiềm năng có kỹ năng phù hợp nhất với yêu cầu tuyển dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters (4 cols) */}
        <section className="lg:col-span-4 bg-white border border-gray-250 rounded-2xl p-6 shadow-sm space-y-6" aria-label="Bộ lọc ứng viên">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Bộ lọc tìm kiếm
          </h2>

          {/* Search bar */}
          <div className="space-y-2">
            <label htmlFor="search-input" className="block text-sm font-semibold text-gray-700">Tìm kiếm theo tên / kỹ năng</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                placeholder="Ví dụ: React, Designer..."
              />
            </div>
          </div>

          {/* Location filter */}
          <div className="space-y-2">
            <label htmlFor="location-filter" className="block text-sm font-semibold text-gray-700">Tỉnh / Thành phố</label>
            <select
              id="location-filter"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium bg-white"
            >
              {provinces.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Experience filter */}
          <div className="space-y-2">
            <label htmlFor="experience-filter" className="block text-sm font-semibold text-gray-700">Kinh nghiệm làm việc</label>
            <select
              id="experience-filter"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium bg-white"
            >
              {experiences.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Right Candidate Grid (8 cols) */}
        <section className="lg:col-span-8 space-y-6" aria-label="Danh sách ứng viên">
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredCandidates.map((cand) => (
                <article
                  key={cand.id}
                  className="bg-white border border-gray-250 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">{cand.name}</h2>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">{cand.title}</p>
                    
                    <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        {cand.province}
                      </p>
                      <p className="flex items-center gap-1.5 font-semibold">
                        <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        {cand.experience}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 mb-4">{cand.bio}</p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cand.skills.map((skill) => (
                        <span key={skill} className="text-2xs font-semibold text-gray-650 bg-gray-50 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveCandidate(cand)}
                      className="w-full btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                      aria-label={`Xem thông tin hồ sơ ứng viên: ${cand.name}`}
                    >
                      <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>Xem hồ sơ chi tiết</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-250 rounded-2xl">
              <p className="text-gray-500 font-semibold">Không tìm thấy ứng viên phù hợp với tiêu chí lọc.</p>
            </div>
          )}
        </section>
      </div>

      {/* Profile Detail Modal */}
      {activeCandidate && (
        <AccessibleModal
          isOpen={!!activeCandidate}
          onClose={() => setActiveCandidate(null)}
          title={`Hồ sơ ứng viên: ${activeCandidate.name}`}
        >
          <div className="space-y-6 text-gray-800">
            {/* Header info */}
            <div className="border-b border-gray-150 pb-4">
              <h3 className="text-xl font-extrabold text-gray-900">{activeCandidate.name}</h3>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide mt-1">{activeCandidate.title}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mt-4">
                <p className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-emerald-600" /> {activeCandidate.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-600" /> {activeCandidate.phone}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-600" /> {activeCandidate.province}</p>
                <p className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-emerald-600" /> Kinh nghiệm: {activeCandidate.experience}</p>
              </div>
            </div>

            {/* Introduction */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Giới thiệu bản thân</h4>
              <p className="text-sm text-gray-650 leading-relaxed text-justify bg-gray-50 p-4 rounded-xl border border-gray-150">
                {activeCandidate.bio}
              </p>
            </div>

            {/* Education */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Học vấn</h4>
              <div className="border border-gray-150 rounded-xl p-4 bg-gray-50/20">
                <p className="text-sm font-bold text-gray-900">{activeCandidate.education}</p>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">GPA: {activeCandidate.gpa}</p>
              </div>
            </div>

            {/* Kỹ năng */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Kỹ năng nổi bật</h4>
              <div className="flex flex-wrap gap-2">
                {activeCandidate.skills.map(skill => (
                  <span key={skill} className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-150">
              <a
                href={`mailto:${activeCandidate.email}`}
                className="btn-primary text-xs py-2.5 px-6 flex-1 text-center"
              >
                Gửi email liên hệ
              </a>
              <button
                type="button"
                onClick={() => alert('Hồ sơ ứng viên đã được lưu vào hệ thống của bạn!')}
                className="btn-secondary text-xs py-2.5 px-6"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </AccessibleModal>
      )}
    </main>
  );
}
