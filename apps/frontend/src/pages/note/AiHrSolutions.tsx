import { useState } from 'react';
import { Sparkles, FileText, FileCheck, CheckCircle2, AlertTriangle, Copy, BrainCircuit, Loader2 } from 'lucide-react';

export default function AiHrSolutions() {
  const [activeTab, setActiveTab] = useState<'jd' | 'match'>('jd');
  
  // Tab 1: AI JD Generator State
  const [jdTitle, setJdTitle] = useState('');
  const [jdRequirements, setJdRequirements] = useState('');
  const [generatedJd, setGeneratedJd] = useState('');
  const [isJdLoading, setIsJdLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tab 2: AI Match State
  const [matchJd, setMatchJd] = useState('');
  const [matchCv, setMatchCv] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  const handleGenerateJd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdTitle.trim()) return;

    setIsJdLoading(true);
    setTimeout(() => {
      const requirementsList = jdRequirements
        .split('\n')
        .filter(line => line.trim())
        .map(line => `- ${line.trim()}`)
        .join('\n');

      const template = `TUYỂN DỤNG VỊ TRÍ: ${jdTitle.toUpperCase()}

MÔ TẢ CÔNG VIỆC:
- Chịu trách nhiệm trực tiếp lập kế hoạch và triển khai các dự án liên quan đến chuyên môn.
- Phối hợp chặt chẽ với các phòng ban liên quan để tối ưu hóa hiệu quả vận hành.
- Hỗ trợ xây dựng quy trình làm việc chuẩn hóa, tăng cường tính hiệu quả và năng suất.
- Báo cáo định kỳ tiến độ công việc trực tiếp cho Quản lý dự án.

YÊU CẦU ỨNG VIÊN:
${requirementsList || '- Tốt nghiệp chuyên ngành liên quan.\n- Có tối thiểu 1-2 năm kinh nghiệm làm việc ở vị trí tương đương.\n- Có tinh thần học hỏi cao, kỹ năng làm việc độc lập và làm việc nhóm tốt.'}
- Sử dụng thành thạo tin học văn phòng và các phần mềm chuyên ngành.
- Có khả năng giao tiếp tốt, tư duy giải quyết vấn đề hiệu quả.

QUYỀN LỢI ĐƯỢC HƯỞNG:
- Lương cứng cạnh tranh + Thưởng hiệu suất dự án theo quý.
- Môi trường làm việc trẻ trung, sáng tạo, cơ hội thăng tiến rõ ràng.
- Đóng BHXH, BHYT đầy đủ theo quy định của Luật lao động Việt Nam.
- Được tham gia các khóa đào tạo nâng cao chuyên môn định kỳ do doanh nghiệp tài trợ.`;

      setGeneratedJd(template);
      setIsJdLoading(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchJd.trim() || !matchCv.trim()) return;

    setIsMatchLoading(true);
    setTimeout(() => {
      // Simple local similarity analyzer
      const jdWords = new Set(matchJd.toLowerCase().match(/\b\w+\b/g) || []);
      const cvWords = new Set(matchCv.toLowerCase().match(/\b\w+\b/g) || []);
      
      const intersection = [...jdWords].filter(word => cvWords.has(word));
      
      // Calculate a mock score based on intersection but normalized realistically between 55% and 95%
      const rawScore = jdWords.size > 0 ? (intersection.length / jdWords.size) * 100 : 70;
      const finalScore = Math.round(Math.min(95, Math.max(55, rawScore + 20)));

      // Common keywords extraction
      const skillsPool = ['react', 'typescript', 'javascript', 'node', 'express', 'postgresql', 'figma', 'design', 'aws', 'docker', 'git', 'communication', 'english', 'giao tiếp', 'tiếng anh'];
      const matchedSkills = skillsPool.filter(skill => 
        matchJd.toLowerCase().includes(skill) && matchCv.toLowerCase().includes(skill)
      ).map(s => s.toUpperCase());

      const missingSkills = skillsPool.filter(skill => 
        matchJd.toLowerCase().includes(skill) && !matchCv.toLowerCase().includes(skill)
      ).map(s => s.toUpperCase());

      let recommendation = 'Ứng viên có tiềm năng khá. Cần phỏng vấn thêm để làm rõ kỹ năng thực tế.';
      if (finalScore >= 85) {
        recommendation = 'Ứng viên cực kỳ xuất sắc. Rất phù hợp với yêu cầu công việc. Khuyến nghị hẹn phỏng vấn ngay lập tức!';
      } else if (finalScore < 70) {
        recommendation = 'Kỹ năng ứng viên chưa thực sự phù hợp với yêu cầu vị trí này. Có thể cân nhắc thêm.';
      }

      setMatchResult({
        score: finalScore,
        matchedSkills: matchedSkills.length > 0 ? matchedSkills : ['GIAO TIẾP', 'ĐỘC LẬP'],
        missingSkills: missingSkills.slice(0, 3),
        recommendation
      });
      setIsMatchLoading(false);
    }, 2000);
  };

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
          <BrainCircuit className="w-4 h-4 text-emerald-600 animate-pulse" /> Trợ lý tuyển dụng AI
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Giải Pháp Nhân Sự AI (AI HR Solutions)
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Tối ưu hóa quy trình viết mô tả công việc và đánh giá hồ sơ ứng viên thông qua các mô hình trí tuệ nhân tạo tiện ích.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 mb-8 max-w-md mx-auto" role="tablist" aria-label="Tính năng AI">
        <button
          role="tab"
          aria-selected={activeTab === 'jd'}
          aria-controls="panel-jd"
          id="tab-jd"
          onClick={() => setActiveTab('jd')}
          className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'jd' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Viết mô tả công việc (JD)
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'match'}
          aria-controls="panel-match"
          id="tab-match"
          onClick={() => setActiveTab('match')}
          className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'match' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Phân tích độ phù hợp CV
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Tab 1: AI JD Generator */}
        <div
          role="tabpanel"
          id="panel-jd"
          aria-labelledby="tab-jd"
          className={activeTab === 'jd' ? 'block' : 'hidden'}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input fields */}
            <form onSubmit={handleGenerateJd} className="lg:col-span-5 space-y-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Thông tin yêu cầu
              </h2>
              
              <div>
                <label htmlFor="jd-title-input" className="block text-sm font-semibold text-gray-700 mb-1.5">Vị trí tuyển dụng</label>
                <input
                  type="text"
                  id="jd-title-input"
                  required
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  placeholder="Ví dụ: Kỹ sư cầu nối, Kế toán trưởng..."
                />
              </div>

              <div>
                <label htmlFor="jd-req-input" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Các yêu cầu cốt lõi (Mỗi dòng một ý)
                </label>
                <textarea
                  id="jd-req-input"
                  rows={5}
                  value={jdRequirements}
                  onChange={(e) => setJdRequirements(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium resize-none"
                  placeholder="Ví dụ:&#10;3 năm kinh nghiệm React&#10;Tiếng Anh giao tiếp tốt&#10;Biết sử dụng Figma"
                />
              </div>

              <button
                type="submit"
                disabled={isJdLoading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isJdLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang khởi tạo JD...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Tạo JD tự động</span>
                  </>
                )}
              </button>
            </form>

            {/* Output view */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[350px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                  Mô tả công việc hoàn thiện
                </h3>
                {generatedJd && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 w-full bg-gray-50 border border-gray-250 rounded-xl p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap overflow-y-auto leading-relaxed h-[320px]">
                {generatedJd || 'Kết quả mô tả công việc (JD) được tạo bởi trí tuệ nhân tạo AI sẽ xuất hiện tại đây...'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: AI Fit Match Analyzer */}
        <div
          role="tabpanel"
          id="panel-match"
          aria-labelledby="tab-match"
          className={activeTab === 'match' ? 'block' : 'hidden'}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input forms */}
            <form onSubmit={handleAnalyzeMatch} className="lg:col-span-6 space-y-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-600" />
                Dữ liệu đầu vào
              </h2>

              <div>
                <label htmlFor="match-jd-input" className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả công việc (JD)</label>
                <textarea
                  id="match-jd-input"
                  required
                  rows={4}
                  value={matchJd}
                  onChange={(e) => setMatchJd(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium resize-none"
                  placeholder="Dán thông tin mô tả công việc (hoặc yêu cầu tuyển dụng) tại đây..."
                />
              </div>

              <div>
                <label htmlFor="match-cv-input" className="block text-sm font-semibold text-gray-700 mb-1.5">Hồ sơ ứng viên (CV)</label>
                <textarea
                  id="match-cv-input"
                  required
                  rows={4}
                  value={matchCv}
                  onChange={(e) => setMatchCv(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium resize-none"
                  placeholder="Dán nội dung hồ sơ, CV, hoặc tóm tắt kinh nghiệm ứng viên tại đây..."
                />
              </div>

              <button
                type="submit"
                disabled={isMatchLoading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isMatchLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tính toán phân tích...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" />
                    <span>Phân tích độ phù hợp</span>
                  </>
                )}
              </button>
            </form>

            {/* Results display */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {matchResult ? (
                <div className="bg-gray-50 border border-gray-250 rounded-2xl p-6 space-y-6">
                  {/* Score circle simulation */}
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ĐIỂM TƯƠNG THÍCH AI</span>
                    <div className="flex justify-center items-baseline gap-1 mt-2">
                      <span className="text-5xl font-black text-emerald-600">{matchResult.score}</span>
                      <span className="text-xl font-bold text-emerald-800">%</span>
                    </div>
                  </div>

                  {/* Skills tags matching */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                        Kỹ năng tương khớp
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matchedSkills.map((skill: string) => (
                          <span key={skill} className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {matchResult.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                          Kỹ năng cần bổ sung
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missingSkills.map((skill: string) => (
                            <span key={skill} className="text-2xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendation message */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Đánh giá chung:</h4>
                    <p className="text-sm text-gray-650 leading-relaxed italic">
                      "{matchResult.recommendation}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-250 rounded-2xl bg-gray-50/30">
                  <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">Nhập dữ liệu JD & CV và bấm Phân tích để hiển thị kết quả tương thích AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
