import json
import os

# Load existing
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

# ----------------- TENSE 5: Quá khứ hoàn thành -----------------
practice_bank["tense_5"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"He ________ his dinner before we arrived.\"*<br>(Dịch: Anh ấy đã ăn xong bữa tối trước khi chúng tôi đến.)", 
            {"A": "finish", "B": "finished", "C": "had finished", "D": "has finished"}, "C",
            "Đáp án đúng là **C: had finished**.", "QKHT: S + had + V3/ed.", 
            "Hành động ăn tối xảy ra trước hành động đến (we arrived) trong quá khứ.", 
            "Học sinh hay nhầm với Hiện tại hoàn thành (has finished) hoặc chia Quá khứ đơn (finished).", "Xảy ra TRƯỚC quá khứ -> Dùng Quá khứ hoàn thành (had V3).")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"After she (do) ________ her homework, she went to bed.\"*<br>(Dịch: Sau khi cô ấy làm xong bài tập, cô ấy đã đi ngủ.)", 
            {"A": "did", "B": "has done", "C": "had done", "D": "was doing"}, "C",
            "Đáp án đúng là **C: had done**.", "Sau 'after' là hành động xảy ra trước -> chia QKHT.", 
            "Làm bài tập trước rồi mới đi ngủ.", 
            "Chia QKĐ 'did' theo thói quen.", "Sau After là QKHT, Trước Before là QKHT.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "By the time we reached the station, the train had left.", 
            ["By", "the", "time", "we", "reached", "the", "station,", "the", "train", "had", "left."], 
            "Đáp án chính xác: *\"By the time we reached the station, the train had left.\"*", "By the time + QKĐ, QKHT.", 
            "Tàu rời đi trước khi chúng tôi đến ga.", 
            "Đảo lộn trật tự các vế.", "Vào lúc (trong QK) -> Việc khác đã xong (QKHT).")
    ]
}

# ----------------- TENSE 6: Tương lai đơn -----------------
practice_bank["tense_6"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"I think it ________ tomorrow.\"*<br>(Dịch: Tôi nghĩ ngày mai trời sẽ mưa.)", 
            {"A": "rain", "B": "rains", "C": "will rain", "D": "is raining"}, "C",
            "Đáp án đúng là **C: will rain**.", "S + will + V-inf.", 
            "'I think' chỉ một dự đoán không chắc chắn trong tương lai.", 
            "Dùng 'is raining' (HTTD) sai ngữ cảnh vì đây không phải kế hoạch.", "I think / I hope / I promise -> Tương lai đơn (Will).")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"I promise I (not tell) ________ anyone your secret.\"*<br>(Dịch: Tôi hứa tôi sẽ không nói bí mật của bạn cho ai biết.)", 
            {"A": "don't tell", "B": "won't tell", "C": "didn't tell", "D": "am not telling"}, "B",
            "Đáp án đúng là **B: won't tell**.", "Lời hứa dùng Tương lai đơn.", 
            "'Promise' là dấu hiệu rõ ràng của Tương lai đơn (will / won't).", 
            "Dùng 'don't tell' sai thì.", "Hứa hẹn (Promise) -> Won't / Will.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "I will open the door for you.", 
            ["I", "will", "open", "the", "door", "for", "you."], 
            "Đáp án chính xác: *\"I will open the door for you.\"*", "Quyết định tức thời ngay lúc nói.", 
            "Dùng 'will' để đề nghị giúp đỡ.", 
            "Lắp sai vị trí của for you.", "Will + V-inf.")
    ]
}

# ----------------- TENSE 7: Tương lai gần -----------------
practice_bank["tense_7"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"Look at those dark clouds! It ________ rain.\"*<br>(Dịch: Nhìn những đám mây đen kìa! Trời sắp mưa rồi.)", 
            {"A": "will", "B": "is going to", "C": "going to", "D": "is going"}, "B",
            "Đáp án đúng là **B: is going to**.", "Be going to + V-inf (Dự đoán có căn cứ).", 
            "'Mây đen' là căn cứ rõ ràng ở hiện tại nên dùng tương lai gần.", 
            "Dùng 'will' là sai vì đây không phải phỏng đoán mù mờ. Dùng 'going to' thiếu to-be.", "Có bằng chứng sờ sờ trước mắt -> Be going to!")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"We (buy) ________ a new house next month. We have saved enough money.\"*<br>(Dịch: Chúng tôi định mua nhà mới vào tháng sau. Chúng tôi đã tiết kiệm đủ tiền.)", 
            {"A": "will buy", "B": "buy", "C": "are going to buy", "D": "bought"}, "C",
            "Đáp án đúng là **C: are going to buy**.", "Kế hoạch đã định sẵn từ trước.", 
            "Đã tiết kiệm tiền (có sự chuẩn bị) -> Dùng tương lai gần.", 
            "Dùng 'will buy' là sai vì đây không phải quyết định bộc phát.", "Dự định có chuẩn bị trước -> Tương lai gần.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "Are you going to attend the seminar tomorrow?", 
            ["Are", "you", "going", "to", "attend", "the", "seminar", "tomorrow?"], 
            "Đáp án chính xác: *\"Are you going to attend the seminar tomorrow?\"*", "Câu hỏi tương lai gần đảo To Be lên trước S.", 
            "Am/Is/Are + S + going to V.", 
            "Bỏ quên 'to' hoặc 'going'.", "Are + you + going to + V.")
    ]
}

