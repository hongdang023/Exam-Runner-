import os

app_js_path = '/Users/danghong/Documents/Exam Runners/website/js/app.js'

with open(app_js_path, 'r') as f:
    lines = f.readlines()

def get_chunk(start_line, end_line):
    return "".join(lines[start_line-1:end_line])

chunk1 = get_chunk(3674, 3752)
chunk2 = get_chunk(3775, 3833)
chunk3 = get_chunk(3865, 4118)
chunk4 = get_chunk(4119, 4141)

replacement1 = """function getSubTopicsHtml(node, chIdx) {
    let html = '<div class="sub-topics-list">';
    
    html += `
        <div class="sub-topic-row">
            <div class="sub-topic-row-left">
                <span class="sub-topic-row-number">${chIdx}.0</span>
                <div class="sub-topic-row-info">
                    <div class="sub-topic-row-title">Overview (Tổng quan)</div>
                    <div class="sub-topic-row-tagline">Tóm tắt và giới thiệu về ${node.title}</div>
                </div>
            </div>
            <div class="sub-topic-row-right">
                <button class="sub-topic-cta-btn" onclick="window.openGrammarLesson('${node.id}', 'overview')">
                    HỌC NGAY 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    `;

    const addSubTopicRow = (idx, title, desc, codeSnippet, subTopicId) => {
        let codeHtml = codeSnippet ? `<span class="sub-topic-row-code">${codeSnippet}</span>` : '';
        html += `
            <div class="sub-topic-row">
                <div class="sub-topic-row-left">
                    <span class="sub-topic-row-number">${chIdx}.${idx + 1}</span>
                    <div class="sub-topic-row-info">
                        <div class="sub-topic-row-title" style="display:flex; align-items:center; gap:8px;">
                            ${title}
                            ${codeHtml}
                        </div>
                        ${desc ? `<div class="sub-topic-row-tagline">${desc}</div>` : ''}
                    </div>
                </div>
                <div class="sub-topic-row-right">
                    <button class="sub-topic-cta-btn" onclick="window.openGrammarLesson('${node.id}', ${idx})">
                        HỌC NGAY 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    };

    if (node.id === 'tense') {
        const states = node.visualConfig.timeStates || [];
        states.forEach((state, idx) => {
            addSubTopicRow(idx, state.name, 'Cách dùng & Dấu hiệu nhận biết', state.formula, idx);
        });
    } else if (node.id === 'passive') {
        const steps = node.visualConfig.passiveSteps || [];
        steps.forEach((step, idx) => {
            addSubTopicRow(idx, step.title, step.text, '', idx);
        });
    } else if (node.visualConfig && node.visualConfig.types) {
        const types = node.visualConfig.types;
        types.forEach((type, idx) => {
            const titleText = type.title || type.pronoun || \`Cấu trúc \${idx + 1}\`;
            const descText = type.desc || type.role || '';
            const formulaText = type.formula || '';
            addSubTopicRow(idx, titleText, descText, formulaText, idx);
        });
    } else {
        html += `<div class="sub-topic-item" style="color: var(--text-tertiary); font-style: italic; padding: 12px 16px;">Đang cập nhật nội dung chi tiết...</div>`;
    }
    
    html += '</div>';
    return html;
}
"""

replacement2 = """        cardsHtml += `
            <div class="grammar-chapter-card open ${statusVal === 'completed' ? 'completed' : ''}" id="chapter-card-${node.id}">
                <div class="chapter-header" onclick="window.toggleChapter('${node.id}')">
                    <div class="chapter-title-area">
                        <span class="chapter-tag">CHAPTER ${chIdx}</span>
                        <h4 class="chapter-title">${node.title}</h4>
                        <p class="chapter-desc">${node.desc}</p>
                    </div>
                    <div class="chapter-meta-area">
                        <div class="chapter-mastery-badge">
                            <div class="mastery-circle-wrapper tiny">
                                <svg class="mastery-circle-svg" viewBox="0 0 44 44">
                                    <circle class="mastery-circle-bg" cx="22" cy="22" r="20"></circle>
                                    <circle class="mastery-circle-progress" cx="22" cy="22" r="20" style="stroke-dashoffset: ${126 - (126 * masteryVal) / 100}; stroke: ${statusVal === 'completed' ? 'var(--color-validation-light)' : 'var(--color-interactive)'};"></circle>
                                </svg>
                                <span class="mastery-percent-text">${masteryVal}%</span>
                            </div>
                        </div>
                        <span class="modal-badge warning" style="${statusBadgeStyle} margin-right: 12px; height: fit-content;">
                            ${statusBadgeText}
                        </span>
                        <button class="chapter-toggle-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="chapter-body">
                    <div class="chapter-body-inner">
                        ${subTopicsHtml}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="animate-zoom">
            <div class="glass-card" style="margin-bottom:24px; background:linear-gradient(135deg, rgba(255, 111, 0, 0.08) 0%, rgba(12, 11, 10, 0.1) 100%);">
                <h3 style="font-family: var(--font-heading);">Phòng Thí Nghiệm Ngữ Pháp Tương Tác (Interactive Grammar Lab)</h3>
                <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">Chinh phục 10 chuyên đề ngữ pháp trọng tâm thi vào lớp 10 qua mô hình lý thuyết trực quan và hệ thống luyện tập 3 cấp độ Sandbox đạt chuẩn DAC.</p>
            </div>
            
            <div class="grammar-accordion-container">
                ${cardsHtml}
            </div>
        </div>
    `;

    setTimeout(() => {
        document.querySelectorAll('.grammar-chapter-card.open .chapter-body').forEach(body => {
            body.style.maxHeight = body.scrollHeight + "px";
        });
    }, 10);
}
"""

