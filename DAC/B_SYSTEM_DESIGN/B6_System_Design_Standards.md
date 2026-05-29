# B6. SYSTEM DESIGN STANDARDS (TIÊU CHUẨN THIẾT KẾ HỆ THỐNG)

## 1. BỐI CẢNH & MỤC TIÊU
Tài liệu này là cầu nối giữa **Triết lý Phase A (Requirements)** và **Thực thi kỹ thuật**. Vì hệ thống phục vụ **1 học sinh duy nhất**, tiêu chuẩn hướng tới sự **Tinh gọn (Lean)**, tối ưu tốc độ và trải nghiệm người dùng mượt mà đỉnh cao kiểu Brilliant.

---

## 2. TRIẾT LÝ & LOGIC NGẦM

*   **Từ khóa 1: Goal-based Model (Thay thế Lesson-based)**
    *   *Hidden Logic*: Hệ thống không quản lý "Bài học", hệ thống quản lý "Tiến trình tạo ra Bằng chứng".
*   **Từ khóa 2: Lean & Zero-Cost**
    *   *Hidden Logic*: Không dùng dao mổ trâu để giết gà. Sử dụng hạ tầng Serverless miễn phí (Cloudflare) để tối ưu chi phí và vận hành cho 1 người dùng.
*   **Từ khóa 3: Motion for Emotion**
    *   *Hidden Logic*: Sử dụng Vanilla CSS để tạo ra các hiệu ứng chuyển động mượt mà, giúp người học không bị nhàm chán (kích thích Dopamine).

---

## 3. CẤU TRÚC HỆ THỐNG TỔNG QUÁT (ARCHITECTURE OVERVIEW)

1.  **Kiến trúc Tinh gọn (Lean Architecture):**
    *   **Frontend & API**: Next.js.
    *   **Data Storage**: Cloudflare KV (Lưu trữ Key-Value dạng JSON).
2.  **Hệ thống Xác thực (Auth):** Basic Auth hoặc NextAuth.js (Giới hạn email truy cập).
3.  **Hệ thống Giao diện (UI System) & State:** 
    *   Vanilla CSS để "may đo" hiệu ứng. Tuân thủ tuyệt đối nguyên tắc tối giản (Less is More), không lạm dụng viền cứng hay gạch dọc.
    *   **Sidebar State**: Quản lý trạng thái Toggle Sidebar cục bộ (ví dụ: dùng React Context hoặc thẻ `<input type="checkbox">` ẩn kết hợp CSS thuần) để đảm bảo độ mượt và Zero-latency.
    *   **Widget Data**: Các thành phần như Skill Map phải được component hóa (modularized) để tái sử dụng trên Dashboard, tách biệt luồng dữ liệu (Data-fetching) khỏi logic hiển thị UI.

---

## 4. TIÊU CHUẨN THỰC THI (STANDARDS)

### 4.1. Công nghệ cốt lõi (Techstack)
*   **Framework:** Next.js (App Router).
*   **Storage:** Cloudflare KV.
*   **UI/UX:** Vanilla CSS (Không dùng TailwindCSS để tránh gò bó hiệu ứng).

### 4.2. Quy tắc thiết kế Dữ liệu (KV Rules)
*   **Key Naming:** Phải tuân thủ quy tắc `prefix:identifier` (ví dụ: `exam:1`, `question:10`).
*   **JSON Only:** Toàn bộ Value lưu trong KV phải là chuỗi JSON hợp lệ.
*   **Single User Optimization:** Vì chỉ có 1 user, dữ liệu tiến độ (`progress`) được gộp chung thành 1 Key duy nhất để dễ đọc/ghi.

### 4.3. Quy tắc Bảo mật & Hiệu suất
*   **API Protection:** Sử dụng Next.js Middleware để chặn các truy cập không hợp lệ.
*   **Edge Caching:** Tận dụng CDN của Cloudflare để các file ảnh/audio bài tập tải lên tức thì.

