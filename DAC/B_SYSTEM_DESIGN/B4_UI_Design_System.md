# B4. UI DESIGN MASTER SYSTEM (HỆ THỐNG NGÔN NGỮ ĐIỀU HƯỚNG TÂM LÝ)

## 1. BỐI CẢNH & MỤC TIÊU

Trong khung DAC, UI/UX không chỉ là lớp vỏ thẩm mỹ, mà là một **"Hệ thống điều hướng tâm lý" (Psychological Navigation System)**. Tài liệu này là Master Template để thiết kế giao diện cho bất kỳ dự án nào, tập trung vào việc chuyển đổi trạng thái người dùng từ "Quan sát" sang "Thực thi".

> **Cập nhật v2.0:** Áp dụng kiến trúc **Duality Contrast** — Nền sáng ấm áp cho toàn bộ Workspace, Sidebar tối sang trọng là điểm neo thị giác.

---

## 2. TRIẾT LÝ THIẾT KẾ (CORE PHILOSOPHIES)

Thiết kế UI của dự án đóng vai trò là "cánh tay nối dài" để thực thi trực tiếp 2 tiêu chuẩn gốc rễ trong `A0_Standards` (Outcome-Based và Error Proofing). Hệ thống UI được dẫn dắt bởi đúng 3 triết lý thiết kế tối thượng, đại diện cho 3 không gian/mục đích học tập khác nhau:

- **Triết lý 1: Less is More (Cảm hứng: Apple)**
  - _Mục đích_: Áp dụng cho Dashboard, Hệ thống Điều hướng & Giao diện chung.
  - _Bản chất_: Tối giản hóa thị giác, sử dụng Duality Contrast và One Concept Per Screen. Xóa bỏ mọi đường viền/gạch dọc dư thừa.
  - _Liên kết A0_: Phục vụ **Error Proofing (Poka-Yoke)**. Khi giao diện lược bỏ mọi menu nhiễu loạn và chỉ còn 1 nút bấm/1 thông tin cốt lõi, người dùng "không có cơ hội để thao tác sai".
- **Triết lý 2: Outcome-Driven Momentum (Cảm hứng: Brilliant)**
  - _Mục đích_: Áp dụng cho Gamified Minigames, Skill Drills (Học qua tương tác).
  - _Bản chất_: Các cấu phần UI không thiết kế để "trưng bày tính năng", mà phải phản hồi tức thì (Instant Feedback - Confetti, Shake, Ting) để đẩy người dùng tiến về phía trước.
  - _Liên kết A0_: Phục vụ **Outcome-Based (OBE)**. UI tạo ra "Momentum" (động lực) để kéo người dùng đi từ con số 0 đến đích (Outcome).
- **Triết lý 3: Focus & Delayed Gratification (Cảm hứng: Khan Academy)**
  - _Mục đích_: Áp dụng ĐỘC QUYỀN cho Không gian Luyện Mock Test (Practice Room).
  - _Bản chất_: Nghiêm túc, học thuật, không có pháo hoa/confetti. Áp dụng cơ chế Phản hồi Trì hoãn (Delayed Feedback) - chỉ cho biết kết quả sau khi Submit. Không gian Trắng/đen/xám tuyệt đối để tối đa hóa sự tập trung.
  - _Liên kết A0_: Phục vụ **Outcome-Based (Verification)**. Rèn luyện kỷ luật thi cử thực tế, tập trung vào Proof of Work thực chất thay vì hưng phấn nhất thời.

---

## 3. CẤU TRÚC HỆ THỐNG & MẪU THIẾT KẾ (UI PATTERNS)

Các "Từ khóa" và "Phương pháp học" nhỏ lẻ được đúc kết thành các cấu phần (Component) cụ thể để Dev dễ dàng lắp ráp:

1.  **Hệ thống Logic Tokens (Semantic Patterns):**
    - **Primary-Accent (Cam Hổ Phách)**: Kêu gọi hành động (Action-Trigger), đại diện cho Momentum.
    - **Secondary-Fill (Xám nhạt)**: Nền thụ động, không tranh giành sự chú ý (Trust-Foundation).
2.  **Outcome-Focused Components (Thành phần hướng kết quả):**
    - **Value Cards**: Thay thế các mô tả tính năng bằng thẻ "Lợi ích đạt được" (OBE Rule).
    - **Progress Visualizers**: Thanh tiến trình/Goal-line (Đo lường Proof of Work).
3.  **Interactive Learning Components (Thành phần tương tác):**
    - **Visual Explainers**: Sơ đồ tư duy, kéo thả (Tối giản hóa nhận thức).
    - **Mini-Puzzles & Active Recall Hints**: Thử thách nhỏ buộc học sinh tự nhớ lại kiến thức (Thay vì đưa đáp án ngay).
    - **Smart Feedback Modal**: Bottom sheet/modal giải thích sau trả lời.
    - **Bite-sized Cards**: Thẻ nội dung ngắn, không cuộn dọc, giải quyết dứt điểm 1 Concept (One Concept Per Screen).
    - **Skill Map**: Bản đồ mạng lưới tiến độ trực quan.
4.  **Flow-State Interfaces (Không gian dòng chảy):**
    - Giao diện Luyện đề/Thiết lập lộ trình tự động triệt tiêu thanh điều hướng (Focus Mode) để giảm thiểu lối thoát (Zero-Obstacle).

---

## 4. TIÊU CHUẨN THỰC THI (MASTER STANDARDS)

### 4.1. Thiết lập Semantic Tokens (Bản đồ màu sắc logic: Đơn sắc + 1 Màu nhấn)

Hệ thống sử dụng triết lý thiết kế **Duality Contrast** và **Monochrome + 1 Accent**. Nhằm triệt tiêu hoàn toàn sự "loè loẹt" (visual noise), toàn bộ giao diện duy trì tông Đen/Trắng/Xám. Tuyệt đối chỉ sử dụng **DUY NHẤT 1 Màu nhấn (Cam Hổ Phách)** cho các nút bấm (CTA) quan trọng nhất.

| Logic Token      | Vai trò trong hệ thống      | Duality Contrast (Workspace)                                | Sidebar (Dark Anchor)                       |
| :--------------- | :-------------------------- | :---------------------------------------------------------- | :------------------------------------------ |
| `Background`     | Nền chính của ứng dụng      | Warm Paper (`#F5F4F1`)                                      | Charcoal Cocoa (`#13110f`)                  |
| `Card/Container` | Nền của khối nội dung       | Solid White (`#FFFFFF`)                                     | Transparent Dark (`rgba(255,255,255,0.02)`) |
| `Secondary-Fill` | Nền nút phụ, form input     | Xám nhạt Apple (`#F2F2F7`)                                  | Xám tro (`#2C2C2E`)                         |
| `Text-Primary`   | Chữ hiển thị chính          | Than chì (`#13110F`)                                        | Trắng tinh (`#FFFFFF`)                      |
| `Text-Secondary` | Chữ chú thích, số liệu phụ  | Xám trung tính (`#8E8E93`)                                  | Xám bạc (`#AEAEB2`)                         |
| `Border`         | Đường viền siêu mỏng        | Nhạt, tinh tế (`#E5E5EA`)                                   | Tối, tinh tế (`rgba(255,255,255,0.06)`)     |
| `Primary-Accent` | **Hành động cốt lõi (CTA)** | **Cam Hổ Phách (`#FF6F00`)**                                | **Cam Hổ Phách (`#FF6F00`)**                |
| `Status-Dots`    | Báo đúng/sai/chú ý          | Chỉ dùng chấm nhỏ (8px), tuyệt đối không tô màu cả nút/thẻ. | Chỉ dùng chấm nhỏ (8px).                    |

