# ♿ JobAccess - Nền Tảng Tuyển Dụng Hỗ Trợ Tiếp Cận & Tìm Kiếm Thông Minh (WCAG 2.2 AA)

**JobAccess** là nền tảng tìm kiếm việc làm đầu tiên tại Việt Nam được thiết kế và xây dựng theo tiêu chuẩn tiếp cận web quốc tế **WCAG 2.2 AA (Web Content Accessibility Guidelines)**, nhằm hỗ trợ tối đa cho người khuyết tật, người khiếm thị và người hạn chế khả năng vận động. Hệ thống tích hợp các công nghệ Trí tuệ nhân tạo (AI) hiện đại như **Speech-to-Text (Voice Search & Voice Navigation)**, **AI Job Matching (Vector Search)** và **AI HR Assistants (Auto JD Generator, CV Matching Score)**.

---

## 🚀 Tính Năng Cốt Lõi

### 1. ♿ Tiêu chuẩn Tiếp Cận Số (Accessibility - WCAG 2.2 AA)
* **Skip Link (Đường dẫn bỏ qua nhanh)**: Cho phép chuyển ngay tới phần nội dung chính bằng bàn phím mà không phải đi qua header.
* **Bàn phím toàn diện (Keyboard Accessible)**: Hoạt động đầy đủ 100% bằng phím Tab, các phím mũi tên và phím tắt `Escape` để đóng menu/modal.
* **Tối ưu Screen Reader (ARIA Compliance)**: Sử dụng chính xác các ARIA roles, labels, states (`aria-live="polite"`, `role="tablist"`, v.v.) hỗ trợ hoàn hảo cho các phần mềm đọc màn hình như NVDA, JAWS và VoiceOver.
* **Web TTS Screen Reader (Trình đọc màn hình nội bộ)**: Tích hợp giọng đọc nhân tạo bằng tiếng Việt trong **Bảng điều khiển Trợ năng (Popup góc dưới bên phải)**. Tự động đọc hoặc đọc khi nhấn phím trên các thành phần được focus, hỗ trợ chỉnh tốc độ đọc phù hợp.
* **Focus Indicator rõ nét**: Đường viền focus nổi bật (xanh lục dày 3px) giúp người dùng dễ dàng định vị vị trí hiện tại trên màn hình.
* **Kích thước vùng chạm (Tap Targets)**: Các nút thao tác trên thiết bị di động tối thiểu đạt 44x44px.
* **Chế độ forced-colors & giảm chuyển động**: Bảo vệ người nhạy cảm với ánh sáng và hỗ trợ độ tương phản cực tốt.

### 2. 🎙️ Điều Hướng & Tìm Kiếm Bằng Giọng Nói (Voice Command & AI Search)
* **Tìm kiếm bằng giọng nói**: Chỉ cần nhấn nút Microphone, nói từ khóa mong muốn (ví dụ: *"Tôi muốn tìm việc làm lập trình viên ở Đà Nẵng"*), mô hình AI sẽ tự động phân tích ngữ nghĩa và trả về kết quả.
* **Điều hướng bằng giọng nói (Push-to-Talk)**: Hỗ trợ nhấn giữ phím `Space` (Khoảng trắng) hoặc sử dụng phím tắt `Alt + V` để kích hoạt micro nói lệnh di chuyển giữa các trang chức năng (ví dụ: *"Về trang chủ"*, *"Đến trang viết CV"*, *"Mở bảng tính lương"*) và thả phím ra để chuyển trang ngay lập tức trong vòng 1.2 giây.

