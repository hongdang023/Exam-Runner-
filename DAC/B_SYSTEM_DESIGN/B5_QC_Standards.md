# B2. QC MASTER STANDARDS (TIÊU CHUẨN KIỂM SOÁT CHẤT LƯỢNG TỔNG QUÁT)

## 1. BỐI CẢNH & MỤC TIÊU
Trong khung DAC, Kiểm soát chất lượng (QC) không chỉ là tìm lỗi phần mềm, mà là **Kiểm soát dòng giá trị (Value Flow)**. Tài liệu này đóng vai trò là "Master Template" để đảm bảo mọi hệ thống đều vận hành đúng mục tiêu: Đưa người dùng đến Kết quả (Outcome) một cách nhanh nhất và ít rào cản nhất.

---

## 2. TRIẾT LÝ & LOGIC NGẦM

*   **Từ khóa 1: Outcome-Driven Audit (Kiểm định hướng đích)**
    *   *Hidden Logic*: Mọi hoạt động của người dùng (Process) đều vô nghĩa nếu không tạo ra Bằng chứng (Proof) về sự thay đổi. QC tập trung vào việc xác thực tính chân thực của các Proof này.
*   **Từ khóa 2: Velocity of Action (Tốc độ thực thi)**
    *   *Hidden Logic*: Khoảng cách giữa "Ý định" và "Hành động" càng xa, xác suất bỏ cuộc càng cao. QC phải đo lường được độ trễ này để can thiệp kịp thời.
*   **Từ khóa 3: Zero-Obstacle Reliability (Độ tin cậy tuyệt đối)**
    *   *Hidden Logic*: Bug kỹ thuật là rào cản tâm lý. Một hệ thống tin cậy tạo ra một người dùng cam kết. QC duy trì trạng thái "Sạch lỗi" để bảo vệ Momentum.

---

## 3. CẤU TRÚC HỆ THỐNG QC (UNIVERSAL FRAMEWORK)

1.  **Hệ thống Metric Giá trị (Value Metrics):**
    *   **Outcome Completion Rate**: Tỷ lệ đạt được kết quả cuối cùng.
    *   **Action Velocity**: Tốc độ chuyển hóa từ Mục tiêu thành Hành động.
2.  **Cơ chế Cảnh báo Rò rỉ (Leakage Detection):**
    *   **Retention Triggers**: Cảnh báo tự động khi người dùng dừng hành động quá thời gian quy định (Threshold).
    *   **Milestone Audits**: Kiểm định định kỳ theo các cột mốc quan trọng của dự án.
3.  **Bảo vệ Luồng chính (Core Loop Protection):**
    *   Automated Testing cho các User Paths mang lại giá trị cốt lõi.
4.  **Giám sát & Trị liệu (Monitoring & Remediation):**
    *   Quy tắc **Inbox Zero** cho mọi lỗi phát sinh (Sentry/Log monitoring).

---

## 4. TIÊU CHUẨN THỰC THI (STANDARDS)

### 4.1. Định nghĩa Metric tùy biến (Mapping)
Mỗi dự án phải tự định nghĩa bảng Mapping sau:
| Loại dự án | Outcome (Kết quả) | Proof (Bằng chứng) | Milestone (Cột mốc) |
| :--- | :--- | :--- | :--- |
| **LMS/Coaching** | Kiến thức/Kỹ năng mới | Bài tập/Video thực hành | Tuần 1, Tuần 4, Cuối khóa |
| **SaaS/Tool** | Công việc hoàn thành | Log/File xuất bản | Lần đầu setup, 100 action |
| **E-commerce** | Sở hữu sản phẩm | Đơn hàng thành công | Thanh toán, Nhận hàng |

### 4.2. Tiêu chuẩn Kỹ thuật & Tự động hóa
*   **Audit Tooling**: Sử dụng các công cụ rà soát tự động (như Context7 hoặc tương đương) hàng tuần.
*   **Automated Testing**: Phải bao phủ 100% các luồng "Tạo ra giá trị" (Value-generating flows).
*   **Sentry Management**: Phân loại lỗi theo mức độ ảnh hưởng đến Outcome (Critical, Major, Minor).

---

## 5. BIẾN THỂ & TRƯỜNG HỢP BIÊN (EDGE CASES)

*   **Trường hợp "Ghost Actions":** Người dùng tạo ra các hành động giả không có giá trị thật.
    *   *Giải pháp*: Thêm lớp xác thực bằng chứng (Proof Validation Layer) qua AI hoặc Review.
*   **Trường hợp "Momentum Drop":** Dự án quá dài khiến người dùng mệt mỏi.
    *   *Giải pháp*: Chia nhỏ Milestone thành các Sub-goals với phần thưởng tức thì (Instant Rewards).
*   **Trường hợp "System Noise":** Các thông báo cảnh báo bị bỏ qua do quá nhiều.
    *   *Giải pháp*: Escalation Policy - Tăng cấp độ cảnh báo lên Manager nếu không được xử lý.

---

## 6. RULES (AUDIT QUESTIONS FOR MASTER TEMPLATE)

1.  Hệ thống đang đo lường "Hành vi phụ" hay "Kết quả chính"?
2.  Tốc độ chuyển hóa (Action Velocity) đang tăng hay giảm so với tuần trước?
3.  Có bao nhiêu "điểm nghẽn" kỹ thuật đang ngăn cản người dùng nộp bằng chứng?
4.  Cơ chế cảnh báo (Triggers) đã được cá nhân hóa theo từng loại User chưa?

---
*Master Template được thiết kế để áp dụng cho mọi dự án trong hệ sinh thái DAC.*
