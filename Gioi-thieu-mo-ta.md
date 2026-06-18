# THUYẾT MINH DỰ ÁN DỰ THI
## ĐỀ TÀI: JOBACCESS - HỆ THỐNG TÌM KIẾM VIỆC LÀM THÔNG MINH HỖ TRỢ NGƯỜI KHUYẾT TẬT ĐẠT TIÊU CHUẨN TIẾP CẬN WCAG 2.2

---

## 1. MỞ ĐẦU & BỐI CẢNH ĐỀ TÀI

### 1.1. Lý do chọn đề tài
Trong thời đại chuyển đổi số, công nghệ thông tin đã mở ra vô vàn cơ hội học tập và làm việc cho mọi người. Tuy nhiên, đối với hơn 6.2 triệu người khuyết tật tại Việt Nam (theo số liệu Tổng cục Thống kê), việc tiếp cận các dịch vụ số, đặc biệt là các nền tảng tuyển dụng và tìm kiếm việc làm, vẫn là một thách thức vô cùng lớn. 

Hầu hết các trang web tuyển dụng hiện nay được thiết kế tập trung vào trải nghiệm của người dùng phổ thông sử dụng chuột, lạm dụng nhiều hiệu ứng hình ảnh phức tạp, thiếu cấu trúc ngữ nghĩa chuẩn xác và hoàn toàn không tương thích với các thiết bị hỗ trợ trợ năng (như trình đọc màn hình hay điều hướng bàn phím). Điều này vô hình trung tạo ra rào cản ngăn người khuyết tật tìm kiếm cơ hội tự lập về mặt tài chính.

Nhận thức được thực tế đó, nhóm chúng em đã nghiên cứu và phát triển dự án **JobAccess** — Nền tảng tìm kiếm việc làm thông minh tích hợp Trợ lý giọng nói và Trình đọc màn hình nội bộ, được tối ưu hóa toàn diện theo các nguyên tắc cốt lõi của Tiêu chuẩn Tiếp cận Nội dung Web quốc tế **WCAG 2.2 (Web Content Accessibility Guidelines)** cấp độ AA.

### 1.2. Mục tiêu dự án
*   **Xây dựng giải pháp thu hẹp khoảng cách số:** Tạo ra một website tìm kiếm việc làm nơi người khuyết tật vận động, người khiếm thị có thể tương tác đầy đủ và dễ dàng.
*   **Tuân thủ toàn diện chuẩn WCAG 2.2 AA:** Trọng tâm phát triển không hướng đến một hệ thống thương mại quy mô lớn, mà tập trung tuyệt đối vào khả năng sử dụng thực tế của người khuyết tật và tính tuân thủ tiêu chuẩn trợ năng.
*   **Tích hợp công nghệ hỗ trợ thông minh:** Phát triển Trợ lý điều hướng giọng nói kết hợp Trình đọc màn hình (TTS) nội bộ để giúp người dùng khiếm thị có thể tương tác tự nhiên kể cả khi máy tính của họ không cài đặt phần mềm đọc màn hình chuyên dụng.

---

## 2. ĐỐI TƯỢNG NGƯỜI DÙNG HƯỚNG ĐẾN

Dự án JobAccess được thiết kế tối ưu hóa cho 3 nhóm đối tượng mục tiêu:

*   **Người khiếm thị hoặc giảm thị lực:** Nhóm người dùng hoàn toàn không thể nhìn thấy màn hình hoặc chỉ nhìn thấy một phần. Họ phụ thuộc hoàn toàn vào âm thanh phản hồi từ trình đọc màn hình (Screen Reader) và hệ thống hỗ trợ giọng nói.
*   **Người khuyết tật vận động cơ thể:** Nhóm người dùng gặp khó khăn trong việc điều khiển cơ tay hoặc không thể sử dụng chuột máy tính. Họ bắt buộc phải sử dụng bàn phím (phím `Tab`, `Enter`, phím mũi tên) hoặc các thiết bị chuyển mạch hỗ trợ để duyệt web.
*   **Doanh nghiệp và Nhà tuyển dụng xã hội:** Các đơn vị, doanh nghiệp mong muốn tìm kiếm ứng viên là người khuyết tật, thực hiện các chiến dịch tuyển dụng bình đẳng xã hội và xây dựng hình ảnh thương hiệu nhân văn.

