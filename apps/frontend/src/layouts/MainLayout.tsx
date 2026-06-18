import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, PlusCircle, Search, Menu, X, Mic, MicOff, Volume2 } from 'lucide-react';
import logoUrl from '../public/logo.jpg';

export default function MainLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const recognitionRef = useRef<any>(null);
  const voiceModalRef = useRef<HTMLDivElement>(null);
  const voiceTriggerRef = useRef<HTMLButtonElement>(null);
  const isSpacePressedRef = useRef(false);

  // Web Screen Reader states
  const [webReaderEnabled, setWebReaderEnabled] = useState(() => {
    return localStorage.getItem('webReaderEnabled') === 'true';
  });
  const [webReaderMode, setWebReaderMode] = useState<'auto' | 'enter'>(() => {
    return (localStorage.getItem('webReaderMode') as any) || 'auto';
  });
  const [webReaderRate, setWebReaderRate] = useState(() => {
    return localStorage.getItem('webReaderRate') || '1.0';
  });
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // References to bypass stale closures in event listeners
  const webReaderRateRef = useRef(webReaderRate);
  const selectedVoiceRef = useRef(selectedVoice);

  useEffect(() => {
    webReaderRateRef.current = webReaderRate;
  }, [webReaderRate]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Hook to load Vietnamese voice dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      // Look for a Vietnamese voice first (e.g. vi-VN, Google Tiếng Việt, Microsoft Natural)
      const viVoice = voices.find(v =>
        v.lang.toLowerCase().includes('vi') ||
        v.lang.toLowerCase().includes('vn') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('vietnamese')
      );

      console.log('Voices loaded:', voices.map(v => `${v.name} (${v.lang})`));
      console.log('Selected Vietnamese voice:', viVoice ? `${viVoice.name} (${viVoice.lang})` : 'None');

      if (viVoice) {
        setSelectedVoice(viVoice);
        selectedVoiceRef.current = viVoice;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }
      utterance.rate = parseFloat(webReaderRateRef.current);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleWebReader = () => {
    setWebReaderEnabled(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          speakText('Trình đọc màn hình tích hợp đã bật. Nhấn phím Tab để di chuyển và nghe đọc.');
        }, 100);
      } else {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const getElementDescription = (el: HTMLElement): string => {
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const labelledby = el.getAttribute('aria-labelledby');
    if (labelledby) {
      const labelEl = document.getElementById(labelledby);
      if (labelEl && labelEl.textContent) {
        return labelEl.textContent.trim();
      }
    }

    let rolePrefix = '';
    const tagName = el.tagName.toLowerCase();
    const role = el.getAttribute('role');

    if (tagName === 'a' || role === 'link') {
      rolePrefix = 'Liên kết. ';
    } else if (tagName === 'button' || role === 'button') {
      rolePrefix = 'Nút. ';
    } else if (tagName === 'input') {
      const type = el.getAttribute('type') || 'text';
      const placeholder = el.getAttribute('placeholder') || '';
      if (type === 'checkbox') {
        const checked = (el as HTMLInputElement).checked ? 'đã chọn' : 'chưa chọn';
        rolePrefix = `Hộp kiểm. ${checked}. `;
      } else if (type === 'radio') {
        const checked = (el as HTMLInputElement).checked ? 'đã chọn' : 'chưa chọn';
        rolePrefix = `Nút chọn một. ${checked}. `;
      } else {
        rolePrefix = `Ô nhập liệu. ${placeholder ? 'Gợi ý: ' + placeholder + '. ' : ''}`;
      }
    } else if (tagName === 'textarea') {
      const placeholder = el.getAttribute('placeholder') || '';
      rolePrefix = `Ô nhập liệu văn bản lớn. ${placeholder ? 'Gợi ý: ' + placeholder + '. ' : ''}`;
    } else if (tagName === 'select') {
      rolePrefix = 'Danh sách lựa chọn. ';
    } else if (tagName.match(/^h[1-6]$/)) {
      const level = tagName.substring(1);
      rolePrefix = `Tiêu đề cấp ${level}. `;
    } else if (tagName === 'li') {
      rolePrefix = 'Mục danh sách. ';
    }

    let content = '';
    if (tagName === 'input' && (el as HTMLInputElement).type !== 'checkbox' && (el as HTMLInputElement).type !== 'radio') {
      content = (el as HTMLInputElement).value || el.getAttribute('placeholder') || '';
    } else if (tagName === 'textarea') {
      content = (el as HTMLTextAreaElement).value || el.getAttribute('placeholder') || '';
    } else if (tagName === 'select') {
      const selectEl = el as HTMLSelectElement;
      content = selectEl.options[selectEl.selectedIndex]?.text || '';
    } else {
      content = el.innerText || el.textContent || '';
    }

    content = content.replace(/\s+/g, ' ').trim();

    if (!content && el.querySelector('img')) {
      const img = el.querySelector('img');
      content = img?.getAttribute('alt') || img?.getAttribute('title') || 'Hình ảnh';
    }

    return `${rolePrefix}${content}`.trim();
  };

  const makeContentFocusable = () => {
    if (!mainRef.current) return;
    const elements = mainRef.current.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, [role="article"], .focusable-content'
    );
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const hasTabIndex = el.hasAttribute('tabindex');
      if (!hasTabIndex) {
        if (tagName === 'p' && (!el.textContent || el.textContent.trim().length < 3)) {
          return;
        }
        el.setAttribute('tabindex', '0');
        el.classList.add('js-tts-focusable');
      }
    });
  };

  const removeContentFocusable = () => {
    if (!mainRef.current) return;
    const elements = mainRef.current.querySelectorAll('.js-tts-focusable');
    elements.forEach((el) => {
      el.removeAttribute('tabindex');
      el.classList.remove('js-tts-focusable');
    });
  };

  const handleVoiceCommand = (text: string) => {
    const query = text.toLowerCase().trim();

    const commands = [
      { keywords: ['về trang chủ', 'trang chủ', 'quay lại trang chủ'], path: '/', name: 'Trang chủ' },
      { keywords: ['tìm việc làm', 'tìm việc', 'danh sách việc làm', 'danh sách công việc', 'việc làm'], path: '/jobs', name: 'Tìm việc làm' },
      { keywords: ['viết cv', 'tạo cv', 'viết cv chuyên nghiệp', 'trang cv', 'cv'], path: '/cv-builder', name: 'Viết CV chuyên nghiệp' },
      { keywords: ['tính lương', 'gross to net', 'tính lương gross to net', 'bảng tính lương', 'bảng lương'], path: '/gross-to-net', name: 'Tính lương Gross sang Net' },
      { keywords: ['cẩm nang', 'cẩm nang nghề nghiệp', 'cẩm nang việc làm'], path: '/career-handbook', name: 'Cẩm nang nghề nghiệp' },
      { keywords: ['tìm ứng viên', 'tìm kiếm ứng viên', 'tìm hồ sơ ứng viên', 'hồ sơ ứng viên'], path: '/candidate-search', name: 'Tìm kiếm hồ sơ ứng viên' },
      { keywords: ['giải pháp nhân sự ai', 'giải pháp ai', 'nhân sự ai', 'giải pháp nhân sự', 'hr ai'], path: '/ai-hr-solutions', name: 'Giải pháp nhân sự AI' },
      { keywords: ['điều khoản', 'điều khoản dịch vụ'], path: '/terms-and-policies', name: 'Điều khoản dịch vụ' },
      { keywords: ['chính sách', 'chính sách bảo mật'], path: '/terms-and-policies', name: 'Chính sách bảo mật' },
      { keywords: ['quy chế', 'quy chế hoạt động'], path: '/terms-and-policies', name: 'Quy chế hoạt động' },
      { keywords: ['báo cáo tiếp cận', 'báo cáo wcag', 'wcag', 'báo cáo wcag 2.2 aa', 'tiếp cận'], path: '/wcag-report', name: 'Báo cáo WCAG 2.2 AA' },
      { keywords: ['huy hiệu', 'huy hiệu nhà tuyển dụng', 'huy hiệu nhà tuyển dụng uy tín', 'nhà tuyển dụng uy tín', 'uy tín'], path: '/employer-badge', name: 'Huy hiệu nhà tuyển dụng uy tín' },
      { keywords: ['đăng tin', 'đăng tin tuyển dụng'], path: '/dang-tin', name: 'Đăng tin tuyển dụng' },
      { keywords: ['việc làm đã nộp', 'tin đã nộp', 'đã nộp'], path: '/candidate/applied', name: 'Việc làm đã nộp' },
      { keywords: ['hồ sơ cá nhân', 'tài khoản', 'thông tin cá nhân', 'profile'], path: '/profile', name: 'Hồ sơ cá nhân' },
      { keywords: ['đăng nhập'], path: '/login', name: 'Đăng nhập' },
      { keywords: ['đăng ký'], path: '/register', name: 'Đăng ký' },
      { keywords: ['tin đã đăng', 'quản lý tin'], path: '/employer/jobs', name: 'Quản lý tin đã đăng' },
      { keywords: ['quản lý ứng viên'], path: '/employer/applicants', name: 'Quản lý ứng viên' },
    ];

    if (query.includes('trợ giúp') || query.includes('hướng dẫn') || query.includes('lệnh')) {
      const msg = 'Bạn có thể nói các lệnh: trang chủ, viết CV, tính lương, cẩm nang, tìm ứng viên, giải pháp AI hoặc báo cáo tiếp cận.';
      setVoiceFeedback(msg);
      speak(msg);
      return;
    }

    let matched = false;
    for (const cmd of commands) {
      if (cmd.keywords.some(kw => query.includes(kw))) {
        const msg = `Đang di chuyển đến trang ${cmd.name}`;
        setVoiceFeedback(msg);
        speak(msg);
        matched = true;
        setTimeout(() => {
          navigate(cmd.path);
          setShowVoiceModal(false);
        }, 1200);
        break;
      }
    }

    if (!matched) {
      const msg = `Không tìm thấy trang phù hợp cho lệnh "${text}". Hãy nói "Trợ giúp" để nghe danh sách lệnh.`;
      setVoiceFeedback(msg);
      speak(msg);
    }
  };

  const startVoiceAssistant = () => {
    setShowVoiceModal(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting global speech recognition:', err);
      }
    } else {
      setVoiceText('Rất tiếc, trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
      speak('Trình duyệt không hỗ trợ nhận dạng giọng nói.');
    }
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

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
        setIsListening(true);
        setVoiceText('Đang nghe... Hãy nói lệnh di chuyển hoặc "Trợ giúp"');
        setVoiceFeedback('');
      };

      recognition.onerror = (event: any) => {
        console.error('Global Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceText('Lỗi: Hãy cho phép quyền truy cập microphone.');
          speak('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
        } else if (event.error === 'no-speech') {
          setVoiceText('Không nghe rõ giọng nói. Hãy nói lại.');
          speak('Không nghe thấy giọng nói. Vui lòng thử lại.');
        } else {
          setVoiceText(`Lỗi: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript || '';
        setVoiceText(`Bạn đã nói: "${text}"`);
        handleVoiceCommand(text);
      };

      recognitionRef.current = recognition;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Alt + V trigger
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        startVoiceAssistant();
      }

      // Space trigger (Hold Space to talk)
      if (e.key === ' ' && !isTyping) {
        e.preventDefault(); // Prevent scrolling page down
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true;
          startVoiceAssistant();
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (isSpacePressedRef.current) {
          isSpacePressedRef.current = false;
          stopVoiceAssistant();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('webReaderEnabled', String(webReaderEnabled));
  }, [webReaderEnabled]);

  useEffect(() => {
    localStorage.setItem('webReaderMode', webReaderMode);
  }, [webReaderMode]);

  useEffect(() => {
    localStorage.setItem('webReaderRate', webReaderRate);
  }, [webReaderRate]);

  // Effect to make elements focusable
  useEffect(() => {
    if (webReaderEnabled) {
      // Small timeout to ensure page content has finished rendering
      const timer = setTimeout(() => {
        makeContentFocusable();
      }, 300);

      // Listen for DOM changes to make new content focusable
      const observer = new MutationObserver(() => {
        makeContentFocusable();
      });

      if (mainRef.current) {
        observer.observe(mainRef.current, {
          childList: true,
          subtree: true,
        });
      }

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    } else {
      removeContentFocusable();
    }
  }, [webReaderEnabled, location.pathname]);

  // Handle global focus and keydown for Web Screen Reader
  useEffect(() => {
    if (!webReaderEnabled) return;

    let lastFocusedEl: HTMLElement | null = null;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === document.body) return;

      lastFocusedEl = target;

      if (webReaderMode === 'auto') {
        const desc = getElementDescription(target);
        if (desc) {
          speakText(desc);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lastFocusedEl) {
        lastFocusedEl = document.activeElement as HTMLElement;
      }
      if (!lastFocusedEl || lastFocusedEl === document.body) return;

      const tagName = lastFocusedEl.tagName.toLowerCase();
      const role = lastFocusedEl.getAttribute('role');
      const isInteractive =
        tagName === 'a' ||
        tagName === 'button' ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        role === 'button' ||
        role === 'link';

      // If user presses Shift + Enter on ANY focused element, read it
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        const desc = getElementDescription(lastFocusedEl);
        if (desc) {
          speakText(desc);
        }
        return;
      }

      // If user presses Enter on a NON-interactive focused element, read it
      if (e.key === 'Enter' && !isInteractive) {
        e.preventDefault();
        const desc = getElementDescription(lastFocusedEl);
        if (desc) {
          speakText(desc);
        }
        return;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [webReaderEnabled, webReaderMode, webReaderRate]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl z-[100] shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Chuyển nhanh đến nội dung chính
      </a>
      {/* Top green announcement banner - role="complementary" vì thông tin bổ sung */}
      <div
        className="bg-primary-950 text-primary-100 py-2 px-4 text-center text-xs font-semibold tracking-wide sm:text-sm border-b border-primary-900 shadow-sm relative z-50"
        role="complementary"
        aria-label="Thông báo tiếp cận"
      >
        ✨ Hệ thống tìm kiếm việc làm thông minh AI &amp; Giọng nói hỗ trợ người khiếm thị / khuyết tật đạt tiêu chuẩn WCAG 2.2
      </div>

      {/* Accessible Navigation Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2 text-2xl font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 rounded-md px-2 py-1"
                aria-label="JobAccess Home"
              >
                <img src={logoUrl} alt="Logo JobAccess" className="h-9 w-auto rounded-lg" />
                <span className="bg-gradient-to-r from-primary-700 to-emerald-500 bg-clip-text text-transparent">JobAccess</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-4 items-center" aria-label="Điều hướng chính">
              <Link
                to="/"
                className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                Tìm việc làm
              </Link>

              {user?.role === 'Nhà tuyển dụng' && (
                <>
                  <Link
                    to="/employer/jobs"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/employer/jobs') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/employer/jobs') ? 'page' : undefined}
                  >
                    Tin đã đăng
                  </Link>
                  <Link
                    to="/employer/applicants"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/employer/applicants') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/employer/applicants') ? 'page' : undefined}
                  >
                    Quản lý ứng viên
                  </Link>
                  <Link
                    to="/dang-tin"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/dang-tin') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/dang-tin') ? 'page' : undefined}
                  >
                    <PlusCircle className="w-4 h-4" aria-hidden="true" />
                    Đăng tin
                  </Link>
                </>
              )}

              {user?.role === 'Ứng viên' && (
                <Link
                  to="/candidate/applied"
                  className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/candidate/applied') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                  aria-current={isActive('/candidate/applied') ? 'page' : undefined}
                >
                  Việc làm đã nộp
                </Link>
              )}

              {user?.role === 'Quản trị viên' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/admin/dashboard') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/admin/dashboard') ? 'page' : undefined}
                  >
                    Thống kê
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/admin/users') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/admin/users') ? 'page' : undefined}
                  >
                    Quản lý User
                  </Link>
                  <Link
                    to="/admin/jobs"
                    className={`flex items-center gap-1.5 font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isActive('/admin/jobs') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700'}`}
                    aria-current={isActive('/admin/jobs') ? 'page' : undefined}
                  >
                    Quản lý Job
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile hamburger button */}
            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
              aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Link */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 shrink-0"
                    aria-label={user.role === 'Nhà tuyển dụng' ? 'Xem trang hồ sơ doanh nghiệp' : 'Xem trang hồ sơ cá nhân'}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {user.avatarUrl || user.avatar ? (
                        <img src={user.avatarUrl || user.avatar} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : user.fullName ? (
                        <span className="text-primary-700 font-bold text-sm">{user.fullName.charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-4 h-4 text-primary-700" />
                      )}
                    </div>
                    <span className="hidden sm:inline font-semibold text-sm max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                  </Link>

                  {/* Log Out Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 font-medium text-sm py-2 px-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Đăng xuất khỏi hệ thống"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="md:hidden bg-white border-b border-gray-200 shadow-lg z-40"
          role="navigation"
          aria-label="Menu điều hướng di động"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              Tìm việc làm
            </Link>

            {user?.role === 'Nhà tuyển dụng' && (
              <>
                <Link to="/employer/jobs" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/employer/jobs') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/employer/jobs') ? 'page' : undefined}>Tin đã đăng</Link>
                <Link to="/employer/applicants" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/employer/applicants') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/employer/applicants') ? 'page' : undefined}>Quản lý ứng viên</Link>
                <Link to="/dang-tin" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/dang-tin') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/dang-tin') ? 'page' : undefined}><PlusCircle className="w-4 h-4" aria-hidden="true" />Đăng tin</Link>
              </>
            )}
            {user?.role === 'Ứng viên' && (
              <Link to="/candidate/applied" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/candidate/applied') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/candidate/applied') ? 'page' : undefined}>Việc làm đã nộp</Link>
            )}
            {user?.role === 'Quản trị viên' && (
              <>
                <Link to="/admin/dashboard" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/admin/dashboard') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/admin/dashboard') ? 'page' : undefined}>Thống kê</Link>
                <Link to="/admin/users" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/admin/users') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/admin/users') ? 'page' : undefined}>Quản lý User</Link>
                <Link to="/admin/jobs" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive('/admin/jobs') ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`} aria-current={isActive('/admin/jobs') ? 'page' : undefined}>Quản lý Job</Link>
              </>
            )}
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Link to="/login" className="flex-1 text-center px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">Đăng nhập</Link>
                <Link to="/register" className="flex-1 btn-primary text-center">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main ref={mainRef} id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800 font-sans" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
            {/* Column 1: Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="" className="h-8 w-auto rounded-md" aria-hidden="true" />
                <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                  JobAccess
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng tìm kiếm việc làm bằng giọng nói thông minh hỗ trợ người khuyết tật đầu tiên tại Việt Nam. Đáp ứng tiêu chuẩn tiếp cận WCAG 2.2.
              </p>
              <div className="text-sm space-y-2 text-gray-400">
                <p>📍 Địa chỉ: 77 Nguyễn Huệ, Thuận Hóa, Huế</p>
                <p>📞 Hotline: 1900 xxx xxx (Nhánh 2)</p>
                <p>✉️ Email: hotro@jobmatch.vn</p>
              </div>
            </div>

            {/* Column 2: Job Seekers */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Dành Cho Ứng Viên</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/jobs" className="hover:text-primary-400 transition-colors">Tìm kiếm việc làm</Link></li>
                <li><Link to="/cv-builder" className="hover:text-primary-400 transition-colors">Viết CV chuyên nghiệp</Link></li>
                <li><Link to="/gross-to-net" className="hover:text-primary-400 transition-colors">Tính lương Gross to Net</Link></li>
                <li><Link to="/career-handbook" className="hover:text-primary-400 transition-colors">Cẩm nang nghề nghiệp</Link></li>
              </ul>
            </div>

            {/* Column 3: Employers */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Dành Cho Nhà Tuyển Dụng</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dang-tin" className="hover:text-primary-400 transition-colors">Đăng tin tuyển dụng</Link></li>
                <li><Link to="/candidate-search" className="hover:text-primary-400 transition-colors">Tìm kiếm hồ sơ ứng viên</Link></li>
                <li><Link to="/ai-hr-solutions" className="hover:text-primary-400 transition-colors">Giải pháp nhân sự AI</Link></li>
                <li><Link to="/employer-badge" className="hover:text-primary-400 transition-colors">Huy hiệu nhà tuyển dụng uy tín</Link></li>
              </ul>
            </div>

            {/* Column 4: Policy & Ecosystem */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Điều Khoản & Chính Sách</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/terms-and-policies" className="hover:text-primary-400 transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link to="/terms-and-policies" className="hover:text-primary-400 transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/terms-and-policies" className="hover:text-primary-400 transition-colors">Quy chế hoạt động</Link></li>
                <li><Link to="/wcag-report" className="hover:text-primary-400 transition-colors">Báo cáo WCAG 2.2 AA</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} JobAccess. Tất cả các quyền được bảo lưu.</p>
            <p className="flex items-center gap-2">
              <span>Thiết kế theo tiêu chuẩn tiếp cận</span>
              <span className="px-2 py-0.5 bg-primary-950 text-primary-400 border border-primary-800 rounded text-xs font-semibold">WCAG 2.2 AA</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Voice Assistant Trigger Button */}
      <button
        ref={voiceTriggerRef}
        onClick={startVoiceAssistant}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 transition-all flex items-center justify-center group"
        aria-label="Kích hoạt Trợ lý điều hướng giọng nói (Phím tắt: Alt+V hoặc Giữ Space)"
      >
        <Mic className="w-6 h-6" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-focus-visible:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2 group-focus-visible:pl-2">
          Trợ lý giọng nói (Alt+V / Giữ Space)
        </span>
      </button>

      {/* Global Accessibility Panel Trigger Button */}
      <button
        onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
        className="fixed bottom-24 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-350 transition-all flex items-center justify-center group"
        aria-label="Cài đặt trợ năng đọc màn hình"
        aria-expanded={showAccessibilityPanel}
      >
        <Volume2 className="w-6 h-6" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-focus-visible:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2 group-focus-visible:pl-2">
          Cài đặt đọc màn hình
        </span>
      </button>

      {/* Floating Accessibility settings panel */}
      {showAccessibilityPanel && (
        <div
          className="fixed bottom-40 right-6 z-50 w-80 bg-white border border-gray-200 rounded-3xl p-5 shadow-2xl animate-fadeIn font-sans"
          role="region"
          aria-label="Bảng cài đặt Trợ năng đọc màn hình"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Volume2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Cấu hình Đọc màn hình
            </h3>
            <button
              onClick={() => setShowAccessibilityPanel(false)}
              className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-0.5"
              aria-label="Đóng bảng cài đặt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Trình đọc màn hình</p>
                <p className="text-[10px] text-gray-500">Đọc văn bản khi di chuyển</p>
              </div>
              <button
                onClick={toggleWebReader}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${webReaderEnabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                aria-label={webReaderEnabled ? "Tắt trình đọc màn hình" : "Bật trình đọc màn hình"}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md transition-all"></span>
              </button>
            </div>

            {webReaderEnabled && (
              <>
                {/* Voice Selection Status */}
                <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 font-medium leading-relaxed">
                  {selectedVoice ? (
                    <span className="flex items-center gap-1">
                      <span>🇻🇳</span>
                      <span>Giọng đọc: <strong>{selectedVoice.name}</strong></span>
                    </span>
                  ) : (
                    <span className="text-amber-805 font-bold">
                      🔊 Đang tìm kiếm/sử dụng giọng tiếng Việt chuẩn của hệ thống...
                    </span>
                  )}
                </div>

                {/* Mode Selector */}
                <div className="space-y-1">
                  <label htmlFor="accessibility-mode-select" className="block text-xs font-bold text-gray-700">Chế độ đọc:</label>
                  <select
                    id="accessibility-mode-select"
                    value={webReaderMode}
                    onChange={(e) => setWebReaderMode(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="auto">Tự động đọc khi Tab tới</option>
                    <option value="enter">Nhấn Enter/Shift+Enter để nghe</option>
                  </select>
                </div>

                {/* Speed Selector */}
                <div className="space-y-1">
                  <label htmlFor="accessibility-rate-select" className="block text-xs font-bold text-gray-700">Tốc độ đọc:</label>
                  <select
                    id="accessibility-rate-select"
                    value={webReaderRate}
                    onChange={(e) => setWebReaderRate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="0.75">Chậm</option>
                    <option value="1.0">Bình thường</option>
                    <option value="1.25">Nhanh</option>
                    <option value="1.5">Rất nhanh</option>
                  </select>
                </div>

                {/* Hotkey Guide */}
                <div className="text-[10px] text-gray-550 leading-relaxed pt-2.5 border-t border-gray-150">
                  💡 <strong>Phím tắt:</strong> Nhấn <strong>Tab</strong> để chuyển phần tử. Nhấn <strong>Shift + Enter</strong> hoặc <strong>Enter</strong> trên văn bản để nghe đọc lại.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Voice Assistant Modal */}
      {showVoiceModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-assistant-title"
        >
          <div
            ref={voiceModalRef}
            className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-2xl max-w-lg w-full flex flex-col items-center text-center space-y-6 relative overflow-hidden"
          >
            {/* Ambient mic animation */}
            <div className="relative inline-flex items-center justify-center">
              {isListening && (
                <>
                  <div className="absolute inset-0 bg-emerald-100 rounded-full scale-150 animate-ping opacity-75"></div>
                  <div className="absolute inset-0 bg-emerald-200 rounded-full scale-125 animate-pulse opacity-50"></div>
                </>
              )}
              <div className={`relative h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${isListening ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {isListening ? (
                  <Mic className="w-10 h-10 animate-pulse" aria-hidden="true" />
                ) : (
                  <MicOff className="w-10 h-10" aria-hidden="true" />
                )}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <h2 id="voice-assistant-title" className="text-xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                Trợ lý Điều hướng Giọng nói
              </h2>
              <p className="text-xs text-gray-550 font-bold">
                Nói lệnh di chuyển (Nhấn giữ Space để nói, thả Space để gửi)
              </p>
            </div>

            {/* Speech-to-Text Input Visualizer */}
            <div className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-4 min-h-[80px] flex items-center justify-center">
              <p className={`text-base font-bold text-gray-800 ${isListening ? 'animate-pulse' : ''}`}>
                {voiceText}
              </p>
            </div>

            {/* AI Voice Feedback */}
            {voiceFeedback && (
              <div
                role="status"
                aria-atomic="true"
                className="w-full bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl p-3 text-xs font-bold"
              >
                {voiceFeedback}
              </div>
            )}

            {/* Sample commands list */}
            <div className="w-full text-left bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-2">Các lệnh bạn có thể nói:</p>
              <ul className="text-[11px] text-gray-500 space-y-1 grid grid-cols-2 gap-x-2">
                <li>• <strong>"Về trang chủ"</strong></li>
                <li>• <strong>"Đến trang viết CV"</strong></li>
                <li>• <strong>"Mở bảng tính lương"</strong></li>
                <li>• <strong>"Giải pháp nhân sự AI"</strong></li>
                <li>• <strong>"Tìm kiếm ứng viên"</strong></li>
                <li>• <strong>"Cẩm nang nghề nghiệp"</strong></li>
                <li>• <strong>"Báo cáo tiếp cận"</strong></li>
                <li>• <strong>"Chính sách bảo mật"</strong></li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              {isListening ? (
                <button
                  onClick={stopVoiceAssistant}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  Tạm dừng nghe
                </button>
              ) : (
                <button
                  onClick={startVoiceAssistant}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Nói lại
                </button>
              )}
              <button
                onClick={() => {
                  stopVoiceAssistant();
                  setShowVoiceModal(false);
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
