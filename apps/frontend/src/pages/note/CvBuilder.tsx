import { useState } from 'react';
import { User, Briefcase, GraduationCap, Code, FileText, Printer, Plus, Trash } from 'lucide-react';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  duration: string;
  gpa: string;
}

export default function CvBuilder() {
  const [personal, setPersonal] = useState({
    name: 'Nguyễn Văn A',
    title: 'Kỹ Sư Phần Mềm Full Stack',
    email: 'nguyenvana@email.com',
    phone: '090 123 4567',
    address: 'Quận 1, TP. Hồ Chí Minh',
    summary: 'Lập trình viên với hơn 3 năm kinh nghiệm phát triển các ứng dụng web quy mô lớn sử dụng React, Node.js và PostgreSQL. Đam mê tối ưu hóa hiệu năng ứng dụng và xây dựng trải nghiệm người dùng đạt chuẩn tiếp cận WCAG 2.2.'
  });

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: '1',
      company: 'Công ty Cổ phần Công nghệ ABC',
      role: 'Senior Frontend Developer',
      duration: '06/2024 - Hiện tại',
      description: 'Chịu trách nhiệm phát triển và duy trì hệ thống quản lý tuyển dụng. Tối ưu hóa tốc độ tải trang tăng 40% và dẫn dắt đội ngũ 4 lập trình viên chuyển đổi hệ thống sang kiến trúc micro-frontends.'
    },
    {
      id: '2',
      company: 'Tập đoàn Giải pháp phần mềm XYZ',
      role: 'Software Engineer',
      duration: '01/2022 - 05/2024',
      description: 'Xây dựng các RESTful API bảo mật cao bằng Node.js và Express. Cộng tác chặt chẽ với đội ngũ thiết kế UI/UX để hiện thực hóa các chức năng web tương tác cao đạt chuẩn WCAG AA.'
    }
  ]);

  const [educations, setEducations] = useState<EducationItem[]>([
    {
      id: '1',
      school: 'Đại học Bách Khoa TP.HCM',
      degree: 'Cử nhân Khoa học Máy tính',
      duration: '2017 - 2021',
      gpa: '3.6 / 4.0'
    }
  ]);

  const [skills, setSkills] = useState<string>('React, React Native, TypeScript, Node.js, Express, PostgreSQL, Docker, Git, WCAG 2.2, TailwindCSS');

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonal(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: ''
    };
    setExperiences(prev => [...prev, newItem]);
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperiences(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(prev => prev.filter(item => item.id !== id));
  };

  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      duration: '',
      gpa: ''
    };
    setEducations(prev => [...prev, newItem]);
  };

  const handleEducationChange = (id: string, field: keyof EducationItem, value: string) => {
    setEducations(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveEducation = (id: string) => {
    setEducations(prev => prev.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 py-8 md:py-12 print:p-0">
      {/* Hide controls when printing */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 print:hidden">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Công Cụ Viết CV Chuyên Nghiệp
          </h1>
          <p className="text-gray-600 mt-2">
            Nhập thông tin bên trái và xem bản in chuẩn thiết kế ở bên phải. Nhấn In để lưu trực tiếp thành tệp PDF.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-primary flex items-center gap-2 shadow-sm focus-visible:ring-4 focus-visible:ring-emerald-200"
          aria-label="In hoặc tải CV dưới dạng PDF"
        >
          <Printer className="w-5 h-5" aria-hidden="true" />
          <span>In / Lưu PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Forms (5 cols) - Hidden in print */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Personal Info */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" aria-labelledby="section-personal">
            <h2 id="section-personal" className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Thông tin cá nhân
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cv-name" className="block text-sm font-semibold text-gray-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  id="cv-name"
                  name="name"
                  value={personal.name}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium"
                />
              </div>
              <div>
                <label htmlFor="cv-title" className="block text-sm font-semibold text-gray-700 mb-1">Vị trí công việc</label>
                <input
                  type="text"
                  id="cv-title"
                  name="title"
                  value={personal.title}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cv-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="cv-email"
                    name="email"
                    value={personal.email}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="cv-phone" className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    id="cv-phone"
                    name="phone"
                    value={personal.phone}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cv-address" className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  id="cv-address"
                  name="address"
                  value={personal.address}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium"
                />
              </div>
              <div>
                <label htmlFor="cv-summary" className="block text-sm font-semibold text-gray-700 mb-1">Tóm tắt mục tiêu / giới thiệu</label>
                <textarea
                  id="cv-summary"
                  name="summary"
                  rows={4}
                  value={personal.summary}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium resize-y"
                />
              </div>
            </div>
          </section>

          {/* Work Experience */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" aria-labelledby="section-work">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h2 id="section-work" className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                Kinh nghiệm làm việc
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mới
              </button>
            </div>
            
            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="border border-gray-150 rounded-xl p-4 relative bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none"
                    aria-label={`Xóa kinh nghiệm làm việc ${idx + 1}`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`exp-company-${exp.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Tên công ty</label>
                        <input
                          type="text"
                          id={`exp-company-${exp.id}`}
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor={`exp-role-${exp.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Chức danh / Vị trí</label>
                        <input
                          type="text"
                          id={`exp-role-${exp.id}`}
                          value={exp.role}
                          onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`exp-duration-${exp.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Thời gian làm việc</label>
                      <input
                        type="text"
                        id={`exp-duration-${exp.id}`}
                        value={exp.duration}
                        onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        placeholder="Ví dụ: 06/2024 - Hiện tại"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exp-desc-${exp.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Mô tả công việc</label>
                      <textarea
                        id={`exp-desc-${exp.id}`}
                        rows={3}
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" aria-labelledby="section-edu">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h2 id="section-edu" className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                Học vấn
              </h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mới
              </button>
            </div>
            
            <div className="space-y-6">
              {educations.map((edu, idx) => (
                <div key={edu.id} className="border border-gray-150 rounded-xl p-4 relative bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none"
                    aria-label={`Xóa học vấn ${idx + 1}`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`edu-school-${edu.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Tên trường</label>
                        <input
                          type="text"
                          id={`edu-school-${edu.id}`}
                          value={edu.school}
                          onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor={`edu-degree-${edu.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Bằng cấp / Ngành học</label>
                        <input
                          type="text"
                          id={`edu-degree-${edu.id}`}
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`edu-duration-${edu.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Thời gian học</label>
                        <input
                          type="text"
                          id={`edu-duration-${edu.id}`}
                          value={edu.duration}
                          onChange={(e) => handleEducationChange(edu.id, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor={`edu-gpa-${edu.id}`} className="block text-xs font-semibold text-gray-650 mb-1">Điểm số / GPA</label>
                        <input
                          type="text"
                          id={`edu-gpa-${edu.id}`}
                          value={edu.gpa}
                          onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" aria-labelledby="section-skills">
            <h2 id="section-skills" className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Code className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Kỹ năng
            </h2>
            <div>
              <label htmlFor="cv-skills" className="block text-sm font-semibold text-gray-700 mb-2">
                Các kỹ năng của bạn (cách nhau bằng dấu phẩy)
              </label>
              <textarea
                id="cv-skills"
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm font-medium resize-y"
                placeholder="Ví dụ: React, TypeScript, Node.js"
              />
            </div>
          </section>
        </div>

        {/* Right Preview (7 cols) - Re-styled for screen printing */}
        <section className="lg:col-span-7 bg-white border border-gray-300 rounded-2xl shadow-lg overflow-hidden p-8 md:p-12 print:border-none print:shadow-none print:p-0 min-h-[1100px]" aria-label="Bản xem trước CV">
          {/* CV Template Layout */}
          <div className="flex flex-col h-full text-gray-800">
            {/* Header */}
            <div className="border-b-4 border-emerald-700 pb-6 mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{personal.name || 'HỌ VÀ TÊN'}</h2>
              <p className="text-base font-bold text-emerald-700 uppercase tracking-wide mt-1">{personal.title || 'VỊ TRÍ CÔNG VIỆC'}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-550 mt-4">
                {personal.email && <p>✉️ Email: {personal.email}</p>}
                {personal.phone && <p>📞 Điện thoại: {personal.phone}</p>}
                {personal.address && <p>📍 Địa chỉ: {personal.address}</p>}
              </div>
            </div>

            {/* Objective / Summary */}
            {personal.summary && (
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                  Mục tiêu nghề nghiệp
                </h3>
                <p className="text-sm text-gray-650 leading-relaxed text-justify">{personal.summary}</p>
              </div>
            )}

            {/* Work Experience Preview */}
            {experiences.length > 0 && experiences.some(exp => exp.company || exp.role) && (
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                  Kinh nghiệm làm việc
                </h3>
                <div className="space-y-4">
                  {experiences.filter(exp => exp.company || exp.role).map((exp) => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <h4 className="font-bold text-sm text-gray-900">{exp.role || 'Chức danh'} tại <span className="text-emerald-700">{exp.company || 'Tên công ty'}</span></h4>
                        <span className="text-xs text-gray-500 font-semibold italic">{exp.duration}</span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-600 leading-relaxed mt-1 whitespace-pre-line text-justify pl-3 border-l-2 border-emerald-50">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Preview */}
            {educations.length > 0 && educations.some(edu => edu.school || edu.degree) && (
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                  Học vấn
                </h3>
                <div className="space-y-3">
                  {educations.filter(edu => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{edu.degree || 'Ngành học'}</h4>
                        <p className="text-xs font-semibold text-emerald-700">{edu.school || 'Trường học'}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 font-semibold italic">{edu.duration}</p>
                        {edu.gpa && <p className="text-xs text-gray-500 font-bold">GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Preview */}
            {skills.trim() && (
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Code className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                  Kỹ năng chuyên môn
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.split(',').map((skill, index) => {
                    const sk = skill.trim();
                    if (!sk) return null;
                    return (
                      <span key={index} className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg print:border print:border-gray-200">
                        {sk}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