---

## 3. CÁC CHỨC NĂNG CHÍNH CỦA SẢN PHẨM

Website **JobAccess** cung cấp đầy đủ các tính năng của một cổng thông tin việc làm chuyên nghiệp nhưng được nâng cấp bằng các công nghệ tương tác trợ năng vượt trội:

### 3.1. Trình đọc màn hình nội bộ (Web TTS Screen Reader)
Tích hợp trực tiếp công cụ chuyển văn bản thành giọng nói (Text-to-Speech) bằng tiếng Việt. Khi người dùng bật tính năng này qua **Bảng điều khiển Trợ năng (Popup góc dưới bên phải)**:
*   Mỗi khi nhấn phím `Tab` di chuyển tiêu điểm đến bất cứ phần tử nào (tiêu đề, nút, liên kết, form), hệ thống tự động phát âm rõ ràng nội dung bằng tiếng Việt (giọng đọc Google hoặc Microsoft chuẩn).
*   Cho phép lựa chọn 2 chế độ đọc: Tự động phát âm ngay khi di chuyển tiêu điểm, hoặc chỉ đọc khi người dùng nhấn phím `Enter` / `Shift + Enter` trên phần tử đang chọn.
*   Điều chỉnh linh hoạt tốc độ giọng đọc phù hợp với nhu cầu tiếp nhận thông tin của từng cá nhân.

### 3.2. Trợ lý Điều hướng bằng Giọng nói (Voice Assistant)
Hệ thống tích hợp công nghệ nhận dạng giọng nói tiếng Việt (Web Speech API). Người dùng chỉ cần giữ phím `Space` (Khoảng trắng) hoặc nhấn phím tắt `Alt + V` để nói các câu lệnh điều hướng:
*   Ví dụ: *"Về trang chủ"*, *"Tìm việc làm"*, *"Mở bảng tính lương"*, *"Đến trang viết CV"*, *"Xem báo cáo tiếp cận"*...
*   Trợ lý AI sẽ tự động phân tích câu lệnh, phản hồi bằng giọng nói và tự động chuyển hướng người dùng đến đúng trang đích trong vòng 1.2 giây mà không cần thao tác chuột hay gõ phím.

### 3.3. Quản lý Việc làm & Tuyển dụng thông minh
*   **Dành cho Ứng viên:** Tìm kiếm việc làm với bộ lọc thông minh; Nộp hồ sơ ứng tuyển trực tuyến; Xem danh sách việc làm đã ứng tuyển.
*   **Dành cho Nhà tuyển dụng:** Đăng tin tuyển dụng mới với form nhập liệu tối ưu hóa trợ năng; Quản lý hồ sơ ứng viên gửi về; Tra cứu hồ sơ ứng viên phù hợp qua bộ lọc tiện lợi.

### 3.4. Các công cụ bổ trợ nâng cao trải nghiệm
*   **Viết CV chuyên nghiệp:** Giao diện thiết kế form điền thông tin khoa học, hỗ trợ hoàn toàn việc nhập liệu bằng phím.
*   **Tính lương Gross sang Net:** Công cụ tính toán nhanh bảo hiểm, thuế thu nhập cá nhân bằng tiếng Việt trực quan.

---

## 4. GIẢI PHÁP ÁP DỤNG TIÊU CHUẨN TIẾP CẬN WCAG 2.2 AA

Nhóm chúng em đã hiện thực hóa các tiêu chuẩn kỹ thuật nghiêm ngặt của WCAG 2.2 AA thông qua các giải pháp công nghệ cụ thể như sau:

### 4.1. Nguyên tắc 1: Khả năng nhận biết (Perceivable)
*   **Nhãn thay thế cho nội dung phi văn bản (SC 1.1.1 - Non-text Content):** Tất cả các hình ảnh logo, avatar đều có mô tả thuộc tính `alt`. Toàn bộ các nút chỉ hiển thị icon (như nút Mic, nút menu) đều bắt buộc có thuộc tính `aria-label` mô tả rõ hành động bằng văn bản để trình đọc màn hình phát âm chuẩn xác.
*   **Tỷ lệ tương phản màu sắc đạt chuẩn (SC 1.4.3 - Contrast):** Màu sắc chủ đạo của website được phối hợp theo tỉ lệ tương phản vượt trội (đạt tối thiểu 4.5:1 đối với văn bản thường và 3:1 đối với văn bản lớn). Hệ thống hỗ trợ chế độ tương phản cao tự động (Forced Colors Mode) trên hệ điều hành Windows để bảo vệ thị lực người dùng.

