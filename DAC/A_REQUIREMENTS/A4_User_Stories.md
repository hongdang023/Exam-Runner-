# A4. USER STORIES (CÂU CHUYỆN KẾT QUẢ)

## 1. BỐI CẢNH & MỤC TIÊU

Tài liệu này không chỉ mô tả tính năng mà là mô tả **Lý do tồn tại** của hệ thống thông qua lăng kính của người dùng. Mọi câu chuyện phải dẫn đến một Kết quả (Outcome) cụ thể.

## 2. TRIẾT LÝ & LOGIC NGẦM

- **Outcome-Driven Stories**: Tập trung vào giá trị nhận được sau hành động.
- **Theoretical Framework**: **Job-to-be-Done (JTBD)**. Chúng ta phân tích mỗi Story qua 3 lớp "Job": 1. **Functional Job**: Nhiệm vụ thực tế hệ thống giúp họ hoàn thành. 2. **Emotional Job**: Trạng thái cảm xúc họ đạt được sau khi làm xong. 3. **Social Job**: Vị thế xã hội hoặc sự công nhận họ nhận �### A. Học sinh (The Runner)
| Mã số       | Loại nhu cầu | User Story                                         | Acceptance Criteria                                                                                                     |
| :---------- | :----------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **US-A-01** | [Functional] | Luyện Mock Test (Nhận kết quả trễ).                | Đáp án Đúng/Sai bị ẩn trong quá trình thi. Chỉ thấy điểm số & giải thích sau khi bấm "Submit".                          |
| **US-A-02** | [Functional] | Luyện tập thích ứng (Nhận kết quả tức thì).        | Trả kết quả Đúng/Sai lập tức sau mỗi lần click chọn phương án; hiển thị giải thích 5 bước sâu.                          |
| **US-A-03** | [Functional] | Yêu cầu đạt mức điểm "Mastery" để qua đề.          | Học sinh phải đạt mức điểm tối thiểu (ví dụ 80%) mới được mở khóa đề tiếp theo.                                         |
| **US-A-04** | [Functional] | Tập trung làm bài (Focus Mode).                    | Sử dụng Toggle Sidebar để thu gọn thanh điều hướng, tối đa hóa không gian đọc hiểu.                                     |
| **US-A-05** | [Functional] | Nhận diện điểm yếu trực quan.                      | Xem Skill Map dạng radar trên Dashboard để thấy rõ kỹ năng nào cần khắc phục.                                           |
| **US-A-06** | [Functional] | Sổ tay từ vựng thông minh (Flashcards).            | Tự động lưu từ sai vào kho Flashcard để ôn tập riêng bằng thuật toán Spaced Repetition.                                 |
| **US-A-07** | [Functional] | Dashboard & Countdown.                             | Hiển thị widget đếm ngược ngày thi và biểu đồ biến thiên điểm số.                                                       |
| **US-A-08** | [Functional] | Chữa đề thông minh.                                | Hệ thống tự động gom các câu hỏi dễ sai nhất thành một đề Adaptive Retry.                                               |
| **US-A-09** | [Functional] | Luyện tập bổ trợ tăng dần độ khó.                  | Tự tạo bài tập từ dễ đến khó, áp dụng phương pháp gợi mở (Problem-First).                                               |
| **US-A-10** | [Functional] | Giải thích ngữ pháp đào sâu.                       | Link từ câu sai đến module lý thuyết sử dụng hình ảnh/tương tác trực quan.                                              |
| **US-A-11** | [Functional] | Khởi tạo lộ trình cá nhân hóa (Onboarding).        | Nhập ngày thi, quỹ thời gian, thiết lập bắt buộc mã PIN Phụ huynh & Gia sư.                                             |
| **US-A-12** | [Emotional]  | Cảm giác chinh phục & Phản hồi tích cực.           | Kích hoạt hiệu ứng Confetti, âm thanh "Ting", thanh Streak 🔥 khi làm đúng. Rung nhẹ thẻ khi sai.                       |
| **US-A-13** | [Emotional]  | Giảm loâu (An tâm).                                | Lộ trình hiển thị rõ "Next steps", không còn cảm giác mông lung.                                                        |
| **US-A-14** | [Emotional]  | Không gian riêng tư & Cơ hội sửa sai.              | Cho phép làm lại đề nhiều lần để đạt mức điểm "Pass" trước khi báo cáo kết quả cuối cùng.                               |
| **US-A-15** | [Social]     | Bảng xếp hạng (Leaderboard).                       | So sánh tốc độ tiến bộ (không chỉ điểm số) với các bạn khác trong nhóm.                                                 |

### B. Admin/Teacher (The Coach - Gia sư)

