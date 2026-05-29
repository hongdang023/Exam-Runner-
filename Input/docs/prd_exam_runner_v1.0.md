# PRD: Exam Runner - Hệ thống Ôn luyện Cá nhân hóa vào 10

---

| Thuộc tính       | Giá trị                        |
|-------------------|-------------------------------|
| **Phiên bản**     | v1.3 (Updated)                |
| **Ngày tạo**      | 10/05/2026                    |
| **Tác giả**       | Antigravity (AI Architect)     |
| **Trạng thái**    | 🟡 In Review                  |
| **Stakeholders**  | Gia sư (Admin), Học sinh, Phụ huynh |

---

## 📋 Mục lục

1. [Tóm tắt](#1-tóm-tắt)
2. [Bối cảnh & Vấn đề](#2-bối-cảnh--vấn-đề)
3. [Mục tiêu & Chỉ số thành công](#3-mục-tiêu--chỉ-số-thành-công)
4. [Đối tượng người dùng](#4-đối-tượng-người-dùng)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Yêu cầu chức năng](#6-yêu-cầu-chức-năng)
7. [Yêu cầu phi chức năng](#7-yêu-cầu-phi-chức-năng)
8. [Ngoài phạm vi](#8-ngoài-phạm-vi)
9. [Lộ trình phát triển](#9-lộ-trình-phát-triển)
10. [Phụ lục](#10-phụ-lục)

---

## 1. Tóm tắt

**Exam Runner** là một nền tảng học tập thích ứng (Adaptive Learning) chuyên sâu cho kỳ thi vào lớp 10. Hệ thống số hóa toàn bộ kho 50 đề thi mẫu, kết hợp với ma trận kiến thức chuẩn để cá nhân hóa lộ trình. Điểm khác biệt cốt lõi nằm ở khả năng tự động phát hiện lỗ hổng, cung cấp giải thích ngữ pháp đào sâu và tự động hóa toàn bộ quy trình chấm bài - báo cáo, giúp Gia sư tập trung vào chuyên môn và Phụ huynh đồng hành hiệu quả cùng con.

---

## 2. Bối cảnh & Vấn đề

### 2.1 Bối cảnh
Kỳ thi vào lớp 10 là bước ngoặt quan trọng, đòi hỏi sự chuẩn bị kỹ lưỡng về cả kiến thức và kỹ năng làm bài trong thời gian ngắn (cấp tốc).

### 2.2 Vấn đề (Problem Statement)
- **Học sinh:** Bị ngộp trong khối lượng đề thi lớn, không biết mình thực sự yếu ở đâu để cải thiện.
- **Gia sư (Admin):** Tốn quá nhiều thời gian cho việc chấm bài thủ công và tổng hợp lỗi sai, dẫn đến thiếu thời gian đào sâu kiến thức cho học sinh.
- **Phụ huynh:** Cảm thấy lo lắng vì không nắm bắt được tiến độ cụ thể và không biết cách phối hợp hiệu quả với giáo viên.

---

## 3. Mục tiêu & Chỉ số thành công

### 3.1 Chỉ số thành công (KPIs)

| Nhóm chỉ số | Chỉ số đo lường chính | Mục tiêu |
| :--- | :--- | :--- |
| **Học tập** | % Cải thiện điểm số trung bình | Tăng ít nhất 1.5 - 2.0 điểm sau Phase 2 |
| **Mastery** | Tỷ lệ "Pass" đề (đạt ngưỡng điểm) | 100% đề cần đạt mức tối thiểu (ví dụ 8/10) để qua màn |
| **Hệ thống** | Tỷ lệ hoàn thành lộ trình 50 đề | > 90% học sinh hoàn thành đúng hạn |
| **Ghi nhớ** | Số lượng từ vựng "Mastered" | > 300 từ/cụm từ cốt lõi |
| **Phụ huynh** | Tỷ lệ tương tác với báo cáo tuần | > 90% lượt mở xem và phản hồi |
| **Hiệu suất** | Thời gian chấm bài & báo cáo | Giảm 90% so với làm thủ công |

---

## 4. Đối tượng người dùng

Hệ thống tập trung quản trị trải nghiệm của 3 nhóm đối tượng (Stakeholders) với các nhu cầu đặc thù về Chức năng (Functional), Cảm xúc (Emotional) và Xã hội (Social).

---

## 5. User Stories & Acceptance Criteria

### A. Học sinh (The Runner)
| Mã số | Loại nhu cầu | User Story | Acceptance Criteria |
|:--- |:--- |:--- |:--- |
| **US-A-01** | [Functional] | Làm bài online và nhận kết quả tức thì. | Hiển thị điểm số + Đáp án chi tiết (Vì sao đúng/Vì sao sai) ngay sau khi "Submit". |
| **US-A-01.1**| [Functional] | Yêu cầu đạt mức điểm "Mastery" để qua đề. | Học sinh phải đạt mức điểm tối thiểu (ví dụ 80%) mới được mở khóa đề tiếp theo / qua màn. |
| **US-A-02** | [Functional] | Sổ tay từ vựng thông minh. | Tự động lưu từ/cụm từ sai vào kho Flashcard để ôn tập riêng. |
| **US-A-03** | [Functional] | Dashboard cá nhân hóa. | Biểu đồ trực quan: Số đề đã làm, biến thiên điểm số, vùng kiến thức yếu. |
| **US-A-04** | [Functional] | Countdown đếm ngược. | Widget đồng hồ đếm ngược ngày thi luôn hiển thị ở trang chủ. |
| **US-A-05** | [Functional] | Giải thích ngữ pháp đào sâu. | Link trực tiếp từ câu sai đến module lý thuyết ngữ pháp tương ứng. |
| **US-A-06** | [Emotional] | Cảm giác chinh phục. | Hệ thống Gamification: Tặng Badges khi hoàn thành Streak 5 đề hoặc đạt điểm cao. |
| **US-A-07** | [Emotional] | Giảm lo âu (An tâm). | Lộ trình hiển thị rõ "Next steps", không còn cảm giác mông lung. |
| **US-A-08** | [Emotional] | Không gian riêng tư & Cơ hội sửa sai. | Cho phép làm lại đề nhiều lần để đạt mức điểm "Pass" trước khi báo cáo kết quả cuối cùng. |
| **US-A-09** | [Social] | Bảng xếp hạng (Leaderboard). | So sánh tốc độ tiến bộ (không chỉ điểm số) với các bạn khác trong nhóm. |
| **US-A-10** | [Social] | Báo cáo nỗ lực. | Xuất file "Weekly Effort" để học sinh chủ động khoe với bố mẹ. |

### B. Admin/Teacher (The Coach - Gia sư)
| Mã số | Loại nhu cầu | User Story | Acceptance Criteria |
|:--- |:--- |:--- |:--- |
| **US-B-01** | [Functional] | Tự động chấm điểm 50 đề. | Tải lên đáp án 1 lần, hệ thống tự xử lý chấm bài cho mọi học sinh. |
| **US-B-02** | [Functional] | Ma trận kiến thức & Dạng đề tổng hợp. | View toàn cảnh: % sai ở từng chủ điểm kiến thức & dạng đề (Ví dụ: Câu bị động: 70% sai; Tìm lỗi sai: 50% sai). |
| **US-B-03** | [Functional] | Quản lý lộ trình linh hoạt. | Tùy chỉnh Deadline, ngày thi và lịch học riêng cho từng học sinh. |
| **US-B-04** | [Functional] | Ngân hàng giải thích (AI-powered). | Hỗ trợ soạn thảo hoặc dùng AI tạo giải thích mẫu cho kho 50 đề. |
| **US-B-05** | [Functional] | Gửi báo cáo 1-Click. | Một nút bấm để tổng hợp kết quả tuần và gửi qua Zalo/Email cho phụ huynh. |
| **US-B-06** | [Emotional] | Sự chuyên nghiệp. | Hệ thống hóa toàn bộ tài liệu và tiến độ, tăng uy tín gia sư. |
| **US-B-07** | [Emotional] | An tâm (Quản lý từ xa). | Nhận thông báo khi học sinh bắt đầu làm bài hoặc nộp bài muộn. |
| **US-B-08** | [Emotional] | Giảm tải công việc lặp lại. | Hệ thống tự trả lời các thắc mắc về đáp án và lý thuyết cơ bản. |
| **US-B-09** | [Social] | Minh bạch hóa dữ liệu. | Trao đổi với phụ huynh dựa trên con số thực tế (Evidence-based feedback). |
| **US-B-10** | [Social] | Kết nối cộng đồng. | Xây dựng hình ảnh gia sư hiện đại, đi đầu về công nghệ giáo dục. |

### C. Phụ huynh (The Supporter)
| Mã số | Loại nhu cầu | User Story | Acceptance Criteria |
|:--- |:--- |:--- |:--- |
| **US-C-01** | [Functional] | Báo cáo "Sức khỏe học tập". | Phân loại trạng thái con theo vùng màu (Xanh: Ổn, Vàng: Cần chú ý, Đỏ: Báo động). |
| **US-C-02** | [Functional] | Báo cáo chuyên cần. | Hiển thị lịch sử nộp bài: Đúng hạn / Muộn / Bỏ bài. |
| **US-C-03** | [Functional] | Mục "Cùng con đi tiếp". | Nhận lời khuyên phối hợp dành cho phụ huynh và gia sư (Ví dụ: "Tuần này con học nhiều, mẹ nấu món con thích nhé"). |
| **US-C-04** | [Functional] | Đồng bộ Countdown. | Đồng hồ đếm ngược giúp phụ huynh chuẩn bị tâm lý đồng hành. |
| **US-C-05** | [Functional] | Tra cứu tài liệu. | Xem được đề bài con đang làm để hiểu độ khó và nỗ lực của con. |
| **US-C-06** | [Emotional] | Sự tin tưởng. | Kết quả rõ ràng giúp phụ huynh thấy giá trị của việc thuê gia sư. |
| **US-C-07** | [Emotional] | Hạnh phúc khi thấy con tiến bộ. | Biểu đồ tăng trưởng điểm số là nguồn động lực lớn cho phụ huynh. |
| **US-C-08** | [Emotional] | Giảm xung đột gia đình. | Không cần hỏi "Làm bài chưa?" - App sẽ tự báo cáo kết quả. |
| **US-C-09** | [Social] | Sự tự hào. | Có thể chia sẻ lộ trình chuyên nghiệp của con với người thân/bạn bè. |
| **US-C-10** | [Social] | Vai trò đồng hành. | Cảm thấy mình có đóng góp cụ thể vào thành công của con. |

---

## 6. Yêu cầu chức năng

### 6.1 Phân hệ Quản trị Kho đề & Ma trận (Admin & Engine)
- **FR-01:** Số hóa toàn bộ 50 đề thi mẫu vào Database (bao gồm text, ảnh, audio nếu có).
- **FR-02:** Gắn tag ma trận kiến thức cho từng câu hỏi: Chủ điểm kiến thức (Grammar Topic) và Dạng đề (Question Type).
- **FR-03:** Engine chấm điểm & Mastery Logic: Chấm điểm tự động và chỉ mở khóa đề tiếp theo khi đạt ngưỡng điểm tối thiểu. Ngưỡng điểm này (Mastery Threshold) có thể tùy chỉnh linh hoạt cho từng học sinh dựa trên tình hình thực tế.
- **FR-04:** Deep Grammar Explainer: Giải thích chi tiết bản chất ngữ pháp "Vì sao đúng - Vì sao sai" bám sát ma trận.

### 6.2 Phân hệ Học tập Cá nhân hóa (Học sinh)
- **FR-05:** Giao diện làm bài thi trực tuyến tích hợp Countdown.
- **FR-06:** Module Flashcard thích ứng: Sử dụng thuật toán Spaced Repetition (Lặp lại ngắt quãng) để nhắc nhở ôn từ vựng sai.
- **FR-07:** Thư viện ngữ pháp "On-demand": Hiển thị đúng kiến thức học sinh đang hổng khi làm sai đề.
- **FR-08:** Hệ thống Badges & Achievements ghi nhận nỗ lực (Streak, Level up).

### 6.3 Phân hệ Báo cáo & Đồng hành (Gia sư & Phụ huynh)
- **FR-09:** Dashboard "Sức khỏe học tập": Trực quan hóa Knowledge Map (Bản đồ tri thức) của học sinh.
- **FR-10:** Hệ thống thông báo đa kênh: Gửi báo cáo cho phụ huynh theo cấu hình tùy chọn (Định kỳ hàng tuần hoặc Ngay khi hoàn thành cột mốc/5 đề).
- **FR-11:** Công cụ "Actionable Insights": Gợi ý lời khuyên cá nhân hóa cho phụ huynh (về tâm lý/hỗ trợ) và cho gia sư (về chuyên môn/nội dung cần dạy lại).

### 6.4 Phân hệ Generative Test (Nâng cao)
- **FR-12:** Tự tạo đề thi mới (Mock Test) bằng cách trộn các câu hỏi từ 50 đề gốc dựa trên tỷ lệ ma trận chuẩn.
- **FR-13:** Tạo đề "Bù hổng kiến thức": Đề thi chỉ tập trung vào các tag mà học sinh thường xuyên làm sai (Weak Point Focus).

---

## 7. Yêu cầu phi chức năng
- **NFR-01:** Trải nghiệm người dùng cao cấp (Premium UI/UX), animations mượt mà tạo hứng thú.
- **NFR-02:** Mobile-friendly để học sinh có thể ôn tập từ vựng mọi lúc mọi nơi.
- **NFR-03:** Thời gian phản hồi hệ thống (loading giải thích) < 1s.

---

## 8. Ngoài phạm vi
- Không bao gồm tính năng thanh toán học phí trực tuyến (chỉ tập trung vào chuyên môn học thuật).
- Không bao gồm tính năng Video Call trực tiếp trên app (sử dụng Zoom/Google Meet bên ngoài).

---

## 9. Lộ trình phát triển

### Phase 1: Data Digitization & Core Engine (Tuần 1-2)
- **Số hóa toàn bộ 50 đề thi mẫu** và đáp án chi tiết.
- Gắn tag ma trận kiến thức cho 100% kho đề (Chủ điểm & Dạng đề).
- Xây dựng Engine chấm điểm và Module làm bài online tích hợp Mastery Logic.
- Thiết lập hệ thống Countdown và Dashboard tiến độ thô.

### Phase 2: Mastery Learning & Analytics (Tuần 3-5)
- Triển khai **Spaced Repetition Flashcard** cho từ vựng và cấu trúc.
- Hoàn thiện Module giải thích ngữ pháp đào sâu (Deep Explainer).
- Xây dựng Dashboard báo cáo cho Phụ huynh với các vùng màu sức khỏe (Xanh/Vàng/Đỏ).
- Hệ thống gửi báo cáo tự động và Actionable Insights cho Phụ huynh/Gia sư.

### Phase 3: Adaptive Performance & Generation (Tuần 6-8)
- Triển khai **Generative Mock Tests**: Tự tạo đề thi dựa trên ma trận chuẩn.
- Tối ưu hóa thuật toán "Bù hổng kiến thức" (Weak Point Training).
- Hoàn thiện hệ thống Gamification (Badges, Leaderboard).
- Kiểm tra và tối ưu hóa Premium UI/UX.

---

## 10. Phụ lục: Master Content Structure (Learning Design Framework)

Mọi lời giải thích trong hệ thống phải tuân thủ cấu trúc 5 bước (ngắn gọn, trực diện):

1. **The Verdict (Kết quả):** Khẳng định ngay đáp án đúng (Ví dụ: "Đáp án: B").
2. **Core Rule (Quy tắc cốt lõi):** 1 dòng nêu chủ điểm ngữ pháp (Ví dụ: "S + used to + V-inf: Thói quen trong quá khứ").
3. **The Why (Tại sao đúng):** Giải thích ngắn gọn lý do chọn đáp án đó trong ngữ cảnh câu (Ví dụ: "Câu này nói về thói quen cũ, không còn ở hiện tại").
4. **The Trap (Bẫy/Tại sao sai):** Phân tích nhanh tại sao các phương án khác thường gây nhầm lẫn (Ví dụ: "Phương án A dùng V-ing là bẫy của cấu trúc 'be used to'").
5. **Master Tip (Mẹo bứt phá):** Một "Pro-tip" để nhận diện nhanh dạng bài này trong 3 giây.

---

## 11. Tài liệu tham khảo
- Nghiên cứu chi tiết: [Personalized Learning Research](file:///Users/danghong/.gemini/antigravity/brain/e501e25e-f33f-430c-9053-5f4a22095f84/research_personalized_learning.md)
- Ma trận kiến thức tham chiếu: @[Phân tích Ma trận đề thi.md]
