import re
import json

db_path = '/Users/danghong/Documents/Exam Runners/website/js/exams_db.js'

new_timeline_js = """    grammarTimeline: [
        {
            id: "tense",
            title: "12 Thì Tiếng Anh Cốt Lõi",
            desc: "Nền tảng chia động từ cho mọi dạng câu viết lại & chia động từ",
            status: "completed",
            mastery: 100,
            overview: {
                frequency: "Xuất hiện trong 100% các đề thi tuyển sinh, chiếm từ 1.5 - 2.5 điểm.",
                importance: "Cực kỳ quan trọng. Là nền tảng bắt buộc để làm các dạng bài tập khác như Câu bị động, Câu tường thuật, Câu điều kiện.",
                advice: "Hãy tập trung ghi nhớ công thức cấu tạo của 3 thể, các giới từ chỉ thời gian đi kèm (since, for, ago, yesterday) và sự kết hợp thì (when, while, by the time)."
            },
            visualConfig: {
                timeStates: [
                    {
                        name: "Thì Hiện tại đơn (Present Simple)",
                        formula: {
                            affirmative: "(+) S + V(s/es) / S + am/is/are",
                            negative: "(-) S + don't/doesn't + V-inf / S + am/is/are + not",
                            interrogative: "(?) Do/Does + S + V-inf? / Am/Is/Are + S...?"
                        },
                        usage: "Diễn tả thói quen lặp đi lặp lại hoặc sự thật hiển nhiên.",
                        signals: "always, usually, often, sometimes, everyday, once a week",
                        example: "She usually walks to school. The sun rises in the East.",
                        trap: "Quên thêm 's/es' với chủ ngữ số ít (he, she, it) trong câu khẳng định.",
                        tip: "Thấy trạng từ tần suất hoặc chân lý hiển nhiên -> chọn ngay Hiện tại đơn!",
                        examples: [
                            { sentence: "She walks to school every day.", translation: "Cô ấy đi bộ đến trường mỗi ngày.", explanation: "Chủ ngữ số ít 'She' yêu cầu động từ thêm 's'." },
                            { sentence: "The sun rises in the East.", translation: "Mặt trời mọc ở hướng Đông.", explanation: "Diễn tả chân lý hiển nhiên, chia hiện tại đơn." },
                            { sentence: "They do not drink coffee in the evening.", translation: "Họ không uống cà phê vào buổi tối.", explanation: "Câu phủ định với chủ ngữ số nhiều mượn trợ động từ 'do not'." }
                        ],
                        counterExamples: [
                            { sentence: "She walk to school every day.", correction: "She walks to school every day.", rule: "Thiếu 's' cho động từ đi với chủ ngữ ngôi thứ ba số ít." },
                            { sentence: "He don't like milk.", correction: "He doesn't like milk.", rule: "Dùng sai trợ động từ phủ định với chủ ngữ số ít (doesn't)." },
                            { sentence: "Do she live in Hanoi?", correction: "Does she live in Hanoi?", rule: "Dùng sai trợ động từ nghi vấn cho chủ ngữ số ít (does)." }
                        ],
                        commonMistakes: [
                            { title: "Lỗi thêm 's/es' vô điều kiện", detail: "Thêm 's' vào cả động từ đi với chủ ngữ số nhiều (ví dụ: They plays).", fix: "Chỉ thêm 's/es' với chủ ngữ He, She, It hoặc danh từ số ít." },
                            { title: "Nhầm lẫn giữa Động từ thường và To Be", detail: "Viết câu có cả hai động từ ở dạng chia (ví dụ: She is walk to school).", fix: "Hiện tại đơn chỉ dùng một trong hai: động từ thường HOẶC to be." },
                            { title: "Quên đưa động từ về nguyên mẫu sau trợ động từ", detail: "Viết câu phủ định/nghi vấn vẫn chia động từ (ví dụ: He doesn't likes coffee).", fix: "Khi đã mượn does/doesn't, động từ chính bắt buộc phải ở dạng nguyên mẫu không chia." }
                        ]
                    },
                    {
                        name: "Thì Hiện tại tiếp diễn (Present Continuous)",
                        formula: {
                            affirmative: "(+) S + am/is/are + V-ing",
                            negative: "(-) S + am/is/are + not + V-ing",
                            interrogative: "(?) Am/Is/Are + S + V-ing?"
                        },
                        usage: "Diễn tả hành động đang xảy ra tại thời điểm nói hoặc kế hoạch chắc chắn trong tương lai gần.",
                        signals: "now, at the moment, Look!, Listen!, currently",
                        example: "Listen! The baby is crying in the bedroom. We are flying to Paris tomorrow.",
                        trap: "Sử dụng tiếp diễn với động từ trạng thái nhận thức/cảm xúc (like, love, want, know).",
                        tip: "Thấy câu mệnh lệnh gây chú ý ở đầu (Look!, Listen!) -> chia ngay tiếp diễn!",
                        examples: [
                            { sentence: "Look! The baby is sleeping.", translation: "Nhìn kìa! Đứa trẻ đang ngủ.", explanation: "Từ gây chú ý 'Look!' chỉ hành động đang xảy ra." },
                            { sentence: "They are playing football right now.", translation: "Họ đang chơi bóng đá ngay bây giờ.", explanation: "Dấu hiệu 'right now' chỉ hành động đang tiếp diễn." },
                            { sentence: "We are flying to Paris tomorrow.", translation: "Chúng tôi sẽ bay đi Paris vào ngày mai.", explanation: "Diễn tả kế hoạch đã lên lịch chắc chắn trong tương lai gần." }
                        ],
                        counterExamples: [
                            { sentence: "She is wanting some ice cream.", correction: "She wants some ice cream.", rule: "Không dùng thì tiếp diễn với động từ trạng thái cảm xúc (want)." },
                            { sentence: "Look! The bus comes.", correction: "Look! The bus is coming.", rule: "Mệnh lệnh 'Look!' yêu cầu dùng thì Hiện tại tiếp diễn." },
                            { sentence: "They playing tennis at the moment.", correction: "They are playing tennis at the moment.", rule: "Thiếu động từ liên kết 'to be' (are) trong công thức tiếp diễn." }
                        ],
                        commonMistakes: [
                            { title: "Bỏ quên động từ TO BE", detail: "Chỉ viết động từ thêm '-ing' (ví dụ: He running fast).", fix: "Công thức tiếp diễn bắt buộc phải có đầy đủ: 'S + am/is/are + V-ing'." },
                            { title: "Dùng V-ing với động từ chỉ trạng thái", detail: "Dùng thì tiếp diễn với các từ như love, like, hate, understand, know.", fix: "Các động từ này chỉ dùng ở thì Hiện tại đơn." },
                            { title: "Gấp đôi phụ âm sai quy tắc", detail: "Gấp đôi phụ âm cuối khi thêm ing sai từ (ví dụ: open -> openning).", fix: "Chỉ gấp đôi phụ âm cuối với động từ 1 âm tiết kết thúc bằng 1 nguyên âm + 1 phụ âm, hoặc từ nhiều âm tiết có trọng âm rơi vào âm cuối." }
                        ]
                    },
                    {
                        name: "Thì Hiện tại hoàn thành (Present Perfect)",
                        formula: {
                            affirmative: "(+) S + have/has + V3/ed",
                            negative: "(-) S + have/has + not + V3/ed",
                            interrogative: "(?) Have/Has + S + V3/ed?"
                        },
                        usage: "Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại, hoặc vừa mới xảy ra, hoặc trải nghiệm.",
                        signals: "since, for, already, yet, just, ever, never, so far, recently",
                        example: "They have lived in Hanoi for five years. I have never seen this movie before.",
                        trap: "Dùng nhầm 'since' cho khoảng thời gian (for) hoặc dùng HTHT khi có mốc thời gian quá khứ rõ ràng.",
                        tip: "Thần chú: 'Since + Mốc' (since 2020) và 'For + Khoảng' (for 3 years).",
                        examples: [
                            { sentence: "I have lived in Hanoi for five years.", translation: "Tôi đã sống ở Hà Nội được năm năm.", explanation: "Hành động sống ở Hà Nội bắt đầu trong quá khứ và kéo dài đến nay." },
                            { sentence: "She has already finished her homework.", translation: "Cô ấy đã hoàn thành bài tập về nhà rồi.", explanation: "Dùng 'already' chỉ hành động vừa mới hoàn thành." },
                            { sentence: "Have you ever eaten sushi?", translation: "Bạn đã từng ăn sushi bao giờ chưa?", explanation: "Dùng 'ever' để hỏi về trải nghiệm tính đến thời điểm hiện tại." }
                        ],
                        counterExamples: [
                            { sentence: "I have lived here since five years.", correction: "I have lived here for five years.", rule: "Dùng 'since' cho mốc thời gian và 'for' cho khoảng thời gian." },
                            { sentence: "She has went to school.", correction: "She has gone to school.", rule: "Dùng quá khứ phân từ V3 (gone) chứ không dùng V2 (went) sau have/has." },
                            { sentence: "I have seen him yesterday.", correction: "I saw him yesterday.", rule: "Yesterday là mốc thời gian quá khứ xác định, phải dùng Quá khứ đơn." }
                        ],
                        commonMistakes: [
                            { title: "Nhầm lẫn giữa 'Since' và 'For'", detail: "Dùng 'since 3 years' hoặc 'for 2010'.", fix: "Nhớ câu thần chú: 'Since + Mốc mốc mốc' (since 2010), 'For + Khoảng khoảng khoảng' (for 3 years)." },
                            { title: "Dùng sai động từ V2 thay vì V3", detail: "Viết 'has wrote' hoặc 'have ate'.", fix: "Học thuộc lòng bảng động từ bất quy tắc cột 3 (written, eaten)." },
                            { title: "Nhầm lẫn giữa 'Have gone to' và 'Have been to'", detail: "Dùng 'have gone to' để tả trải nghiệm đã đi và đã về.", fix: "Have been to: đã đi và đã quay về; Have gone to: đã đi và chưa về." }
                        ]
                    },
                    {
                        name: "Thì Quá khứ đơn (Past Simple)",
                        formula: {
                            affirmative: "(+) S + V2/ed / S + was/were",
                            negative: "(-) S + didn't + V-inf / S + was/were + not",
                            interrogative: "(?) Did + S + V-inf? / Was/Were + S...?"
                        },
                        usage: "Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ.",
                        signals: "yesterday, ago, last week, in + năm quá khứ",
                        example: "They lived in Hanoi in 2021. He finished his homework two hours ago.",
                        trap: "Sai dạng động từ bất quy tắc (ví dụ: write -> writed thay vì wrote).",
                        tip: "Thấy mốc thời gian đã qua trong quá khứ (last, ago, yesterday) -> chia ngay Quá khứ đơn!",
                        examples: [
                            { sentence: "He bought a new laptop yesterday.", translation: "Anh ấy đã mua một chiếc máy tính xách tay mới vào ngày hôm qua.", explanation: "Hành động mua laptop kết thúc hoàn toàn vào hôm qua ('yesterday')." },
                            { sentence: "They visited Paris in 2019.", translation: "Họ đã đến thăm Paris vào năm 2019.", explanation: "Năm 2019 là mốc thời gian xác định trong quá khứ." },
                            { sentence: "Where did you go last night?", translation: "Bạn đã đi đâu tối qua?", explanation: "Câu hỏi quá khứ đơn mượn trợ động từ 'did' và đưa động từ chính về nguyên mẫu." }
                        ],
                        counterExamples: [
                            { sentence: "She didn't bought the book.", correction: "She didn't buy the book.", rule: "Động từ chính phải ở dạng nguyên mẫu (buy) sau trợ động từ phủ định 'didn't'." },
                            { sentence: "He writed a letter to his friend.", correction: "He wrote a letter to his friend.", rule: "Write là động từ bất quy tắc, dạng V2 của nó là 'wrote' chứ không thêm '-ed'." },
                            { sentence: "Where were you went yesterday?", correction: "Where did you go yesterday?", rule: "Không dùng cả to be quá khứ và động từ thường cùng chia trong câu nghi vấn." }
                        ],
                        commonMistakes: [
                            { title: "Giữ nguyên chia động từ sau 'didn't'", detail: "Viết câu phủ định vẫn giữ V2/ed (ví dụ: I didn't went out).", fix: "Sau didn't, bắt buộc động từ chính phải ở nguyên mẫu (I didn't go out)." },
                            { title: "Thêm '-ed' sai quy tắc bất quy tắc", detail: "Thêm '-ed' vào động từ bất quy tắc (ví dụ: runned, eated, seed).", fix: "Phải tra cứu và học thuộc bảng động từ bất quy tắc (ran, ate, saw)." },
                            { title: "Dùng sai 'was' và 'were'", detail: "Dùng 'They was' hoặc 'He were'.", fix: "Was đi với I/He/She/It/Danh từ số ít; Were đi với You/We/They/Danh từ số nhiều." }
                        ]
                    },
                    {
                        name: "Thì Quá khứ tiếp diễn (Past Continuous)",
                        formula: {
                            affirmative: "(+) S + was/were + V-ing",
                            negative: "(-) S + was/were + not + V-ing",
                            interrogative: "(?) Was/Were + S + V-ing?"
                        },
                        usage: "Diễn tả hành động đang xảy ra tại thời điểm xác định trong quá khứ, hoặc đang xảy ra thì hành động khác xen vào.",
                        signals: "at + giờ + quá khứ, when + QKĐ, while",
                        example: "The boys were playing football when it started to rain heavily.",
                        trap: "Chia sai động từ To Be 'was' (số ít, I/he/she/it) và 'were' (số nhiều, you/we/they).",
                        tip: "Hành động kéo dài chia Quá khứ tiếp diễn; hành động xen vào ngắn chia Quá khứ đơn.",
                        examples: [
                            { sentence: "I was reading a book at 8 PM yesterday.", translation: "Tôi đang đọc sách vào lúc 8 giờ tối hôm qua.", explanation: "Hành động đang diễn ra tại một thời điểm chính xác trong quá khứ ('8 PM yesterday')." },
                            { sentence: "The boys were playing football when it started to rain.", translation: "Các cậu bé đang chơi bóng đá thì trời bắt đầu mưa.", explanation: "Chơi bóng đá là hành động kéo dài (quá khứ tiếp diễn), trời mưa là hành động xen vào (quá khứ đơn)." },
                            { sentence: "While my mother was cooking, my father was watching TV.", translation: "Trong khi mẹ tôi đang nấu ăn thì bố tôi đang xem tivi.", explanation: "Hai hành động xảy ra song song đồng thời trong quá khứ." }
                        ],
                        counterExamples: [
                            { sentence: "I were sleeping when the phone rang.", correction: "I was sleeping when the phone rang.", rule: "Chủ ngữ ngôi thứ nhất 'I' đi với 'was' trong quá khứ tiếp diễn." },
                            { sentence: "He was listen to music at 9 last night.", correction: "He was listening to music at 9 last night.", rule: "Công thức tiếp diễn yêu cầu động từ chính phải thêm đuôi '-ing' (listening)." },
                            { sentence: "When she arrived, we was eating dinner.", correction: "When she arrived, we were eating dinner.", rule: "Chủ ngữ số nhiều 'we' phải đi với 'were'." }
                        ],
                        commonMistakes: [
                            { title: "Chia sai 'was' và 'were'", detail: "Nhầm lẫn chia 'I were' hoặc 'We was'.", fix: "Was đi với I/He/She/It; Were đi với We/You/They." },
                            { title: "Nhầm lẫn giữa When và While", detail: "Dùng 'when' trước hành động kéo dài quá khứ tiếp diễn một cách rập khuôn.", fix: "When thường đi kèm Quá khứ đơn (hành động xen vào); While thường đi kèm Quá khứ tiếp diễn (hành động kéo dài)." },
                            { title: "Quên động từ TO BE trong quá khứ", detail: "Chỉ viết 'S + V-ing' (ví dụ: They playing football).", fix: "Bắt buộc phải có was/were đứng trước V-ing." }
                        ]
                    },
                    {
                        name: "Thì Quá khứ hoàn thành (Past Perfect)",
                        formula: {
                            affirmative: "(+) S + had + V3/ed",
                            negative: "(-) S + had + not + V3/ed",
                            interrogative: "(?) Had + S + V3/ed?"
                        },
                        usage: "Diễn tả hành động xảy ra trước một hành động khác trong quá khứ.",
                        signals: "before, after, by the time",
                        example: "By the time we arrived at the cinema, the movie had already started.",
                        trap: "Nhầm lẫn trật tự trước sau giữa Quá khứ hoàn thành (trước) và Quá khứ đơn (sau).",
                        tip: "Công thức vàng: 'Before + QKĐ, QKHT' và 'After + QKHT, QKĐ'.",
                        examples: [
                            { sentence: "He had finished his dinner before we arrived.", translation: "Anh ấy đã ăn xong bữa tối trước khi chúng tôi đến.", explanation: "Hành động ăn tối xảy ra trước (Quá khứ hoàn thành), hành động đến xảy ra sau (Quá khứ đơn)." },
                            { sentence: "After she had finished her homework, she went to bed.", translation: "Sau khi cô ấy đã làm xong bài tập về nhà, cô ấy đi ngủ.", explanation: "Hành động làm bài tập trước (Quá khứ hoàn thành), hành động đi ngủ sau (Quá khứ đơn)." },
                            { sentence: "By the time we reached the station, the train had left.", translation: "Vào lúc chúng tôi tới ga, tàu hỏa đã rời đi rồi.", explanation: "Tàu rời đi trước lúc chúng tôi tới ga." }
                        ],
                        counterExamples: [
                            { sentence: "Before he had gone out, he finished his work.", correction: "Before he went out, he had finished his work.", rule: "Hành động sau 'before' là hành động xảy ra sau (Quá khứ đơn), hành động chính là xảy ra trước (Quá khứ hoàn thành)." },
                            { sentence: "After she finished her test, she had gone home.", correction: "After she had finished her test, she went home.", rule: "Hành động đi sau 'after' là hành động xảy ra trước (Quá khứ hoàn thành), vế còn lại là Quá khứ đơn." },
                            { sentence: "By the time they came, the meeting finished.", correction: "By the time they came, the meeting had finished.", rule: "Cấu trúc 'By the time + QKĐ, QKHT'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng sai trật tự xảy ra trước - sau", detail: "Dùng quá khứ đơn cho hành động trước và quá khứ hoàn thành cho hành động sau.", fix: "Hành động xảy ra TRƯỚC dùng Quá khứ hoàn thành (had + V3/ed); hành động xảy ra SAU dùng Quá khứ đơn." },
                            { title: "Nhầm lẫn cấu trúc Before và After", detail: "Nhầm công thức 'Before + QKHT'.", fix: "Nhớ mẹo: 'Trước Before là QKHT, sau Before là QKĐ' / 'Sau After là QKHT, trước After là QKĐ'." },
                            { title: "Dùng sai 'has/have' thay vì 'had'", detail: "Nhầm thì hiện tại hoàn thành trong ngữ cảnh quá khứ (ví dụ: When we arrived, the train has left).", fix: "Trong mối liên hệ quá khứ, chỉ được dùng 'had + V3/ed'." }
                        ]
                    },
                    {
                        name: "Thì Tương lai đơn (Future Simple)",
                        formula: {
                            affirmative: "(+) S + will + V-inf",
                            negative: "(-) S + will not (won't) + V-inf",
                            interrogative: "(?) Will + S + V-inf?"
                        },
                        usage: "Diễn tả quyết định ngay tại thời điểm nói, lời hứa, dự đoán không có căn cứ.",
                        signals: "tomorrow, next week, soon, I think, probably",
                        example: "I think it will rain tomorrow. I will help you with this project.",
                        trap: "Nhầm lẫn với tương lai gần 'be going to' khi diễn tả một dự đoán có bằng chứng cụ thể.",
                        tip: "Thấy các cụm bày tỏ quan điểm cá nhân như 'I think', 'I believe', 'I hope' -> chọn ngay Will!",
                        examples: [
                            { sentence: "I think it will rain tomorrow.", translation: "Tôi nghĩ ngày mai trời sẽ mưa.", explanation: "Dự đoán không có căn cứ chắc chắn, đi kèm 'I think'." },
                            { sentence: "I will open the door for you.", translation: "Tôi sẽ mở cửa cho bạn.", explanation: "Quyết định tức thời ngay tại thời điểm nói." },
                            { sentence: "I promise I will not tell anyone.", translation: "Tôi hứa tôi sẽ không nói với ai cả.", explanation: "Diễn tả một lời hứa, sử dụng 'will not (won't)'." }
                        ],
                        counterExamples: [
                            { sentence: "Look at the dark clouds! It will rain.", correction: "Look at the dark clouds! It is going to rain.", rule: "Có bằng chứng rõ ràng ở hiện tại (mây đen), phải dùng tương lai gần 'be going to'." },
                            { sentence: "I will helping you tomorrow.", correction: "I will help you tomorrow.", rule: "Sau 'will' bắt buộc phải dùng động từ nguyên mẫu không chia (V-inf)." },
                            { sentence: "She wills go to the store.", correction: "She will go to the store.", rule: "Will là động từ khuyết thiếu, không thêm 's' với bất kỳ ngôi nào." }
                        ],
                        commonMistakes: [
                            { title: "Chia động từ sau 'will'", detail: "Viết 'will goes' hoặc 'will playing'.", fix: "Động từ chính đứng sau will luôn ở dạng nguyên mẫu không chia (V-inf)." },
                            { title: "Nhầm lẫn với Tương lai gần", detail: "Dùng 'will' cho kế hoạch đã được lên lịch chi tiết hoặc có bằng chứng.", fix: "Dự kiến, kế hoạch có bằng chứng bắt buộc dùng 'be going to'." },
                            { title: "Thêm 's' vào động từ 'will'", detail: "Viết 'she wills' với chủ ngữ ngôi ba số ít.", fix: "Will là động từ khiếm khuyết, giữ nguyên dạng cho tất cả các ngôi." }
                        ]
                    },
                    {
                        name: "Thì Tương lai gần (Be going to)",
                        formula: {
                            affirmative: "(+) S + am/is/are + going to + V-inf",
                            negative: "(-) S + am/is/are + not + going to + V-inf",
                            interrogative: "(?) Am/Is/Are + S + going to + V-inf?"
                        },
                        usage: "Diễn tả kế hoạch, dự định đã lên từ trước hoặc dự đoán có căn cứ rõ ràng ở hiện tại.",
                        signals: "evidence, plan, look at the black clouds",
                        example: "Look at those dark clouds! It is going to rain. We are going to visit our grandparents.",
                        trap: "Thiếu động từ 'to be' (am/is/are) trước 'going to'.",
                        tip: "Nếu đề bài cho một bằng chứng sờ sờ ở hiện tại (ví dụ: mây đen, học rất chăm) -> chọn ngay Be going to!",
                        examples: [
                            { sentence: "Look at those dark clouds! It is going to rain.", translation: "Hãy nhìn những đám mây đen kia kìa! Trời sắp mưa rồi.", explanation: "Dự đoán có bằng chứng cụ thể rõ ràng ở hiện tại ('dark clouds')." },
                            { sentence: "We are going to buy a new car next month.", translation: "Chúng tôi định mua một chiếc xe hơi mới vào tháng tới.", explanation: "Diễn tả dự định, kế hoạch đã được quyết định từ trước." },
                            { sentence: "Are you going to attend the seminar tomorrow?", translation: "Bạn có định tham dự buổi thảo luận ngày mai không?", explanation: "Câu nghi vấn tương lai gần đảo 'are' lên trước chủ ngữ." }
                        ],
                        counterExamples: [
                            { sentence: "I going to study tonight.", correction: "I am going to study tonight.", rule: "Thiếu động từ 'to be' (am) trước 'going to'." },
                            { sentence: "They are going to buying a house.", correction: "They are going to buy a house.", rule: "Sau cụm 'going to' phải dùng động từ nguyên mẫu không chia (V-inf)." },
                            { sentence: "He is go to build a fence.", correction: "He is going to build a fence.", rule: "Sai công thức, phải là 'going to' chứ không phải 'go to' khi biểu đạt tương lai gần." }
                        ],
                        commonMistakes: [
                            { title: "Bỏ quên động từ TO BE", detail: "Viết 'She going to write a letter'.", fix: "Luôn ghi nhớ công thức đầy đủ: 'am/is/are + going to + V-inf'." },
                            { title: "Dùng V-ing sau 'going to'", detail: "Viết 'going to buying' hoặc 'going to studying'.", fix: "Động từ chính đứng sau 'going to' bắt buộc phải ở nguyên mẫu (V-inf)." },
                            { title: "Dùng sai ngữ cảnh với tương lai đơn", detail: "Dùng tương lai gần cho quyết định bộc phát tại thời điểm nói.", fix: "Quyết định tức thời dùng 'will'; kế hoạch có sẵn dùng 'be going to'." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "passive",
            title: "Câu Bị Động (Passive Voice)",
            desc: "Trọng tâm: Thể bị động đặc biệt với Make/Let, động từ chỉ giác quan",
            status: "active",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện trong khoảng 80% đề thi, thường có 1 câu trắc nghiệm hoặc 1 câu viết lại.",
                importance: "Quan trọng. Cần ghi nhớ quy tắc lùi/chuyển thì từ chủ động sang bị động và các dạng đặc biệt (make/let, truyền khiến).",
                advice: "Nhớ thần chú: 'MAKE chủ động không TO (make sb do), MAKE bị động thêm TO (be made to do)'. Luôn kiểm tra thì của câu gốc trước khi chọn dạng 'be'."
            },
            visualConfig: {
                types: [
                    {
                        title: "Bị động các thì cơ bản (Tense-based Passive)",
                        desc: "Chuyển câu bằng cách đưa tân ngữ lên làm chủ ngữ mới, chia động từ 'be' đúng thì và thêm V3/ed.",
                        formula: {
                            affirmative: "(+) S (new) + be + V3/ed + [by Agent]",
                            negative: "(-) S (new) + be + not + V3/ed + [by Agent]",
                            interrogative: "(?) Be + S (new) + V3/ed + [by Agent]?"
                        },
                        example: "Active: They build a new school. ➔ Passive: A new school is built by them.",
                        trap: "Quên chia động từ 'be' theo chủ ngữ mới (số ít/số nhiều) hoặc chia sai thì của câu gốc.",
                        tip: "Xác định thì câu gốc -> chia động từ 'be' đúng thì đó + V3/ed.",
                        examples: [
                            { sentence: "The book was written by a famous author.", translation: "Cuốn sách đã được viết bởi một tác giả nổi tiếng.", explanation: "Bị động thì Quá khứ đơn: 'was + written'." },
                            { sentence: "A new road is being built in our town.", translation: "Một con đường mới đang được xây dựng ở thị trấn của chúng tôi.", explanation: "Bị động thì Hiện tại tiếp diễn: 'is + being + built'." },
                            { sentence: "This project will be finished tomorrow.", translation: "Dự án này sẽ được hoàn thành vào ngày mai.", explanation: "Bị động thì Tương lai đơn: 'will + be + finished'." }
                        ],
                        counterExamples: [
                            { sentence: "A new school is build here.", correction: "A new school is built here.", rule: "Động từ chính phải ở dạng quá khứ phân từ V3/ed (built) chứ không dùng nguyên mẫu (build)." },
                            { sentence: "Many letters was written yesterday.", correction: "Many letters were written yesterday.", rule: "Động từ 'be' phải chia số nhiều (were) để hòa hợp với chủ ngữ số nhiều 'letters'." },
                            { sentence: "English spoke all over the world.", correction: "English is spoken all over the world.", rule: "Thiếu động từ 'be' (is) trong cấu trúc câu bị động." }
                        ],
                        commonMistakes: [
                            { title: "Quên chia động từ TO BE", detail: "Viết 'The house painted green last week'.", fix: "Câu bị động bắt buộc phải có dạng 'be + V3/ed' (The house was painted...)." },
                            { title: "Chia sai hòa hợp chủ-vị của TO BE", detail: "Dùng 'was' cho chủ ngữ số nhiều hoặc ngược lại.", fix: "Chia 'be' theo chủ ngữ MỚI của câu bị động, chứ không chia theo chủ ngữ gốc." },
                            { title: "Giữ nguyên trạng thái chủ động của động từ", detail: "Quên không chuyển động từ chính về dạng phân từ V3/ed.", fix: "Học kỹ cột 3 bất quy tắc (write -> written, make -> made)." }
                        ]
                    },
                    {
                        title: "Bị động đặc biệt với Make/Let & Giác quan",
                        desc: "Các cấu trúc đặc biệt bắt buộc phải thay đổi dạng động từ khi chuyển từ chủ động sang bị động.",
                        formula: {
                            affirmative: "(+) S + be + made + to V-inf / S + be + seen/heard + V-ing (or to V)",
                            negative: "(-) S + be + not + made + to V-inf / S + be + not + seen + V-ing",
                            interrogative: "(?) Be + S + made + to V-inf?"
                        },
                        example: "Active: She made me clean the room. ➔ Passive: I was made to clean the room by my mother.",
                        trap: "Bẫy giữ nguyên dạng V nguyên mẫu (V-inf) ở câu bị động với Make (phải chuyển thành TO V).",
                        tip: "Nhớ thần chú: Chủ động MAKE nguyên mẫu (V-inf), Bị động MAKE thêm TO (be made to V).",
                        examples: [
                            { sentence: "I was made to clean the classroom yesterday.", translation: "Tôi đã bị bắt dọn dẹp lớp học ngày hôm qua.", explanation: "Bị động với make: 'be made + to V'." },
                            { sentence: "The suspect was seen running out of the bank.", translation: "Nghi phạm được nhìn thấy đang chạy ra khỏi ngân hàng.", explanation: "Bị động của động từ chỉ giác quan 'see' khi hành động đang tiếp diễn: 'be seen + V-ing'." },
                            { sentence: "He was heard to play the piano beautifully.", translation: "Anh ấy được nghe thấy chơi đàn piano rất hay.", explanation: "Bị động của động từ giác quan 'hear' khi hành động đã hoàn tất: 'be heard + to V'." }
                        ],
                        counterExamples: [
                            { sentence: "I was made clean the room.", correction: "I was made to clean the room.", rule: "Khi chuyển sang bị động với 'make', động từ theo sau phải thêm 'to' (to V)." },
                            { sentence: "They were let to go out.", correction: "They were allowed to go out.", rule: "Không dùng bị động trực tiếp của 'let', phải biến đổi sang cấu trúc 'be allowed to V'." },
                            { sentence: "He was seen stole the wallet.", correction: "He was seen stealing the wallet.", rule: "Bị động với see ở dạng đang diễn ra phải dùng V-ing (stealing) hoặc hoàn tất dùng to V (to steal)." }
                        ],
                        commonMistakes: [
                            { title: "Quên thêm 'to' sau 'be made'", detail: "Viết 'I was made wash the dishes'.", fix: "Quy tắc: 'make sb do' ➔ 'be made TO do'." },
                            { title: "Dùng bị động của LET trực tiếp", detail: "Viết 'I was let go' trong bài thi học thuật.", fix: "Chuyển 'let' sang 'be allowed to' khi ở thể bị động." },
                            { title: "Nhầm lẫn V-ing và to V sau giác quan", detail: "Nhầm lẫn ý nghĩa khi chứng kiến một phần hành động (V-ing) và toàn bộ hành động (to V).", fix: "Giữ nguyên V-ing nếu chủ động là V-ing; đổi V-bare thành to V nếu chủ động là V-bare." }
                        ]
                    },
                    {
                        title: "Bị động 2 Tân ngữ & Thể truyền khiến",
                        desc: "Nhờ vả thuê mướn ai làm gì, hoặc câu có cả tân ngữ chỉ người và vật.",
                        formula: {
                            affirmative: "(+) S + have + sth + V3/ed / S + get + sth + V3/ed",
                            negative: "(-) S + don't/doesn't/didn't + have + sth + V3/ed",
                            interrogative: "(?) Do/Does/Did + S + have + sth + V3/ed?"
                        },
                        example: "Active: I had the barber cut my hair. ➔ Passive: I had my hair cut. | Active: He gave me a book. ➔ Passive: I was given a book.",
                        trap: "Dùng nhầm dạng V-inf hoặc to-V cho thể truyền khiến bị động (bắt buộc dùng V3/ed).",
                        tip: "Mẹo ghi nhớ: Nhờ vả chủ động dùng 'Have sb V / Get sb to V', bị động dùng 'Have/Get sth V3/ed' (Vật bị tác động).",
                        examples: [
                            { sentence: "I had my computer repaired yesterday.", translation: "Tôi đã nhờ người sửa máy tính của mình vào ngày hôm qua.", explanation: "Thể truyền khiến bị động: 'have + vật (my computer) + V3/ed (repaired)'." },
                            { sentence: "She was given a beautiful watch on her birthday.", translation: "Cô ấy đã được tặng một chiếc đồng hồ đẹp vào ngày sinh nhật.", explanation: "Bị động với động từ có 2 tân ngữ (give sb sth): đưa tân ngữ chỉ người (She) lên làm chủ ngữ." },
                            { sentence: "We got our house painted last week.", translation: "Chúng tôi đã thuê sơn nhà vào tuần trước.", explanation: "Thể truyền khiến bị động với get: 'get + vật (our house) + V3/ed (painted)'." }
                        ],
                        counterExamples: [
                            { sentence: "I had my hair cutted.", correction: "I had my hair cut.", rule: "Dạng V3 của 'cut' vẫn giữ nguyên là 'cut'." },
                            { sentence: "I had my car repair yesterday.", correction: "I had my car repaired yesterday.", rule: "Cấu trúc nhờ vả bị động bắt buộc động từ chính phải ở dạng phân từ V3/ed (repaired)." },
                            { sentence: "He got his hair to cut.", correction: "He got his hair cut.", rule: "Truyền khiến bị động với 'get + vật' yêu cầu dùng V3/ed trực tiếp, không dùng 'to V'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng sai thể chủ động của truyền khiến", detail: "Nhầm cấu trúc 'Have sb V' thành 'Have sb to V'.", fix: "Nhớ công thức: 'Have sb V-bare' nhưng 'Get sb TO V'." },
                            { title: "Dùng V-bare trong truyền khiến bị động", detail: "Viết 'I had my car wash' thay vì 'washed'.", fix: "Bị động của vật bắt buộc dùng V3/ed cho cả HAVE và GET: 'Have/Get sth V3/ed'." },
                            { title: "Nhầm lẫn giới từ to/for trong câu 2 tân ngữ", detail: "Viết 'A letter was sent for me' thay vì 'sent TO me'.", fix: "Động từ như send, give, show đi với giới từ 'to'; động từ như buy, make đi với giới từ 'for'." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "conditional",
            title: "Câu Điều Kiện & Câu Ước",
            desc: "Điều kiện loại 1, 2, 3 và cấu trúc 'Wish' trái thực tế",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện 90% đề thi, chủ yếu nằm ở dạng câu trắc nghiệm hoàn thành câu hoặc viết lại câu với 'If/Unless/Wish'.",
                importance: "Rất quan trọng. Phân biệt rõ cấu tạo điều kiện Loại 1 (có thật ở hiện tại/tương lai) và Loại 2 (trái thực tế hiện tại).",
                advice: "Đặc biệt lưu ý: Trong câu điều kiện loại 2 và câu ước ở hiện tại, động từ 'to be' luôn dùng 'WERE' cho tất cả các ngôi."
            },
            visualConfig: {
                types: [
                    {
                        title: "Điều kiện Loại 1",
                        desc: "Giả định có thật ở hiện tại hoặc tương lai.",
                        formula: {
                            affirmative: "(+) If + S + V(s/es), S + will/can + V-inf",
                            negative: "(-) If + S + don't/doesn't + V-inf, S + won't/can't + V-inf",
                            interrogative: "(?) If + S + V(s/es), will/can + S + V-inf?"
                        },
                        example: "If it rains tomorrow, we will stay at home.",
                        trap: "Dùng 'will' ngay trong mệnh đề IF (sai ngữ pháp nghiêm trọng).",
                        tip: "Mệnh đề IF chia hiện tại đơn, mệnh đề chính dùng will/can.",
                        examples: [
                            { sentence: "If you study hard, you will pass the exam.", translation: "Nếu bạn học hành chăm chỉ, bạn sẽ đỗ kỳ thi.", explanation: "Điều kiện có thể xảy ra ở tương lai, vế If chia Hiện tại đơn, vế chính dùng 'will + V-inf'." },
                            { sentence: "If she doesn't hurry, she will miss the bus.", translation: "Nếu cô ấy không khẩn trương, cô ấy sẽ lỡ chuyến xe buýt.", explanation: "Câu phủ định ở điều kiện loại 1: 'doesn't + V-inf' và 'will + V-inf'." },
                            { sentence: "Unless you practice, you cannot speak well.", translation: "Trừ khi bạn thực hành, bạn không thể nói tốt được.", explanation: "'Unless' tương đương với 'If not', theo sau bởi câu khẳng định." }
                        ],
                        counterExamples: [
                            { sentence: "If you will study hard, you will pass the exam.", correction: "If you study hard, you will pass the exam.", rule: "Tuyệt đối không sử dụng 'will' trong mệnh đề chứa 'If'." },
                            { sentence: "If he don't hurry, he will be late.", correction: "If he doesn't hurry, he will be late.", rule: "Chủ ngữ ngôi thứ ba số ít 'he' yêu cầu trợ động từ phủ định 'doesn't' ở Hiện tại đơn." },
                            { sentence: "Unless you don't study, you will fail.", correction: "Unless you study, you will fail.", rule: "'Unless' mang nghĩa phủ định, mệnh đề sau nó phải ở dạng khẳng định." }
                        ],
                        commonMistakes: [
                            { title: "Dùng 'will' trong mệnh đề IF", detail: "Viết 'If I will have time, I will visit you'.", fix: "Mệnh đề chứa IF ở loại 1 luôn dùng thì Hiện tại đơn." },
                            { title: "Dùng phủ định sau 'Unless'", detail: "Viết 'Unless you don't work hard...'.", fix: "Vì Unless = If... not, vế sau Unless luôn là thể khẳng định ('Unless you work hard...')." },
                            { title: "Nhầm lẫn vị trí của 'Unless' và 'If'", detail: "Dùng nhầm lẫn nghĩa khi viết lại câu.", fix: "Nhớ quy tắc: 'If S + not' ➔ 'Unless + S (khẳng định)'." }
                        ]
                    },
                    {
                        title: "Điều kiện Loại 2",
                        desc: "Giả định TRÁI THỰC TẾ ở hiện tại (động từ To Be dùng WERE cho mọi ngôi).",
                        formula: {
                            affirmative: "(+) If + S + V2/ed (to be -> were), S + would/could + V-inf",
                            negative: "(-) If + S + didn't + V-inf (to be -> were not), S + wouldn't/couldn't + V-inf",
                            interrogative: "(?) If + S + V2/ed, would/could + S + V-inf?"
                        },
                        example: "If I were you, I would take that course.",
                        trap: "Dùng 'was' thay vì 'were' trong bài thi viết học thuật.",
                        tip: "Cứ giả định trái thực tế -> dùng WERE cho mọi ngôi chủ ngữ.",
                        examples: [
                            { sentence: "If I were you, I would take that course.", translation: "Nếu tôi là bạn, tôi sẽ tham gia khóa học đó.", explanation: "Giả định trái thực tế ở hiện tại (tôi không thể là bạn), dùng 'were' cho chủ ngữ I." },
                            { sentence: "If she had more money, she could buy a car.", translation: "Nếu cô ấy có nhiều tiền hơn, cô ấy có thể mua một chiếc xe hơi.", explanation: "Thực tế cô ấy không có tiền, vế If chia quá khứ 'had', vế chính dùng 'could buy'." },
                            { sentence: "If they didn't live so far away, they would visit us.", translation: "Nếu họ không sống ở xa như vậy, họ sẽ đến thăm chúng tôi.", explanation: "Thực tế họ sống xa, giả định ngược lại dùng quá khứ phủ định 'didn't live'." }
                        ],
                        counterExamples: [
                            { sentence: "If I was rich, I would buy a house.", correction: "If I were rich, I would buy a house.", rule: "Trong mệnh đề If loại 2, động từ 'to be' bắt buộc dùng 'were' cho tất cả các ngôi chủ ngữ." },
                            { sentence: "If she has time, she would help us.", correction: "If she had time, she would help us.", rule: "Vế chính dùng 'would' biểu thị loại 2, vế If phải lùi thì về Quá khứ đơn (had)." },
                            { sentence: "If I won the lottery, I will travel the world.", correction: "If I won the lottery, I would travel the world.", rule: "Vế If ở Quá khứ đơn (won) biểu thị loại 2, vế chính phải dùng 'would' chứ không dùng 'will'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng 'was' cho I, He, She, It", detail: "Viết 'If he was here' trong câu điều kiện loại 2.", fix: "Đề thi học thuật vào 10 chỉ chấp nhận 'WERE' cho mọi ngôi." },
                            { title: "Nhầm lẫn thì ở hai vế", detail: "Viết vế If quá khứ đơn đi với 'will' ở vế chính.", fix: "Nhớ cặp đôi tương thích: 'Present Simple - Will/Can' (Loại 1) và 'Past Simple - Would/Could' (Loại 2)." },
                            { title: "Sai dạng động từ sau would/could", detail: "Viết 'would helped' hoặc 'could to go'.", fix: "Sau would/could luôn luôn là động từ nguyên mẫu không 'to' (V-inf)." }
                        ]
                    },
                    {
                        title: "Câu ước Wish Loại 2",
                        desc: "Ước muốn trái ngược hoàn toàn với thực tế ở hiện tại.",
                        formula: {
                            affirmative: "(+) S + wish(es) + S + V2/ed (to be -> were)",
                            negative: "(-) S + wish(es) + S + didn't + V-inf (to be -> were not)",
                            interrogative: "Không có thể nghi vấn cho cấu trúc câu ước trực tiếp"
                        },
                        example: "I wish I spoke French fluently.",
                        trap: "Giữ nguyên thì hiện tại hoặc lùi thì quá đà sang quá khứ hoàn thành.",
                        tip: "Ước trái ngược hiện tại -> lùi một thì về Quá khứ đơn.",
                        examples: [
                            { sentence: "I wish I were taller.", translation: "Tôi ước gì mình cao hơn.", explanation: "Ước trái ngược với hiện tại (tôi đang thấp), động từ 'to be' chia 'were' cho ngôi thứ nhất." },
                            { sentence: "She wishes she had a computer now.", translation: "Cô ấy ước gì cô ấy có một chiếc máy tính bây giờ.", explanation: "Thực tế hiện tại cô ấy không có máy tính, lùi thì thành 'had'." },
                            { sentence: "They wish they didn't have to work on Sundays.", translation: "Họ ước gì họ không phải làm việc vào các ngày Chủ nhật.", explanation: "Thực tế họ phải làm việc, lùi thì phủ định thành 'didn't have to'." }
                        ],
                        counterExamples: [
                            { sentence: "I wish I am rich.", correction: "I wish I were rich.", rule: "Phải lùi thì từ hiện tại đơn (am) về quá khứ giả định (were) trong câu ước trái thực tế hiện tại." },
                            { sentence: "He wishes he speaks English well.", correction: "He wishes he spoke English well.", rule: "Ước trái hiện tại phải chia động từ ở Quá khứ đơn (spoke)." },
                            { sentence: "I wish I don't have to study tonight.", correction: "I wish I didn't have to study tonight.", rule: "Lùi trợ động từ phủ định 'don't' thành 'didn't' trong câu ước." }
                        ],
                        commonMistakes: [
                            { title: "Không lùi thì trong câu ước WISH", detail: "Giữ nguyên thì hiện tại (ví dụ: I wish I can fly).", fix: "Bắt buộc lùi một thì về quá khứ (I wish I could fly)." },
                            { title: "Dùng 'was' cho động từ TO BE", detail: "Viết 'She wishes she was a singer'.", fix: "Tương tự điều kiện loại 2, hãy luôn dùng 'WERE' cho tất cả các ngôi." },
                            { title: "Nhầm lẫn giữa động từ 'wish' và mệnh đề ước", detail: "Quên chia động từ 'wish' theo chủ ngữ chính (ví dụ: He wish... - sai!).", fix: "Động từ 'wish' đứng trước chia bình thường theo chủ ngữ (I wish, he wishes)." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "comparison",
            title: "Cấu Trúc So Sánh",
            desc: "So sánh hơn, so sánh bằng, so sánh kép 'The more... the more...'",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện 70% đề thi, trọng tâm là so sánh hơn, so sánh bằng và so sánh kép (The more... the more...).",
                importance: "Trung bình khá. Rất dễ lấy điểm nếu thuộc lòng công thức biến đổi và trật tự từ.",
                advice: "Hãy nhớ quy tắc đối xứng của so sánh kép: 'The + so sánh hơn + S + V, the + so sánh hơn + S + V'."
            },
            visualConfig: {
                types: [
                    {
                        title: "So sánh hơn (Comparative)",
                        desc: "So sánh giữa hai đối tượng với tính từ ngắn (-er) hoặc tính từ dài (more).",
                        formula: {
                            affirmative: "(+) Short Adj-er + than / More + Long Adj + than",
                            negative: "(-) Not + Short Adj-er + than / Not + more + Long Adj + than",
                            interrogative: "(?) Be + S + Short Adj-er + than...?"
                        },
                        example: "He is taller than me. This book is more expensive than that one.",
                        trap: "Dùng nhầm lẫn cả 'more' và '-er' trong một từ (ví dụ: more taller).",
                        tip: "Tìm từ 'than' để nhận biết ngay cấu trúc so sánh hơn!",
                        examples: [
                            { sentence: "She is taller than her sister.", translation: "Cô ấy cao hơn em gái của mình.", explanation: "'Tall' là tính từ ngắn, thêm đuôi '-er' thành 'taller'." },
                            { sentence: "This book is more interesting than that one.", translation: "Cuốn sách này thú vị hơn cuốn sách kia.", explanation: "'Interesting' là tính từ dài, dùng cấu trúc 'more + Adj + than'." },
                            { sentence: "He runs faster than I do.", translation: "Anh ấy chạy nhanh hơn tôi.", explanation: "So sánh hơn với trạng từ ngắn 'fast' thêm đuôi '-er'." }
                        ],
                        counterExamples: [
                            { sentence: "He is more taller than me.", correction: "He is taller than me.", rule: "Không dùng cả 'more' và đuôi '-er' cùng lúc với tính từ ngắn." },
                            { sentence: "This car is expensiver than that one.", correction: "This car is more expensive than that one.", rule: "'Expensive' là tính từ dài, không được thêm đuôi '-er' mà phải dùng 'more'." },
                            { sentence: "She is as smart than her brother.", correction: "She is smarter than her brother.", rule: "Dùng 'than' trong so sánh hơn, còn 'as... as' dùng cho so sánh bằng." }
                        ],
                        commonMistakes: [
                            { title: "Dùng 'more' kết hợp đuôi '-er'", detail: "Viết 'more happier' hoặc 'more longer'.", fix: "Tính từ ngắn đã thêm đuôi '-er' tuyệt đối không đi kèm 'more'." },
                            { title: "Thêm đuôi '-er' cho tính từ dài", detail: "Viết 'beautifuler' hoặc 'intelligentel'.", fix: "Tính từ từ 2 âm tiết trở lên (trừ từ kết thúc bằng y, er, ow, le) phải dùng 'more'." },
                            { title: "Bỏ quên từ 'than' phía sau", detail: "Viết 'He is taller his brother'.", fix: "Luôn phải có liên từ so sánh 'than' khi có đối tượng so sánh thứ hai." }
                        ]
                    },
                    {
                        title: "So sánh bằng (Equative)",
                        desc: "So sánh ngang bằng giữa hai đối tượng, hoặc phủ định (không bằng).",
                        formula: {
                            affirmative: "(+) as + Adj/Adv + as",
                            negative: "(-) not + as/so + Adj/Adv + as",
                            interrogative: "(?) Be + S + as + Adj + as...?"
                        },
                        example: "She is as intelligent as her sister. That car is not as fast as this one.",
                        trap: "Thiếu chữ 'as' thứ hai hoặc nhầm lẫn sang cấu trúc so sánh hơn.",
                        tip: "Mẹo ghi nhớ: Cấu trúc đối xứng hai bên luôn là 'as... as'.",
                        examples: [
                            { sentence: "She is as old as my brother.", translation: "Cô ấy bằng tuổi anh trai tôi.", explanation: "Cấu trúc so sánh bằng đối xứng hai bên: 'as + Adj + as'." },
                            { sentence: "He doesn't run as quickly as his friend.", translation: "Anh ấy không chạy nhanh bằng bạn mình.", explanation: "So sánh không bằng sử dụng trạng từ: 'not as + Adv + as'." },
                            { sentence: "This house is not so big as mine.", translation: "Ngôi nhà này không lớn bằng nhà tôi.", explanation: "Trong câu phủ định, từ 'as' thứ nhất có thể thay bằng 'so'." }
                        ],
                        counterExamples: [
                            { sentence: "She is as tall than her mother.", correction: "She is as tall as her mother.", rule: "So sánh bằng bắt buộc phải dùng cặp từ 'as... as', không dùng 'than'." },
                            { sentence: "This book is not as better as that one.", correction: "This book is not as good as that one.", rule: "Đứng giữa 'as... as' phải là tính từ ở dạng nguyên mẫu, không được dùng dạng so sánh hơn (better)." },
                            { sentence: "He is as intelligent like his father.", correction: "He is as intelligent as his father.", rule: "Không dùng 'like' để thay thế cho từ 'as' thứ hai trong so sánh bằng." }
                        ],
                        commonMistakes: [
                            { title: "Thiếu chữ 'as' thứ hai", detail: "Viết 'She is as smart her friend'.", fix: "Cấu trúc bắt buộc luôn có hai vế đối xứng 'as... as'." },
                            { title: "Dùng dạng so sánh hơn ở giữa", detail: "Viết 'as taller as' hoặc 'as more beautiful as'.", fix: "Tính từ đứng giữa hai từ 'as' bắt buộc phải ở dạng nguyên mẫu không chia." },
                            { title: "Dùng 'like' thay cho 'as'", detail: "Nhầm lẫn viết 'as hot like fire'.", fix: "Đúng chuẩn học thuật phải dùng 'as hot as fire'." }
                        ]
                    },
                    {
                        title: "So sánh kép (Double Comparative)",
                        desc: "Diễn tả sự biến đổi song song (càng... càng...).",
                        formula: {
                            affirmative: "(+) The + so sánh hơn + S + V, the + so sánh hơn + S + V",
                            negative: "(-) Không phổ biến trong các bài thi tuyển sinh",
                            interrogative: "Không phổ biến ở dạng câu nghi vấn trực tiếp"
                        },
                        example: "The faster you walk, the earlier you will arrive. The more you study, the better you get.",
                        trap: "Quên chữ 'the' ở vế thứ hai hoặc dùng sai dạng tính từ so sánh.",
                        tip: "Mẹo 3 giây: Cấu trúc đối xứng luôn bắt đầu bằng 'The' + từ so sánh hơn ở cả 2 vế!",
                        examples: [
                            { sentence: "The more you practice, the better you get.", translation: "Bạn càng thực hành nhiều, bạn càng giỏi hơn.", explanation: "Cấu trúc song hành so sánh kép với tính từ bất quy tắc 'good' đổi thành 'better'." },
                            { sentence: "The older he grows, the wiser he becomes.", translation: "Càng lớn tuổi, anh ấy càng trở nên thông thái.", explanation: "Hai vế đối xứng đều dùng tính từ ngắn dạng so sánh hơn thêm đuôi '-er' đi sau 'The'." },
                            { sentence: "The more difficult the test is, the harder we study.", translation: "Đề thi càng khó, chúng tôi càng học tập chăm chỉ.", explanation: "Vế thứ nhất dùng tính từ dài 'more difficult', vế thứ hai dùng tính từ ngắn 'harder'." }
                        ],
                        counterExamples: [
                            { sentence: "More you learn, better you get.", correction: "The more you learn, the better you get.", rule: "Cả hai vế của so sánh kép bắt buộc phải có mạo từ 'The' đứng đầu." },
                            { sentence: "The more fast you drive, the more dangerous it is.", correction: "The faster you drive, the more dangerous it is.", rule: "'Fast' là tính từ ngắn, dạng so sánh hơn là 'faster' chứ không dùng 'more fast'." },
                            { sentence: "The more you study, you get smarter.", correction: "The more you study, the smarter you get.", rule: "Vế thứ hai cũng phải tuân thủ cấu trúc 'The + so sánh hơn + S + V' (the smarter you get)." }
                        ],
                        commonMistakes: [
                            { title: "Bỏ quên mạo từ 'THE'", detail: "Nhầm viết 'More you practice, better you get'.", fix: "Nhớ câu thần chú: Cả hai đầu vế đều phải bắt đầu bằng 'The'." },
                            { title: "Đặt sai trật tự từ", detail: "Đưa chủ ngữ lên trước tính từ so sánh (ví dụ: The you drive faster...).", fix: "Trật tự chuẩn: 'The + tính/trạng từ so sánh + Chủ ngữ + Động từ'." },
                            { title: "Dùng sai dạng tính từ ngắn/dài", detail: "Viết 'the more cheap' thay vì 'the cheaper'.", fix: "Áp dụng đúng quy tắc so sánh hơn của tính từ ngắn và tính từ dài sau mạo từ 'The'." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "relative",
            title: "Mệnh Đề Quan Hệ",
            desc: "Rút gọn mệnh đề quan hệ và cách dùng who, whom, which, whose, that",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện 85% đề thi, nằm ở câu trắc nghiệm điền đại từ quan hệ hoặc nối/rút gọn hai câu.",
                importance: "Quan trọng. Phải phân biệt rõ Who (người + V), Whom (người + S + V), Which (vật), Whose (sở hữu) và cách rút gọn mệnh đề quan hệ.",
                advice: "Rút gọn chủ động dùng V-ing, rút gọn bị động dùng V3/ed. Đây là bẫy phân loại cực kỳ phổ biến."
            },
            visualConfig: {
                types: [
                    {
                        title: "Đại từ quan hệ 'Who'",
                        desc: "Thay thế cho danh từ chỉ người, đóng vai trò làm Chủ ngữ trong mệnh đề quan hệ.",
                        formula: {
                            affirmative: "(+) N (chỉ người) + WHO + V + O",
                            negative: "(-) N (chỉ người) + WHO + trợ động từ phủ định + V",
                            interrogative: "Không áp dụng trực tiếp"
                        },
                        example: "The man who lives next door is a doctor.",
                        trap: "Dùng nhầm 'whom' thay cho 'who' khi phía sau là một động từ.",
                        tip: "Người + WHO + Động từ (V).",
                        examples: [
                            { sentence: "The girl who won the competition is my classmate.", translation: "Cô gái người mà giành chiến thắng cuộc thi là bạn học của tôi.", explanation: "'Who' thay thế cho danh từ chỉ người 'The girl' và làm chủ ngữ cho động từ 'won'." },
                            { sentence: "I know the dentist who treated your teeth.", translation: "Tôi biết nha sĩ người đã điều trị răng cho bạn.", explanation: "'Who' đứng trước động từ 'treated' làm chủ ngữ thay thế cho danh từ 'the dentist'." },
                            { sentence: "The students who did not finish the homework stayed late.", translation: "Những học sinh người không hoàn thành bài tập phải ở lại muộn.", explanation: "Who đi kèm trợ động từ phủ định 'did not finish'." }
                        ],
                        counterExamples: [
                            { sentence: "The man whom lives here is a doctor.", correction: "The man who lives here is a doctor.", rule: "Không dùng 'whom' làm chủ ngữ trực tiếp trước động từ 'lives'." },
                            { sentence: "The dog who is barking is mine.", correction: "The dog which is barking is mine.", rule: "Không dùng 'who' để thay thế cho danh từ chỉ động vật/sự vật." },
                            { sentence: "The boy whom helped me is very kind.", correction: "The boy who helped me is very kind.", rule: "Phía sau là động từ 'helped' ➔ Cần chủ ngữ 'who' chứ không dùng tân ngữ 'whom'." }
                        ],
                        commonMistakes: [
                            { title: "Nhầm lẫn giữa WHO và WHOM", detail: "Dùng 'whom' trước một động từ chính.", fix: "Luôn kiểm tra phía sau: nếu là động từ (V) -> dùng WHO; nếu là mệnh đề (S + V) -> dùng WHOM." },
                            { title: "Dùng WHO cho đồ vật hoặc con vật", detail: "Viết 'The table who was broken...'.", fix: "Chỉ dùng WHO cho người; dùng WHICH cho đồ vật và động vật." },
                            { title: "Giữ nguyên đại từ thay thế ở vế sau", detail: "Viết 'The man who I saw him yesterday...' (thừa từ 'him').", fix: "Đại từ quan hệ WHO/WHOM đã thay thế cho danh từ, phải lược bỏ đại từ nhân xưng tương ứng ở vế sau." }
                        ]
                    },
                    {
                        title: "Đại từ quan hệ 'Whom'",
                        desc: "Thay thế cho danh từ chỉ người, đóng vai trò làm Tân ngữ trong mệnh đề quan hệ.",
                        formula: {
                            affirmative: "(+) N (chỉ người) + WHOM + S + V",
                            negative: "(-) N (chỉ người) + WHOM + S + trợ động từ phủ định + V",
                            interrogative: "Không áp dụng"
                        },
                        example: "The girl whom you met yesterday is my sister.",
                        trap: "Nhầm lẫn 'whom' làm chủ ngữ của mệnh đề quan hệ.",
                        tip: "Người + WHOM + Mệnh đề (S + V).",
                        examples: [
                            { sentence: "The teacher whom we love very much has retired.", translation: "Giáo viên người mà chúng tôi yêu quý rất nhiều đã nghỉ hưu rồi.", explanation: "'Whom' thay thế cho 'The teacher' đóng vai trò tân ngữ cho mệnh đề 'we love'." },
                            { sentence: "The boy whom you met at the gate is my brother.", translation: "Cậu bé người mà bạn gặp ở cổng là em trai tôi.", explanation: "'Whom' đứng trước chủ ngữ 'you' của mệnh đề quan hệ." },
                            { sentence: "The children whom she teaches are very active.", translation: "Những đứa trẻ người mà cô ấy dạy rất năng động.", explanation: "'Whom' thay thế cho tân ngữ của động từ 'teaches'." }
                        ],
                        counterExamples: [
                            { sentence: "The doctor whom treated me was very kind.", correction: "The doctor who treated me was very kind.", rule: "Phía sau là động từ 'treated' ➔ Bắt buộc dùng chủ ngữ 'who' chứ không phải tân ngữ 'whom'." },
                            { sentence: "The girl whom you met her yesterday is my sister.", correction: "The girl whom you met yesterday is my sister.", rule: "Đã có đại từ quan hệ 'whom' thay thế, phải bỏ đại từ tân ngữ 'her' ở vế sau." },
                            { sentence: "The book whom you bought is interesting.", correction: "The book which you bought is interesting.", rule: "Không dùng 'whom' cho danh từ chỉ vật 'The book'." }
                        ],
                        commonMistakes: [
                            { title: "Giữ lại đại từ tân ngữ thừa", detail: "Viết 'The man whom I saw him...' (giữ lại him).", fix: "Khi dùng WHO/WHOM/WHICH, bắt buộc phải bỏ tân ngữ cũ (him/her/it) ở mệnh đề sau." },
                            { title: "Nhầm lẫn cấu trúc làm Chủ ngữ", detail: "Dùng 'whom' trước động từ (ví dụ: The boy whom spoke to me).", fix: "Sau khoảng trống có động từ chia thì -> chỉ được dùng WHO." },
                            { title: "Dịch sai giới từ đi kèm", detail: "Đặt giới từ sai vị trí (ví dụ: The man whom I talked to him).", fix: "Đưa giới từ lên trước WHOM (To whom...) hoặc để nguyên giới từ cuối câu và bỏ 'him'." }
                        ]
                    },
                    {
                        title: "Đại từ quan hệ 'Which'",
                        desc: "Thay thế cho danh từ chỉ vật/sự việc, đóng vai trò làm Chủ ngữ hoặc Tân ngữ.",
                        formula: {
                            affirmative: "(+) N (chỉ vật) + WHICH + V + O / WHICH + S + V",
                            negative: "(-) N (chỉ vật) + WHICH + not...",
                            interrogative: "Không áp dụng"
                        },
                        example: "The book which is on the table is mine.",
                        trap: "Dùng 'who' hoặc 'whom' cho danh từ chỉ vật.",
                        tip: "Vật + WHICH + Động từ/Mệnh đề.",
                        examples: [
                            { sentence: "The house which has a green door is theirs.", translation: "Ngôi nhà có cánh cửa màu xanh là của họ.", explanation: "'Which' thay thế cho danh từ chỉ vật 'The house' làm chủ ngữ cho vế quan hệ." },
                            { sentence: "The laptop which I bought yesterday works well.", translation: "Chiếc máy tính xách tay tôi mua hôm qua hoạt động rất tốt.", explanation: "'Which' làm tân ngữ thay thế cho 'The laptop' trong mệnh đề 'I bought'." },
                            { sentence: "This is the cat which caught the mouse.", translation: "Đây là con mèo đã bắt được con chuột.", explanation: "'Which' dùng thay thế cho danh từ chỉ động vật 'the cat'." }
                        ],
                        counterExamples: [
                            { sentence: "The book who I read yesterday was great.", correction: "The book which I read yesterday was great.", rule: "Danh từ chỉ vật 'The book' bắt buộc phải dùng đại từ quan hệ 'which'." },
                            { sentence: "The phone which you bought it is expensive.", correction: "The phone which you bought is expensive.", rule: "Lược bỏ đại từ tân ngữ 'it' ở mệnh đề sau vì 'which' đã thay thế cho nó." },
                            { sentence: "The car who broke down belongs to my uncle.", correction: "The car which broke down belongs to my uncle.", rule: "Không dùng 'who' cho danh từ chỉ vật 'The car'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng WHO/WHOM cho danh từ chỉ vật", detail: "Viết 'The film who I watched last night...'.", fix: "Danh từ chỉ vật/sự vật/sự việc bắt buộc phải dùng WHICH hoặc THAT." },
                            { title: "Giữ nguyên đại từ tân ngữ 'it/them'", detail: "Viết 'The cake which I ate it was delicious'.", fix: "Phải lược bỏ tân ngữ 'it' sau động từ 'ate'." },
                            { title: "Dùng sai WHICH thay cho WHO", detail: "Nhầm lẫn dùng 'The teacher which teaches us' cho người.", fix: "Nhớ quy tắc: Người đi với WHO, Vật đi với WHICH." }
                        ]
                    },
                    {
                        title: "Đại từ quan hệ 'Whose'",
                        desc: "Thay thế cho tính từ sở hữu đứng trước danh từ.",
                        formula: {
                            affirmative: "(+) N1 + WHOSE + N2 + V / S + V (N2 thuộc sở hữu của N1)",
                            negative: "(-) Không áp dụng dạng phủ định riêng biệt",
                            interrogative: "Không áp dụng"
                        },
                        example: "The girl whose dog died is crying.",
                        trap: "Nhầm lẫn giữa 'whose' và 'who's' (who is).",
                        tip: "Đứng giữa hai danh từ biểu thị sự sở hữu -> chọn ngay Whose!",
                        examples: [
                            { sentence: "The man whose car was stolen called the police.", translation: "Người đàn ông có chiếc xe hơi bị mất trộm đã gọi cảnh sát.", explanation: "'Whose' thay thế cho tính từ sở hữu 'his' (his car = whose car)." },
                            { sentence: "The girl whose father is a doctor is my friend.", translation: "Cô gái có bố là bác sĩ là bạn của tôi.", explanation: "'Whose' đứng trước danh từ 'father' chỉ mối quan hệ sở hữu gia đình." },
                            { sentence: "I met a writer whose books are famous.", translation: "Tôi đã gặp một nhà văn có những cuốn sách rất nổi tiếng.", explanation: "'Whose' kết nối sự sở hữu giữa 'writer' và 'books'." }
                        ],
                        counterExamples: [
                            { sentence: "The man who's car was stolen called the police.", correction: "The man whose car was stolen called the police.", rule: "'Who's' là viết tắt của 'Who is' hoặc 'Who has'. Sở hữu cách phải dùng đại từ 'whose'." },
                            { sentence: "The girl whose her dog died is crying.", correction: "The girl whose dog died is crying.", rule: "Không dùng tính từ sở hữu 'her' sau đại từ quan hệ chỉ sở hữu 'whose'." },
                            { sentence: "The house who's roof was damaged is being repaired.", correction: "The house whose roof was damaged is being repaired.", rule: "Dù là vật hay người, khi chỉ sự sở hữu đều dùng 'whose' (hoặc of which) chứ không dùng 'who's'." }
                        ],
                        commonMistakes: [
                            { title: "Nhầm lẫn giữa WHO'S và WHOSE", detail: "Viết 'The student who's book...' vì phát âm giống nhau.", fix: "Ghi nhớ: WHOSE + Danh từ (chỉ sở hữu); WHO'S = Who is / Who has." },
                            { title: "Thêm tính từ sở hữu thừa", detail: "Viết 'whose his computer' hoặc 'whose their house'.", fix: "Lược bỏ hoàn toàn các tính từ sở hữu (his/her/their/its) sau WHOSE." },
                            { title: "Đặt WHOSE đứng trực tiếp trước động từ", detail: "Viết 'The boy whose is playing basketball...' (thiếu danh từ bị sở hữu).", fix: "WHOSE luôn luôn phải đi kèm với một Danh từ đi ngay sát phía sau (Whose + N)." }
                        ]
                    },
                    {
                        title: "Rút gọn Mệnh đề quan hệ",
                        desc: "Lược bỏ đại từ quan hệ và động từ 'to be', giữ lại V-ing (chủ động) hoặc V3/ed (bị động).",
                        formula: {
                            affirmative: "(+) Chủ động: N + V-ing | Bị động: N + V3/ed",
                            negative: "(-) N + not + V-ing / N + not + V3/ed",
                            interrogative: "Không áp dụng"
                        },
                        example: "The man standing there is my uncle. The toys made in Japan are expensive.",
                        trap: "Chọn nhầm V-ing cho cấu trúc bị động hoặc ngược lại.",
                        tip: "Dịch nghĩa danh từ: nếu 'tự thực hiện' -> V-ing, nếu 'bị/được tác động' -> V3/ed.",
                        examples: [
                            { sentence: "The man standing near the door is my uncle.", translation: "Người đàn ông đang đứng gần cửa là bác của tôi.", explanation: "Rút gọn mệnh đề chủ động: 'who is standing' ➔ 'standing'." },
                            { sentence: "The toys made in Japan are highly durable.", translation: "Những món đồ chơi được sản xuất tại Nhật Bản có độ bền rất cao.", explanation: "Rút gọn mệnh đề bị động: 'which were made' ➔ 'made'." },
                            { sentence: "The students punished by the teacher had to stay.", translation: "Những học sinh bị phạt bởi giáo viên phải ở lại trường.", explanation: "Mang nghĩa bị phạt (bị động) ➔ rút gọn thành quá khứ phân từ 'punished'." }
                        ],
                        counterExamples: [
                            { sentence: "The girl played the piano is my sister.", correction: "The girl playing the piano is my sister.", rule: "Mệnh đề chủ động khi rút gọn phải biến động từ thành dạng V-ing (playing)." },
                            { sentence: "The bridge building last year is very long.", correction: "The bridge built last year is very long.", rule: "Cây cầu được xây dựng (bị động) nên rút gọn phải dùng dạng V3/ed (built) chứ không dùng V-ing (building)." },
                            { sentence: "The window was broken yesterday has been fixed.", correction: "The window broken yesterday has been fixed.", rule: "Khi rút gọn mệnh đề quan hệ bị động phải bỏ cả đại từ quan hệ và động từ to be, không giữ lại 'was broken' tạo thành 2 động từ chính trong câu." }
                        ],
                        commonMistakes: [
                            { title: "Dùng sai V-ing cho câu bị động", detail: "Viết 'The house building in 2020...' (ngôi nhà không thể tự xây).", fix: "Xác định rõ bản chất: nếu vật bị tác động, bắt buộc dùng V3/ed (The house built...)." },
                            { title: "Giữ lại động từ 'be' chia thì", detail: "Viết 'The student was punished by the teacher yesterday...'.", fix: "Nếu không dùng đại từ quan hệ, phải bỏ hoàn toàn 'to be' (The student punished...)." },
                            { title: "Dùng V2 thay vì quá khứ phân từ V3", detail: "Nhầm lẫn các động từ bất quy tắc khi viết rút gọn bị động (ví dụ: write -> wrote thay vì written).", fix: "Luôn sử dụng động từ ở cột 3 trong bảng bất quy tắc cho dạng rút gọn bị động." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "gerund",
            title: "Danh Động Từ & Động Từ Nguyên Mẫu",
            desc: "Trọng tâm: V-ing, To-V, động từ nguyên mẫu và cấu trúc đặc biệt với 'It takes time'",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện trong 90% đề thi dưới dạng trắc nghiệm chọn động từ theo sau bởi To-V hay V-ing.",
                importance: "Trung bình khá. Đòi hỏi học sinh học thuộc các nhóm động từ cốt lõi.",
                advice: "Chú ý cấu trúc thời gian: 'It takes/took someone + time + to V' đối chiếu với 'Spend + time + V-ing'."
            },
            visualConfig: {
                types: [
                    {
                        title: "Động từ đi kèm To-V (Infinitives)",
                        desc: "Các động từ chỉ ý chí, kế hoạch, hy vọng... bắt buộc đi kèm To-V.",
                        formula: {
                            affirmative: "(+) want, hope, decide, plan, agree, refuse + TO + V-inf",
                            negative: "(-) want/decide/agree... + NOT + TO + V-inf",
                            interrogative: "Không áp dụng trực tiếp"
                        },
                        example: "She decided to study abroad next year. They planned to go out.",
                        trap: "Dùng V-ing sau nhóm từ này do thói quen dịch nghĩa.",
                        tip: "Các từ chỉ tương lai/mong muốn/dự định hầu hết đều đi với To-V.",
                        examples: [
                            { sentence: "She decided to study abroad next year.", translation: "Cô ấy đã quyết định đi du học vào năm tới.", explanation: "Động từ 'decide' bắt buộc đi kèm động từ nguyên mẫu có to ('to study')." },
                            { sentence: "We agreed not to discuss the matter again.", translation: "Chúng tôi đã đồng ý không thảo luận lại vấn đề đó nữa.", explanation: "Cấu trúc phủ định: 'not + to V'." },
                            { sentence: "They are planning to visit their grandparents.", translation: "Họ đang lập kế hoạch đến thăm ông bà.", explanation: "'Plan' đi với động từ 'to visit'." }
                        ],
                        counterExamples: [
                            { sentence: "He decided studying medicine.", correction: "He decided to study medicine.", rule: "Đằng sau động từ 'decide' bắt buộc phải dùng 'to V', không dùng V-ing." },
                            { sentence: "I hope that to pass the exam.", correction: "I hope to pass the exam.", rule: "Cấu trúc 'hope to V' trực tiếp, không xen kẽ 'that to V'." },
                            { sentence: "She agreed to not go out.", correction: "She agreed not to go out.", rule: "Từ phủ định 'not' phải đứng TRƯỚC giới từ 'to' (not to V)." }
                        ],
                        commonMistakes: [
                            { title: "Dùng V-ing sau động từ chỉ dự định", detail: "Viết 'I plan going to the beach' hoặc 'She hopes passing'.", fix: "Học thuộc lòng danh sách các từ đi với To-V: plan, hope, decide, expect, promise." },
                            { title: "Đặt sai vị trí của từ phủ định 'not'", detail: "Nhầm lẫn viết 'to not V' (ví dụ: decided to not go).", fix: "Luôn đặt 'not' đứng trước 'to': 'decided not to go'." },
                            { title: "Dùng nguyên mẫu không TO sau decide/agree", detail: "Viết 'She decided buy a new phone'.", fix: "Các động từ này luôn bắt buộc phải có 'to': 'decided to buy'." }
                        ]
                    },
                    {
                        title: "Động từ đi kèm V-ing (Gerunds)",
                        desc: "Các động từ chỉ sở thích, tránh né, đề xuất... bắt buộc đi kèm V-ing.",
                        formula: {
                            affirmative: "(+) avoid, enjoy, suggest, spend (time), look forward to + V-ing",
                            negative: "(-) avoid/enjoy... + not + V-ing",
                            interrogative: "Không áp dụng"
                        },
                        example: "We are looking forward to hearing from you. She enjoys reading books.",
                        trap: "Quên thêm V-ing sau cụm giới từ đặc biệt 'look forward to' (dễ chọn nhầm to-V).",
                        tip: "Ghi nhớ: 'Look forward to' đi với V-ing chứ không phải V-inf!",
                        examples: [
                            { sentence: "She enjoys reading books in her free time.", translation: "Cô ấy thích đọc sách vào thời gian rảnh rỗi.", explanation: "Động từ chỉ sở thích 'enjoy' bắt buộc đi với danh động từ V-ing ('reading')." },
                            { sentence: "You should avoid travelling during rush hour.", translation: "Bạn nên tránh đi lại vào giờ cao điểm.", explanation: "'Avoid' đi với động từ thêm đuôi '-ing'." },
                            { sentence: "I am looking forward to hearing from you soon.", translation: "Tôi rất mong sớm nhận được phản hồi từ bạn.", explanation: "Cụm từ cố định 'look forward to' đi kèm danh động từ V-ing ('hearing')." }
                        ],
                        counterExamples: [
                            { sentence: "She avoids to meet him.", correction: "She avoids meeting him.", rule: "Động từ 'avoid' (tránh né) bắt buộc đi với V-ing." },
                            { sentence: "I am looking forward to meet you.", correction: "I am looking forward to meeting you.", rule: "Chữ 'to' trong 'look forward to' là một giới từ, theo sau giới từ phải dùng danh động từ V-ing (meeting)." },
                            { sentence: "He suggested to go for a walk.", correction: "He suggested going for a walk.", rule: "Động từ 'suggest' (gợi ý) đi kèm danh động từ V-ing ở cấu trúc trực tiếp." }
                        ],
                        commonMistakes: [
                            { title: "Dùng To-V sau 'look forward to'", detail: "Lỗi cực kỳ phổ biến: viết 'look forward to hear'.", fix: "Nhớ kỹ: 'look forward to + V-ing' (to ở đây là giới từ, không phải to của động từ nguyên mẫu)." },
                            { title: "Dùng To-V sau 'avoid/suggest'", detail: "Nhầm lẫn viết 'avoid to make mistakes' hoặc 'suggest to go'.", fix: "Các từ này bắt buộc đi với V-ing ('avoid making', 'suggest going')." },
                            { title: "Quên thêm ing cho động từ sau spend/waste time", detail: "Viết 'I spend time to learn English'.", fix: "Cấu trúc: 'spend + time + V-ing' (I spend time learning...)." }
                        ]
                    },
                    {
                        title: "Cấu trúc thời gian với 'It takes'",
                        desc: "Ai đó mất bao nhiêu thời gian/tiền bạc để hoàn thành việc gì.",
                        formula: {
                            affirmative: "(+) It takes/took + someone + time + TO + V-inf",
                            negative: "(-) It doesn't/didn't take + someone + time + TO + V-inf",
                            interrogative: "(?) Does/Did it take + someone + time + TO + V-inf?"
                        },
                        example: "It took them three hours to finish the project.",
                        trap: "Nhầm lẫn giữa 'It takes time to V' và 'Spend time V-ing'.",
                        tip: "Thần chú: 'Takes + to V' nhưng 'Spend + V-ing'!",
                        examples: [
                            { sentence: "It takes me thirty minutes to walk to school.", translation: "Tôi mất ba mươi phút để đi bộ đến trường.", explanation: "Cấu trúc thời gian ở hiện tại: 'It takes + me + 30 minutes + to walk'." },
                            { sentence: "It took them three hours to finish the science project.", translation: "Họ đã mất ba tiếng đồng hồ để hoàn thành dự án khoa học.", explanation: "Cấu trúc thời gian ở quá khứ: 'It took + someone + time + to V'." },
                            { sentence: "Does it take much time to learn this song?", translation: "Có mất nhiều thời gian để học bài hát này không?", explanation: "Dạng câu hỏi nghi vấn của cấu trúc 'It takes'." }
                        ],
                        counterExamples: [
                            { sentence: "It took me two hours doing my homework.", correction: "It took me two hours to do my homework.", rule: "Cấu trúc 'It takes/took + someone + time' bắt buộc phải đi với động từ nguyên mẫu có to 'to V' (to do)." },
                            { sentence: "I spent two hours to do my homework.", correction: "I spent two hours doing my homework.", rule: "Động từ 'spend' yêu cầu đi với danh động từ V-ing (doing) để chỉ việc dành thời gian làm gì." },
                            { sentence: "It takes she one hour to cook.", correction: "It takes her one hour to cook.", rule: "Từ đứng sau 'takes' làm tân ngữ chỉ người, phải dùng đại từ tân ngữ (her) chứ không dùng đại từ chủ ngữ (she)." }
                        ],
                        commonMistakes: [
                            { title: "Dùng V-ing sau cấu trúc 'It takes'", detail: "Nhầm viết 'It took me one hour writing the essay'.", fix: "Nhớ quy tắc: 'Takes + someone + time + TO V'." },
                            { title: "Dùng To-V sau động từ 'Spend'", detail: "Nhầm viết 'I spent my weekend to clean the house'.", fix: "Nhớ quy tắc song hành: 'Spend + time + V-ING'." },
                            { title: "Dùng đại từ chủ ngữ thay cho tân ngữ", detail: "Viết 'It takes he 10 minutes...' thay vì 'takes him'.", fix: "Sử dụng đúng đại từ tân ngữ: me, him, her, us, them, you." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "connectors",
            title: "Từ Nối & Sự Nhượng Bộ",
            desc: "Trọng tâm: Because vs Because of, Although vs In spite of/Despite, và cấu trúc Enough/Too",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện trong 100% đề thi, từ điền từ liên kết đến viết lại câu nguyên nhân/nhượng bộ.",
                importance: "Rất quan trọng. Phân biệt rõ liên từ đi với Mệnh đề (Because, Although) và cụm từ đi với Cụm danh từ/V-ing (Because of, Despite).",
                advice: "Công thức vàng: 'Adj + enough' nhưng 'enough + Noun'. Nhớ thần chú: 'Tính trước, Danh sau'."
            },
            visualConfig: {
                types: [
                    {
                        title: "Nguyên nhân (Reason)",
                        desc: "Biểu đạt nguyên nhân, bởi vì... Phân biệt đi với Mệnh đề và Cụm từ.",
                        formula: {
                            affirmative: "(+) Because / Since / As + S + V | Because of / Due to + N / V-ing",
                            negative: "(-) Không áp dụng dạng phủ định đặc biệt",
                            interrogative: "Không áp dụng"
                        },
                        example: "We stayed at home because it rained heavily. We stayed at home because of the heavy rain.",
                        trap: "Dùng 'Because of' trước một mệnh đề có đầy đủ S + V.",
                        tip: "Nếu có động từ đã chia -> dùng Because. Nếu chỉ là cụm danh từ/V-ing -> dùng Because of.",
                        examples: [
                            { sentence: "We stayed at home because it rained heavily.", translation: "Chúng tôi ở nhà vì trời mưa to.", explanation: "Sau 'because' là mệnh đề có chủ ngữ 'it' và động từ 'rained'." },
                            { sentence: "We stayed at home because of the heavy rain.", translation: "Chúng tôi ở nhà vì trận mưa lớn.", explanation: "Sau 'because of' là cụm danh từ 'the heavy rain'." },
                            { sentence: "He succeeded due to working hard.", translation: "Anh ấy thành công nhờ làm việc chăm chỉ.", explanation: "Sau 'due to' (bằng because of) là danh động từ V-ing ('working hard')." }
                        ],
                        counterExamples: [
                            { sentence: "We were late because of the traffic was bad.", correction: "We were late because the traffic was bad.", rule: "'Traffic was bad' là một mệnh đề hoàn chỉnh (S + V) ➔ Dùng 'because' chứ không dùng 'because of'." },
                            { sentence: "She couldn't go out because of she was sick.", correction: "She couldn't go out because she was sick.", rule: "Sau 'because of' là cụm danh từ/V-ing, không dùng mệnh đề bắt đầu bằng đại từ nhân xưng 'she was'." },
                            { sentence: "He failed because his laziness.", correction: "He failed because of his laziness.", rule: "'His laziness' là một cụm danh từ ➔ Bắt buộc phải dùng 'because of'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng 'Because of' trước mệnh đề S+V", detail: "Viết 'We stayed home because of it was cold'.", fix: "Loại bỏ 'of' nếu phía sau là một mệnh đề có động từ chia thì." },
                            { title: "Dùng 'Because' trước cụm danh từ", detail: "Viết 'He missed the exam because his illness'.", fix: "Thêm 'of' sau because nếu phía sau chỉ là cụm danh từ/V-ing." },
                            { title: "Dùng sai dạng của động từ/danh từ khi biến đổi", detail: "Nhầm lẫn khi chuyển đổi câu (ví dụ: because he was sick ➔ because of his sick - sai!).", fix: "Tính từ 'sick' phải đổi thành danh từ 'illness/sickness' hoặc dùng V-ing 'being sick' sau because of." }
                        ]
                    },
                    {
                        title: "Sự nhượng bộ (Concession)",
                        desc: "Biểu đạt sự tương phản, mặc dù... Phân biệt đi với Mệnh đề và Cụm từ.",
                        formula: {
                            affirmative: "(+) Although / Even though + S + V | Despite / In spite of + N / V-ing",
                            negative: "(-) Không áp dụng riêng biệt",
                            interrogative: "Không áp dụng"
                        },
                        example: "Although he was tired, he finished his work. Despite being tired, he finished his work.",
                        trap: "Viết thêm từ 'but' trong câu đã có 'Although' (lỗi dịch thô tiếng Việt).",
                        tip: "Có mệnh đề S + V -> Although. Chỉ có cụm từ -> Despite / In spite of.",
                        examples: [
                            { sentence: "Although he was extremely tired, he finished his homework.", translation: "Mặc dù anh ấy vô cùng mệt mỏi, anh ấy vẫn hoàn thành bài tập về nhà.", explanation: "Sau 'although' là mệnh đề có chủ ngữ 'he' và động từ 'was'." },
                            { sentence: "Despite being tired, he finished his homework.", translation: "Mặc dù mệt mỏi, anh ấy vẫn hoàn thành bài tập về nhà.", explanation: "Sau 'despite' là danh động từ 'being tired' (cùng chủ ngữ với mệnh đề chính)." },
                            { sentence: "They went hiking in spite of the bad weather.", translation: "Họ đã đi bộ đường dài bất chấp thời tiết xấu.", explanation: "Sau 'in spite of' là cụm danh từ 'the bad weather'." }
                        ],
                        counterExamples: [
                            { sentence: "Although he was tired, but he went to school.", correction: "Although he was tired, he went to school.", rule: "Trong tiếng Anh, không được sử dụng đồng thời cả 'although' và 'but' trong một câu." },
                            { sentence: "Despite the weather was bad, they went out.", correction: "Despite the bad weather, they went out.", rule: "'The weather was bad' là mệnh đề S + V ➔ Không dùng sau 'despite', phải chuyển thành cụm danh từ 'the bad weather'." },
                            { sentence: "In spite of he had a headache, he studied.", correction: "In spite of having a headache, he studied.", rule: "Sau 'in spite of' là cụm từ/V-ing, phải đổi mệnh đề thành 'having a headache'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng đồng thời 'Although' và 'But'", detail: "Lỗi kinh điển: 'Although it was raining, but we went out' (dịch thô từ tiếng Việt 'Mặc dù... nhưng...').", fix: "Bỏ hoàn toàn từ 'but' ở mệnh đề thứ hai khi đầu câu đã có Although." },
                            { title: "Dùng 'Despite' trước mệnh đề S+V", detail: "Viết 'Despite he was short, he played basketball well'.", fix: "Đổi thành 'Although he was short...' hoặc 'Despite being short...'." },
                            { title: "Thêm 'of' vào sau 'Despite'", detail: "Lỗi viết nhầm 'Despite of the rain...'.", fix: "Nhớ công thức: 'Despite' đứng một mình không có 'of'; chỉ 'In spite of' mới đi kèm 'of'." }
                        ]
                    },
                    {
                        title: "Cấu trúc trật tự với 'Enough'",
                        desc: "Biểu đạt tính chất vừa đủ để làm việc gì đó.",
                        formula: {
                            affirmative: "(+) Adj / Adv + enough + to V | enough + N (danh từ) + to V",
                            negative: "(-) not + Adj/Adv + enough + to V | not + enough + N + to V",
                            interrogative: "Không áp dụng riêng biệt"
                        },
                        example: "He is old enough to drive. I have enough money to buy a car.",
                        trap: "Bẫy trật tự từ: đặt tính từ đứng sau enough (ví dụ: enough old - sai!).",
                        tip: "Thần chú trật tự từ: 'Tính trước, Danh sau' (Adj đứng trước enough, Danh từ đứng sau enough).",
                        examples: [
                            { sentence: "He is old enough to drive a car.", translation: "Anh ấy đủ tuổi để lái xe hơi.", explanation: "Tính từ 'old' đứng trước 'enough' theo quy tắc." },
                            { sentence: "I have enough money to buy a new smartphone.", translation: "Tôi có đủ tiền để mua một chiếc điện thoại thông minh mới.", explanation: "Danh từ 'money' đứng sau 'enough' theo quy tắc." },
                            { sentence: "She did not speak slowly enough for us to understand.", translation: "Cô ấy đã không nói đủ chậm để chúng tôi có thể hiểu được.", explanation: "Trạng từ 'slowly' đứng trước 'enough', bổ trợ cho động từ 'speak'." }
                        ],
                        counterExamples: [
                            { sentence: "He is enough old to drive.", correction: "He is old enough to drive.", rule: "Tính từ 'old' bắt buộc phải đứng trước từ 'enough'." },
                            { sentence: "I have money enough to buy a laptop.", correction: "I have enough money to buy a laptop.", rule: "Danh từ 'money' bắt buộc phải đứng sau từ 'enough'." },
                            { sentence: "She is smart enough for pass the exam.", correction: "She is smart enough to pass the exam.", rule: "Cấu trúc đầy đủ là 'enough + to V', không dùng 'for + V'." }
                        ],
                        commonMistakes: [
                            { title: "Đặt tính từ đứng sau 'enough'", detail: "Lỗi viết 'enough tall' hoặc 'enough warm'.", fix: "Nhớ câu thần chú phòng thi: 'Tính từ đứng TRƯỚC enough' (tall enough)." },
                            { title: "Đặt danh từ đứng trước 'enough'", detail: "Lỗi viết 'time enough' hoặc 'books enough'.", fix: "Nhớ câu thần chú phòng thi: 'Danh từ đứng SAU enough' (enough time)." },
                            { title: "Bỏ quên giới từ 'to' của động từ", detail: "Viết 'He is strong enough lift the box' (thiếu to).", fix: "Phải dùng dạng động từ nguyên mẫu có to ở vế sau ('enough to lift')." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "reported_speech",
            title: "Câu Tường Thuật",
            desc: "Trọng tâm: Quy tắc lùi thì, biến đổi trạng từ thời gian/nơi chốn và câu hỏi gián tiếp",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện 80% đề thi, tập trung vào viết lại câu tường thuật hoặc trắc nghiệm bẫy câu hỏi gián tiếp.",
                importance: "Quan trọng. Nắm chắc 3 bước: đổi ngôi/chủ ngữ, lùi thì động từ, đổi trạng từ thời gian/nơi chốn.",
                advice: "Bẫy kinh điển: Câu hỏi gián tiếp KHÔNG được đảo ngữ, bắt buộc đưa về dạng khẳng định S + V."
            },
            visualConfig: {
                types: [
                    {
                        title: "Quy tắc lùi thì (Tense Backshift)",
                        desc: "Khi động từ tường thuật ở quá khứ (said, told), ta phải lùi thì của mệnh đề được tường thuật.",
                        formula: {
                            affirmative: "(+) Present Simple ➔ Past Simple | Past Simple ➔ Past Perfect | will ➔ would",
                            negative: "(-) Do/does not ➔ did not | did not ➔ had not | will not ➔ would not",
                            interrogative: "Không áp dụng trực tiếp"
                        },
                        example: "'I like tea,' he said. ➔ He said that he liked tea.",
                        trap: "Quên lùi thì của động từ hoặc quên biến đổi trạng từ thời gian (ví dụ giữ nguyên 'tomorrow').",
                        tip: "Nhớ lùi một thì về quá khứ và biến đổi các từ chỉ khoảng cách/thời gian: this -> that, here -> there.",
                        examples: [
                            { sentence: "He said that he loved reading books.", translation: "Anh ấy nói rằng anh ấy thích đọc sách.", explanation: "Câu gốc: 'I love reading books.' lùi thì hiện tại đơn thành quá khứ đơn 'loved'." },
                            { sentence: "She told me she had finished her project the day before.", translation: "Cô ấy nói với tôi cô ấy đã hoàn thành dự án từ hôm trước.", explanation: "Câu gốc: 'I finished my project yesterday.' lùi quá khứ đơn thành quá khứ hoàn thành 'had finished', đổi trạng từ 'yesterday' thành 'the day before'." },
                            { sentence: "They said they would visit us the next week.", translation: "Họ nói họ sẽ đến thăm chúng tôi vào tuần tới.", explanation: "Câu gốc: 'We will visit you next week.' đổi 'will' thành 'would', đổi 'next week' thành 'the next week'." }
                        ],
                        counterExamples: [
                            { sentence: "He said that he is working now.", correction: "He said that he was working then.", rule: "Phải lùi thì hiện tại tiếp diễn 'is working' thành quá khứ tiếp diễn 'was working' và đổi trạng từ 'now' thành 'then'." },
                            { sentence: "She said she will come tomorrow.", correction: "She said she would come the next day.", rule: "Phải đổi 'will' thành 'would' và trạng từ 'tomorrow' thành 'the next day' / 'the following day'." },
                            { sentence: "They told me they bought a car last week.", correction: "They told me they had bought a car the previous week.", rule: "Quá khứ đơn 'bought' phải lùi về Quá khứ hoàn thành 'had bought' và đổi 'last week' thành 'the previous week'." }
                        ],
                        commonMistakes: [
                            { title: "Quên lùi thì của động từ chính", detail: "Viết 'He said that he likes coffee' khi động từ tường thuật ở quá khứ.", fix: "Luôn kiểm tra và lùi thì động từ chính trong ngoặc kép về quá khứ tương ứng." },
                            { title: "Giữ nguyên các trạng từ thời gian/nơi chốn", detail: "Viết 'She said she would go tomorrow'.", fix: "Biến đổi đúng: tomorrow ➔ the next day, yesterday ➔ the previous day, here ➔ there, this ➔ that." },
                            { title: "Nhầm lẫn giữa động từ 'say' và 'tell'", detail: "Viết 'He said me that...' hoặc 'He told that...'.", fix: "Quy tắc: 'say (that) + mệnh đề' (không có tân ngữ người); 'tell + someone + (that) + mệnh đề' (bắt buộc có tân ngữ người)." }
                        ]
                    },
                    {
                        title: "Câu hỏi gián tiếp (Reported Questions)",
                        desc: "Tường thuật lại câu hỏi Yes/No hoặc câu hỏi có từ để hỏi Wh-.",
                        formula: {
                            affirmative: "(+) asked + (if/whether) + S + V (lùi thì) | asked + Wh-word + S + V (lùi thì)",
                            negative: "(-) asked + if + S + trợ động từ phủ định (lùi thì) + V",
                            interrogative: "Không áp dụng"
                        },
                        example: "'Where do you live?' she asked. ➔ She asked me where I lived.",
                        trap: "Quen tay dùng cấu trúc đảo ngữ có trợ động từ (ví dụ: she asked me where did I live - sai!).",
                        tip: "Quy tắc cốt lõi: Không đảo ngữ trong câu gián tiếp, phải đưa về trật tự khẳng định S + V.",
                        examples: [
                            { sentence: "She asked me where I lived.", translation: "Cô ấy đã hỏi tôi nơi tôi sống.", explanation: "Câu hỏi Wh-: 'Where do you live?' chuyển thành gián tiếp bỏ trợ động từ 'do', giữ nguyên trật tự khẳng định 'I lived' và lùi thì." },
                            { sentence: "He asked if I liked English.", translation: "Anh ấy đã hỏi tôi liệu tôi có thích tiếng Anh không.", explanation: "Câu hỏi Yes/No: 'Do you like English?' chuyển thành gián tiếp thêm từ nối 'if' và lùi thì." },
                            { sentence: "I asked her whether she was tired.", translation: "Tôi đã hỏi cô ấy liệu cô ấy có mệt không.", explanation: "Sử dụng từ nối 'whether' trong câu tường thuật câu hỏi Yes/No." }
                        ],
                        counterExamples: [
                            { sentence: "She asked me where did I live.", correction: "She asked me where I lived.", rule: "Trong câu hỏi gián tiếp, tuyệt đối không dùng trợ động từ đảo ngữ 'did'. Phải viết theo trật tự câu khẳng định 'I lived'." },
                            { sentence: "He asked me if I am tired.", correction: "He asked me if I was tired.", rule: "Phải lùi động từ 'am' về quá khứ 'was' trong mệnh đề câu hỏi gián tiếp." },
                            { sentence: "They asked what did she want.", correction: "They asked what she wanted.", rule: "Bỏ trợ động từ đảo ngữ 'did' và lùi động từ 'want' thành 'wanted'." }
                        ],
                        commonMistakes: [
                            { title: "Giữ cấu trúc đảo ngữ câu hỏi", detail: "Lỗi cực kỳ phổ biến: viết 'He asked me where was the station'.", fix: "Đưa động từ ra sau chủ ngữ theo trật tự câu trần thuật: 'He asked me where the station was'." },
                            { title: "Quên từ nối 'if' hoặc 'whether'", detail: "Chuyển câu hỏi Yes/No mà không có từ nối (ví dụ: She asked me I liked coffee).", fix: "Bắt buộc thêm 'if' hoặc 'whether' đứng đầu mệnh đề gián tiếp của câu hỏi Yes/No." },
                            { title: "Lùi thì sai sau từ nối", detail: "Nhầm lẫn lùi thì không tương thích với ngữ cảnh quá khứ.", fix: "Tuân thủ nghiêm ngặt quy tắc lùi thì cho mọi động từ trong mệnh đề gián tiếp." }
                        ]
                    },
                    {
                        title: "Mệnh lệnh & Yêu cầu (Commands)",
                        desc: "Tường thuật lời yêu cầu, khuyên bảo, mệnh lệnh từ ai đó.",
                        formula: {
                            affirmative: "(+) told / asked / advised + O + TO + V-inf",
                            negative: "(-) told / asked / advised + O + NOT + TO + V-inf",
                            interrogative: "Không áp dụng"
                        },
                        example: "'Don't stay up late,' she said. ➔ She told me not to stay up late.",
                        trap: "Sai vị trí của từ phủ định 'not' (ví dụ: to not V thay vì not to V).",
                        tip: "Mệnh lệnh phủ định luôn luôn là: 'not + to + V-inf'.",
                        examples: [
                            { sentence: "The doctor told me to drink more water.", translation: "Bác sĩ đã bảo tôi uống nhiều nước hơn.", explanation: "Tường thuật mệnh lệnh khẳng định: 'told + O (me) + to V'." },
                            { sentence: "She asked us not to make noise.", translation: "Cô ấy yêu cầu chúng tôi không làm ồn.", explanation: "Tường thuật mệnh lệnh phủ định: 'asked + O (us) + not + to V'." },
                            { sentence: "My father advised me to study hard.", translation: "Bố tôi khuyên tôi nên học hành chăm chỉ.", explanation: "Tường thuật lời khuyên sử dụng động từ 'advised'." }
                        ],
                        counterExamples: [
                            { sentence: "He told me to not make noise.", correction: "He told me not to make noise.", rule: "Trong câu mệnh lệnh phủ định gián tiếp, từ 'not' bắt buộc phải đứng trước 'to' (not to V)." },
                            { sentence: "She told that I should go out.", correction: "She told me to go out.", rule: "Cấu trúc gián tiếp của mệnh lệnh yêu cầu dùng 'tell + someone + to V' thay vì mệnh đề 'should'." },
                            { sentence: "The teacher asked us don't talk.", correction: "The teacher asked us not to talk.", rule: "Không dùng trợ động từ 'don't' trong câu tường thuật mệnh lệnh, phải đổi thành 'not to V'." }
                        ],
                        commonMistakes: [
                            { title: "Đặt từ phủ định 'not' sai vị trí", detail: "Viết 'He told me to not write'.", fix: "Nhớ kỹ trật tự: 'not + to + V-inf'." },
                            { title: "Giữ nguyên trợ động từ 'don't'", detail: "Nhầm viết 'She told me don't open the door'.", fix: "Bỏ 'don't' đổi thành 'not to' ('told me not to open...')." },
                            { title: "Thiếu tân ngữ chỉ người sau 'told/asked'", detail: "Viết 'She told not to stay up late' (thiếu người nhận mệnh lệnh).", fix: "Cấu trúc bắt buộc phải có tân ngữ: 'told + O + not to V' (she told me not to...)." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "word_form",
            title: "Từ Loại & Giới Từ",
            desc: "Trọng tâm: Phân biệt vị trí N/Adj/Adv/V, tính từ đuôi -ed/-ing chỉ cảm xúc và giới từ đi kèm",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện 100% đề thi, thường có từ 2 - 4 câu ở phần điền từ hoặc biến đổi từ loại.",
                importance: "Rất quan trọng. Đòi hỏi nhận biết vị trí của Danh từ, Tính từ, Động từ, Trạng từ trong câu.",
                advice: "Đặc biệt phân biệt tính từ đuôi -ed (cảm xúc chủ quan của người) và -ing (tính chất khách quan của vật)."
            },
            visualConfig: {
                types: [
                    {
                        title: "Vị trí Từ loại (Word Position)",
                        desc: "Xác định vai trò ngữ pháp để điền Danh, Tính, Động hay Trạng từ vào chỗ trống.",
                        formula: {
                            affirmative: "(+) Adj + N | linking verb + Adj | V + Adv",
                            negative: "(-) Không áp dụng dạng phủ định riêng biệt",
                            interrogative: "Không áp dụng"
                        },
                        example: "He drives carefully. This is a beautiful house. She is very intelligent.",
                        trap: "Bẫy điền tính từ sau động từ thường hoặc trạng từ sau động từ liên kết (linking verbs).",
                        tip: "Mẹo: Động từ thường đi với Trạng từ (run quickly), Động từ chỉ trạng thái đi với Tính từ (feel tired).",
                        examples: [
                            { sentence: "She is a beautiful girl.", translation: "Cô ấy là một cô gái xinh đẹp.", explanation: "Tính từ 'beautiful' đứng trước bổ nghĩa cho danh từ 'girl'." },
                            { sentence: "The student performed very well in the test.", translation: "Học sinh đó đã thể hiện rất tốt trong bài thi.", explanation: "Trạng từ 'well' đứng sau bổ nghĩa cho động từ thường 'performed'." },
                            { sentence: "This food smells delicious.", translation: "Món ăn này có mùi rất thơm ngon.", explanation: "Sau động từ liên kết giác quan 'smell' ta sử dụng tính từ 'delicious'." }
                        ],
                        counterExamples: [
                            { sentence: "He drives very careful.", correction: "He drives very carefully.", rule: "Động từ thường 'drive' yêu cầu bổ nghĩa bằng một Trạng từ (carefully) chứ không dùng tính từ (careful)." },
                            { sentence: "She feels badly today.", correction: "She feels bad today.", rule: "'Feel' là động từ liên kết (linking verb), theo sau nó phải là một Tính từ (bad) chứ không phải trạng từ (badly)." },
                            { sentence: "He is a driver carefully.", correction: "He is a careful driver.", rule: "Tính từ (careful) bổ nghĩa cho danh từ (driver) đứng sau và đứng trước danh từ." }
                        ],
                        commonMistakes: [
                            { title: "Dùng tính từ thay vì trạng từ sau động từ thường", detail: "Viết 'She speaks English fluent'.", fix: "Các động từ chỉ hành động thường đi kèm trạng từ thêm đuôi '-ly' (fluently)." },
                            { title: "Dùng trạng từ sau động từ liên kết (linking verbs)", detail: "Viết 'The soup tastes deliciously' hoặc 'She looks happily'.", fix: "Sau linking verbs (look, taste, smell, feel, seem, become...) bắt buộc phải dùng Tính từ." },
                            { title: "Đặt sai vị trí của Tính từ và Danh từ", detail: "Viết 'I bought a book interesting' do ảnh hưởng ngữ pháp tiếng Việt.", fix: "Trong tiếng Anh, tính từ luôn đứng TRƯỚC danh từ nó bổ nghĩa." }
                        ]
                    },
                    {
                        title: "Tính từ đuôi -ed và -ing",
                        desc: "-ed chỉ cảm xúc chủ quan của đối tượng; -ing chỉ tính chất khách quan của sự vật/việc.",
                        formula: {
                            affirmative: "(+) People + -ed (feelings) | Things + -ing (characteristics)",
                            negative: "(-) Không áp dụng",
                            interrogative: "Không áp dụng"
                        },
                        example: "The children were bored with the boring movie.",
                        trap: "Bẫy mặc định danh từ chỉ người luôn đi với đuôi -ed (nếu người đó gây ra tính chất thì vẫn dùng -ing).",
                        tip: "Cảm xúc của con người -> đuôi -ed. Tính chất của sự vật/sự việc -> đuôi -ing.",
                        examples: [
                            { sentence: "I was extremely interested in the lecture.", translation: "Tôi đã cực kỳ hứng thú với bài giảng.", explanation: "Tả cảm xúc chủ quan của con người ('I') ➔ dùng tính từ đuôi '-ed'." },
                            { sentence: "The lecture was very interesting.", translation: "Bài giảng rất thú vị.", explanation: "Tả tính chất khách quan của sự việc ('the lecture') ➔ dùng tính từ đuôi '-ing'." },
                            { sentence: "The long walk was tiring, so we felt tired.", translation: "Chuyến đi bộ dài thật mệt mỏi, nên chúng tôi cảm thấy mệt.", explanation: "Chuyến đi bộ mang tính chất mệt mỏi ('tiring'); con người cảm nhận sự mệt mỏi ('tired')." }
                        ],
                        counterExamples: [
                            { sentence: "I am boring with this long waiting.", correction: "I am bored with this long waiting.", rule: "Tả cảm xúc chán nản của bản thân con người ➔ phải dùng tính từ đuôi '-ed' (bored)." },
                            { sentence: "The movie was very bored.", correction: "The movie was very boring.", rule: "Tả tính chất chán ngắt của bộ phim (vật/sự việc) ➔ phải dùng tính từ đuôi '-ing' (boring)." },
                            { sentence: "He is an interested person who always tells jokes.", correction: "He is an interesting person who always tells jokes.", rule: "Tả tính chất thú vị của một người làm người khác vui vẻ ➔ dùng tính từ đuôi '-ing' (interesting)." }
                        ],
                        commonMistakes: [
                            { title: "Dùng '-ing' để tả cảm xúc con người", detail: "Viết 'I am very exciting about the trip'.", fix: "Cảm xúc chủ quan của người đối với sự vật luôn dùng đuôi '-ed' (excited)." },
                            { title: "Dùng '-ed' để tả tính chất của đồ vật/sự việc", detail: "Viết 'The book is very interested'.", fix: "Tính chất đặc trưng của sự vật/sự việc luôn dùng đuôi '-ing' (interesting)." },
                            { title: "Nhầm lẫn khi người mang tính chất đặc trưng", detail: "Dùng '-ed' cho người để tả tính cách thú vị của họ (ví dụ: He is an excited boy - mang nghĩa cậu bé đang hào hứng, chứ không phải cậu bé thú vị).", fix: "Nếu người đó gây ra cảm xúc cho người khác, người đó là vật thể khách quan mang tính chất ➔ vẫn dùng đuôi '-ing' (He is an interesting boy)." }
                        ]
                    },
                    {
                        title: "Giới từ cố định (Collocations)",
                        desc: "Các cụm từ đi liền với giới từ bắt buộc trong tiếng Anh.",
                        formula: {
                            affirmative: "(+) keen on | fond of | interested in | prevent from",
                            negative: "(-) not keen on / not fond of...",
                            interrogative: "Không áp dụng"
                        },
                        example: "He is keen on playing sports. She is fond of reading.",
                        trap: "Dịch thô giới từ từ tiếng Việt sang tiếng Anh (ví dụ nghĩ 'lo lắng về' dùng worried of thay vì worried about).",
                        tip: "Học thuộc các cặp từ cố định: interested đi với in, proud đi với of, famous đi với for.",
                        examples: [
                            { sentence: "He is extremely keen on playing computer games.", translation: "Anh ấy cực kỳ thích chơi trò chơi máy tính.", explanation: "Tính từ 'keen' đi kèm giới từ 'on' cố định." },
                            { sentence: "She is very proud of her academic achievements.", translation: "Cô ấy rất tự hào về những thành tựu học tập của mình.", explanation: "Tính từ 'proud' đi kèm giới từ 'of' cố định." },
                            { sentence: "The local police prevented the crowd from entering.", translation: "Cảnh sát địa phương đã ngăn cản đám đông đi vào trong.", explanation: "Cấu trúc động từ 'prevent someone from V-ing'." }
                        ],
                        counterExamples: [
                            { sentence: "She is very interested with learning English.", correction: "She is very interested in learning English.", rule: "Tính từ 'interested' bắt buộc đi kèm giới từ 'in', không dùng 'with'." },
                            { sentence: "He is worried of his final exam marks.", correction: "He is worried about his final exam marks.", rule: "Tính từ 'worried' đi kèm giới từ 'about', không dùng 'of'." },
                            { sentence: "The driver was famous of his driving speed.", correction: "The driver was famous for his driving speed.", rule: "Tính từ 'famous' đi kèm giới từ 'for' chỉ lý do nổi tiếng." }
                        ],
                        commonMistakes: [
                            { title: "Dịch thô giới từ từ tiếng Việt", detail: "Lỗi viết 'worried of' vì dịch 'lo lắng của/về', hoặc 'angry with/at' thành 'angry about' tùy ý.", fix: "Học thuộc lòng theo cụm từ (Collocations): keen on, fond of, interested in, surprised at, tired of." },
                            { title: "Dùng sai giới từ đi kèm động từ đặc biệt", detail: "Nhầm lẫn 'prevent from' thành 'prevent to'.", fix: "Động từ prevent đi với cấu trúc 'prevent sb from doing sth'." },
                            { title: "Dùng động từ nguyên mẫu sau giới từ", detail: "Viết 'He is good at speak English'.", fix: "Theo sau bất kỳ giới từ nào (trừ giới từ 'to' của động từ nguyên mẫu) luôn luôn là danh động từ V-ing ('good at speaking')." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        },
        {
            id: "phrasal_verb",
            title: "Cụm Động Từ & Câu Hỏi Đuôi",
            desc: "Trọng tâm: Các phrasal verbs phổ biến (turn up, set up...) và trường hợp câu hỏi đuôi đặc biệt",
            status: "locked",
            mastery: 0,
            overview: {
                frequency: "Xuất hiện trong 75% đề thi ở phần điền phrasal verbs thông dụng và câu hỏi đuôi đặc biệt.",
                importance: "Quan trọng. Tránh dịch nghĩa thô các phrasal verbs, học thuộc các câu hỏi đuôi đặc biệt (Let's, I am).",
                advice: "Thuộc câu thần chú: Thấy 'Let's' -> câu hỏi đuôi luôn là 'shall we?'. Thấy 'I am' -> câu hỏi đuôi luôn là 'aren't I?'."
            },
            visualConfig: {
                types: [
                    {
                        title: "Cụm Động Từ (Phrasal Verbs)",
                        desc: "Sự kết hợp giữa động từ và tiểu từ tạo ra một lớp nghĩa hoàn toàn mới.",
                        formula: {
                            affirmative: "(+) Verb + Preposition / Particle (e.g. look for, turn off, get over)",
                            negative: "(-) Trợ động từ phủ định + Phrasal Verb",
                            interrogative: "(?) Trợ động từ nghi vấn + S + Phrasal Verb?"
                        },
                        example: "He turned up late. We set up a new club in our school.",
                        trap: "Nhầm lẫn ý nghĩa giữa các giới từ đi kèm của cùng một động từ (ví dụ: turn on, turn off, turn up, turn down).",
                        tip: "Học thuộc 10 cụm động từ cốt lõi cực hay xuất hiện trong đề thi Sở.",
                        examples: [
                            { sentence: "They decided to set up a new library in the school.", translation: "Họ đã quyết định thành lập một thư viện mới trong trường học.", explanation: "'Set up' nghĩa là thành lập (establish)." },
                            { sentence: "We waited in the rain, but she didn't turn up.", translation: "Chúng tôi đã đợi dưới mưa, nhưng cô ấy không xuất hiện.", explanation: "'Turn up' nghĩa là đến nơi, xuất hiện (arrive/appear)." },
                            { sentence: "It took him a long time to get over the flu.", translation: "Cậu ấy đã mất nhiều thời gian để bình phục sau trận cúm.", explanation: "'Get over' nghĩa là bình phục, vượt qua khó khăn." }
                        ],
                        counterExamples: [
                            { sentence: "Please turn down the TV, I cannot hear anything.", correction: "Please turn up the TV, I cannot hear anything.", rule: "Dịch sai nghĩa: Muốn nghe to hơn phải dùng 'turn up' (vặn to), không dùng 'turn down' (vặn nhỏ)." },
                            { sentence: "He decided to look into his missing keys.", correction: "He decided to look for his missing keys.", rule: "'Look for' là tìm kiếm vật bị mất; 'Look into' là điều tra vụ việc." },
                            { sentence: "She went off the train and entered the building.", correction: "She got off the train and entered the building.", rule: "Xuống xe tàu phải dùng 'get off' chứ không dùng 'go off' (đổ chuông, phát nổ)." }
                        ],
                        commonMistakes: [
                            { title: "Nhầm lẫn ý nghĩa của các tiểu từ đi kèm", detail: "Nhầm lẫn giữa turn up (xuất hiện) và turn on (mở thiết bị), hoặc look for (tìm kiếm) và look after (chăm sóc).", fix: "Học phrasal verbs theo danh sách bảng nghĩa phân loại rõ ràng." },
                            { title: "Dịch thô từng từ của cụm từ", detail: "Lỗi dịch 'give up' thành 'đưa lên' thay vì nghĩa đúng là 'từ bỏ'.", fix: "Phrasal verb mang một lớp nghĩa ẩn dụ mới hoàn toàn so với động từ gốc, bắt buộc phải học thuộc cả cụm." },
                            { title: "Chia sai động từ trong cụm ở quá khứ", detail: "Viết 'runned out of' hoặc 'gotted over'.", fix: "Chỉ chia thì động từ chính đứng trước (ran out of, got over), giữ nguyên giới từ/tiểu từ đứng sau." }
                        ]
                    },
                    {
                        title: "Câu hỏi đuôi đối xứng (Question Tags)",
                        desc: "Phần đuôi ngắn hỏi lại xác nhận, tuân theo quy tắc đối xứng khẳng định - phủ định.",
                        formula: {
                            affirmative: "(+) S + V (khẳng định) ➔ trợ động từ phủ định + đại từ?",
                            negative: "(-) S + V (phủ định) ➔ trợ động từ khẳng định + đại từ?",
                            interrogative: "Bản chất câu hỏi đuôi chính là câu nghi vấn kết hợp"
                        },
                        example: "She is studying hard, isn't she? They didn't go out, did they?",
                        trap: "Dùng sai trợ động từ ở phần đuôi hoặc quên đổi chủ ngữ thành đại từ nhân xưng thích hợp.",
                        tip: "Xác định rõ động từ chính ở thì nào -> mượn đúng trợ động từ của thì đó ở thể đối lập!",
                        examples: [
                            { sentence: "She is a beautiful girl, isn't she?", translation: "Cô ấy là một cô gái xinh đẹp, phải không?", explanation: "Mệnh đề chính khẳng định với 'is', phần đuôi dùng phủ định 'isn't she'." },
                            { sentence: "They went to the cinema, didn't they?", translation: "Họ đã đi xem phim, phải không?", explanation: "Động từ chính ở quá khứ đơn 'went' (khẳng định), mượn trợ động từ quá khứ phủ định 'didn't they'." },
                            { sentence: "Your brother doesn't like milk, does he?", translation: "Em trai bạn không thích sữa, phải không?", explanation: "Mệnh đề chính phủ định 'doesn't', phần đuôi dùng khẳng định 'does he'." }
                        ],
                        counterExamples: [
                            { sentence: "They are playing soccer, don't they?", correction: "They are playing soccer, aren't they?", rule: "Mệnh đề chính dùng động từ liên kết 'are' ➔ Phần đuôi phải dùng 'aren't' chứ không mượn trợ động từ 'don't'." },
                            { sentence: "Nam went to school yesterday, didn't Nam?", correction: "Nam went to school yesterday, didn't he?", rule: "Phần câu hỏi đuôi bắt buộc phải dùng Đại từ nhân xưng (he) thay thế cho danh từ riêng (Nam)." },
                            { sentence: "She has not done the homework, didn't she?", correction: "She has not done the homework, has she?", rule: "Mệnh đề chính dùng thì Hiện tại hoàn thành phủ định 'has not' ➔ Phần đuôi phải dùng trợ động từ khẳng định 'has she'." }
                        ],
                        commonMistakes: [
                            { title: "Dùng sai trợ động từ", detail: "Mượn trợ động từ 'don't/didn't' trong khi mệnh đề chính có động từ TO BE hoặc động từ khiếm khuyết.", fix: "Nếu câu có 'be' hoặc modal verb (will, can, should), dùng chính nó ở phần đuôi. Nếu có động từ thường, mượn do/does/did." },
                            { title: "Giữ nguyên danh từ ở phần đuôi", detail: "Viết 'isn't Nam?' hoặc 'didn't the students?'.", fix: "Luôn đổi danh từ thành đại từ tương ứng: he, she, it, they, we." },
                            { title: "Dùng sai thể khẳng định/phủ định", detail: "Viết câu khẳng định đi kèm đuôi khẳng định (ví dụ: She lives here, does she? - sai!).", fix: "Nhớ nguyên tắc đối xứng: Khẳng định ➔ Đuôi Phủ định; Phủ định ➔ Đuôi Khẳng định." }
                        ]
                    },
                    {
                        title: "Trường hợp đặc biệt của Câu hỏi đuôi",
                        desc: "Các dạng biến thể phi đối xứng bắt buộc học thuộc lòng.",
                        formula: {
                            affirmative: "(+) Let's... ➔ shall we? | I am... ➔ aren't I? | Everyone... ➔ ... they? | S + never/seldom + V ➔ đuôi khẳng định?",
                            negative: "(-) Don't do that (mệnh lệnh) ➔ will you?",
                            interrogative: "Bản chất câu hỏi đuôi"
                        },
                        example: "Let's go for a walk, shall we? I am right, aren't I?",
                        trap: "Dễ nhầm câu hỏi đuôi của 'Let's' thành 'won't we' hoặc 'I am' thành 'am not I'.",
                        tip: "Ghi nhớ thần chú: Thấy 'Let's' -> đuôi là 'shall we?'. Thấy 'I am' -> đuôi là 'aren't I?'.",
                        examples: [
                            { sentence: "Let's go to the park, shall we?", translation: "Chúng ta hãy đi công viên đi, được chứ?", explanation: "Mệnh đề đề nghị 'Let's' bắt buộc đuôi là 'shall we?'." },
                            { sentence: "I am late for the meeting, aren't I?", translation: "Tôi bị trễ cuộc họp, đúng không?", explanation: "Chủ ngữ 'I am' trong câu hỏi đuôi đặc biệt đổi thành 'aren't I?'." },
                            { sentence: "Everyone was happy, weren't they?", translation: "Mọi người đều hạnh phúc, đúng không?", explanation: "Các đại từ bất định chỉ người như 'everyone, someone' được quy về đại từ 'they' ở phần đuôi." }
                        ],
                        counterExamples: [
                            { sentence: "Let's clean the room, don't we?", correction: "Let's clean the room, shall we?", rule: "Mệnh đề rủ rê 'Let's' bắt buộc phải dùng câu hỏi đuôi 'shall we?'." },
                            { sentence: "I am very smart, am not I?", correction: "I am very smart, aren't I?", rule: "Trong câu hỏi đuôi học thuật, 'I am' phải đi kèm đuôi đặc biệt 'aren't I?'." },
                            { sentence: "She never eats meat, doesn't she?", correction: "She never eats meat, does she?", rule: "Vì có từ phủ định 'never', mệnh đề chính mang nghĩa phủ định ➔ Phần đuôi phải ở dạng khẳng định 'does she'." }
                        ],
                        commonMistakes: [
                            { title: "Nhầm lẫn đuôi của 'Let's'", detail: "Nhầm cấu trúc 'Let's go, won't we?' hoặc 'don't we?'.", fix: "Nhớ câu thần chú phòng thi: Thấy LET'S đứng đầu câu ➔ chọn ngay đuôi SHALL WE." },
                            { title: "Nhầm lẫn câu chứa từ bán phủ định", detail: "Nhầm lẫn câu chứa never, seldom, hardly, rarely, barely là câu khẳng định và dùng đuôi phủ định.", fix: "Các từ này mang ý phủ định ➔ Phần đuôi bắt buộc phải dùng thể khẳng định." },
                            { title: "Dùng sai đại từ cho vật/người bất định", detail: "Dùng 'it' cho 'everything' nhưng lại dùng 'it' cho cả 'everyone' (ví dụ: everyone is happy, isn't it? - sai!).", fix: "Đại từ bất định chỉ vật (everything, something) ➔ đổi thành 'it'. Đại từ bất định chỉ người (everyone, someone, nobody) ➔ đổi thành 'they' ở phần đuôi." }
                        ]
                    }
                ]
            },
            practiceQuestions: []
        }
    ]
};
"""

# Read the file
with open(db_path, 'r') as f:
    lines = f.readlines()

# Find start and end indices
start_idx = -1
end_idx = -1

for idx, line in enumerate(lines):
    if 'grammarTimeline: [' in line:
        start_idx = idx
    if '// Support dynamic questions getter' in line:
        end_idx = idx
        break

if start_idx != -1 and end_idx != -1:
    # We will slice lines and inject the new array
    before = "".join(lines[:start_idx])
    after = "".join(lines[end_idx:])
    
    # Write back
    with open(db_path, 'w') as f:
        f.write(before + new_timeline_js + "\n\n" + after)
    print("SUCCESS")
else:
    print("ERROR: COULD NOT FIND TIMELINE SECTION")