replacement3 = """window.openGrammarLesson = function(topicId, subTopicIdx) {
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === topicId);
    if (!topic) return;

    grammarDrawerState = {
        topicId: topicId,
        subTopicIdx: subTopicIdx,
        activeTab: 'theory',
        currentQuestionIndex: 0,
        selectedOption: null,
        selectedWords: [],
        availableWords: [],
        hasChecked: false,
        isCorrect: false
    };

    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = `<div id="grammar-lesson-container"></div>`;
    
    renderGrammarLesson();
};

window.closeGrammarLesson = function() {
    navigateTab('grammar'); // Go back to grammar shelf
};

window.switchLessonSubTopic = function(idx) {
    grammarDrawerState.subTopicIdx = idx;
    grammarDrawerState.activeTab = 'theory'; // reset to theory
    renderGrammarLesson();
};

window.switchLessonTab = function(tabId) {
    grammarDrawerState.activeTab = tabId;
    renderGrammarLesson();
};

function renderGrammarLesson() {
    const container = document.getElementById('grammar-lesson-container');
    if (!container) return;

    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === grammarDrawerState.topicId);
    if (!topic) return;

    const subTopicIdx = grammarDrawerState.subTopicIdx;
    
    // Build selector bar
    let selectorHtml = '';
    
    // Overview pill
    const isOverviewActive = subTopicIdx === 'overview';
    selectorHtml += `
        <div class="lesson-subtopic-pill overview-pill ${isOverviewActive ? 'active' : ''}" onclick="window.switchLessonSubTopic('overview')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Overview
        </div>
    `;

    let subTopics = [];
    if (topic.id === 'tense') subTopics = topic.visualConfig.timeStates || [];
    else if (topic.id === 'passive') subTopics = topic.visualConfig.passiveSteps || [];
    else if (topic.visualConfig && topic.visualConfig.types) subTopics = topic.visualConfig.types || [];

    subTopics.forEach((st, idx) => {
        const title = st.title || st.name || st.pronoun || `Mục ${idx + 1}`;
        const isActive = subTopicIdx === idx;
        selectorHtml += `
            <div class="lesson-subtopic-pill ${isActive ? 'active' : ''}" onclick="window.switchLessonSubTopic(${idx})">
                <span style="opacity: ${isActive ? 1 : 0.7};">${idx + 1}.</span> ${title}
            </div>
        `;
    });

    const masteryVal = AppState.grammarMastery[topic.id] !== undefined ? AppState.grammarMastery[topic.id] : (topic.mastery || 0);

    container.innerHTML = `
        <div class="grammar-lesson-view">
            <div class="lesson-header-row">
                <div style="display:flex; align-items:center; gap:16px;">
                    <button class="lesson-back-btn" onclick="window.closeGrammarLesson()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Trở lại
                    </button>
                    <div class="lesson-header-title-wrapper">
                        <span class="lesson-header-subtitle">GRAMMAR INTERACTIVE LAB</span>
                        <h2 class="lesson-header-title">${topic.title}</h2>
                    </div>
                </div>
                <div class="lesson-header-progress">
                    <span class="lesson-mastery-label">Mastery: ${masteryVal}%</span>
                    <div class="lesson-mastery-bar-bg">
                        <div class="lesson-mastery-bar-fill" style="width: ${masteryVal}%"></div>
                    </div>
                </div>
            </div>

            <div class="lesson-subtopic-selector-bar">
                ${selectorHtml}
            </div>

            <div class="lesson-body-card">
                <div class="lesson-tabs-container">
                    <button class="lesson-tab-btn ${grammarDrawerState.activeTab === 'theory' ? 'active' : ''}" onclick="window.switchLessonTab('theory')">Lý thuyết 📖</button>
                    <button class="lesson-tab-btn ${grammarDrawerState.activeTab === 'practice' ? 'active' : ''}" onclick="window.switchLessonTab('practice')">Luyện tập 🧩</button>
                </div>
                <div id="lesson-tab-pane"></div>
            </div>
        </div>
    `;

    if (grammarDrawerState.activeTab === 'theory') {
        renderLessonTheoryTab();
    } else {
        renderLessonPracticeTab();
    }
}

window.renderLessonTheoryTab = function() {
    const pane = document.getElementById('lesson-tab-pane');
    if (!pane) return;
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === grammarDrawerState.topicId);
    if (!topic) return;

    if (grammarDrawerState.subTopicIdx === 'overview') {
        pane.innerHTML = `
            <div class="focused-theory-card">
                <div class="focused-title-row">
                    <h4>Tổng quan: ${topic.title}</h4>
                    <span class="focused-tag">Overview</span>
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                    ${topic.desc || 'Không có mô tả tổng quan.'}
                </div>
                
                <div class="focused-tips-grid">
                    <div class="focused-tip-card tip">
                        <div class="focused-tip-icon">💡</div>
                        <div>
                            <div class="focused-tip-title">Tại sao cần học phần này?</div>
                            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">Đây là cấu trúc nền tảng và thường xuyên xuất hiện trong các bài thi vào lớp 10, đặc biệt là các phần viết lại câu và chia động từ.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const subTopicIdx = parseInt(grammarDrawerState.subTopicIdx);
    let subTopicData = null;
    let extraHtml = '';

    if (topic.id === 'tense') {
        subTopicData = topic.visualConfig.timeStates[subTopicIdx];
        if (subTopicData) {
            extraHtml = `
                <div class="focused-theory-card">
                    <div class="focused-title-row">
                        <h4>${subTopicData.name}</h4>
                    </div>
                    <div class="focused-formula-block">${subTopicData.formula}</div>
                    
                    <div class="focused-section">
                        <div class="focused-section-title">Dấu hiệu nhận biết</div>
                        <div class="focused-signals-box">
                            ${subTopicData.signals.split(',').map(s => `<span class="focused-signal-pill">${s.trim()}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="focused-section">
                        <div class="focused-section-title">Ví dụ minh họa</div>
                        <div class="focused-example-box">${subTopicData.example}</div>
                    </div>
                </div>
            `;
        }
    } else if (topic.id === 'passive') {
        subTopicData = topic.visualConfig.passiveSteps[subTopicIdx];
        if (subTopicData) {
            extraHtml = `
                <div class="focused-theory-card">
                    <div class="focused-title-row">
                        <h4>${subTopicData.title}</h4>
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                        ${subTopicData.text}
                    </div>
                </div>
            `;
        }
    } else if (topic.visualConfig && topic.visualConfig.types) {
        subTopicData = topic.visualConfig.types[subTopicIdx];
        if (subTopicData) {
            const titleText = subTopicData.title || subTopicData.pronoun || `Mục ${subTopicIdx + 1}`;
            const descText = subTopicData.desc || subTopicData.role || '';
            const formulaText = subTopicData.formula || '';
            const exampleText = subTopicData.example || '';
            
            extraHtml = `
                <div class="focused-theory-card">
                    <div class="focused-title-row">
                        <h4>${titleText}</h4>
                    </div>
                    ${descText ? `<div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${descText}</div>` : ''}
                    ${formulaText ? `<div class="focused-formula-block">${formulaText}</div>` : ''}
                    
                    ${exampleText ? `
                    <div class="focused-section">
                        <div class="focused-section-title">Ví dụ minh họa</div>
                        <div class="focused-example-box">${exampleText}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
    }

    if (!extraHtml) {
        extraHtml = `<div style="color: var(--text-tertiary); font-style: italic;">Đang cập nhật nội dung chi tiết cho tiểu mục này...</div>`;
    }

    pane.innerHTML = extraHtml;
};
"""

