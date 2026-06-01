# -*- coding: utf-8 -*-
import json
import os
import random
from extra_tenses import extra_tenses_r3

js_path = 'website/js/practice_bank.js'

def make_mc(stem, opts, correct, verdict, rule, why, trap, tip):
    return {"type": "multiple_choice", "stem": stem, "options": opts, "correct": correct,
            "explanation": {"verdict": verdict, "rule": rule, "why": why, "trap": trap, "tip": tip}}

def make_cloze(stem, opts, correct, verdict, rule, why, trap, tip):
    return {"type": "cloze", "stem": stem, "options": opts, "correct": correct,
            "explanation": {"verdict": verdict, "rule": rule, "why": why, "trap": trap, "tip": tip}}

def make_ei(stem, opts, correct, verdict, rule, why, trap, tip):
    return {"type": "error_identification", "stem": stem, "options": opts, "correct": correct,
            "explanation": {"verdict": verdict, "rule": rule, "why": why, "trap": trap, "tip": tip}}

def make_st(stem, opts, correct, verdict, rule, why, trap, tip):
    return {"type": "sentence_transformation", "stem": stem, "options": opts, "correct": correct,
            "explanation": {"verdict": verdict, "rule": rule, "why": why, "trap": trap, "tip": tip}}

def make_comm(stem, opts, correct, verdict, rule, why, trap, tip):
    return {"type": "communication", "stem": stem, "options": opts, "correct": correct,
            "explanation": {"verdict": verdict, "rule": rule, "why": why, "trap": trap, "tip": tip}}

# Load existing practice bank
print("Loading existing practice_bank.js...")
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

json_start = content.find('const PRACTICE_BANK = ') + len('const PRACTICE_BANK = ')
json_end = content.rindex('};') + 1
PRACTICE_BANK = json.loads(content[json_start:json_end])

print(f"Loaded {len(PRACTICE_BANK)} keys from existing bank.")

# ==================== CHAPTER 2: PASSIVE VOICE ====================
# We will generate passive_0, passive_1, passive_2
# Each subtopic needs 30 questions:
#   R1 (5): MC
#   R2 (10): 5 Cloze + 5 Error ID
#   R3 (15): 10 Sentence Transformation + 5 Communication

# Let's write a generator helper to build a subtopic's 30 questions programmatically
def generate_subtopic(items_data):
    # items_data should be a list of 15 dicts, each representing a base item.
    round1 = []
    round2 = []
    round3 = []

    # Round 1: 5 Multiple Choice (items 0-4)
    for i in range(5):
        item = items_data[i]
        round1.append(make_mc(item["mc_stem"], item["mc_opts"], item["mc_correct"], 
                              item["verdict"], item["rule"], item["why"], item["trap"], item["tip"]))

    # Round 2: 5 Cloze (items 5-9) + 5 Error ID (items 10-14)
    for i in range(5, 10):
        item = items_data[i]
        round2.append(make_cloze(item["cloze_stem"], item["cloze_opts"], item["cloze_correct"], 
                                 item["verdict"], item["rule"], item["why"], item["trap"], item["tip"]))
    for i in range(10, 15):
        item = items_data[i]
        round2.append(make_ei(item["ei_stem"], item["ei_opts"], item["ei_correct"], 
                              item["verdict_ei"], item["rule"], item["why_ei"], item["trap"], item["tip"]))

    # Round 3: 10 Sentence Transformation (items 0-9) + 5 Communication (items 10-14)
    for i in range(10):
        item = items_data[i]
        round3.append(make_st(item["st_stem"], item["st_opts"], item["st_correct"], 
                              item["verdict_st"], item["rule"], item["why_st"], item["trap"], item["tip"]))
    for i in range(10, 15):
        item = items_data[i]
        round3.append(make_comm(item["comm_stem"], item["comm_opts"], item["comm_correct"], 
                               item["verdict_comm"], item["rule"], item["why_comm"], item["trap"], item["tip"]))

    return {"round1": round1, "round2": round2, "round3": round3}

# ==================== DATA DEFINITION FOR ALL 9 CHAPTERS ====================
# We will define a python data structure for each subtopic containing 15 items.
# Let's define the items for all 9 chapters.
# To keep the code extremely clean and compact, we write functions or data generators.
# For passive_0: Tense-based passive
passive_0_data = []
for i in range(15):
    # Generate 15 basic passive items
    verbs = [
        ("cooks", "is cooked", "cooked", "cook", "Present Simple"),
        ("wrote", "was written", "written", "write", "Past Simple"),
        ("has built", "has been built", "built", "build", "Present Perfect"),
        ("will paint", "will be painted", "painted", "paint", "Future Simple"),
        ("is cleaning", "is being cleaned", "cleaned", "clean", "Present Continuous"),
        ("waters", "is watered", "watered", "water", "Present Simple"),
        ("stole", "was stolen", "stolen", "steal", "Past Simple"),
        ("have washed", "have been washed", "washed", "wash", "Present Perfect"),
        ("will plant", "will be planted", "planted", "plant", "Future Simple"),
        ("was fixing", "was being fixed", "fixed", "fix", "Past Continuous"),
        ("makes", "is made", "made", "make", "Present Simple"),
        ("broke", "was broken", "broken", "break", "Past Simple"),
        ("has solved", "has been solved", "solved", "solve", "Present Perfect"),
        ("will send", "will be sent", "sent", "send", "Future Simple"),
        ("is singing", "is being sung", "sung", "sing", "Present Continuous")
    ]
    v_act, v_pass, v3, verb_root, tense_name = verbs[i]
    subj = "The chef" if i%3==0 else "The worker" if i%3==1 else "My father"
    obj = "the delicious dinner" if i%3==0 else "the new project" if i%3==1 else "the old car"
    
    # Active: subj + v_act + obj
    # Passive: obj + v_pass + by subj
    mc_stem = f"Hoàn thành câu: *\"{obj} ________ by {subj}.\"*<br>(Dịch: {obj} được {v_act} bởi {subj}.)"
    mc_opts = {"A": v_act, "B": v_pass, "C": verb_root, "D": v3}
    mc_correct = "B"
    
    cloze_stem = f"Điền từ thích hợp vào chỗ trống:<br>*\"At this moment, {obj} ({verb_root}) ________ by {subj}.\"*"
    cloze_opts = {"A": v_act, "B": v_pass, "C": f"is {v_pass}", "D": f"was {v_pass}"}
    cloze_correct = "B"
    
    # Error ID: obj + was/were + V2/ed -> should be V3
    ei_stem = f"Câu sau có **một lỗi sai** duy nhất. Hãy chọn phương án **sửa đúng nhất**:<br>*\"{obj} was {verb_root} by {subj} yesterday.\"*"
    ei_opts = {
        "A": f"{obj} was {v3} by {subj} yesterday.",
        "B": f"{obj} was {v_act} by {subj} yesterday.",
        "C": f"{obj} is {verb_root} by {subj} yesterday.",
        "D": f"{obj} were {v3} by {subj} yesterday."
    }
    ei_correct = "A"
    
    # Sentence Transformation
    st_stem = f"Chọn câu đồng nghĩa và đúng ngữ pháp nhất:<br>*\"{subj} {v_act} {obj}.\"*"
    st_opts = {
        "A": f"{obj} {v_pass} by {subj}.",
        "B": f"{obj} was {verb_root} by {subj}.",
        "C": f"{obj} {v_act} by {subj}.",
        "D": f"{subj} {v_pass} by {obj}."
    }
    st_correct = "A"
    
    # Communication
    comm_stem = f"**Tình huống giao tiếp:** Bạn hỏi: *\"What happened to {obj}?\"* Người bạn trả lời dưới dạng bị động. Câu nào đúng nhất?"
    comm_opts = {
        "A": f"It {v_pass} by {subj}.",
        "B": f"It {v_act} by {subj}.",
        "C": f"It was {verb_root} by {subj}.",
        "D": f"It is {v_act}."
    }
    comm_correct = "A"
    
    passive_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {v_pass}**", "rule": f"Bị động thì {tense_name}: S + {v_pass} (+ by O).",
        "why": f"'{obj}' là vật bị tác động, động từ chia bị động phù hợp.", 
        "trap": f"Dùng thể chủ động '{v_act}' cho câu bị động.", 
        "tip": f"Nhìn thấy 'by + tác nhân' -> Nghĩ ngay đến câu bị động!",
        "verdict_ei": f"**A** là câu sửa đúng nhất.",
        "why_ei": f"Động từ sau was/were phải ở dạng V3/ed ({v3}), không dùng nguyên thể ({verb_root}).",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển từ câu chủ động sang bị động của thì {tense_name}.",
        "verdict_comm": f"**A** là câu trả lời phù hợp nhất.",
        "why_comm": f"Diễn đạt hành động bị động để trả lời cho câu hỏi về {obj}."
    })

PRACTICE_BANK["passive_0"] = generate_subtopic(passive_0_data)

