# Nghiên cứu: Lộ trình ôn tập Cá nhân hóa (Personalized Learning Path)

Tài liệu này phân tích các mô hình học tập cá nhân hóa hàng đầu thế giới để áp dụng cho dự án **Exam Runner**.

## 5 Tiêu chí cốt lõi của một hệ thống ôn luyện Cá nhân hóa

1.  **Đánh giá thích ứng (Adaptive Assessment):** Hệ thống không chỉ chấm đúng/sai mà còn phân tích "Knowledge Space" (Không gian tri thức) của học sinh để biết chính xác những gì học sinh đã biết và những gì "Sẵn sàng để học" (Ready to Learn) tiếp theo.
2.  **Lộ trình dựa trên Năng lực (Mastery-based Progression):** Học sinh không chuyển sang chủ đề nâng cao nếu chưa đạt được mức độ thành thạo (thường là 80-90%) ở các chủ đề nền tảng. Điều này ngăn chặn việc "hổng kiến thức" tích lũy.
3.  **Lặp lại ngắt quãng (Spaced Repetition) & Học tập vi mô (Microlearning):** Tự động đẩy lại các kiến thức/câu hỏi đã sai vào các thời điểm tối ưu để chuyển thông tin từ trí nhớ ngắn hạn sang dài hạn. Kiến thức được chia nhỏ thành các module dễ hấp thụ.
4.  **Phản hồi Socratic & AI Tutoring:** Thay vì chỉ đưa ra đáp án, hệ thống đóng vai trò người hướng dẫn, đặt câu hỏi gợi mở hoặc giải thích sâu về bản chất (tại sao chọn A mà không chọn B) dựa trên ngữ cảnh sai của học sinh.
5.  **Dữ liệu thấu cảm (Empathic Data Analytics):** Cung cấp cho Stakeholders (Giáo viên/Phụ huynh) không chỉ con số điểm mà còn là "bức tranh sức khỏe kiến thức" và các hành động cụ thể cần phối hợp (Actionable Insights).

---

## Top 3 Mẫu hình Luyện đề hàng đầu thế giới

### 1. ALEKS (McGraw Hill) - Mô hình "Knowledge Space Theory"
*   **Cơ chế:** Sử dụng thuật toán dựa trên lý thuyết không gian tri thức để xác định "Pie chart" kiến thức của học sinh.
*   **Ứng dụng cho Exam Runner:** Áp dụng ma trận đề thi vào 10 để tạo ra một "Bản đồ kiến thức". Mỗi câu hỏi trong bộ 50 đề được gắn tag (Phonetics, Passive Voice, Relative Clause...). Khi học sinh sai 1 câu, hệ thống biết chính xác "miếng bánh" kiến thức nào đang bị khuyết.

### 2. Khan Academy - Mô hình "Mastery Learning"
*   **Cơ chế:** Chia nhỏ kiến thức thành các "Skills" và "Unit". Học sinh làm bài tập thực hành đến khi đạt trạng thái "Proficient" hoặc "Mastered".
*   **Ứng dụng cho Exam Runner:** Tạo ra các "Exercise Generators" từ dễ đến khó cho từng chủ điểm ngữ pháp. Ví dụ: Nếu học sinh sai câu Điều kiện loại 2 trong đề số 5, hệ thống sẽ mở khóa một module luyện riêng về chủ đề này với mức độ tăng dần.

### 3. Duolingo - Thuật toán "Birdbrain" & Spaced Repetition
*   **Cơ chế:** Thuật toán dự đoán xác suất học sinh sẽ trả lời đúng một câu hỏi dựa trên lịch sử học tập. Nếu xác suất quá cao (quá dễ) hoặc quá thấp (quá khó), nó sẽ điều chỉnh để giữ học sinh trong "vùng thử thách tối ưu".
*   **Ứng dụng cho Exam Runner:** Tự động hóa việc "chữa đề" cá nhân hóa. Buổi chiều (Phase 2), hệ thống sẽ chọn lọc những câu hỏi mà học sinh có xác suất sai cao dựa trên các lỗi lặp lại trong quá khứ để bắt buộc ôn luyện lại.

---

## Bóc tách cấu phần áp dụng cho Exam Runner

| Cấu phần | Mô tả thực thi | Mục tiêu |
| :--- | :--- | :--- |
| **Tagging Engine** | Gắn nhãn chi tiết cho 50 đề dựa trên @[Phân tích Ma trận đề thi.md] | Phân tích chính xác "vùng đau" của học sinh. |
| **Grammar Explainer** | Giải thích ngữ pháp sâu theo từng dạng câu hỏi (Ví dụ: Dạng Phonetics -ed có quy tắc riêng). | Giúp học sinh hiểu "Bản chất" thay vì "Mẹo". |
| **Dynamic Practice** | Tự tạo bài tập bổ trợ (từ dễ đến khó) cho các chủ điểm bị hổng. | Lấp đầy lỗ hổng ngay lập tức sau khi làm đề. |
| **Stakeholder Report** | Báo cáo cho phụ huynh tập trung vào: "Con nỗ lực thế nào?" và "Bố mẹ cần làm gì?". | Tăng sự phối hợp giữa Gia đình & Nhà trường. |
