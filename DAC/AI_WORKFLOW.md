# QUY TRÌNH ĐỌC DỮ LIỆU CỦA AI (AI DATA READING WORKFLOW)

Tài liệu này quy định các bước và danh sách file mà AI cần phải đọc trước khi thực hiện bất kỳ yêu cầu xây dựng (code, thiết kế, kiến trúc) nào từ người dùng. Điều này đảm bảo AI luôn có đầy đủ bối cảnh và tuân thủ các tiêu chuẩn của dự án.

---

## 1. Nguyên Tắc Chung
*   **Chủ động**: AI phải tự giác đọc các file liên quan trước khi trả lời hoặc thực thi, không đợi người dùng nhắc nhở.
*   **Đúng ngữ cảnh**: Tùy thuộc vào loại yêu cầu (UI, DB, API, Feature), AI sẽ chọn các file phù hợp để đọc.
*   **Tuân thủ**: Mọi đề xuất hoặc code tạo ra phải tuân thủ nghiêm ngặt các tiêu chuẩn đã định nghĩa trong các file tài liệu.

---

## 2. Quy Trình Thực Hiện (Workflow Steps)

Khi nhận được yêu cầu "Xây dựng/Tạo/Sửa" từ người dùng, AI sẽ thực hiện theo các bước sau:

1.  **Phân loại yêu cầu**: Xác định yêu cầu thuộc lĩnh vực nào (Frontend/UI, Backend/API, Database, Logic Feature, hay QC).
2.  **Xác định File cần đọc**: Tra cứu bảng mapping ở mục 3 để biết cần đọc những file nào.
3.  **Đọc dữ liệu**: Sử dụng công cụ đọc file để lấy nội dung các file đó.
4.  **Phân tích & Thực thi**: Đối chiếu yêu cầu của người dùng với tiêu chuẩn trong file để đưa ra giải pháp chính xác.

---

## 3. Bản Đồ Tra Cứu File Cần Đọc (File Reading Mapping)

### A. Khi yêu cầu liên quan đến FRONTEND / UI / UX
Cần đọc các file để đảm bảo tính thẩm mỹ, cấu trúc trang và tiêu chuẩn nội dung:
*   `DAC/A_REQUIREMENTS/A3_Sitemap.md`: Để hiểu cấu trúc điều hướng và vị trí trang.
*   `DAC/B_SYSTEM_DESIGN/B4_UI_Design_System.md`: Để áp dụng đúng màu sắc, typography, component và triết lý thiết kế (ví dụ: Warm Apple).
*   `DAC/A_REQUIREMENTS/A5_Content_Standards.md`: Để biết cách sử dụng từ ngữ và tone of voice.

### B. Khi yêu cầu liên quan đến BACKEND / API / HỆ THỐNG
Cần đọc các file để đảm bảo kiến trúc và tính toàn vẹn dữ liệu:
*   `DAC/B_SYSTEM_DESIGN/B3_System_Architecture.md`: Để hiểu mô hình kiến trúc chung.
*   `DAC/B_SYSTEM_DESIGN/B1_Database_Schema.md`: Để hiểu cấu trúc bảng và quan hệ dữ liệu.
*   `DAC/B_SYSTEM_DESIGN/B2_API_Design.md`: Để tuân thủ quy chuẩn đặt tên và cấu trúc API.

### C. Khi yêu cầu xây dựng TÍNH NĂNG MỚI (New Feature / Logic)
Cần đọc các file để hiểu nghiệp vụ và mong đợi của người dùng:
*   `DAC/A_REQUIREMENTS/A1.1_Functional_Requirements.md`: Để hiểu chi tiết các yêu cầu chức năng.
*   `DAC/A_REQUIREMENTS/A4_User_Stories.md`: Để hiểu ngữ cảnh sử dụng và luồng đi của người dùng.
*   `DAC/A_REQUIREMENTS/A2_Usecase_Diagram.md`: Để hình dung tổng quan các tác nhân và hành động.

### D. Khi yêu cầu liên quan đến KIỂM THỬ / ĐẢM BẢO CHẤT LƯỢNG (QC)
*   `DAC/B_SYSTEM_DESIGN/B5_QC_Standards.md`: Để biết các tiêu chuẩn kiểm thử và checklist cần hoàn thành.

---

## 4. Ngoại Lệ
*   Đối với các yêu cầu cực kỳ đơn giản (ví dụ: sửa lỗi chính tả, đổi tên biến đơn lẻ không ảnh hưởng logic), AI có thể bỏ qua bước đọc file để tối ưu tốc độ.
*   Nếu không chắc chắn cần đọc file nào, AI nên đọc `DAC/RULES.md` và `DAC/B_SYSTEM_DESIGN/B0_System_Design_Wiki.md` để lấy định hướng tổng quan.