> **Nguyên tắc tối thượng:** Không một nút bấm hay background thẻ nào được phép đổ màu sặc sỡ ngoại trừ nút Primary Accent (Cam Hổ Phách) và các biểu tượng chấm trạng thái siêu nhỏ. Nếu màn hình có 2 nút, nút phụ (Secondary Button) bắt buộc phải dùng nền `Secondary-Fill` (Xám nhạt) hoặc trong suốt.

### 4.2. Typography, Layout & Material Standards

- **Solid Materials (Chất liệu Đặc):** Tuyệt đối KHÔNG sử dụng hiệu ứng kính mờ (Glassmorphism), KHÔNG dùng `rgba(255,255,255,0.0x)` trên nền sáng. Mọi thành phần (Cards, Modals, Dropdowns) phải sử dụng nền trắng đặc (`#ffffff`) kết hợp viền mảnh (`#E5E5EA`) và đổ bóng tĩnh nhẹ (subtle shadow) để tạo sự nổi bật rõ ràng, chống lóa mắt.
- **Hero Typography**: Bắt buộc sử dụng font chữ mạnh mẽ (ExtraBold) cho các Headline hướng đích.
- **Geometric Sans-Serif**: Khuyến khích sử dụng font sans-serif hình học để tạo cảm giác hiện đại, sạch sẽ và dễ đọc trên mobile.
- **Content Hierarchy**: Tiêu đề/Câu hỏi dùng size lớn, bold. Nội dung giải thích dùng size vừa phải, giảm độ tương phản (màu xám đậm thay vì đen tuyền) để giảm mỏi mắt.
- **Zero-Obstacle Layout**: Loại bỏ các menu điều hướng phức tạp trong các trang "Chuyển đổi" hoặc "Luyện tập" (Domain II).
- **Decisive Radii**: Sử dụng bo góc lớn và mềm mại (ví dụ: 12px-16px) cho các nút bấm và thẻ nội dung để tạo cảm giác thân thiện, dễ bấm.

### 4.3. Gamified & Challenge Standards (Tiêu chuẩn Game hóa)

- **Challenge Hub**: Giao diện hiển thị các "phòng thoát hiểm" hoặc chuỗi nhiệm vụ cần hoàn thành.
- **Instant Feedback Loops**: Hiệu ứng thị giác (pháo hoa, confetti) ngay khi giải đúng một puzzle khó để kích thích Dopamine.

### 4.4. Motion & Animation Standards (Tiêu chuẩn Chuyển động)

- **Seamless Transitions**: Chuyển cảnh giữa các thẻ bài học mượt mà, không giật lag để giữ dòng suy nghĩ.
- **Real-time Feedback**: Đồ họa biến đổi ngay lập tức khi tương tác với widget (ví dụ: kéo slider).

### 4.5. Tone of Voice Standards (Tiêu chuẩn Giọng điệu)

- **Positive Framing**: Không dùng từ tiêu cực khi học sinh làm sai. Dùng "Thử lại xem", "Gần đúng rồi".
- **Curiosity-Driven**: Đặt câu hỏi gợi mở thay vì khẳng định khô khan.

### 4.6. Tiêu chuẩn Giao diện Phân cực & Bảo mật (Duality Contrast & PIN Secure UI)

**Kiến trúc Duality Contrast (v2.0 - Tiêu chuẩn hiện hành):** Hệ thống sử dụng hai lớp giao diện đối lập nhau một cách có chủ đích, loại bỏ hoàn toàn Glassmorphism rườm rà để tạo ra trải nghiệm thị giác tĩnh tại, rõ ràng và giảm mỏi mắt tối đa:

- **Sidebar Điều hướng:** Luôn giữ tông tối sang trọng (`Charcoal Cocoa #13110f`) như một điểm neo ổn định, dù người dùng đang ở màn hình nào.
- **Workspace Nội dung:** Toàn bộ khu vực làm việc chính (Dashboard, Practice Room, Parent Hub, Grammar Shelf) sử dụng tông sáng ấm áp (`Warm Paper #F5F4F1`), kết hợp với các thẻ nội dung màu trắng tinh (`Solid White #FFFFFF`) có viền rõ ràng.