| Mã số       | Loại nhu cầu | User Story                            | Acceptance Criteria                                                                                                     |
| :---------- | :----------- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **US-B-01** | [Functional] | Số hóa đề thi (Local Admin Mode).     | Nhập câu hỏi trực tiếp hoặc upload file JSON đề thi cục bộ trên trình duyệt để lưu vào Local Database của máy học sinh. |
| **US-B-02** | [Functional] | Ma trận kiến thức & Dạng đề tổng hợp. | Nhập chính xác **mã PIN Gia sư** để xem toàn cảnh: % sai ở từng chủ điểm kiến thức & dạng đề của học sinh trên máy.     |
| **US-B-03** | [Functional] | Quản lý lộ trình linh hoạt.           | Nhập chính xác **mã PIN Gia sư** để tùy chỉnh trực tiếp Deadline, ngày thi và lịch học ngay trên thiết bị.              |
| **US-B-04** | [Functional] | Ngân hàng giải thích (AI-powered).    | Xem và biên tập nội dung giải thích chi tiết 5 bước của từng câu hỏi trong kho đề cục bộ.                               |
| **US-B-05** | [Emotional]  | Sự chuyên nghiệp.                     | Hệ thống hóa toàn bộ tài liệu và tiến độ, tăng uy tín gia sư.                                                           |
| **US-B-06** | [Emotional]  | An tâm (Quản lý từ xa).               | Đọc dữ liệu tiến độ thực tế lưu cục bộ trên thiết bị của học sinh khi đến giờ học kèm.                                  |
| **US-B-07** | [Emotional]  | Giảm tải công việc lặp lại.           | Hệ thống tự trả lời các thắc mắc về đáp án và lý thuyết cơ bản dựa trên giải thích 5 bước có sẵn.                       |
| **US-B-08** | [Social]     | Minh bạch hóa dữ liệu.                | Trao đổi với phụ huynh dựa trên con số thực tế hiển thị trên Dashboard Phụ huynh/Gia sư.                                |
| **US-B-09** | [Social]     | Kết nối công nghệ.                    | Xây dựng hình ảnh gia sư hiện đại, đi đầu về ứng dụng công nghệ giáo dục số hóa cục bộ.                                 |

### C. Phụ huynh (The Supporter)

| Mã số       | Loại nhu cầu | User Story                        | Acceptance Criteria                                                                                                          |
| :---------- | :----------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **US-C-01** | [Functional] | Kiểm tra tính kỷ luật.            | Nhập chính xác **mã PIN Phụ huynh** để xem "Nhật ký hoạt động" (lịch sử nộp bài) và Calendar Heatmap (Đúng hạn/Muộn/Bỏ bài). |
| **US-C-02** | [Functional] | Đèn báo "Sức khỏe học tập".       | Mở khóa Dashboard để thấy cảnh báo vùng màu (Xanh: Ổn, Vàng: Chú ý, Đỏ: Báo động) giúp đánh giá nhanh nỗ lực của con.        |
| **US-C-03** | [Functional] | Mục "Actionable Prompts".         | Dựa vào trạng thái học tập của con, nhận được 1 gợi ý hành vi tương ứng để biết nên khen ngợi, hỏi thăm hay nhắc nhở con.    |
| **US-C-04** | [Emotional]  | Sự an tâm (Peace of mind).        | Xem tiến độ hoàn thành lộ trình (ví dụ: đã đi được 60%) thay vì nhìn đếm ngược ngày thi, giúp giảm lo âu.                    |
| **US-C-05** | [Emotional]  | Tin tưởng vào khoản đầu tư (ROI). | Nhìn thấy biểu đồ điểm số cơ bản (đang tăng) để thấy giá trị thực tế của lộ trình.                                           |
| **US-C-06** | [Emotional]  | Giảm xung đột gia đình.           | Không cần tra khảo "Làm bài chưa?" hay mắng mỏ vô cớ - Chỉ cần xem Lịch sử hoạt động để nói chuyện khách quan.               |
| **US-C-07** | [Social]     | Khoe thành tích.                  | Chụp màn hình Dashboard đẹp mắt, dễ hiểu để gửi cho vợ/chồng/người thân chứng minh con đang nỗ lực.                          |

## 4. TIÊU CHUẨN THỰC THI (STANDARDS)

### 4.1. Cấu trúc viết Story

`Là một [Vai trò], tôi muốn [Hành động], để tôi đạt được [Outcome] (Thỏa mãn 3 lớp JTBD).`

### 4.2. Bảng quản trị User Stories (Ví dụ)

| ID      | Vai trò  | Chức năng (Functional) | Cảm xúc/Xã hội (Emotional/Social) |
| :------ | :------- | :--------------------- | :-------------------------------- |
| US-A-01 | Học sinh | Làm bài online         | Tự hào & Yên tâm                  |

## 5. BIẾN THỂ & TRƯỜNG HỢP BIÊN (EDGE CASES)

- **JTBD mâu thuẫn**: Emotional Job (muốn nhanh) mâu thuẫn với Functional Job (quy trình làm bài nghiêm túc). -> Giải pháp: Tối ưu UX.
- **Vắng bóng Validator**: Khi không có người kiểm chứng thật, AI phải đảm nhận lớp Emotional Job (khen ngợi, khích lệ).

## 6. RULES (AUDIT QUESTIONS)

### 6.1. Quy tắc đặt ID (ID Naming Rules)

Mọi User Story phải tuân thủ định dạng: `US-[ROLE]-[INDEX]`

- **US**: Viết tắt của User Story.
- **ROLE**: A (Học sinh), B (Gia sư), C (Phụ huynh).
- **INDEX**: Số thứ tự tăng dần (01, 02...).

### 6.2. Câu hỏi Audit

1. Story này đã đủ 3 lớp **JTBD** chưa? (Nếu chỉ có Functional là chưa đạt).
2. Kết quả (**Outcome**) có đo lường được bằng **Bằng chứng (Proof)** không?
3. ID đã đặt đúng quy tắc để thuận tiện cho việc truy xuất tại Phase B (System Design) chưa?
