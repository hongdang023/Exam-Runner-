# A6. PRACTICE ECOSYSTEM (HỆ SINH THÁI LUYỆN TẬP TỔNG THỂ)

Tài liệu này quy định 4 phân hệ luyện tập cốt lõi của hệ thống Exam Runners. Mỗi phân hệ giải quyết một **Job-to-be-Done (JTBD)** hoàn toàn khác nhau cho học viên, đảm bảo quá trình luyện thi đi từ Xây dựng nền tảng (Build) -> Rèn chiến thuật (Tactics) -> Đánh giá tổng thể (Assess) -> Phục hồi lỗ hổng (Remediate).

---

## 1. MOCK TEST (ĐỀ THI CHUẨN)

**Bản chất:** Đánh giá tổng quát (Assessment) trong môi trường áp lực cao.
**JTBD:** *"Hãy cho tôi biết năng lực hiện tại của tôi đang ở mức nào so với mục tiêu đỗ cấp 3, và tập cho tôi quen với áp lực phòng thi 60 phút."*

* **Đặc điểm:**
  * Giả lập 100% cấu trúc ma trận đề thi thực tế của Sở GD&ĐT.
  * Tính giờ đếm ngược nghiêm ngặt (60 phút).
  * **Cơ chế phản hồi:** Trì hoãn (Delayed Feedback). Không biết đúng/sai trong quá trình làm bài. Chỉ khi bấm Submit mới hiện kết quả và giải thích.
* **Luồng trải nghiệm (User Journey):**
  1. **Start:** Học viên vào Practice Room -> Chọn "Mock Tests" -> Bấm "Bắt đầu thi thử".
  2. **In-progress:** UI chuyển sang chế độ tập trung cao độ (Academic Mode). Trái là câu hỏi/bài đọc, phải là phiếu OMR ảo.
  3. **Submit:** Hệ thống thu bài, chấm điểm ngay lập tức.
  4. **Report:** Trả về "Sức khỏe học tập": Tổng điểm, Biểu đồ Radar năng lực, và Danh sách các câu sai.
  5. **Routing:** Hệ thống tự động trích xuất các lỗi sai đẩy vào "Ngân hàng điểm yếu" (Weaknesses Bank).

---

## 2. KNOWLEDGE DRILL (LUYỆN CHUYÊN ĐỀ)

**Bản chất:** Xây nền tảng kiến thức (Foundation Building).
**JTBD:** *"Tôi bị hổng kiến thức gốc về Câu Bị Động. Hãy cho tôi làm đi làm lại chuyên đề này từ dễ đến khó để biến nó thành phản xạ."*

* **Đặc điểm:**
  * Chỉ tập trung vào **một chủ điểm ngữ pháp/từ vựng cụ thể**.
  * Cấu trúc tịnh tiến (3 Vòng: Nhận biết -> Thông hiểu -> Vận dụng cao). Phải qua vòng trước mới mở khóa vòng sau.
  * **Nguồn câu hỏi:** Từ kho Grammar Shelf chuyên biệt.
* **Luồng trải nghiệm (User Journey):**
  1. **Start:** Học viên vào Grammar Shelf -> Chọn chuyên đề "Câu Bị Động" -> Xem lý thuyết siêu ngắn.
  2. **In-progress (Vòng 1):** Làm 10 câu trắc nghiệm điền từ (chỉ áp dụng công thức). Báo đúng/sai ngay lập tức.
  3. **In-progress (Vòng 3):** Phải viết lại câu (dạng khó).
  4. **Mastery:** Vượt qua cả 3 vòng, hệ thống cấp huy hiệu "Master Câu Bị Động".

---

## 3. SKILL DRILL / MINI-GAMES (RÈN CHIẾN THUẬT & KỸ NĂNG LÀM BÀI)

**Bản chất:** Rèn phản xạ và chiến thuật làm bài (Tactical Training). Không test kiến thức học thuật nặng nề, mà test **kỹ năng xử lý thông tin**.
**JTBD:** *"Tôi có từ vựng nhưng làm bài đọc quá chậm. Hãy huấn luyện não tôi kỹ năng Đọc lướt (Skimming) và Tìm từ khóa (Scanning) trong vài giây."*