> **Lý do thiết kế:** Đây là phương pháp tối ưu nhất cho cả sức khỏe thị lực lẫn tâm lý học tập. Thẻ trắng trên nền Warm Paper mang lại độ tương phản hoàn hảo như một trang sách/giấy thật, giúp học sinh có thể đọc câu hỏi, đề bài và phân tích điểm số trong thời gian dài mà không bị nhức mỏi mắt hay bị lóa (halation). Trong khi đó, Sidebar tối tạo cảm giác "vào guồng học" chuyên nghiệp, đóng khung không gian học tập.

Để đảm bảo hiệu quả sư phạm tối ưu và bảo mật trải nghiệm học tập trên một thiết bị dùng chung, giao diện hệ thống được chia thành:

#### 1. Không gian Luyện Đề & Học Tập (Practice Room & Grammar Shelf)

- **Mục tiêu**: Mô phỏng hoàn hảo môi trường phòng thi thực tế và không gian tự học tĩnh tại, đề cao tính kỷ luật, tập trung cao độ.
- **Hệ màu sắc (Duality Contrast chuẩn)**:
  - Nền Workspace: `Warm Paper (#F5F4F1)`.
  - Nền Card nội dung/Câu hỏi: `Solid White (#FFFFFF)` (Sử dụng khoảng trắng và đổ bóng tĩnh nhẹ thay vì viền cứng).
  - Văn bản chính: `Charcoal (#13110f)`.
- **Bố cục & Tính năng cốt lõi**:
  - **Bố cục Hai cột (Split-pane Layout)**: Cột trái hiển thị đề thi dạng văn bản cuộn mượt mà; cột phải là giao diện trả lời hoặc bảng trả lời ảo (Virtual OMR Panel).
  - **Bố cục Xếp chồng (Stacked Layout)**: Dành cho màn hình nhỏ, đề thi hiển thị ở trên và OMR hoặc form điền đáp án hiển thị cố định bên dưới.
  - **Tính năng bổ trợ học thuật**: Cho phép bôi đen (Highlight) đoạn văn bản, gạch bỏ phương án nhiễu (Strikethrough).
  - **Cơ chế Phản hồi**: Trì hoãn phản hồi (Delayed Feedback) cho luyện đề chuyên sâu, hoặc Instant Feedback cho Sandbox. Mọi lời giải thích (Deep Explainer) phải hiển thị trên nền card sáng màu sạch sẽ để dễ đọc phân tích ngữ pháp.

#### 2. Thư viện Game hóa (Gamified Minigames - Tùy chọn)

- **Mục tiêu**: Kích thích động lực, biến việc học thành trải nghiệm khám phá qua game hóa, phản hồi xúc giác nhanh và đồ họa mượt mà.
- **Hệ màu sắc**: Kế thừa nền tảng Duality Contrast, nhưng tăng cường độ bão hòa (saturation) của các Logic Tokens để nổi bật hơn trong môi trường game.
- **Bố cục & Cơ chế Tương tác**:
  - **Quy tắc Một Khái niệm (One Concept/Question Per Screen)**: Triệt tiêu mọi yếu tố gây nhiễu, không gian card trắng trơn tru.
  - **Cơ chế Phản hồi Tức thì (Instant Feedback Loop)**:
    - Khi chọn **Đúng**: Kích hoạt pháo hoa hạt mịn (Confetti), âm thanh "Ting" giòn giã, và thanh tiến trình bốc cháy rực rỡ (Streak 🔥) tăng nhiệt.
    - Khi chọn **Sai**: Rung lắc nhẹ thẻ trắng (Shake animation), đồng thời che đáp án và mở chế độ gợi ý từng bước (Active Recall Hints) trên một pop-up card khác.