### 4.4. Quản lý Trạng thái Bảo mật cục bộ (Role Switcher In-Memory Security)
Để ngăn chặn học sinh can thiệp trực tiếp vào DevTools để thay đổi Role mà không qua mã PIN, hệ thống phải tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật sau:
*   **In-Memory State Only**: Trạng thái vai trò hiện tại (`currentRole`) bắt buộc phải được lưu trữ thuần túy trong bộ nhớ RAM ứng dụng (React Context/Redux/Zustand Store) và KHÔNG được ghi trực tiếp dưới dạng văn bản thô (Plaintext) vào `LocalStorage` hoặc `Cookies` dài hạn.
*   **Session Token Encrypted**: Nếu cần duy trì trạng thái đăng nhập qua các lần Refresh trang trong phiên làm việc, thông tin vai trò đặc quyền (Tutor/Parent) phải được mã hóa bằng thuật toán đối xứng nhẹ (như AES-GCM) sử dụng một mã khóa ngẫu nhiên được sinh ra và biến đổi theo phiên (`sessionStorage`).
*   **Double-Check Verification**: Bất kỳ hành động nhạy cảm nào (xuất file báo cáo, tùy chỉnh lộ trình, reset dữ liệu) trên Dashboard Gia sư/Phụ huynh đều phải chạy qua hàm kiểm tra kép: so khớp SHA-256 của mã PIN do người dùng nhập với `parent_pin_hash` hoặc `tutor_pin_hash` lưu trong `user:current` trước khi trả kết quả giao diện, thay vì chỉ tin tưởng trạng thái vai trò lưu trong bộ nhớ.

### 4.5. Độ tin cậy của Cơ chế Tự động Lưu cục bộ (Auto-Save LocalStorage Reliability)
Hệ thống là ứng dụng phía client chạy trên trình duyệt và lưu tiến trình trực tiếp xuống `LocalStorage` trước khi đồng bộ đồng thời lên Cloudflare KV. Để triệt tiêu hoàn toàn rủi ro mất mát dữ liệu học tập do mất điện, tắt trình duyệt đột ngột hoặc lỗi mạng:
*   **Write-Ahead Log (WAL) Pattern**: Trước khi cập nhật vào khóa dữ liệu tiến độ chính (`progress`), hệ thống phải ghi nhận nhật ký giao dịch hành động thô (Transaction Log) vào khóa phụ `progress:pending_writes`. Sau khi lưu thành công vào `progress`, bản ghi phụ này mới được giải phóng.
*   **Debounced Smart Write**: Thực hiện trì hoãn ghi (Debouncing) 1000ms sau khi học sinh có tương tác (chọn đáp án, chuyển câu hỏi) để gộp các thay đổi nhỏ thành một phiên ghi duy nhất, giảm thiểu tần suất ghi đè ổ cứng vật lý và nâng cao hiệu năng trình duyệt.
*   **Automated Recovery Loop**: Khi ứng dụng khởi chạy (Onboarding/Reload), một tiến trình nền (Background Loop) sẽ tự động kiểm tra xem có giao dịch dang dở nào trong `progress:pending_writes` không. Nếu có, nó sẽ tự động phục hồi dữ liệu từ nhật ký giao dịch đó vào cơ sở dữ liệu `progress` chính.
*   **Optimistic Concurrency Control**: Dữ liệu `progress` phải đính kèm nhãn thời gian `last_updated` và số phiên bản tăng dần `version_id`. Khi tiến hành đồng bộ hóa với Cloudflare KV, hệ thống sẽ so khớp nhãn thời gian để giải quyết tranh chấp (Conflict Resolution) theo cơ chế "Client-side wins" nhưng có cảnh báo ghi đè nếu dữ liệu đám mây mới hơn.

---

## 5. RULES (AUDIT QUESTIONS FOR MANAGER)

1.  Hệ thống có đang dùng các công nghệ quá phức tạp (Over-engineering) cho 1 người học không?
2.  Giao diện có mượt mà và có các hiệu ứng chuyển động (Motion) hỗ trợ trải nghiệm không?
3.  Cấu trúc Key trong Cloudflare KV đã đặt đúng quy tắc chưa?
