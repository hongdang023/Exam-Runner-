# Thiết kế Lưu trữ Dữ liệu (Cloudflare KV Schema) - Exam Runner

Tài liệu này mô tả cấu trúc dữ liệu dự kiến cho hệ thống Exam Runner. Vì hệ thống chỉ phục vụ **1 học sinh duy nhất** và cần sự tối giản, chúng ta sẽ sử dụng **Cloudflare KV** (Key-Value storage) để lưu trữ dữ liệu dưới dạng các chuỗi JSON.

Cấu trúc Key sẽ được đặt theo quy tắc: `prefix:identifier` để dễ quản lý.

---

## 1. Key: `user:current`
Lưu trữ thông tin tài khoản và bối cảnh cá nhân hóa của học sinh duy nhất.

**Value (JSON):**
```json
{
  "role": "student",
  "name": "Nguyễn Văn A",
  "email": "student@example.com",
  "avatar": "https://...",
  
  // Bảo mật mã PIN cho Role Switcher (Lưu trữ mã hash SHA-256 cục bộ)
  "parent_pin_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // PIN Phụ huynh (ví dụ của "1234")
  "tutor_pin_hash": "9d4e1e23b588e057f6875b40ca444d47a3f3e16b4f0b32559abf913a047daccd", // PIN Gia sư (ví dụ của "5678")
  
  // Bối cảnh Onboarding
  "onboarding": {
    "target_date": "2026-06-15T00:00:00Z",
    "start_date": "2026-05-18T00:00:00Z",
    "goal_score": 8.5,
    "available_days": [1, 3, 5, 7], // Thứ 2, 4, 6, CN
    "daily_time_minutes": 60,
    "notification_frequency": "daily",
    "exam_frequency": "weekly"
  },
  
  "created_at": "2026-05-17T16:00:00Z"
}
```

---

## 2. Key: `exam:{exam_id}`
Lưu trữ thông tin về 50 đề thi mẫu và các đề tự tạo.

**Value (JSON):**
```json
{
  "id": "exam_1",
  "title": "Đề thi thử số 1",
  "description": "Đề thi bám sát cấu trúc năm 2024",
  "type": "official", // official (50 đề gốc), mock (đề tự tạo)
  "time_limit_minutes": 60,
  "min_score_to_pass": 8.0, // Điểm tối thiểu để đạt Mastery (ví dụ 80%)
  "prerequisite_exam_id": null, // ID của đề cần hoàn thành trước đó (nếu có)
  
  // Cấu hình không gian luyện tập (Learning Space) mặc định
  "default_mode": "practice_room", // "practice_room" (Khan-style) | "adaptive_retry" (Brilliant-style)
  "default_layout": "split-pane", // "split-pane" (chia đôi) | "stacked" (xếp chồng dọc)
  
  // Ma trận đề thi
  "matrix": {
    "phonetics": 4,
    "error_correction": 3,
    "grammar_vocab": 10
  },
  
  "questions": [
    "question_id_1",
    "question_id_2"
  ],
  
  "created_at": "2026-05-17T16:00:00Z"
}
```

---

## 3. Key: `question:{question_id}`
Lưu trữ chi tiết từng câu hỏi.

**Value (JSON):**
```json
{
  "id": "question_id_1",
  "stem": "Choose the word whose underlined part is pronounced differently: __ed__",
  "type": "MCQ", // MCQ, Cloze, Transformation
  "options": [
    {"label": "A", "text": "played"},
    {"label": "B", "text": "worked"},
    {"label": "C", "text": "cleaned"},
    {"label": "D", "text": "smiled"}
  ],
  "correct_answer": "B",
  
  // Lời giải thích 5 bước + Active Recall
  "explanation": {
    "verdict": "Đáp án đúng là B.",
    "core_rule": "Quy tắc phát âm đuôi -ed: /t/, /d/, /id/.",
    "the_why": "worked phát âm là /t/, các từ còn lại là /d/.",
    "the_trap": "Học sinh dễ nhầm lẫn giữa các âm vô thanh và hữu thanh.",
    "master_tip": "Nhớ câu thần chú: 'Sáng sớm chạy xe phố phường'.",
    "active_recall_hint": "Thử phát âm lại từ 'work' xem kết thúc bằng âm gì nhé (vô thanh hay hữu thanh)?"
  },
  
  "tags": {
    "section": "Ngữ âm",
    "knowledge_point": "Phát âm -ed"
  },
  
  "difficulty": "Easy",
  "created_at": "2026-05-17T16:00:00Z"
}
```

---

## 4. Key: `flashcards`
Lưu trữ toàn bộ thẻ từ vựng của học sinh dưới dạng một mảng (vì số lượng ít nên không cần tách riêng từng key).

**Value (JSON):**
```json
[
  {
    "id": "flashcard_1",
    "front": {
      "text": "Accomplish",
      "ipa": "/əˈkʌm.plɪʃ/"
    },
    "back": {
      "short_definition": "Hoàn thành, đạt được",
      "example": "She accomplished her goal."
    },
    "created_at": "2026-05-17T16:00:00Z"
  }
]
```

---

## 5. Key: `progress`
Lưu trữ lịch sử làm bài và trạng thái ghi nhớ (Spaced Repetition) của học sinh duy nhất.

**Value (JSON):**
```json
{
  "exam_history": [
    {
      "exam_id": "exam_1",
      "score": 8.0,
      "mode_taken": "practice_room", // chế độ khi làm bài
      "layout_used": "split-pane", // giao diện được chọn
      "date": "2026-05-17T16:00:00Z"
    }
  ],
  
  "flashcard_mastery": [
    {
      "flashcard_id": "flashcard_1",
      "status": "learning", // unlearned, learning, mastered
      "srs_data": {
        "next_review_date": "2026-05-19T16:00:00Z",
        "interval_days": 1
      }
    }
  ],
  
  // Hệ thống Gamification (Streak & XP)
  "gamification": {
    "current_streak": 5, // streak ngày hiện tại
    "max_streak": 12, // streak dài nhất đã đạt được
    "total_xp": 450, // tổng số XP tích lũy từ trước đến nay
    "daily_xp_target": 50, // mục tiêu XP hàng ngày (theo FR-08)
    "last_active_date": "2026-05-20", // ngày hoạt động gần nhất
    "streak_history": ["2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19", "2026-05-20"] // các ngày duy trì streak
  }
}
```