#### 3. Cửa sổ Xác thực PIN cục bộ (Parent/Tutor PIN Secure Modal)

- **Mục tiêu**: Ngăn chặn học sinh tự ý truy cập và thao túng các thiết lập lộ trình hoặc xem bảng số liệu phân tích sâu của Gia sư và Phụ huynh trên thiết bị dùng chung.
- **Thiết kế Giao diện**:
  - Nền mờ đục hoàn toàn (Backdrop filter blur 12px) để ẩn đi thông tin nhạy cảm phía sau.
  - Tiêu đề rõ ràng theo bối cảnh: "NHẬP MÃ PIN GIA SƯ" hoặc "XÁC THỰC PHỤ HUYNH".
  - **4 Vòng Tròn Nhập Liệu (4 Entry Circles)**: Trống rỗng khi chưa nhập, tự động điền đầy bằng chấm tròn đen bóng khi nhập số. Không hiển thị ký tự số thực tế để bảo mật tối đa.
  - **Phản hồi Hành vi (Micro-interactions)**:
    - Khi nhập sai mã PIN: 4 vòng tròn chuyển màu đỏ rực, rung lắc ngang dữ dội (Shake error animation) kèm rung máy phản hồi xúc giác (Haptic vibration). Sau đó tự động xóa trống để nhập lại.
    - Khi nhập đúng mã PIN: Chớp nhẹ ánh sáng xanh Validation, tự động trượt mượt mà mở khóa Dashboard.

### 4.7. Naming Convention Standards (Tiêu chuẩn Đặt tên Đề mục & Nút bấm)

Dựa trên kết quả khảo sát và định hướng đại chúng, hệ thống áp dụng bộ quy tắc đặt tên cốt lõi sau cho tất cả các đề mục (headings), tab và nút bấm (buttons):

- **Siêu ngắn gọn (Micro-copy):** Đề mục phải cực kỳ ngắn gọn (tối đa 2-4 từ). Sự súc tích được ưu tiên cao nhất, có thể loại bỏ hoàn toàn các mệnh đề giải thích phụ (Ví dụ: Chỉ dùng "Học Sinh" thay vì "Học Sinh (Phòng luyện đề)").
- **Phân tầng ngôn ngữ (Contextual Bilingualism):**
  - **Giao diện lõi Học sinh/Gia sư:** Ưu tiên dùng Tiếng Anh chuẩn (Dashboard, Skill Map, Flashcards, Practice Room) để giữ sự chuyên nghiệp và gọn gàng.
  - **Giao diện Phụ huynh & Giao tiếp chung (Modals, Buttons):** Bắt buộc dùng **Tiếng Việt siêu ngắn gọn** để phụ huynh dễ dàng thấu hiểu (Ví dụ: "Góc Phụ Huynh", "Sức Khỏe Học Tập", "Tạo Lộ Trình"). Tránh dùng tiếng Anh ở các điểm chạm đại chúng.
- **Phổ thông & Dễ hiểu:** Lựa chọn từ ngữ thông dụng, trực quan, dễ hiểu ngay lập tức; tránh các từ ẩn dụ, bóng bẩy hoặc quá sáng tạo. Tránh các từ ngữ có cảm giác y tế như "Health Report" (Dùng "Sức Khỏe Học Tập").
- **Định hướng Hành động (Action-Oriented):** Các nút bấm và tính năng luôn bắt đầu bằng một động từ để thúc đẩy hành động (Ví dụ: "Xem Đáp Án", "Luyện Ngay", "Lưu & Tiếp Tục").
- **Tập trung vào Lợi ích (Benefit-Focused):** Đặt tên hướng tới giá trị nhận được thay vì chức năng đơn thuần (Ví dụ: Tập trung vào "Khắc Phục Điểm Yếu").
- **Giọng điệu Động viên:** Sử dụng ngôn từ mang tính khích lệ, tích cực để tạo động lực cho người học.
- **Hạn chế Thuật ngữ:** Tránh lạm dụng các thuật ngữ chuyên môn phức tạp gây trở ngại cho người dùng mới.
- **Kỷ luật Viết hoa tuyệt đối:** Tuân thủ nghiêm ngặt và không có ngoại lệ đối với một quy tắc viết hoa duy nhất trên toàn hệ thống (Title Case cho Headings, Sentence/Title case cho Nút bấm).
- **Mobile-First Naming:** Các từ ngữ phải được tinh chỉnh để vừa vặn hoàn hảo trên màn hình thiết bị di động hẹp. Cho phép viết tắt nếu cần thiết để tiết kiệm không gian.
- _(Ghi chú: Việc sử dụng biểu tượng/icon đi kèm là linh hoạt, không bắt buộc trong mọi trường hợp)._