* **Đặc điểm & Tiêu chuẩn:**
  * Kỹ năng cốt lõi được huấn luyện: Nhận diện từ khóa (Keyword Spotting), Đọc lướt ép thời gian (Speed Skimming), Nhận diện Paraphrasing, và Loại trừ phương án nhiễu (Elimination).
  * Gamification cao (Chơi game ép thời gian, combo, hiệu ứng âm thanh).
  * Quy tắc đặt tên: Sử dụng danh từ/động từ siêu ngắn gọn, hành động mạnh (Ví dụ: "Đọc Lướt", "Diệt Nhiễu").
  * Các dạng game tiêu biểu:
    * *Keyword Spotting:* Đoạn văn chạy trên màn hình trong 10s, yêu cầu nhấp chuột chọn đúng 3 từ khóa quan trọng nhất.
    * *Elimination Master:* Yêu cầu gạch bỏ 2 phương án vô lý nhất (nhiễu) trước khi được phép chọn đáp án đúng.
* **Luồng trải nghiệm (User Journey):**
  1. **Start:** Học viên vào khu vực "Luyện Tập" -> Chọn "Skill Drill".
  2. **In-progress:** Chơi các màn game ngắn (1-2 phút) dưới sức ép của đồng hồ (Time-attack).
  3. **Reward:** Nhận điểm XP, Combo ngọn lửa (Streak) và mở khóa các huy hiệu chiến thuật.

---

## 4. ADAPTIVE RETRY (ĐỀ THÍCH ỨNG / BÀI TẬP VÁ LỖI)

**Bản chất:** Sửa sai và phục hồi (Remediation) đa chủ điểm.
**JTBD:** *"Tôi không muốn cày lại toàn bộ sách. Hãy bốc ra chính xác những gì tôi hay sai lặt vặt và bắt tôi làm lại (với ngữ cảnh hơi khác một chút) để tôi không mất điểm oan."*

* **Đặc điểm & Tiêu chuẩn Tham số Thích ứng (Adaptive Parameters):**
  * **Isomorphic Questions (Câu hỏi đồng hình):** Hệ thống không dùng lại câu hỏi y hệt, mà sinh ra/lấy câu hỏi có cùng chủ điểm, cùng dạng bài nhưng thay đổi ngữ cảnh (từ vựng, chủ ngữ) để chống học vẹt.
  * **Phân loại độ khó:** Áp dụng thang đo Likert (5 mức) để lượng hóa độ khó của câu hỏi, từ đó hệ thống thuật toán tự động lấy câu hỏi ở mức độ phù hợp với năng lực hiện tại của học sinh để gài vào đề vá lỗi.
  * Áp dụng **Micro-passages** đối với các câu Đọc hiểu bị sai (chỉ đọc đoạn văn cực ngắn thay vì bài dài).
  * Giải thích 5 bước sâu (Verdict -> Rule -> Why -> Trap -> Tip) hiển thị ngay lập tức.
  * Không gian thiết kế "1 câu/màn hình" (Birdbrain Style).
* **Luồng trải nghiệm (User Journey):**
  1. **Start:** Hệ thống báo "Bạn có 15 lỗ hổng cần vá". Học viên bấm "Luyện Adaptive Retry".
  2. **In-progress:** Màn hình chỉ hiện 1 câu hỏi. Câu 1 có thể là Thì Quá khứ, Câu 2 là Phát âm `-ed`, Câu 3 là Micro-passage đọc hiểu. (Cá nhân hóa 100% dựa trên lỗi sai của học sinh).
  3. **Feedback:** Trả lời sai -> Giải thích sâu 5 bước hiện ra ngay lập tức -> Phải vượt qua Mini-puzzle (Active recall) để được đi tiếp.
  4. **Clear:** Hoàn thành tập 15 câu, hệ thống xóa các câu này khỏi "Ngân hàng điểm yếu".

---

## TỔNG KẾT: LUỒNG ĐIỀU PHỐI (ECOSYSTEM ROUTING)
Hệ thống không để học viên tự bơi, mà liên tục luân chuyển (route) học viên giữa 4 phân hệ này để tối ưu kết quả:

1. Học viên làm **(1) Mock Test** định kỳ vào cuối tuần.
2. Từ kết quả Mock Test, các lỗi sai được thu thập và đẩy thành bài tập hàng ngày tại **(4) Adaptive Retry**.
3. Trong lúc vá lỗi (Adaptive), nếu hệ thống phát hiện một kỹ năng làm bài (ví dụ: mất quá nhiều thời gian đọc) đang kìm hãm học viên -> Điều hướng học viên chơi **(3) Skill Drill**.
4. Nếu hệ thống phát hiện hổng kiến thức gốc quá nặng (sai lặp lại 3 lần cùng 1 lỗi ngữ pháp trong Adaptive) -> Khóa phần đó lại và điều hướng bắt buộc sang **(2) Knowledge Drill** để học lại từ đầu.
