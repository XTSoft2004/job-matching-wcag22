import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import {
  Search,
  Briefcase,
  Mic,
  MicOff,
  AlertCircle,
  MapPin,
  Filter,
  RefreshCw,
  Heart,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Award,
  Layers
} from 'lucide-react';
import AccessibleModal from '../components/ui/AccessibleModal';


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
  industry?: string;
  experienceLevel?: string;
  description?: string;
  createdAt?: string;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || '');

  // Filter sidebar state
  const [filterIndustries, setFilterIndustries] = useState<string[]>(
    searchParams.get('industry') ? [searchParams.get('industry')!] : []
  );
  const [filterJobType, setFilterJobType] = useState<string>('Tất cả');
  const [filterExperience, setFilterExperience] = useState<string>('Tất cả');
  const [filterSalaryRange, setFilterSalaryRange] = useState<string>('Tất cả');
  const [customMinSalary, setCustomMinSalary] = useState<string>('');
  const [customMaxSalary, setCustomMaxSalary] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);


  // Sub-filter settings (Middle Content)
  const [matchType, setMatchType] = useState<'both' | 'title' | 'company'>('both');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'salary'>('relevance');

  // Job data state
  const [allFetchedJobs, setAllFetchedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVectorSearchUsed, setIsVectorSearchUsed] = useState(false);
  const pageSize = 10;

  // Favorites state
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Constants
  const provinces = [
    'Tất cả địa điểm',
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Thừa Thiên Huế',
    'Đà Nẵng',
    'Bình Dương',
    'Đồng Nai',
    'Hải Phòng',
    'Cần Thơ'
  ];

  const industriesList = [
    'Kinh doanh / Bán hàng',
    'Công nghệ thông tin',
    'Hành chính / Nhân sự',
    'Kế toán / Kiểm toán',
    'Y tế / Chăm sóc sức khỏe',
    'Khách sạn / Nhà hàng',
    'Marketing / Quảng cáo',
    'Khác'
  ];

  // Initialize Speech Recognition
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
        if (text.trim()) {
          setSearchQuery(text);
          triggerSearch(text, selectedProvince, selectedIndustry);
        } else {
          setRecordingError('Không thể nhận dạng giọng nói. Hãy thử nói rõ ràng hơn.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [selectedProvince, selectedIndustry]);

  // Trigger speech recording
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

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Perform fetching based on query params
  const fetchJobsData = async (query: string) => {
    setLoading(true);
    try {
      let jobsList: Job[] = [];
      let vectorUsed = false;

      if (query.trim()) {
        try {
          // Attempt AI Vector Search first
          console.log('Attempting AI Vector Search for:', query);
          const aiToolsUrl = import.meta.env.VITE_AI_TOOLS_URL || 'http://127.0.0.1:8000/api/v1';
          const vectorRes = await axios.post(`${aiToolsUrl}/jobs/search`, {
            query_text: query
          });
          const vectorData = vectorRes.data?.data || [];
          if (vectorData.length > 0) {
            const matchedIds = vectorData.map((item: any) => Number(item.job_id));
            const res: any = await api.get(`/jobs?ids=${matchedIds.join(',')}&limit=1000`);
            const fetchedJobs = res.data || [];
            
            // Sort by vector relevance rank
            jobsList = matchedIds
              .map((id: number) => fetchedJobs.find((job: any) => job.id === id))
              .filter((job: any): job is Job => !!job);
            
            vectorUsed = true;
          } else {
            // DB Fallback search
            const res: any = await api.get(`/jobs?search=${encodeURIComponent(query)}&limit=1000`);
            jobsList = res.data || [];
          }
        } catch (vectorErr) {
          console.warn('Vector Search failed, using normal search fallback:', vectorErr);
          const res: any = await api.get(`/jobs?search=${encodeURIComponent(query)}&limit=1000`);
          jobsList = res.data || [];
        }
      } else {
        // No keyword: fetch all jobs
        const res: any = await api.get('/jobs?limit=1000');
        jobsList = res.data || [];
      }

      setIsVectorSearchUsed(vectorUsed);
      setAllFetchedJobs(jobsList);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load search results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or search query change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const prov = searchParams.get('province') || '';
    const ind = searchParams.get('industry') || '';

    setSearchQuery(q);
    setSelectedProvince(prov);
    setSelectedIndustry(ind);

    // Sync initial industry filters with search input industry if present
    if (ind && !filterIndustries.includes(ind)) {
      setFilterIndustries([ind]);
    }

    fetchJobsData(q);
  }, [searchParams]);

  // Set page metadata dynamically
  useEffect(() => {
    const displayQuery = searchQuery ? `"${searchQuery}"` : "Hấp Dẫn";
    const displayLoc = selectedProvince && selectedProvince !== 'Tất cả địa điểm' ? ` tại ${selectedProvince}` : "";
    document.title = `Tìm Việc Làm ${displayQuery}${displayLoc} | JobAccess`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Tuyển dụng việc làm ${displayQuery}${displayLoc} chất lượng cao, phản hồi nhanh 24h. Tìm kiếm dễ dàng bằng giọng nói chuẩn WCAG 2.2.`);
    }
  }, [searchQuery, selectedProvince]);

  // Core Filter application
  useEffect(() => {
    let result = [...allFetchedJobs];

    // 1. Text & Location & Industry Searchbar matches
    if (selectedProvince && selectedProvince !== 'Tất cả địa điểm') {
      result = result.filter(
        (job) => job.province && job.province.toLowerCase().includes(selectedProvince.toLowerCase())
      );
    }

    // 2. Left Sidebar - Ngành nghề (Multiple checkboxes)
    if (filterIndustries.length > 0) {
      result = result.filter(
        (job) => job.industry && filterIndustries.some(ind => job.industry?.toLowerCase().includes(ind.toLowerCase()))
      );
    }

    // 3. Left Sidebar - Hình thức làm việc (Job Type)
    if (filterJobType !== 'Tất cả') {
      result = result.filter(
        (job) => job.jobType && job.jobType.toLowerCase().includes(filterJobType.toLowerCase())
      );
    }

    // 4. Left Sidebar - Kinh nghiệm (Experience Level)
    if (filterExperience !== 'Tất cả') {
      result = result.filter((job) => {
        if (!job.experienceLevel) return false;
        const exp = job.experienceLevel.toLowerCase();
        
        if (filterExperience === 'Chưa có kinh nghiệm') {
          return exp.includes('chưa') || exp.includes('không');
        }
        if (filterExperience === 'Dưới 1 năm') {
          return exp.includes('dưới 1') || exp.includes('chưa') || exp.includes('6 tháng');
        }
        if (filterExperience === '1 - 2 năm') {
          return exp.includes('1') || exp.includes('2') || exp.includes('1-2') || exp.includes('1 đến 2');
        }
        if (filterExperience === '2 - 5 năm') {
          return exp.includes('2') || exp.includes('3') || exp.includes('4') || exp.includes('5') || exp.includes('2-5');
        }
        if (filterExperience === 'Trên 5 năm') {
          return exp.includes('trên 5') || exp.includes('5 năm trở lên') || exp.includes('6') || exp.includes('7') || exp.includes('10');
        }
        return true;
      });
    }

    // 5. Left Sidebar - Mức lương (Salary Range)
    if (filterSalaryRange !== 'Tất cả') {
      result = result.filter((job) => {
        if (job.isSalaryNegotiable) return filterSalaryRange === 'Thỏa thuận';
        
        const min = job.salaryMin || 0;
        const max = job.salaryMax || 0;

        if (filterSalaryRange === 'Dưới 10 triệu') {
          return max > 0 && max <= 10000000;
        }
        if (filterSalaryRange === '10 - 15 triệu') {
          return (min >= 10000000 && min <= 15000000) || (max >= 10000000 && max <= 15000000);
        }
        if (filterSalaryRange === '15 - 20 triệu') {
          return (min >= 15000000 && min <= 20000000) || (max >= 15000000 && max <= 20000000);
        }
        if (filterSalaryRange === '20 - 25 triệu') {
          return (min >= 20000000 && min <= 25000000) || (max >= 20000000 && max <= 25000000);
        }
        if (filterSalaryRange === 'Trên 25 triệu') {
          return min >= 25000000 || max >= 25000000;
        }
        return true;
      });
    }

    // Custom Min/Max Salary input logic
    if (customMinSalary.trim() || customMaxSalary.trim()) {
      const minVal = parseFloat(customMinSalary) * 1000000 || 0;
      const maxVal = parseFloat(customMaxSalary) * 1000000 || Infinity;
      result = result.filter((job) => {
        if (job.isSalaryNegotiable) return true;
        const min = job.salaryMin || 0;
        const max = job.salaryMax || Infinity;
        return min >= minVal && max <= maxVal;
      });
    }

    // 6. Sub-filters - Tên việc làm / Tên công ty / Cả hai matching
    if (searchQuery.trim() && !isVectorSearchUsed) {
      result = result.filter((job) => {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(queryLower);
        const companyMatch = job.company?.name?.toLowerCase().includes(queryLower);
        
        if (matchType === 'title') return titleMatch;
        if (matchType === 'company') return companyMatch;
        return titleMatch || companyMatch;
      });
    }

    // 7. Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'salary') {
      result.sort((a, b) => {
        const salA = a.isSalaryNegotiable ? 0 : (a.salaryMax || a.salaryMin || 0);
        const salB = b.isSalaryNegotiable ? 0 : (b.salaryMax || b.salaryMin || 0);
        return salB - salA;
      });
    }

    setFilteredJobs(result);
    setCurrentPage(1);
  }, [
    allFetchedJobs,
    selectedProvince,
    filterIndustries,
    filterJobType,
    filterExperience,
    filterSalaryRange,
    customMinSalary,
    customMaxSalary,
    matchType,
    sortBy,
    searchQuery,
    isVectorSearchUsed
  ]);

  // Form search submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchQuery, selectedProvince, selectedIndustry);
  };

  const triggerSearch = (q: string, province: string, industry: string) => {
    const params: Record<string, string> = {};
    if (q.trim()) params.q = q.trim();
    if (province && province !== 'Tất cả địa điểm') params.province = province;
    if (industry && industry !== 'Tất cả ngành nghề') params.industry = industry;

    setSearchParams(params);
  };

  // Toggle favorite job
  const toggleFavorite = (id: number) => {
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter((favId) => favId !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Reset all left sidebar filters
  const resetFilters = () => {
    setFilterIndustries([]);
    setFilterJobType('Tất cả');
    setFilterExperience('Tất cả');
    setFilterSalaryRange('Tất cả');
    setCustomMinSalary('');
    setCustomMaxSalary('');
    setMatchType('both');
    setSortBy('relevance');
  };

  // Format Salary badge text
  const formatSalary = (job: Job) => {
    if (job.isSalaryNegotiable) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`;
    }
    if (job.salaryMin) {
      return `Từ ${(job.salaryMin / 1000000).toFixed(0)} triệu`;
    }
    if (job.salaryMax) {
      return `Đến ${(job.salaryMax / 1000000).toFixed(0)} triệu`;
    }
    return 'Thỏa thuận';
  };

  // Render filters JSX content
  const renderFiltersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
          <Filter className="h-5 w-5 text-emerald-600" />
          Bộ lọc nâng cao
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-gray-500 hover:text-emerald-700 font-bold transition-colors flex items-center gap-1 focus:outline-none focus:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Xóa lọc
        </button>
      </div>

      {/* Filter: Ngành nghề */}
      <fieldset className="space-y-3">
        <legend className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>Ngành nghề chính</span>
        </legend>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {industriesList.map((ind) => {
            const checked = filterIndustries.includes(ind);
            return (
              <label key={ind} className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer font-medium hover:text-gray-950">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) {
                      setFilterIndustries(filterIndustries.filter((i) => i !== ind));
                    } else {
                      setFilterIndustries([...filterIndustries, ind]);
                    }
                  }}
                  className="mt-0.5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <span>{ind}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Filter: Hình thức làm việc */}
      <fieldset className="space-y-3 border-t border-gray-50 pt-4">
        <legend className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>Hình thức làm việc</span>
        </legend>
        <div className="space-y-2">
          {['Tất cả', 'Toàn thời gian', 'Bán thời gian', 'Thực tập'].map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-medium hover:text-gray-950">
              <input
                type="radio"
                name="jobTypeRadio"
                checked={filterJobType === type}
                onChange={() => setFilterJobType(type)}
                className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Filter: Kinh nghiệm */}
      <fieldset className="space-y-3 border-t border-gray-50 pt-4">
        <legend className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <Award className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>Yêu cầu kinh nghiệm</span>
        </legend>
        <div className="space-y-2">
          {['Tất cả', 'Chưa có kinh nghiệm', 'Dưới 1 năm', '1 - 2 năm', '2 - 5 năm', 'Trên 5 năm'].map((exp) => (
            <label key={exp} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-medium hover:text-gray-950">
              <input
                type="radio"
                name="expRadio"
                checked={filterExperience === exp}
                onChange={() => setFilterExperience(exp)}
                className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />
              <span>{exp}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Filter: Mức lương */}
      <fieldset className="space-y-3 border-t border-gray-50 pt-4">
        <legend className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>Mức lương mong muốn</span>
        </legend>
        <div className="space-y-2">
          {['Tất cả', 'Dưới 10 triệu', '10 - 15 triệu', '15 - 20 triệu', '20 - 25 triệu', 'Trên 25 triệu', 'Thỏa thuận'].map((range) => (
            <label key={range} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-medium hover:text-gray-950">
              <input
                type="radio"
                name="salaryRadio"
                checked={filterSalaryRange === range}
                onChange={() => {
                  setFilterSalaryRange(range);
                  if (range !== 'Tất cả') {
                    setCustomMinSalary('');
                    setCustomMaxSalary('');
                  }
                }}
                className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />
              <span>{range}</span>
            </label>
          ))}
        </div>

        {/* Custom Min-Max Input */}
        <div className="pt-2">
          <span id="salary-range-label" className="text-[11px] font-bold text-gray-400 block mb-1">HOẶC NHẬP KHOẢNG LƯƠNG (TRIỆU VNĐ)</span>
          <div className="flex items-center gap-2">
            <label htmlFor="custom-salary-min" className="sr-only">Lương tối thiểu (triệu VNĐ)</label>
            <input
              id="custom-salary-min"
              type="number"
              placeholder="Min"
              value={customMinSalary}
              onChange={(e) => {
                setCustomMinSalary(e.target.value);
                setFilterSalaryRange('Tất cả');
              }}
              className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              aria-labelledby="salary-range-label"
            />
            <span className="text-gray-400 text-xs" aria-hidden="true">-</span>
            <label htmlFor="custom-salary-max" className="sr-only">Lương tối đa (triệu VNĐ)</label>
            <input
              id="custom-salary-max"
              type="number"
              placeholder="Max"
              value={customMaxSalary}
              onChange={(e) => {
                setCustomMaxSalary(e.target.value);
                setFilterSalaryRange('Tất cả');
              }}
              className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              aria-labelledby="salary-range-label"
            />
          </div>
        </div>
      </fieldset>
    </div>
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const currentDateFormatted = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in text-gray-800 font-sans max-w-7xl mx-auto">
      {/* 1. GREEN HEADER SEARCH BAR */}
      <section 
        className="bg-gradient-to-r from-emerald-800 to-green-950 p-4 sm:p-6 rounded-3xl shadow-lg border border-emerald-700/30 text-white relative overflow-hidden"
        aria-label="Khung tìm kiếm"
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Keyword Input */}
            <div className="md:col-span-5 relative flex items-center bg-white rounded-xl text-gray-900 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
              <Search className="h-5 w-5 text-gray-400 ml-3 shrink-0" aria-hidden="true" />
              <label htmlFor="results-search-keyword" className="sr-only">Từ khóa tìm kiếm</label>
              <input
                id="results-search-keyword"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-3 font-semibold text-sm outline-none placeholder-gray-400 rounded-xl focus:ring-0"
                placeholder="Tên công việc, từ khóa hoặc tên công ty..."
              />
              
              {/* Mic Icon for Voice Search */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`mr-2.5 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                aria-label={isRecording ? 'Dừng ghi âm tìm kiếm' : 'Tìm kiếm bằng giọng nói'}
                aria-pressed={isRecording}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            {/* Industry Dropdown */}
            <div className="md:col-span-3 flex items-center bg-white rounded-xl text-gray-900 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
              <Layers className="h-5 w-5 text-gray-400 ml-3 shrink-0" aria-hidden="true" />
              <label htmlFor="results-search-industry" className="sr-only">Ngành nghề</label>
              <select
                id="results-search-industry"
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  if (e.target.value && e.target.value !== 'Tất cả ngành nghề') {
                    setFilterIndustries([e.target.value]);
                  } else {
                    setFilterIndustries([]);
                  }
                }}
                className="w-full bg-transparent px-3 py-3 font-semibold text-sm outline-none rounded-xl text-gray-700"
              >
                <option value="">Tất cả ngành nghề</option>
                {industriesList.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Province Dropdown */}
            <div className="md:col-span-3 flex items-center bg-white rounded-xl text-gray-900 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
              <MapPin className="h-5 w-5 text-gray-400 ml-3 shrink-0" aria-hidden="true" />
              <label htmlFor="results-search-province" className="sr-only">Địa điểm làm việc</label>
              <select
                id="results-search-province"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-transparent px-3 py-3 font-semibold text-sm outline-none rounded-xl text-gray-700"
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov === 'Tất cả địa điểm' ? '' : prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="md:col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              <Search className="h-4 w-4" />
              <span>Tìm</span>
            </button>
          </div>

          {/* Voice recording logs / alerts */}
          <div aria-live="polite">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-100 bg-red-950/40 border border-red-800/40 py-2 px-3 rounded-lg max-w-md animate-pulse">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                <span className="text-xs font-semibold">Đang lắng nghe giọng nói của bạn...</span>
              </div>
            )}
            {recordingError && (
              <div className="flex items-center gap-2 text-yellow-200 bg-yellow-950/40 border border-yellow-800/40 py-2 px-3 rounded-lg max-w-md">
                <AlertCircle className="h-4 w-4 shrink-0 text-yellow-400" />
                <span className="text-xs">{recordingError}</span>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-emerald-700 transition-colors">Trang chủ</Link>
          </li>
          <li className="text-gray-300" aria-hidden="true">/</li>
          <li>
            <Link to="/jobs" className="hover:text-emerald-700 transition-colors">Việc làm</Link>
          </li>
          {searchQuery && (
            <>
              <li className="text-gray-300" aria-hidden="true">/</li>
              <li className="text-gray-900 font-semibold truncate max-w-xs">{searchQuery}</li>
            </>
          )}
        </ol>
      </nav>

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT SIDEBAR: FILTERS PANEL */}
        <aside 
          className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6 text-left"
          aria-label="Bộ lọc nâng cao"
        >
          {renderFiltersContent()}
        </aside>



        {/* MIDDLE CONTENT: JOB RESULTS PANEL */}
        <main 
          className="lg:col-span-3 space-y-6 text-left"
          aria-label="Danh sách kết quả việc làm"
        >
          {/* Dynamic Accessible Status Announcement */}
          <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
            {loading ? 'Đang tìm kiếm việc làm...' : `Đã tìm thấy ${filteredJobs.length} việc làm phù hợp.`}
          </div>
          {/* Header Title Information */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
              Tuyển dụng {filteredJobs.length} việc làm{' '}
              <span className="text-emerald-700">
                {searchQuery ? `"${searchQuery}"` : 'hấp dẫn'}
              </span>{' '}
              {selectedProvince && selectedProvince !== 'Tất cả địa điểm' ? `tại ${selectedProvince}` : 'toàn quốc'}
            </h1>
            <p className="text-gray-400 text-xs font-medium">
              Cập nhật lúc: {currentDateFormatted} • Nền tảng hỗ trợ truy cập WCAG 2.2 AA
            </p>

            {/* Sub-Filters: query match type & sorting */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-3 border-t border-gray-50">
              {/* Mobile Filter Button */}
              <div className="flex items-center gap-2 lg:hidden w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Bộ lọc nâng cao { (filterIndustries.length + (filterJobType !== 'Tất cả' ? 1 : 0) + (filterExperience !== 'Tất cả' ? 1 : 0) + (filterSalaryRange !== 'Tất cả' ? 1 : 0) + (customMinSalary || customMaxSalary ? 1 : 0)) > 0 ? `(${filterIndustries.length + (filterJobType !== 'Tất cả' ? 1 : 0) + (filterExperience !== 'Tất cả' ? 1 : 0) + (filterSalaryRange !== 'Tất cả' ? 1 : 0) + (customMinSalary || customMaxSalary ? 1 : 0)})` : '' }</span>
                </button>
              </div>
              
              {/* Radio Group: Tên việc làm / Tên công ty / Cả hai - WCAG radiogroup pattern */}
              <div className="flex flex-wrap items-center gap-3">
                <span id="match-type-label" className="text-xs text-gray-500 font-bold">Tìm theo:</span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="match-type-label">
                  {[
                    { key: 'both', label: 'Cả hai' },
                    { key: 'title', label: 'Tên việc làm' },
                    { key: 'company', label: 'Tên công ty' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="radio"
                      aria-checked={matchType === item.key}
                      onClick={() => setMatchType(item.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        matchType === item.key
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropdown: Sắp xếp */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold shrink-0">Ưu tiên hiển thị:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 cursor-pointer"
                  aria-label="Sắp xếp danh sách việc làm"
                >
                  <option value="relevance">Tự động (Phù hợp nhất)</option>
                  <option value="newest">Mới cập nhật</option>
                  <option value="salary">Lương cao nhất</option>
                </select>
              </div>

            </div>
          </div>

          {/* Dynamic Active Badges */}
          {(filterIndustries.length > 0 || filterJobType !== 'Tất cả' || filterExperience !== 'Tất cả' || filterSalaryRange !== 'Tất cả' || customMinSalary || customMaxSalary) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-bold">Bộ lọc đang áp dụng:</span>
              {filterIndustries.map((ind) => (
                <span key={ind} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                  {ind}
                  <button
                    type="button"
                    onClick={() => setFilterIndustries(filterIndustries.filter((i) => i !== ind))}
                    className="hover:text-emerald-900 focus:outline-none font-extrabold"
                    aria-label={`Xóa lọc ngành nghề ${ind}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {filterJobType !== 'Tất cả' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                  {filterJobType}
                  <button
                    type="button"
                    onClick={() => setFilterJobType('Tất cả')}
                    className="hover:text-emerald-900 focus:outline-none font-extrabold"
                    aria-label={`Xóa lọc hình thức ${filterJobType}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filterExperience !== 'Tất cả' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                  {filterExperience}
                  <button
                    type="button"
                    onClick={() => setFilterExperience('Tất cả')}
                    className="hover:text-emerald-900 focus:outline-none font-extrabold"
                    aria-label={`Xóa lọc kinh nghiệm ${filterExperience}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filterSalaryRange !== 'Tất cả' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                  {filterSalaryRange}
                  <button
                    type="button"
                    onClick={() => setFilterSalaryRange('Tất cả')}
                    className="hover:text-emerald-900 focus:outline-none font-extrabold"
                    aria-label={`Xóa lọc lương ${filterSalaryRange}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {(customMinSalary || customMaxSalary) && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                  Lương: {customMinSalary || '0'}M - {customMaxSalary || '∞'}M
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMinSalary('');
                      setCustomMaxSalary('');
                    }}
                    className="hover:text-emerald-900 focus:outline-none font-extrabold"
                    aria-label="Xóa lọc khoảng lương tự chọn"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* JOB LISTINGS MAIN PORTION */}
          {loading ? (
            <div className="flex justify-center items-center py-24 bg-white rounded-3xl border border-gray-150 shadow-sm" aria-busy="true" aria-label="Đang tìm kiếm việc làm">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-b-emerald-600"></div>
            </div>
          ) : paginatedJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-150 p-8 shadow-sm">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">Không tìm thấy việc làm phù hợp</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Vui lòng thử điều chỉnh các tùy chọn ở bộ lọc nâng cao bên trái hoặc thay đổi từ khóa tìm kiếm của bạn.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedJobs.map((job) => {
                const isFav = favorites.includes(job.id);
                return (
                  <article
                    key={job.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative focus-within:ring-2 focus-within:ring-emerald-500"
                    aria-labelledby={`search-job-title-${job.id}`}
                  >
                    {/* Left portion: logo */}
                    <div 
                      className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-700 font-extrabold text-xl shrink-0 overflow-hidden"
                      aria-hidden="true"
                    >
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt="" className="h-full w-full object-contain" />
                      ) : (
                        job.company?.name?.charAt(0).toUpperCase() || 'C'
                      )}
                    </div>

                    {/* Middle portion: title, company, quick tags */}
                    <div className="flex-grow min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100">
                          HOT TIN
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          AI RELEVANT
                        </span>
                      </div>
                      
                      <h3 id={`search-job-title-${job.id}`} className="font-extrabold text-gray-900 text-base leading-snug hover:text-emerald-700 transition-colors pr-8">
                        <Link to={`/jobs/${job.id}`} className="focus:outline-none before:absolute before:inset-0">
                          {job.title}
                        </Link>
                      </h3>
                      <p className="text-gray-500 text-xs font-semibold">{job.company?.name}</p>
                      
                      {/* Technical/Location tags */}
                      <div className="flex flex-wrap gap-2 pt-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatSalary(job)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {job.province || 'Toàn quốc'}
                        </span>
                        {job.experienceLevel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                            <Award className="w-3.5 h-3.5 text-gray-400" />
                            {job.experienceLevel}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          {job.jobType}
                        </span>
                      </div>
                    </div>

                    {/* Right portion: Save heart icon button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(job.id);
                      }}
                      className="absolute right-5 top-5 sm:relative sm:right-0 sm:top-0 p-2.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-red-400 ml-auto"
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

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <nav className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm" aria-label="Điều hướng kết quả tìm kiếm">
              <span className="text-xs text-gray-500 font-bold">
                Hiển thị {Math.min(filteredJobs.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredJobs.length, currentPage * pageSize)} trong tổng số {filteredJobs.length} việc làm
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`p-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentPage === 1 ? 'border-gray-50 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        currentPage === p
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                      aria-label={`Trang ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`p-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentPage === totalPages ? 'border-gray-50 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Trang tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          )}
        </main>
      </div>

      {/* 3. PREMIUM FOOTER SEO SECTION */}
      <section 
        className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm text-left space-y-6"
        aria-labelledby="seo-info-heading"
      >
        <h2 id="seo-info-heading" className="text-lg font-black text-gray-900 border-b border-gray-150 pb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Tuyển dụng việc làm và tư vấn định hướng nghề nghiệp
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 leading-relaxed">
          <div className="space-y-3">
            <p>
              Chào mừng bạn đến với JobAccess - nền tảng kết nối ứng viên và nhà tuyển dụng số một tại Việt Nam, đặc biệt dẫn đầu trong thiết kế đạt chuẩn tiếp cận <strong>WCAG 2.2 AA</strong> hỗ trợ tối ưu cho các ứng viên khiếm thị, khuyết tật vận động tìm kiếm việc làm chất lượng.
            </p>
            <p>
              Bằng việc tích hợp công nghệ trí tuệ nhân tạo (AI Search) kết hợp công cụ tìm kiếm giọng nói (Voice Search) hiện đại, bạn có thể dễ dàng tiếp cận hàng ngàn tin tuyển dụng từ các doanh nghiệp uy tín lớn. Chỉ cần nhấn nút thu âm và nói từ khóa, hệ thống sẽ đề xuất các công việc có độ chính xác cao nhất phù hợp với kỹ năng và địa điểm mong muốn của bạn.
            </p>
          </div>
          <div className="space-y-3">
            <p>
              Các bộ lọc thông minh tại thanh công cụ bên trái giúp bạn tinh lọc nhanh chóng danh sách việc làm theo mức lương từ thấp đến cao, yêu cầu số năm kinh nghiệm, các loại hình hợp đồng lao động (full-time, part-time) hoặc các ngành nghề hot nhất hiện nay.
            </p>
            <p>
              Đồng hành cùng bạn trên con đường phát triển sự nghiệp là đội ngũ hỗ trợ nhiệt tình sẵn sàng hỗ trợ sửa CV trực tuyến, tư vấn lộ trình phỏng vấn qua email hoặc hotline trợ giúp 24/7 hoàn toàn miễn phí.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile filter dialog */}
      <AccessibleModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Bộ lọc nâng cao"
        maxWidth="max-w-lg"
      >
        <div className="max-h-[65vh] overflow-y-auto pr-1 py-1 text-left">
          {renderFiltersContent()}
        </div>
        <div className="pt-4 mt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              resetFilters();
              setIsMobileFilterOpen(false);
            }}
            className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all"
          >
            Xóa bộ lọc
          </button>
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(false)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
          >
            Áp dụng
          </button>
        </div>
      </AccessibleModal>
    </div>
  );
}
