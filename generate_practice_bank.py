import json

practice_bank = {}

def create_question(type_str, stem, options, correct, verdict, rule, why, trap, tip):
    return {
        "type": type_str,
        "stem": stem,
        "options": options,
        "correct": correct,
        "explanation": {
            "verdict": verdict,
            "rule": rule,
            "why": why,
            "trap": trap,
            "tip": tip
        }
    }

def create_word_builder(prompt, correct, words, verdict, rule, why, trap, tip):
    return {
        "type": "word_builder",
        "prompt": prompt,
        "correct": correct,
        "words": words,
        "explanation": {
            "verdict": verdict,
            "rule": rule,
            "why": why,
            "trap": trap,
            "tip": tip
        }
    }

practice_bank["tense_0"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu sau: *\"She ________ to school every day.\"*<br>(Dịch: Cô ấy đi bộ đến trường mỗi ngày.)", 
            {"A": "walk", "B": "walks", "C": "walked", "D": "walking"}, "B",
            "Đáp án đúng là **B: walks**.", "S + V(s/es): Chủ ngữ ngôi thứ 3 số ít thêm s/es.", 
            "Chủ ngữ 'She' là số ít nên động từ 'walk' phải thêm 's'.", 
            "Học sinh hay quên chia động từ hoặc chia theo thói quen thêm '-ing'.", "Thấy 'every day' + 'She' -> Động từ thêm 's' ngay!"),
        create_question("multiple_choice", "Hoàn thành câu sau: *\"They ________ coffee in the evening.\"*<br>(Dịch: Họ không uống cà phê vào buổi tối.)", 
            {"A": "not drink", "B": "doesn't drink", "C": "don't drink", "D": "don't drinks"}, "C",
            "Đáp án đúng là **C: don't drink**.", "Câu phủ định: S (số nhiều) + don't + V-inf.", 
            "Chủ ngữ 'They' là số nhiều nên mượn trợ động từ 'don't' + V nguyên mẫu.", 
            "Nhầm lẫn trợ động từ 'doesn't' của số ít, hoặc vẫn chia động từ sau 'don't'.", "They/We/I/You đi với don't. Phía sau giữ nguyên động từ!"),
        create_question("multiple_choice", "Hoàn thành câu sau: *\"The sun ________ in the East.\"*<br>(Dịch: Mặt trời mọc ở hướng Đông.)", 
            {"A": "rise", "B": "rises", "C": "rose", "D": "is rising"}, "B",
            "Đáp án đúng là **B: rises**.", "Sự thật hiển nhiên luôn chia Hiện tại đơn.", 
            "'The sun' là danh từ số ít (tương đương It), động từ 'rise' phải thêm 's'.", 
            "Nhiều bạn nghĩ đang mô tả cảnh tượng nên dùng Hiện tại tiếp diễn (is rising).", "Chân lý, sự thật bất di bất dịch -> Hiện tại đơn!")
    ],
    "round2": [
        create_question("cloze", "Điền vào chỗ trống dạng chia đúng của từ:<br> *\"My brother (always/leave) ________ his dirty socks on the floor!\"*<br>(Dịch: Anh trai tôi luôn để tất bẩn trên sàn nhà - phàn nàn.)", 
            {"A": "always leaves", "B": "is always leaving", "C": "always leave", "D": "has always left"}, "B",
            "Đáp án đúng là **B: is always leaving**.", "Hiện tại tiếp diễn + Always = Phàn nàn thói quen xấu.", 
            "Đừng để 'always' lừa! Đây là câu phàn nàn một thói quen gây khó chịu, cấu trúc đặc biệt của HTTD.", 
            "Hầu hết học sinh thấy 'always' là tự động chọn Hiện tại đơn (always leaves).", "Always + hành động tiêu cực/gây bực mình -> Dùng HTTD!"),
        create_question("multiple_choice", "Câu sau có một lỗi sai ngữ pháp: *\"He don't like playing football in the rain.\"*.<br>Hãy chọn phương án **sửa đúng nhất**: ", 
            {"A": "He doesn't like playing football in the rain.", "B": "He don't likes playing football in the rain.", "C": "He doesn't likes playing football in the rain.", "D": "He not like playing football in the rain."}, "A",
            "Đáp án đúng là **A**.", "Trợ động từ phủ định cho ngôi 3 số ít là 'doesn't'.", 
            "'He' bắt buộc đi với 'doesn't', và động từ chính 'like' phải ở dạng nguyên mẫu.", 
            "Học sinh sửa thành doesn't nhưng quên đưa 'likes' về 'like' (phương án C).", "Đã mượn trợ động từ (does/doesn't) thì động từ chính trả về nguyên thể không 's'."),
        create_question("multiple_choice", "Câu sau có một lỗi sai ngữ pháp: *\"Do she live in Hanoi with her parents?\"*.<br>Hãy chọn phương án **sửa đúng nhất**: ", 
            {"A": "Does she lives in Hanoi with her parents?", "B": "Does she live in Hanoi with her parents?", "C": "Is she live in Hanoi with her parents?", "D": "Do she lives in Hanoi with her parents?"}, "B",
            "Đáp án đúng là **B**.", "Trợ động từ nghi vấn cho ngôi 3 số ít là 'Does'.", 
            "Chủ ngữ 'she' yêu cầu mượn 'Does' đặt lên đầu câu, động từ 'live' giữ nguyên.", 
            "Bẫy chia cả trợ động từ lẫn động từ chính (phương án A).", "Câu hỏi mượn Does, động từ chính luôn 'sạch' (không s/es).")
    ],
    "round3": [
        create_question("multiple_choice", "Chọn câu tiếng Anh **viết đúng ngữ pháp và sát nghĩa nhất** với câu tiếng Việt sau:<br> *\"Mẹ tôi hiếm khi đi ngủ trước 11 giờ đêm.\"*", 
            {"A": "My mother rarely goes to bed before 11 PM.", "B": "My mother rarely go to bed before 11 PM.", "C": "My mother doesn't rarely goes to bed before 11 PM.", "D": "My mother rarely is going to bed before 11 PM."}, "A",
            "Đáp án đúng là **A**.", "Trạng từ chỉ tần suất (rarely) đứng trước động từ thường.", 
            "Rarely mang nghĩa phủ định, kết hợp Hiện tại đơn để tả thói quen. 'My mother' là số ít nên 'go' thành 'goes'.", 
            "Bẫy dùng thêm doesn't dù rarely đã là phủ định (C), hoặc quên chia động từ (B).", "Rarely/Seldom/Hardly bản thân đã là 'KHÔNG', tuyệt đối không thêm don't/doesn't."),
        create_word_builder("Sắp xếp các từ sau để viết thành câu ĐÚNG:", "The train to London departs at 8 AM tomorrow.", 
            ["The", "train", "to", "London", "departs", "at", "8", "AM", "tomorrow."], 
            "Đáp án chính xác: *\"The train to London departs at 8 AM tomorrow.\"*", "Lịch trình tàu xe luôn chia Hiện tại đơn.", 
            "Dù có chữ 'tomorrow' (ngày mai), lịch trình tàu xe cố định bắt buộc dùng Hiện tại đơn.", 
            "Học sinh có xu hướng dùng 'will depart' vì thấy 'tomorrow'.", "Lịch trình phương tiện công cộng / rạp phim / máy bay -> Chọn ngay Hiện tại đơn!")
    ]
}

