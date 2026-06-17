import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { Search, MapPin, Briefcase, Mic, MicOff, AlertCircle } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: { name: string };
  province: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable: boolean;
}

export default function Home() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch all jobs initially
  const fetchJobs = (query: string = '') => {
    setLoading(true);
    const url = query
      ? `/jobs?search=${encodeURIComponent(query)}`
      : '/jobs';

    api.get(url)
      .then((res: any) => {
        const fetchedJobs = res.data || [];
        setJobs(fetchedJobs);
        if (!query) {
          setAllJobs(fetchedJobs);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setJobs(allJobs);
      return;
    }
    executeSearch(searchQuery);
  };

  // Execute Vector Search with Fallback to Normal Search
  const executeSearch = async (text: string) => {
    setLoading(true);
    try {
      console.log('Attempting Semantic Vector Search for:', text);
      const vectorRes = await axios.post('http://127.0.0.1:8000/api/v1/jobs/search', {
        query_text: text
      });

      const vectorData = vectorRes.data?.data || [];
      if (vectorData.length > 0) {
        // Extract matched job IDs in order of score
        const matchedIds = vectorData.map((item: any) => Number(item.job_id));

        // Filter and sort the local allJobs array to preserve backend relations (e.g. company info)
        const sortedJobs = matchedIds
          .map((id: number) => allJobs.find(job => job.id === id))
          .filter((job: any): job is Job => !!job);

        // If sortedJobs is empty (e.g. database has newer jobs not loaded), fallback to fetching
        if (sortedJobs.length > 0) {
          setJobs(sortedJobs);
          setLoading(false);
          return;
        }
      }

      // Fallback if vector database search returned no matches
      fetchJobs(text);
    } catch (err) {
      console.warn('Vector Search failed, falling back to standard text search:', err);
      // Fallback to normal text search
      fetchJobs(text);
    }
  };

  // Start Ghi âm
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);

        // Dọn dẹp stream microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Lỗi truy cập microphone:', err);
      setRecordingError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
      setIsRecording(false);
    }
  };

  // Dừng Ghi âm
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Gọi dịch vụ AI Tools để Transcribe
  const handleTranscribe = async (audioBlob: Blob) => {
    setTranscribing(true);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'voice.webm');

      const res = await axios.post('http://127.0.0.1:8000/api/v1/audio/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const text = res.data?.transcription || '';
      console.log('Transcribed Text:', text);
      if (text.trim()) {
        setSearchQuery(text);
        executeSearch(text);
      } else {
        setRecordingError('Không thể nhận dạng giọng nói. Hãy thử nói rõ ràng hơn.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setRecordingError('Không thể kết nối đến máy chủ nhận dạng giọng nói (port 8000).');
      setLoading(false);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-gradient-to-b from-primary-50 via-white to-white rounded-3xl border border-primary-100/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Tìm kiếm <span className="text-primary-600">công việc mơ ước</span> hôm nay.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Khám phá hàng ngàn cơ hội nghề nghiệp cực kỳ dễ dàng. Hỗ trợ tìm kiếm thông minh bằng giọng nói.
          </p>

          {/* Accessible Search Form */}
          <form className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4" onSubmit={handleSearchSubmit}>
            <div className="flex-1 relative">
              <label htmlFor="search-jobs" className="sr-only">Tìm kiếm công việc</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>

              <input
                id="search-jobs"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11 pr-24 py-3.5 text-lg shadow-sm w-full rounded-2xl"
                placeholder="Tên công việc, từ khóa hoặc công ty..."
                aria-label="Nhập từ khóa tìm kiếm"
              />

              {/* Microphone trigger inside input */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  aria-label={isRecording ? 'Dừng ghi âm tìm kiếm' : 'Tìm kiếm bằng giọng nói'}
                  aria-pressed={isRecording}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary py-3.5 px-8 text-lg shadow-md hover:shadow-lg rounded-2xl shrink-0">
              Tìm kiếm
            </button>
          </form>

          {/* Visual animation when recording */}
          {isRecording && (
            <div className="mt-6 flex flex-col items-center justify-center space-y-2" aria-live="assertive">
              <div className="flex items-center gap-1.5 justify-center h-8">
                <span className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                <span className="w-1.5 h-9 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                <span className="w-1.5 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
              </div>
              <p className="text-red-600 font-semibold animate-pulse text-sm">
                Đang lắng nghe... Hãy nói tên công việc bạn cần tìm
              </p>
            </div>
          )}

          {transcribing && (
            <p className="mt-4 text-primary-700 font-semibold animate-pulse text-sm" aria-live="polite">
              Đang chuyển giọng nói thành văn bản...
            </p>
          )}

          {/* Recording errors block */}
          {recordingError && (
            <div className="max-w-md mx-auto mt-6 rounded-xl bg-red-50 p-4 border border-red-200 text-red-800 text-sm flex items-center gap-2.5" role="alert">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
              <span>{recordingError}</span>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-32 -right-24 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl mix-blend-multiply"></div>
        </div>
      </section>

      {/* Jobs List */}
      <section aria-labelledby="latest-jobs-heading">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 id="latest-jobs-heading" className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Cơ hội việc làm mới nhất'}
          </h2>
          <span className="text-gray-600 font-medium">{jobs.length} công việc khả dụng</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20" aria-busy="true" aria-label="Đang tải dữ liệu công việc">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 text-lg font-medium">Không tìm thấy công việc phù hợp.</p>
            <button
              onClick={() => { setSearchQuery(''); fetchJobs(); }}
              className="mt-4 text-primary-700 font-semibold hover:underline"
            >
              Xem tất cả công việc
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 relative"
                aria-labelledby={`job-title-${job.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0" aria-hidden="true">
                    {job.company?.name?.charAt(0) || 'C'}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Mới
                  </span>
                </div>

                <h3 id={`job-title-${job.id}`} className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  <Link to={`/jobs/${job.id}`} className="focus:outline-none hover:text-primary-600 transition-colors before:absolute before:inset-0">
                    {job.title}
                  </Link>
                </h3>

                <p className="text-gray-700 font-medium mb-4">{job.company?.name}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>{job.province || 'Toàn quốc'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4 mr-2 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>{job.jobType}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="text-primary-700 font-bold">
                    {job.isSalaryNegotiable ? 'Thỏa thuận' : (
                      job.salaryMin && job.salaryMax ? `${(job.salaryMin / 1000000).toFixed(0)}Tr - ${(job.salaryMax / 1000000).toFixed(0)}Tr` : 'Lương cạnh tranh'
                    )}
                  </div>
                  <div className="text-sm text-gray-500">2 ngày trước</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