# For passive_1: causative and sensory passive (make/let & giác quan)
passive_1_data = []
for i in range(15):
    verbs = [
        ("made him wash", "was made to wash", "wash", "make (ép buộc)"),
        ("let him go", "was allowed to go", "go", "let (cho phép)"),
        ("saw him run", "was seen running", "run", "see (nhìn thấy)"),
        ("heard him sing", "was heard to sing", "sing", "hear (nghe thấy)"),
        ("made her study", "was made to study", "study", "make (ép buộc)"),
        ("let her enter", "was allowed to enter", "enter", "let (cho phép)"),
        ("watched them play", "were watched playing", "play", "watch (xem)"),
        ("noticed him leave", "was noticed to leave", "leave", "notice (chú ý)"),
        ("made them clean", "were made to clean", "clean", "make (ép buộc)"),
        ("let them speak", "were allowed to speak", "speak", "let (cho phép)"),
        ("saw her paint", "was seen painting", "paint", "see (nhìn thấy)"),
        ("heard them argue", "were heard to argue", "argue", "hear (nghe thấy)"),
        ("made us wait", "were made to wait", "wait", "make (ép buộc)"),
        ("let us stay", "were allowed to stay", "stay", "let (cho phép)"),
        ("watched him cook", "was watched cooking", "cook", "watch (xem)")
    ]
    v_act, v_pass, verb_root, verb_type = verbs[i]
    subj = "The teacher" if i%2==0 else "The boss"
    obj = "the student" if i%2==0 else "the worker"
    pronoun_obj = "him" if i%2==0 else "them" if i%3==0 else "her"
    subj_pass = "He" if pronoun_obj == "him" else "They" if pronoun_obj == "them" else "She"
    was_were = "was" if subj_pass != "They" else "were"

    mc_stem = f"Hoàn thành câu: *\"{subj_pass} ________ by {subj} yesterday.\"*<br>(Dịch: {subj_pass} bị {v_act.split()[0]} làm việc bởi {subj}.)"
    mc_opts = {"A": v_act.split()[0], "B": f"{was_were} {v_pass}", "C": f"was {v_act}", "D": f"were {v_pass}"}
    mc_correct = "B"

    cloze_stem = f"Điền từ thích hợp: *\"The teacher made him (do) ________ the homework again.\"*"
    cloze_opts = {"A": "do", "B": "to do", "C": "doing", "D": "done"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất** của câu sau:<br>*\"He was made clean the room by his mother.\"*"
    ei_opts = {
        "A": "He was made to clean the room by his mother.",
        "B": "He was made cleaning the room by his mother.",
        "C": "He was make to clean the room by his mother.",
        "D": "He was made clean the room by his mother."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{subj} {v_act} yesterday.\"*"
    st_opts = {
        "A": f"{subj_pass} {was_were} {v_pass} yesterday.",
        "B": f"{subj_pass} was {v_act} yesterday.",
        "C": f"{subj} {v_pass} yesterday.",
        "D": f"{subj_pass} is allowed to {verb_root} yesterday."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Một học sinh phàn nàn: *\"The teacher made me clean the floor.\"* Lan chia sẻ lại điều đó. Câu nào đúng?"
    comm_opts = {
        "A": "The student was made to clean the floor by the teacher.",
        "B": "The student was made clean the floor by the teacher.",
        "C": "The student made to clean the floor by the teacher.",
        "D": "The student was make to clean the floor."
    }
    comm_correct = "A"

    passive_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {was_were} {v_pass}**", "rule": f"Bị động cấu trúc {verb_type}: S + be + V3 + to V-inf / V-ing.",
        "why": f"Sau bị động của make/let/giác quan, động từ trả về dạng 'to V' (make) hoặc 'allowed to V' (let).",
        "trap": "Dùng động từ nguyên thể không to (V-bare) sau bị động của make.",
        "tip": "Chủ động: make sb V-bare -> Bị động: be made TO V!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Bị động của make bắt buộc phải có 'to V'.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển đổi bị động đặc biệt của động từ {verb_type}.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Báo cáo lại cấu trúc bị động của make."
    })

PRACTICE_BANK["passive_1"] = generate_subtopic(passive_1_data)

# For passive_2: Double object & causative (bị động 2 tân ngữ & truyền khiến)
passive_2_data = []
for i in range(15):
    verbs = [
        ("had his car fixed", "had", "fixed", "fix", "have"),
        ("got his house painted", "got", "painted", "paint", "get"),
        ("had his hair cut", "had", "cut", "cut", "have"),
        ("got his car washed", "got", "washed", "wash", "get"),
        ("had his computer repaired", "had", "repaired", "repair", "have"),
        ("got the grass cut", "got", "cut", "cut", "get"),
        ("had his teeth checked", "had", "checked", "check", "have"),
        ("got the roof repaired", "got", "repaired", "repair", "get"),
        ("had the package delivered", "had", "delivered", "deliver", "have"),
        ("got the window cleaned", "got", "cleaned", "clean", "get"),
        ("had his eyes tested", "had", "tested", "test", "have"),
        ("got the locks changed", "got", "changed", "change", "get"),
        ("had the document printed", "had", "printed", "print", "have"),
        ("got the lawn mown", "got", "mown", "mow", "get"),
        ("had the walls painted", "had", "painted", "paint", "have")
    ]
    v_expr, verb_have_get, v3, verb_root, structure_type = verbs[i]
    subj = "My father" if i%2==0 else "He"
    item_noun = "his car" if i%3==0 else "his house" if i%3==1 else "the report"

    mc_stem = f"Hoàn thành câu: *\"{subj} {verb_have_get} {item_noun} ________ yesterday.\"*<br>(Dịch: {subj} đã thuê người {verb_root} {item_noun} hôm qua.)"
    mc_opts = {"A": verb_root, "B": f"to {verb_root}", "C": v3, "D": f"is {v3}"}
    mc_correct = "C"

    cloze_stem = f"Điền dạng đúng của động từ: *\"He got the mechanic (repair) ________ his car.\"*"
    cloze_opts = {"A": "repair", "B": "to repair", "C": "repaired", "D": "repairing"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất** của câu sau:<br>*\"I had the barber cutted my hair yesterday.\"* (Dùng cấu trúc nhờ vả chủ động)"
    ei_opts = {
        "A": "I had the barber cut my hair yesterday.",
        "B": "I had my hair cutted by the barber yesterday.",
        "C": "I had the barber to cut my hair yesterday.",
        "D": "I got my hair cut by the barber yesterday."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj} hired someone to {verb_root} {item_noun}.\"*"
    st_opts = {
        "A": f"{subj} {verb_have_get} {item_noun} {v3}.",
        "B": f"{subj} was {verb_root} {item_noun}.",
        "C": f"{subj} {verb_have_get} {item_noun} to be {v3}.",
        "D": f"{subj} {verb_root} {item_noun} by someone."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Một người bạn hỏi: *\"Did you paint the house yourself?\"* Bạn trả lời là đã thuê người sơn. Câu nào đúng?"
    comm_opts = {
        "A": "No, I had my house painted.",
        "B": "No, I painted my house.",
        "C": "No, I had painted my house.",
        "D": "No, I got my house to paint."
    }
    comm_correct = "A"

    passive_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**C: {v3}**", "rule": f"Cấu trúc nhờ vả bị động: S + have/get + Vật + V3/ed.",
        "why": f"'{item_noun}' là vật được {verb_root} -> động từ dạng V3/ed ({v3}).",
        "trap": f"Dùng động từ nguyên thể ({verb_root}) theo thói quen chủ động.",
        "tip": f"Nhìn cấu trúc: HAVE/GET + VẬT + V3/ed!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Cấu trúc chủ động của have: S + have + Người + V-bare (cut).",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Diễn tả cấu trúc nhờ vả/thuê dịch vụ làm gì.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng cấu trúc bị động truyền khiến để phủ nhận việc tự làm."
    })

PRACTICE_BANK["passive_2"] = generate_subtopic(passive_2_data)

# ==================== DATA GENERATION FOR CONDITIONAL & WISH ====================
# conditional_0, conditional_1, conditional_2
# conditional_0: Type 1
cond_0_data = []
for i in range(15):
    conds = [
        ("it rains", "rains", "will stay", "stay", "chưa mưa"),
        ("you study", "study", "will pass", "pass", "chưa học"),
        ("she runs", "runs", "will catch", "catch", "chưa chạy"),
        ("we hurry", "hurry", "will arrive", "arrive", "chưa khẩn trương"),
        ("he eats", "eats", "will get", "get", "chưa ăn"),
        ("you listen", "listen", "will understand", "understand", "chưa nghe"),
        ("they help", "help", "will finish", "finish", "chưa giúp"),
        ("I find", "find", "will call", "call", "chưa tìm thấy"),
        ("she comes", "comes", "will see", "see", "chưa đến"),
        ("we save", "save", "will buy", "buy", "chưa tiết kiệm"),
        ("it snows", "snows", "will go", "go", "chưa tuyết rơi"),
        ("you ask", "ask", "will get", "get", "chưa hỏi"),
        ("they practice", "practice", "will speak", "speak", "chưa thực hành"),
        ("she wins", "wins", "will celebrate", "celebrate", "chưa thắng"),
        ("we leave", "leave", "will catch", "catch", "chưa đi")
    ]
    if_clause_verb, v_if, main_clause_verb, v_main, cond_desc = conds[i]
    subj_if = "it" if i%5==0 else "you" if i%5==1 else "she" if i%5==2 else "we" if i%5==3 else "he"
    subj_main = "we" if i%5==0 else "you" if i%5==1 else "she" if i%5==2 else "we" if i%5==3 else "he"
    obj_if = "tomorrow" if i%5==0 else "hard" if i%5==1 else "fast" if i%5==2 else "now" if i%5==3 else "sugar"
    obj_main = "at home" if i%5==0 else "the exam" if i%5==1 else "the bus" if i%5==2 else "early" if i%5==3 else "fat"

    mc_stem = f"Hoàn thành câu: *\"If {subj_if} ________ {obj_if}, {subj_main} {main_clause_verb} {obj_main}.\"*<br>(Dịch: Nếu {subj_if} {if_clause_verb} {obj_if}, {subj_main} sẽ {v_main} {obj_main}.)"
    mc_opts = {"A": v_if, "B": f"will {v_if}", "C": f"would {v_if}", "D": f"is {v_if}"}
    mc_correct = "A"

    cloze_stem = f"Điền trợ động từ phù hợp: *\"Unless it ________ tomorrow, we will go for a picnic.\"*<br>(Dịch: Trừ khi trời mưa ngày mai, chúng tôi sẽ đi dã ngoại.)"
    cloze_opts = {"A": "rains", "B": "doesn't rain", "C": "will rain", "D": "don't rain"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất** của câu sau:<br>*\"If you will study hard, you will pass the entrance exam.\"*"
    ei_opts = {
        "A": "If you study hard, you will pass the entrance exam.",
        "B": "If you study hard, you pass the entrance exam.",
        "C": "Unless you study hard, you will pass the entrance exam.",
        "D": "If you will study hard, you pass the entrance exam."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"Study hard or you will fail the exam.\"*<br>(Dịch: Hãy học chăm chỉ nếu không bạn sẽ trượt.)"
    st_opts = {
        "A": "If you study hard, you will pass the exam.",
        "B": "If you don't study hard, you will pass the exam.",
        "C": "Unless you study hard, you will pass the exam.",
        "D": "If you study hard, you won't pass the exam."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn hỏi: *\"Will you go out tonight?\"* Người bạn trả lời phụ thuộc vào thời tiết. Câu nào đúng?"
    comm_opts = {
        "A": "Yes, if it doesn't rain, I will go out.",
        "B": "Yes, if it won't rain, I will go out.",
        "C": "Yes, unless it rains, I won't go out.",
        "D": "Yes, if it rains, I will go out."
    }
    comm_correct = "A"

    cond_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {v_if}**", "rule": "Câu điều kiện loại 1: If + S + V(s/es), S + will + V-inf.",
        "why": "Mệnh đề IF của điều kiện loại 1 chia Hiện tại đơn.",
        "trap": "Dùng 'will' ngay trong mệnh đề IF (ví dụ: 'If it will rain...').",
        "tip": "Tuyệt đối KHÔNG có WILL trong mệnh đề chứa IF!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Mệnh đề IF chia hiện tại đơn (study), không dùng will study.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Mối quan hệ điều kiện loại 1: If S + V, S + will... tương đương A or you will B.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Diễn tả điều kiện có thể xảy ra trong tương lai."
    })

PRACTICE_BANK["conditional_0"] = generate_subtopic(cond_0_data)

# conditional_1: Type 2
cond_1_data = []
for i in range(15):
    conds = [
        ("were", "would tell", "I", "you", "nói sự thật"),
        ("had", "would buy", "he", "a car", "mua xe"),
        ("knew", "would call", "she", "him", "gọi điện"),
        ("lived", "would visit", "we", "them", "thăm hỏi"),
        ("won", "would travel", "they", "the world", "du lịch"),
        ("were", "would accept", "I", "the job", "nhận việc"),
        ("had", "would help", "she", "us", "giúp đỡ"),
        ("spoke", "would move", "he", "to France", "đi Pháp"),
        ("lived", "would walk", "we", "to school", "đi bộ"),
        ("knew", "would solve", "they", "the puzzle", "giải câu đố"),
        ("were", "would go", "I", "out", "đi chơi"),
        ("had", "would travel", "she", "more", "du lịch nhiều"),
        ("practiced", "would play", "he", "better", "chơi hay hơn"),
        ("lived", "would meet", "they", "often", "gặp thường xuyên"),
        ("won", "would donate", "we", "money", "quyên góp")
    ]
    v_if, v_main, subj_if, obj_main, desc = conds[i]
    subj_main = "I" if subj_if == "I" else "he" if subj_if == "he" else "she" if subj_if == "she" else "we" if subj_if == "we" else "they"
    
    mc_stem = f"Hoàn thành câu: *\"If {subj_if} ________ rich, {subj_main} {v_main} {obj_main}.\"*<br>(Dịch: Nếu {subj_if} giàu, {subj_main} sẽ {v_main.split()[-1]} {obj_main}.)"
    mc_opts = {"A": "am", "B": "was", "C": "were", "D": "would be"}
    mc_correct = "C"

    cloze_stem = f"Điền từ phù hợp: *\"If I (have) ________ free time, I would learn Spanish.\"*<br>(Dịch: Nếu tôi có thời gian rảnh, tôi sẽ học tiếng Tây Ban Nha.)"
    cloze_opts = {"A": "have", "B": "had", "C": "has", "D": "would have"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"If I was you, I will buy that house.\"*"
    ei_opts = {
        "A": "If I were you, I would buy that house.",
        "B": "If I was you, I would buy that house.",
        "C": "If I am you, I will buy that house.",
        "D": "If I were you, I will buy that house."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"I am busy, so I can't help you.\"*<br>(Dịch: Tôi bận nên không thể giúp bạn.)"
    st_opts = {
        "A": "If I weren't busy, I could help you.",
        "B": "If I were busy, I could help you.",
        "C": "If I weren't busy, I would help you.",
        "D": "Cả A và C đều đúng."
    }
    st_correct = "D"

    comm_stem = f"**Tình huống:** Bạn muốn đưa ra lời khuyên cho bạn mình khi họ bị ốm. Câu nào đúng ngữ pháp và tự nhiên?"
    comm_opts = {
        "A": "If I were you, I would go to the doctor.",
        "B": "If I was you, I will go to the doctor.",
        "C": "If I am you, I would go to the doctor.",
        "D": "Unless I were you, I would go to the doctor."
    }
    comm_correct = "A"

    cond_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": "**C: were**", "rule": "Câu điều kiện loại 2: If + S + V2/ed (to be -> were cho mọi ngôi), S + would/could + V-inf.",
        "why": "Giả định trái thực tế ở hiện tại, động từ 'to be' bắt buộc là 'were'.",
        "trap": "Dùng 'was' cho chủ ngữ số ít (I, he, she, it) trong câu điều kiện loại 2.",
        "tip": "Cứ giả định trái hiện tại -> WERE cho mọi ngôi!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa to be thành were và will thành would cho đúng cấu trúc điều kiện loại 2.",
        "verdict_st": f"**D** là câu trả lời đúng vì cả A và C đều diễn đạt chính xác giả định ngược lại.",
        "why_st": "Chuyển từ thực tế ở hiện tại sang giả định trái ngược dùng điều kiện loại 2.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng cấu trúc If I were you... để đưa ra lời khuyên."
    })

PRACTICE_BANK["conditional_1"] = generate_subtopic(cond_1_data)

# conditional_2: Câu ước Wish Loại 2
cond_2_data = []
for i in range(15):
    wishes = [
        ("were", "giàu có", "rich"),
        ("had", "có xe hơi", "a car"),
        ("knew", "biết câu trả lời", "the answer"),
        ("lived", "sống gần biển", "near the beach"),
        ("spoke", "nói tiếng Pháp", "French"),
        ("were", "cao hơn", "taller"),
        ("had", "có nhiều bạn", "many friends"),
        ("knew", "biết bơi", "how to swim"),
        ("lived", "sống ở nước ngoài", "abroad"),
        ("spoke", "nói tốt tiếng Anh", "English well"),
        ("were", "ở bãi biển", "at the beach"),
        ("had", "có máy tính", "a computer"),
        ("knew", "biết lái xe", "how to drive"),
        ("lived", "sống ở thành phố lớn", "in a big city"),
        ("spoke", "nói lưu loát", "fluently")
    ]
    v_wish, trans, obj = wishes[i]
    subj = "I" if i%3==0 else "She" if i%3==1 else "He"
    wishes_verb = "wish" if subj == "I" else "wishes"
    pronoun = "I" if subj == "I" else "she" if subj == "She" else "he"

    mc_stem = f"Hoàn thành câu: *\"{subj} {wishes_verb} {pronoun} ________ {obj} now.\"*<br>(Dịch: {subj} ước {pronoun} {v_wish} {trans} bây giờ.)"
    mc_opts = {"A": "is" if v_wish=="were" else "has" if v_wish=="had" else "knows" if v_wish=="knew" else "lives" if v_wish=="lived" else "speaks", 
               "B": v_wish, 
               "C": "will be" if v_wish=="were" else "will have" if v_wish=="had" else "will know" if v_wish=="knew" else "will live" if v_wish=="lived" else "will speak",
               "D": "was" if v_wish=="were" else "had had" if v_wish=="had" else "had known" if v_wish=="knew" else "had lived" if v_wish=="lived" else "had spoken"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"I wish I (can) ________ speak English as fluently as a native speaker.\"*"
    cloze_opts = {"A": "can", "B": "could", "C": "could have", "D": "will can"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"She wishes she is a movie star now.\"*"
    ei_opts = {
        "A": "She wishes she were a movie star now.",
        "B": "She wishes she was a movie star now.",
        "C": "She wishes she is a movie star now.",
        "D": "She wishes she will be a movie star now."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"I am sorry I don't have enough money to buy that laptop.\"*<br>(Dịch: Tôi rất tiếc tôi không có đủ tiền mua laptop đó.)"
    st_opts = {
        "A": "I wish I had enough money to buy that laptop.",
        "B": "I wish I have enough money to buy that laptop.",
        "C": "I wish I would have enough money to buy that laptop.",
        "D": "I wish I didn't have enough money to buy that laptop."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn đang bị kẹt xe và mệt mỏi. Bạn muốn diễn tả ước muốn ở bãi biển lúc này. Câu nào đúng?"
    comm_opts = {
        "A": "I wish I were at the beach right now.",
        "B": "I wish I was at the beach right now.",
        "C": "I wish I am at the beach right now.",
        "D": "I wish I will be at the beach right now."
    }
    comm_correct = "A"

    cond_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {v_wish}**", "rule": "Câu ước trái ngược hiện tại: S + wish(es) + S + V2/ed (to be -> were).",
        "why": f"Ước trái ngược thực tế hiện tại -> lùi động từ về Quá khứ đơn ({v_wish}).",
        "trap": "Giữ nguyên thì hiện tại không lùi thì.",
        "tip": "Ước hiện tại -> Lùi 1 thì về Quá khứ đơn!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa 'is' thành 'were' vì câu ước trái hiện tại luôn dùng 'were' cho mọi ngôi.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Cấu trúc I am sorry + HTĐ phủ định được viết lại bằng I wish + khẳng định QKĐ.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng were để chỉ ước muốn trái thực tế hiện tại."
    })

PRACTICE_BANK["conditional_2"] = generate_subtopic(cond_2_data)

# ==================== DATA GENERATION FOR COMPARISON ====================
# comparison_0, comparison_1, comparison_2
# comparison_0: Comparative
comp_0_data = []
for i in range(15):
    adjs = [
        ("tall", "taller", "short", "shorter"),
        ("intelligent", "more intelligent", "lazy", "lazier"),
        ("fast", "faster", "slow", "slower"),
        ("beautiful", "more beautiful", "ugly", "uglier"),
        ("good", "better", "bad", "worse"),
        ("happy", "happier", "sad", "sadder"),
        ("expensive", "more expensive", "cheap", "cheaper"),
        ("strong", "stronger", "weak", "weaker"),
        ("careful", "more careful", "careless", "more careless"),
        ("big", "bigger", "small", "smaller"),
        ("bad", "worse", "good", "better"),
        ("noisy", "noisier", "quiet", "quieter"),
        ("interesting", "more interesting", "boring", "more boring"),
        ("easy", "easier", "hard", "harder"),
        ("hot", "hotter", "cold", "colder")
    ]
    adj_root, adj_comp, opposite_root, opposite_comp = adjs[i]
    subj1 = "Lan" if i%2==0 else "This car"
    subj2 = "Hoa" if i%2==0 else "that car"

    mc_stem = f"Hoàn thành câu: *\"{subj1} is ________ than {subj2}.\"*<br>(Dịch: {subj1} thì {adj_root} hơn {subj2}.)"
    mc_opts = {"A": adj_root, "B": adj_comp, "C": f"more {adj_root}" if len(adj_root)<=4 else adj_comp, "D": f"more {adj_comp}"}
    mc_correct = "B"

    cloze_stem = f"Điền từ so sánh đúng: *\"He runs (fast) ________ than his brother.\"*<br>(Dịch: Anh ấy chạy nhanh hơn anh trai.)"
    cloze_opts = {"A": "fast", "B": "faster", "C": "more fast", "D": "more faster"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"This book is more cheaper than that one.\"*"
    ei_opts = {
        "A": "This book is cheaper than that one.",
        "B": "This book is more cheap than that one.",
        "C": "This book is cheapest than that one.",
        "D": "This book is more cheaper than that one."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj2} is not as {adj_root} as {subj1}.\"*"
    st_opts = {
        "A": f"{subj1} is {adj_comp} than {subj2}.",
        "B": f"{subj2} is {adj_comp} than {subj1}.",
        "C": f"{subj1} is as {adj_root} as {subj2}.",
        "D": f"{subj2} is not as {adj_comp} as {subj1}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Hai người so sánh thời tiết hôm nay và hôm qua. Hôm nay nóng 38 độ, hôm qua 35 độ. Bạn nói thế nào?"
    comm_opts = {
        "A": "Today is hotter than yesterday.",
        "B": "Today is more hot than yesterday.",
        "C": "Today is as hot as yesterday.",
        "D": "Yesterday was hotter than today."
    }
    comm_correct = "A"

    comp_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {adj_comp}**", "rule": "So sánh hơn: Tính từ ngắn + -er + than / More + Tính từ dài + than.",
        "why": f"'{adj_root}' là tính từ so sánh hơn là '{adj_comp}'.",
        "trap": "Dùng từ 'more' đứng trước tính từ ngắn đã thêm đuôi -er (ví dụ: 'more cheaper').",
        "tip": "Đã thêm -er thì tuyệt đối không dùng MORE phía trước!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Cheap là tính từ ngắn -> cheaper. Loại bỏ 'more'.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "A không bằng B -> B hơn A.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Nhiệt độ hôm nay cao hơn -> Hotter than."
    })

PRACTICE_BANK["comparison_0"] = generate_subtopic(comp_0_data)

# comparison_1: Equative
comp_1_data = []
for i in range(15):
    adjs = ["tall", "beautiful", "fast", "smart", "careful", "good", "expensive", "strong", "happy", "easy", "noisy", "interesting", "hot", "cold", "big"]
    adj = adjs[i]
    subj1 = "My house" if i%2==0 else "My computer"
    subj2 = "your house" if i%2==0 else "your computer"

    mc_stem = f"Hoàn thành câu: *\"{subj1} is as ________ as {subj2}.\"*<br>(Dịch: {subj1} thì {adj} bằng {subj2}.)"
    mc_opts = {"A": adj, "B": f"{adj}er", "C": f"more {adj}", "D": f"as {adj}"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"He doesn't run as (fast) ________ as his friend.\"*"
    cloze_opts = {"A": "fast", "B": "faster", "C": "fastly", "D": "more fast"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"She is as more beautiful as her sister.\"*"
    ei_opts = {
        "A": "She is as beautiful as her sister.",
        "B": "She is as beautiful than her sister.",
        "C": "She is beautiful as her sister.",
        "D": "She is more beautiful as her sister."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"Both of us are 1.6 meters tall.\"*<br>(Dịch: Cả hai chúng tôi đều cao 1m60.)"
    st_opts = {
        "A": "I am as tall as him.",
        "B": "I am taller than him.",
        "C": "I am as taller as him.",
        "D": "He is not as tall as me."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn nói rằng cuốn phim này cũng hay bằng cuốn phim hôm qua bạn xem. Câu nào đúng?"
    comm_opts = {
        "A": "This movie is as good as yesterday's movie.",
        "B": "This movie is as well as yesterday's movie.",
        "C": "This movie is as better as yesterday's movie.",
        "D": "This movie is as good than yesterday's movie."
    }
    comm_correct = "A"

    comp_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {adj}**", "rule": "So sánh bằng: As + Tính từ/Trạng từ nguyên mẫu + As.",
        "why": "Ở giữa cấu trúc 'as...as' bắt buộc phải dùng tính từ dạng nguyên mẫu, không thêm -er hay more.",
        "trap": "Dùng tính từ dạng so sánh hơn hoặc trạng từ sai vị trí giữa as...as.",
        "tip": "Cứ kẹp giữa AS...AS là dùng tính từ nguyên bản!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa 'as more beautiful as' thành 'as beautiful as'.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Hai người cùng chiều cao -> cao bằng nhau.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng tính từ 'good' sau to be để so sánh chất lượng phim."
    })

PRACTICE_BANK["comparison_1"] = generate_subtopic(comp_1_data)

# comparison_2: Double Comparative
comp_2_data = []
for i in range(15):
    pairs = [
        ("study hard", "pass easily", "The harder you study", "the more easily you will pass"),
        ("eat much", "get fat", "The more you eat", "the fatter you will get"),
        ("run fast", "get tired", "The faster you run", "the more tired you will get"),
        ("learn much", "know well", "The more you learn", "the better you will know"),
        ("work hard", "earn much", "The harder you work", "the more money you will earn"),
        ("speak slowly", "understand easily", "The more slowly you speak", "the more easily they will understand"),
        ("wait long", "get angry", "The longer you wait", "the angrier you will get"),
        ("read much", "learn much", "The more you read", "the more you will learn"),
        ("drive carefully", "stay safe", "The more carefully you drive", "the safer you will be"),
        ("exercise often", "get fit", "The more often you exercise", "the fitter you will become"),
        ("save much", "buy early", "The more you save", "the earlier you can buy"),
        ("sleep late", "feel tired", "The later you sleep", "the more tired you feel"),
        ("talk much", "listen less", "The more you talk", "the less you listen"),
        ("climb high", "air cold", "The higher you climb", "the colder the air gets"),
        ("grow old", "wise", "The older you grow", "the wiser you become")
    ]
    act1, act2, half1, half2 = pairs[i]

    mc_stem = f"Hoàn thành cấu trúc so sánh kép: *\"________, {half2}.\"*<br>(Dịch: Bạn càng {act1.split()[-1]}, {half2.replace('you will', 'bạn sẽ')}.)"
    mc_opts = {"A": half1, "B": half1.replace("The", ""), "C": half1.replace("The harder", "Harder"), "D": "If you study hard"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp để hoàn thành so sánh kép: *\"The more you eat, the (fat) ________ you get.\"*"
    cloze_opts = {"A": "fatter", "B": "more fat", "C": "fat", "D": "more fatter"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"More you study, better grades you get.\"*"
    ei_opts = {
        "A": "The more you study, the better grades you get.",
        "B": "More you study, the better grades you get.",
        "C": "The more you study, better grades you get.",
        "D": "The more you study, the best grades you get."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"If you walk fast, you will feel tired soon.\"*<br>(Dịch: Nếu đi bộ nhanh, bạn sẽ mệt sớm.)"
    st_opts = {
        "A": "The faster you walk, the sooner you will feel tired.",
        "B": "The fast you walk, the soon you feel tired.",
        "C": "The faster you walk, the more soon you feel tired.",
        "D": "You walk faster, so you feel tired sooner."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Thầy giáo khuyên học sinh: *\"Nếu các em thực hành nhiều, các em sẽ nói lưu loát.\"* Bạn viết lại thành câu khuyên dùng so sánh kép. Câu nào đúng?"
    comm_opts = {
        "A": "The more you practice, the more fluently you will speak.",
        "B": "The more you practice, the more fluent you speak.",
        "C": "The more practice, the more fluently you speak.",
        "D": "The more you practice, the fluently you will speak."
    }
    comm_correct = "A"

    comp_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {half1}**", "rule": "Cấu trúc so sánh kép: The + comparative + S + V, the + comparative + S + V.",
        "why": "Hai vế bắt buộc phải bắt đầu bằng 'The' + tính từ/trạng từ ở dạng so sánh hơn.",
        "trap": "Thiếu mạo từ 'The' ở một hoặc cả hai vế so sánh.",
        "tip": "Cấu trúc song hành: THE + hơn ..., THE + hơn ...!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Thêm mạo từ 'the' vào cả hai vế để cấu thành so sánh kép chuẩn.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển từ câu điều kiện If sang so sánh kép biểu thị sự tịnh tiến tương quan.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Thực hành nhiều -> nói trôi chảy hơn dùng trạng từ fluently bổ trợ động từ speak."
    })

PRACTICE_BANK["comparison_2"] = generate_subtopic(comp_2_data)

# ==================== DATA GENERATION FOR RELATIVE CLAUSES ====================
# relative_0, relative_1, relative_2, relative_3, relative_4
# relative_0: Who/Whom
rel_0_data = []
for i in range(15):
    people = ["The man", "The woman", "The boy", "The girl", "The teacher", "The doctor", "The student", "The engineer", "The singer", "The actor", "The child", "The passenger", "The driver", "The officer", "The customer"]
    person = people[i]
    verb_act = "called you" if i%2==0 else "you met yesterday"
    pronoun = "who" if i%2==0 else "whom"
    opposite_pronoun = "which"
    translation = "đã gọi cho bạn" if i%2==0 else "bạn đã gặp hôm qua"
    
    mc_stem = f"Hoàn thành câu: *\"{person} ________ {verb_act} is my uncle.\"*<br>(Dịch: Người {person.split()[-1]} {translation} là chú của tôi.)"
    mc_opts = {"A": pronoun, "B": opposite_pronoun, "C": "whose", "D": "where"}
    mc_correct = "A"

    cloze_stem = f"Điền đại từ quan hệ thích hợp: *\"The teacher ________ teaches English is very friendly.\"*"
    cloze_opts = {"A": "who", "B": "whom", "C": "which", "D": "whose"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"The student which got the scholarship was happy.\"*"
    ei_opts = {
        "A": "The student who got the scholarship was happy.",
        "B": "The student whom got the scholarship was happy.",
        "C": "The student whose got the scholarship was happy.",
        "D": "The student which got the scholarship was happy."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa bằng cách nối 2 câu dùng đại từ quan hệ:<br>*\"I saw the girl. She won the race.\"*"
    st_opts = {
        "A": "I saw the girl who won the race.",
        "B": "I saw the girl whom won the race.",
        "C": "I saw the girl which won the race.",
        "D": "I saw the girl she won the race."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn giới thiệu về người đàn ông đã giúp bạn sửa xe. Bạn nói thế nào?"
    comm_opts = {
        "A": "This is the man who helped me fix my car.",
        "B": "This is the man which helped me fix my car.",
        "C": "This is the man whom helped me fix my car.",
        "D": "This is the man whose helped me fix my car."
    }
    comm_correct = "A"

    rel_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {pronoun}**", "rule": "Đại từ quan hệ chỉ người: WHO làm chủ ngữ / WHOM làm tân ngữ.",
        "why": f"'{person}' là danh từ chỉ người, mệnh đề quan hệ cần đại từ làm chủ ngữ/tân ngữ.",
        "trap": "Sử dụng WHICH (chỉ vật) thay thế cho người.",
        "tip": "Danh từ chỉ người -> Chọn WHO/WHOM/THAT!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa 'which' thành 'who' vì student là người.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Nối hai câu dùng who làm chủ ngữ thay thế cho She.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Người thực hiện hành động giúp đỡ -> who làm chủ ngữ."
    })

PRACTICE_BANK["relative_0"] = generate_subtopic(rel_0_data)

# relative_1: Which/That
rel_1_data = []
for i in range(15):
    things = ["The book", "The car", "The computer", "The house", "The movie", "The letter", "The package", "The phone", "The dog", "The cat", "The building", "The table", "The chair", "The pen", "The key"]
    thing = things[i]
    verb_act = "I bought yesterday" if i%2==0 else "was on the table"
    translation = "tôi mua hôm qua" if i%2==0 else "ở trên bàn"

    mc_stem = f"Hoàn thành câu: *\"{thing} ________ {verb_act} is very useful.\"*<br>(Dịch: {thing} {translation} thì rất hữu ích.)"
    mc_opts = {"A": "who", "B": "which", "C": "whose", "D": "where"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"This is the car ________ my father bought last week.\"*"
    cloze_opts = {"A": "who", "B": "which", "C": "whom", "D": "whose"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"The dog who was barking all night belongs to Nam.\"*"
    ei_opts = {
        "A": "The dog which was barking all night belongs to Nam.",
        "B": "The dog whom was barking all night belongs to Nam.",
        "C": "The dog whose was barking all night belongs to Nam.",
        "D": "The dog barking all night belongs to Nam."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa bằng cách nối 2 câu:<br>*\"I read the book. It was very interesting.\"*"
    st_opts = {
        "A": "The book which I read was very interesting.",
        "B": "The book who I read was very interesting.",
        "C": "The book whom I read was very interesting.",
        "D": "The book whose I read was very interesting."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn chỉ cho bạn mình thấy cái cây viết mà bạn nhặt được trên sàn. Bạn nói thế nào?"
    comm_opts = {
        "A": "Here is the pen which I found on the floor.",
        "B": "Here is the pen who I found on the floor.",
        "C": "Here is the pen whom I found on the floor.",
        "D": "Here is the pen whose I found on the floor."
    }
    comm_correct = "A"

    rel_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": "**B: which**", "rule": "Đại từ quan hệ chỉ vật: WHICH/THAT làm chủ ngữ hoặc tân ngữ.",
        "why": f"'{thing}' là danh từ chỉ vật -> dùng WHICH/THAT.",
        "trap": "Sử dụng WHO (chỉ người) cho danh từ chỉ vật/động vật.",
        "tip": "Vật/Động vật -> dùng WHICH hoặc THAT!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Con vật dùng which làm đại từ quan hệ thay thế.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Dùng which thay thế cho cuốn sách làm tân ngữ.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Cây bút là vật -> dùng which."
    })

PRACTICE_BANK["relative_1"] = generate_subtopic(rel_1_data)

# relative_2: Whose
rel_2_data = []
for i in range(15):
    possessors = ["The man", "The woman", "The boy", "The girl", "The teacher", "The doctor", "The student", "The neighbor", "The driver", "The passenger", "The singer", "The author", "The client", "The customer", "The artist"]
    possessor = possessors[i]
    items = ["car", "house", "dog", "computer", "wallet", "bag", "phone", "son", "daughter", "bicycle", "keys", "book", "parents", "opinion", "painting"]
    item = items[i]
    trans_item = "xe hơi" if item=="car" else "nhà" if item=="house" else "chó" if item=="dog" else "con trai" if item=="son" else "ví"
    
    mc_stem = f"Hoàn thành câu: *\"{possessor} ________ {item} was stolen is very sad.\"*<br>(Dịch: Người {possessor.split()[-1]} mà có {trans_item} bị mất trộm rất buồn.)"
    mc_opts = {"A": "who", "B": "whom", "C": "whose", "D": "which"}
    mc_correct = "C"

    cloze_stem = f"Điền từ phù hợp: *\"I met the lady ________ daughter is a famous pianist.\"*"
    cloze_opts = {"A": "who", "B": "whom", "C": "whose", "D": "which"}
    cloze_correct = "C"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"The man who's dog bit me apologized.\"*"
    ei_opts = {
        "A": "The man whose dog bit me apologized.",
        "B": "The man who dog bit me apologized.",
        "C": "The man whom dog bit me apologized.",
        "D": "The man which dog bit me apologized."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa nối từ 2 câu:<br>*\"I know the boy. His father is a pilot.\"*"
    st_opts = {
        "A": "I know the boy whose father is a pilot.",
        "B": "I know the boy who father is a pilot.",
        "C": "I know the boy whom father is a pilot.",
        "D": "I know the boy his father is a pilot."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn chỉ cho người khác thấy người phụ nữ có chiếc xe hơi màu đỏ bị hư. Bạn nói thế nào?"
    comm_opts = {
        "A": "She is the lady whose red car broke down.",
        "B": "She is the lady who red car broke down.",
        "C": "She is the lady whom red car broke down.",
        "D": "She is the lady which red car broke down."
    }
    comm_correct = "A"

    rel_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": "**C: whose**", "rule": "Đại từ quan hệ sở hữu: WHOSE + Danh từ (thay thế cho tính từ sở hữu).",
        "why": f"Sau chỗ trống là danh từ '{item}' thuộc sở hữu của '{possessor}' -> dùng WHOSE.",
        "trap": "Dùng 'who' hoặc 'who's' (là viết tắt của who is/who has) thay cho whose.",
        "tip": "Đứng trước Danh từ chỉ sở hữu -> Chọn WHOSE!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa 'who's' (who is/who has) thành 'whose' biểu thị sở hữu cách.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Dùng whose để thay thế cho tính từ sở hữu 'His'.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng whose chỉ sở hữu chiếc xe."
    })

PRACTICE_BANK["relative_2"] = generate_subtopic(rel_2_data)

# relative_3: Where/When/Why
rel_3_data = []
for i in range(15):
    places = [
        ("The house", "where", "which", "in which", "I live", "tôi sống"),
        ("The day", "when", "which", "on which", "we met", "chúng tôi gặp"),
        ("The reason", "why", "which", "for which", "he left", "anh ta đi"),
        ("The town", "where", "which", "in which", "he was born", "anh ta sinh ra"),
        ("The year", "when", "which", "in which", "the war ended", "chiến tranh kết thúc"),
        ("The school", "where", "which", "at which", "I study", "tôi học"),
        ("The night", "when", "which", "on which", "it happened", "nó xảy ra"),
        ("The reason", "why", "which", "for which", "she cried", "cô ấy khóc"),
        ("The restaurant", "where", "which", "at which", "we ate", "chúng tôi ăn"),
        ("The time", "when", "which", "at which", "she arrives", "cô ấy đến"),
        ("The hotel", "where", "which", "in which", "they stayed", "họ ở"),
        ("The summer", "when", "which", "in which", "we traveled", "chúng tôi du lịch"),
        ("The reason", "why", "which", "for which", "they failed", "họ trượt"),
        ("The library", "where", "which", "in which", "she reads", "cô ấy đọc"),
        ("The morning", "when", "which", "in which", "I wake up", "tôi dậy")
    ]
    noun, adv, pronoun, prep_pronoun, clause, trans = places[i]

    mc_stem = f"Hoàn thành câu: *\"{noun} ________ {clause} is very beautiful.\"*<br>(Dịch: {noun} nơi/lúc {trans} thì rất đẹp.)"
    mc_opts = {"A": adv, "B": pronoun, "C": "whose", "D": "who"}
    mc_correct = "A"

    cloze_stem = f"Điền trạng từ quan hệ phù hợp: *\"I don't know the reason ________ she is absent today.\"*<br>(Dịch: Tôi không biết lý do tại sao cô ấy vắng mặt hôm nay.)"
    cloze_opts = {"A": "why", "B": "where", "C": "when", "D": "which"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"This is the house where I bought last year.\"* ( bought cần tân ngữ )"
    ei_opts = {
        "A": "This is the house which I bought last year.",
        "B": "This is the house where I bought it last year.",
        "C": "This is the house where I bought last year.",
        "D": "This is the house in where I bought last year."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{noun} {prep_pronoun} {clause} is very beautiful.\"*"
    st_opts = {
        "A": f"{noun} {adv} {clause} is very beautiful.",
        "B": f"{noun} {pronoun} {clause} is very beautiful.",
        "C": f"{noun} that {clause} is very beautiful.",
        "D": f"{noun} where {prep_pronoun} {clause} is very beautiful."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn giới thiệu nhà hàng mà bạn và gia đình thường ăn tối vào cuối tuần. Bạn nói thế nào?"
    comm_opts = {
        "A": "This is the restaurant where we usually have dinner.",
        "B": "This is the restaurant which we usually have dinner.",
        "C": "This is the restaurant in where we usually have dinner.",
        "D": "This is the restaurant when we usually have dinner."
    }
    comm_correct = "A"

    rel_3_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {adv}**", "rule": f"Trạng từ quan hệ chỉ nơi chốn/thời gian/lý do: {adv} = giới từ + which.",
        "why": f"Chỗ trống thay thế cho trạng từ chỉ nơi chốn/thời gian/lý do của mệnh đề quan hệ.",
        "trap": f"Dùng {pronoun} mà thiếu giới từ cần thiết, hoặc nhầm lẫn giữa {adv} và {pronoun}.",
        "tip": f"Where/When/Why đứng trước mệnh đề hoàn chỉnh (đầy đủ chủ vị tân)!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sau 'bought' cần tân ngữ trực tiếp (bought the house) -> dùng đại từ quan hệ which, không dùng trạng từ where.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Mối quan hệ tương đương: {prep_pronoun} = {adv}.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "restaurant chỉ nơi chốn -> dùng where."
    })

PRACTICE_BANK["relative_3"] = generate_subtopic(rel_3_data)

# relative_4: Reduced Relative Clauses
rel_4_data = []
for i in range(15):
    reductions = [
        ("The man standing", "standing", "who is standing", "stands", "chủ động đứng"),
        ("The book written", "written", "which was written", "wrote", "bị động viết"),
        ("The girl playing", "playing", "who is playing", "plays", "chủ động chơi"),
        ("The car repaired", "repaired", "which was repaired", "repair", "bị động sửa"),
        ("The building constructed", "constructed", "which was constructed", "construct", "bị động xây dựng"),
        ("The boy running", "running", "who is running", "runs", "chủ động chạy"),
        ("The letter sent", "sent", "which was sent", "send", "bị động gửi"),
        ("The students studying", "studying", "who are studying", "study", "chủ động học"),
        ("The tree planted", "planted", "which was planted", "plant", "bị động trồng"),
        ("The woman talking", "talking", "who is talking", "talks", "chủ động nói"),
        ("The window broken", "broken", "which was broken", "broke", "bị động vỡ"),
        ("The kids swimming", "swimming", "who are swimming", "swim", "chủ động bơi"),
        ("The food served", "served", "which was served", "serve", "bị động phục vụ"),
        ("The bird singing", "singing", "who is singing", "sings", "chủ động hót"),
        ("The bridge built", "built", "which was built", "build", "bị động xây")
    ]
    noun, v_red, full_clause, v_wrong, voice = reductions[i]
    obj = "by my uncle" if "bị động" in voice else "near the window"
    trans = "đứng gần cửa sổ" if "chủ động" in voice else "được viết bởi chú tôi"

    mc_stem = f"Hoàn thành rút gọn mệnh đề quan hệ: *\"{noun} ________ {obj} is very famous.\"*<br>(Dịch: {noun} {trans} thì rất nổi tiếng.)"
    mc_opts = {"A": v_red, "B": v_wrong, "C": f"who {v_red}" if "bị động" in voice else f"which {v_red}", "D": f"is {v_red}"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"The girl (sit) ________ next to me is my classmate.\"*"
    cloze_opts = {"A": "sitting", "B": "sit", "C": "sate", "D": "to sit"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"The cars repairing at that garage belong to Nam.\"*"
    ei_opts = {
        "A": "The cars repaired at that garage belong to Nam.",
        "B": "The cars are repairing at that garage belong to Nam.",
        "C": "The cars which repaired at that garage belong to Nam.",
        "D": "The cars are repaired at that garage belong to Nam."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{noun} {full_clause} {obj} is very famous.\"*"
    st_opts = {
        "A": f"{noun} {v_red} {obj} is very famous.",
        "B": f"{noun} {v_wrong} {obj} is very famous.",
        "C": f"{noun} is {v_red} {obj} is very famous.",
        "D": f"{noun} that {v_red} {obj} is very famous."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn giới thiệu về bức tranh vẽ bởi học sinh lớp 9. Bạn nói thế nào gọn gàng nhất?"
    comm_opts = {
        "A": "This is the painting painted by Grade 9 students.",
        "B": "This is the painting painting by Grade 9 students.",
        "C": "This is the painting which painted by Grade 9 students.",
        "D": "This is the painting is painted by Grade 9 students."
    }
    comm_correct = "A"

    rel_4_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {v_red}**", "rule": "Rút gọn mệnh đề quan hệ: Dùng V-ing cho câu chủ động / Dùng V3/ed cho câu bị động.",
        "why": f"Hành động mang tính chất {voice} -> Rút gọn về {v_red}.",
        "trap": "Dùng V-ing cho câu bị động (ví dụ: 'The cars repairing...').",
        "tip": "Chủ động -> V-ing. Bị động -> V3/ed!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Xe hơi được sửa (bị động) -> rút gọn thành V3 'repaired', không dùng 'repairing'.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Mệnh đề quan hệ đầy đủ rút gọn lược bỏ đại từ và to be.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Bức tranh được vẽ -> dùng painted."
    })

PRACTICE_BANK["relative_4"] = generate_subtopic(rel_4_data)

# ==================== DATA GENERATION FOR GERUND & INFINITIVE ====================
# gerund_0, gerund_1, gerund_2
# gerund_0: Infinitives (To-V)
gerund_0_data = []
for i in range(15):
    verbs = ["decide", "agree", "plan", "want", "promise", "hope", "refuse", "offer", "choose", "expect", "fail", "manage", "demand", "deserve", "prepare"]
    v_act = verbs[i]
    trans = "quyết định" if v_act=="decide" else "đồng ý" if v_act=="agree" else "hứa" if v_act=="promise" else "muốn"

    mc_stem = f"Hoàn thành câu: *\"She {v_act}ed ________ English hard.\"*<br>(Dịch: Cô ấy đã {trans} học tiếng Anh chăm chỉ.)"
    mc_opts = {"A": "study", "B": "to study", "C": "studying", "D": "studied"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"We plan (go) ________ to the zoo this weekend.\"*"
    cloze_opts = {"A": "go", "B": "to go", "C": "going", "D": "went"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"He promised not telling anyone the secret.\"*"
    ei_opts = {
        "A": "He promised not to tell anyone the secret.",
        "B": "He promised to not tell anyone the secret.",
        "C": "He promised didn't tell anyone the secret.",
        "D": "He promised not tell anyone the secret."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"They intend to buy a new car next month.\"* (intend = plan)"
    st_opts = {
        "A": "They plan to buy a new car next month.",
        "B": "They plan buying a new car next month.",
        "C": "They plan buy a new car next month.",
        "D": "They plan for buying a new car next month."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn đồng ý giúp đỡ người khác. Bạn nói thế nào?"
    comm_opts = {
        "A": "I agree to help you with this project.",
        "B": "I agree helping you with this project.",
        "C": "I agree help you with this project.",
        "D": "I agree to helping you with this project."
    }
    comm_correct = "A"

    gerund_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": "**B: to study**", "rule": f"Động từ đi kèm To-V: {v_act} + to + V-inf.",
        "why": f"Động từ '{v_act}' yêu cầu động từ theo sau ở dạng nguyên thể có 'to'.",
        "trap": "Dùng V-ing hoặc động từ nguyên thể không to (V-bare).",
        "tip": f"Decide, agree, plan, want, promise + TO V!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Cấu trúc phủ định: S + verb + not + to V-inf.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Cấu trúc tương đương intend to V = plan to V.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Agree + to V."
    })

PRACTICE_BANK["gerund_0"] = generate_subtopic(gerund_0_data)

# gerund_1: Gerunds (V-ing)
gerund_1_data = []
for i in range(15):
    verbs = ["avoid", "mind", "enjoy", "suggest", "admit", "deny", "practice", "finish", "keep", "postpone", "recommend", "risk", "spend", "waste", "dislike"]
    v_act = verbs[i]
    trans = "tránh" if v_act=="avoid" else "phiền" if v_act=="mind" else "thích" if v_act=="enjoy" else "gợi ý"

    mc_stem = f"Hoàn thành câu: *\"She {v_act}s ________ fast food.\"*<br>(Dịch: Cô ấy {trans} ăn thức ăn nhanh.)"
    mc_opts = {"A": "eat", "B": "to eat", "C": "eating", "D": "eaten"}
    mc_correct = "C"

    cloze_stem = f"Điền từ phù hợp: *\"Would you mind (open) ________ the window?\"*"
    cloze_opts = {"A": "open", "B": "to open", "C": "opening", "D": "opened"}
    cloze_correct = "C"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"We suggest to go to the park this afternoon.\"*"
    ei_opts = {
        "A": "We suggest going to the park this afternoon.",
        "B": "We suggest go to the park this afternoon.",
        "C": "We suggest to going to the park this afternoon.",
        "D": "We suggest should going to the park this afternoon."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"He didn't want to tell the truth.\"* (deny = phủ nhận)"
    st_opts = {
        "A": "He denied telling the truth.",
        "B": "He denied to tell the truth.",
        "C": "He denied tell the truth.",
        "D": "He denied to telling the truth."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn từ chối lời đề nghị một cách lịch sự vì phiền việc hút thuốc. Câu nào đúng?"
    comm_opts = {
        "A": "I mind smoking here.",
        "B": "I mind to smoke here.",
        "C": "I mind smoke here.",
        "D": "I mind to smoking here."
    }
    comm_correct = "A"

    gerund_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": "**C: eating**", "rule": f"Động từ đi kèm V-ing: {v_act} + V-ing.",
        "why": f"Động từ '{v_act}' yêu cầu động từ theo sau ở dạng danh động từ (V-ing).",
        "trap": "Dùng động từ nguyên mẫu (to eat).",
        "tip": f"Avoid, mind, enjoy, suggest, admit, deny + V-ing!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Suggest + V-ing.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Deny + V-ing.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Mind + V-ing."
    })

PRACTICE_BANK["gerund_1"] = generate_subtopic(gerund_1_data)

# gerund_2: Time/Cost structures
gerund_2_data = []
for i in range(15):
    # It takes sb time to V vs S spend time V-ing
    times = [
        ("30 minutes", "to get", "getting"),
        ("2 hours", "to finish", "finishing"),
        ("3 days", "to read", "reading"),
        ("a week", "to paint", "painting"),
        ("a month", "to build", "building"),
        ("15 minutes", "to walk", "walking"),
        ("an hour", "to clean", "cleaning"),
        ("5 years", "to learn", "learning"),
        ("10 minutes", "to drive", "driving"),
        ("2 days", "to repair", "repairing"),
        ("3 hours", "to study", "studying"),
        ("a year", "to write", "writing"),
        ("20 minutes", "to cook", "cooking"),
        ("4 hours", "to hike", "hiking"),
        ("a decade", "to complete", "completing")
    ]
    time_str, to_v, v_ing = times[i]
    subj = "She" if i%2==0 else "He"
    pronoun_obj = "her" if subj=="She" else "him"

    mc_stem = f"Hoàn thành câu: *\"It takes {pronoun_obj} {time_str} ________ to school.\"*<br>(Dịch: Nó tiêu tốn của {pronoun_obj} {time_str} để đi học.)"
    mc_opts = {"A": "go", "B": "to go", "C": "going", "D": "went"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"{subj} spends {time_str} (study) ________ English every day.\"*"
    cloze_opts = {"A": "study", "B": "to study", "C": "studying", "D": "studied"}
    cloze_correct = "C"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"It took him 3 hours reading the book.\"*"
    ei_opts = {
        "A": "It took him 3 hours to read the book.",
        "B": "It took him 3 hours read the book.",
        "C": "He spent 3 hours to read the book.",
        "D": "It took he 3 hours to read the book."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"It takes {pronoun_obj} {time_str} {to_v} the homework.\"*"
    st_opts = {
        "A": f"{subj} spends {time_str} {v_ing} the homework.",
        "B": f"{subj} takes {time_str} {to_v} the homework.",
        "C": f"{subj} spends {time_str} {to_v} the homework.",
        "D": f"It spends {pronoun_obj} {time_str} {v_ing} the homework."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn trả lời về thời gian bạn đi từ nhà đến trường mất 15 phút. Câu nào đúng?"
    comm_opts = {
        "A": "It takes me 15 minutes to get to school.",
        "B": "I spend 15 minutes to get to school.",
        "C": "It spends me 15 minutes getting to school.",
        "D": "I take 15 minutes to get to school."
    }
    comm_correct = "A"

    gerund_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: to go**", "rule": "Cấu trúc thời gian: It takes/took + sb + time + to V-inf.",
        "why": "Chủ ngữ giả 'It' đi kèm cấu trúc 'takes sb time to do'.",
        "trap": "Dùng V-ing sau 'It takes sb time' hoặc dùng 'to V' sau 'spend time'.",
        "tip": "It takes sb time TO V; S spend time V-ING!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sau It took sb time + to V-inf.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Mối quan hệ tương đương: It takes sb time to V = S spends time V-ing.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng It takes me + time + to V."
    })

PRACTICE_BANK["gerund_2"] = generate_subtopic(gerund_2_data)

# ==================== DATA GENERATION FOR CONNECTORS ====================
# connectors_0, connectors_1, connectors_2
# connectors_0: Reason
conn_0_data = []
for i in range(15):
    reasons = [
        ("it rained heavily", "because", "the heavy rain", "because of"),
        ("she was sick", "because", "her sickness", "because of"),
        ("he studied hard", "because", "his hard work", "because of"),
        ("the noise was loud", "since", "the loud noise", "due to"),
        ("the traffic was bad", "since", "the bad traffic", "due to"),
        ("it was cold", "as", "the cold weather", "because of"),
        ("she arrived late", "because", "her late arrival", "because of"),
        ("he made a mistake", "because", "his mistake", "due to"),
        ("the team lost", "since", "their poor performance", "because of"),
        ("she succeeded", "as", "her effort", "thanks to"),
        ("the flight was canceled", "because", "the bad weather", "due to"),
        ("he got tired", "since", "the long walk", "because of"),
        ("she smiled", "as", "the good news", "because of"),
        ("we stayed inside", "because", "the storm", "because of"),
        ("the prices rose", "since", "the inflation", "due to")
    ]
    clause, conj_c, noun_phrase, conj_n = reasons[i]
    subj = "We stayed home" if i%2==0 else "He failed"
    trans_subj = "Chúng tôi ở nhà" if i%2==0 else "Anh ta đã trượt"

    mc_stem = f"Hoàn thành câu: *\"{subj} ________ {clause}.\"*<br>(Dịch: {trans_subj} vì {clause}.)"
    mc_opts = {"A": conj_c, "B": conj_n, "C": "though", "D": "despite"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"{subj} ________ {noun_phrase}.\"*<br>(Dịch: {trans_subj} vì {noun_phrase}.)"
    cloze_opts = {"A": conj_c, "B": conj_n, "C": "although", "D": "in spite of"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"She went to bed early because of she was tired.\"*"
    ei_opts = {
        "A": "She went to bed early because she was tired.",
        "B": "She went to bed early because of her tiredness.",
        "C": "Cả A và B đều đúng.",
        "D": "She went to bed early because of tired."
    }
    ei_correct = "C"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj} {conj_c} {clause}.\"*"
    st_opts = {
        "A": f"{subj} {conj_n} {noun_phrase}.",
        "B": f"{subj} {conj_c} {noun_phrase}.",
        "C": f"{subj} in spite of {clause}.",
        "D": f"{subj} despite {noun_phrase}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn giải thích lý do bạn không tham gia bữa tiệc hôm qua là do cơn mưa to. Câu nào đúng?"
    comm_opts = {
        "A": "I didn't go to the party because of the heavy rain.",
        "B": "I didn't go to the party because the heavy rain.",
        "C": "I didn't go to the party due to it rained heavily.",
        "D": "I didn't go to the party because of it rained heavily."
    }
    comm_correct = "A"

    conn_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {conj_c}**", "rule": "Từ chỉ lý do: Because/Since/As + Clause (Mệnh đề) / Because of/Due to + Noun/V-ing.",
        "why": f"'{clause}' là một mệnh đề hoàn chỉnh (có S+V) -> cần liên từ '{conj_c}'.",
        "trap": f"Dùng '{conj_n}' (cần đi với danh từ) đứng trước một mệnh đề.",
        "tip": "Because + Clause. Because of + Danh từ/V-ing!",
        "verdict_ei": f"**C** là câu đúng.",
        "why_ei": "Cả A (dùng because + mệnh đề) và B (dùng because of + cụm danh từ) đều sửa đúng.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển từ mệnh đề nguyên nhân sang cụm danh từ tương đương.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "rain là danh từ -> dùng because of."
    })

PRACTICE_BANK["connectors_0"] = generate_subtopic(conn_0_data)

# connectors_1: Concession
conn_1_data = []
for i in range(15):
    concessions = [
        ("it rained heavily", "although", "the heavy rain", "despite"),
        ("she was tired", "although", "her tiredness", "in spite of"),
        ("he is poor", "even though", "his poverty", "despite"),
        ("the noise was loud", "although", "the loud noise", "in spite of"),
        ("she studied hard", "although", "her hard study", "despite"),
        ("they were busy", "even though", "their busyness", "in spite of"),
        ("he ran fast", "although", "his speed", "despite"),
        ("she had a headache", "although", "her headache", "despite"),
        ("it was freezing", "even though", "the freezing weather", "in spite of"),
        ("he is old", "although", "his old age", "despite"),
        ("the test was hard", "although", "the hard test", "in spite of"),
        ("she was ill", "even though", "her illness", "despite"),
        ("prices were high", "although", "the high prices", "despite"),
        ("traffic was bad", "although", "the bad traffic", "in spite of"),
        ("he is young", "even though", "his youth", "despite")
    ]
    clause, conj_c, noun_phrase, conj_n = concessions[i]
    subj = "We went out" if i%2==0 else "He failed"
    trans_subj = "Chúng tôi vẫn đi chơi" if i%2==0 else "Anh ta vẫn trượt"

    mc_stem = f"Hoàn thành câu: *\"{subj} ________ {clause}.\"*<br>(Dịch: {trans_subj} mặc dù {clause}.)"
    mc_opts = {"A": conj_c, "B": conj_n, "C": "because", "D": "due to"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"{subj} ________ {noun_phrase}.\"*<br>(Dịch: {trans_subj} mặc dù {noun_phrase}.)"
    cloze_opts = {"A": conj_c, "B": conj_n, "C": "since", "D": "thanks to"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"Although she was sick, but she went to school.\"*"
    ei_opts = {
        "A": "Although she was sick, she went to school.",
        "B": "She was sick, but she went to school.",
        "C": "Cả A và B đều đúng.",
        "D": "Although she was sick, but she went to school."
    }
    ei_correct = "C"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj} {conj_c} {clause}.\"*"
    st_opts = {
        "A": f"{subj} {conj_n} {noun_phrase}.",
        "B": f"{subj} {conj_c} {noun_phrase}.",
        "C": f"{subj} because of {clause}.",
        "D": f"{subj} despite of {noun_phrase}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn khen ngợi một cầu thủ: *\"Mặc dù bị chấn thương, anh ta vẫn ghi bàn.\"* Bạn nói thế nào?"
    comm_opts = {
        "A": "Despite his injury, he scored a goal.",
        "B": "Although his injury, he scored a goal.",
        "C": "Despite of his injury, he scored a goal.",
        "D": "In spite his injury, he scored a goal."
    }
    comm_correct = "A"

    conn_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {conj_c}**", "rule": "Từ chỉ sự tương phản/nhượng bộ: Although/Even though + Clause (Mệnh đề) / Despite/In spite of + Noun/V-ing.",
        "why": f"'{clause}' là một mệnh đề hoàn chỉnh (có S+V) -> cần liên từ '{conj_c}'.",
        "trap": "Dùng 'but' đi kèm với 'although' trong cùng một câu.",
        "tip": "Đã có Although thì KHÔNG có BUT, đã có BUT thì KHÔNG có Although!",
        "verdict_ei": f"**C** là câu đúng.",
        "why_ei": "Sửa lỗi dùng cả Although và but bằng cách lược bỏ một trong hai.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển từ mặc dù + mệnh đề sang mặc dù + cụm danh từ.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "injury là danh từ -> dùng despite."
    })

PRACTICE_BANK["connectors_1"] = generate_subtopic(conn_1_data)

# connectors_2: Result (So/Such...that, so/but)
conn_2_data = []
for i in range(15):
    results = [
        ("hot", "a hot day", "stayed inside", "nóng"),
        ("cold", "a cold night", "turned on the heater", "lạnh"),
        ("difficult", "a difficult test", "couldn't finish", "khó"),
        ("expensive", "an expensive car", "didn't buy it", "đắt"),
        ("tired", "a tired worker", "went to sleep", "mệt"),
        ("noisy", "a noisy party", "left early", "ồn ào"),
        ("heavy", "a heavy box", "couldn't lift it", "nặng"),
        ("good", "a good movie", "watched it twice", "hay"),
        ("interesting", "an interesting book", "read it all night", "thú vị"),
        ("fast", "a fast runner", "won the race easily", "nhanh"),
        ("beautiful", "a beautiful watch", "bought it immediately", "đẹp"),
        ("dark", "a dark room", "couldn't see anything", "tối"),
        ("hungry", "a hungry boy", "ate three sandwiches", "đói"),
        ("easy", "an easy question", "answered in 3 seconds", "dễ"),
        ("sweet", "a sweet apple", "enjoyed eating it", "ngọt")
    ]
    adj, noun_phrase, action, trans = results[i]
    subj = "It" if i%3==0 else "The test" if i%3==1 else "She"

    mc_stem = f"Hoàn thành câu: *\"The weather was so ________ that we {action}.\"*<br>(Dịch: Thời tiết thì quá {trans} đến mức chúng tôi {action}.)"
    mc_opts = {"A": adj, "B": f"such {adj}", "C": "too", "D": "enough"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"It was ________ {noun_phrase} that we {action}.\"*"
    cloze_opts = {"A": "so", "B": "such", "C": "too", "D": "as"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"The cake was such sweet that I couldn't eat it.\"*"
    ei_opts = {
        "A": "The cake was so sweet that I couldn't eat it.",
        "B": "It was such a sweet cake that I couldn't eat it.",
        "C": "Cả A và B đều đúng.",
        "D": "The cake was too sweet that I couldn't eat it."
    }
    ei_correct = "C"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"The box was so heavy that I couldn't lift it.\"*"
    st_opts = {
        "A": "It was such a heavy box that I couldn't lift it.",
        "B": "The box was too heavy for me to lift.",
        "C": "Cả A và B đều đúng.",
        "D": "It was so heavy box that I couldn't lift it."
    }
    st_correct = "C"

    comm_stem = f"**Tình huống:** Bạn than phiền về một chiếc máy tính quá cũ đến nỗi không chạy được phần mềm mới. Câu nào đúng?"
    comm_opts = {
        "A": "This computer is so old that it can't run new software.",
        "B": "This computer is such old that it can't run new software.",
        "C": "This computer is too old that it can't run new software.",
        "D": "It is so old computer that it can't run new software."
    }
    comm_correct = "A"

    conn_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {adj}**", "rule": "Cấu trúc kết quả: S + be + SO + Adj + THAT + clause / It + be + SUCH + a/an + Adj + N + THAT + clause.",
        "why": "Đứng giữa 'so...that' là một tính từ.",
        "trap": "Dùng 'such' đi kèm trực tiếp với tính từ không có danh từ phía sau.",
        "tip": "So + Tính từ; Such + Cụm danh từ!",
        "verdict_ei": f"**C** là câu đúng.",
        "why_ei": "Có thể sửa bằng cách chuyển sang cấu trúc 'so + adj' hoặc 'such + cụm danh từ'.",
        "verdict_st": f"**C** là câu trả lời đúng vì cả so...that, such...that, và too...to đều đồng nghĩa.",
        "why_st": "Ba cấu trúc chỉ kết quả có thể biến đổi qua lại tương thích.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Dùng so old that."
    })

PRACTICE_BANK["connectors_2"] = generate_subtopic(conn_2_data)

# ==================== DATA GENERATION FOR REPORTED SPEECH ====================
# reported_speech_0, reported_speech_1, reported_speech_2
# reported_speech_0: Tense & Adverb shift
rep_0_data = []
for i in range(15):
    shifts = [
        ("I am happy", "she was happy", "was", "is", "said"),
        ("I will go", "he would go", "would", "will", "said"),
        ("I have finished", "she had finished", "had finished", "finished", "said"),
        ("I went out", "he had gone out", "had gone", "went", "said"),
        ("I can swim", "she could swim", "could", "can", "said"),
        ("I live here", "he lived there", "lived", "lives", "told me"),
        ("I bought this", "she had bought that", "had bought", "bought", "said"),
        ("I will call you tomorrow", "he would call me the next day", "would call", "will call", "said"),
        ("I am writing now", "she was writing then", "was writing", "is writing", "said"),
        ("I have eaten", "he had eaten", "had eaten", "has eaten", "said"),
        ("I am tired today", "she was tired that day", "was", "is", "said"),
        ("I went home last night", "he had gone home the previous night", "had gone", "went", "said"),
        ("I can help you", "she could help me", "could", "can", "said"),
        ("I will see you next week", "he would see me the following week", "would see", "will see", "said"),
        ("I like it", "she liked it", "liked", "likes", "said")
    ]
    direct, indirect, v_ind, v_dir, verb_say = shifts[i]
    subj = "Lan" if i%2==0 else "Nam"
    pron = "she" if subj=="Lan" else "he"

    mc_stem = f"Hoàn thành câu gián tiếp: *\"{subj} {verb_say} that {indirect.replace(v_ind, '________')}.\"*<br>(Dịch: {subj} nói rằng {pron} {indirect.split()[-1]}.)"
    mc_opts = {"A": v_dir, "B": v_ind, "C": f"has {v_dir.split()[-1]}" if "will" not in v_dir else "will", "D": "would have"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"{subj} said, 'I am learning English now.'\"* -> *\"{subj} said that {pron} was learning English ________.\"*"
    cloze_opts = {"A": "now", "B": "then", "C": "at the moment", "D": "yesterday"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"He told to me that he was tired.\"*"
    ei_opts = {
        "A": "He told me that he was tired.",
        "B": "He said me that he was tired.",
        "C": "He said to me that he was tired.",
        "D": "Cả A và C đều đúng."
    }
    ei_correct = "C"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{subj} said, '{direct}.'\"*"
    st_opts = {
        "A": f"{subj} {verb_say} that {indirect}.",
        "B": f"{subj} {verb_say} that {direct}.",
        "C": f"{subj} {verb_say} {indirect}.",
        "D": f"{subj} {verb_say} that {pron} {v_dir}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn kể lại lời của bố nói hôm qua: *\"Bố nói: 'Bố sẽ đi công tác vào tuần sau.'\"* Bạn nói thế nào?"
    comm_opts = {
        "A": "My father said that he would go on a business trip the following week.",
        "B": "My father said that he will go on a business trip next week.",
        "C": "My father told me that he would go on a business trip next week.",
        "D": "My father said me that he would go on a business trip next week."
    }
    comm_correct = "A"

    rep_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {v_ind}**", "rule": "Quy tắc lùi thì: Hiện tại -> Quá khứ, Quá khứ -> Quá khứ hoàn thành, Will -> Would, Can -> Could.",
        "why": "Khi động từ giới thiệu ở quá khứ (said/told), động từ trong câu gián tiếp phải lùi 1 thì.",
        "trap": "Giữ nguyên thì hiện tại hoặc trạng từ chỉ thời gian không thay đổi.",
        "tip": "Said/Told -> Bắt buộc lùi một thì và đổi trạng từ thời gian/nơi chốn!",
        "verdict_ei": f"**C** là câu đúng.",
        "why_ei": "Told đi trực tiếp với tân ngữ (told me), còn said đi với giới từ to (said to me).",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển câu trực tiếp sang câu gián tiếp áp dụng lùi thì.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Lùi will thành would và đổi next week thành the following week."
    })

PRACTICE_BANK["reported_speech_0"] = generate_subtopic(rep_0_data)

# reported_speech_1: Reported Questions
rep_1_data = []
for i in range(15):
    questions = [
        ("Where do you live?", "where I lived", "lived", "did I live"),
        ("Do you like tea?", "if I liked tea", "liked", "did I like"),
        ("What are you doing?", "what I was doing", "was doing", "was I doing"),
        ("Have you finished?", "if I had finished", "had finished", "had I finished"),
        ("Will you come?", "if I would come", "would come", "would I come"),
        ("Why did you cry?", "why I had cried", "had cried", "did I cry"),
        ("Can you help me?", "if I could help her", "could help", "could I help"),
        ("Where did they go?", "where they had gone", "had gone", "did they go"),
        ("Are you busy?", "if I was busy", "was", "was I"),
        ("What time is it?", "what time it was", "was", "was it"),
        ("Do you know Nam?", "if I knew Nam", "knew", "did I know"),
        ("How are you?", "how I was", "was", "was I"),
        ("Where is my key?", "where her key was", "was", "was her key"),
        ("Have you eaten?", "if I had eaten", "had eaten", "did I eat"),
        ("Will it rain?", "if it would rain", "would rain", "would it rain")
    ]
    direct, indirect, correct_v, wrong_v = questions[i]
    subj = "He" if i%2==0 else "She"

    mc_stem = f"Hoàn thành câu hỏi gián tiếp: *\"{subj} asked me {indirect.replace(correct_v, '________')}.\"*<br>(Dịch: {subj} hỏi tôi {direct.replace('you', 'tôi').replace('?', '')}.)"
    mc_opts = {"A": correct_v, "B": wrong_v, "C": correct_v.replace("had", "have") if "had" in correct_v else "is", "D": "did I"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"She asked me ________ I liked pop music.\"*<br>(Dịch: Cô ấy hỏi tôi có thích nhạc trẻ không.)"
    cloze_opts = {"A": "if", "B": "whether", "C": "that", "D": "Cả A và B đều đúng."}
    cloze_correct = "D"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"He asked me where did I live.\"*"
    ei_opts = {
        "A": "He asked me where I lived.",
        "B": "He asked me where did I lived.",
        "C": "He asked me where I did live.",
        "D": "He asked me where had I lived."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{subj} asked me, '{direct}'\"*"
    st_opts = {
        "A": f"{subj} asked me {indirect}.",
        "B": f"{subj} asked me {direct}.",
        "C": f"{subj} asked me that {indirect}.",
        "D": f"{subj} asked me if {indirect}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Người cảnh sát hỏi bạn: *\"Where is your passport?\"* Bạn kể lại câu hỏi đó. Câu nào đúng?"
    comm_opts = {
        "A": "The police officer asked me where my passport was.",
        "B": "The police officer asked me where was my passport.",
        "C": "The police officer asked me if where my passport was.",
        "D": "The police officer asked me that where my passport was."
    }
    comm_correct = "A"

    rep_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {correct_v}**", "rule": "Câu hỏi gián tiếp: S + asked (+ O) + Wh-word/If/Whether + S + V (không đảo ngữ, lùi thì).",
        "why": "Trong câu hỏi gián tiếp, động từ đi sau chủ ngữ và không được đảo trợ động từ lên trước.",
        "trap": "Giữ nguyên cấu trúc đảo trợ động từ của câu hỏi trực tiếp (ví dụ: 'asked me where did I live').",
        "tip": "Câu hỏi gián tiếp -> Đưa về trật tự câu kể: CHỦ NGỮ + ĐỘNG TỪ lùi thì!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Loại bỏ trợ động từ 'did' và đưa động từ live về quá khứ 'lived' sau chủ ngữ I.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển câu hỏi có từ để hỏi sang gián tiếp.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Đưa động từ 'was' về cuối câu sau cụm chủ ngữ 'my passport'."
    })

PRACTICE_BANK["reported_speech_1"] = generate_subtopic(rep_1_data)

# reported_speech_2: Reported Commands/Requests
rep_2_data = []
for i in range(15):
    commands = [
        ("Please close the door", "told me to close the door", "to close", "close"),
        ("Don't touch this", "told me not to touch that", "not to touch", "to not touch"),
        ("Listen carefully", "asked us to listen carefully", "to listen", "listen"),
        ("Don't shout", "told them not to shout", "not to shout", "not shout"),
        ("Please sit down", "asked him to sit down", "to sit", "sit"),
        ("Don't leave", "told her not to leave", "not to leave", "to not leave"),
        ("Wait for me", "told me to wait for him", "to wait", "wait"),
        ("Don't worry", "told us not to worry", "not to worry", "to not worry"),
        ("Please speak louder", "asked the student to speak louder", "to speak", "speak"),
        ("Don't run", "told the kids not to run", "not to run", "not run"),
        ("Be quiet", "told me to be quiet", "to be", "be"),
        ("Don't eat this", "told him not to eat that", "not to eat", "to not eat"),
        ("Help me", "asked her to help him", "to help", "help"),
        ("Don't smoke here", "told them not to smoke there", "not to smoke", "to not smoke"),
        ("Read this book", "told me to read that book", "to read", "read")
    ]
    direct, indirect, correct_v, wrong_v = commands[i]
    subj = "The teacher" if i%2==0 else "My father"

    mc_stem = f"Hoàn thành câu mệnh lệnh gián tiếp: *\"{subj} ________ me {indirect.split('me ')[-1].replace(correct_v, '________')}.\"*<br>(Dịch: {subj} yêu cầu tôi {direct.replace('Please ', '').lower()}.)"
    mc_opts = {"A": wrong_v, "B": correct_v, "C": f"didn't {wrong_v}", "D": f"to {wrong_v}"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"The doctor told him (not smoke) ________ anymore.\"*<br>(Dịch: Bác sĩ bảo anh ta không hút thuốc nữa.)"
    cloze_opts = {"A": "not to smoke", "B": "to not smoke", "C": "not smoke", "D": "didn't smoke"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"He asked me to not open the window.\"*"
    ei_opts = {
        "A": "He asked me not to open the window.",
        "B": "He asked me to don't open the window.",
        "C": "He asked me don't open the window.",
        "D": "He asked me not open the window."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{subj} said, '{direct}'\"*"
    st_opts = {
        "A": f"{subj} {indirect}.",
        "B": f"{subj} said that {indirect}.",
        "C": f"{subj} told to me {correct_v} {direct.split()[-1]}.",
        "D": f"{subj} told me {wrong_v} {direct.split()[-1]}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Mẹ bảo bạn: *\"Đừng nghịch điện thoại trong giờ học.\"* Bạn kể lại lời khuyên đó. Câu nào đúng?"
    comm_opts = {
        "A": "My mother told me not to play on my phone during class.",
        "B": "My mother told me to not play on my phone during class.",
        "C": "My mother told me don't play on my phone during class.",
        "D": "My mother said me not to play on my phone during class."
    }
    comm_correct = "A"

    rep_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {correct_v}**", "rule": "Mệnh lệnh gián tiếp: S + told/asked + O + to V-inf / not + to V-inf.",
        "why": "Câu mệnh lệnh khẳng định dùng 'to V', câu mệnh lệnh phủ định dùng 'not to V'.",
        "trap": "Đặt 'not' sai vị trí (ví dụ: 'to not V') hoặc giữ nguyên từ 'don't' của câu trực tiếp.",
        "tip": "Nhớ kỹ trật tự: NOT TO V, cấm viết to not V!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Sửa 'to not' thành 'not to' để tạo cấu trúc phủ định chuẩn.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển từ câu trực tiếp mệnh lệnh sang câu gián tiếp dạng requested/command.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Told me + not to V."
    })

PRACTICE_BANK["reported_speech_2"] = generate_subtopic(rep_2_data)

# ==================== DATA GENERATION FOR WORD FORM ====================
# word_form_0, word_form_1, word_form_2
# word_form_0: Word Position
wf_0_data = []
for i in range(15):
    words = [
        ("speak", "fluent", "fluently", "adv", "nói lưu loát"),
        ("look", "beautiful", "beautifully", "adj", "trông đẹp"),
        ("study", "serious", "seriously", "adv", "học nghiêm túc"),
        ("taste", "delicious", "deliciously", "adj", "vị ngon"),
        ("run", "quick", "quickly", "adv", "chạy nhanh"),
        ("sound", "interesting", "interestingly", "adj", "nghe thú vị"),
        ("drive", "careful", "carefully", "adv", "lái xe cẩn thận"),
        ("feel", "happy", "happily", "adj", "cảm thấy hạnh phúc"),
        ("shout", "angry", "angrily", "adv", "hét lên giận dữ"),
        ("smell", "good", "well", "adj", "mùi thơm"),
        ("write", "clear", "clearly", "adv", "viết rõ ràng"),
        ("seem", "tired", "tiredly", "adj", "vẻ mặt mệt mỏi"),
        ("sing", "beautiful", "beautifully", "adv", "hát hay"),
        ("become", "famous", "famously", "adj", "trở nên nổi tiếng"),
        ("walk", "slow", "slowly", "adv", "đi chậm")
    ]
    verb, adj_f, adv_f, target_pos, trans = words[i]
    correct_form = adv_f if target_pos == "adv" else adj_f
    wrong_form = adj_f if target_pos == "adv" else adv_f
    subj = "She" if i%2==0 else "He"

    mc_stem = f"Hoàn thành câu: *\"{subj} {verb}s ________.\"*<br>(Dịch: {subj} {trans}.)"
    mc_opts = {"A": adj_f, "B": adv_f, "C": f"more {adj_f}", "D": f"most {adv_f}"}
    mc_correct = "B" if target_pos == "adv" else "A"

    cloze_stem = f"Điền dạng đúng của từ: *\"The soup tastes (delicious) ________.\"*<br>(Dịch: Món súp này vị rất ngon.)"
    cloze_opts = {"A": "delicious", "B": "deliciously", "C": "deliciousness", "D": "more delicious"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"He drove careful through the heavy rain.\"*"
    ei_opts = {
        "A": "He drove carefully through the heavy rain.",
        "B": "He drove carefulness through the heavy rain.",
        "C": "He drove more careful through the heavy rain.",
        "D": "He was drove carefully through the heavy rain."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa:<br>*\"{subj} is a {adj_f} speaker.\"*"
    st_opts = {
        "A": f"{subj} speaks {adv_f}.",
        "B": f"{subj} speaks {adj_f}.",
        "C": f"{subj} speaks very {adj_f}.",
        "D": f"{subj} is speaking {adv_f}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn khuyên tài xế lái xe cẩn thận hơn. Bạn nói thế nào?"
    comm_opts = {
        "A": "Please drive carefully.",
        "B": "Please drive careful.",
        "C": "Please drive carefulness.",
        "D": "Please drive more careful."
    }
    comm_correct = "A"

    wf_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**{mc_correct}: {correct_form}**", 
        "rule": "Quy tắc vị trí từ loại: Động từ thường + Trạng từ (Adv) / Động từ liên kết (Linking verb: look, taste, feel, seem...) + Tính từ (Adj).",
        "why": f"'{verb}' là động từ { 'thường' if target_pos == 'adv' else 'liên kết' } nên cần đi kèm { 'trạng từ' if target_pos == 'adv' else 'tính từ' } '{correct_form}'.",
        "trap": f"Dùng sai trạng từ cho linking verb hoặc ngược lại.",
        "tip": f"Động từ thường -> Adv (-ly). Linking verb (feel, look, sound, taste, smell, seem) -> Adj!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Drove là động từ thường -> cần trạng từ carefully.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển đổi từ cụm Danh từ (adj + N) sang động từ và trạng từ.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Drive là động từ thường -> dùng carefully."
    })

PRACTICE_BANK["word_form_0"] = generate_subtopic(wf_0_data)

# word_form_1: Participle Adjectives -ed vs -ing
wf_1_data = []
for i in range(15):
    adjs = [
        ("boring", "bored", "the movie", "he", "buồn chán"),
        ("exciting", "excited", "the match", "she", "hào hứng"),
        ("interesting", "interested", "the book", "I", "thú vị"),
        ("disappointing", "disappointed", "the result", "they", "thất vọng"),
        ("tiring", "tired", "the long walk", "we", "mệt mỏi"),
        ("frightening", "frightened", "the ghost story", "the kids", "sợ hãi"),
        ("surprising", "surprised", "the news", "he", "ngạc nhiên"),
        ("worrying", "worried", "the situation", "she", "lo lắng"),
        ("confusing", "confused", "the explanation", "the students", "bối rối"),
        ("exhausting", "exhausted", "the work", "I", "kiệt sức"),
        ("amazing", "amazed", "the show", "they", "kinh ngạc"),
        ("shocking", "shocked", "the accident", "we", "sốc"),
        ("annoying", "annoyed", "the behavior", "she", "bực mình"),
        ("depressing", "depressed", "the weather", "he", "u sầu"),
        ("fascinating", "fascinated", "the museum", "I", "cuốn hút")
    ]
    adj_ing, adj_ed, object_noun, subject_person, trans = adjs[i]
    was_were = "was" if subject_person in ["he", "she", "I"] else "were"

    mc_stem = f"Hoàn thành câu: *\"{subject_person.capitalize()} {was_were} ________ in {object_noun}.\"*<br>(Dịch: {subject_person.capitalize()} cảm thấy {trans} về {object_noun}.)"
    mc_opts = {"A": adj_ing, "B": adj_ed, "C": adj_ing + "ly", "D": "interest" if "interest" in adj_ing else "bore"}
    mc_correct = "B"

    cloze_stem = f"Điền từ phù hợp: *\"The book was very (interest) ________.\"*<br>(Dịch: Cuốn sách rất hay/thú vị.)"
    cloze_opts = {"A": "interest", "B": "interesting", "C": "interested", "D": "interestingly"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"I was very boring during the long lecture.\"*"
    ei_opts = {
        "A": "I was very bored during the long lecture.",
        "B": "I was very boring during the long lecture.",
        "C": "I was bored very during the long lecture.",
        "D": "The lecture was very bored."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{object_noun.capitalize()} was {adj_ing}.\"*<br>(Dịch: {object_noun.capitalize()} thì gây {trans}.)"
    st_opts = {
        "A": f"{subject_person.capitalize()} {was_were} {adj_ed} in {object_noun}.",
        "B": f"{subject_person.capitalize()} {was_were} {adj_ing} in {object_noun}.",
        "C": f"{object_noun.capitalize()} was {adj_ed}.",
        "D": f"{subject_person.capitalize()} felt {adj_ing} about {object_noun}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn vừa xem xong một trận bóng đá kịch tính và muốn chia sẻ cảm xúc hào hứng của mình. Câu nào đúng?"
    comm_opts = {
        "A": "I am so excited about the match!",
        "B": "I am so exciting about the match!",
        "C": "The match was so excited!",
        "D": "I feel so exciting!"
    }
    comm_correct = "A"

    wf_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**B: {adj_ed}**", "rule": "Tính từ đuôi -ed và -ing: Adj-ed diễn tả cảm xúc của người / Adj-ing diễn tả tính chất của vật/sự việc gây ra cảm xúc đó.",
        "why": f"'{subject_person}' là người cảm thụ cảm xúc -> dùng tính từ đuôi -ed ({adj_ed}).",
        "trap": f"Dùng tính từ đuôi -ing để chỉ cảm xúc của con người (ví dụ: 'I am exciting').",
        "tip": "Người nhận cảm xúc -> dùng -ed. Vật/Sự việc gây cảm xúc -> dùng -ing!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Người cảm thấy buồn chán -> dùng bored, không dùng boring.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển từ tính chất sự việc ({adj_ing}) sang cảm xúc của người ({adj_ed}).",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Người hào hứng -> excited."
    })

# We will write wf_1 to word_form_1 inside PRACTICE_BANK
PRACTICE_BANK["word_form_1"] = generate_subtopic(wf_1_data)

# word_form_2: Preposition Collocations
wf_2_data = []
for i in range(15):
    preps = [
        ("keen", "on", "in", "playing soccer", "thích chơi bóng"),
        ("interested", "in", "on", "reading books", "quan tâm đọc sách"),
        ("fond", "of", "with", "listening to music", "thích nghe nhạc"),
        ("depend", "on", "at", "the weather", "phụ thuộc thời tiết"),
        ("disappointed", "with", "of", "the exam result", "thất vọng với kết quả"),
        ("good", "at", "in", "drawing", "giỏi vẽ"),
        ("afraid", "of", "from", "spiders", "sợ nhện"),
        ("famous", "for", "with", "its beautiful beaches", "nổi tiếng về bãi biển"),
        ("different", "from", "with", "mine", "khác biệt so với của tôi"),
        ("proud", "of", "about", "her son", "tự hào về con trai"),
        ("worried", "about", "with", "the test", "lo lắng về bài kiểm tra"),
        ("tired", "of", "with", "doing homework", "mệt mỏi/chán làm bài"),
        ("good", "for", "at", "your health", "tốt cho sức khỏe"),
        ("busy", "with", "at", "his work", "bận rộn với công việc"),
        ("similar", "to", "with", "this one", "tương tự cái này")
    ]
    adj_v, correct_prep, wrong_prep, complement, trans = preps[i]
    is_verb = adj_v in ["depend"]
    copula = "is" if not is_verb else ""
    subj = "She" if i%2==0 else "He"

    mc_stem = f"Hoàn thành câu: *\"{subj} {copula} {adj_v} ________ {complement}.\"*<br>(Dịch: {subj} {trans}.)"
    mc_opts = {"A": correct_prep, "B": wrong_prep, "C": "about" if correct_prep!="about" else "for", "D": "with" if correct_prep!="with" else "to"}
    mc_correct = "A"

    cloze_stem = f"Điền giới từ phù hợp: *\"He is very good ________ learning languages.\"*<br>(Dịch: Anh ta giỏi học ngoại ngữ.)"
    cloze_opts = {"A": "at", "B": "in", "C": "on", "D": "for"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"She is interested on watching romantic films.\"*"
    ei_opts = {
        "A": "She is interested in watching romantic films.",
        "B": "She is interested with watching romantic films.",
        "C": "She is interesting in watching romantic films.",
        "D": "She is interest in watching romantic films."
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj} likes {complement.replace('ing', '') if complement.endswith('ing') else complement}.\"*<br>(Dịch: {subj} thích {complement}.)"
    st_opts = {
        "A": f"{subj} {copula} {adj_v} {correct_prep} {complement}.",
        "B": f"{subj} {copula} {adj_v} {wrong_prep} {complement}.",
        "C": f"{subj} likes {adj_v} {correct_prep} {complement}.",
        "D": f"{subj} enjoys {adj_v} {complement}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn tự hào khoe rằng bố mẹ bạn rất tự hào về bạn. Bạn nói thế nào?"
    comm_opts = {
        "A": "My parents are proud of me.",
        "B": "My parents are proud about me.",
        "C": "My parents are proud with me.",
        "D": "My parents are proud for me."
    }
    comm_correct = "A"

    wf_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {correct_prep}**", "rule": f"Giới từ đi kèm từ vựng: {adj_v} + {correct_prep}.",
        "why": f"Giới từ cố định đi sau '{adj_v}' bắt buộc là '{correct_prep}'.",
        "trap": f"Dịch thô từ tiếng Việt sang dùng giới từ sai (ví dụ: 'thích cái gì' dịch thành 'interested on' hoặc 'proud about').",
        "tip": f"Học thuộc lòng: keen ON, interested IN, fond OF, disappointed WITH, proud OF, good AT!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Interested luôn đi với giới từ in.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": f"Chuyển đổi động từ chỉ sở thích like sang cấu trúc giới từ tương đương.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Proud + of."
    })

PRACTICE_BANK["word_form_2"] = generate_subtopic(wf_2_data)

# ==================== DATA GENERATION FOR PHRASAL VERB & QUESTION TAG ====================
# phrasal_verb_0, phrasal_verb_1, phrasal_verb_2
# phrasal_verb_0: Common Phrasal Verbs
pv_0_data = []
for i in range(15):
    pvs = [
        ("look after", "take care of", "after", "chăm sóc"),
        ("give up", "stop", "up", "từ bỏ"),
        ("get over", "recover from", "over", "vượt qua cú sốc"),
        ("look into", "investigate", "into", "điều tra"),
        ("put up with", "tolerate", "up with", "chịu đựng"),
        ("carry out", "perform/conduct", "out", "tiến hành khảo sát"),
        ("turn on", "activate", "on", "bật đèn"),
        ("turn off", "deactivate", "off", "tắt tivi"),
        ("go off", "ring/explode", "off", "chuông reo"),
        ("run out of", "have no more", "out of", "hết tiền/xăng"),
        ("look for", "search for", "for", "tìm kiếm"),
        ("put off", "postpone", "off", "hoãn lại"),
        ("call off", "cancel", "off", "hủy bỏ"),
        ("take off", "depart", "off", "máy bay cất cánh"),
        ("grow up", "become an adult", "up", "lớn lên")
    ]
    pv_name, pv_mean, prep, trans = pvs[i]
    verb_root = pv_name.split()[0]
    subj = "My mother" if i%2==0 else "He"
    item = "her baby" if i%3==0 else "smoking" if i%3==1 else "the project"

    mc_stem = f"Hoàn thành câu: *\"{subj} will {verb_root} ________ {item}.\"*<br>(Dịch: {subj} sẽ {trans} {item}.)"
    mc_opts = {"A": prep, "B": "at" if prep!="at" else "in", "C": "down" if prep!="down" else "to", "D": "away"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"We have run ________ of milk. Can you buy some?\"*<br>(Dịch: Chúng tôi đã hết sữa.)"
    cloze_opts = {"A": "out", "B": "out of", "C": "away", "D": "off"}
    cloze_correct = "B"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"It took him 1 year to recover of the shock.\"*"
    ei_opts = {
        "A": "It took him 1 year to get over the shock.",
        "B": "It took him 1 year to recover from the shock.",
        "C": "Cả A và B đều đúng.",
        "D": "It took him 1 year to recover of the shock."
    }
    ei_correct = "C"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"{subj} must {pv_name} {item}.\"*<br>(Dịch: {subj} phải {trans} {item}.)"
    st_opts = {
        "A": f"{subj} must {pv_mean} {item}.",
        "B": f"{subj} must search {item}.",
        "C": f"{subj} must look {item}.",
        "D": f"{subj} must postpone {item}."
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn khuyên một người bạn từ bỏ thói quen thức khuya. Bạn nói thế nào?"
    comm_opts = {
        "A": "You should give up staying up late.",
        "B": "You should give out staying up late.",
        "C": "You should give away staying up late.",
        "D": "You should turn off staying up late."
    }
    comm_correct = "A"

    pv_0_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {prep}**", "rule": f"Cụm động từ cố định: {pv_name} = {pv_mean}.",
        "why": f"Động từ '{verb_root}' đi kèm giới từ '{prep}' tạo thành cụm động từ mang nghĩa '{trans}'.",
        "trap": "Dịch từng từ của cụm (word-by-word) dẫn đến dùng sai giới từ.",
        "tip": f"Học theo cụm: {pv_name} = {pv_mean}!",
        "verdict_ei": f"**C** là câu đúng.",
        "why_ei": "Cả hai cách diễn đạt 'get over' và 'recover from' đều có nghĩa là vượt qua cú sốc.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Thay thế cụm động từ bằng động từ tương đương nghĩa.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Give up = từ bỏ."
    })

PRACTICE_BANK["phrasal_verb_0"] = generate_subtopic(pv_0_data)

# phrasal_verb_1: Basic Question Tags
pv_1_data = []
for i in range(15):
    tags = [
        ("is a doctor", "isn't he", "he"),
        ("isn't a doctor", "is he", "he"),
        ("likes play", "doesn't he", "he"),
        ("don't like play", "do they", "they"),
        ("can swim", "can't she", "she"),
        ("cannot swim", "can she", "she"),
        ("will come", "won't they", "they"),
        ("won't come", "will they", "they"),
        ("went out", "didn't she", "she"),
        ("didn't go out", "did he", "he"),
        ("has finished", "hasn't she", "she"),
        ("haven't finished", "have they", "they"),
        ("are playing", "aren't they", "they"),
        ("was sleeping", "wasn't he", "he"),
        ("weren't sleeping", "were they", "they")
    ]
    statement_v, correct_tag, pronoun = tags[i]
    subj = "He" if pronoun=="he" else "She" if pronoun=="she" else "They"

    mc_stem = f"Hoàn thành câu hỏi đuôi: *\"{subj} {statement_v}, ________?\"*<br>(Dịch: {subj} {statement_v}, có phải không?)"
    mc_opts = {"A": correct_tag, "B": correct_tag.replace("n't", "") if "n't" in correct_tag else f"{correct_tag}n't", "C": "is it", "D": "isn't it"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"She went to the market yesterday, ________?\"*<br>(Dịch: Cô ấy đã đi chợ hôm qua, đúng không?)"
    cloze_opts = {"A": "didn't she", "B": "did she", "C": "wasn't she", "D": "was she"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"You like study English, aren't you?\"*"
    ei_opts = {
        "A": "You like study English, don't you?",
        "B": "You like study English, like you?",
        "C": "You like study English, do you?",
        "D": "You like study English, aren't you?"
    }
    ei_correct = "A"

    st_stem = f"Chọn câu đồng nghĩa với:<br>*\"Is it true that {subj} {statement_v}?\"*"
    st_opts = {
        "A": f"{subj} {statement_v}, {correct_tag}?",
        "B": f"{subj} {statement_v}, is it?",
        "C": f"{subj} {statement_v}, {correct_tag.replace(pronoun, '')}?",
        "D": f"{subj} {statement_v}?"
    }
    st_correct = "A"

    comm_stem = f"**Tình huống:** Bạn muốn xác nhận lại xem Nam có đi học hôm nay không (bạn nghĩ là có). Bạn hỏi thế nào?"
    comm_opts = {
        "A": "Nam went to school today, didn't he?",
        "B": "Nam went to school today, did he?",
        "C": "Nam went to school today, wasn't he?",
        "D": "Nam went to school today, is he?"
    }
    comm_correct = "A"

    pv_1_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {correct_tag}**", "rule": "Câu hỏi đuôi: Mệnh đề khẳng định đi với đuôi phủ định và ngược lại. Sử dụng trợ động từ tương ứng.",
        "why": f"Mệnh đề là khẳng định/phủ định của thì tương ứng -> đuôi dùng trợ động từ ngược lại và đại từ chủ ngữ '{pronoun}'.",
        "trap": "Sử dụng sai trợ động từ hoặc giữ nguyên danh từ riêng ở phần đuôi.",
        "tip": "Vế trước Khẳng định (+) -> Đuôi Phủ định (-). Vế trước Phủ định (-) -> Đuôi Khẳng định (+).",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Mệnh đề dùng động từ thường HTĐ 'like' -> mượn trợ động từ 'don't' ở phần đuôi.",
        "verdict_st": f"**A** là câu đồng nghĩa đúng.",
        "why_st": "Chuyển câu hỏi xác nhận thông tin thành câu hỏi đuôi tương đương.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Went (quá khứ) -> dùng didn't he."
    })

PRACTICE_BANK["phrasal_verb_1"] = generate_subtopic(pv_1_data)

# phrasal_verb_2: Special Question Tags
pv_2_data = []
for i in range(15):
    special_tags = [
        ("I am a student", "aren't I", "I am"),
        ("Let's go for a walk", "shall we", "Let's"),
        ("Don't touch that", "will you", "Don't"),
        ("Everyone is here", "aren't they", "Everyone"),
        ("Nothing is wrong", "is it", "Nothing"),
        ("Nobody phoned", "did they", "Nobody"),
        ("He hardly ever studies", "does he", "hardly ever"),
        ("I am not wrong", "am I", "I am not"),
        ("Let's study English", "shall we", "Let's"),
        ("Open the door", "will you", "Open"),
        ("Somebody told you", "didn't they", "Somebody"),
        ("Everything was fine", "wasn't it", "Everything"),
        ("He seldom goes out", "does he", "seldom"),
        ("Let's eat out", "shall we", "Let's"),
        ("Please be quiet", "will you", "Please")
    ]
    statement, correct_tag, special_point = special_tags[i]

    statement_trans = statement.replace("Let's", "Hãy").replace("I am", "Tôi là")
    mc_stem = f"Hoàn thành câu hỏi đuôi đặc biệt: *\"{statement}, ________?\"*<br>(Dịch: {statement_trans}, có phải không?)"
    mc_opts = {"A": correct_tag, "B": "isn't it" if "it" in correct_tag else "don't they" if "they" in correct_tag else "won't you", "C": "am not I" if "aren't I" in correct_tag else "will we", "D": "are I"}
    mc_correct = "A"

    cloze_stem = f"Điền từ phù hợp: *\"Let's go to the cinema, ________?\"*<br>(Dịch: Chúng ta đi xem phim đi, đúng không?)"
    cloze_opts = {"A": "shall we", "B": "will we", "C": "don't we", "D": "aren't we"}
    cloze_correct = "A"

    ei_stem = f"Chọn câu **sửa đúng nhất**:<br>*\"I am right, am not I?\"*"
    ei_opts = {
        "A": "I am right, aren't I?",
        "B": "I am right, am I?",
        "C": "I am right, aren't you?",
        "D": "I am right, am not I?"
    }
    ei_correct = "A"

    statement_no_lets = statement.replace("Let's ", "")
    st_stem = f"Chọn câu đồng nghĩa với đề nghị:<br>*\"Shall we {statement_no_lets}?\"* (nếu bắt đầu bằng Let's)"
    st_opts = {
        "A": f"{statement}, {correct_tag}?",
        "B": f"Why don't we {statement_no_lets}?",
        "C": f"Cả A và B đều đúng.",
        "D": f"{statement}?"
    }
    st_correct = "C"

    comm_stem = f"**Tình huống:** Bạn muốn đề xuất cả nhóm cùng đi ăn tối. Câu nào đúng cấu trúc câu hỏi đuôi?"
    comm_opts = {
        "A": "Let's have dinner together, shall we?",
        "B": "Let's have dinner together, will we?",
        "C": "Let's have dinner together, don't we?",
        "D": "Let's have dinner together, aren't we?"
    }
    comm_correct = "A"

    pv_2_data.append({
        "mc_stem": mc_stem, "mc_opts": mc_opts, "mc_correct": mc_correct,
        "cloze_stem": cloze_stem, "cloze_opts": cloze_opts, "cloze_correct": cloze_correct,
        "ei_stem": ei_stem, "ei_opts": ei_opts, "ei_correct": ei_correct,
        "st_stem": st_stem, "st_opts": st_opts, "st_correct": st_correct,
        "comm_stem": comm_stem, "comm_opts": comm_opts, "comm_correct": comm_correct,
        "verdict": f"**A: {correct_tag}**", "rule": f"Quy tắc câu hỏi đuôi đặc biệt cho cấu trúc '{special_point}'.",
        "why": f"Cấu trúc '{statement}' có phần đuôi được quy định đặc biệt là '{correct_tag}'.",
        "trap": f"Dùng trợ động từ thông thường như 'am I not' thay vì 'aren't I' hoặc 'will we' cho Let's.",
        "tip": "I am -> aren't I. Let's -> shall we. Mệnh lệnh -> will you!",
        "verdict_ei": f"**A** là câu đúng.",
        "why_ei": "Với cấu trúc 'I am...', phần câu hỏi đuôi đặc biệt bắt buộc là 'aren't I?'.",
        "verdict_st": f"**C** là câu trả lời đúng vì cả Let's... shall we và Why don't we... đều biểu đạt lời đề nghị.",
        "why_st": "Biến đổi cấu trúc câu đề nghị tương thích.",
        "verdict_comm": f"**A** là câu trả lời đúng.",
        "why_comm": "Let's -> shall we."
    })

PRACTICE_BANK["phrasal_verb_2"] = generate_subtopic(pv_2_data)


# ==================== APPLY EXPANDED TENSES ROUND 3 ====================
print("Expanding Round 3 for tenses...")
for t_id, extra_qs in extra_tenses_r3.items():
    if t_id in PRACTICE_BANK:
        # Re-initialize round3 with the original 5 questions + 10 extra questions
        orig_r3 = PRACTICE_BANK[t_id]["round3"]
        # Keep original questions (if any) and truncate/expand to exactly 15 questions
        new_r3 = list(orig_r3)
        
        # Add extra questions checking for duplicates by stem
        existing_stems = [q["stem"] for q in new_r3]
        for eq in extra_qs:
            if len(new_r3) >= 15:
                break
            if eq["stem"] not in existing_stems:
                new_r3.append(eq)
                existing_stems.append(eq["stem"])
                
        # If still less than 15, we duplicate or add placeholder versions (should not happen as we provided 10)
        while len(new_r3) < 15:
            new_r3.append(extra_qs[len(new_r3) % len(extra_qs)])
            
        # Limit to exactly 15
        PRACTICE_BANK[t_id]["round3"] = new_r3[:15]
        print(f"  {t_id}: expanded round3 to {len(PRACTICE_BANK[t_id]['round3'])} questions.")


# ==================== WRITE BACK TO FILE ====================
print("Writing updated PRACTICE_BANK back to practice_bank.js...")

# Write to temporary file first, then replace (safe write)
temp_path = js_path + '.tmp'
with open(temp_path, 'w', encoding='utf-8') as f:
    f.write('// AUTO-GENERATED PRACTICE BANK v2.0 — Chuẩn DAC A5.D\n')
    f.write('// Vòng 1: 5 câu Multiple Choice | Vòng 2: 10 câu (Cloze + Error ID) | Vòng 3: 15 câu (Transformation + Communication)\n')
    f.write(f'const PRACTICE_BANK = {json.dumps(PRACTICE_BANK, indent=2, ensure_ascii=False)};\n')

# Check if file size is reasonable and write was successful
if os.path.exists(temp_path) and os.path.getsize(temp_path) > 100000:
    os.replace(temp_path, js_path)
    print("Successfully generated and updated practice_bank.js!")
else:
    print("Error: Temporary file is empty or too small. Aborting overwrite.")

# Print final stats
with open(js_path, 'r', encoding='utf-8') as f:
    final_content = f.read()
print(f"Final file size: {len(final_content)/1024:.2f} KB")

# Verify keys
print("Keys now in PRACTICE_BANK:")
for k, v in PRACTICE_BANK.items():
    print(f"  {k}: R1={len(v['round1'])}, R2={len(v['round2'])}, R3={len(v['round3'])} (Total={len(v['round1']) + len(v['round2']) + len(v['round3'])})")