### 3. 🎯 Giải Pháp Nhân Sự & Công Cụ Tiện Ích Thông Minh
* **Viết CV chuyên nghiệp ([CvBuilder](file:///d:/XuanTruong/job-matching-wcag22/apps/frontend/src/pages/note/CvBuilder.tsx))**: Soạn thảo thông tin hồ sơ bằng bàn phím, hiển thị bản xem trước và hỗ trợ in/tải PDF trực tuyến.
* **Tính lương Gross to Net ([GrossToNet](file:///d:/XuanTruong/job-matching-wcag22/apps/frontend/src/pages/note/GrossToNet.tsx))**: Bảng tính bảo hiểm (BHXH, BHYT, BHTN) và thuế TNCN lũy tiến theo quy chuẩn luật lao động Việt Nam mới nhất.
* **Giải pháp nhân sự AI ([AiHrSolutions](file:///d:/XuanTruong/job-matching-wcag22/apps/frontend/src/pages/note/AiHrSolutions.tsx))**: Khởi tạo bản tả công việc (JD) nhanh từ từ khóa chính và chấm điểm, tính toán tỷ lệ tương thích (%) giữa CV của ứng viên với JD thông qua AI.
* **Tìm kiếm ứng viên & Tin đăng**: Giao diện tìm kiếm hồ sơ nâng cao cho doanh nghiệp và quản lý tin tuyển dụng.
* **Huy hiệu nhà tuyển dụng uy tín ([EmployerBadge](file:///d:/XuanTruong/job-matching-wcag22/apps/frontend/src/pages/note/EmployerBadge.tsx))**: Bộ điều kiện xác thực doanh nghiệp tăng độ tin cậy.

---

## 🛠️ Công Nghệ & Cấu Trúc Monorepo

Hệ thống được phát triển theo mô hình **Monorepo** quản lý bởi `pnpm`:

```
job-matching-wcag22/
├── apps/
│   ├── frontend/     # 💻 React SPA (Vite + TypeScript + TailwindCSS + Ant Design)
│   ├── backend/      # ⚙️ NestJS RESTful API (TypeORM + PostgreSQL + Swagger)
│   └── ai-tools/     # 🧠 FastAPI Python API (ONNX Runtime, FastEmbed, Pinecone, OpenRouter API)
├── start-dev.bat     # ⚡ Script tự động hóa cài đặt & khởi chạy trên Windows
├── start.sh          # ⚡ Script tự động cài đặt, build & chạy PM2 trên Ubuntu/Linux
├── ecosystem.config.js # 📝 Cấu hình quản lý tiến trình bằng PM2
├── seed_jobs.mjs     # 🗃️ Script nạp dữ liệu mẫu công việc ban đầu
└── sync_jobs_vector.mjs # 🔄 Script đồng bộ tin tuyển dụng sang Pinecone Vector DB
```

| Dịch vụ | Cổng chạy | Công nghệ chủ chốt |
|---|---|---|
| **Frontend** | `5173` | React 18, TypeScript, Vite, TailwindCSS, Ant Design, Web Speech API |
| **Backend** | `3000` | NestJS 11, TypeORM, PostgreSQL, Swagger OpenAPI, JWT, Nodemailer |
| **AI Tools** | `8000` | FastAPI, ONNX Runtime (`fastembed` cho 384-dim vectors), Pinecone DB, OpenRouter APIs |

---

## 🔑 Tài Khoản Trải Nghiệm Hệ Thống (Demo Accounts)

Để thuận tiện cho việc chạy thử nghiệm và đánh giá đầy đủ các luồng chức năng phân quyền trên hệ thống **JobAccess**, bạn có thể sử dụng các tài khoản cấu hình sẵn dưới đây:

> [!IMPORTANT]
> Tất cả mật khẩu đều có phân biệt chữ hoa, chữ thường và ký tự đặc biệt.

| Vai trò | Email | Mật khẩu | Tính năng chính có thể trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Ứng viên** (Candidate) | `candidate@jobmatching.com` | `Candidate123@` | Tìm kiếm việc làm bằng giọng nói, ứng tuyển, quản lý CV cá nhân, tạo CV chuyên nghiệp, tính lương Gross to Net. |
| **Nhà tuyển dụng** (Employer) | `employer@jobmatching.com` | `Employer123@` | Đăng tin tuyển dụng mới, quản lý danh sách tin tuyển dụng, duyệt hồ sơ ứng viên, sử dụng AI Generator JD & chấm điểm CV. |
| **Quản trị viên** (Admin) | `admin@jobmatching.com` | `Admin123@` | Quản lý người dùng, xem thống kê hệ thống, kiểm duyệt và cấp huy hiệu uy tín cho doanh nghiệp. |

---

## 📝 Cấu Hình Môi Trường (.env)

Trước khi chạy hệ thống, bạn cần thiết lập cấu hình môi trường `.env` cho từng ứng dụng bằng cách sao chép các tệp `.env.example` tương ứng.

### 1. Backend (`apps/backend/.env`)
Tạo tệp [apps/backend/.env](file:///d:/XuanTruong/job-matching-wcag22/apps/backend/.env) với các cấu hình sau:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Cấu hình Cơ sở dữ liệu PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=job_matching_db

# Chuỗi muối bảo mật cho mật khẩu
DB_PEPPER=your_pepper_secret_salt

# Cấu hình Token JWT
JWT_SECRET=your_jwt_secret_key_extremely_long_and_secure_to_satisfy_algorithms
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_extremely_long_and_secure_to_satisfy_algorithms
JWT_REFRESH_EXPIRATION=7d

# Cấu hình Email gửi thông báo (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_smtp_user@gmail.com
MAIL_PASS=your_smtp_app_password
MAIL_FROM="JobAccess Support" <your_smtp_user@gmail.com>

# Địa chỉ URL kết nối đến dịch vụ AI
AI_TOOLS_URL=http://localhost:8000/api/v1
```

### 2. AI Tools (`apps/ai-tools/.env`)
Tạo tệp [apps/ai-tools/.env](file:///d:/XuanTruong/job-matching-wcag22/apps/ai-tools/.env) để cấu hình Vector Database (Pinecone) và OpenRouter LLM:
```env
# Thông tin tài khoản Pinecone Vector DB
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment-region" # Ví dụ: us-east-1
PINECONE_INDEX_NAME="voice-navigation-index" # Phải cấu hình index với 384 dimensions

# Cấu hình Embeddings tạo Vector
EMBEDDING_MODEL_NAME="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
SEARCH_THRESHOLD=0.5

# Cấu hình FastAPI
API_V1_STR="/api/v1"
PROJECT_NAME="Voice to Text API"
CORS_ORIGINS=["*"]

# Khóa API kết nối OpenRouter để gọi các mô hình LLM thông minh
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="openrouter/free" # Hoặc google/gemini-2.5-flash
```

### 3. Frontend (`apps/frontend/.env`)
Tạo tệp [apps/frontend/.env](file:///d:/XuanTruong/job-matching-wcag22/apps/frontend/.env) để kết nối Frontend với các APIs:
```env
# Cấu hình Supabase (nếu có sử dụng các tính năng liên quan)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API URL kết nối dịch vụ Backend và AI
VITE_API_URL=http://localhost:3000/api/v1
VITE_AI_TOOLS_URL=http://localhost:8000/api/v1
```

---

## ⚙️ Hướng Dẫn Setup & Khởi Chạy Hệ Thống

Đảm bảo máy tính của bạn đã được cài đặt:
- **Node.js** phiên bản `>= 18`
- **Python** phiên bản từ `3.9 - 3.11` (để tương thích tối đa với thư viện xử lý AI và ONNX Runtime)
- **PostgreSQL** đang hoạt động

---

### 💻 PHƯƠNG ÁN 1: Sử dụng Script Khởi Chạy Tự Động (Khuyên dùng)

Hệ thống đã tích hợp sẵn các tập lệnh tự động kiểm tra phần mềm, thiết lập môi trường ảo và cài đặt thư viện để khởi chạy nhanh.

#### 1. Trên Windows (Môi trường Phát triển - Dev)
1. Tạo một cơ sở dữ liệu PostgreSQL trống tên là `job_matching_db` và cập nhật thông tin đăng nhập trong file `apps/backend/.env`.
2. Kích hoạt toàn bộ hệ thống bằng cách nhấp đúp vào tệp [start-dev.bat](file:///d:/XuanTruong/job-matching-wcag22/start-dev.bat) tại thư mục gốc của dự án.
3. Tập lệnh sẽ:
   * Kiểm tra và tự động cài đặt `pnpm` (nếu chưa có).
   * Thực hiện `pnpm install` để cài đặt dependencies cho frontend & backend.
   * Kiểm tra Python, tạo môi trường ảo `.venv` trong thư mục `apps/ai-tools` và cài đặt tự động các thư viện trong `requirements.txt`.
   * Mở 3 cửa sổ dòng lệnh riêng biệt để chạy 3 dịch vụ tương ứng:
     - **AI Tools (FastAPI)** tại `http://localhost:8000` (Tài liệu API tại `/docs`).
     - **Backend (NestJS)** tại `http://localhost:3000` (Tài liệu API tại `/api/docs`).
     - **Frontend (Vite + React)** tại `http://localhost:5173`.

#### 2. Trên Ubuntu/Linux (Môi trường Production)
1. Cấu hình các tệp `.env` phù hợp.
2. Phân quyền và chạy script [start.sh](file:///d:/XuanTruong/job-matching-wcag22/start.sh) tại thư mục gốc:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
3. Script sẽ tự động:
   * Kiểm tra và cài đặt `pnpm` & `pm2` toàn cục.
   * Cài đặt toàn bộ dependencies của Monorepo.
   * Xây dựng mã nguồn Production cho frontend & backend.
   * Thiết lập môi trường ảo Python `.venv` cho `ai-tools` và cài đặt các thư viện cần thiết.
   * Khởi chạy đồng thời 3 dịch vụ dưới dạng tiến trình chạy ngầm của PM2 (theo file `ecosystem.config.js`). Bạn có thể quản lý các tiến trình này qua lệnh `pm2 status` hoặc `pm2 logs`.

---

### 🛠️ PHƯƠNG ÁN 2: Setup Thủ Công Từng Bước (Manual Installation)

Nếu muốn tự thiết lập thủ công từng thành phần, hãy làm theo hướng dẫn sau:

#### Bước 1: Cài đặt các thư viện Node.js ở thư mục gốc
```bash
# Cài đặt pnpm nếu chưa có
npm install -g pnpm

# Cài đặt các packages cho toàn bộ dự án
pnpm install
```

#### Bước 2: Tạo Cơ sở dữ liệu PostgreSQL & Nạp Dữ Liệu Ban Đầu
1. Tạo database tên là `job_matching_db` trong hệ quản trị PostgreSQL của bạn.
2. Cấu hình chính xác tệp `apps/backend/.env` phù hợp với tài khoản PostgreSQL.
3. Chạy script để tự động tạo bảng và nạp dữ liệu mẫu ban đầu:
   ```bash
   pnpm seed:backend
   ```

#### Bước 3: Thiết lập môi trường Python cho AI Tools
1. Di chuyển vào thư mục dịch vụ AI:
   ```bash
   cd apps/ai-tools
   ```
2. Khởi tạo môi trường ảo:
   ```bash
   python -m venv .venv
   ```
3. Kích hoạt môi trường ảo:
   * Trên **Windows**:
     ```cmd
     .venv\Scripts\activate
     ```
   * Trên **Linux/macOS**:
     ```bash
     source .venv/bin/activate
     ```
4. Cài đặt các thư viện cần thiết:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
5. Quay lại thư mục gốc dự án:
   ```bash
   cd ../..
   ```

#### Bước 4: Đồng bộ hóa dữ liệu sang Pinecone Vector DB
Đảm bảo bạn đã cấu hình chính xác khóa API Pinecone (`PINECONE_API_KEY`) trong file `apps/ai-tools/.env`.
Chạy lệnh sau tại thư mục gốc để đồng bộ hóa dữ liệu công việc từ cơ sở dữ liệu PostgreSQL sang hệ thống tìm kiếm thông minh Vector:
```bash
pnpm sync:jobs
```

#### Bước 5: Khởi động thủ công các dịch vụ
Mở 3 cửa sổ dòng lệnh riêng biệt và chạy các lệnh dưới đây tại thư mục gốc của dự án:
* **Khởi động AI Tools**:
  ```bash
  pnpm dev:ai
  ```
* **Khởi động Backend**:
  ```bash
  pnpm dev:backend
  ```
* **Khởi động Frontend**:
  ```bash
  pnpm dev:frontend
  ```

---

## ♿ Quy Tắc Phát Triển Chuẩn Tiếp Cận (WCAG 2.2 Requirements)

Khi tham gia phát triển thêm tính năng hoặc giao diện mới cho dự án, vui lòng tuân thủ nghiêm ngặt các quy tắc trợ năng sau:
1. **Semantic HTML**: Luôn luôn sử dụng đúng các thẻ HTML5 có ý nghĩa cấu trúc ngữ nghĩa ngữ cảnh như `<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<button>`. Tránh lạm dụng thẻ `<div>` vô tội vạ.
2. **Accessible Forms**: Tất cả các trường dữ liệu input phải có thẻ `<label>` liên kết thông qua cặp thuộc tính `htmlFor` (trong React) và `id`. Không được bỏ trống thẻ `label` hoặc chỉ dùng thuộc tính `placeholder` làm phương án thay thế.
3. **Contrast Ratio**: Đảm bảo độ tương phản của văn bản thông thường đạt tỷ lệ tối thiểu là `4.5:1` và văn bản cỡ lớn tối thiểu là `3:1` so với màu nền.
4. **Focus Management**: Khi mở các hộp thoại popup, modal, bắt buộc phải thực hiện khóa tiêu điểm (focus trapping) ở bên trong modal đó, và hoàn trả tiêu điểm về nút kích hoạt ban đầu sau khi đóng hộp thoại để không làm gián đoạn người dùng bàn phím.
5. **No Mouse Dependency**: Đảm bảo mọi phần tử có thể click (`onClick`) đều có thể kích hoạt bằng bàn phím thông qua các phím `Enter` hoặc `Space` khi phần tử đó đang nhận tiêu điểm (focus).
6. **ARIA Roles & States**: Khai báo đầy đủ nhãn mô tả `aria-label` cho các nút bấm chỉ chứa hình ảnh và cập nhật trạng thái động thích hợp (`aria-expanded`, `aria-live="polite"`, `aria-checked`).

---

## 📄 Bản Quyền & Mục Tiêu Phát Triển

Dự án được xây dựng nhằm tạo ra một giải pháp công nghệ tuyển dụng công bằng, bình đẳng cho mọi đối tượng lao động xã hội, đặc biệt là nhóm người yếu thế trong xã hội. Mọi đóng góp và nâng cấp tính năng đều hướng đến tối ưu hóa trải nghiệm trợ năng đạt độ hoàn thiện cao nhất.
