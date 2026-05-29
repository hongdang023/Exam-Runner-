# PHASE B: SYSTEM DESIGN (THIẾT KẾ HỆ THỐNG)

## 1. TỔNG QUAN
Giai đoạn này chuyển đổi các triết lý và yêu cầu từ **Phase A (Requirements)** thành giải pháp kỹ thuật cụ thể. Mục tiêu cốt lõi là xây dựng một hệ thống tinh gọn, mượt mà (Zero-Obstacle) phục vụ cho bối cảnh 1 học sinh luyện đề lớp 10.

---

## 2. CẤU TRÚC THƯ MỤC & TÀI LIỆU

Dưới đây là sơ đồ các thành phần cấu thành nên hệ thống thiết kế thực tế:

### 📘 Tài liệu Cốt lõi (Core Design)
*   **[B1_Database_Schema.md]**: Thiết kế cấu trúc dữ liệu Cloudflare KV cho đề thi, câu hỏi, flashcard và tiến độ.
*   **[B2_API_Design.md]**: Định nghĩa các RESTful API endpoints cho Onboarding, Luyện đề, Flashcard và Quản trị.
*   **[B3_System_Architecture.md]**: Kiến trúc Fullstack Next.js + Cloudflare KV tinh gọn.

### 🎨 Tiêu chuẩn & Chất lượng (Thừa kế)
*   **[B4_UI_Design_System.md]**: Hệ thống ngôn ngữ thiết kế (Design Tokens, Components) đảm bảo triết lý "Zero-Confusion".
*   **[B5_QC_Standards.md]**: Tiêu chuẩn kiểm soát chất lượng đầu ra (Quality Control).
*   **[B6_System_Design_Standards.md]**: Tài liệu nền tảng về triết lý thiết kế chung.
*   **[B0_System_Design_Wiki.md]**: Hệ thống Wiki kỹ thuật tra cứu thuật ngữ.

---

## 3. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1.  **Outcome-Based**: Hệ thống tập trung vào việc tạo ra kết quả (điểm số, từ vựng thuộc) thay vì chỉ lưu trữ tài liệu.
2.  **Lean & Zero-Ops**: Ưu tiên các giải pháp Serverless (Next.js) và Cloudflare KV để không tốn công quản trị hạ tầng.
3.  **Instant Feedback**: Tạo ra sự hưng phấn và Momentum thông qua việc chấm điểm và giải thích 5 bước ngay lập tức.
4.  **Zero-Obstacle UX**: Loại bỏ mọi rào cản kỹ thuật khiến Momentum của học sinh bị khựng lại.

---

## 4. CÂU HỎI KIỂM SOÁT (AUDIT QUESTIONS)

*   Cấu trúc dữ liệu đã hỗ trợ gắn tag ma trận 3 trục cho câu hỏi chưa?
*   Các API đã phục vụ đủ 16 yêu cầu chức năng (FR) chưa?
*   Giao diện đã tối ưu cho mobile-first chưa?
*   Hệ thống đã có cơ chế tự động lưu (Auto-save) khi làm bài chưa?

---
*Tài liệu này được duy trì và cập nhật liên tục để phản ánh trạng thái thực tế của hệ thống.*