### 4.2. Nguyên tắc 2: Khả năng vận hành (Operable)
*   **Điều hướng bằng bàn phím hoàn toàn (SC 2.1.1 - Keyboard):** Mọi chức năng từ tìm kiếm, điền form đăng ký, mở modal trợ lý giọng nói đều có thể kích hoạt bằng bàn phím. Không tồn tại bất kỳ "bẫy bàn phím" (Keyboard Trap) nào trên website.
*   **Đường dẫn bỏ qua nhanh (SC 2.4.1 - Bypass Blocks):** Tích hợp liên kết ẩn "Chuyển nhanh đến nội dung chính" ở vị trí đầu tiên của trang. Người dùng bàn phím chỉ cần nhấn phím `Tab` đầu tiên là có thể bỏ qua toàn bộ thanh menu điều hướng dài để đi thẳng vào nội dung cốt lõi của trang.
*   **Focus trực quan rõ ràng (SC 2.4.7 - Focus Visible & SC 2.4.11 - Focus Appearance):** Thiết lập đường viền outline bo góc màu xanh lục (`primary-600`) dày 3px cách biệt rõ rệt khi bất kỳ phần tử nào được chọn bằng bàn phím. Các thẻ văn bản thường cũng được chèn `tabindex="0"` động để người dùng khiếm thị có thể tab đến và nghe đọc nội dung cụ thể.

### 4.3. Nguyên tắc 3: Khả năng hiểu (Understandable)
*   **Ngôn ngữ trang web chuẩn hóa (SC 3.1.1 - Language of Page):** Khai báo rõ ràng `<html lang="vi">` ở tệp mã nguồn gốc để định hướng các trình đọc màn hình tải đúng từ điển phát âm tiếng Việt.
*   **Gợi ý lỗi biểu mẫu (SC 3.3.1 - Error Identification & SC 3.3.3 - Error Suggestion):** Khi người dùng nhập sai định dạng form (ví dụ: thiếu mật khẩu hoặc sai email), hệ thống sẽ hiển thị mô tả lỗi trực quan ngay dưới ô nhập liệu và liên kết với thuộc tính `aria-describedby` để thông báo bằng giọng nói tức thì cho người dùng.

### 4.4. Nguyên tắc 4: Khả năng tương thích (Robust)
*   **Tương thích tối đa với công nghệ trợ giúp (SC 4.1.2 - Name, Role, Value):** Website được viết bằng mã nguồn HTML5 ngữ nghĩa kết hợp với hệ thống nhãn ARIA (như `role="dialog"`, `aria-modal="true"`, `aria-expanded`) đảm bảo tính tương thích và tương tác mượt mà trên tất cả các trình duyệt hiện đại cũng như các phần mềm đọc màn hình thông dụng hiện nay (như NVDA, VoiceOver, TalkBack).

---

## 5. KẾT LUẬN & HƯỚNG PHÁT TRIỂN

Dự án **JobAccess** là minh chứng rõ nét cho việc ứng dụng công nghệ để tạo dựng một thế giới số phẳng và bình đẳng. Bằng việc tuân thủ chặt chẽ tiêu chuẩn **WCAG 2.2 AA**, sản phẩm không chỉ mang lại giá trị sử dụng to lớn cho cộng đồng người khuyết tật, khiếm thị tại Việt Nam mà còn là một báo cáo kỹ thuật hoàn chỉnh cho thấy khả năng lập trình trợ năng chuyên nghiệp của sinh viên.

Trong tương lai, nhóm chúng em định hướng sẽ tích hợp thêm công nghệ Trí tuệ nhân tạo (AI) học sâu để có thể tự động nhận dạng và mô tả chi tiết nội dung hình ảnh một cách tự động, nâng cấp bộ lọc tìm kiếm việc làm bằng ngôn ngữ tự nhiên thông minh hơn nữa, nhằm hiện thực hóa sứ mệnh đồng hành cùng người khuyết tật trên con đường tìm kiếm sự bình đẳng nghề nghiệp.
