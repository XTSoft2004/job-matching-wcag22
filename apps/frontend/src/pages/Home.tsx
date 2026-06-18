import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Briefcase,
  Mic,
  MicOff,
  AlertCircle,
  Zap,
  Flame,
  Heart,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Check
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: { 
    name: string;
    logo?: string | null;
  };
  province: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const selectedProvinceRef = useRef('');

  useEffect(() => {
    selectedProvinceRef.current = selectedProvince;
  }, [selectedProvince]);

  // Custom states for the new TopCV visual UI
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Suggested keywords
  const suggestions = ['Điều dưỡng viên', 'Kế toán', 'Nhân viên kinh doanh', 'Công nghệ thông tin', 'Giao hàng'];

  // Slideshow data
  const slides = [
    {
      title: "Tìm Kiếm Bằng Giọng Nói AI",
      desc: "Hỗ trợ người khuyết tật tìm kiếm việc làm bằng cách nói tự nhiên. Trải nghiệm tìm kiếm không giới hạn.",
      badge: "Voice Search",
      color: "from-emerald-500 to-green-600"
    },
    {
      title: "Gợi Ý Việc Làm Cá Nhân Hóa",
      desc: "Hệ thống AI phân tích và đề xuất các vị trí phù hợp nhất dựa trên từ khóa tìm kiếm của bạn.",
      badge: "AI Powered",
      color: "from-teal-500 to-emerald-600"
    },
    {
      title: "Đạt Chuẩn Tiếp Cận WCAG 2.2",
      desc: "Giao diện độ tương phản cao, hỗ trợ đọc màn hình, phím tắt điều hướng và kích thước nút bấm chuẩn.",
      badge: "Accessibility",
      color: "from-emerald-600 to-green-700"
    }
  ];

  // Countdown timer for Lightning Badge ("Huy hiệu tia sét")
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 59, seconds: 59 });

  // Auto carousel slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 0, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingError(null);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecordingError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
        } else if (event.error === 'no-speech') {
          setRecordingError('Không nghe thấy giọng nói. Hãy thử nói lại rõ ràng hơn.');
        } else {
          setRecordingError(`Lỗi nhận dạng: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript || '';
        console.log('Transcribed Text (Web Speech API):', text);
        if (text.trim()) {
          setSearchQuery(text);
          const params = new URLSearchParams();
          params.append('q', text.trim());
          if (selectedProvinceRef.current) params.append('province', selectedProvinceRef.current);
          navigate(`/jobs?${params.toString()}`);
        } else {
          setRecordingError('Không thể nhận dạng giọng nói. Hãy thử nói rõ ràng hơn.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Fetch all jobs initially
  const fetchJobs = (query: string = '', province: string = selectedProvince) => {
    setLoading(true);
    // Request a large limit (e.g. 1000) so we can do premium client-side sorting & tab filtering
    const url = query
      ? `/jobs?search=${encodeURIComponent(query)}&limit=1000`
      : '/jobs?limit=1000';

    api.get(url)
      .then((res: any) => {
        let fetchedJobs = res.data || [];


        // Filter by province on client side if set
        if (province) {
          fetchedJobs = fetchedJobs.filter((job: any) =>
            job.province && job.province.toLowerCase().includes(province.toLowerCase())
          );
        }
        setJobs(fetchedJobs);
        setCurrentPage(1);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs('', '');
    document.title = "JobAccess - Tìm Việc Làm Nhanh 24h & Tuyển Dụng Hỗ Trợ Người Khuyết Tật";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "JobAccess - Cổng tuyển dụng và tìm kiếm việc làm bằng giọng nói AI thông minh hỗ trợ người khuyết tật, khiếm thị hàng đầu Việt Nam.");
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedProvince) params.append('province', selectedProvince);
    navigate(`/jobs?${params.toString()}`);
  };



  // Start Voice Recording
  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    } else {
      setRecordingError('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói Web Speech API (khuyên dùng Chrome hoặc Edge).');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle job save/favorite
  const toggleFavorite = (id: number) => {
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter(favId => favId !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Quick suggestion click
  const handleSuggestionClick = (kw: string) => {
    setSearchQuery(kw);
  };

  // Get active jobs list for "Việc làm tốt nhất"
  const getFeaturedJobs = () => {
    let list = jobs;
    if (activeTab === 'Hà Nội') {
      list = jobs.filter(j => j.province && j.province.toLowerCase().includes('hà nội'));
    } else if (activeTab === 'TP. Hồ Chí Minh') {
      list = jobs.filter(j => j.province && j.province.toLowerCase().includes('hồ chí minh'));
    } else if (activeTab === 'Khác') {
      list = jobs.filter(j => j.province && !j.province.toLowerCase().includes('hà nội') && !j.province.toLowerCase().includes('hồ chí minh'));
    }
    return list.slice(0, 6);
  };

  // Get pagination items for "Việc làm hấp dẫn"
  const attractivePageSize = 6;
  const totalAttractivePages = Math.ceil(jobs.length / attractivePageSize) || 1;
  const getAttractiveJobs = () => {
    const startIdx = (currentPage - 1) * attractivePageSize;
    return jobs.slice(startIdx, startIdx + attractivePageSize);
  };

  // Format Salary
  const formatSalary = (job: Job) => {
    if (job.isSalaryNegotiable) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(0)}Tr - ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    }
    if (job.salaryMin) {
      return `Từ ${(job.salaryMin / 1000000).toFixed(0)}Tr`;
    }
    if (job.salaryMax) {
      return `Đến ${(job.salaryMax / 1000000).toFixed(0)}Tr`;
    }
    return 'Lương cạnh tranh';
  };

  const featuredList = getFeaturedJobs();
  const attractiveList = getAttractiveJobs();

  return (
    <div className="space-y-16 animate-fade-in text-gray-800 font-sans">
      {/* 1. HERO BANNER & SEARCH CONTAINER */}
      <section className="bg-gradient-to-br from-green-950 via-emerald-900 to-green-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 border border-emerald-800/40">

        {/* Left Search Info Box */}
        <div className="flex-1 w-full space-y-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Tìm việc làm nhanh 24h,<br className="hidden sm:inline" />
            <span className="text-emerald-400">việc làm mới nhất</span> toàn quốc
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl">
            Tiếp cận cơ hội nghề nghiệp uy tín và chất lượng. Hệ thống chuẩn WCAG 2.2 hỗ trợ tìm kiếm bằng giọng nói dễ dàng.
          </p>

          {/* Premium TopCV styled Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 w-full border border-gray-100 text-gray-900"
          >
            {/* Keyword Input */}
            <div className="flex-grow flex items-center py-1.5 px-2 relative">
              <Search className="h-5 w-5 text-gray-400 mr-2 shrink-0" aria-hidden="true" />
              <label htmlFor="search-jobs" className="sr-only">Từ khóa tìm kiếm</label>
              <input
                id="search-jobs"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-medium text-gray-800 outline-none placeholder-gray-400 pr-10 focus:ring-2 focus:ring-emerald-500 rounded"
                placeholder="Tên công việc, từ khóa hoặc tên công ty..."
              />

              {/* Voice search button inside search input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 ${isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  aria-label={isRecording ? 'Dừng ghi âm tìm kiếm' : 'Tìm kiếm bằng giọng nói'}
                  aria-pressed={isRecording}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              <Search className="h-5 w-5" />
              Tìm kiếm
            </button>
          </form>

          {/* Voice recording progress / errors */}
          <div aria-live="polite" className="space-y-3">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-900/50 py-2.5 px-4 rounded-xl max-w-md animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                <span className="text-sm font-semibold">Đang lắng nghe... Vui lòng nói từ khóa tìm kiếm.</span>
              </div>
            )}

            {recordingError && (
              <div className="flex items-center gap-2 text-yellow-300 bg-yellow-950/40 border border-yellow-900/50 py-2.5 px-4 rounded-xl max-w-md">
                <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                <span className="text-sm">{recordingError}</span>
              </div>
            )}
          </div>

          {/* Suggestions keywords */}
          <div className="flex flex-wrap items-center gap-2 text-sm pt-2">
            <span className="text-gray-300">Gợi ý tìm kiếm:</span>
            {suggestions.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleSuggestionClick(kw)}
                className="bg-emerald-800/50 hover:bg-emerald-800 text-emerald-200 hover:text-white px-3 py-1 rounded-full transition-colors border border-emerald-700/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Right Slideshow Promo Box */}
        <div className="w-full lg:w-80 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between h-64 relative z-10 text-left">
          <div className="space-y-4">
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              {slides[carouselIndex].badge}
            </span>
            <h3 className="text-xl font-bold text-white leading-tight">
              {slides[carouselIndex].title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
              {slides[carouselIndex].desc}
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${idx === carouselIndex ? 'w-5 bg-emerald-400' : 'w-2 bg-white/40'}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCarouselIndex((carouselIndex - 1 + slides.length) % slides.length)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Slide trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCarouselIndex((carouselIndex + 1) % slides.length)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Slide tiếp"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative backdrop bubbles */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-700/30 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-green-500/20 blur-3xl"></div>
        </div>
      </section>

      {/* 2. FEATURED JOBS SECTION ("Việc làm tốt nhất") */}
      <section className="space-y-6" aria-labelledby="featured-jobs-heading">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div className="space-y-1">
            <h2 id="featured-jobs-heading" className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center">
              Việc làm tốt nhất
              <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Zap className="h-3 w-3 text-emerald-600 fill-emerald-600" />
                AI Powered
              </span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">Hệ thống phân tích gợi ý việc làm hấp dẫn phù hợp với hồ sơ ứng tuyển của bạn</p>
          </div>
          <button
            onClick={() => { navigate('/jobs'); }}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-sm hover:underline"
          >
            Xem tất cả việc làm tốt nhất &gt;
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Khác'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${activeTab === tab
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-gray-500 font-bold text-sm">{jobs.length} việc làm phù hợp</span>
        </div>

        {/* Jobs Grid loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-20" aria-busy="true" aria-label="Đang tải dữ liệu công việc">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-b-emerald-600"></div>
          </div>
        ) : featuredList.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 text-lg font-bold">Không tìm thấy công việc phù hợp tại địa điểm này.</p>
            <button
              onClick={() => { setActiveTab('Tất cả'); setSelectedProvince(''); setSearchQuery(''); fetchJobs('', ''); }}
              className="mt-4 text-emerald-700 font-semibold hover:underline"
            >
              Xem tất cả việc làm có sẵn
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredList.map((job) => {
              const isFav = favorites.includes(job.id);
              return (
                <article
                  key={job.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative focus-within:ring-2 focus-within:ring-emerald-500"
                  aria-labelledby={`featured-job-title-${job.id}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-lg flex items-center justify-center shrink-0 border border-emerald-100/50 overflow-hidden"
                      aria-hidden="true"
                    >
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt="" className="h-full w-full object-contain" />
                      ) : (
                        job.company?.name?.charAt(0).toUpperCase() || 'C'
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 mb-1">
                        TIN MỚI
                      </span>
                      <h3 id={`featured-job-title-${job.id}`} className="font-bold text-gray-900 leading-tight hover:text-emerald-700 transition-colors line-clamp-2 pr-6">
                        <Link to={`/jobs/${job.id}`} className="focus:outline-none before:absolute before:inset-0">
                          {job.title}
                        </Link>
                      </h3>
                      <p className="text-gray-500 text-xs font-semibold truncate mt-1">{job.company?.name}</p>
                    </div>
                  </div>

                  {/* Badges info */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatSalary(job)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {job.province || 'Toàn quốc'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {job.jobType}
                    </span>
                  </div>

                  {/* Save Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(job.id);
                    }}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={isFav ? "Hủy lưu việc làm" : "Lưu việc làm"}
                    aria-pressed={isFav}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SPLIT SECTION - VIỆC LÀM HẤP DẪN & SIDEBAR (HUY HIỆU TIA SÉT & VIỆC PHỔ THÔNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column (2/3 width) - Attractive Jobs List */}
        <section className="lg:col-span-2 space-y-6" aria-labelledby="attractive-jobs-heading">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 id="attractive-jobs-heading" className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
              Việc làm hấp dẫn
              <Flame className="ml-2 h-6 w-6 text-orange-500 fill-orange-500" />
            </h2>

            {/* Simple page pagination layout */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-bold">{currentPage} / {totalAttractivePages} trang</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalAttractivePages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalAttractivePages))}
                  className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === totalAttractivePages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Trang tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid list of attractive jobs */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-b-emerald-600"></div>
            </div>
          ) : attractiveList.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-bold">Không tìm thấy công việc phù hợp nào khác.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {attractiveList.map((job) => {
                const isFav = favorites.includes(job.id);
                return (
                  <article
                    key={job.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-200 flex flex-col relative focus-within:ring-2 focus-within:ring-emerald-500"
                    aria-labelledby={`attractive-job-title-${job.id}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-base flex items-center justify-center shrink-0 border border-emerald-100/50 overflow-hidden"
                        aria-hidden="true"
                      >
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt="" className="h-full w-full object-contain" />
                        ) : (
                          job.company?.name?.charAt(0).toUpperCase() || 'C'
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 id={`attractive-job-title-${job.id}`} className="font-bold text-gray-900 leading-tight hover:text-emerald-700 transition-colors line-clamp-2 pr-6">
                          <Link to={`/jobs/${job.id}`} className="focus:outline-none before:absolute before:inset-0">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-gray-500 text-xs font-semibold truncate mt-1">{job.company?.name}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {formatSalary(job)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {job.province || 'Toàn quốc'}
                      </span>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(job.id);
                      }}
                      className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={isFav ? "Hủy lưu việc làm" : "Lưu việc làm"}
                      aria-pressed={isFav}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column (1/3 width) - Sidebar Widgets */}
        <aside className="space-y-6" aria-label="Sidebar hỗ trợ">

          {/* Widget A: Huy hiệu tia sét (Active HR ticker) */}
          <div className="bg-gradient-to-br from-[#005227] to-[#003B1E] text-white rounded-3xl p-6 shadow-md border border-emerald-950/20 relative overflow-hidden text-left">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-bounce" />
              <h3 className="font-extrabold text-lg">HUY HIỆU TIA SÉT</h3>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed mb-4">
              Nhà tuyển dụng phản hồi nhanh chóng và tích cực tương tác với hồ sơ ứng tuyển của ứng viên trong vòng 24 giờ.
            </p>

            <div className="bg-emerald-950/60 border border-emerald-900 rounded-xl p-3.5 space-y-2 mb-4">
              <p className="text-yellow-400 font-bold text-xs uppercase tracking-wide">TỰ ĐỘNG CẬP NHẬT SAU</p>
              <div className="flex items-center gap-2 font-mono text-2xl font-black">
                <span className="bg-emerald-900 px-2 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-emerald-900 px-2 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-emerald-900 px-2 py-0.5 rounded text-white text-emerald-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="bg-white/10 border border-white/5 rounded-xl p-3 text-xs flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span><strong>3.721</strong> tin đăng đã phản hồi</span>
              </span>
              <span className="text-emerald-300 font-bold">Xem ngay &gt;</span>
            </div>
          </div>

          {/* Widget B: Việc làm phổ thông thu nhập cao */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left">
            <h3 className="font-black text-gray-900 text-base mb-4 border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <span>VIỆC PHỔ THÔNG THU NHẬP CAO</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="text-emerald-600 h-4 w-4 shrink-0" />
                <span>Nhân viên giao nhận hàng nhanh</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-emerald-600 h-4 w-4 shrink-0" />
                <span>Tài xế công nghệ xe máy / ô tô</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-emerald-600 h-4 w-4 shrink-0" />
                <span>Nhân viên phụ bếp / phục vụ nhà hàng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✔</span>
                <span>Nhân viên trực tổng đài điện thoại</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => handleSuggestionClick('Nhân viên')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              KHÁM PHÁ NGAY
            </button>
          </div>
        </aside>
      </div>

      {/* 6. HOTLINE & ASSISTANCE SECTION */}
      <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 border-l-4 border-l-emerald-600 text-left">
        <div className="space-y-3">
          <h3 className="text-xl font-black text-gray-900">Tìm việc khó đã có JobAccess đồng hành!</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
            Đội ngũ hỗ trợ ứng viên luôn sẵn sàng giải đáp thắc mắc, trợ giúp các vấn đề kỹ thuật và tư vấn chỉnh sửa hồ sơ CV miễn phí cho người dùng khiếm thị / khuyết tật.
          </p>
          <div className="text-sm font-semibold text-gray-600 flex flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span>Email hỗ trợ: <a href="mailto:hotro@jobmatch.vn" className="text-emerald-700 hover:underline">hotro@jobmatch.vn</a></span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Văn phòng chính: Cầu Giấy, Hà Nội</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <a
            href="tel:1900068889"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors text-center text-base focus:outline-none focus:ring-4 focus:ring-emerald-200 flex items-center justify-center gap-2"
          >
            <Phone className="h-5 w-5" />
            <span>GỌI HỖ TRỢ: 1900 068 889</span>
          </a>
        </div>
      </section>
    </div>
  );
}