practice_bank["tense_1"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu sau: *\"Listen! The baby ________ in the bedroom.\"*<br>(Dịch: Nghe kìa! Em bé đang khóc trong phòng ngủ.)", 
            {"A": "cries", "B": "is crying", "C": "cry", "D": "are crying"}, "B",
            "Đáp án đúng là **B: is crying**.", "S + am/is/are + V-ing.", 
            "Dấu hiệu 'Listen!' cho thấy hành động đang diễn ra. 'The baby' là số ít nên dùng 'is'.", 
            "Dùng 'are crying' sai hòa hợp chủ-vị, hoặc chia Hiện tại đơn 'cries'.", "Thấy mệnh lệnh gây chú ý (Look!, Listen!, Be quiet!) -> HTTD!"),
        create_question("multiple_choice", "Hoàn thành câu sau: *\"They ________ football at the moment.\"*<br>(Dịch: Họ đang chơi bóng đá ngay lúc này.)", 
            {"A": "are playing", "B": "playing", "C": "is playing", "D": "play"}, "A",
            "Đáp án đúng là **A: are playing**.", "Chủ ngữ số nhiều + are + V-ing.", 
            "'at the moment' là dấu hiệu của HTTD. 'They' đi với 'are'.", 
            "Bỏ quên to be chỉ dùng V-ing (playing) - lỗi cực kỳ phổ biến.", "Luôn nhớ cặp bài trùng: Phải có TO BE + V-ing.")
    ],
    "round2": [
        create_question("cloze", "Điền vào chỗ trống dạng chia đúng của từ:<br> *\"I (understand) ________ what you are saying now.\"*<br>(Dịch: Tôi hiểu những gì bạn đang nói lúc này.)", 
            {"A": "am understanding", "B": "understand", "C": "understands", "D": "is understanding"}, "B",
            "Đáp án đúng là **B: understand**.", "Động từ trạng thái (State Verbs) không dùng tiếp diễn.", 
            "'Understand' chỉ trạng thái nhận thức, tuyệt đối KHÔNG chia V-ing dù có 'now'.", 
            "Học sinh thấy 'now' tự động lao vào chọn 'am understanding'.", "See, hear, understand, know, want, like -> Cấm dùng V-ing!")
    ],
    "round3": [
        create_word_builder("Sắp xếp các từ sau để viết thành câu ĐÚNG:", "What are you doing this weekend?", 
            ["What", "are", "you", "doing", "this", "weekend?"], 
            "Đáp án chính xác: *\"What are you doing this weekend?\"*", "Câu hỏi HTTD chỉ kế hoạch tương lai.", 
            "Cấu trúc: Wh-word + to be + S + V-ing + thời gian tương lai.", 
            "Nhầm trật tự từ: What you are doing...", "Từ để hỏi -> To Be -> Chủ ngữ -> V-ing.")
    ]
}

js_content = f"const PRACTICE_BANK = {json.dumps(practice_bank, indent=4, ensure_ascii=False)};"

with open('/Users/danghong/Documents/Exam Runners/website/js/practice_bank.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
