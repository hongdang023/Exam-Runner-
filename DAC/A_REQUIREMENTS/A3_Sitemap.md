# A3. SITEMAP (KIẾN TRÚC THÔNG TIN)

## 1. BỐI CẢNH & MỤC TIÊU

Sitemap trong DAC là sơ đồ kiến trúc các "căn phòng" trong ngôi nhà kết quả. Mục tiêu là đảm bảo người dùng luôn biết mình đang ở đâu và đường ngắn nhất để đến nơi tạo ra giá trị.

## 2. TRIẾT LÝ & LOGIC NGẦM

- **Navigation for Results**: Điều hướng không phải để đi dạo, điều hướng là để dẫn đến hành động.
- **Theoretical Framework**:
  - **Information Architecture (IA)**: Tổ chức phân cấp thông tin hợp lý.
  - **Rule of 3 Clicks**: Người dùng phải tìm thấy nơi thực thi nhiệm vụ trong tối đa 3 lần nhấp chuột.

## 3. CẤU TRÚC NỘI DUNG (PHÂN THEO VAI TRÒ & KHU VỰC)

Sitemap được cấu trúc dựa trên vai trò của người dùng và mục đích sử dụng:

1.  **Khởi tạo**: Đăng Nhập, Onboarding (Thiết lập mục tiêu, mã PIN).
2.  **Học Sinh**: Dashboard, Skill Map, Phòng Thi, Luyện Tập (Adaptive/Skill Drill), Flashcards, Ngữ Pháp.
3.  **Phụ Huynh & Gia Sư (Mở khóa bằng PIN)**: Góc Phụ Huynh, Phân Tích lỗi, Lộ Trình, Kho Đề.

## 4. TIÊU CHUẨN THỰC THI (STANDARDS)

### 4.1. Sơ đồ phân cấp (Tree Diagram & Sidebar)

*Hệ thống sử dụng **Toggle Sidebar** (Thanh điều hướng có thể thu gọn) làm khung xương chính cho mọi thao tác, giúp tối ưu hóa không gian làm bài (Focus Mode).*

```text
Root (Exam Runner)
├── Khởi tạo
│   ├── Đăng Nhập
│   └── Onboarding (Thiết lập mục tiêu, mã PIN)
├── Học Sinh (Giao diện mặc định)
│   ├── Dashboard (Tiến độ, Streak 🔥)
│   ├── Skill Map (Bản đồ kỹ năng)
│   ├── Phòng Thi (Focus Mode, Countdown)
│   ├── Luyện Tập (Adaptive Retry, Skill Drill)
│   ├── Flashcards
│   └── Ngữ Pháp
└── Phụ Huynh / Gia Sư (Mở khóa bằng mã PIN qua Role Switcher)
    ├── Góc Phụ Huynh (Sức khỏe học tập, Lời khuyên)
    └── Admin (Gia Sư)
        ├── Phân Tích (Báo cáo lỗi sai)
        ├── Lộ Trình (Điều chỉnh Deadline)
        └── Kho Đề (Nhập JSON, gắn tag)
```

### 4.2. Bảng quản trị trang (Dựa trên PRD)

| Tên Trang              | Khu vực   | Mục tiêu Outcome         | Chức năng/Nội dung chính                           |
| :--------------------- | :-------- | :----------------------- | :------------------------------------------------- |
| Dashboard              | Học Sinh  | Xem tổng quan tiến độ    | Countdown, Biểu đồ tiến độ, Danh sách đề.          |
| Skill Map              | Học Sinh  | Trực quan hóa lộ trình   | Bản đồ mạng lưới kỹ năng, tiến độ trực quan.       |
| Phòng Thi              | Học Sinh  | Thực thi làm bài         | Tự động thu gọn Sidebar (Focus Mode).              |
| Kết Quả                | Học Sinh  | Nhận biết lỗi sai và học | Điểm số, Đáp án chi tiết (5 bước), Link lý thuyết. |
| Luyện Tập              | Học Sinh  | Rèn luyện & Vá lỗi       | Adaptive Retry (vá lỗ hổng), Skill Drill.          |
| Flashcards             | Học Sinh  | Ôn tập từ vựng           | Thuật toán Spaced Repetition, Lật thẻ.             |
| Ngữ Pháp               | Học Sinh  | Bù hổng kiến thức        | Tra cứu lý thuyết theo tag ma trận.                |
| Góc Phụ Huynh          | Phụ Huynh | Theo dõi nỗ lực của con  | [PIN] Biểu đồ vùng màu, Lời khuyên đồng hành.      |
| Kho Đề                 | Gia Sư    | Hệ thống hóa tài liệu    | [PIN] Nhập câu hỏi, Upload đề JSON cục bộ.         |
| Lộ Trình               | Gia Sư    | Điều chỉnh kế hoạch      | [PIN] Tùy chỉnh Deadline, ngày thi.                |

## 5. BIẾN THỂ & TRƯỜNG HỢP BIÊN (EDGE CASES)

- **Hệ thống phân quyền**: Học sinh không xem được trang Quản lý Kho đề. Phụ huynh chỉ xem được Dashboard báo cáo.
- **Trang 404**: Phải dẫn học sinh quay lại Dashboard để tiếp tục làm bài, không để đứt gãy momentum.

## 6. RULES (AUDIT QUESTIONS)

1. Trang này có đóng góp vào việc tạo ra **Outcome** không? Nếu không, nó có thực sự cần thiết?
2. Từ trang này, người dùng có thể quay lại **Khu vực Học sinh** trong 1 click không?
3. Cấu trúc menu có phản ánh đúng **Lộ trình (Path)** của người dùng không?