replacement4 = """window.renderLessonPracticeTab = function() {
    const pane = document.getElementById('lesson-tab-pane');
    if (!pane) return;
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === grammarDrawerState.topicId);
    if (!topic || !topic.practiceQuestions) return;
    const qIndex = grammarDrawerState.currentQuestionIndex;
    const totalQs = topic.practiceQuestions.length;
    
    if (qIndex >= totalQs) {
        pane.innerHTML = `
            <div class="glass-card animate-zoom" style="text-align:center; padding:32px 24px; border-color:var(--color-validation-light);">
                <div style="font-size:48px; margin-bottom:16px;">🏆</div>
                <h3 style="font-family:var(--font-heading); color:var(--color-validation-light); margin-bottom:8px;">Chuyên đề đã được chinh phục!</h3>
                <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px;">Bạn đã hoàn thành xuất sắc toàn bộ thử thách Sandbox của chuyên đề này, nắm chắc các cạm bẫy thi đấu và mở khóa kiến thức tiếp theo.</p>
                <div class="drawer-mastery-progress" style="margin-bottom:24px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size:12px; font-weight:800; color:var(--color-validation-light);">Mastery: 100%</span>
                    <div class="mastery-progress-bar-bg" style="width:70%;">
                        <div class="mastery-progress-bar-fill" style="width: 100%; background: var(--color-validation-light);"></div>
                    </div>
                </div>
                <button class="btn btn-interactive" style="width:100%; padding:12px;" onclick="closeGrammarLesson()">Đóng Lesson & Trở lại Timeline</button>
            </div>`;
        return;
    }
"""

new_content = "".join(lines[:3673]) + replacement1 + "".join(lines[3752:3774]) + replacement2 + "".join(lines[3833:3864]) + replacement3 + replacement4 + "".join(lines[4141:])

with open(app_js_path, 'w') as f:
    f.write(new_content)

print("SUCCESS")