# ----------------- PASSIVE 2: 2 Tân Ngữ & Truyền Khiến -----------------
practice_bank["passive_2"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"I had my computer ________ yesterday.\"*<br>(Dịch: Tôi đã nhờ người sửa máy tính hôm qua.)", 
            {"A": "repair", "B": "repairing", "C": "repaired", "D": "to repair"}, "C",
            "Đáp án đúng là **C: repaired**.", "Have sth V3/ed (Thể truyền khiến bị động).", 
            "'my computer' là vật bị tác động, động từ repair phải ở V3/ed.", 
            "Dùng V nguyên thể (repair) do nhầm với cấu trúc chủ động Have sb V.", "Nhờ vả bị động: Vật nằm giữa Have/Get và V3/ed.")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"She was given a beautiful watch ________ her birthday.\"*<br>(Dịch: Cô ấy được tặng một chiếc đồng hồ vào ngày sinh nhật.)", 
            {"A": "on", "B": "in", "C": "at", "D": "for"}, "A",
            "Đáp án đúng là **A: on**.", "Bị động 2 tân ngữ.", 
            "'give sb sth' chuyển thành 'sb be given sth'. Đi với birthday dùng giới từ 'on'.", 
            "Dùng sai giới từ thời gian.", "On + Ngày, In + Tháng/Năm, At + Giờ.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "We got our house painted last week.", 
            ["We", "got", "our", "house", "painted", "last", "week."], 
            "Đáp án chính xác: *\"We got our house painted last week.\"*", "Cấu trúc Get sth V3/ed.", 
            "Thuê ai sơn nhà = Có cái nhà được sơn.", 
            "Xếp thành 'got painted our house'.", "Chủ ngữ + Get + Vật + V3/ed.")
    ]
}

# ----------------- CONDITIONAL 0: Loại 1 -----------------
practice_bank["conditional_0"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"If you study hard, you ________ the exam.\"*<br>(Dịch: Nếu bạn học chăm, bạn sẽ đỗ.)", 
            {"A": "pass", "B": "will pass", "C": "passed", "D": "would pass"}, "B",
            "Đáp án đúng là **B: will pass**.", "Câu điều kiện loại 1 (có thể xảy ra).", 
            "Vế If dùng HTĐ (study), vế chính dùng will + V-inf.", 
            "Dùng 'would pass' sai loại điều kiện.", "If + HTĐ, S + Will + V-inf.")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"Unless you ________, you will fail.\"*<br>(Dịch: Trừ khi bạn luyện tập, bạn sẽ trượt.)", 
            {"A": "don't practice", "B": "practice", "C": "won't practice", "D": "practiced"}, "B",
            "Đáp án đúng là **B: practice**.", "Unless = If ... not.", 
            "Bản thân Unless đã mang nghĩa phủ định nên vế sau nó phải là khẳng định (practice).", 
            "Dùng phủ định kép 'Unless you don't practice'.", "Sau Unless tuyệt đối KHÔNG có NOT/DON'T/DOESN'T.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "If it rains tomorrow, we will stay at home.", 
            ["If", "it", "rains", "tomorrow,", "we", "will", "stay", "at", "home."], 
            "Đáp án chính xác: *\"If it rains tomorrow, we will stay at home.\"*", "ĐK loại 1 với 'it rains'.", 
            "Mệnh đề if đứng trước có dấu phẩy.", 
            "Nhầm 'If it will rain'.", "Tuyệt đối không dùng WILL trong mệnh đề chứa IF.")
    ]
}

# ----------------- CONDITIONAL 1: Loại 2 -----------------
practice_bank["conditional_1"] = {
    "round1": [
        create_question("multiple_choice", "Hoàn thành câu: *\"If I ________ you, I would take that course.\"*<br>(Dịch: Nếu tôi là bạn, tôi sẽ học khóa đó.)", 
            {"A": "am", "B": "was", "C": "were", "D": "have been"}, "C",
            "Đáp án đúng là **C: were**.", "Điều kiện loại 2 (trái thực tế hiện tại).", 
            "Động từ TO BE trong mệnh đề IF loại 2 luôn dùng 'were' cho mọi ngôi.", 
            "Dùng 'was' cho 'I' theo thói quen QKĐ thông thường.", "Giả định trái thực tế -> Auto dùng WERE!")
    ],
    "round2": [
        create_question("cloze", "Điền từ: *\"If she ________ more money, she could buy a car.\"*<br>(Dịch: Nếu cô ấy có nhiều tiền hơn, cô ấy có thể mua xe.)", 
            {"A": "has", "B": "had", "C": "have", "D": "would have"}, "B",
            "Đáp án đúng là **B: had**.", "Thực tế cô ấy không có tiền -> ĐK loại 2.", 
            "Mệnh đề IF chia QKĐ (had), mệnh đề chính dùng could buy.", 
            "Dùng 'has' (loại 1) nhưng vế chính lại là 'could'.", "Vế chính là Would/Could -> Vế If lùi về Quá khứ.")
    ],
    "round3": [
        create_word_builder("Sắp xếp lại:", "If I won the lottery, I would travel the world.", 
            ["If", "I", "won", "the", "lottery,", "I", "would", "travel", "the", "world."], 
            "Đáp án chính xác: *\"If I won the lottery, I would travel the world.\"*", "Giả định trúng số (khó xảy ra).", 
            "Dùng won (V2) và would travel.", 
            "Dùng 'will travel'.", "Mơ mộng viển vông -> Dùng Loại 2.")
    ]
}

js_content = f"const PRACTICE_BANK = {json.dumps(practice_bank, indent=4, ensure_ascii=False)};"

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print("Successfully appended to practice bank")
