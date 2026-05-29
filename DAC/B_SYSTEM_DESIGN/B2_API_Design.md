# Thiết kế API (API Design) - Exam Runner

Tài liệu này mô tả các API endpoint cốt lõi dự kiến cho hệ thống Exam Runner, phục vụ cho các phân hệ đã định nghĩa trong file Yêu cầu Chức năng (`A1.1`).

Dự kiến sử dụng chuẩn **RESTful API** (hoặc có thể chuyển đổi sang GraphQL nếu cần ở bước sau).

---

## 1. Phân hệ Onboarding & User

### `POST /api/v1/user/onboarding`
*   **Mô tả**: Lưu trữ thông tin thiết lập ban đầu của học sinh và khởi tạo lộ trình.
*   **Request Body**:
    ```json
    {
      "target_date": "2026-06-15T00:00:00Z",
      "goal_score": 8.5,
      "available_days": [1, 3, 5, 7],
      "daily_time_minutes": 60,
      "notification_frequency": "daily"
    }
    ```
*   **Response**: `200 OK` kèm theo Schedule (Lịch học) đã được rải 50 đề.

---

## 2. Phân hệ Luyện đề (Exams)

### `GET /api/v1/exams`
*   **Mô tả**: Lấy danh sách đề thi (Đã mở khóa hoặc theo lịch).
*   **Query Params**: `status=unlocked|locked|completed`
*   **Response**: Danh sách tóm tắt các đề thi.

### `GET /api/v1/exams/:id`
*   **Mô tả**: Lấy chi tiết một đề thi (bao gồm danh sách câu hỏi nhưng chưa có đáp án).
*   **Response**: Thông tin đề thi + Array Questions (ẩn trường `correct_answer` và `explanation`).

### `POST /api/v1/exams/:id/submit`
*   **Mô tả**: Nộp bài làm của học sinh.
*   **Request Body**:
    ```json
    {
      "answers": [
        {"question_id": "id1", "selected_option": "A"},
        {"question_id": "id2", "selected_option": "B"}
      ],
      "time_spent_seconds": 3200
    }
    ```
*   **Response**: Điểm số, đáp án đúng, và full `explanation` cho từng câu.

---

## 3. Phân hệ Flashcard (Từ vựng)

### `GET /api/v1/flashcards/due`
*   **Mô tả**: Lấy danh sách các từ vựng đến hạn cần ôn tập (Dựa trên thuật toán Spaced Repetition).
*   **Response**: Danh sách Flashcards.

### `POST /api/v1/flashcards/:id/review`
*   **Mô tả**: Cập nhật kết quả ôn tập một từ vựng để tính toán lại lịch Spaced Repetition.
*   **Request Body**:
    ```json
    {
      "quality": 5 // 1: Quên hoàn toàn -> 5: Nhớ rất rõ (Thang đo Anki)
    }
    ```
*   **Response**: Ngày ôn tập tiếp theo (`next_review_date`).

---

## 4. Phân hệ Ngữ pháp & Luyện tập bổ trợ

### `GET /api/v1/grammar/:id`
*   **Mô tả**: Lấy chi tiết lý thuyết ngữ pháp kèm link bài tập.
*   **Response**: Nội dung GrammarKnowledge (Theo chuẩn A5).

### `GET /api/v1/practice/dynamic`
*   **Mô tả**: Sinh đề luyện tập bổ trợ cho một chủ điểm ngữ pháp (Dành cho FR-14).
*   **Query Params**: `grammar_id=...&difficulty=Easy`
*   **Response**: Danh sách câu hỏi luyện tập riêng.

---

## 5. Phân hệ Quản trị (Admin/Coach)

### `PUT /api/v1/user/:id/schedule`
*   **Mô tả**: Gia sư điều chỉnh lộ trình học (ngày thi, deadline) cho học sinh.
*   **Request Body**:
    ```json
    {
      "target_date": "2026-06-20T00:00:00Z",
      "custom_deadlines": [
        {"exam_id": "exam1", "deadline": "2026-05-25T00:00:00Z"}
      ]
    }
    ```
*   **Response**: `200 OK` kèm theo Schedule đã cập nhật.
