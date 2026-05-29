# QUY TẮC TỔ CHỨC HỆ THỐNG (DAC MASTER RULES)

Tài liệu này là bộ quy chuẩn chung để áp dụng cấu trúc DAC vào **mọi dự án**. Khi bắt đầu một dự án mới, hãy tuân thủ các quy tắc dưới đây để duy trì tính nhất quán.

---

## 1. Cấu trúc thư mục Cốt lõi (Root Structure)
Mọi dự án phải tuân thủ 3 trụ cột thông tin chính:
*   **A_REQUIREMENTS**: Định nghĩa giá trị và kỳ vọng (Cái gì? Tại sao? Cho ai?).
*   **B_SYSTEM_DESIGN**: Định nghĩa giải pháp và tiêu chuẩn (Làm thế nào? Thẩm mỹ? Chất lượng?).
*   **C_IMPLEMENTATION**: Định nghĩa thực thi thực tế (Code? Quy trình? Triển khai?).

## 2. Quy tắc đặt tên & Thứ tự (Order Logic)
*   **Số thứ tự là bắt buộc**: Mọi file quan trọng phải bắt đầu bằng `[Phase][Số]_` (Ví dụ: `A0_`, `B1_`). Điều này tạo ra một "luồng tư duy" mạch lạc cho bất kỳ ai mới tiếp cận dự án.
*   **Tính kế thừa**: Nội dung của Phase sau (ví dụ Design) phải luôn tham chiếu và tuân thủ các "Standards" đã đặt ra ở Phase trước (ví dụ Requirements).

## 3. Quy chuẩn Nội dung File (Content Template)
Để đảm bảo chất lượng phân tích đồng nhất, mỗi file tài liệu nên trả lời được 3 câu hỏi:
1.  **Context (Bối cảnh)**: Tại sao tài liệu này tồn tại và nó giải quyết vấn đề gì cho dự án hiện tại?
2.  **Logic/Standard (Tiêu chuẩn)**: Các quy tắc, triết lý hoặc lý giải đằng sau giải pháp này là gì?
3.  **Outputs (Kết quả)**: Tài liệu này cung cấp đầu ra cụ thể gì cho bước tiếp theo?

## 4. Quản lý Thư mục con
*   Tạo thư mục con (ví dụ: `Pillars/`, `Assets/`) khi số lượng file cùng chủ đề vượt quá 3.
*   Mọi thư mục con phải có file `README.md` riêng để giải thích logic tổ chức bên trong nó.

---
> **QUAN TRỌNG**: Framework này được thiết kế để "Quản trị kết quả". Đừng biến nó thành nơi lưu trữ tài liệu rác. Mọi file được tạo ra phải đóng góp trực tiếp vào việc làm rõ hoặc thúc đẩy kết quả cuối cùng của dự án.
