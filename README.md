# ♿ JobAccess - Nền Tảng Tuyển Dụng Hỗ Trợ Tiếp Cận & Tìm Kiếm Thông Minh (WCAG 2.2 AA)

**JobAccess** là nền tảng tìm kiếm việc làm đầu tiên tại Việt Nam được thiết kế và xây dựng theo chuẩn tiếp cận web quốc tế **WCAG 2.2 AA (Web Content Accessibility Guidelines)**, nhằm hỗ trợ tối đa cho người khuyết tật, người khiếm thị và người hạn chế khả năng vận động. Tích hợp các công nghệ Trí tuệ nhân tạo (AI) hiện đại như **Speech-to-Text (Voice Search)**, **AI Job Matching (Vector Search)** và **AI HR Assistants**.

---

## 🚀 Tính Năng Cốt Lõi

### 1. ♿ Tiêu chuẩn Tiếp Cận Số (Accessibility - WCAG 2.2 AA)
* **Skip Link (Đường dẫn bỏ qua nhanh)**: Cho phép chuyển ngay tới phần nội dung chính bằng bàn phím mà không phải đi qua header.
* **Bàn phím toàn diện (Keyboard Accessible)**: Hoạt động đầy đủ 100% bằng phím Tab, các phím mũi tên và phím tắt `Escape` để đóng menu/modal.
* **Tối ưu Screen Reader (ARIA Compliance)**: Sử dụng chính xác các ARIA roles, labels, states (`aria-live="polite"`, `role="tablist"`, v.v.) hỗ trợ hoàn hảo cho NVDA và VoiceOver.
* **Focus Indicator rõ nét**: Đường viền focus nổi bật giúp người dùng dễ dàng định vị vị trí hiện tại trên màn hình.
* **Kích thước vùng chạm (Tap Targets)**: Các nút thao tác trên thiết bị di động tối thiểu đạt 44x44px.
* **Chế độ forced-colors & giảm chuyển động**: Bảo vệ người nhạy cảm với ánh sáng và hỗ trợ độ tương phản cực tốt.

### 2. 🎙️ Điều Hướng & Tìm Kiếm Bằng Giọng Nói (Voice Command & AI Search)
* **Tìm kiếm bằng giọng nói**: Chỉ cần nhấn nút Microphone, nói từ khóa mong muốn (ví dụ: *"Tôi muốn tìm việc làm lập trình viên ở Đà Nẵng"*), mô hình AI sẽ tự động phân tích và trả về kết quả.
* **Điều hướng bằng giọng nói**: Hỗ trợ ra lệnh bằng giọng nói để di chuyển giữa các trang chức năng (ví dụ: *"Về trang chủ"*, *"Đến trang viết CV"*, *"Mở bảng tính lương"*).

### 3. 🎯 Giải Pháp Nhân Sự & Công Cụ Tiện Ích Thông Minh
* **Viết CV chuyên nghiệp ([CvBuilder](apps/frontend/src/pages/note/CvBuilder.tsx))**: Soạn thảo thông tin thực tế, hiển thị bản xem trước sang trọng và hỗ trợ in/tải PDF trực tuyến.
* **Tính lương Gross to Net ([GrossToNet](apps/frontend/src/pages/note/GrossToNet.tsx))**: Bảng tính bảo hiểm (BHXH, BHYT, BHTN) và thuế TNCN lũy tiến theo quy chuẩn luật lao động Việt Nam mới nhất năm 2026.
* **Giải pháp nhân sự AI ([AiHrSolutions](apps/frontend/src/pages/note/AiHrSolutions.tsx))**: Khởi tạo bản tả công việc (JD) nhanh từ từ khóa chính và chấm điểm, tính toán tỷ lệ tương thích (%) giữa CV của ứng viên với JD.
* **Tìm kiếm ứng viên & Tin đăng**: Giao diện tìm kiếm hồ sơ nâng cao cho doanh nghiệp và quản lý tin tuyển dụng.
* **Huy hiệu nhà tuyển dụng uy tín ([EmployerBadge](apps/frontend/src/pages/note/EmployerBadge.tsx))**: Bộ điều kiện xác thực doanh nghiệp tăng độ tin cậy.

---

## 🛠️ Công Nghệ Sử Dụng

Hệ thống được phát triển theo mô hình **Monorepo** quản lý bởi `pnpm`:

```
job-matching-wcag22
├── apps/
│   ├── frontend/     # 💻 React SPA (Vite + TypeScript + TailwindCSS + AntD)
│   ├── backend/      # ⚙️ NestJS RESTful API (TypeORM + PostgreSQL + Swagger)
│   └── ai-tools/     # 🧠 FastAPI Python API (Faster-Whisper, Sentence-Transformers, Pinecone)
```

