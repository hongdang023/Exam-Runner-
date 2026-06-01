import json
import os

js_path = '/Users/danghong/Documents/Exam Runners/website/js/practice_bank.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()
    json_str = content.split('const PRACTICE_BANK = ')[1].strip().rstrip(';')
    practice_bank = json.loads(json_str)

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

# ----------------- TENSE 8-11: Other tenses (HTHTTD, QKHTTD, TLTD, TLHT) -----------------
for i in range(8, 12):
    practice_bank[f"tense_{i}"] = {
        "round1": [
            create_question("multiple_choice", f"Hoàn thành câu (Thì {i}): *\"They ________ for 3 hours.\"*<br>(Dịch: Họ đã chờ được 3 tiếng rồi.)", 
                {"A": "have been waiting", "B": "waits", "C": "waiting", "D": "has waited"}, "A",
                "Đáp án đúng là **A**.", "Nhấn mạnh quá trình kéo dài liên tục.", 
                "Hành động chờ đợi kéo dài không đứt quãng, dùng cấu trúc hoàn thành tiếp diễn.", 
                "Học sinh nhầm với HTHT hoặc QKĐ.", "Nhấn mạnh SỰ LIÊN TỤC -> Hoàn thành tiếp diễn.")
        ],
        "round2": [
            create_question("cloze", f"Điền từ: *\"By next year, I (work) ________ here for 5 years.\"*", 
                {"A": "will work", "B": "will have worked", "C": "worked", "D": "work"}, "B",
                "Đáp án đúng là **B: will have worked**.", "By + tương lai -> Tương lai hoàn thành.", 
                "Tính đến thời điểm trong tương lai thì hành động đã hoàn tất.", 
                "Dùng Tương lai đơn (will work) bỏ qua mất tính 'hoàn thành'.", "By + mốc thời gian -> Hoàn thành!")
        ],
        "round3": [
            create_word_builder("Sắp xếp lại:", "I will be sleeping at 10 PM tomorrow.", 
                ["I", "will", "be", "sleeping", "at", "10", "PM", "tomorrow."], 
                "Đáp án chính xác: *\"I will be sleeping at 10 PM tomorrow.\"*", "Tại thời điểm xác định ở tương lai.", 
                "Tương lai tiếp diễn: will be V-ing.", 
                "Quên to be.", "Giờ cụ thể + Tương lai -> Tương lai tiếp diễn.")
        ]
    }

# ----------------- CONDITIONAL 2: Loại 3 -----------------
practice_bank["conditional_2"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"If I had known you were in hospital, I ________ you.\"*<br>(Dịch: Nếu tôi biết bạn nằm viện, tôi đã đến thăm.)", 
            {"A": "will visit", "B": "would visit", "C": "would have visited", "D": "visited"}, "C",
            "Đáp án đúng là **C: would have visited**.", "Câu điều kiện loại 3 (trái thực tế quá khứ).", 
            "Vế If dùng QKHT (had known), vế chính dùng would have + V3/ed.", 
            "Dùng 'would visit' sai loại điều kiện (loại 2).", "Trái thực tế quá khứ -> would have V3.")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"If she (not miss) ________ the bus, she wouldn't have been late.\"*<br>(Dịch: Nếu cô ấy không lỡ xe buýt, cô ấy đã không bị muộn.)", 
            {"A": "didn't miss", "B": "hadn't missed", "C": "doesn't miss", "D": "hasn't missed"}, "B",
            "Đáp án đúng là **B: hadn't missed**.", "Phủ định của ĐK loại 3.", 
            "Vế If dùng quá khứ hoàn thành (had + not + V3/ed).", 
            "Dùng 'didn't miss' (loại 2).", "Vế chính có would have V3 -> Vế If dùng Quá khứ hoàn thành.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "If he had driven more carefully, he wouldn't have had an accident.", 
            ["If", "he", "had", "driven", "more", "carefully,", "he", "wouldn't", "have", "had", "an", "accident."], 
            "Đáp án chính xác: *\"If he had driven more carefully, he wouldn't have had an accident.\"*", "ĐK loại 3.", 
            "Vế If QKHT, vế chính would have V3.", 
            "Dùng sai động từ có 2 chữ had liên tiếp.", "Had + V3 và Would have + V3.")
    ]
}

# ----------------- CONDITIONAL 3: WISH -----------------
practice_bank["conditional_3"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"I wish I ________ taller.\"*<br>(Dịch: Tôi ước mình cao hơn.)", 
            {"A": "am", "B": "was", "C": "were", "D": "will be"}, "C",
            "Đáp án đúng là **C: were**.", "Câu ước trái hiện tại (lùi 1 thì).", 
            "Động từ TO BE trong câu ước hiện tại luôn dùng 'were' cho mọi ngôi.", 
            "Dùng 'am' không lùi thì, 'was' dùng sai theo ngữ pháp.", "Wish hiện tại -> Lùi thành QKĐ -> TO BE = were.")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"She wishes she (can) ________ speak English fluently.\"*", 
            {"A": "can", "B": "could", "C": "will", "D": "could have"}, "B",
            "Đáp án đúng là **B: could**.", "Ước một khả năng -> could + V.", 
            "Lùi can thành could trong câu ước.", 
            "Giữ nguyên can.", "Can -> Could.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "I wish I had not bought this car.", 
            ["I", "wish", "I", "had", "not", "bought", "this", "car."], 
            "Đáp án chính xác: *\"I wish I had not bought this car.\"*", "Câu ước trái quá khứ -> Lùi về QKHT.", 
            "Hối hận về một việc đã xảy ra trong quá khứ.", 
            "Dùng didn't buy.", "Wish quá khứ -> Lùi thành QK Hoàn thành.")
    ]
}


js_content = f"const PRACTICE_BANK = {json.dumps(practice_bank, indent=4, ensure_ascii=False)};"

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print("Successfully appended final chapters to practice bank")