### 4.8. Quy tắc Không gian (Grid & Spacing Tokens)

Khoảng trắng (White-space) là linh hồn của "Less is More". Hệ thống áp dụng nghiêm ngặt **Hệ lưới 8pt (8-point Grid System)** để tạo nhịp điệu thị giác nhất quán:

- **Micro-spacing (4px, 8px):** Dùng giữa icon và text, hoặc giữa tiêu đề và phụ đề.
- **Component-spacing (16px, 24px):** Dùng làm Padding chuẩn cho bên trong các thẻ (Cards) hoặc Form Inputs.
- **Section-spacing (32px, 48px, 64px):** Dùng để phân tách các khối nội dung lớn trên Dashboard.

### 4.9. Tiêu chuẩn UI Component Cốt lõi

- **Text Inputs & Forms:** Khung nhập liệu (Input) không dùng viền cứng. Nền sử dụng `Secondary-Fill` (`#F2F2F7`). Bo góc mềm (10px). Khi Focus (chọn vào để gõ), xuất hiện viền hoặc bóng đổ mỏng màu `Primary-Accent`.
- **Data Tables / Lists:** Bảng biểu của Gia sư/Phụ huynh triệt tiêu hoàn toàn **đường kẻ dọc**. Chỉ dùng đường kẻ ngang siêu mảnh (`#E5E5EA`) để phân tách các hàng. Tăng tối đa khoảng trắng để bảng trông thoáng đãng như báo cáo tài chính cao cấp.
- **Sidebar Navigation (Hover/Active states):** Khi lướt qua (Hover) một mục trên Sidebar tối, nền của mục đó chuyển sang `rgba(255,255,255,0.06)`. Khi đang chọn (Active), text chuyển sang màu Trắng tinh (`#FFFFFF`) và có một vệt màu `Primary-Accent` (Cam) mỏng ở cạnh trái.
- **Cognitive Load Reduction:** Dashboard chỉ hiển thị con số khổng lồ (ví dụ: **85%**). Các dòng chữ chú thích bên dưới bắt buộc phải nhỏ và có màu `Text-Secondary` (`#8E8E93`). Cắt giảm tối đa chữ thừa.

---

## 6. RULES (AUDIT QUESTIONS FOR MASTER UI)

1.  Giao diện có đang giúp người dùng thấy được **Bản thân họ ở tương lai** (khi có kết quả) không?
2.  Các Logic Tokens đã được áp dụng nhất quán trên toàn bộ User Journey chưa?
3.  Có yếu tố hình ảnh nào đang gây nhiễu (Obstacle) cho hành động quan trọng nhất không?
4.  Typography có tạo ra được sự "va chạm" mạnh mẽ với các Headline quan trọng nhất không?
5.  Mỗi màn hình đã tuân thủ nguyên tắc **One Concept Per Screen** chưa?
6.  Hệ thống có cung cấp **Active Recall** thay vì đưa đáp án ngay khi học sinh làm sai không?

---

_Master Template được thiết kế để định hướng thẩm mỹ và tâm lý cho mọi sản phẩm DAC._