| Thành phần | Công nghệ chủ chốt |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Ant Design, Lucide Icons, React Router 6 |
| **Backend** | NestJS 11, TypeORM, PostgreSQL, Swagger OpenAPIs, JWT Authentication |
| **AI / Speech** | Python 3, FastAPI, **Faster-Whisper** (Speech-to-Text cục bộ siêu nhanh), **Sentence-Transformers** (Tạo vector nhúng text), **Pinecone** (Cơ sở dữ liệu Vector lưu trữ dữ liệu việc làm tuyển dụng) |

---

## ⚙️ Yêu Cầu Cài Đặt Hệ Thống

* **Node.js** phiên bản `>= 18`
* **PNPM** phiên bản `>= 8` (khuyên dùng để quản lý monorepo)
* **Python** phiên bản `3.9 - 3.11` (để chạy các công cụ AI)
* **PostgreSQL** (cơ sở dữ liệu chính)
* **Tài khoản Pinecone** (để thực hiện lưu trữ Vector DB so khớp ngữ nghĩa)

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Local Development)

### Bước 1: Clone dự án và cài đặt Node dependencies
```bash
git clone <repository_url> job-matching-wcag22
cd job-matching-wcag22
pnpm install
```

### Bước 2: Thiết lập cơ sở dữ liệu PostgreSQL & Môi trường
1. Tạo một cơ sở dữ liệu PostgreSQL rỗng (ví dụ tên: `job_matching`).
2. Thiết lập các tệp cấu hình môi trường `.env` tại các thư mục:
   * **Backend**: Copy tệp `apps/backend/.env.example` thành `.env` và điền cấu hình PostgreSQL.
   * **AI Tools**: Copy tệp `apps/ai-tools/.env.example` thành `.env` và điền khóa API Pinecone của bạn.

### Bước 3: Cài đặt môi trường ảo Python cho AI Tools
Di chuyển vào thư mục `apps/ai-tools`, khởi tạo môi trường ảo và cài đặt thư viện:
```bash
cd apps/ai-tools
python -m venv .venv
.venv\Scripts\activate      # Trên Windows
source .venv/bin/activate   # Trên macOS/Linux
pip install -r requirements.txt
```

### Bước 4: Khởi tạo dữ liệu mẫu (Database Seeding) & Đồng bộ Vector
Quay lại thư mục gốc dự án và chạy các script để nạp dữ liệu mẫu vào PostgreSQL cũng như đồng bộ hóa dữ liệu tin tuyển dụng sang cơ sở dữ liệu Vector (Pinecone):
```bash
# Nạp dữ liệu vào Postgres
pnpm seed:backend

# Đồng bộ hóa dữ liệu việc làm sang Pinecone Vector DB
pnpm sync:jobs
```

### Bước 5: Chạy tất cả dịch vụ cùng lúc
Trên Windows, bạn có thể nhấp đúp vào tệp script [start-dev.bat](file:///d:/XuanTruong/job-matching-wcag22/start-dev.bat) ở thư mục gốc để tự động khởi động cả 3 dịch vụ trong các cửa sổ dòng lệnh riêng biệt:
* **AI Tools (FastAPI)**: Chạy trên cổng `8000` (Tài liệu API tại `http://localhost:8000/docs`)
* **Backend (NestJS)**: Chạy trên cổng `3000` (Tài liệu API tại `http://localhost:3000/api/docs`)
* **Frontend (Vite + React)**: Chạy trên cổng `5173` (Truy cập tại `http://localhost:5173`)

*Hoặc khởi chạy thủ công bằng các lệnh:*
```bash
pnpm dev:backend   # Cửa sổ 1
pnpm dev:ai        # Cửa sổ 2
pnpm dev:frontend  # Cửa sổ 3
```

---

## ♿ Quy Tắc Phát Triển Chuẩn Tiếp Cận (WCAG 2.2 Requirements)

Khi phát triển thêm tính năng mới, hãy luôn tuân thủ các quy tắc sau:
1. **Semantic HTML**: Sử dụng đúng thẻ ngữ nghĩa (`<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<button>`).
2. **Accessible Forms**: Tất cả các trường nhập liệu phải có `<label>` liên kết qua `htmlFor` và `id`. Không bao giờ bỏ trống thẻ `label` hoặc dùng `placeholder` thay thế label.
3. **Contrast Ratio**: Độ tương phản văn bản chữ thường tối thiểu là `4.5:1` và chữ lớn là `3:1` so với nền.
4. **Focus Management**: Khi mở các hộp thoại modal, bắt buộc khóa tiêu điểm (focus trapping) ở bên trong modal đó, và hoàn trả tiêu điểm về nút kích hoạt sau khi đóng hộp thoại.
5. **No Mouse Dependency**: Đảm bảo tất cả sự kiện `onClick` đều có thể kích hoạt bằng cách nhấn phím `Enter` hoặc `Space` khi nút đang được focus.

---

## 📄 Bản Quyền
Dự án được phát triển nhằm mục đích xây dựng giải pháp công nghệ tuyển dụng công bằng, bình đẳng cho mọi đối tượng lao động xã hội.
