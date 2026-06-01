/* ==========================================================================
   EXAM RUNNERS - ENGINE & ROUTER JS
   Features: Multi-Role Router, Interactive Skill Map SVG, Distraction-Free
             Practice Portal, Active Recall Mini-Puzzle & Spaced Flashcards.
   ========================================================================== */

// --- GLOBAL DATABASE SEED is loaded dynamically from js/exams_db.js ---



// --- CORE APP STATE ---
const AppState = {
    currentRole: 'student', // student | parent | admin
    currentTab: 'dashboard',
    streak: 0,
    xp: 0,
    activeExam: null, // exam object when playing
    examAnswers: {}, // answers mapping: questionId -> option
    examFlags: {}, // flags: questionId -> boolean
    examTimerInterval: null,
    examSecondsRemaining: 3600,
    currentExamQuestionIndex: 0,
    failedQuestionInProgress: null, // For active recall trigger

    // Flashcards desk state
    flashcards: [],
    topics: [],
    activeTopicId: null,
    flashcardQueue: [],
    currentFlashcardIndex: 0,
    matchTiles: [],
    selectedTile: null,
    matchedCount: 0,
    
    // Antigravity advanced upgrades
    completedExams: {}, // mapping: examId -> percentage Score
    weaknesses: [], // list of question IDs student answered wrong historically
    activityLog: [], // list of historical activities: { type, title, score, timestamp, durationMinutes, status }
    selectedFlashcardMode: null, // null | standard | spelling | rapid | gravity
    examDate: '', // Target Date for high-school exam
    scoreGoal: '8.0', // Target score (7.0, 8.0, 9.0, 10)
    weeklyCommitment: '6', // Studying commitment hours per week
    parentPin: '', // 4-digit PIN for Parent role
    tutorPin: '', // 4-digit PIN for Tutor/Admin role
    
    // Antigravity grammar state
    grammarAccuracy: 0,
    grammarMastery: { tense: 0, passive: 0, conditional: 0, comparison: 0, relative: 0, gerund: 0, connectors: 0, reported_speech: 0, word_form: 0, phrasal_verb: 0 },
    grammarStatus: { tense: 'active', passive: 'locked', conditional: 'locked', comparison: 'locked', relative: 'locked', gerund: 'locked', connectors: 'locked', reported_speech: 'locked', word_form: 'locked', phrasal_verb: 'locked' }
};

// --- INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    loadAppStateFromLocalStorage();
    seedActivityLogIfEmpty();
    initRoleSelector();
    initPinSecurity(); // Initialize PIN security events
    initSidebarToggle(); // Initialize collapsible sidebar
    renderNavigation();
    initOnboarding();
    initProfileEdit();
    renderSidebarProfile();
    navigateTab('dashboard'); // Default landing page
    
    // Quick streak and counts update
    document.getElementById('streak-count').innerText = `${AppState.streak} ngày`;
    saveAppStateToLocalStorage();
});

// --- SIDEBAR PROFILE & EDIT ---
function renderSidebarProfile() {
    const nameEl = document.getElementById('sidebar-user-name');
    const initialEl = document.getElementById('sidebar-avatar-initial');
    if (!nameEl || !initialEl) return;

    if (AppState.studentName) {
        nameEl.innerText = AppState.studentName;
        initialEl.innerText = AppState.studentName.charAt(0).toUpperCase();
    } else {
        nameEl.innerText = "Học viên mới";
        initialEl.innerText = "?";
    }
}

function initProfileEdit() {
    const profileBtn = document.getElementById('sidebar-profile-btn');
    const profileModal = document.getElementById('profile-edit-modal');
    const saveBtn = document.getElementById('prof-save-btn');
    if (!profileBtn || !profileModal || !saveBtn) return;

    profileBtn.addEventListener('click', () => {
        // Pre-fill
        document.getElementById('prof-student-name').value = AppState.studentName || '';
        document.getElementById('prof-parent-name').value = AppState.parentName || '';
        document.getElementById('prof-school').value = AppState.school || '';
        document.getElementById('prof-class').value = AppState.className || '';
        document.getElementById('prof-exam-date').value = AppState.examDate || '';
        if (AppState.scoreGoal) document.getElementById('prof-score-goal').value = AppState.scoreGoal;
        if (AppState.weeklyCommitment) document.getElementById('prof-commitment').value = AppState.weeklyCommitment;
        
        profileModal.classList.add('open');
    });

    saveBtn.addEventListener('click', () => {
        const sName = document.getElementById('prof-student-name').value.trim();
        const pName = document.getElementById('prof-parent-name').value.trim();
        
        if (!sName || !pName) {
            alert('Vui lòng nhập Tên của Học sinh và Phụ huynh!');
            return;
        }

        AppState.studentName = sName;
        AppState.parentName = pName;
        AppState.school = document.getElementById('prof-school').value.trim();
        AppState.className = document.getElementById('prof-class').value.trim();
        AppState.examDate = document.getElementById('prof-exam-date').value;
        AppState.scoreGoal = document.getElementById('prof-score-goal').value;
        AppState.weeklyCommitment = document.getElementById('prof-commitment').value;

        saveAppStateToLocalStorage();
        renderSidebarProfile();
        
        // Refresh dashboard if active
        if (AppState.currentTab === 'dashboard') {
            const viewport = document.getElementById('app-viewport');
            if (AppState.currentRole === 'student') renderDashboard(viewport);
            if (AppState.currentRole === 'parent') renderParentDashboard(viewport);
            
            const pageSubtitle = document.getElementById('page-subtitle');
            if (pageSubtitle) {
                if (AppState.currentRole === 'parent') {
                    pageSubtitle.innerText = `Kính gửi Phụ huynh ${AppState.parentName || ''}. Báo cáo tóm tắt tiến độ tự học của con.`;
                } else {
                    pageSubtitle.innerText = `Chào mừng ${AppState.studentName} quay lại hành trình rèn luyện hôm nay!`;
                }
            }
        }
        
        profileModal.classList.remove('open');
        triggerConfetti(); // Little reward for updating profile
    });
}

// --- SIDEBAR TOGGLE (Collapsible Navbar) ---
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (!toggleBtn || !sidebar) return;

    // Restore state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (savedCollapsed) {
        sidebar.classList.add('collapsed');
    }

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        // Re-init lucide icons after toggle (icons may need refresh)
        lucide.createIcons();
    });
}


// --- ROLE SELECTOR INTERACTION ---
function initRoleSelector() {
    const trigger = document.getElementById('active-role-btn');
    const area = document.getElementById('role-dropdown-area');
    const menu = document.getElementById('role-dropdown-menu');
    const items = document.querySelectorAll('.dropdown-item');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        area.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        area.classList.remove('open');
    });

    items.forEach(item => {
        item.addEventListener('click', () => {
            const selectedRole = item.getAttribute('data-role');
            
            // Intercept role changes for parent or admin roles
            if (selectedRole === 'parent' || selectedRole === 'admin') {
                authenticateRoleSwitch(selectedRole, item, trigger, items);
            } else {
                // For student role, switch immediately
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                AppState.currentRole = selectedRole;

                // Update Trigger button text and icon
                const roleIcon = item.querySelector('.role-icon').innerText;
                const roleTitle = item.querySelector('.role-title').innerText;
                trigger.querySelector('.role-icon').innerText = roleIcon;
                trigger.querySelector('.role-name').innerText = roleTitle;

                // Re-render nav and reset view
                renderNavigation();
                navigateTab('dashboard');

                // Apply quick visual effect
                trigger.classList.add('animate-zoom');
                setTimeout(() => trigger.classList.remove('animate-zoom'), 300);
                
                saveAppStateToLocalStorage();
            }
        });
    });
}

// --- PIN SECURITY & ROLE SWITCH AUTHENTICATION ENGINE ---
let pendingRoleSwitch = null;

function initPinSecurity() {
    // Validation modal submit button click
    const valSubmitBtn = document.getElementById('pin-validation-submit');
    if (valSubmitBtn) {
        valSubmitBtn.addEventListener('click', submitPinValidation);
    }

    // Validation modal cancel buttons click
    const valCloseBtn = document.getElementById('pin-validation-close-btn');
    if (valCloseBtn) {
        valCloseBtn.addEventListener('click', cancelPinAuthentication);
    }
    const valCancelBtn = document.getElementById('pin-validation-cancel');
    if (valCancelBtn) {
        valCancelBtn.addEventListener('click', cancelPinAuthentication);
    }

    // Setup modal submit button click
    const setupSubmitBtn = document.getElementById('pin-setup-submit');
    if (setupSubmitBtn) {
        setupSubmitBtn.addEventListener('click', submitPinSetup);
    }

    // Setup modal cancel buttons click
    const setupCloseBtn = document.getElementById('pin-setup-close-btn');
    if (setupCloseBtn) {
        setupCloseBtn.addEventListener('click', cancelPinAuthentication);
    }
    const setupCancelBtn = document.getElementById('pin-setup-cancel');
    if (setupCancelBtn) {
        setupCancelBtn.addEventListener('click', cancelPinAuthentication);
    }

    // Focus autolinking for validation PIN digits
    const pinInputs = document.querySelectorAll('#pin-inputs-wrapper .pin-digit');
    pinInputs.forEach((input, index) => {
        // Only allow digits
        input.addEventListener('input', (e) => {
            input.value = input.value.replace(/[^0-9]/g, '');
            
            if (input.value.length === 1) {
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                } else {
                    submitPinValidation();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (input.value.length === 0 && index > 0) {
                    pinInputs[index - 1].focus();
                    pinInputs[index - 1].value = '';
                } else {
                    input.value = '';
                }
            }
        });
    });

    // Handle setup-pin inputs restriction (only allow digits, max 4)
    ['setup-pin-val', 'setup-pin-confirm'].forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.addEventListener('input', () => {
                inputEl.value = inputEl.value.replace(/[^0-9]/g, '');
            });
        }
    });
}

function authenticateRoleSwitch(role, targetItem, triggerButton, allItems) {
    const isParent = role === 'parent';
    const currentPin = isParent ? AppState.parentPin : AppState.tutorPin;

    pendingRoleSwitch = {
        role,
        targetItem,
        triggerButton,
        allItems
    };

    if (!currentPin) {
        // Flow A: Legacy setup (no PIN set yet)
        openPinSetupModal(role);
    } else {
        // Flow B: Validation (PIN already configured)
        openPinValidationModal(role, currentPin);
    }
}

function openPinSetupModal(role) {
    const modal = document.getElementById('pin-setup-modal');
    if (!modal) return;

    const titleEl = document.getElementById('pin-setup-title');
    const descEl = document.getElementById('pin-setup-desc');
    const errorEl = document.getElementById('pin-setup-error');
    const valInput = document.getElementById('setup-pin-val');
    const confirmInput = document.getElementById('setup-pin-confirm');

    titleEl.innerText = `🔑 Thiết Lập Mã PIN ${role === 'parent' ? 'Phụ Huynh' : 'Gia Sư'}`;
    descEl.innerText = `Tài khoản của bạn chưa được thiết lập mã PIN bảo mật cho vai trò ${role === 'parent' ? 'Phụ huynh' : 'Gia sư / Quản trị'}. Vui lòng tạo mã PIN 4 chữ số để bảo vệ quyền truy cập.`;
    
    valInput.value = '';
    confirmInput.value = '';
    errorEl.innerText = '';

    modal.classList.add('open');
    setTimeout(() => {
        valInput.focus();
    }, 100);
}

function openPinValidationModal(role, correctPin) {
    const modal = document.getElementById('pin-validation-modal');
    if (!modal) return;

    const titleEl = document.getElementById('pin-validation-title');
    const descEl = document.getElementById('pin-validation-desc');
    const errorEl = document.getElementById('pin-validation-error');
    const pinInputs = document.querySelectorAll('#pin-inputs-wrapper .pin-digit');

    titleEl.innerText = `🔑 Xác Thực PIN ${role === 'parent' ? 'Phụ Huynh' : 'Gia Sư'}`;
    descEl.innerText = `Vui lòng nhập mã PIN 4 chữ số của ${role === 'parent' ? 'Phụ huynh' : 'Gia sư / Quản trị'} để truy cập.`;
    
    errorEl.innerText = '';
    pinInputs.forEach(input => {
        input.value = '';
        input.classList.remove('error-state');
    });

    modal.classList.add('open');
    setTimeout(() => {
        document.getElementById('pin-d1').focus();
    }, 100);
}

function submitPinValidation() {
    if (!pendingRoleSwitch) return;

    const pinInputs = document.querySelectorAll('#pin-inputs-wrapper .pin-digit');
    let typedPin = '';
    pinInputs.forEach(input => {
        typedPin += input.value;
    });

    const isParent = pendingRoleSwitch.role === 'parent';
    const correctPin = isParent ? AppState.parentPin : AppState.tutorPin;
    const errorEl = document.getElementById('pin-validation-error');
    const wrapper = document.getElementById('pin-inputs-wrapper');

    if (typedPin === correctPin) {
        // SUCCESS!
        playSuccessSound();
        triggerConfetti();
        
        // Close modal
        document.getElementById('pin-validation-modal').classList.remove('open');

        // Apply transition
        executePendingRoleSwitch();
    } else {
        // FAILURE!
        playFailSound();
        
        // Shake animation
        wrapper.classList.remove('shake-error');
        void wrapper.offsetWidth; // Trigger reflow to restart animation
        wrapper.classList.add('shake-error');

        // Red borders
        pinInputs.forEach(input => {
            input.classList.add('error-state');
            input.value = '';
        });

        errorEl.innerText = 'Mã PIN không chính xác. Vui lòng thử lại!';

        // Refocus first field after a short delay
        setTimeout(() => {
            document.getElementById('pin-d1').focus();
            wrapper.classList.remove('shake-error');
        }, 600);
    }
}

function submitPinSetup() {
    if (!pendingRoleSwitch) return;

    const valInput = document.getElementById('setup-pin-val');
    const confirmInput = document.getElementById('setup-pin-confirm');
    const errorEl = document.getElementById('pin-setup-error');

    const pinVal = valInput.value;
    const confirmVal = confirmInput.value;
    const pinRegex = /^\d{4}$/;

    if (!pinRegex.test(pinVal)) {
        playFailSound();
        errorEl.innerText = 'Mã PIN mới phải chứa đúng 4 chữ số!';
        valInput.focus();
        return;
    }

    if (pinVal !== confirmVal) {
        playFailSound();
        errorEl.innerText = 'Xác nhận mã PIN không trùng khớp!';
        confirmInput.focus();
        return;
    }

    // Save PIN
    const isParent = pendingRoleSwitch.role === 'parent';
    if (isParent) {
        AppState.parentPin = pinVal;
    } else {
        AppState.tutorPin = pinVal;
    }

    saveAppStateToLocalStorage();
    playSuccessSound();
    triggerConfetti();

    // Close modal
    document.getElementById('pin-setup-modal').classList.remove('open');

    // Apply transition
    executePendingRoleSwitch();
}

function executePendingRoleSwitch() {
    if (!pendingRoleSwitch) return;

    const { role, targetItem, triggerButton, allItems } = pendingRoleSwitch;

    // Standard logic from original click listener
    allItems.forEach(i => i.classList.remove('active'));
    targetItem.classList.add('active');
    
    AppState.currentRole = role;

    // Update Trigger button text and icon
    const roleIcon = targetItem.querySelector('.role-icon').innerText;
    const roleTitle = targetItem.querySelector('.role-title').innerText;
    triggerButton.querySelector('.role-icon').innerText = roleIcon;
    triggerButton.querySelector('.role-name').innerText = roleTitle;

    // Re-render nav and reset view
    renderNavigation();
    
    // Auto navigate to the first tab of the new role
    if (role === 'student') navigateTab('dashboard');
    else if (role === 'parent') navigateTab('progress');
    else if (role === 'admin') navigateTab('vault');

    // Apply quick visual effect
    triggerButton.classList.add('animate-zoom');
    setTimeout(() => triggerButton.classList.remove('animate-zoom'), 300);

    saveAppStateToLocalStorage();

    // Reset pending role switch state
    pendingRoleSwitch = null;
}

function cancelPinAuthentication() {
    pendingRoleSwitch = null;
    document.getElementById('pin-validation-modal').classList.remove('open');
    document.getElementById('pin-setup-modal').classList.remove('open');
}

// --- DYNAMIC NAVIGATION GENERATION ---
function renderNavigation() {
    const nav = document.getElementById('sidebar-navigation');
    nav.innerHTML = ''; // Clear existing

    let navStructure = [];

    if (AppState.currentRole === 'student') {
        navStructure = [
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', subtitle: 'Nhiệm vụ hôm nay' },
            { id: 'practice', label: 'Phòng Luyện Đề', icon: 'pencil-line', subtitle: 'Luyện đề thi thử' },
            { id: 'flashcards', label: 'Flashcard Desk', icon: 'layers', subtitle: 'Ghi nhớ từ vựng' },
            { id: 'grammar', label: 'Grammar Shelf', icon: 'book-open', subtitle: 'Lý thuyết cốt lõi' },
            { id: 'skillmap', label: 'Bản Đồ Năng Lực', icon: 'map', subtitle: 'Phân tích chi tiết' }
        ];
    } else if (AppState.currentRole === 'parent') {
        navStructure = [
            { id: 'progress', label: 'Góc Phụ Huynh', icon: 'trending-up', subtitle: 'Báo cáo phụ huynh' }
        ];
    } else if (AppState.currentRole === 'admin') {
        navStructure = [
            { id: 'vault', label: 'Tutor Vault', icon: 'layout-dashboard', subtitle: 'Khám bệnh & Số hoá' },
            { id: 'roadmap', label: 'Lộ Trình', icon: 'calendar-range', subtitle: 'Phân bổ lộ trình' }
        ];
    }

    navStructure.forEach(item => {
        const link = document.createElement('a');
        link.className = `nav-link ${AppState.currentTab === item.id ? 'active' : ''}`;
        link.href = `#${item.id}`;
        link.innerHTML = `
            <i data-lucide="${item.icon}"></i>
            <div class="nav-link-label" style="display: flex; flex-direction: column; line-height: 1.2;">
                <span>${item.label}</span>
                <span class="nav-link-subtitle">${item.subtitle}</span>
            </div>
        `;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTab(item.id);
        });

        nav.appendChild(link);
    });

    // Re-initialize Lucide SVGs
    lucide.createIcons();
}

// --- CORE ROUTING SYSTEM ---
function navigateTab(tabId) {
    AppState.currentTab = tabId;
    
    // Update active nav-link classes
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${tabId}`) {
            link.classList.add('active');
        }
    });

    const viewport = document.getElementById('app-viewport');
    
    // Update header labels
    const pageTitle = document.getElementById('current-page-title');
    const pageSubtitle = document.getElementById('current-page-subtitle');

    // Route Rendering Switchboard
    switch(tabId) {
        case 'dashboard':
            pageTitle.innerText = "Dashboard";
            const greetingName = AppState.studentName ? AppState.studentName : "bạn";
            pageSubtitle.innerText = `Chào mừng ${greetingName} quay lại hành trình rèn luyện hôm nay!`;
            renderDashboard(viewport);
            break;
        case 'skillmap':
            pageTitle.innerText = "Bản Đồ Năng Lực Chi Tiết";
            pageSubtitle.innerText = "Phân tích chi tiết và hành động rèn luyện đề xuất";
            renderSkillMap(viewport);
            break;
        case 'practice':
            pageTitle.innerText = "Phòng Luyện Đề";
            pageSubtitle.innerText = "Luyện đề thi thử trực tuyến đúng chuẩn cấu trúc Sở GD&ĐT.";
            renderPracticeRoom(viewport);
            break;
        case 'flashcards':
            pageTitle.innerText = "Flashcard Desk";
            pageSubtitle.innerText = "Luyện từ vựng theo phương pháp lặp lại ngắt quãng Spaced Repetition.";
            renderFlashcards(viewport);
            break;
        case 'grammar':
            pageTitle.innerText = "Grammar Shelf";
            pageSubtitle.innerText = "Hệ thống kiến thức ngữ pháp trọng tâm thi vào lớp 10.";
            renderGrammarShelf(viewport);
            break;
        case 'progress':
            pageTitle.innerText = "Góc Phụ Huynh";
            const parentNameText = AppState.parentName ? `Kính gửi Phụ huynh ${AppState.parentName}. ` : "";
            pageSubtitle.innerText = `${parentNameText}Báo cáo tóm tắt tiến độ tự học của ${AppState.studentName || 'con'}.`;
            renderParentHub(viewport);
            break;
        case 'vault':
            pageTitle.innerText = "Tutor Vault";
            pageSubtitle.innerText = "Chẩn đoán sức khỏe ma trận kiến thức, kê đơn phụ đạo và số hóa đề thi tự động.";
            renderAdminVault(viewport);
            break;
        case 'roadmap':
            pageTitle.innerText = "Lộ Trình";
            pageSubtitle.innerText = "Phân bổ lộ trình luyện đề dựa trên thời hạn thi.";
            renderAdminRoadmap(viewport);
            break;
        default:
            viewport.innerHTML = `<div class="glass-card">Tính năng đang xây dựng...</div>`;
    }

    lucide.createIcons();
}

// --------------------------------------------------------------------------
// 10. PAGES RENDER ENGINES (HTML GENERATION & COMPONENT EVENT BINDINGS)
// --------------------------------------------------------------------------

// --- A. STUDENT DASHBOARD PAGE ---
function renderDashboard(container) {
    const weaknessCount = AppState.weaknesses ? AppState.weaknesses.length : 0;
    const topTasks = [];

    // Task 1: Exam / Adaptive Practice
    if (weaknessCount > 0) {
        topTasks.push({
            id: 'task-adaptive',
            type: 'adaptive',
            icon: '🎯',
            tag: 'Luyện Đề · Vá Lỗi Sai',
            title: 'Khắc Phục Điểm Yếu',
            desc: `Có ${weaknessCount} câu hỏi sai đang chờ bạn ôn luyện lại. Xử lý ngay để tránh lặp lại lỗi sai.`,
            btnText: 'Luyện Ngay',
            accentColor: 'var(--color-danger)',
            iconColor: 'var(--color-danger)'
        });
    } else {
        const nextExam = EXAM_RUNNERS_DB.exams ? EXAM_RUNNERS_DB.exams.find(e =>
            AppState.completedExams[e.id] === undefined &&
            (e.id === 1 || (AppState.completedExams[e.id - 1] !== undefined && AppState.completedExams[e.id - 1] >= 80))
        ) : null;
        if (nextExam) {
            topTasks.push({
                id: 'task-exam',
                type: 'exam',
                examId: nextExam.id,
                icon: '📝',
                tag: 'Luyện Đề · Đề Mới',
                title: nextExam.title,
                desc: `${nextExam.questionsCount} câu hỏi bám sát cấu trúc đề thi thật của Sở GD&ĐT.`,
                btnText: 'Bắt Đầu Thi',
                accentColor: 'var(--color-commitment)',
                iconColor: 'var(--color-commitment)'
            });
        } else {
            const completedIds = Object.keys(AppState.completedExams || {}).map(Number);
            const lastId = completedIds.length > 0 ? Math.max(...completedIds) : 1;
            topTasks.push({
                id: 'task-review',
                type: 'review',
                examId: lastId,
                icon: '🔁',
                tag: 'Luyện Đề · Ôn Tập',
                title: 'Ôn lại bài thi gần nhất',
                desc: `Đề số ${lastId} — Điểm đạt: ${AppState.completedExams[lastId] || 0}%. Duy trì phản xạ đề thi.`,
                btnText: 'Ôn Lại',
                accentColor: 'var(--color-interactive)',
                iconColor: 'var(--color-interactive)'
            });
        }
    }

    // Task 2: Flashcards (Vocabulary)
    const flashcardCount = AppState.flashcards ? AppState.flashcards.length : 0;
    const dueFlashcards = 15; // Placeholder for SR logic
    topTasks.push({
        id: 'task-vocab',
        type: 'flashcards',
        icon: '🗂️',
        tag: 'Từ Vựng · Cần Ôn Tập',
        title: 'Ôn Tập Flashcards',
        desc: `Bạn có ${dueFlashcards} từ vựng đến hạn cần ôn tập để đưa vào trí nhớ dài hạn.`,
        btnText: 'Lật Thẻ Ngay',
        accentColor: 'var(--color-discovery)',
        iconColor: 'var(--color-discovery)'
    });

    // Task 3: Grammar
    const grammarMap = {
        tense: 'Thì động từ', passive: 'Câu bị động', conditional: 'Câu điều kiện',
        comparison: 'Câu so sánh', relative: 'Mệnh đề quan hệ', gerund: 'Danh/Động từ',
        connectors: 'Từ nối', reported_speech: 'Câu gián tiếp', word_form: 'Cấu tạo từ', phrasal_verb: 'Cụm động từ'
    };
    let weakestTopic = 'tense';
    let lowestScore = 100;
    if (AppState.grammarMastery) {
        for (const [key, score] of Object.entries(AppState.grammarMastery)) {
            if (score < lowestScore) {
                lowestScore = score;
                weakestTopic = key;
            }
        }
    }
    const topicName = grammarMap[weakestTopic] || 'Thì động từ';
    topTasks.push({
        id: 'task-grammar',
        type: 'grammar',
        icon: '📚',
        tag: 'Ngữ Pháp · Cần Cải Thiện',
        title: `Củng cố: ${topicName}`,
        desc: `Mức độ thành thạo hiện tại: ${lowestScore}%. Ôn lại lý thuyết và làm bài tập chuyên đề.`,
        btnText: 'Học Ngữ Pháp',
        accentColor: 'var(--color-interactive)',
        iconColor: '#8b5cf6' 
    });

    const completedCount = Object.keys(AppState.completedExams || {}).length;
    let totalMinutes = 0;
    if (AppState.activityLog) {
        AppState.activityLog.forEach(log => {
            if (log.durationMinutes) totalMinutes += log.durationMinutes;
        });
    }
    const hoursStudied = totalMinutes > 0 ? (Math.round((totalMinutes / 60) * 10) / 10) : (Math.round((completedCount * 45 + AppState.streak * 15) / 60 * 10) / 10);

    // Calculate last 7 days streak
    const today = new Date();
    const streakDays = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    const activityMap = {};
    let maxStreak = 0;
    if (AppState.activityLog && AppState.activityLog.length > 0) {
        const dateSet = new Set();
        AppState.activityLog.forEach(log => {
            if (log.timestamp) {
                const d = new Date(log.timestamp);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                activityMap[dateStr] = true;
                
                d.setHours(0,0,0,0);
                dateSet.add(d.getTime());
            }
        });
        
        const sortedDates = Array.from(dateSet).sort((a,b) => a - b);
        let currentStreak = 1;
        maxStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const diff = sortedDates[i] - sortedDates[i-1];
            if (diff <= 86400000 + 3600000 && diff >= 86400000 - 3600000) {
                currentStreak++;
                if (currentStreak > maxStreak) maxStreak = currentStreak;
            } else {
                currentStreak = 1;
            }
        }
    }
    if (maxStreak === 0 && AppState.streak > 0) maxStreak = AppState.streak;

    // Include this week Monday -> Sunday
    const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1 = Monday, 7 = Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek + 1);

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const isToday = d.toDateString() === today.toDateString();
        const isActive = activityMap[dateStr] || false; 
        
        streakDays.push({
            label: dayNames[d.getDay()],
            isActive: isActive,
            isToday: isToday
        });
    }

    const streakHtml = streakDays.map(day => `
        <div class="streak-day-dot ${day.isActive ? 'active' : ''}">
            <span class="streak-circle">${day.isActive ? '✓' : ''}</span>
            <span class="day-initial" style="${day.isToday ? 'font-weight:900; color:var(--text-primary);' : ''}">${day.label}</span>
        </div>
    `).join('');

    const tasksHtml = topTasks.map((task, index) => `
        <div class="top-task-card" style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; transition: all 0.2s ease;">
            <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">${task.icon}</span>
                    <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${task.iconColor};">${task.tag}</span>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 16px; margin-bottom: 6px; font-weight: 800; color: var(--text-primary);">${task.title}</h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">${task.desc}</p>
            </div>
            <button class="btn btn-secondary task-cta-btn" data-id="${task.id}" data-type="${task.type}" data-exam="${task.examId || ''}" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px; ${index === 0 ? `background: ${task.accentColor}; color: #fff; border-color: ${task.accentColor}; box-shadow: 0 4px 12px rgba(230, 92, 0, 0.2);` : ''}">
                ${task.btnText} <i data-lucide="arrow-right" style="width: 14px; height: 14px; margin-left: 4px;"></i>
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="dashboard-grid-balanced animate-zoom" style="display: flex; flex-direction: column; gap: 24px;">
            <!-- S-4: Top Tasks Control Panel -->
            <div class="glass-card primary-accent" style="padding: 28px;">
                <div style="margin-bottom: 20px;">
                    <h2 style="font-family: var(--font-heading); font-size: var(--text-xl); font-weight: 900; color: var(--text-primary);">🎯 Top 3 Nhiệm Vụ Hôm Nay</h2>
                    <p style="font-size: var(--text-sm); color: var(--text-secondary);">Các hoạt động được gợi ý riêng cho bạn dựa trên lịch sử học tập gần nhất.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${tasksHtml}
                </div>
            </div>

            <!-- Bottom Row: Widgets -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                <!-- Exam countdown clock -->
                <div class="glass-card countdown-box" style="padding: 24px;">
                    <h4 style="font-family: var(--font-heading); font-size: var(--text-md);">Đếm Ngược Kỳ Thi</h4>
                    <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top:4px;">Dự kiến diễn ra ngày 15/06/2026</p>
                    <div class="countdown-digits" id="live-countdown" style="margin-top: 16px;">
                        <div class="time-slot"><span class="time-number" id="cd-day">27</span><span class="time-label">ngày</span></div>
                        <div class="time-slot"><span class="time-number" id="cd-hour">12</span><span class="time-label">giờ</span></div>
                        <div class="time-slot"><span class="time-number" id="cd-min">44</span><span class="time-label">phút</span></div>
                        <div class="time-slot"><span class="time-number" id="cd-sec">08</span><span class="time-label">giây</span></div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 600;">Lộ trình chuẩn bị</span>
                            <span style="font-size: var(--text-xs); color: var(--color-interactive); font-weight: 700;" id="countdown-progress-text">0%</span>
                        </div>
                        <div style="height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                            <div id="countdown-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--color-interactive), var(--color-interactive-hover)); border-radius: 3px; transition: width 0.8s ease;"></div>
                        </div>
                    </div>
                </div>

                <!-- Habit learning streak widget -->
                <div class="glass-card streak-board" style="padding: 24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="font-family: var(--font-heading); font-size: var(--text-md);">Chuỗi Học Tập</h4>
                        <span style="font-size: 18px;">🔥 <strong style="color:var(--color-commitment); font-family:var(--font-heading); font-size: var(--text-lg);">${AppState.streak}</strong></span>
                    </div>
                    <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 4px; line-height: 1.4;">Đừng ngắt chuỗi! Học tối thiểu 5 phút/ngày để tạo thói quen vững vàng.</p>
                    <div class="streak-row" style="margin-top: 16px;">
                        ${streakHtml}
                    </div>
                    
                    <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: var(--text-xs); color: var(--text-tertiary);"><i data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i>Tổng thời gian học:</span>
                        <span style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${hoursStudied} giờ</span>
                    </div>
                    <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 8px; line-height: 1.4; font-style: italic;">
                        🎯 Kỷ lục của bạn: ${maxStreak} ngày liên tục! Duy trì phong độ nhé.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Tasks CTA handlers
    document.querySelectorAll('.task-cta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-type');
            if (type === 'adaptive') {
                navigateTab('practice');
                setTimeout(() => {
                    const adaptiveTabBtn = document.getElementById('tab-adaptive');
                    if (adaptiveTabBtn) adaptiveTabBtn.click();
                }, 50);
            } else if (type === 'exam') {
                const examId = e.currentTarget.getAttribute('data-exam');
                startExamPortal(parseInt(examId));
            } else if (type === 'flashcards') {
                navigateTab('flashcards');
            } else if (type === 'grammar') {
                navigateTab('grammar');
            } else {
                navigateTab('practice');
            }
        });
    });

    // Start Live Countdown Clock
    startCountdownClock();
}



// --- A2. COMPACT SKILL MAP SUMMARY (for Dashboard Overview) ---
function renderSkillMapSummary(container) {
    const skills = [
        { key: "phonetics", title: "Phát Âm", accuracy: 95 },
        { key: "stress", title: "Trọng Âm", accuracy: 88 },
        { key: "grammar", title: "Ngữ Pháp", accuracy: AppState.grammarAccuracy || 74 },
        { key: "synonyms", title: "Từ Vựng", accuracy: 78 },
        { key: "reading", title: "Đọc Hiểu", accuracy: 68 },
        { key: "cloze", title: "Đọc Điền Từ", accuracy: 62 },
        { key: "error", title: "Sửa Lỗi Sai", accuracy: 72 },
        { key: "communication", title: "Giao Tiếp", accuracy: 85 },
        { key: "mock", title: "Luyện Đề", accuracy: Object.keys(AppState.completedExams).length > 0 ? Math.min(100, Object.keys(AppState.completedExams).length * 10) : 0 }
    ];

    const totalScore = skills.reduce((sum, s) => sum + Math.round((s.accuracy / 100) * 3), 0);
    const maxScore = 27;
    const getColor = (acc) => acc >= 80 ? '#4caf50' : acc >= 65 ? '#ff9800' : '#f44336';
    let titleBadge = totalScore > 24 ? 'EXPERT RUNNER' : totalScore > 18 ? 'COMPETENT BUILDER' : 'BEGINNER';

    // Build compact radar SVG
    const radarSkills = skills.filter(s => s.key !== 'mock');
    const cx = 100, cy = 100, radius = 72;
    let bgWebHtml = "", axesHtml = "", labelsHtml = "", dataPoints = "", dataDots = "";

    [0.33, 0.66, 1].forEach(scale => {
        let pts = "";
        radarSkills.forEach((_, i) => {
            const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
            pts += `${cx + radius * scale * Math.cos(angle)},${cy + radius * scale * Math.sin(angle)} `;
        });
        bgWebHtml += `<polygon points="${pts.trim()}" fill="none" stroke="var(--border-color)" stroke-width="1"/>`;
    });

    radarSkills.forEach((s, i) => {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        axesHtml += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="var(--border-color)" stroke-width="1"/>`;
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 14) * Math.sin(angle);
        labelsHtml += `<text x="${lx}" y="${ly}" font-size="9.5" font-weight="600" fill="var(--text-secondary)" text-anchor="middle" alignment-baseline="middle">${s.title}</text>`;
        const sc = Math.max(0.1, s.accuracy / 100);
        const dpx = cx + radius * sc * Math.cos(angle);
        const dpy = cy + radius * sc * Math.sin(angle);
        dataPoints += `${dpx},${dpy} `;
        dataDots += `<circle cx="${dpx}" cy="${dpy}" r="3.5" fill="${getColor(s.accuracy)}" stroke="var(--bg-primary)" stroke-width="1.5"/>`;
    });

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Score Summary Card -->
            <div class="glass-card" style="padding: 28px; display:flex; flex-direction:column; justify-content:center;">
                <span style="font-size:10px; font-weight:700; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:12px;">Tổng năng lực</span>
                <div style="display:flex; align-items:baseline; gap:4px; margin-bottom:8px;">
                    <span style="font-size:52px; font-weight:900; color:var(--color-validation-light); font-family:var(--font-heading); line-height:1;">${totalScore}</span>
                    <span style="font-size:20px; color:var(--text-tertiary); font-weight:300;">/ ${maxScore}</span>
                </div>
                <span style="display:inline-block; font-size:11px; font-weight:700; color:var(--color-validation-light); text-transform:uppercase; letter-spacing:0.5px;">${titleBadge}</span>
            </div>
            <!-- Radar Chart -->
            <div class="glass-card" style="padding: 20px; display:flex; align-items:center; justify-content:center;">
                <svg width="230" height="230" viewBox="0 0 200 200" style="overflow:visible;">
                    ${bgWebHtml}${axesHtml}${labelsHtml}
                    <polygon points="${dataPoints.trim()}" fill="rgba(46,125,50,0.18)" stroke="var(--color-validation-light)" stroke-width="2"/>
                    ${dataDots}
                </svg>
            </div>
        </div>
        <!-- S-6: Comprehensive 2-column breakdown of all 9 skills -->
        <div class="glass-card" style="padding: 24px;">
            <h4 style="font-size:var(--text-xs); font-weight:700; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; display:flex; align-items:center; gap:6px;">
                <i data-lucide="bar-chart-2" style="width:14px; height:14px; color:var(--color-interactive);"></i> Chi tiết độ chính xác 9 nhóm kỹ năng
            </h4>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px 28px;">
                ${skills.map(s => `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${s.title}">${s.title}</span>
                        <div style="flex:1; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden; position:relative;">
                            <div style="height:100%; width:${s.accuracy}%; background:${getColor(s.accuracy)}; border-radius:3px; transition: width 0.5s ease;"></div>
                        </div>
                        <span style="font-size:var(--text-sm); font-weight:700; color:${getColor(s.accuracy)}; min-width:38px; text-align:right;">${s.accuracy}%</span>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <span style="font-size: var(--text-xs); color: var(--text-tertiary);"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#4caf50; margin-right:4px;"></span> >=80% Tốt | <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ff9800; margin-right:4px;"></span> 65-79% Khá | <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f44336; margin-right:4px;"></span> &lt;65% Cần cải thiện</span>
                <button class="btn btn-secondary" onclick="navigateTab('skillmap')" style="font-size:12px; padding:8px 16px; display:inline-flex; align-items:center; gap:6px;">
                    Phân tích chi tiết <i data-lucide="arrow-right" style="width:14px;"></i>
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// Countdown target calculator
function startCountdownClock() {
    let examDate;
    if (AppState.examDate) {
        examDate = new Date(AppState.examDate);
        examDate.setHours(8, 0, 0, 0); // 8:00 AM on exam day
    }
    
    // Check if valid date, otherwise fallback to 27 days
    if (!examDate || isNaN(examDate.getTime())) {
        examDate = new Date();
        examDate.setDate(examDate.getDate() + 27);
        examDate.setHours(8, 0, 0, 0);
    }

    function update() {
        const now = new Date().getTime();
        const diff = examDate - now;

        if (diff <= 0) {
            clearInterval(AppState.countdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const dEl = document.getElementById('cd-day');
        const hEl = document.getElementById('cd-hour');
        const mEl = document.getElementById('cd-min');
        const sEl = document.getElementById('cd-sec');

        if (dEl && hEl && mEl && sEl) {
            dEl.innerText = days;
            hEl.innerText = hours < 10 ? '0' + hours : hours;
            mEl.innerText = mins < 10 ? '0' + mins : mins;
            sEl.innerText = secs < 10 ? '0' + secs : secs;

            // Update preparation progress bar
            const totalExams = typeof EXAM_RUNNERS_DB !== 'undefined' && EXAM_RUNNERS_DB.exams ? EXAM_RUNNERS_DB.exams.length : 50;
            const completedExams = Object.keys(AppState.completedExams || {}).length;
            const elapsedPercent = totalExams > 0 ? Math.min(100, Math.round((completedExams / totalExams) * 100)) : 0;
            const progBar = document.getElementById('countdown-progress-bar');
            const progText = document.getElementById('countdown-progress-text');
            if (progBar && progText) {
                progBar.style.width = elapsedPercent + '%';
                progText.innerText = `${elapsedPercent}% chặng đường`;
            }
        } else {
            // Clears if user navigates away
            clearInterval(AppState.countdownInterval);
        }
    }

    if (AppState.countdownInterval) clearInterval(AppState.countdownInterval);
    AppState.countdownInterval = setInterval(update, 1000);
    update();
}

// --- B. INTERACTIVE SKILL MAP PAGE (NEW DASHBOARD) ---
function renderSkillMap(container) {
    // Attempt to pull real average from exams if available
    let avgExamScore = 0;
    const examIds = Object.keys(AppState.completedExams || {});
    if (examIds.length > 0) {
        const total = examIds.reduce((sum, id) => sum + AppState.completedExams[id], 0);
        avgExamScore = Math.round(total / examIds.length);
    }
    const baseScore = avgExamScore > 0 ? avgExamScore : 0; // default to 0 if no exams

    const skills = [
        { key: "phonetics", title: "Phát Âm", cat: "knowledge", accuracy: baseScore > 0 ? Math.min(100, baseScore + 15) : 0, qCount: 140 },
        { key: "stress", title: "Trọng Âm", cat: "knowledge", accuracy: baseScore > 0 ? Math.min(100, baseScore + 8) : 0, qCount: 95 },
        { key: "grammar", title: "Ngữ Pháp", cat: "knowledge", accuracy: baseScore > 0 ? (AppState.grammarAccuracy || baseScore) : 0, qCount: 95 },
        { key: "synonyms", title: "Từ Vựng", cat: "knowledge", accuracy: baseScore > 0 ? Math.max(0, baseScore - 5) : 0, qCount: 75 },
        
        { key: "reading", title: "Đọc Hiểu", cat: "skill", accuracy: baseScore > 0 ? Math.max(0, baseScore - 12) : 0, qCount: 40 },
        { key: "cloze", title: "Đọc Điền Từ", cat: "skill", accuracy: baseScore > 0 ? Math.max(0, baseScore - 15) : 0, qCount: 50 },
        { key: "error", title: "Sửa Lỗi Sai", cat: "skill", accuracy: baseScore > 0 ? Math.max(0, baseScore - 8) : 0, qCount: 80 },
        
        { key: "communication", title: "Giao Tiếp", cat: "attitude", accuracy: baseScore > 0 ? Math.min(100, baseScore + 10) : 0, qCount: 60 },
        { key: "mock", title: "Luyện Đề", cat: "attitude", accuracy: examIds.length > 0 ? Math.min(100, examIds.length * 10) : 0, qCount: examIds.length }
    ];

    let k_score = 0, s_score = 0, a_score = 0;
    
    skills.forEach(s => {
        let pts = Math.round((s.accuracy / 100) * 3);
        s.score = pts;
        if (s.cat === "knowledge") k_score += pts;
        if (s.cat === "skill") s_score += pts;
        if (s.cat === "attitude") a_score += pts;
    });

    const totalScore = k_score + s_score + a_score;
    const maxScore = 27;
    
    let titleBadge = "BEGINNER";
    let titleDesc = "Bạn đang ở giai đoạn làm quen. Cần tập trung xây dựng nền tảng vững chắc hơn.";
    if (totalScore > 18) {
        titleBadge = "COMPETENT BUILDER";
        titleDesc = "Bạn có khả năng giải quyết vấn đề và vận dụng kiến thức tương đối ổn định.";
    }
    if (totalScore > 24) {
        titleBadge = "EXPERT RUNNER";
        titleDesc = "Kỹ năng xuất sắc! Bạn đã sẵn sàng chinh phục mọi dạng đề khó nhất.";
    }

    const radarSkills = skills.filter(s => s.key !== 'mock');
    const cx = 200, cy = 200, radius = 130;
    
    let bgWebHtml = "";
    [0.33, 0.66, 1].forEach(scale => {
        let points = "";
        radarSkills.forEach((_, i) => {
            const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
            const px = cx + radius * scale * Math.cos(angle);
            const py = cy + radius * scale * Math.sin(angle);
            points += `${px},${py} `;
        });
        bgWebHtml += `<polygon points="${points.trim()}" fill="none" stroke="var(--border-color)" stroke-width="1"/>`;
    });
    
    let axesHtml = "";
    let labelsHtml = "";
    radarSkills.forEach((s, i) => {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        axesHtml += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="var(--border-color)" stroke-width="1"/>`;
        
        const lx = cx + (radius + 28) * Math.cos(angle);
        const ly = cy + (radius + 18) * Math.sin(angle);
        labelsHtml += `<text x="${lx}" y="${ly}" font-size="11.5" font-weight="600" fill="var(--text-secondary)" text-anchor="middle" alignment-baseline="middle">${s.title}</text>`;
    });

    let dataPoints = "";
    let dataDots = "";
    radarSkills.forEach((s, i) => {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        const scale = Math.max(0.1, s.accuracy / 100);
        const px = cx + radius * scale * Math.cos(angle);
        const py = cy + radius * scale * Math.sin(angle);
        dataPoints += `${px},${py} `;
        dataDots += `<circle cx="${px}" cy="${py}" r="4.5" fill="var(--color-validation-light)" stroke="var(--bg-primary)" stroke-width="1.5"/>`;
    });
    
    const radarPolygon = `<polygon points="${dataPoints.trim()}" fill="rgba(16, 185, 129, 0.15)" stroke="var(--color-validation-light)" stroke-width="2.5"/>`;

    const dateObj = new Date();
    const dateStr = `${dateObj.getDate()} THÁNG ${dateObj.getMonth()+1}, ${dateObj.getFullYear()}`;

    const renderSkillRow = (s, idx) => {
        const base = s.accuracy;
        const n_biet = Math.min(100, base + 15);
        const t_hieu = Math.min(100, base + 5);
        const v_dung = Math.max(0, base - 10);
        const vd_cao = Math.max(0, base - 25);
        
        return `
            <div class="skill-accordion-item" style="border-bottom:1px solid var(--border-color); margin-bottom: 12px; padding-bottom: 4px;">
                <div class="skill-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; cursor:pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:10px; color:var(--text-tertiary); font-family:monospace; width:20px;">0${idx+1}</span>
                        <span style="font-size:14px; color:var(--text-primary); font-weight:600;">${s.title}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:14px; font-weight:700; color:var(--color-validation-light);">${s.accuracy}%</span>
                        <i data-lucide="chevron-down" style="width:16px; color:var(--text-tertiary);"></i>
                    </div>
                </div>
                <div class="skill-body" style="display:none; padding: 12px 0 16px 36px; animation: fadeIn 0.3s ease;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
                                <span>Nhận biết</span><span style="font-weight:600;">${Math.round(n_biet)}%</span>
                            </div>
                            <div style="width:100%; height:4px; background:rgba(0,0,0,0.05); border-radius:2px;"><div style="height:100%; width:${n_biet}%; background:var(--color-interactive); border-radius:2px;"></div></div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
                                <span>Thông hiểu</span><span style="font-weight:600;">${Math.round(t_hieu)}%</span>
                            </div>
                            <div style="width:100%; height:4px; background:rgba(0,0,0,0.05); border-radius:2px;"><div style="height:100%; width:${t_hieu}%; background:#4caf50; border-radius:2px;"></div></div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
                                <span>Vận dụng</span><span style="font-weight:600;">${Math.round(v_dung)}%</span>
                            </div>
                            <div style="width:100%; height:4px; background:rgba(0,0,0,0.05); border-radius:2px;"><div style="height:100%; width:${v_dung}%; background:#ff9800; border-radius:2px;"></div></div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
                                <span>Vận dụng cao</span><span style="font-weight:600;">${Math.round(vd_cao)}%</span>
                            </div>
                            <div style="width:100%; height:4px; background:rgba(0,0,0,0.05); border-radius:2px;"><div style="height:100%; width:${vd_cao}%; background:#f44336; border-radius:2px;"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    container.innerHTML = `
        <div style="color: var(--text-primary);">
            <div style="display:grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="glass-card" style="padding:32px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="text-align:center; margin-bottom:24px; width:100%;">
                        <span style="display:inline-block; padding:4px 12px; background:rgba(16, 185, 129, 0.1); color:var(--color-validation-light); font-size:11px; font-weight:700; border-radius:12px; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Học lực: ${titleBadge}</span>
                        <h3 style="font-size:24px; font-weight:900; line-height:1.2; margin-bottom:8px; font-family:var(--font-heading);">Tổng điểm năng lực: <span style="color:var(--color-validation-light);">${totalScore}</span><span style="font-size:16px; color:var(--text-tertiary); font-weight:400;"> / ${maxScore}</span></h3>
                        <p style="font-size:13px; color:var(--text-secondary); max-width:550px; margin:0 auto; line-height:1.6;">${titleDesc}</p>
                    </div>
                    
                    <div style="display:flex; justify-content:center; align-items:center; width:100%; overflow:visible; padding:10px 0;">
                        <svg width="400" height="400" viewBox="0 0 400 400" style="overflow:visible;">
                            ${bgWebHtml}
                            ${axesHtml}
                            ${labelsHtml}
                            ${radarPolygon}
                            ${dataDots}
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Toggle Button -->
            <div style="display:flex; justify-content:center; margin-bottom:28px;">
                <button class="btn btn-secondary" id="toggle-detailed-skills-btn" style="font-size:13px; padding:10px 24px; display:flex; align-items:center; gap:8px;">
                    <span>Xem Phân Tích Chi Tiết</span>
                    <i data-lucide="chevron-down" style="width:16px; height:16px;"></i>
                </button>
            </div>

            <!-- Collapsible Detailed Content -->
            <div id="detailed-skills-content" style="display:none; animation: fadeIn 0.3s ease;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:24px; border-bottom: 2px dashed var(--border-color); padding-bottom:16px;">
                    <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Chi tiết từng kỹ năng</h3>
                </div>

                <div class="glass-card" style="padding: 24px 20px; margin-bottom:28px;">
                    ${skills.map((s, idx) => renderSkillRow(s, idx)).join('')}
                </div>

                <div class="glass-card" style="padding:32px; border: 1px dashed var(--color-interactive); background:rgba(0,176,255,0.02);">
                    <h4 style="font-size:16px; font-weight:800; color:var(--text-primary); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:8px; margin-bottom:20px;">
                        <i data-lucide="target" style="color:var(--color-interactive); width:20px; height:20px;"></i> ƯU TIÊN TẬP TRUNG
                    </h4>
                    <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">
                        <li style="display:flex; align-items:flex-start; gap:12px; font-size:14px; color:var(--text-secondary); line-height:1.6; justify-content: space-between;">
                            <div style="display:flex; align-items:flex-start; gap:12px;">
                                <span style="color:var(--color-interactive); font-weight:800;">•</span>
                                <span>Nhìn vào nhóm có điểm thấp nhất — Đọc Điền Từ (Cloze Test). Dành 80% thời gian ôn luyện tuần tới để cày từ vựng chủ đề môi trường và giáo dục.</span>
                            </div>
                            <button class="btn btn-primary" style="background:var(--color-danger); color:#fff; border-color:var(--color-danger); padding: 6px 12px; font-size:11px; white-space: nowrap;" onclick="startBirdbrainExamForSkill('cloze')">Tạo đề Birdbrain</button>
                        </li>
                        <li style="display:flex; align-items:flex-start; gap:12px; font-size:14px; color:var(--text-secondary); line-height:1.6;">
                            <span style="color:var(--color-interactive); font-weight:800;">•</span>
                            Điểm ngữ pháp đang chững lại ở ${AppState.grammarAccuracy || 74}%. Hãy mở mục Grammar Shelf và hoàn thành nhánh "Mệnh Đề Quan Hệ".
                        </li>
                        <li style="display:flex; align-items:flex-start; gap:12px; font-size:14px; color:var(--text-secondary); line-height:1.6;">
                            <span style="color:var(--color-interactive); font-weight:800;">•</span>
                            Luyện Đề đang ở mức thấp. Mục tiêu tuần này: Hoàn thành 1 bài thi Mock Exam trọn vẹn 60 phút để làm quen áp lực.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Add interactive click handler for toggle
    const toggleBtn = document.getElementById('toggle-detailed-skills-btn');
    const detailedContent = document.getElementById('detailed-skills-content');
    if (toggleBtn && detailedContent) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = detailedContent.style.display === 'none';
            if (isHidden) {
                detailedContent.style.display = 'block';
                toggleBtn.querySelector('span').innerText = 'Thu Gọn Phân Tích';
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'chevron-up');
                }
            } else {
                detailedContent.style.display = 'none';
                toggleBtn.querySelector('span').innerText = 'Xem Phân Tích Chi Tiết';
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'chevron-down');
                }
                const section = document.getElementById('dashboard-skillmap-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
            lucide.createIcons();
        });
    }

    lucide.createIcons();
}

// --- C. EXAM PRACTICE ROOM ---
function renderPracticeRoom(container) {
    const getExamCompletionInfo = (examId) => {
        if (!AppState.activityLog) return null;
        const log = AppState.activityLog.find(item => item.type === 'exam' && item.examId === examId);
        if (log && log.timestamp) {
            const date = new Date(log.timestamp);
            return {
                dateStr: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                score: log.score
            };
        }
        return null;
    };

    const getExamExtraDetails = (examId) => {
        const details = {
            1: { skills: ['Phonetics', 'Stress', 'Grammar'], avgScore: '74%' },
            2: { skills: ['Cloze Passage', 'Vocabulary', 'Reading'], avgScore: '68%' },
            3: { skills: ['Error Correction', 'Grammar', 'Communication'], avgScore: '71%' },
            4: { skills: ['Synonyms', 'Reading Comprehension', 'Syntax'], avgScore: '65%' },
            5: { skills: ['Tenses', 'Prepositions', 'Pronunciation'], avgScore: '76%' }
        };
        return details[examId] || {
            skills: ['Grammar & Vocab', 'Reading', 'Writing'],
            avgScore: `${70 + (examId % 10)}%`
        };
    };

    let examsListHtml = '';

    EXAM_RUNNERS_DB.exams.forEach(exam => {
        // Mastery Gate: Exam N requires Exam N-1 >= 80%
        let isLocked = false;
        if (exam.id > 1) {
            const prevScore = AppState.completedExams[exam.id - 1];
            if (prevScore === undefined || prevScore < 80) {
                isLocked = true;
            }
        }

        const extra = getExamExtraDetails(exam.id);
        const compInfo = getExamCompletionInfo(exam.id);
        const score = AppState.completedExams[exam.id];

        if (isLocked) {
            examsListHtml += `
                <div class="glass-card exam-card locked-exam-card animate-zoom" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; min-height: 260px;">
                    <!-- Lock Icon Badge -->
                    <div class="lock-icon-badge">
                        <i data-lucide="lock" style="width: 14px; height: 14px;"></i>
                    </div>

                    <div>
                        <!-- Badge header -->
                        <div class="exam-badge-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; opacity: 0.5;">
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="modal-badge warning" style="margin:0; font-size: 11px;">${exam.difficulty}</span>
                                <span style="font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px;">
                                    <i data-lucide="award" style="width: 13px;"></i> +${exam.xpReward} XP
                                </span>
                            </div>
                        </div>

                        <!-- Exam Title -->
                        <h3 class="exam-title" style="font-family: var(--font-heading); font-size: var(--text-md); font-weight: 700; margin: 0 0 8px 0;">${exam.title}</h3>
                        
                        <!-- Meta info -->
                        <div class="exam-meta-grid" style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 12.5px;">
                            <div style="display: flex; align-items: center; gap: 4px;"><i data-lucide="help-circle" style="width:14px; color: var(--text-tertiary);"></i> ${exam.questionsCount} câu hỏi</div>
                            <div style="display: flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width:14px; color: var(--text-tertiary);"></i> ${exam.duration} phút</div>
                        </div>

                        <!-- Lock Requirement Banner -->
                        <div class="lock-requirement-banner">
                            <i data-lucide="info" style="width: 14px; height: 14px; color: var(--text-tertiary); flex-shrink: 0; margin-top: 2px;"></i>
                            <p class="lock-requirement-text">
                                Đạt tối thiểu 80% ở Đề số ${exam.id - 1} để mở khóa
                            </p>
                        </div>
                    </div>
                    
                    <button class="btn lock-button-disabled" disabled>
                        <i data-lucide="lock" style="width: 14px; height: 14px;"></i> Chưa mở khóa
                    </button>
                </div>
            `;
        } else {
            let scoreBadge = '';
            let dateHtml = '';
            let buttonText = 'Bắt đầu thi thử';
            let buttonClass = 'btn-primary';
            
            if (score !== undefined) {
                scoreBadge = `<span class="modal-badge warning" style="background:rgba(46,125,50,0.15); color:var(--color-validation-light); border: 1px solid rgba(46,125,50,0.25);">Đạt: ${score}%</span>`;
                const dateStr = compInfo ? compInfo.dateStr : 'Gần đây';
                dateHtml = `
                    <div style="margin-top: 12px; font-size: 11.5px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="check-circle-2" style="width: 12px; height: 12px; color: var(--color-validation-light);"></i>
                        Hoàn thành ngày: ${dateStr} (Điểm cao nhất: ${score}%)
                    </div>
                `;
                buttonText = 'Thi lại đề này';
                buttonClass = 'btn-secondary';
            }

            examsListHtml += `
                <div class="glass-card exam-card animate-zoom" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; min-height: 260px;">
                    <div>
                        <!-- Badge header -->
                        <div class="exam-badge-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="modal-badge warning" style="margin:0; font-size: 11px;">${exam.difficulty}</span>
                                <span style="font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px;">
                                    <i data-lucide="award" style="width: 13px;"></i> +${exam.xpReward} XP
                                </span>
                            </div>
                            <div style="display: flex; gap: 6px;">
                                <span class="modal-badge warning" style="background: rgba(0, 176, 255, 0.08); color: var(--color-interactive); border: 1px solid rgba(0, 176, 255, 0.15); margin: 0; font-size: 11px;">TB: ${extra.avgScore}</span>
                                ${scoreBadge}
                            </div>
                        </div>

                        <!-- Exam Title -->
                        <h3 class="exam-title" style="font-family: var(--font-heading); font-size: var(--text-md); font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0;">${exam.title}</h3>
                        
                        <!-- Meta info -->
                        <div class="exam-meta-grid" style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 12.5px; color: var(--text-secondary);">
                            <div style="display: flex; align-items: center; gap: 4px;"><i data-lucide="help-circle" style="width:14px; color: var(--text-tertiary);"></i> ${exam.questionsCount} câu hỏi</div>
                            <div style="display: flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width:14px; color: var(--text-tertiary);"></i> ${exam.duration} phút</div>
                        </div>

                        <!-- Target Skills -->
                        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; margin-top: 10px;">
                            <span style="font-size: 11px; color: var(--text-tertiary); display: block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Kỹ năng chính</span>
                            <span style="font-size: 12.5px; color: var(--text-secondary); font-weight: 500;">${extra.skills.join(', ')}</span>
                        </div>

                        ${dateHtml}
                    </div>
                    
                    <button class="btn ${buttonClass}" style="width:100%; margin-top: 8px;" onclick="startExamPortal(${exam.id})">${buttonText}</button>
                </div>
            `;
        }
    });

    let birdbrainContentHtml = '';
    if (AppState.weaknesses && AppState.weaknesses.length > 0) {
        birdbrainContentHtml = `
            <div class="glass-card birdbrain-card animate-zoom" style="background: linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(12, 11, 10, 0.1) 100%); border: 1px solid rgba(211, 47, 47, 0.2); margin-bottom: 24px; padding: 24px; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:24px;">🧠</span>
                        <span class="modal-badge warning" style="background:rgba(211, 47, 47, 0.15); color:var(--color-danger); border: 1px solid rgba(211, 47, 47, 0.25);">Adaptive Birdbrain Retry</span>
                    </div>
                    <h3 style="margin-top: 8px; font-family: var(--font-heading); font-size: 18px;">Luyện đề thích ứng Birdbrain</h3>
                    <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Tổng hợp <strong>${AppState.weaknesses.length} câu hỏi bạn từng làm sai</strong> để rèn luyện phục ổ lỗi.</p>
                </div>
                <button class="btn btn-primary" style="background:var(--color-danger); color:#fff; border-color:var(--color-danger);" onclick="startBirdbrainExam()">Luyện ngay</button>
            </div>
        `;
    } else {
         birdbrainContentHtml = `
            <div class="glass-card birdbrain-card animate-zoom" style="text-align: center; padding: 40px 24px; border-radius: var(--radius-lg);">
                <span style="font-size:48px;">🎉</span>
                <h3 style="margin-top: 16px; font-family: var(--font-heading); font-size: 18px;">Bạn chưa có điểm yếu nào!</h3>
                <p style="font-size:14px; color:var(--text-secondary); margin-top:8px;">Hãy tiếp tục làm các bài thi chuẩn (Mock Tests) để hệ thống thu thập dữ liệu và giúp bạn phát hiện lỗ hổng nhé.</p>
                <button class="btn btn-secondary" style="margin-top: 24px;" onclick="document.getElementById('tab-mock').click()">Về trang Đề thi thử</button>
            </div>
         `;
    }

    container.innerHTML = `
        <div class="practice-room-wrapper">
            <!-- TABS UI -->
            <div class="segmented-tabs-container">
                <button class="segmented-tab-btn active" id="tab-mock" data-target="mock-content">
                    <i data-lucide="pencil-line"></i> Mock Tests (Đề thi chuẩn)
                </button>
                <button class="segmented-tab-btn" id="tab-adaptive" data-target="adaptive-content">
                    <i data-lucide="brain"></i> Adaptive Retry (Khắc phục lỗi)
                </button>
                <button class="segmented-tab-btn" id="tab-drills" data-target="drills-content">
                    <i data-lucide="zap"></i> ⚡ Skill Drills (Rèn chiến thuật)
                </button>
            </div>

            <!-- MOCK TESTS CONTENT -->
            <div id="mock-content" class="practice-tab-content">
                <div class="card-title-row" style="margin-bottom:24px;">
                    <div>
                        <h3>Chọn đề thi thử lớp 10</h3>
                        <p style="font-size:12px; color:var(--text-tertiary);">Tất cả đề thi đều bám sát ma trận cấu trúc đề thi Sở GD&ĐT.</p>
                    </div>
                </div>
                
                <div class="exam-list-container">
                    ${examsListHtml}
                </div>
            </div>

            <!-- ADAPTIVE RETRY CONTENT -->
            <div id="adaptive-content" class="practice-tab-content" style="display: none;">
                <div class="card-title-row" style="margin-bottom:24px;">
                    <div>
                        <h3>Luyện tập thích ứng (Adaptive Retry)</h3>
                        <p style="font-size:12px; color:var(--text-tertiary);">Hệ thống tự động sinh đề dựa trên các lỗi sai trước đây của bạn, giúp tiết kiệm 80% thời gian ôn tập.</p>
                    </div>
                </div>
                ${birdbrainContentHtml}
            </div>

            <!-- SKILL DRILLS CONTENT -->
            <div id="drills-content" class="practice-tab-content" style="display: none;">
                <div class="card-title-row" style="margin-bottom:24px;">
                    <div>
                        <h3>⚡ Mini-drills rèn luyện kỹ năng làm bài</h3>
                        <p style="font-size:12px; color:var(--text-tertiary);">Rèn luyện phản xạ, chiến thuật phòng thi thông qua 4 mini-game tương tác nhanh cực kỳ thú vị.</p>
                    </div>
                </div>
                <div id="drills-arena-container">
                    <!-- Rendered dynamically by window.renderMicroDrillsList -->
                </div>
            </div>
        </div>
    `;

    // Tab Switching Logic
    const tabBtns = container.querySelectorAll('.segmented-tab-btn');
    const tabContents = container.querySelectorAll('.practice-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.style.display = 'block';
                    content.classList.add('animate-zoom');
                    
                    if (targetId === 'drills-content') {
                        window.renderMicroDrillsList();
                    }
                } else {
                    content.style.display = 'none';
                    content.classList.remove('animate-zoom');
                }
            });
        });
    });

    lucide.createIcons();
}

// ==========================================
// --- MICRO DRILLS SYSTEM (TAB 3 GAMES) ---
// ==========================================

window.renderMicroDrillsList = function() {
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    arena.innerHTML = `
        <div class="drill-card-grid">
            <div class="glass-card drill-card animate-zoom" onclick="window.startKeywordDrill()">
                <div>
                    <div style="font-size: 24px; margin-bottom: 12px;">🔍</div>
                    <h4 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color:var(--text-primary); margin: 0 0 8px 0;">1. Keyword Spotting (Từ khóa cốt lõi)</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;">Luyện kỹ năng gạch chân các từ khóa quan trọng quyết định câu trả lời đúng.</p>
                </div>
                <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: #ffc107; font-weight: 600;">+50 XP Thưởng</span>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">Rèn luyện ngay</button>
                </div>
            </div>

            <div class="glass-card drill-card animate-zoom" onclick="window.startSkimmingDrill()">
                <div>
                    <div style="font-size: 24px; margin-bottom: 12px;">⏳</div>
                    <h4 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color:var(--text-primary); margin: 0 0 8px 0;">2. Speed Skimming (Đọc lướt đếm ngược)</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;">Rèn phản xạ đọc nhanh, nắm bắt ý chính của đoạn văn dưới áp lực đếm ngược thời gian.</p>
                </div>
                <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: #ffc107; font-weight: 600;">+50 XP Thưởng</span>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">Rèn luyện ngay</button>
                </div>
            </div>

            <div class="glass-card drill-card animate-zoom" onclick="window.startParaphraseDrill()">
                <div>
                    <div style="font-size: 24px; margin-bottom: 12px;">🔄</div>
                    <h4 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color:var(--text-primary); margin: 0 0 8px 0;">3. Paraphrasing Match (Nhận diện câu viết lại)</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;">Chọn phương án viết lại tương đương nghĩa nhất, tránh các bẫy đảo nghĩa phổ biến.</p>
                </div>
                <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: #ffc107; font-weight: 600;">+50 XP Thưởng</span>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">Rèn luyện ngay</button>
                </div>
            </div>

            <div class="glass-card drill-card animate-zoom" onclick="window.startEliminationDrill()">
                <div>
                    <div style="font-size: 24px; margin-bottom: 12px;">❌</div>
                    <h4 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color:var(--text-primary); margin: 0 0 8px 0;">4. Elimination Training (Loại trừ bẫy nhiễu)</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;">Loại bỏ 2 phương án sai rõ ràng nhất của một câu hỏi để gia tăng xác suất chọn đúng.</p>
                </div>
                <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: #ffc107; font-weight: 600;">+50 XP Thưởng</span>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">Rèn luyện ngay</button>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
};

window.payoutDrillVictory = function(gameName) {
    AppState.xp += 50;
    AppState.activityLog = AppState.activityLog || [];
    AppState.activityLog.push({
        type: 'drill',
        title: `Hoàn thành game rèn kỹ năng: ${gameName}`,
        score: 100,
        timestamp: new Date().toISOString(),
        durationMinutes: 5,
        status: 'ontime'
    });
    saveAppStateToLocalStorage();
    
    // Sync UI streak or level if they are present in topbar
    if (window.renderUserDashboardStats) {
        window.renderUserDashboardStats();
    }
    if (window.updateDashboardHeader) {
        window.updateDashboardHeader();
    }
    
    const arena = document.getElementById('drills-arena-container');
    if (arena) {
        arena.innerHTML = `
            <div style="text-align: center; padding: 40px 24px;" class="animate-zoom">
                <span style="font-size:64px;">🏆</span>
                <h3 style="margin-top: 16px; font-family: var(--font-heading); font-size: 24px; color:var(--color-interactive);">Chiến thắng ngoạn mục!</h3>
                <p style="font-size:15px; color:var(--text-secondary); margin-top:8px;">Bạn đã hoàn thành xuất sắc 3 vòng rèn luyện của <strong>${gameName}</strong>.</p>
                <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255, 193, 7, 0.15); border:1px solid rgba(255, 193, 7, 0.3); padding:8px 16px; border-radius:30px; font-weight:700; color:#ffc107; font-size:16px; margin: 16px 0;">
                    ⭐ +50 XP Thưởng & Tích lũy Streak!
                </div>
                <div style="margin-top: 24px;">
                    <button class="btn btn-primary" onclick="window.renderMicroDrillsList()">Quay lại danh sách</button>
                </div>
            </div>
        `;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const burst = document.createElement('div');
                burst.innerText = '🎉✨🥳🔥💎';
                burst.style.position = 'fixed';
                burst.style.top = '40%';
                burst.style.left = '50%';
                burst.style.transform = 'translate(-50%, -50%)';
                burst.style.fontSize = '80px';
                burst.style.zIndex = '99999';
                burst.style.pointerEvents = 'none';
                burst.style.animation = 'fadeOutUp 1.5s ease-out forwards';
                document.body.appendChild(burst);
                setTimeout(() => burst.remove(), 1500);
            }, i * 300);
        }
    }
};

// --- GAME 1: KEYWORD SPOTTING ---
AppState.keywordDrillRound = 0;
AppState.selectedKeywords = [];

const KeywordDrillData = [
    {
        sentence: "She has been learning English since 2018.",
        instruction: "Xác định các từ khóa xác định THÌ của câu (verb, preposition, time):",
        correct: ["has", "learning", "since"]
    },
    {
        sentence: "If he had studied harder, he would have passed the exam.",
        instruction: "Xác định các từ khóa của câu ĐIỀU KIỆN LOẠI 3 (conditional, past verb, result verb):",
        correct: ["If", "had", "would"]
    },
    {
        sentence: "The new library was built by the local government yesterday.",
        instruction: "Xác định các từ khóa của câu BỊ ĐỘNG THÌ QUÁ KHỨ ĐƠN (passive auxiliary, passive participle, time):",
        correct: ["was", "built", "yesterday"]
    }
];

window.startKeywordDrill = function() {
    AppState.keywordDrillRound = 0;
    window.renderKeywordRound();
};

window.renderKeywordRound = function() {
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.keywordDrillRound;
    if (round >= KeywordDrillData.length) {
        window.payoutDrillVictory("Keyword Spotting");
        return;
    }
    
    const data = KeywordDrillData[round];
    AppState.selectedKeywords = [];
    
    // Split sentence into words, keeping punctuation but splitting clean strings
    const words = data.sentence.split(/\s+/);
    let wordsHtml = '';
    words.forEach((rawWord, idx) => {
        // Strip punctuation for matching
        const cleanWord = rawWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        wordsHtml += `<span class="keyword-word-span" id="kw-word-${idx}" onclick="window.toggleDrillWord(${idx}, '${cleanWord}')">${rawWord}</span> `;
    });
    
    arena.innerHTML = `
        <div class="drill-arena animate-zoom">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <span style="font-weight:700; color:var(--color-interactive); font-size:14px;">🔍 KEYWORD SPOTTING</span>
                <span style="font-size:12px; color:var(--text-tertiary);">Vòng ${round + 1} / 3</span>
            </div>
            <p style="font-size:15px; font-weight:700; margin-bottom:16px; color:var(--text-primary);">${data.instruction}</p>
            <div style="background:var(--bg-main); border:1px solid var(--border-color); padding:24px; border-radius:8px; font-size:18px; line-height:1.8; text-align:center; margin-bottom:24px; user-select:none;">
                ${wordsHtml}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:16px;">
                <button class="btn btn-secondary" onclick="window.renderMicroDrillsList()"><i data-lucide="arrow-left" style="width:14px; vertical-align:middle; margin-right:4px;"></i> Thoát</button>
                <div style="display:flex; gap:12px;">
                    <button class="btn btn-secondary" onclick="window.renderKeywordRound()">Làm lại</button>
                    <button class="btn btn-primary" id="kw-check-btn" onclick="window.checkKeywordRound()" style="padding-left:32px; padding-right:32px;">Kiểm tra</button>
                </div>
            </div>
            <div id="kw-feedback" style="margin-top:20px; display:none;"></div>
        </div>
    `;
    lucide.createIcons();
};

window.toggleDrillWord = function(idx, cleanWord) {
    const el = document.getElementById(`kw-word-${idx}`);
    if (!el || el.classList.contains('correct') || el.classList.contains('incorrect')) return;
    
    const index = AppState.selectedKeywords.findIndex(item => item.idx === idx);
    if (index > -1) {
        AppState.selectedKeywords.splice(index, 1);
        el.classList.remove('selected');
    } else {
        if (AppState.selectedKeywords.length >= 3) {
            alert("Bạn chỉ được chọn tối đa 3 từ khóa quyết định!");
            return;
        }
        AppState.selectedKeywords.push({ idx, word: cleanWord });
        el.classList.add('selected');
    }
};

window.checkKeywordRound = function() {
    const round = AppState.keywordDrillRound;
    const data = KeywordDrillData[round];
    
    if (AppState.selectedKeywords.length < 3) {
        alert("Vui lòng chọn đủ 3 từ khóa!");
        return;
    }
    
    const spans = document.querySelectorAll('.keyword-word-span');
    spans.forEach(span => span.style.pointerEvents = 'none');
    
    let correctCount = 0;
    AppState.selectedKeywords.forEach(sel => {
        const el = document.getElementById(`kw-word-${sel.idx}`);
        const isMatched = data.correct.some(c => c.toLowerCase() === sel.word.toLowerCase());
        if (el) {
            el.classList.remove('selected');
            if (isMatched) {
                el.classList.add('correct');
                correctCount++;
            } else {
                el.classList.add('incorrect');
            }
        }
    });
    
    // Highlight correct ones that weren't selected
    data.correct.forEach(c => {
        const matchingSpan = Array.from(spans).find(span => {
            const cleanWord = span.innerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            return cleanWord.toLowerCase() === c.toLowerCase();
        });
        if (matchingSpan && !matchingSpan.classList.contains('correct')) {
            matchingSpan.style.borderColor = '#ffc107';
            matchingSpan.style.background = 'rgba(255, 193, 7, 0.1)';
        }
    });
    
    const feedback = document.getElementById('kw-feedback');
    const checkBtn = document.getElementById('kw-check-btn');
    if (feedback && checkBtn) {
        feedback.style.display = 'block';
        if (correctCount === 3) {
            feedback.innerHTML = `
                <div style="background:rgba(76, 175, 80, 0.08); border:1px solid rgba(76, 175, 80, 0.3); color:#4caf50; padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>🎉 Tuyệt vời! Chính xác 100%!</strong><br>Bạn đã định vị đúng 3 từ khóa quyết định thì và cấu trúc câu: <strong>${data.correct.join(', ')}</strong>.
                </div>
            `;
        } else {
            feedback.innerHTML = `
                <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); color:var(--color-danger); padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>⚠️ Chưa chính xác hoàn toàn!</strong> (Đúng ${correctCount}/3 từ khóa)<br>Các từ khóa cốt lõi quyết định cấu trúc/thì của câu là: <strong>${data.correct.join(', ')}</strong> (các từ viền vàng/xanh lá).
                </div>
            `;
        }
        AppState.keywordDrillRound++;
        checkBtn.innerText = "Vòng tiếp theo";
        checkBtn.onclick = () => window.renderKeywordRound();
    }
};

// --- GAME 2: SPEED SKIMMING ---
AppState.skimmingDrillRound = 0;
AppState.skimmingSecondsRemaining = 20;
AppState.skimmingTimerInterval = null;

const SkimmingDrillData = [
    {
        passage: "Global warming is having a significant impact on oceans worldwide. Rising temperatures are causing glaciers to melt, which in turn leads to sea levels rising. This puts many coastal communities and animal habitats at high risk of severe flooding and erosion.",
        question: "Ý chính của đoạn văn trên là gì?",
        options: {
            A: "Glaciers are beautiful landmarks.",
            B: "The negative impact of global warming on world oceans.",
            C: "Coastal communities are building dams."
        },
        correct: "B",
        explanation: "Chính xác! Đoạn văn đề cập đến tác động của biến đổi khí hậu đến đại dương (nhiệt độ tăng, băng tan, mực nước biển dâng, đe dọa các vùng ven biển)."
    },
    {
        passage: "Computers and mobile devices have completely transformed our classrooms. In many modern high schools, student textbooks have been replaced with tablets. Educators believe this technology promotes active learning and makes finding educational resources much faster.",
        question: "Đoạn văn chủ yếu bàn luận về chủ đề gì?",
        options: {
            A: "How digital devices improve modern education.",
            B: "The expensive cost of buying school tablets.",
            C: "Playing computer games during class breaks."
        },
        correct: "A",
        explanation: "Chính xác! Đoạn văn mô tả cách công nghệ di động thay đổi lớp học, thay thế SGK bằng tablet và giúp học tập tích cực hơn."
    },
    {
        passage: "Losing a species from an ecosystem can trigger a chain reaction of negative consequences. For example, if a major predator becomes extinct, the population of prey animals will multiply rapidly. This can lead to overgrazing, which destroys forests and causes soil erosion.",
        question: "Ý nghĩa cốt lõi mà đoạn văn muốn truyền tải là gì?",
        options: {
            A: "Predators are dangerous animals.",
            B: "The importance of keeping predator numbers high.",
            C: "How losing a single species disrupts ecosystem balance."
        },
        correct: "C",
        explanation: "Chính xác! Đoạn văn chứng minh việc mất đi một loài động vật sẽ kéo theo một chuỗi hệ quả tiêu cực làm mất cân bằng hệ sinh thái."
    }
];

window.startSkimmingDrill = function() {
    AppState.skimmingDrillRound = 0;
    window.renderSkimmingRound();
};

window.renderSkimmingRound = function() {
    if (AppState.skimmingTimerInterval) {
        clearInterval(AppState.skimmingTimerInterval);
    }
    
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.skimmingDrillRound;
    if (round >= SkimmingDrillData.length) {
        window.payoutDrillVictory("Speed Skimming");
        return;
    }
    
    const data = SkimmingDrillData[round];
    AppState.skimmingSecondsRemaining = 20;
    
    arena.innerHTML = `
        <div class="drill-arena animate-zoom">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <span style="font-weight:700; color:var(--color-interactive); font-size:14px;">⏳ SPEED SKIMMING</span>
                <span style="font-size:12px; color:var(--text-tertiary);">Vòng ${round + 1} / 3</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(2, 132, 199, 0.08); border:1px solid rgba(2, 132, 199, 0.2); padding:12px 20px; border-radius:8px; margin-bottom:20px;">
                <span style="font-size:13.5px; font-weight:600; color:var(--color-interactive);">Đoạn văn sẽ BỊ NHÒE (BLURRED) sau:</span>
                <div id="skimming-timer" style="font-size:20px; font-weight:800; color:var(--color-danger); width: 60px; text-align:right;">20s</div>
            </div>

            <div class="skimming-box-passage" id="skimming-passage" style="background:var(--bg-main); border:1px solid var(--border-color); padding:24px; border-radius:8px; margin-bottom:24px;">${data.passage}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; gap:16px;">
                <button class="btn btn-secondary" onclick="window.exitSkimmingDrill()"><i data-lucide="arrow-left" style="width:14px; vertical-align:middle; margin-right:4px;"></i> Thoát</button>
                <button class="btn btn-primary" onclick="window.stopSkimmingAndShowQuestion()" style="padding-left:32px; padding-right:32px;">Tôi đã đọc xong!</button>
            </div>
        </div>
    `;
    lucide.createIcons();
    
    AppState.skimmingTimerInterval = setInterval(() => {
        AppState.skimmingSecondsRemaining--;
        const timerEl = document.getElementById('skimming-timer');
        if (timerEl) {
            timerEl.innerText = `${AppState.skimmingSecondsRemaining}s`;
        }
        
        if (AppState.skimmingSecondsRemaining <= 0) {
            clearInterval(AppState.skimmingTimerInterval);
            window.stopSkimmingAndShowQuestion();
        }
    }, 1000);
};

window.exitSkimmingDrill = function() {
    if (AppState.skimmingTimerInterval) {
        clearInterval(AppState.skimmingTimerInterval);
    }
    window.renderMicroDrillsList();
};

window.stopSkimmingAndShowQuestion = function() {
    if (AppState.skimmingTimerInterval) {
        clearInterval(AppState.skimmingTimerInterval);
    }
    
    const passageEl = document.getElementById('skimming-passage');
    if (passageEl) {
        passageEl.classList.add('blurred');
    }
    
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.skimmingDrillRound;
    const data = SkimmingDrillData[round];
    
    // Replace the read buttons with interactive multiple choice
    let optionsHtml = '';
    Object.keys(data.options).forEach(key => {
        optionsHtml += `
            <div class="glass-card option-btn" id="skim-opt-${key}" onclick="window.checkSkimmingAnswer('${key}')" style="padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; display:flex; align-items:center; gap:12px; transition:all 0.2s;">
                <span style="font-weight:700; background:rgba(255,255,255,0.06); width:28px; height:28px; display:inline-flex; justify-content:center; align-items:center; border-radius:50%; border:1px solid var(--border-color);">${key}</span>
                <span style="font-size:14.5px; color:var(--text-secondary);">${data.options[key]}</span>
            </div>
        `;
    });
    
    // Find the footer area to replace
    const child = arena.querySelector('.drill-arena');
    if (child) {
        // Insert question and choices between the passage and the footer
        const oldFooter = child.querySelector('div[style*="justify-content:space-between; align-items:center; gap:16px;"]');
        if (oldFooter) oldFooter.remove();
        
        // Remove timer row
        const timerRow = child.querySelector('div[style*="background:rgba(2, 132, 199, 0.08);"]');
        if (timerRow) {
            timerRow.innerHTML = `<span style="font-size:13.5px; font-weight:700; color:var(--color-danger); display:flex; align-items:center; gap:6px;"><i data-lucide="lock" style="width:14px;"></i> Đoạn văn đã bị nhòe! Dựa trên trí nhớ, hãy trả lời câu hỏi dưới đây:</span>`;
        }
        
        const qContainer = document.createElement('div');
        qContainer.className = 'animate-zoom';
        qContainer.style.marginTop = '20px';
        qContainer.innerHTML = `
            <p style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text-primary);">${data.question}</p>
            <div style="margin-bottom:24px;">${optionsHtml}</div>
            <div id="skim-feedback" style="margin-bottom:20px; display:none;"></div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="btn btn-secondary" onclick="window.exitSkimmingDrill()"><i data-lucide="arrow-left" style="width:14px; vertical-align:middle; margin-right:4px;"></i> Thoát</button>
                <button class="btn btn-primary" id="skim-next-btn" style="display:none; padding-left:32px; padding-right:32px;">Vòng tiếp theo</button>
            </div>
        `;
        child.appendChild(qContainer);
        lucide.createIcons();
    }
};

window.checkSkimmingAnswer = function(selectedOption) {
    const round = AppState.skimmingDrillRound;
    const data = SkimmingDrillData[round];
    
    // Disable all options
    const options = document.querySelectorAll('[id^="skim-opt-"]');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    
    const selectedEl = document.getElementById(`skim-opt-${selectedOption}`);
    const correctEl = document.getElementById(`skim-opt-${data.correct}`);
    
    if (selectedOption === data.correct) {
        if (selectedEl) {
            selectedEl.style.borderColor = '#4caf50';
            selectedEl.style.background = 'rgba(76, 175, 80, 0.1)';
            selectedEl.style.opacity = '1';
        }
    } else {
        if (selectedEl) {
            selectedEl.style.borderColor = 'var(--color-danger)';
            selectedEl.style.background = 'rgba(211, 47, 47, 0.08)';
            selectedEl.style.opacity = '1';
        }
        if (correctEl) {
            correctEl.style.borderColor = '#4caf50';
            correctEl.style.background = 'rgba(76, 175, 80, 0.1)';
            correctEl.style.opacity = '1';
        }
    }
    
    const feedback = document.getElementById('skim-feedback');
    const nextBtn = document.getElementById('skim-next-btn');
    
    if (feedback && nextBtn) {
        feedback.style.display = 'block';
        if (selectedOption === data.correct) {
            feedback.innerHTML = `
                <div style="background:rgba(76, 175, 80, 0.08); border:1px solid rgba(76, 175, 80, 0.3); color:#4caf50; padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>🎉 Hoàn hảo!</strong> Bạn có kỹ năng skimming rất nhạy bén.<br>${data.explanation}
                </div>
            `;
        } else {
            feedback.innerHTML = `
                <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); color:var(--color-danger); padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>⚠️ Nhầm lẫn một chút rồi!</strong><br>${data.explanation}
                </div>
            `;
        }
        
        AppState.skimmingDrillRound++;
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => window.renderSkimmingRound();
    }
};

// --- GAME 3: PARAPHRASING MATCH ---
AppState.paraphraseDrillRound = 0;

const ParaphraseDrillData = [
    {
        original: "Despite the heavy rain, they decided to go for a walk.",
        question: "Chọn câu viết lại tương đương nghĩa nhất và đúng ngữ pháp:",
        options: {
            A: "They went for a walk although it rained heavily.",
            B: "Because it rained heavily, they didn't go for a walk.",
            C: "They went for a walk in order to enjoy the heavy rain."
        },
        correct: "A",
        explanations: {
            A: "Chính xác! Cấu trúc: 'Despite + Noun/V-ing' viết lại bằng 'Although + Clause' giữ nguyên quan hệ nhượng bộ (mặc dù... nhưng...).",
            B: "Sai nghĩa. Câu này đảo ngược kết quả (vì mưa nên không đi, trong khi câu gốc là mặc dù mưa vẫn quyết định đi).",
            C: "Sai nghĩa. Thay đổi mục đích hành vi thành 'để thưởng thức cơn mưa', điều này không có trong câu gốc."
        }
    },
    {
        original: "They last visited their grandparents three months ago.",
        question: "Chọn câu viết lại tương đương nghĩa nhất và đúng ngữ pháp:",
        options: {
            A: "They have visited their grandparents for three months.",
            B: "They haven't visited their grandparents for three months.",
            C: "They didn't visit their grandparents three months ago."
        },
        correct: "B",
        explanations: {
            A: "Sai ngữ pháp và nghĩa. Thì Hiện tại hoàn thành khẳng định ngụ ý họ liên tục đi thăm ông bà suốt 3 tháng.",
            B: "Chính xác! Cấu trúc quá khứ đơn khẳng định: 'S + last + V2/ed + ... + ago' tương đương Hiện tại hoàn thành phủ định: 'S + haven't/hasn't + V3/ed + for + time'.",
            C: "Sai nghĩa hoàn toàn. Câu này phủ định việc họ đi thăm ông bà 3 tháng trước, trong khi thực tế đó là lần cuối họ thăm."
        }
    },
    {
        original: "I have never eaten this kind of food before.",
        question: "Chọn câu viết lại tương đương nghĩa nhất và đúng ngữ pháp:",
        options: {
            A: "This is the first time I have ever eaten this kind of food.",
            B: "I used to eat this kind of food very often.",
            C: "This kind of food was eaten by me recently."
        },
        correct: "A",
        explanations: {
            A: "Chính xác! Cấu trúc: 'S + have never + V3/ed + before' viết lại bằng 'This is the first time + S + have + ever + V3/ed'.",
            B: "Sai nghĩa. Câu này tuyên bố họ từng ăn thường xuyên trong quá khứ, trái ngược hoàn toàn câu gốc.",
            C: "Sai nghĩa. Câu bị động này ngụ ý món ăn vừa mới được ăn gần đây, mất đi ý nghĩa trải nghiệm lần đầu."
        }
    }
];

window.startParaphraseDrill = function() {
    AppState.paraphraseDrillRound = 0;
    window.renderParaphraseRound();
};

window.renderParaphraseRound = function() {
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.paraphraseDrillRound;
    if (round >= ParaphraseDrillData.length) {
        window.payoutDrillVictory("Paraphrasing Match");
        return;
    }
    
    const data = ParaphraseDrillData[round];
    
    let optionsHtml = '';
    Object.keys(data.options).forEach(key => {
        optionsHtml += `
            <div class="glass-card option-btn" id="para-opt-${key}" onclick="window.checkParaphraseAnswer('${key}')" style="padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; display:flex; align-items:center; gap:12px; transition:all 0.2s;">
                <span style="font-weight:700; background:rgba(255,255,255,0.06); width:28px; height:28px; display:inline-flex; justify-content:center; align-items:center; border-radius:50%; border:1px solid var(--border-color);">${key}</span>
                <span style="font-size:14.5px; color:var(--text-secondary);">${data.options[key]}</span>
            </div>
        `;
    });
    
    arena.innerHTML = `
        <div class="drill-arena animate-zoom">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <span style="font-weight:700; color:var(--color-interactive); font-size:14px;">🔄 PARAPHRASING MATCH</span>
                <span style="font-size:12px; color:var(--text-tertiary);">Vòng ${round + 1} / 3</span>
            </div>
            
            <p style="font-size:13px; color:var(--text-tertiary); font-weight:600; text-transform:uppercase; margin-bottom:6px;">Câu gốc:</p>
            <div style="background:var(--bg-main); border-left:4px solid var(--color-interactive); padding:16px 20px; border-radius:4px; font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:20px; line-height:1.6;">
                "${data.original}"
            </div>
            
            <p style="font-size:15px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">${data.question}</p>
            <div style="margin-bottom:24px;">${optionsHtml}</div>
            
            <div id="para-feedback" style="margin-bottom:20px; display:none;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="btn btn-secondary" onclick="window.renderMicroDrillsList()"><i data-lucide="arrow-left" style="width:14px; vertical-align:middle; margin-right:4px;"></i> Thoát</button>
                <button class="btn btn-primary" id="para-next-btn" style="display:none; padding-left:32px; padding-right:32px;">Vòng tiếp theo</button>
            </div>
        </div>
    `;
    lucide.createIcons();
};

window.checkParaphraseAnswer = function(selectedOption) {
    const round = AppState.paraphraseDrillRound;
    const data = ParaphraseDrillData[round];
    
    // Disable all options
    const options = document.querySelectorAll('[id^="para-opt-"]');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    
    const selectedEl = document.getElementById(`para-opt-${selectedOption}`);
    const correctEl = document.getElementById(`para-opt-${data.correct}`);
    
    if (selectedOption === data.correct) {
        if (selectedEl) {
            selectedEl.style.borderColor = '#4caf50';
            selectedEl.style.background = 'rgba(76, 175, 80, 0.1)';
            selectedEl.style.opacity = '1';
        }
    } else {
        if (selectedEl) {
            selectedEl.style.borderColor = 'var(--color-danger)';
            selectedEl.style.background = 'rgba(211, 47, 47, 0.08)';
            selectedEl.style.opacity = '1';
        }
        if (correctEl) {
            correctEl.style.borderColor = '#4caf50';
            correctEl.style.background = 'rgba(76, 175, 80, 0.1)';
            correctEl.style.opacity = '1';
        }
    }
    
    const feedback = document.getElementById('para-feedback');
    const nextBtn = document.getElementById('para-next-btn');
    
    if (feedback && nextBtn) {
        feedback.style.display = 'block';
        
        let feedbackHtml = '';
        if (selectedOption === data.correct) {
            feedbackHtml += `
                <div style="background:rgba(76, 175, 80, 0.08); border:1px solid rgba(76, 175, 80, 0.3); color:#4caf50; padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>🎉 Quá giỏi! Phân tích hoàn hảo.</strong><br>${data.explanations[selectedOption]}
                </div>
            `;
        } else {
            feedbackHtml += `
                <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong style="color:var(--color-danger);">⚠️ Bẫy rồi!</strong> <span style="color:var(--text-secondary);">${data.explanations[selectedOption]}</span><br>
                    <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; color:#4caf50;">
                        <strong>Phương án đúng (${data.correct}):</strong> ${data.explanations[data.correct]}
                    </div>
                </div>
            `;
        }
        
        feedback.innerHTML = feedbackHtml;
        AppState.paraphraseDrillRound++;
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => window.renderParaphraseRound();
    }
};

// --- GAME 4: ELIMINATION TRAINING ---
AppState.eliminationDrillRound = 0;
AppState.eliminatedOptions = []; // array like ['A', 'D']
AppState.eliminationPhase = 0; // 0: eliminate 2 wrong, 1: select correct one

const EliminationDrillData = [
    {
        question: "She __________ English since 2018.",
        options: {
            A: "learns",
            B: "is learning",
            C: "has been learning",
            D: "learnt"
        },
        correct: "C",
        obviousIncorrect: ["A", "D"],
        explanations: {
            A: "Loại trừ chính xác! Thì hiện tại đơn 'learns' diễn tả thói quen, không đi với mốc thời gian bắt đầu 'since 2018' ở quá khứ.",
            B: "Đây là phương án gây nhiễu tinh vi (Hiện tại tiếp diễn diễn tả hành động đang xảy ra, không đi với 'since 2018'). Hãy chọn đáp án còn lại!",
            C: "Chính xác! 'Has been learning' là thì Hiện tại hoàn thành tiếp diễn, hoàn toàn chính xác khi nhấn mạnh hành động học kéo dài từ 2018 đến hiện tại.",
            D: "Loại trừ chính xác! Thì quá khứ đơn 'learnt' diễn tả hành động đã chấm dứt hoàn toàn, không liên hệ với hiện tại nên không đi với 'since'."
        }
    },
    {
        question: "If I __________ you, I would buy that beautiful house.",
        options: {
            A: "am",
            B: "was",
            C: "were",
            D: "had been"
        },
        correct: "C",
        obviousIncorrect: ["A", "D"],
        explanations: {
            A: "Loại trừ chính xác! 'Am' là Hiện tại đơn, không thể dùng trong câu điều kiện loại 2 giả định trái ngược hiện tại.",
            B: "Đây là phương án gây nhiễu (Dù văn nói thỉnh thoảng dùng 'was', nhưng ngữ pháp chuẩn học thuật chỉ chấp nhận một từ duy nhất). Hãy chọn phương án còn lại!",
            C: "Chính xác! Trong câu điều kiện loại 2, động từ TO BE chia giả định luôn luôn là 'were' với tất cả các ngôi.",
            D: "Loại trừ chính xác! 'Had been' là quá khứ hoàn thành, chỉ dùng cho điều kiện loại 3 giả định trái ngược với quá khứ."
        }
    },
    {
        question: "The book __________ by Jack London is very interesting.",
        options: {
            A: "writing",
            B: "written",
            C: "which wrote",
            D: "was written"
        },
        correct: "B",
        obviousIncorrect: ["C", "D"],
        explanations: {
            A: "Đây là phương án gây nhiễu (Phân từ hiện tại 'writing' mang nghĩa chủ động, không phù hợp vì quyển sách được viết). Hãy chọn phương án còn lại!",
            B: "Chính xác! Đây là mệnh đề quan hệ rút gọn dạng bị động: 'The book which was written by Jack London' rút gọn thành 'The book written by Jack London'.",
            C: "Loại trừ chính xác! 'Which wrote' sai cấu trúc ngữ pháp bị động của mệnh đề quan hệ.",
            D: "Loại trừ chính xác! Nếu dùng 'was written', câu sẽ bị thừa động từ chính ('was written' và 'is' đều chia làm động từ chính của chủ ngữ 'The book')."
        }
    }
];

window.startEliminationDrill = function() {
    AppState.eliminationDrillRound = 0;
    window.renderEliminationRound();
};

window.renderEliminationRound = function() {
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.eliminationDrillRound;
    if (round >= EliminationDrillData.length) {
        window.payoutDrillVictory("Elimination Training");
        return;
    }
    
    const data = EliminationDrillData[round];
    AppState.eliminatedOptions = [];
    AppState.eliminationPhase = 0;
    
    window.updateEliminationUI();
};

window.updateEliminationUI = function() {
    const arena = document.getElementById('drills-arena-container');
    if (!arena) return;
    
    const round = AppState.eliminationDrillRound;
    const data = EliminationDrillData[round];
    
    let optionsHtml = '';
    Object.keys(data.options).forEach(key => {
        const isEliminated = AppState.eliminatedOptions.includes(key);
        const styleText = isEliminated 
            ? 'padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid rgba(211,47,47,0.15); opacity:0.35; pointer-events:none; background:rgba(211,47,47,0.02); text-decoration:line-through; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;'
            : 'padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;';
        
        let optionContent = `
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-weight:700; background:rgba(255,255,255,0.06); width:28px; height:28px; display:inline-flex; justify-content:center; align-items:center; border-radius:50%; border:1px solid var(--border-color);">${key}</span>
                <span style="font-size:14.5px; color:var(--text-secondary);">${data.options[key]}</span>
            </div>
        `;
        
        let strikeBtn = '';
        if (AppState.eliminationPhase === 0 && !isEliminated) {
            strikeBtn = `
                <button class="btn btn-secondary" onclick="event.stopPropagation(); window.attemptEliminateOption('${key}')" style="padding:4px 8px; font-size:11px; color:var(--color-danger); border-color:rgba(211,47,47,0.2); background:rgba(211,47,47,0.04); display:inline-flex; align-items:center; gap:3px;">
                    ✕ Loại trừ
                </button>
            `;
        }
        
        optionsHtml += `
            <div class="glass-card option-btn" id="elim-opt-${key}" onclick="window.attemptSelectOption('${key}')" style="${styleText}">
                ${optionContent}
                ${strikeBtn}
            </div>
        `;
    });
    
    let instructionsHtml = '';
    if (AppState.eliminationPhase === 0) {
        instructionsHtml = `
            <div style="background:rgba(211, 47, 47, 0.08); border:1px solid rgba(211, 47, 47, 0.15); padding:12px 20px; border-radius:8px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                <span style="font-size:18px;">❌</span>
                <span style="font-size:13.5px; font-weight:700; color:var(--color-danger);">Bước 1: Hãy loại trừ 2 phương án SAI RÕ RÀNG NHẤT (bằng nút "✕ Loại trừ") để gia tăng cơ hội của bạn. (${AppState.eliminatedOptions.length}/2)</span>
            </div>
        `;
    } else {
        instructionsHtml = `
            <div style="background:rgba(76, 175, 80, 0.08); border:1px solid rgba(76, 175, 80, 0.15); padding:12px 20px; border-radius:8px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                <span style="font-size:18px;">🎯</span>
                <span style="font-size:13.5px; font-weight:700; color:#4caf50;">Bước 2: Tuyệt vời! Bạn đã loại được 2 phương án sai rõ ràng. Bây giờ hãy click chọn phương án ĐÚNG nhất trong số các phương án còn lại!</span>
            </div>
        `;
    }
    
    arena.innerHTML = `
        <div class="drill-arena animate-zoom">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <span style="font-weight:700; color:var(--color-interactive); font-size:14px;">❌ ELIMINATION TRAINING</span>
                <span style="font-size:12px; color:var(--text-tertiary);">Vòng ${round + 1} / 3</span>
            </div>
            
            ${instructionsHtml}
            
            <p style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text-primary);">${data.question}</p>
            <div style="margin-bottom:24px;">${optionsHtml}</div>
            
            <div id="elim-feedback" style="margin-bottom:20px; display:none;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="btn btn-secondary" onclick="window.renderMicroDrillsList()"><i data-lucide="arrow-left" style="width:14px; vertical-align:middle; margin-right:4px;"></i> Thoát</button>
                <button class="btn btn-primary" id="elim-next-btn" style="display:none; padding-left:32px; padding-right:32px;">Vòng tiếp theo</button>
            </div>
        </div>
    `;
    lucide.createIcons();
};

window.attemptEliminateOption = function(key) {
    const round = AppState.eliminationDrillRound;
    const data = EliminationDrillData[round];
    
    if (data.obviousIncorrect.includes(key)) {
        AppState.eliminatedOptions.push(key);
        
        // Custom animation effect for striking out
        const el = document.getElementById(`elim-opt-${key}`);
        if (el) {
            el.style.transform = 'scale(0.97)';
            el.style.opacity = '0.35';
        }
        
        if (AppState.eliminatedOptions.length >= 2) {
            AppState.eliminationPhase = 1;
        }
        
        setTimeout(() => {
            window.updateEliminationUI();
        }, 300);
    } else {
        alert(`⚠️ Khoan đã! Phương án ${key} không phải là phương án sai rõ ràng dễ loại nhất. Hãy phân tích kỹ hơn!`);
    }
};

window.attemptSelectOption = function(key) {
    if (AppState.eliminationPhase === 0) {
        alert("⚠️ Vui lòng hoàn thành loại trừ 2 phương án sai rõ ràng trước khi chọn đáp án chính xác!");
        return;
    }
    
    const round = AppState.eliminationDrillRound;
    const data = EliminationDrillData[round];
    
    // Disable click events on all option cards
    const options = document.querySelectorAll('[id^="elim-opt-"]');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    const selectedEl = document.getElementById(`elim-opt-${key}`);
    const correctEl = document.getElementById(`elim-opt-${data.correct}`);
    
    if (key === data.correct) {
        if (selectedEl) {
            selectedEl.style.borderColor = '#4caf50';
            selectedEl.style.background = 'rgba(76, 175, 80, 0.1)';
        }
    } else {
        if (selectedEl) {
            selectedEl.style.borderColor = 'var(--color-danger)';
            selectedEl.style.background = 'rgba(211, 47, 47, 0.08)';
        }
        if (correctEl) {
            correctEl.style.borderColor = '#4caf50';
            correctEl.style.background = 'rgba(76, 175, 80, 0.1)';
        }
    }
    
    const feedback = document.getElementById('elim-feedback');
    const nextBtn = document.getElementById('elim-next-btn');
    
    if (feedback && nextBtn) {
        feedback.style.display = 'block';
        
        let feedbackHtml = '';
        if (key === data.correct) {
            feedbackHtml += `
                <div style="background:rgba(76, 175, 80, 0.08); border:1px solid rgba(76, 175, 80, 0.3); color:#4caf50; padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong>🎉 Xuất sắc! Loại trừ đã mở đường thành công!</strong><br>${data.explanations[key]}
                </div>
            `;
        } else {
            feedbackHtml += `
                <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); padding:16px; border-radius:8px; font-size:13.5px; line-height:1.5;" class="animate-zoom">
                    <strong style="color:var(--color-danger);">⚠️ Ôi không! Bạn bị mắc bẫy rồi!</strong> <span style="color:var(--text-secondary);">${data.explanations[key]}</span><br>
                    <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; color:#4caf50;">
                        <strong>Phương án đúng (${data.correct}):</strong> ${data.explanations[data.correct]}
                    </div>
                </div>
            `;
        }
        
        feedback.innerHTML = feedbackHtml;
        AppState.eliminationDrillRound++;
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => window.renderEliminationRound();
    }
};

window.generateAdaptiveQuestion = function(wrongQuestion) {
    const q = JSON.parse(JSON.stringify(wrongQuestion));
    q.stem = `[ADAPTIVE] ${q.stem || 'Choose the correct option'}`;
    q.id = q.id + 10000;
    return q;
};

window.startBirdbrainExam = function() {
    if (!AppState.weaknesses || AppState.weaknesses.length === 0) {
        alert("Tuyệt vời! Bạn chưa có câu hỏi sai nào trong lịch sử.");
        return;
    }
    
    const customQuestions = [];
    const questionsPool = [];
    
    EXAM_RUNNERS_DB.exams.forEach(exam => {
        exam.questions.forEach(q => {
            if (!questionsPool.some(p => p.id === q.id)) {
                questionsPool.push(q);
            }
        });
    });
    
    AppState.weaknesses.forEach(qId => {
        const found = questionsPool.find(q => q.id === qId);
        if (found) {
            customQuestions.push(window.generateAdaptiveQuestion(found));
        }
    });
    
    if (customQuestions.length === 0) {
        alert("Không tìm thấy các câu hỏi sai trong cơ sở dữ liệu.");
        return;
    }
    
    // Build custom exam object
    const exam = {
        id: -1,
        title: "Đề thích ứng Birdbrain Adaptive Retry",
        duration: Math.max(10, Math.ceil(customQuestions.length * 1.5)), // 1.5 mins per question
        questionsCount: customQuestions.length,
        xpReward: customQuestions.length * 5,
        difficulty: "Thích ứng",
        questions: customQuestions
    };
    
    AppState.activeExam = exam;
    AppState.examAnswers = {};
    AppState.examFlags = {};
    AppState.currentExamQuestionIndex = 0;
    AppState.examSecondsRemaining = exam.duration * 60;
    
    // Create the full screen Portal
    const portal = document.createElement('div');
    portal.className = 'active-exam-portal';
    portal.id = 'exam-active-portal';
    
    document.body.appendChild(portal);
    window.renderBirdbrainLayout();
    
    AppState.examTimerInterval = setInterval(updateExamClock, 1000);
};

window.startBirdbrainExamForSkill = function(skillKey) {
    if (!AppState.weaknesses || AppState.weaknesses.length === 0) {
        alert("Tuyệt vời! Bạn chưa có câu hỏi sai nào trong lịch sử.");
        return;
    }
    
    const customQuestions = [];
    const questionsPool = [];
    
    EXAM_RUNNERS_DB.exams.forEach(exam => {
        exam.questions.forEach(q => {
            if (!questionsPool.some(p => p.id === q.id)) {
                questionsPool.push(q);
            }
        });
    });
    
    AppState.weaknesses.forEach(qId => {
        const found = questionsPool.find(q => q.id === qId);
        if (found) {
            if (found.skill && found.skill.toLowerCase().includes(skillKey.toLowerCase())) {
                customQuestions.push(window.generateAdaptiveQuestion(found));
            }
        }
    });
    
    if (customQuestions.length === 0) {
        alert("Không tìm thấy câu hỏi sai nào thuộc kỹ năng này trong lịch sử của bạn.");
        return;
    }
    
    const exam = {
        id: -1,
        title: "Đề thích ứng Birdbrain: " + skillKey.toUpperCase(),
        duration: Math.max(5, Math.ceil(customQuestions.length * 1.5)),
        questionsCount: customQuestions.length,
        xpReward: customQuestions.length * 5,
        difficulty: "Khắc phục lỗ hổng",
        questions: customQuestions
    };
    
    AppState.activeExam = exam;
    AppState.examAnswers = {};
    AppState.examFlags = {};
    AppState.currentExamQuestionIndex = 0;
    AppState.examSecondsRemaining = exam.duration * 60;
    
    const portal = document.createElement('div');
    portal.className = 'active-exam-portal';
    portal.id = 'exam-active-portal';
    
    document.body.appendChild(portal);
    window.renderBirdbrainLayout();
    
    AppState.examTimerInterval = setInterval(updateExamClock, 1000);
};

// Distraction-Free active Practice Portal popup
window.startExamPortal = function(examId) {
    const exam = EXAM_RUNNERS_DB.exams.find(e => e.id === examId);
    if (!exam) return;

    AppState.activeExam = JSON.parse(JSON.stringify(exam)); // deep copy
    AppState.examAnswers = {};
    AppState.examFlags = {};
    AppState.currentExamQuestionIndex = 0;
    AppState.examSecondsRemaining = exam.duration * 60;

    // Create the full screen Portal
    const portal = document.createElement('div');
    portal.className = 'active-exam-portal academic-mode';
    portal.id = 'exam-active-portal';
    
    document.body.appendChild(portal);
    renderActiveExamLayout();

    // Start clock countdown
    AppState.examTimerInterval = setInterval(updateExamClock, 1000);
};

function renderActiveExamLayout() {
    const portal = document.getElementById('exam-active-portal');
    if (!portal) return;

    const exam = AppState.activeExam;
    const questions = EXAM_RUNNERS_DB.questions;

    // Left scrollable stacked question list
    let leftQuestionsHtml = '';
    
    // Group questions by passage or skill/subskill
    const groupedQuestions = [];
    let currentGroup = null;

    questions.forEach((q, idx) => {
        let groupKey = q.skill + '-' + q.subskill;
        if (q.passage) groupKey = q.passage;
        
        if (!currentGroup || currentGroup.key !== groupKey) {
            currentGroup = {
                key: groupKey,
                skill: q.skill,
                subskill: q.subskill,
                passage: q.passage,
                items: []
            };
            groupedQuestions.push(currentGroup);
        }
        currentGroup.items.push({ q, idx });
    });

    groupedQuestions.forEach(group => {
        let groupHeaderHtml = '';
        if (group.passage) {
            const passageKey = 'passage-' + group.items[0].q.id;
            const highlightedPassage = window.applyHighlightsToPassage ? window.applyHighlightsToPassage(group.passage, passageKey) : group.passage;

            groupHeaderHtml = `
                <div class="group-context-card" style="margin-bottom:16px;">
                    <div style="margin-bottom:12px;"><span class="modal-badge warning" style="background:rgba(0,176,255,0.1); color:var(--color-interactive);">${group.skill} - ${group.subskill}</span></div>
                    <div class="reading-passage selectable-passage" id="passage-el-${passageKey}" onmouseup="window.handlePassageSelection ? window.handlePassageSelection(event, '${passageKey}', 'passage-el-${passageKey}') : null" style="font-size:15px; line-height:1.7; color:var(--text-secondary); white-space:pre-wrap; cursor:text;">${highlightedPassage}</div>
                </div>
            `;
        } else {
            let instructionText = `Mark the letter A, B, C, or D to indicate the correct answer to each of the following questions.`;
            if (group.skill === 'Phonetics') instructionText = `Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation in each of the following questions.`;
            else if (group.skill === 'Stress') instructionText = `Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress in each of the following questions.`;
            else if (group.skill === 'Error Correction') instructionText = `Mark the letter A, B, C, or D to indicate the underlined part that needs correction in each of the following questions.`;
            else if (group.skill === 'Writing') instructionText = `Finish each of the following sentences in such a way that it means the same as the sentence printed before it.`;
            else if (group.skill === 'Synonyms & Antonyms') {
                if (group.subskill === 'Opposite Meaning') instructionText = `Mark the letter A, B, C, or D to indicate the word(s) OPPOSITE in meaning to the underlined word(s) in each of the following questions.`;
                else instructionText = `Mark the letter A, B, C, or D to indicate the word(s) CLOSEST in meaning to the underlined word(s) in each of the following questions.`;
            }
            
            groupHeaderHtml = `
                <div class="group-context-card" style="margin-bottom:24px; padding:0 20px;">
                    <div style="margin-bottom:12px;"><span class="modal-badge warning" style="background:rgba(0,0,0,0.04); color:var(--text-secondary); border: 1px solid var(--border-color);">${group.skill} - ${group.subskill}</span></div>
                    <div style="font-size:15px; color:var(--text-primary); font-weight:700; line-height: 1.6; background: rgba(255,193,7,0.15); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3);">${instructionText}</div>
                </div>
            `;
        }
        
        let subQuestionsHtml = '';
        group.items.forEach(item => {
            const q = item.q;
            const idx = item.idx;
            const isWriting = q.type === 'writing';
            const studentAns = AppState.examAnswers[q.id] || '';
            const isFlagged = AppState.examFlags[q.id] || false;

            let interactionAreaHtml = '';
            if (isWriting) {
                const promptGuide = q.prompt ? q.prompt.replace(/\.+$/, "").trim() : "=> ";
                interactionAreaHtml = `
                    <div style="margin-top: 16px;">
                        <div style="font-size:12px; color:var(--text-tertiary); font-weight:600; margin-bottom:8px; display:block;">NHẬP CÂU TRẢ LỜI CỦA BẠN:</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:700; color:var(--color-interactive); font-family:var(--font-heading); font-size:15px; white-space:nowrap;">${promptGuide}</span>
                            <input type="text" class="form-input writing-input-field" id="left-writing-${q.id}" value="${studentAns}" oninput="saveWritingAnswer(${q.id}, this.value, 'left')" style="font-size:15px; font-weight:600; flex-grow:1;" placeholder="Hoàn thiện câu...">
                        </div>
                    </div>
                `;
            } else {
                let optionsHtml = '';
                Object.keys(q.options).forEach(key => {
                    const optionText = q.options[key];
                    const isSelected = studentAns === key ? 'selected' : '';
                    const stateKey = `${q.id}-${key}`;
                    const isStruck = AppState.examStrikethroughs && AppState.examStrikethroughs[stateKey];
                    const strikeClass = isStruck ? 'strikethrough' : '';
                    optionsHtml += `
                        <button class="option-btn ${isSelected} ${strikeClass}" id="opt-btn-${q.id}-${key}" onclick="selectExamOption(${q.id}, '${key}')" oncontextmenu="window.toggleStrikethrough(event, this)">
                            <span class="option-letter">${key}</span>
                            <span class="option-text">${optionText}</span>
                            <span class="option-strike-toggle" onclick="event.stopPropagation(); window.toggleStrikethroughBtn(${q.id}, '${key}', event)">✕</span>
                        </button>
                    `;
                });
                
                const useGrid = (group.skill === 'Phonetics' || group.skill === 'Stress');
                const stackStyle = useGrid ? 'display:grid; grid-template-columns:1fr 1fr; gap:12px;' : 'display:flex; flex-direction:column; gap:10px;';
                
                interactionAreaHtml = `
                    <div style="${stackStyle} margin-top: 16px;">
                        ${optionsHtml}
                    </div>
                `;
            }

            subQuestionsHtml += `
                <div class="distraction-free-question-card animate-zoom" id="question-card-${q.id}" style="margin: 0 0 16px 0; padding:24px; background:var(--bg-card); border: 1px solid var(--border-color); border-radius:12px; max-width: none; box-shadow: var(--shadow-sm);">
                    <div class="question-meta-row" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:700; color:var(--text-secondary); font-size:12px;">CÂU HỎI ${idx + 1}</span>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <button class="btn-tool-scratchpad" onclick="window.toggleScratchpad(${q.id})" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer; padding:2px 6px; display:flex; align-items:center; justify-content:center; transition:color 0.2s;" title="Nháp nhanh">
                                <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                            </button>
                            <button class="btn-tool-flag" onclick="window.toggleExamFlag(${q.id})" style="background:none; border:none; color:${isFlagged ? '#ffc107' : 'var(--text-tertiary)'}; cursor:pointer; padding:2px 6px; display:flex; align-items:center; justify-content:center; transition:color 0.2s;" title="Cắm cờ">
                                <i data-lucide="flag" style="width:14px; height:14px; fill:${isFlagged ? '#ffc107' : 'none'};"></i>
                            </button>
                        </div>
                    </div>
                    ${q.stem ? `<p class="question-stem" style="font-size:15px; font-weight:600; line-height:1.5; margin-bottom:12px;">${q.stem}</p>` : ''}
                    ${interactionAreaHtml}
                </div>
            `;
        });
        
        if (group.passage) {
            // Split-pane layout
            leftQuestionsHtml += `
                <div class="question-group-container split-pane" style="margin-bottom: 40px; display:flex; gap:24px; height: calc(100vh - 160px); background:var(--bg-main); padding:24px; border-radius:12px; border:1px solid var(--border-color);">
                    <div class="passage-pane" style="flex:1; overflow-y:auto; padding-right:16px; border-right: 1px solid var(--border-color);">
                        ${groupHeaderHtml}
                    </div>
                    <div class="questions-pane" style="flex:1; overflow-y:auto; padding-left:8px;">
                        ${subQuestionsHtml}
                    </div>
                </div>
            `;
        } else {
            // Stacked layout
            leftQuestionsHtml += `
                <div class="question-group-container stacked" style="margin-bottom: 40px; max-width: 800px; margin-left: auto; margin-right: auto;">
                    ${groupHeaderHtml}
                    <div class="group-questions-list">
                        ${subQuestionsHtml}
                    </div>
                </div>
            `;
        }
    });

    // Right panel: Virtual OMR grid (1-32) and Writing inputs stack (33-40)
    let omrBubblesHtml = '';
    let writingRightHtml = '';

    questions.forEach((q, idx) => {
        const studentAns = AppState.examAnswers[q.id] || '';
        const isAnswered = studentAns !== '';
        const isFlagged = AppState.examFlags[q.id] || false;
        
        if (q.type === 'writing') {
            writingRightHtml += `
                <div class="glass-card writing-right-card" id="right-writing-card-${q.id}" onclick="scrollToQuestion(${q.id})" style="cursor: pointer; margin-bottom: 12px; padding: 12px; background:var(--bg-card); border: 1px solid var(--border-color); border-radius:var(--radius-sm); transition:all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color:var(--text-secondary);">CÂU ${idx + 1} (Tự luận)</span>
                        <span style="font-size: 9px; color: var(--text-tertiary); text-transform:uppercase;">${q.subskill}</span>
                    </div>
                    <input type="text" class="form-input" id="right-writing-${q.id}" value="${studentAns}" oninput="saveWritingAnswer(${q.id}, this.value, 'right')" onclick="event.stopPropagation()" style="font-size:12px; padding:8px 12px; height:auto;" placeholder="Nhập câu trả lời...">
                </div>
            `;
        } else {
            omrBubblesHtml += `
                <div class="omr-bubble ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}" id="omr-bubble-${q.id}" onclick="scrollToQuestion(${q.id})" style="position:relative;">
                    <span class="bubble-num" id="omr-num-${q.id}" style="${isAnswered ? 'display:none;' : ''}">${idx + 1}</span>
                    <span class="bubble-letter" id="omr-letter-${q.id}" style="${!isAnswered ? 'display:none;' : ''}">${studentAns}</span>
                    ${isFlagged ? `<span style="position:absolute; top:-2px; right:-2px; font-size:10px;">🚩</span>` : ''}
                </div>
            `;
        }
    });

    portal.innerHTML = `
        <header class="exam-portal-header">
            <div class="logo-area">
                <span class="logo-icon">⚡</span>
                <span class="logo-text" style="font-size:16px;">EXAM RUNNERS</span>
            </div>
            
            <div class="exam-header-center">
                <span class="exam-portal-title">${exam.title}</span>
                <div class="exam-countdown-clock" id="exam-live-clock">00:00</div>
            </div>
            
            <div style="display:flex; gap:12px; align-items:center;">
                <button class="btn" id="toggle-omr-btn" style="padding: 8px 16px; font-size:12px; line-height: 1; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-secondary); display:flex; align-items:center; gap:6px;" onclick="toggleOMRPanel()">
                    <i data-lucide="panel-right-close" style="width:14px; height:14px;"></i> Ẩn OMR
                </button>
                <button class="btn btn-secondary" style="padding: 8px 16px; font-size:12px;" onclick="confirmQuitExam()">Nộp bài sớm</button>
            </div>
        </header>

        <div class="exam-split-workspace">
            <!-- Left Side: Stacked scrollable question cards -->
            <div class="exam-questions-column" id="exam-scroll-pane" style="height: 100%; padding: 32px;">
                ${leftQuestionsHtml}
                
                <div style="max-width:720px; margin: 40px auto 100px; text-align:center;">
                    <p style="font-size:13px; color:var(--text-tertiary); margin-bottom:16px;">Bạn đã xem hết 40 câu hỏi. Hãy kiểm tra lại phiếu OMR trước khi nộp bài.</p>
                    <button class="btn btn-primary" onclick="submitFullExam()" style="padding:14px 40px; font-size:15px; font-weight:700; width:100%; max-width:320px;">Nộp bài & Xem giải thích 5 bước</button>
                </div>
            </div>

            <!-- Right Side: Virtual OMR bubbler & Writing shortcut pane -->
            <div class="exam-controls-column" id="exam-omr-panel" style="height: 100%; border-left:1px solid var(--border-color); background:#0c0b0a;">
                <div class="exam-controls-block">
                    <h5 class="control-block-title">Phiếu OMR ảo (Q1 - Q32)</h5>
                    <p style="font-size:10px; color:var(--text-tertiary); margin-top:-6px; margin-bottom:12px;">Nhấp bóng tròn để cuộn nhanh đến câu hỏi tương ứng.</p>
                    <div class="question-navigation-grid" style="grid-template-columns: repeat(5, 1fr); gap: 8px;">
                        ${omrBubblesHtml}
                    </div>
                </div>

                <div class="exam-controls-block" style="flex-grow:1; display:flex; flex-direction:column; margin-top:16px; border-top:1px solid var(--border-color); padding-top:16px;">
                    <h5 class="control-block-title">Phiếu Tự Luận viết lại câu (Q33 - Q40)</h5>
                    <div style="flex-grow:1; overflow-y:auto; max-height: 380px; padding-right:4px;">
                        ${writingRightHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    lucide.createIcons();
    updateExamClock();
}

window.toggleOMRPanel = function() {
    const panel = document.getElementById('exam-omr-panel');
    const btn = document.getElementById('toggle-omr-btn');
    if (!panel || !btn) return;
    
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        btn.innerHTML = '<i data-lucide="panel-right-close" style="width:14px; height:14px;"></i> Ẩn OMR';
    } else {
        panel.style.display = 'none';
        btn.innerHTML = '<i data-lucide="panel-right-open" style="width:14px; height:14px;"></i> Hiện OMR';
    }
    lucide.createIcons();
}

window.toggleStrikethrough = function(event, el) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const parts = el.id.split('-');
    const key = parts[parts.length - 1];
    const qId = parseInt(parts[parts.length - 2]);
    
    if (qId && key) {
        const stateKey = `${qId}-${key}`;
        AppState.examStrikethroughs = AppState.examStrikethroughs || {};
        AppState.examStrikethroughs[stateKey] = !AppState.examStrikethroughs[stateKey];
        if (AppState.examStrikethroughs[stateKey]) {
            el.classList.add('strikethrough');
        } else {
            el.classList.remove('strikethrough');
        }
        saveAppStateToLocalStorage();
    }
};

window.toggleStrikethroughBtn = function(qId, key, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const stateKey = `${qId}-${key}`;
    AppState.examStrikethroughs = AppState.examStrikethroughs || {};
    AppState.examStrikethroughs[stateKey] = !AppState.examStrikethroughs[stateKey];
    
    const el = document.getElementById(`opt-btn-${qId}-${key}`);
    if (el) {
        if (AppState.examStrikethroughs[stateKey]) {
            el.classList.add('strikethrough');
        } else {
            el.classList.remove('strikethrough');
        }
    }
    saveAppStateToLocalStorage();
};

window.toggleScratchpad = function(qId) {
    const existing = document.getElementById(`scratchpad-panel-${qId}`);
    if (existing) {
        existing.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = `scratchpad-panel-${qId}`;
    panel.className = 'scratchpad-floating-panel';
    
    const qCard = document.getElementById(`question-card-${qId}`);
    let left = window.innerWidth / 2 - 170;
    let top = window.innerHeight / 2 - 120;
    
    if (qCard) {
        const rect = qCard.getBoundingClientRect();
        left = Math.min(window.innerWidth - 360, Math.max(20, rect.left + 50));
        top = Math.min(window.innerHeight - 260, Math.max(20, rect.top + 20));
    }
    
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    
    AppState.examScratchpads = AppState.examScratchpads || {};
    const content = AppState.examScratchpads[qId] || '';
    
    panel.innerHTML = `
        <div class="scratchpad-header" id="scratchpad-header-${qId}">
            <div class="scratchpad-title">
                <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                <span>Ghi chú nháp - Câu ${qId}</span>
            </div>
            <button class="scratchpad-close-btn" onclick="document.getElementById('scratchpad-panel-${qId}').remove()">&times;</button>
        </div>
        <textarea class="scratchpad-textarea" placeholder="Nhập ghi chú tại đây... Tự động lưu!" oninput="window.saveScratchpad(${qId}, this.value)">${content}</textarea>
        <div class="scratchpad-footer">Ghi chú tự động lưu</div>
    `;
    
    document.body.appendChild(panel);
    lucide.createIcons();
    
    const header = document.getElementById(`scratchpad-header-${qId}`);
    window.makeElementDraggable(header, panel);
};

window.saveScratchpad = function(qId, val) {
    AppState.examScratchpads = AppState.examScratchpads || {};
    AppState.examScratchpads[qId] = val;
    saveAppStateToLocalStorage();
};

window.makeElementDraggable = function(headerEl, containerEl) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    headerEl.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // Don't drag if clicking close button
        if (e.target.classList.contains('scratchpad-close-btn')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        containerEl.style.top = (containerEl.offsetTop - pos2) + "px";
        containerEl.style.left = (containerEl.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
    
    headerEl.ontouchstart = dragTouchStart;
    
    function dragTouchStart(e) {
        if (e.target.classList.contains('scratchpad-close-btn')) return;
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.ontouchend = closeTouchDragElement;
            document.ontouchmove = touchElementDrag;
        }
    }
    
    function touchElementDrag(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            containerEl.style.top = (containerEl.offsetTop - pos2) + "px";
            containerEl.style.left = (containerEl.offsetLeft - pos1) + "px";
        }
    }
    
    function closeTouchDragElement() {
        document.ontouchend = null;
        document.ontouchmove = null;
    }
};

window.renderBirdbrainLayout = function() {
    const portal = document.getElementById('exam-active-portal');
    if (!portal) return;

    const exam = AppState.activeExam;
    const qIndex = AppState.currentExamQuestionIndex || 0;
    
    if (qIndex >= exam.questions.length) {
        portal.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; text-align:center; background:#F5F4F1;">
                <h2 style="font-size:32px; font-family:var(--font-heading); margin-bottom:24px; color:#13110F; font-weight:800;">Hoàn thành Adaptive Retry! 🎉</h2>
                <button class="btn btn-primary" onclick="document.getElementById('exam-active-portal').remove(); navigateTab('practice');" style="padding:14px 40px; background:#FF6F00; border-color:#FF6F00; color:#FFFFFF; font-weight:700; border-radius:12px; cursor:pointer;">Đóng</button>
            </div>
        `;
        return;
    }
    
    const q = exam.questions[qIndex];
    const progress = Math.round((qIndex / exam.questions.length) * 100);
    const isAnswered = !!AppState.examAnswers[q.id];
    const studentAns = AppState.examAnswers[q.id];
    const isCorrect = isAnswered && studentAns === q.correct;
    
    AppState.currentHintLevel = AppState.currentHintLevel || 0;
    
    // 1. Tactical Briefing Card
    const TacticalBriefings = {
        'Grammar': {
            title: '⚡ Chiến thuật Ngữ pháp',
            text: 'Xác định nhanh thì, cấu trúc câu, và dấu hiệu nhận biết từ vựng. Đừng vội dịch nghĩa toàn bộ câu, hãy phân tích vai trò ngữ pháp của chỗ trống.'
        },
        'Vocabulary': {
            title: '⚡ Chiến thuật Từ vựng',
            text: 'Quan sát các từ xung quanh chỗ trống để xem có cụm từ cố định (collocation), giới từ đi kèm, hay sắc thái nghĩa (tích cực/tiêu cực) nào phù hợp không.'
        },
        'Reading': {
            title: '⚡ Chiến thuật Đọc hiểu',
            text: 'Đọc câu hỏi trước để tìm từ khóa định vị trong văn bản. Không nên dịch từng từ, tập trung vào Skimming & Scanning để tìm chứng cứ.'
        },
        'Phonetics': {
            title: '⚡ Chiến thuật Phát âm',
            text: 'Đặc biệt lưu ý các đuôi thường gặp như -ed, -s/es, hoặc các nguyên âm đôi. Đọc nhẩm trong đầu theo âm chuẩn và so sánh.'
        },
        'Stress': {
            title: '⚡ Chiến thuật Trọng âm',
            text: 'Quy tắc vàng: Danh/Tính từ 2 âm tiết thường nhấn âm 1, Động từ nhấn âm 2. Lưu ý các hậu tố đặc biệt thu hút trọng âm (e.g. -tion, -ity).'
        },
        'Synonyms & Antonyms': {
            title: '⚡ Chiến thuật Đồng nghĩa - Trái nghĩa',
            text: 'BẪY CỰC LỚN: Nhìn kỹ yêu cầu tìm ĐỒNG NGHĨA hay TRÁI NGHĨA. Đoán nghĩa từ gạch chân qua văn cảnh nếu là từ mới lạ.'
        },
        'Error Correction': {
            title: '⚡ Chiến thuật Sửa lỗi sai',
            text: 'Thường tập trung vào 3 lỗi: Hòa hợp chủ vị, Thì của động từ, hoặc Từ vựng dễ gây nhầm lẫn (confusing words). Kiểm tra từng phần gạch chân.'
        },
        'Sentence Transformation': {
            title: '⚡ Chiến thuật Viết lại câu',
            text: 'Đối chiếu cấu trúc tương đương (e.g. Thì quá khứ đơn <-> Hiện tại hoàn thành, Câu so sánh <-> Không bằng). Cẩn thận các chi tiết phủ định.'
        }
    };
    
    let briefing = TacticalBriefings[q.skill] || TacticalBriefings['Grammar'];
    if ((q.skill && q.skill.includes('Synonym')) || (q.skill && q.skill.includes('Antonym'))) briefing = TacticalBriefings['Synonyms & Antonyms'];
    
    const briefingHtml = `
        <div class="tactical-briefing-card animate-slide-up" style="background:#F8F7F4; border:1px solid #E5E5EA; border-left:4px solid #FF6F00; padding:14px 18px; border-radius:8px; margin-bottom:20px; display:flex; gap:12px; align-items:start;">
            <span style="font-size:20px;">💡</span>
            <div>
                <strong style="color:#FF6F00; font-size:13.5px; display:block; margin-bottom:4px;">${briefing.title}</strong>
                <span style="font-size:12.5px; color:#8E8E93; line-height:1.45;">${briefing.text}</span>
            </div>
        </div>
    `;

    // 2. Step-by-step Hint Scaffold Box
    let hintScaffoldHtml = '';
    if (!isAnswered && AppState.currentHintLevel > 0) {
        hintScaffoldHtml = `
            <div class="hint-scaffold-box animate-slide-up" style="margin-top:16px; padding:14px 18px; background:#FFFDF5; border-left:4px solid #FF6F00; border-radius:0 8px 8px 0; font-size:13px; line-height:1.5; border-top: 1px solid #FFF9C4; border-right: 1px solid #FFF9C4; border-bottom: 1px solid #FFF9C4; color:#13110F;">
                ${AppState.currentHintLevel >= 1 ? `<div style="margin-bottom:8px;"><strong>🏷️ Cấp 1 - Quy tắc:</strong> ${q.explanation || 'Kiểm tra chủ điểm: ' + q.subskill}</div>` : ''}
                ${AppState.currentHintLevel >= 2 ? `<div style="margin-bottom:8px;"><strong>🔍 Cấp 2 - Phân tích ngữ cảnh:</strong> Để ý các từ tín hiệu (keywords/signal words) hoặc cấu trúc từ loại xung quanh chỗ trống trong câu.</div>` : ''}
                ${AppState.currentHintLevel >= 3 ? `<div><strong>⚠️ Cấp 3 - Cảnh báo bẫy & Mẹo:</strong> Loại bỏ các đáp án sai thì động từ hoặc sai giới từ đi kèm trước. Chọn đáp án mang sắc thái ý nghĩa chính xác nhất.</div>` : ''}
            </div>
        `;
    }

    let optionsHtml = '';
    if (q.type !== 'writing') {
        Object.keys(q.options).forEach(key => {
            const optionText = q.options[key];
            let statusClass = '';
            let iconHtml = '';
            if (isAnswered) {
                if (key === q.correct) {
                    statusClass = 'correct';
                    iconHtml = '<i data-lucide="check-circle" style="color:#4caf50; margin-left:auto;"></i>';
                } else if (key === studentAns) {
                    statusClass = 'incorrect';
                    iconHtml = '<i data-lucide="x-circle" style="color:#EF5350; margin-left:auto;"></i>';
                }
            }

            let optionStyle = `
                width: 100%;
                display: flex;
                align-items: center;
                text-align: left;
                padding: 16px 20px;
                border-radius: 12px;
                background: #FFFFFF;
                border: 1px solid #E5E5EA;
                color: #13110F;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                margin-bottom: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01);
            `;

            let letterStyle = `
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: #F2F2F7;
                border: 1px solid #E5E5EA;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                margin-right: 12px;
                color: #13110F;
                flex-shrink: 0;
                transition: all 0.2s ease;
            `;

            let hoverEvents = '';
            if (!isAnswered) {
                hoverEvents = `
                    onmouseover="this.style.borderColor='#FF6F00'; this.style.background='#FFFBF7'; this.style.transform='translateX(4px)'; this.querySelector('.option-letter').style.background='#FF6F00'; this.querySelector('.option-letter').style.borderColor='#FF6F00'; this.querySelector('.option-letter').style.color='#FFFFFF';"
                    onmouseout="this.style.borderColor='#E5E5EA'; this.style.background='#FFFFFF'; this.style.transform='translateX(0px)'; this.querySelector('.option-letter').style.background='#F2F2F7'; this.querySelector('.option-letter').style.borderColor='#E5E5EA'; this.querySelector('.option-letter').style.color='#13110F';"
                `;
            } else {
                if (key === q.correct) {
                    optionStyle += ' border-color:#4CAF50; background:#E8F5E9; color:#1B5E20; font-weight:600;';
                    letterStyle += ' background:#4CAF50; border-color:#4CAF50; color:#FFFFFF;';
                } else if (key === studentAns) {
                    optionStyle += ' border-color:#EF5350; background:#FFEBEE; color:#C62828; font-weight:600;';
                    letterStyle += ' background:#EF5350; border-color:#EF5350; color:#FFFFFF;';
                } else {
                    optionStyle += ' opacity: 0.4; cursor: not-allowed;';
                }
            }

            optionsHtml += `
                <button class="option-btn birdbrain-option ${statusClass}" style="${optionStyle}" ${isAnswered ? 'disabled' : ''} onclick="selectBirdbrainOption(${q.id}, '${key}')" ${hoverEvents}>
                    <span class="option-letter" style="${letterStyle}">${key}</span>
                    <span class="option-text" style="flex-grow:1;">${optionText}</span>
                    ${iconHtml}
                </button>
            `;
        });
    }

    // 3. Pitfall Warning Alert for Distractors
    let pitfallHtml = '';
    if (isAnswered && !isCorrect) {
        pitfallHtml = `
            <div class="pitfall-warning animate-shake" style="background:#FFF5F5; border:1px solid #FFCDD2; border-left:4px solid #EF5350; border-radius:8px; padding:14px 18px; color:#C62828; margin-bottom:20px; display:flex; gap:12px; align-items:start;">
                <span style="font-size:20px;">⚠️</span>
                <div>
                    <strong style="font-size:13.5px; display:block; margin-bottom:4px; color:#EF5350;">CẢNH BÁO BẪY (Pitfall Warning)!</strong>
                    <span style="font-size:12.5px; color:#13110F; line-height:1.45;">Bạn đã chọn đáp án nhiễu <strong>${studentAns}</strong>. Lựa chọn này được thiết kế cố ý để đánh lừa các học sinh chưa vững cấu trúc của <em>${q.subskill}</em>. Đọc kỹ phân tích 5 bước bên dưới để hiểu sâu hơn!</span>
                </div>
            </div>
        `;
    }

    let explanationHtml = '';
    if (isAnswered) {
        explanationHtml = `
            <div class="birdbrain-explanation animate-slide-up" style="margin-top:24px; padding:24px; background:#FFFFFF; border-radius:12px; border:1px solid #E5E5EA; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
                ${pitfallHtml}
                <h4 style="margin-bottom:16px; color:#13110F; font-weight:700;">Giải thích chi tiết (5-step):</h4>
                <div class="five-step-solution">
                    <div class="solution-step" style="display:flex; gap:16px; padding:16px; border-radius:8px; background:#F8F7F4; border:1px solid #E5E5EA;"><span class="step-number-pill step-verdict" style="background:${isCorrect ? '#E8F5E9' : '#FFEBEE'}; color:${isCorrect ? '#2E7D32' : '#C62828'}; font-weight:800; font-size:10px; padding:2px 8px; border-radius:4px; height:20px; display:flex; align-items:center;">${isCorrect ? 'ĐÚNG' : 'SAI'}</span><div class="step-content" style="font-size:13px; color:#13110F;">Bạn đã chọn <strong>${studentAns}</strong>, đáp án đúng là <strong>${q.correct}</strong>.</div></div>
                    <div class="solution-step" style="display:flex; gap:16px; padding:16px; border-radius:8px; background:#F8F7F4; border:1px solid #E5E5EA;"><span class="step-number-pill step-rule" style="background:#E0F7FA; color:#006064; font-weight:800; font-size:10px; padding:2px 8px; border-radius:4px; height:20px; display:flex; align-items:center;">Rule</span><div class="step-content" style="font-size:13px; color:#13110F;">${q.explanation || 'Quy tắc ngữ pháp/từ vựng cốt lõi.'}</div></div>
                    <div class="solution-step" style="display:flex; gap:16px; padding:16px; border-radius:8px; background:#F8F7F4; border:1px solid #E5E5EA;"><span class="step-number-pill step-why" style="background:#F2F2F7; color:#48484A; font-weight:800; font-size:10px; padding:2px 8px; border-radius:4px; height:20px; display:flex; align-items:center;">Why</span><div class="step-content" style="font-size:13px; color:#13110F;">Tại sao đáp án này đúng: câu gốc có cấu trúc và ý nghĩa phù hợp với chủ điểm ngữ pháp này.</div></div>
                    <div class="solution-step" style="display:flex; gap:16px; padding:16px; border-radius:8px; background:#F8F7F4; border:1px solid #E5E5EA;"><span class="step-number-pill step-trap" style="background:#FFEBEE; color:#C62828; font-weight:800; font-size:10px; padding:2px 8px; border-radius:4px; height:20px; display:flex; align-items:center;">Trap</span><div class="step-content" style="font-size:13px; color:#13110F;">Bẫy phổ biến: nhầm lẫn sắc thái từ hoặc nhầm thì động từ tương tự.</div></div>
                    <div class="solution-step" style="display:flex; gap:16px; padding:16px; border-radius:8px; background:#F8F7F4; border:1px solid #E5E5EA;"><span class="step-number-pill step-tip" style="background:#FFF9C4; color:#F57F17; font-weight:800; font-size:10px; padding:2px 8px; border-radius:4px; height:20px; display:flex; align-items:center;">Tip</span><div class="step-content" style="font-size:13px; color:#13110F;">Mẹo làm bài nhanh: Nhận diện nhanh các từ khóa chỉ thời gian hoặc động từ khuyết thiếu.</div></div>
                </div>
                <button class="btn btn-primary" style="margin-top: 24px; width: 100%; padding: 14px; background:#FF6F00; border-color:#FF6F00; color:#FFFFFF; font-weight:700; border-radius:12px; cursor:pointer;" onclick="nextBirdbrainQuestion()">Câu tiếp theo <i data-lucide="arrow-right" style="width:16px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></button>
            </div>
        `;
    }

    portal.innerHTML = `
        <div style="padding: 20px 40px; display:flex; justify-content:space-between; align-items:center; background:#13110f; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff;">
            <div style="font-weight:700; font-family:var(--font-heading); font-size:18px; letter-spacing:0.05em;">🧠 BIRDBRAIN ADAPTIVE</div>
            <div style="flex-grow:1; max-width:400px; margin: 0 40px; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${progress}%; background:#FF6F00; transition:width 0.3s; border-radius:4px;"></div>
            </div>
            <button class="btn" onclick="document.getElementById('exam-active-portal').remove()" style="padding: 8px 16px; font-size:12px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#AEAEB2; border-radius:8px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#FFFFFF';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#AEAEB2';">Thoát</button>
        </div>
        
        <div style="flex-grow:1; display:flex; justify-content:center; align-items:flex-start; padding: 40px; overflow-y:auto; background:#F5F4F1;">
            <div class="birdbrain-card-container ${isAnswered && !isCorrect ? 'shake-effect' : ''}" style="width:100%; max-width:800px;">
                <div style="padding: 40px; background:#FFFFFF; border:1px solid #E5E5EA; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border-radius:16px; border-top: 4px solid #FF6F00;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <span style="font-size:14px; color:#8E8E93; font-weight:700;">CÂU HỎI ${qIndex + 1} / ${exam.questions.length}</span>
                        ${!isAnswered ? `
                        <button class="btn" onclick="window.revealNextHint(${q.id})" style="margin-left:auto; padding:6px 12px; font-size:11px; line-height: 1; border-radius:6px; background:#FFFBE5; border:1px solid #FFE082; color:#FF6F00; display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <i data-lucide="help-circle" style="width:12px; height:12px;"></i> Gợi ý (${AppState.currentHintLevel}/3)
                        </button>
                        ` : ''}
                    </div>
                    
                    ${briefingHtml}
                    
                    <p style="font-size:22px; font-weight:600; margin-bottom:32px; line-height:1.5; color:#13110F;">${q.stem || (q.passage ? 'Read the passage below...' : '')}</p>
                    
                    ${q.passage ? `<div style="background:#F2F2F7; padding:20px; border-radius:8px; margin-bottom:24px; font-size:14px; line-height:1.6; color:#13110F; max-height:200px; overflow-y:auto; border:1px solid #E5E5EA;">${q.passage}</div>` : ''}

                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${optionsHtml}
                    </div>
                    
                    ${hintScaffoldHtml}
                </div>
                ${explanationHtml}
            </div>
        </div>
    `;
    lucide.createIcons();
};

window.selectBirdbrainOption = function(qId, option) {
    if (AppState.examAnswers[qId]) return;
    
    AppState.examAnswers[qId] = option;
    
    const exam = AppState.activeExam;
    const q = exam.questions.find(item => item.id === qId);
    
    if (q) {
        const isCorrect = option === q.correct;
        const originalId = qId - 10000;
        
        if (isCorrect) {
            AppState.weaknesses = AppState.weaknesses.filter(id => id !== originalId);
        } else {
            if (!AppState.weaknesses.includes(originalId)) {
                AppState.weaknesses.push(originalId);
            }
        }
        saveAppStateToLocalStorage();
    }
    
    window.renderBirdbrainLayout();
};

window.revealNextHint = function(qId) {
    AppState.currentHintLevel = AppState.currentHintLevel || 0;
    if (AppState.currentHintLevel < 3) {
        AppState.currentHintLevel++;
        window.renderBirdbrainLayout();
    }
};

window.nextBirdbrainQuestion = function() {
    AppState.currentExamQuestionIndex++;
    AppState.currentHintLevel = 0;
    window.renderBirdbrainLayout();
};

window.scrollToQuestion = function(qId) {
    const pane = document.getElementById('exam-scroll-pane');
    const card = document.getElementById(`question-card-${qId}`);
    if (pane && card) {
        // Smoothly scroll the pane to center the targeted card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight card with a temporary glowing cyan border
        card.style.borderColor = 'var(--color-interactive)';
        card.style.boxShadow = 'var(--shadow-glow-cyan)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.borderColor = 'var(--border-color)';
            card.style.boxShadow = 'none';
        }, 1500);
    }
};

window.saveWritingAnswer = function(qId, val, source) {
    AppState.examAnswers[qId] = val;

    // Sync input values non-destructively to avoid focus jumps!
    if (source === 'left') {
        const rightInput = document.getElementById(`right-writing-${qId}`);
        if (rightInput) rightInput.value = val;
    } else {
        const leftInput = document.getElementById(`left-writing-${qId}`);
        if (leftInput) leftInput.value = val;
    }
    
    // Highlight the card right border if has value
    const card = document.getElementById(`right-writing-card-${qId}`);
    if (card) {
        if (val.trim() !== '') {
            card.style.borderColor = 'var(--color-interactive)';
            card.style.background = 'rgba(0,176,255,0.02)';
        } else {
            card.style.borderColor = 'var(--border-color)';
            card.style.background = 'var(--bg-card)';
        }
    }
};

window.selectExamOption = function(qId, option) {
    AppState.examAnswers[qId] = option;

    // Update left card visual active class
    const buttons = document.querySelectorAll(`[id^="opt-btn-${qId}-"]`);
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.id === `opt-btn-${qId}-${option}`) {
            btn.classList.add('selected');
        }
    });

    // Update OMR bubble grid item directly without re-render
    const bubble = document.getElementById(`omr-bubble-${qId}`);
    const letter = document.getElementById(`omr-letter-${qId}`);
    const num = document.getElementById(`omr-num-${qId}`);
    if (bubble && letter) {
        bubble.classList.add('answered');
        if (num) num.style.display = 'none';
        letter.style.display = 'inline';
        letter.innerText = option;
    }
};

// Clock logic
function updateExamClock() {
    const clock = document.getElementById('exam-live-clock');
    if (!clock) return;

    if (AppState.examSecondsRemaining <= 0) {
        clearInterval(AppState.examTimerInterval);
        submitFullExam();
        return;
    }

    AppState.examSecondsRemaining--;
    const mins = Math.floor(AppState.examSecondsRemaining / 60);
    const secs = AppState.examSecondsRemaining % 60;
    
    clock.innerText = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    
    // Critical alert at 5 mins
    if (AppState.examSecondsRemaining < 300) {
        clock.style.background = 'rgba(211, 47, 47, 0.3)';
        clock.style.borderColor = 'red';
    }
}

// Exam interaction callbacks
window.gotoExamQuestion = function(idx) {
    AppState.currentExamQuestionIndex = idx;
    renderActiveExamLayout();
};

window.prevExamQuestion = function() {
    if (AppState.currentExamQuestionIndex > 0) {
        AppState.currentExamQuestionIndex--;
        renderActiveExamLayout();
    }
};

window.nextExamQuestion = function() {
    if (AppState.currentExamQuestionIndex < EXAM_RUNNERS_DB.questions.length - 1) {
        AppState.currentExamQuestionIndex++;
        renderActiveExamLayout();
    }
};

window.toggleExamFlag = function(qId) {
    AppState.examFlags[qId] = !AppState.examFlags[qId];
    renderActiveExamLayout();
};

window.confirmQuitExam = function() {
    if (confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?")) {
        submitFullExam();
    }
};

window.submitFullExam = function() {
    clearInterval(AppState.examTimerInterval);
    
    const questions = EXAM_RUNNERS_DB.questions;
    let score = 0;
    
    // Grade the entire exam
    questions.forEach(q => {
        const studentAns = AppState.examAnswers[q.id] || '';
        const isWriting = q.type === 'writing';
        const isCorrect = isWriting ? checkWrittenAnswer(studentAns, q.correct) : studentAns === q.correct;
        
        if (isCorrect) {
            score++;
            // If it was in the weakness bank, remove it (especially for Birdbrain Adaptive Retries)
            AppState.weaknesses = AppState.weaknesses.filter(id => id !== q.id);
        } else {
            // Save to weaknesses bank for adaptive retry (no duplicates)
            if (!AppState.weaknesses.includes(q.id)) {
                AppState.weaknesses.push(q.id);
            }
        }
    });

    const percent = Math.round((score / questions.length) * 100);
    const examId = AppState.activeExam.id;
    
    // Save to completed exams record
    if (examId > 0) {
        AppState.completedExams[examId] = percent;
        
        if (!AppState.activityLog) AppState.activityLog = [];
        AppState.activityLog.push({
            type: 'exam',
            examId: examId,
            title: AppState.activeExam.title || `Đề thi số ${examId}`,
            score: percent,
            timestamp: new Date().toISOString(),
            durationMinutes: Math.round((3600 - AppState.examSecondsRemaining) / 60) || 15,
            status: 'ontime'
        });
    }
    
    // Calculate streak expansion
    AppState.streak += 1;
    AppState.xp += score * 50; // XP Reward per correct question
    
    saveAppStateToLocalStorage();

    // Cleanup active portal DOM
    const portal = document.getElementById('exam-active-portal');
    if (portal) portal.remove();

    // Route directly to custom Results screen rendering
    renderExamResults(score, percent);
}

window.renderExamResults = function(score, percent) {
    const exam = AppState.activeExam;
    const questions = EXAM_RUNNERS_DB.questions;
    
    // Group questions by passage or skill/subskill
    const groupedQuestions = [];
    let currentGroup = null;

    questions.forEach((q, idx) => {
        let groupKey = q.skill + '-' + q.subskill;
        if (q.passage) groupKey = q.passage;
        
        if (!currentGroup || currentGroup.key !== groupKey) {
            currentGroup = {
                key: groupKey,
                skill: q.skill,
                subskill: q.subskill,
                passage: q.passage,
                items: []
            };
            groupedQuestions.push(currentGroup);
        }
        currentGroup.items.push({ q, idx });
    });

    let detailsHtml = '';
    
    groupedQuestions.forEach(group => {
        let groupHeaderHtml = '';
        if (group.passage) {
            groupHeaderHtml = `
                <div class="group-context-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:24px; margin-bottom:16px; box-shadow: var(--shadow-sm);">
                    <div style="margin-bottom:12px;"><span class="modal-badge warning" style="background:rgba(0,176,255,0.08); color:var(--color-interactive); border: 1px solid rgba(0,176,255,0.15);">${group.skill} - ${group.subskill}</span></div>
                    <div class="reading-passage" style="font-size:15px; line-height:1.7; color:var(--text-secondary); white-space:pre-wrap;">${group.passage}</div>
                </div>
            `;
        } else {
            let instructionText = `Mark the letter A, B, C, or D to indicate the correct answer to each of the following questions.`;
            if (group.skill === 'Phonetics') instructionText = `Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation in each of the following questions.`;
            else if (group.skill === 'Stress') instructionText = `Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress in each of the following questions.`;
            else if (group.skill === 'Error Correction') instructionText = `Mark the letter A, B, C, or D to indicate the underlined part that needs correction in each of the following questions.`;
            else if (group.skill === 'Writing') instructionText = `Finish each of the following sentences in such a way that it means the same as the sentence printed before it.`;
            else if (group.skill === 'Synonyms & Antonyms') {
                if (group.subskill === 'Opposite Meaning') instructionText = `Mark the letter A, B, C, or D to indicate the word(s) OPPOSITE in meaning to the underlined word(s) in each of the following questions.`;
                else instructionText = `Mark the letter A, B, C, or D to indicate the word(s) CLOSEST in meaning to the underlined word(s) in each of the following questions.`;
            }
            
            groupHeaderHtml = `
                <div class="group-context-card" style="margin-bottom:24px; padding:0 20px;">
                    <div style="margin-bottom:12px;"><span class="modal-badge warning" style="background:rgba(0,0,0,0.04); color:var(--text-secondary); border: 1px solid var(--border-color);">${group.skill} - ${group.subskill}</span></div>
                    <div style="font-size:15px; color:var(--text-primary); font-weight:700; line-height: 1.6; background: rgba(255,193,7,0.15); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3);">${instructionText}</div>
                </div>
            `;
        }
        
        let subQuestionsHtml = '';

        group.items.forEach(item => {
            const q = item.q;
            const idx = item.idx;
            const studentAns = AppState.examAnswers[q.id] || '';
            const isWriting = q.type === 'writing';
            const isCorrect = isWriting ? checkWrittenAnswer(studentAns, q.correct) : studentAns === q.correct;

            let interactionReviewHtml = '';
            if (isWriting) {
                const bestAlt = getBestAlternative(studentAns, q.correct);
                interactionReviewHtml = `
                    <div style="margin-bottom:20px; font-size:13px; line-height:1.6;">
                        <div style="background:var(--bg-main); padding:14px 18px; border-radius:var(--radius-sm); border: 1px solid var(--border-color); margin-bottom:12px;">
                            <span style="font-size:10px; color:var(--text-tertiary); display:block; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Câu trả lời của bạn</span>
                            <span style="color: ${isCorrect ? 'var(--color-validation-light)' : 'var(--color-danger)'}; font-weight:600;">
                                ${studentAns || '(Chưa trả lời)'}
                            </span>
                        </div>
                        <div style="background:rgba(46,125,50,0.04); padding:14px 18px; border-radius:var(--radius-sm); border: 1px solid rgba(46,125,50,0.2); margin-bottom:12px;">
                            <span style="font-size:10px; color:var(--text-tertiary); display:block; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Đáp án chính thức</span>
                            <span style="color:var(--color-validation-light); font-weight:600;">
                                ${q.correct}
                            </span>
                        </div>
                        <div style="background:rgba(0,176,255,0.04); padding:14px 18px; border-radius:var(--radius-sm); border: 1px solid rgba(0,176,255,0.2);">
                            <span style="font-size:10px; color:var(--text-tertiary); display:block; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Phân tích lỗi sai (Visual Diff)</span>
                            <div style="font-weight:600; font-size:14px; margin-top:4px;">
                                ${generateWordDiff(studentAns, bestAlt)}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                interactionReviewHtml = `
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:20px;">
                        ${Object.keys(q.options).map(o => `
                            <div style="padding:10px 16px; border-radius:var(--radius-sm); border: 1px solid ${q.correct === o ? 'var(--color-validation-light)' : (studentAns === o ? 'var(--color-danger)' : 'var(--border-color)')}; background:${q.correct === o ? 'rgba(46,125,50,0.08)' : (studentAns === o ? 'var(--color-danger-light)' : 'none')}">
                                <strong>${o}.</strong> ${q.options[o]}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            subQuestionsHtml += `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}" id="review-q-${q.id}" style="margin-bottom: 12px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <div class="review-item-header" onclick="toggleReviewItem(${q.id}, ${isCorrect})" style="display: flex; align-items: center; padding: 16px; cursor: pointer; transition: background 0.2s;">
                        
                        <div style="display:flex; align-items:center; justify-content:center; width: 40px; height: 40px; border-radius: 8px; background: ${isCorrect ? 'var(--color-validation-light)' : 'var(--color-danger)'}; color: white; font-weight: bold; font-size: 18px; margin-right: 16px; flex-shrink: 0;">
                            ${isCorrect ? '✓' : '✗'}
                        </div>
                        
                        <div style="flex-grow: 1; overflow: hidden; padding-right: 16px;">
                            <div style="font-size:12px; color:var(--text-tertiary); font-weight:700; margin-bottom:4px; text-transform:uppercase;">Câu ${idx + 1}</div>
                            <div style="font-weight:600; font-size:14px; color:var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${q.stem ? q.stem : 'Bài tập ngữ pháp / đọc hiểu...'}
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:center; gap:24px; flex-shrink: 0;">
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span style="font-size:11px; color:var(--text-tertiary); margin-bottom:2px;">Đáp án của bạn</span>
                                <span style="font-size:14px; font-weight:700; color: ${isCorrect ? 'var(--color-validation-light)' : 'var(--color-danger)'};">
                                    ${isWriting ? (studentAns ? 'Đã điền' : 'Bỏ trống') : (studentAns || 'Bỏ trống')}
                                </span>
                            </div>
                            <div style="width: 32px; height: 32px; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.04); border-radius: 50%;">
                                <i data-lucide="chevron-down" class="dropdown-chevron"></i>
                            </div>
                        </div>
                    </div>
 
                    <div class="review-item-body" style="padding:24px; background:var(--bg-main); border-top: 1px solid var(--border-color);">
                        ${q.stem ? `
                        <p style="font-weight:700; margin-bottom:12px; font-size:14px;">Đề bài chi tiết:</p>
                        <p style="background:var(--bg-card); border: 1px solid var(--border-color); padding:16px; border-radius:var(--radius-sm); font-size:14px; margin-bottom:16px;">${q.stem}</p>
                        ` : ''}
                    
                        ${interactionReviewHtml}

                        <!-- 5 Step Explainers -->
                        <div class="five-step-solution">
                            <h4 style="font-family:var(--font-heading); color:var(--color-interactive); font-size:14px; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">💡 GIẢI THÍCH CHI TIẾT 5 BƯỚC</h4>
                            
                            <div class="solution-step">
                                <span class="step-number-pill step-verdict">Phán quyết</span>
                                <div class="step-content">${q.explanation.verdict}</div>
                            </div>
                            <div class="solution-step">
                                <span class="step-number-pill step-rule">Quy tắc</span>
                                <div class="step-content">${q.explanation.rule}</div>
                            </div>
                            <div class="solution-step">
                                <span class="step-number-pill step-why">Tại sao</span>
                                <div class="step-content">${q.explanation.why}</div>
                            </div>
                            <div class="solution-step">
                                <span class="step-number-pill step-trap">Cạm bẫy</span>
                                <div class="step-content">${q.explanation.trap}</div>
                            </div>
                            <div class="solution-step">
                                <span class="step-number-pill step-tip">Mẹo 3 giây</span>
                                <div class="step-content">${q.explanation.tip}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        detailsHtml += `
            <div class="question-group-container" style="margin: 0 auto 32px; max-width: 800px;">
                ${groupHeaderHtml}
                <div class="group-questions-list">
                    ${subQuestionsHtml}
                </div>
            </div>
        `;
    });

    const xpEarned = score * 50;

    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = `
        <div class="animate-zoom">
            <div class="glass-card results-header-card">
                <div class="results-stats-left">
                    <span class="modal-badge warning" style="background:rgba(76, 175, 80, 0.15); color:var(--color-validation-light);">HOÀN THÀNH BÀI LUYỆN</span>
                    <h2 style="font-size:24px; margin: 10px 0; font-family: var(--font-heading);">${exam.title}</h2>
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">Chúc mừng bạn đã hoàn thành bài luyện. Điểm số của bạn được cộng trực tiếp vào bảng năng lực kỹ năng.</p>
                    
                    <div style="display:flex; gap:24px;">
                        <div>
                            <span style="font-size:11px; color:var(--text-tertiary); display:block; font-weight:600;">Số câu đúng</span>
                            <span style="font-size:18px; font-weight:700; color:var(--color-validation-light);">${score} / ${questions.length}</span>
                        </div>
                        <div>
                            <span style="font-size:11px; color:var(--text-tertiary); display:block; font-weight:600;">XP Tích lũy</span>
                            <span style="font-size:18px; font-weight:700; color:var(--color-discovery);">+${xpEarned} XP</span>
                        </div>
                    </div>
                </div>

                <!-- Doughnut circular SVG score progress gauge -->
                <div class="score-circle-wrapper">
                    <svg class="score-svg">
                        <circle class="score-svg-bg" cx="60" cy="60" r="55"></circle>
                        <circle class="score-svg-fill" id="results-circle-fill" cx="60" cy="60" r="55"></circle>
                    </svg>
                    <div class="score-center-text">
                        <span class="score-number">${percent}%</span>
                        <span class="score-label">Chính xác</span>
                    </div>
                </div>
            </div>

            <!-- CTA controls -->
            <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:32px;">
                ${score < questions.length ? `<button class="btn btn-primary" style="background:var(--color-danger); color:#fff; border-color:var(--color-danger);" onclick="document.getElementById('exam-active-portal').remove(); startBirdbrainExam()"><i data-lucide="brain"></i> Khắc phục ${questions.length - score} lỗi sai ngay</button>` : ''}
                <button class="btn ${score < questions.length ? 'btn-secondary' : 'btn-primary'}" onclick="document.getElementById('exam-active-portal').remove(); navigateTab('practice')"><i data-lucide="rotate-ccw"></i> Luyện đề khác</button>
                <button class="btn btn-secondary" onclick="showScannedSheet(${exam.id})"><i data-lucide="file-text"></i> Xem phiếu quét OCR gốc</button>
                <button class="btn btn-secondary" onclick="document.getElementById('exam-active-portal').remove(); navigateTab('dashboard')">Quay lại Dashboard</button>
            </div>

            <h3>Xem lại chi tiết từng câu</h3>
            <p style="font-size:12px; color:var(--text-tertiary); margin-bottom:16px;">Để nhớ lâu nhất, hãy mở chi tiết giải thích 5 bước của các câu trả lời sai.</p>
            
            <div class="review-questions-list">
                ${detailsHtml}
            </div>
        </div>
    `;

    lucide.createIcons();
    triggerConfetti();
    playSuccessSound();

    // Animate circular SVG fill
    setTimeout(() => {
        const fill = document.getElementById('results-circle-fill');
        if (fill) {
            const offset = 345.5 - (345.5 * percent) / 100;
            fill.style.strokeDashoffset = offset;
        }
    }, 100);
}

// Scanned OCR Answer sheets mapping callback
window.showScannedSheet = function(examId) {
    const modal = document.getElementById('sheet-overlay-modal');
    const img = document.getElementById('scanned-sheet-img');
    if (modal && img) {
        // Scanned answers maps clean JPG scanner worksheets
        const imgIndex = Math.abs(examId - 1) % 19;
        img.src = `assets/answers/extracted_image_${imgIndex}.jpg`;
        modal.classList.add('open');
    }
};

// Written auto-scoring contraction-aware normalizer
function normalizeText(str) {
    if (!str) return '';
    let res = str.toLowerCase();
    
    // Strip leading guide prompt (e.g. =>, => )
    res = res.replace(/^=>\s*/, '');
    
    // Remove punctuation except apostrophes (we need them for contraction normalization)
    res = res.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    // Expand abbreviations/contractions
    const contractions = {
        "i'm": "i am",
        "he's": "he is",
        "she's": "she is",
        "it's": "it is",
        "you're": "you are",
        "we're": "we are",
        "they're": "they are",
        "can't": "cannot",
        "don't": "do not",
        "doesn't": "does not",
        "didn't": "did not",
        "won't": "will not",
        "wouldn't": "would not",
        "shouldn't": "should not",
        "haven't": "have not",
        "hasn't": "has not",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not"
    };

    for (let key in contractions) {
        res = res.replace(new RegExp(key, 'g'), contractions[key]);
    }
    
    // Strip apostrophes completely for generic text-matching
    res = res.replace(/'/g, "");

    // Collapse spaces
    res = res.replace(/\s+/g, ' ');
    return res.trim();
}

// Check student rephrase against multiple correct alternative keys
function checkWrittenAnswer(student, correct) {
    const studentNormalized = normalizeText(student);
    if (!studentNormalized) return false;

    const alternatives = correct.split(/[\/;]/).map(alt => normalizeText(alt));
    return alternatives.some(alt => studentNormalized === alt);
}

// Get the closest correct answer from the list of alternatives to diff against
function getBestAlternative(student, correct) {
    const studentNormalized = normalizeText(student);
    const alternatives = correct.split(/[\/;]/).map(alt => alt.trim());
    if (alternatives.length <= 1) return alternatives[0];

    let bestAlt = alternatives[0];
    let bestScore = -1;

    const studentWords = studentNormalized.split(/\s+/);
    alternatives.forEach(alt => {
        const altNormalized = normalizeText(alt);
        const altWords = altNormalized.split(/\s+/);
        let matches = 0;
        studentWords.forEach(w => {
            if (altWords.includes(w)) matches++;
        });
        if (matches > bestScore) {
            bestScore = matches;
            bestAlt = alt;
        }
    });

    return bestAlt;
}

// Word-Level dynamic programming LCS diff algorithm
function generateWordDiff(student, correct) {
    if (!student) {
        return correct.split(/\s+/).map(w => `<span class="diff-added">${w}</span>`).join(' ');
    }

    const A = student.trim().split(/\s+/);
    const B = correct.trim().split(/\s+/);

    const m = A.length;
    const n = B.length;

    // DP Matrix
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (normalizeText(A[i - 1]) === normalizeText(B[j - 1])) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtracking
    let i = m;
    let j = n;
    const result = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && normalizeText(A[i - 1]) === normalizeText(B[j - 1])) {
            result.unshift(B[j - 1]);
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            // Word in official key is missing in student answer (Added / Missing)
            result.unshift(`<span class="diff-added">${B[j - 1]}</span>`);
            j--;
        } else {
            // Word in student answer is incorrect (Removed / Error)
            result.unshift(`<span class="diff-removed">${A[i - 1]}</span>`);
            i--;
        }
    }

    return result.join(' ');
}

// Custom Accordion Toggle with active recall safety trigger
window.toggleReviewItem = function(qId, isCorrect) {
    const item = document.getElementById(`review-q-${qId}`);
    if (!item) return;

    const isExpanded = item.classList.contains('expanded');

    if (!isExpanded && !isCorrect) {
        // Trigger Psychological Active Recall Challenge modal before showing wrong solution!
        triggerActiveRecallPuzzle(qId);
    } else {
        item.classList.toggle('expanded');
    }
};

// Active Recall Modal Trigger Engine
function triggerActiveRecallPuzzle(qId) {
    const q = EXAM_RUNNERS_DB.questions.find(item => item.id === qId);
    if (!q) return;

    AppState.failedQuestionInProgress = q;

    const modal = document.getElementById('recall-modal');
    const prompt = document.getElementById('recall-question-stem');
    const container = document.getElementById('recall-options-container');
    const feedback = document.getElementById('recall-feedback-area');
    const submitBtn = document.getElementById('submit-recall-btn');

    // Populate data
    prompt.innerText = q.recallPuzzle.prompt;
    feedback.innerHTML = '';
    feedback.className = 'puzzle-feedback';
    submitBtn.classList.add('disabled');

    container.innerHTML = '';
    q.recallPuzzle.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'puzzle-opt-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            document.querySelectorAll('.puzzle-opt-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            AppState.selectedRecallChoice = idx;
            submitBtn.classList.remove('disabled');
        };
        container.appendChild(btn);
    });

    // Show modal
    modal.classList.add('open');
}

// Active recall triggers setup
document.getElementById('close-recall-modal').onclick = closeRecallModal;
document.getElementById('skip-recall-btn').onclick = () => {
    closeRecallModal();
    revealFailedQuestionDetails();
};

document.getElementById('submit-recall-btn').onclick = () => {
    const q = AppState.failedQuestionInProgress;
    const selected = AppState.selectedRecallChoice;
    const feedback = document.getElementById('recall-feedback-area');
    const btns = document.querySelectorAll('.puzzle-opt-btn');

    if (selected === q.recallPuzzle.answerIndex) {
        feedback.innerText = "🎉 Chính xác tuyệt vời! Bạn đã ghi nhớ quy tắc cốt lõi!";
        feedback.className = "puzzle-feedback success";
        btns[selected].classList.add('correct');
        playSuccessSound();
        triggerConfetti();
        
        setTimeout(() => {
            closeRecallModal();
            revealFailedQuestionDetails();
        }, 1500);
    } else {
        feedback.innerText = "❌ Chưa chính xác rồi. Hãy thử phân tích lại xem nhé.";
        feedback.className = "puzzle-feedback error";
        btns[selected].classList.add('incorrect');
        playFailSound();
    }
};

function closeRecallModal() {
    document.getElementById('recall-modal').classList.remove('open');
}

function revealFailedQuestionDetails() {
    const q = AppState.failedQuestionInProgress;
    if (!q) return;

    const item = document.getElementById(`review-q-${q.id}`);
    if (item) {
        item.classList.add('expanded');
        // Scroll smoothly to this item
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- E. FLASHCARD DESK ---
function renderFlashcards(container) {
    if (!AppState.activeFlashcardTab) {
        AppState.activeFlashcardTab = 'topics';
    }

    if (AppState.selectedFlashcardMode !== null) {
        // Route to selected sub-game screen
        if (AppState.selectedFlashcardMode === 'standard') {
            renderStandardFlashcards(container);
        } else if (AppState.selectedFlashcardMode === 'spelling') {
            renderSpellingBee(container);
        } else if (AppState.selectedFlashcardMode === 'rapid') {
            renderRapidFire(container);
        } else if (AppState.selectedFlashcardMode === 'gravity') {
            renderGravityMatch(container);
        }
        return;
    }

    // If an active topic is selected, render Topic Detail View
    if (AppState.activeTopicId !== null) {
        renderTopicDetailView(container);
        return;
    }

    // Render 3-Tab Portal Layout
    container.innerHTML = `
        <div class="flashcard-upgrades-container animate-zoom">
            <!-- Tab Navigation Bar -->
            <div class="segmented-tabs-container">
                <button class="segmented-tab-btn ${AppState.activeFlashcardTab === 'topics' ? 'active' : ''}" onclick="switchFlashcardTab('topics')">
                    📚 Các Chủ Đề
                </button>
                <button class="segmented-tab-btn ${AppState.activeFlashcardTab === 'vocab' ? 'active' : ''}" onclick="switchFlashcardTab('vocab')">
                    🗂️ Tất Cả Từ Vựng
                </button>
                <button class="segmented-tab-btn ${AppState.activeFlashcardTab === 'import' ? 'active' : ''}" onclick="switchFlashcardTab('import')">
                    📥 Nhập Hàng Loạt
                </button>
            </div>
            
            <!-- Tab Content Container -->
            <div id="flashcard-tab-content"></div>
        </div>
    `;

    lucide.createIcons();
    renderFlashcardTabContent();
}

// Helpers for Flashcards upgrades
window.switchFlashcardTab = function(tabName) {
    AppState.activeFlashcardTab = tabName;
    
    // Update active class on tab buttons
    const btns = document.querySelectorAll('.segmented-tab-btn');
    btns.forEach(btn => {
        if (btn.innerText.includes(tabName === 'topics' ? 'Chủ Đề' : tabName === 'vocab' ? 'Từ Vựng' : 'Hàng Loạt')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderFlashcardTabContent();
};

window.escapeHtml = function(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

window.formatMarkdownAndHtml = function(str) {
    if (!str) return '';
    let escaped = window.escapeHtml(str);
    escaped = escaped.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    escaped = escaped.replace(/&lt;small\s+style=(&#039;|&quot;)(.*?)\1&gt;/gi, '<small style="$2">');
    escaped = escaped.replace(/&lt;\/small&gt;/gi, '</small>');
    
    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return formatted;
};

window.speakWord = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en-') || v.lang.includes('English'));
        if (enVoice) {
            utterance.voice = enVoice;
        }
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech Synthesis not supported in this browser.");
    }
};

window.viewTopicDetail = function(topicId) {
    AppState.activeTopicId = topicId;
    renderFlashcards(document.getElementById('app-viewport'));
};

window.exitTopicDetail = function() {
    AppState.activeTopicId = null;
    renderFlashcards(document.getElementById('app-viewport'));
};

window.showTopicQuickAddForm = function() {
    const el = document.getElementById('topic-quick-add-container');
    if (el) el.style.display = 'block';
};

window.hideTopicQuickAddForm = function() {
    const el = document.getElementById('topic-quick-add-container');
    if (el) el.style.display = 'none';
};

window.showCreateTopicForm = function() {
    const el = document.getElementById('create-topic-form-container');
    if (el) el.style.display = 'block';
};

window.hideCreateTopicForm = function() {
    const el = document.getElementById('create-topic-form-container');
    if (el) el.style.display = 'none';
};

window.submitCreateTopic = function(event) {
    event.preventDefault();
    const nameInput = document.getElementById('new-topic-name');
    const descInput = document.getElementById('new-topic-desc');
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    
    if (!name) return;
    
    const newTopic = {
        id: 'topic_' + Date.now(),
        name: name,
        desc: desc || "Chủ đề tự tạo.",
        words: []
    };
    
    AppState.topics.push(newTopic);
    saveAppStateToLocalStorage();
    
    nameInput.value = '';
    descInput.value = '';
    hideCreateTopicForm();
    
    playSuccessSound();
    triggerConfetti();
    
    renderFlashcardTabContent();
};

window.submitTopicQuickAdd = function(event, topicId) {
    event.preventDefault();
    const wordInput = document.getElementById('topic-add-word');
    const ipaInput = document.getElementById('topic-add-ipa');
    const typeSelect = document.getElementById('topic-add-type');
    const transInput = document.getElementById('topic-add-translation');
    const exInput = document.getElementById('topic-add-example');
    
    const word = wordInput.value.trim();
    const ipa = ipaInput.value.trim() || "/.../";
    const type = typeSelect.value;
    const translation = transInput.value.trim();
    const example = exInput.value.trim() || "Ví dụ chưa nhập.";
    
    if (!word || !translation) return;
    
    let currentMaxId = AppState.flashcards.reduce((max, item) => typeof item.id === 'number' ? Math.max(max, item.id) : max, 0);
    const newWordId = currentMaxId + 1;
    
    const newWord = {
        id: newWordId,
        word,
        ipa,
        translation,
        example,
        type
    };
    
    AppState.flashcards.push(newWord);
    
    if (topicId !== 'all') {
        const topic = AppState.topics.find(t => t.id === topicId);
        if (topic) {
            topic.words.push(newWordId);
        }
    }
    
    saveAppStateToLocalStorage();
    
    wordInput.value = '';
    ipaInput.value = '';
    transInput.value = '';
    exInput.value = '';
    hideTopicQuickAddForm();
    
    playSuccessSound();
    triggerConfetti();
    
    renderFlashcards(document.getElementById('app-viewport'));
};

window.openTopicBulkImporter = function(topicId) {
    AppState.activeTopicId = null;
    AppState.activeFlashcardTab = 'import';
    renderFlashcards(document.getElementById('app-viewport'));
    
    setTimeout(() => {
        const select = document.getElementById('bulk-target-topic');
        if (select) {
            select.value = topicId;
            handleBulkTargetTopicChange();
        }
    }, 50);
};

window.editWordFromTopic = function(wordId) {
    AppState.activeTopicId = null;
    AppState.activeFlashcardTab = 'vocab';
    renderFlashcards(document.getElementById('app-viewport'));
    
    setTimeout(() => {
        startEditWord(Number(wordId));
    }, 50);
};

window.deleteWordFromTopic = function(topicId, wordId) {
    const parsedId = isNaN(wordId) ? wordId : Number(wordId);
    
    if (topicId === 'all') {
        if (confirm("Bạn có chắc chắn muốn xóa từ vựng này vĩnh viễn khỏi mọi chủ đề không?")) {
            AppState.flashcards = AppState.flashcards.filter(w => w.id !== parsedId);
            AppState.topics.forEach(t => {
                t.words = t.words.filter(id => id !== parsedId);
            });
            saveAppStateToLocalStorage();
            playSuccessSound();
            renderFlashcards(document.getElementById('app-viewport'));
        }
    } else {
        if (confirm("Bạn muốn xóa từ vựng này khỏi chủ đề hiện tại?")) {
            const topic = AppState.topics.find(t => t.id === topicId);
            if (topic) {
                topic.words = topic.words.filter(id => id !== parsedId);
                saveAppStateToLocalStorage();
                playSuccessSound();
                renderFlashcards(document.getElementById('app-viewport'));
            }
        }
    }
};

window.deleteTopic = function(topicId) {
    if (topicId === 'all') return;
    
    const topic = AppState.topics.find(t => t.id === topicId);
    if (!topic) return;
    
    if (confirm(`Bạn có chắc chắn muốn xóa chủ đề "${topic.name}" không?\n(Lưu ý: Các từ vựng thuộc chủ đề này vẫn sẽ được giữ lại trong danh sách "Tất Cả Từ Vựng")`)) {
        AppState.topics = AppState.topics.filter(t => t.id !== topicId);
        
        if (!AppState.deletedTopicIds) {
            AppState.deletedTopicIds = [];
        }
        if (!AppState.deletedTopicIds.includes(topicId)) {
            AppState.deletedTopicIds.push(topicId);
        }
        
        if (AppState.activeTopicId === topicId) {
            AppState.activeTopicId = null;
        }
        
        saveAppStateToLocalStorage();
        playSuccessSound();
        
        AppState.activeFlashcardTab = 'topics';
        renderFlashcards(document.getElementById('app-viewport'));
    }
};

window.startEditWord = function(wordId) {
    const wordObj = AppState.flashcards.find(w => w.id === wordId);
    if (!wordObj) return;
    
    AppState.editingWordId = wordId;
    
    const title = document.getElementById('vocab-form-title');
    const wordInput = document.getElementById('vocab-word');
    const ipaInput = document.getElementById('vocab-ipa');
    const typeSelect = document.getElementById('vocab-type');
    const transInput = document.getElementById('vocab-translation');
    const exInput = document.getElementById('vocab-example');
    const cancelBtn = document.getElementById('vocab-cancel-btn');
    const submitBtn = document.getElementById('vocab-submit-btn');
    
    if (title) title.innerText = "📝 Cập nhật từ vựng";
    if (wordInput) wordInput.value = wordObj.word;
    if (ipaInput) ipaInput.value = wordObj.ipa || '';
    if (typeSelect) typeSelect.value = wordObj.type || 'Noun';
    if (transInput) transInput.value = wordObj.translation;
    if (exInput) exInput.value = wordObj.example || '';
    
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (submitBtn) submitBtn.innerText = "Cập nhật";
    
    const card = document.getElementById('vocab-form-card');
    if (card) card.scrollIntoView({ behavior: 'smooth' });
};

window.cancelEditWord = function() {
    AppState.editingWordId = null;
    const title = document.getElementById('vocab-form-title');
    const form = document.getElementById('vocab-form');
    const cancelBtn = document.getElementById('vocab-cancel-btn');
    const submitBtn = document.getElementById('vocab-submit-btn');
    
    if (title) title.innerText = "➕ Thêm từ vựng nhanh";
    if (form) form.reset();
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (submitBtn) submitBtn.innerText = "Thêm từ";
};

window.submitVocabForm = function(event) {
    event.preventDefault();
    const wordInput = document.getElementById('vocab-word');
    const ipaInput = document.getElementById('vocab-ipa');
    const typeSelect = document.getElementById('vocab-type');
    const transInput = document.getElementById('vocab-translation');
    const exInput = document.getElementById('vocab-example');
    
    const word = wordInput.value.trim();
    const ipa = ipaInput.value.trim() || "/.../";
    const type = typeSelect.value;
    const translation = transInput.value.trim();
    const example = exInput.value.trim() || "Ví dụ chưa nhập.";
    
    if (!word || !translation) return;
    
    if (AppState.editingWordId) {
        const wordObj = AppState.flashcards.find(w => w.id === AppState.editingWordId);
        if (wordObj) {
            wordObj.word = word;
            wordObj.ipa = ipa;
            wordObj.type = type;
            wordObj.translation = translation;
            wordObj.example = example;
            
            saveAppStateToLocalStorage();
            cancelEditWord();
            playSuccessSound();
            renderFlashcardTabContent();
        }
    } else {
        let currentMaxId = AppState.flashcards.reduce((max, item) => typeof item.id === 'number' ? Math.max(max, item.id) : max, 0);
        const newWordId = currentMaxId + 1;
        
        const newWord = {
            id: newWordId,
            word,
            ipa,
            translation,
            example,
            type
        };
        
        AppState.flashcards.push(newWord);
        saveAppStateToLocalStorage();
        
        wordInput.value = '';
        ipaInput.value = '';
        transInput.value = '';
        exInput.value = '';
        
        playSuccessSound();
        triggerConfetti();
        renderFlashcardTabContent();
    }
};

window.deleteWordGlobally = function(wordId) {
    const parsedId = isNaN(wordId) ? wordId : Number(wordId);
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này vĩnh viễn không?")) {
        AppState.flashcards = AppState.flashcards.filter(w => w.id !== parsedId);
        AppState.topics.forEach(t => {
            t.words = t.words.filter(id => id !== parsedId);
        });
        
        saveAppStateToLocalStorage();
        playSuccessSound();
        renderFlashcardTabContent();
    }
};

window.handleSearchAndFilter = function() {
    const query = document.getElementById('vocab-search').value.toLowerCase().trim();
    const typeFilter = document.getElementById('vocab-filter-type').value;
    
    const rows = document.querySelectorAll('.vocab-table-row');
    rows.forEach(row => {
        const wordText = row.getAttribute('data-word').toLowerCase();
        const transText = row.getAttribute('data-translation').toLowerCase();
        const typeText = row.getAttribute('data-type');
        
        const matchesSearch = wordText.includes(query) || transText.includes(query);
        const matchesType = typeFilter === 'all' || typeText === typeFilter;
        
        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

window.parseBulkInput = function() {
    const text = document.getElementById('bulk-textarea').value;
    const termSep = document.getElementById('bulk-sep-term').value;
    const rowSep = document.getElementById('bulk-sep-row').value;
    const previewContainer = document.getElementById('bulk-preview-container');
    const previewBody = document.getElementById('bulk-preview-body');
    const countBadge = document.getElementById('bulk-preview-count');
    
    if (!text.trim()) {
        if (previewContainer) previewContainer.style.display = 'none';
        return;
    }
    
    let rows = [];
    if (rowSep === 'newline') {
        rows = text.split('\n');
    } else {
        rows = text.split(rowSep);
    }
    
    let parsedCount = 0;
    let html = '';
    
    rows.forEach((row) => {
        if (!row.trim()) return;
        
        let term = '';
        let definition = '';
        
        const parts = row.split(termSep);
        if (parts.length >= 2) {
            term = parts[0].trim();
            definition = parts.slice(1).join(termSep).trim();
        } else {
            term = row.trim();
            definition = '';
        }
        
        if (term) {
            parsedCount++;
            html += `
                <tr>
                    <td>${parsedCount}</td>
                    <td style="font-weight: 700; color: var(--text-primary);">${escapeHtml(term)}</td>
                    <td style="color: var(--color-interactive);">${escapeHtml(definition || '(Thiếu nghĩa)')}</td>
                    <td><span class="modal-badge ${definition ? 'success' : 'warning'}">${definition ? 'Hợp lệ' : 'Thiếu nghĩa'}</span></td>
                </tr>
            `;
        }
    });
    
    if (parsedCount > 0) {
        if (previewBody) previewBody.innerHTML = html;
        if (countBadge) countBadge.innerText = `${parsedCount} từ được tìm thấy`;
        if (previewContainer) previewContainer.style.display = 'block';
    } else {
        if (previewContainer) previewContainer.style.display = 'none';
    }
};

window.submitBulkImport = function() {
    const text = document.getElementById('bulk-textarea').value;
    const termSep = document.getElementById('bulk-sep-term').value;
    const rowSep = document.getElementById('bulk-sep-row').value;
    const topicOption = document.getElementById('bulk-target-topic').value;
    const newTopicName = document.getElementById('bulk-new-topic-name').value.trim();
    
    if (!text.trim()) return;
    
    let rows = [];
    if (rowSep === 'newline') {
        rows = text.split('\n');
    } else {
        rows = text.split(rowSep);
    }
    
    const importedWords = [];
    let currentMaxId = AppState.flashcards.reduce((max, item) => typeof item.id === 'number' ? Math.max(max, item.id) : max, 0);
    
    rows.forEach((row) => {
        if (!row.trim()) return;
        
        const parts = row.split(termSep);
        let term = '';
        let definition = '';
        
        if (parts.length >= 2) {
            term = parts[0].trim();
            definition = parts.slice(1).join(termSep).trim();
        } else {
            term = row.trim();
            definition = '';
        }
        
        if (term) {
            currentMaxId++;
            importedWords.push({
                id: currentMaxId,
                word: term,
                ipa: "/.../",
                translation: definition || "Nghĩa chưa nhập",
                example: "Ví dụ chưa nhập.",
                type: "Noun"
            });
        }
    });
    
    if (importedWords.length === 0) return;
    
    AppState.flashcards = [...AppState.flashcards, ...importedWords];
    
    let targetTopic = null;
    if (topicOption === 'create') {
        if (!newTopicName) {
            alert("Vui lòng nhập tên chủ đề mới!");
            return;
        }
        const newTopicId = 'topic_' + Date.now();
        targetTopic = {
            id: newTopicId,
            name: newTopicName,
            desc: "Chủ đề tự tạo từ Bulk Importer.",
            words: importedWords.map(w => w.id)
        };
        AppState.topics.push(targetTopic);
        AppState.activeTopicId = newTopicId;
    } else if (topicOption !== 'none') {
        targetTopic = AppState.topics.find(t => t.id === topicOption);
        if (targetTopic) {
            targetTopic.words = [...targetTopic.words, ...importedWords.map(w => w.id)];
            AppState.activeTopicId = targetTopic.id;
        }
    } else {
        AppState.activeTopicId = 'all';
    }
    
    saveAppStateToLocalStorage();
    
    document.getElementById('bulk-textarea').value = '';
    document.getElementById('bulk-preview-container').style.display = 'none';
    const bulkNewTopicContainer = document.getElementById('bulk-new-topic-name-container');
    if (bulkNewTopicContainer) bulkNewTopicContainer.style.display = 'none';
    document.getElementById('bulk-new-topic-name').value = '';
    
    playSuccessSound();
    triggerConfetti();
    
    if (targetTopic) {
        viewTopicDetail(targetTopic.id);
    } else {
        AppState.activeTopicId = null;
        AppState.activeFlashcardTab = 'vocab';
        renderFlashcards(document.getElementById('app-viewport'));
    }
};

window.handleBulkTargetTopicChange = function() {
    const val = document.getElementById('bulk-target-topic').value;
    const nameContainer = document.getElementById('bulk-new-topic-name-container');
    if (nameContainer) {
        if (val === 'create') {
            nameContainer.style.display = 'block';
        } else {
            nameContainer.style.display = 'none';
        }
    }
};

function renderFlashcardTabContent() {
    const tabContent = document.getElementById('flashcard-tab-content');
    if (!tabContent) return;
    
    if (AppState.activeFlashcardTab === 'topics') {
        let gridHtml = `
            <!-- Topics Grid -->
            <div class="topics-grid">
                <!-- All Vocabulary seeded card -->
                <div class="topic-card topic-card--featured" onclick="viewTopicDetail('all')">
                    <div class="topic-card-body">
                        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-commitment); display: block; margin-bottom: 6px;">⭐ NỔI BẬT</span>
                        <h3>Tất Cả Từ Vựng</h3>
                        <p>Học toàn bộ kho từ vựng đã tích lũy trong tài khoản của bạn. Bứt phá phản xạ trước thềm kỳ thi 10.</p>
                    </div>
                    <div class="topic-card-footer">
                        <span class="topic-count">${AppState.flashcards.length} Từ Vựng</span>
                        <button class="btn btn-primary topic-study-btn" onclick="event.stopPropagation(); viewTopicDetail('all')">Học toàn bộ →</button>
                    </div>
                </div>
        `;
        
        AppState.topics.forEach(topic => {
            gridHtml += `
                <div class="topic-card" onclick="viewTopicDetail('${topic.id}')">
                    <div class="topic-card-body">
                        <h3>${escapeHtml(topic.name)}</h3>
                        <p>${escapeHtml(topic.desc)}</p>
                    </div>
                    <div class="topic-card-footer">
                        <span class="topic-count">${topic.words.length} từ vựng</span>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); deleteTopic('${topic.id}')" style="border-color: rgba(211,47,47,0.4); color: var(--color-danger); padding: 6px 10px; font-size: 11px; font-weight: 700;" title="Xóa chủ đề">🗑️</button>
                            <button class="btn btn-secondary topic-study-btn" style="border-color: var(--color-interactive); color: var(--color-interactive); font-weight:700; margin: 0;">Học ngay →</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        gridHtml += `
                <!-- Add Topic Card -->
                <div class="topic-card" onclick="showCreateTopicForm()" style="border-style: dashed; border-color: var(--border-color); display: flex; align-items: center; justify-content: center; min-height: 180px;">
                    <div style="text-align: center;">
                        <span style="font-size: 32px; color: var(--text-tertiary);">➕</span>
                        <h3 style="font-family: var(--font-heading); font-size: 15px; margin-top: 12px; color: var(--text-secondary);">Tạo chủ đề mới</h3>
                    </div>
                </div>
            </div>
            
            <!-- Create Topic Form Inline Container (hidden by default) -->
            <div id="create-topic-form-container" class="glass-card" style="display: none; padding: 28px; margin-top: 32px; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="font-family: var(--font-heading); font-weight: 800; font-size: 18px;">➕ Tạo chủ đề học tập mới</h3>
                    <button class="btn btn-secondary" onclick="hideCreateTopicForm()" style="padding: 4px 12px; font-size: 12px;">Hủy</button>
                </div>
                <form onsubmit="submitCreateTopic(event)">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label" style="font-size: 12px; text-transform:uppercase; font-weight:700;">Tên chủ đề</label>
                        <input type="text" class="form-input" id="new-topic-name" placeholder="Ví dụ: Chuyên đề Rút gọn Mệnh đề Quan hệ" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label" style="font-size: 12px; text-transform:uppercase; font-weight:700;">Mô tả ngắn</label>
                        <input type="text" class="form-input" id="new-topic-desc" placeholder="Ví dụ: Tổng hợp các động từ đi kèm giới từ đặc sắc thường gặp trong câu viết lại điểm 9, 10.">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Tạo Chủ Đề</button>
                </form>
            </div>
        `;
        
        tabContent.innerHTML = gridHtml;
    } else if (AppState.activeFlashcardTab === 'vocab') {
        let vocabHtml = `
            <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start;">
                <!-- Left: Search + Table -->
                <div>
                    <!-- Search Toolbar -->
                    <div class="glass-card" style="padding: 16px; margin-bottom: 20px; display: flex; gap: 12px; align-items: center;">
                        <div style="flex: 1; position: relative;">
                            <input type="text" class="form-input" id="vocab-search" oninput="handleSearchAndFilter()" placeholder="Tìm kiếm nhanh theo từ Tiếng Anh hoặc nghĩa Tiếng Việt..." style="padding-left: 36px;">
                            <span style="position: absolute; left: 12px; top: 11px; color: var(--text-tertiary);">🔍</span>
                        </div>
                        <div style="width: 180px;">
                            <select class="form-input" id="vocab-filter-type" onchange="handleSearchAndFilter()">
                                <option value="all">Tất cả loại từ</option>
                                <option value="Noun">Noun (Danh từ)</option>
                                <option value="Verb">Verb (Động từ)</option>
                                <option value="Adjective">Adjective (Tính từ)</option>
                                <option value="Adverb">Adverb (Trạng từ)</option>
                                <option value="Phrasal Verb">Phrasal Verb (Cụm động từ)</option>
                                <option value="Idiom">Idiom (Thành ngữ)</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Table Grid -->
                    <div class="glass-card" style="padding: 0; overflow: hidden; border: 1px solid var(--border-color);">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                            <thead>
                                <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border-color); color: var(--text-tertiary); text-transform: uppercase; font-size: 11px; font-weight: 700;">
                                    <th style="padding: 14px 16px; width: 40px;">Loa</th>
                                    <th style="padding: 14px 16px;">Từ vựng / IPA</th>
                                    <th style="padding: 14px 16px; width: 100px;">Loại</th>
                                    <th style="padding: 14px 16px;">Nghĩa Tiếng Việt</th>
                                    <th style="padding: 14px 16px; width: 130px; text-align: right;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="vocab-table-body">
        `;
        
        if (AppState.flashcards.length === 0) {
            vocabHtml += `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                        Không có từ vựng nào trong kho toàn cục. Vui lòng thêm từ hoặc nhập hàng loạt từ vựng bên phải!
                    </td>
                </tr>
            `;
        } else {
            AppState.flashcards.forEach(w => {
                vocabHtml += `
                    <tr class="vocab-table-row" data-word="${escapeHtml(w.word)}" data-translation="${escapeHtml(w.translation)}" data-type="${w.type || 'Noun'}" style="border-bottom: 1px solid var(--border-color); transition: all 0.2s ease;">
                        <td style="padding: 12px 16px; vertical-align: middle;">
                            <button class="btn-pronounce" onclick="speakWord('${escapeHtml(w.word)}')" title="Phát âm" style="width:28px; height:28px; font-size:11px;">
                                🔊
                            </button>
                        </td>
                        <td style="padding: 12px 16px;">
                            <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${escapeHtml(w.word)}</div>
                            <div style="color: var(--text-tertiary); font-size: 11px; margin-top: 2px;">${escapeHtml(w.ipa || '')}</div>
                        </td>
                        <td style="padding: 12px 16px;">
                            <span class="modal-badge warning" style="font-size: 10px; font-weight: normal; padding: 2px 6px;">${w.type || 'Noun'}</span>
                        </td>
                        <td style="padding: 12px 16px;">
                            <div style="color: var(--color-interactive); font-weight: 600;">${escapeHtml(w.translation)}</div>
                            ${w.example ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">"${window.formatMarkdownAndHtml(w.example)}"</div>` : ''}
                        </td>
                        <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
                            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px; margin-right: 6px;" onclick="startEditWord(${w.id})">Sửa</button>
                            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px; border-color: rgba(211,47,47,0.4); color: #ff5252;" onclick="deleteWordGlobally(${w.id})">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        vocabHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Right: Quick Add Form Card -->
                <div class="glass-card" id="vocab-form-card" style="padding: 24px; position: sticky; top: 20px; border: 1px solid var(--border-color);">
                    <h3 id="vocab-form-title" style="font-family: var(--font-heading); font-size: 16px; font-weight: 800; margin-bottom: 20px;">➕ Thêm từ vựng nhanh</h3>
                    <form id="vocab-form" onsubmit="submitVocabForm(event)">
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" style="font-size: 11px;">Từ Tiếng Anh</label>
                            <input type="text" class="form-input" id="vocab-word" placeholder="Ví dụ: Transform" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" style="font-size: 11px;">Phát âm (IPA)</label>
                            <input type="text" class="form-input" id="vocab-ipa" placeholder="Ví dụ: /trænsˈfɔːm/">
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" style="font-size: 11px;">Loại từ</label>
                            <select class="form-input" id="vocab-type">
                                <option value="Noun">Noun (Danh từ)</option>
                                <option value="Verb">Verb (Động từ)</option>
                                <option value="Adjective">Adjective (Tính từ)</option>
                                <option value="Adverb">Adverb (Trạng từ)</option>
                                <option value="Phrasal Verb">Phrasal Verb (Cụm động từ)</option>
                                <option value="Idiom">Idiom (Thành ngữ)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" style="font-size: 11px;">Giải nghĩa Tiếng Việt</label>
                            <input type="text" class="form-input" id="vocab-translation" placeholder="Ví dụ: Biến đổi, thay dạng" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label" style="font-size: 11px;">Ví dụ ngữ cảnh</label>
                            <textarea class="form-input" id="vocab-example" placeholder="Ví dụ: The caterpillar transformed into a butterfly." style="min-height: 60px; font-size: 12px; resize: none;"></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn btn-secondary" id="vocab-cancel-btn" onclick="cancelEditWord()" style="display: none; flex: 1;">Hủy</button>
                            <button type="submit" class="btn btn-primary" id="vocab-submit-btn" style="flex: 2;">Thêm từ</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        tabContent.innerHTML = vocabHtml;
    } else if (AppState.activeFlashcardTab === 'import') {
        let importHtml = `
            <div class="glass-card animate-zoom" style="padding: 32px; border: 1px solid var(--border-color);">
                <div style="margin-bottom: 24px;">
                    <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 800;">📥 Trình Nhập Dữ Liệu Hàng Loạt (Quizlet Bulk Importer)</h3>
                    <p style="color: var(--text-secondary); margin-top: 6px; font-size: 12px; line-height: 1.5;">Dán danh sách từ vựng của bạn từ Excel, Docs hoặc văn bản thô. Trình nhập sẽ phân tích cấu trúc theo bộ chia của bạn để gieo từ vựng ngay lập tức.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label class="form-label" style="font-size: 11px; text-transform: uppercase;">Bộ tách Từ & Nghĩa (Term Separator)</label>
                        <select class="form-input" id="bulk-sep-term" onchange="parseBulkInput()">
                            <option value="-">Dấu gạch ngang ( - )</option>
                            <option value=";">Dấu chấm phẩy ( ; )</option>
                            <option value=",">Dấu phẩy ( , )</option>
                            <option value="&#09;">Ký tự Tab</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size: 11px; text-transform: uppercase;">Bộ tách dòng (Row Separator)</label>
                        <select class="form-input" id="bulk-sep-row" onchange="parseBulkInput()">
                            <option value="newline">Xuống dòng mới (New line)</option>
                            <option value="|">Thanh dọc ( | )</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" style="font-size: 11px; text-transform: uppercase;">Dán nội dung từ vựng vào đây</label>
                    <textarea class="form-input" id="bulk-textarea" oninput="parseBulkInput()" placeholder="Ví dụ:\nInvestigate - Điều tra, nghiên cứu kỹ\nExtensive - Rộng rãi, bao phủ lớn\nButterflies in stomach - Cảm giác bồn chồn" style="min-height: 160px; font-family: monospace; font-size: 13px; line-height: 1.6; resize: vertical;"></textarea>
                </div>
                
                <!-- Target Topic select -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; margin-bottom: 24px;">
                    <div class="form-group">
                        <label class="form-label" style="font-size: 11px; text-transform: uppercase;">Chủ đề đích (Target Topic)</label>
                        <select class="form-input" id="bulk-target-topic" onchange="handleBulkTargetTopicChange()">
                            <option value="none">Không lưu vào chủ đề (Chỉ lưu Tất Cả)</option>
                            <option value="create">Tạo chủ đề mới tự động...</option>
                            ${AppState.topics.map(t => `<option value="${t.id}">Chủ đề: ${escapeHtml(t.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="bulk-new-topic-name-container" style="display: none;">
                        <label class="form-label" style="font-size: 11px; text-transform: uppercase;">Tên chủ đề mới</label>
                        <input type="text" class="form-input" id="bulk-new-topic-name" placeholder="Ví dụ: Chủ đề môi trường cao cấp">
                    </div>
                </div>
                
                <!-- Live Preview Block -->
                <div class="preview-table-container" id="bulk-preview-container">
                    <div class="preview-title" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Xem trước kết quả phân tách (Live Preview)</span>
                        <span id="bulk-preview-count" style="background: rgba(0, 176, 255, 0.15); color: var(--color-interactive); padding: 2px 8px; border-radius: 4px;">0 từ</span>
                    </div>
                    <div style="max-height: 240px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                            <thead>
                                <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border-color); color: var(--text-tertiary); text-transform: uppercase; font-size: 10px; font-weight: 700;">
                                    <th style="padding: 8px 12px; width: 30px;">#</th>
                                    <th style="padding: 8px 12px;">Từ vựng (English)</th>
                                    <th style="padding: 8px 12px;">Giải nghĩa (Vietnamese)</th>
                                    <th style="padding: 8px 12px; width: 80px;">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody id="bulk-preview-body"></tbody>
                        </table>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="submitBulkImport()" style="width: 100%; padding: 12px 24px; font-weight: 700;">
                    📥 Tiến hành Nhập Kho Từ Vựng
                </button>
            </div>
        `;
        
        tabContent.innerHTML = importHtml;
    }
}

function renderTopicDetailView(container) {
    const topicId = AppState.activeTopicId;
    let topic;
    let topicWords = [];
    
    if (topicId === 'all') {
        topic = {
            id: 'all',
            name: "Tất Cả Từ Vựng",
            desc: "Tổng hợp toàn bộ kho từ vựng đã tích lũy của học sinh trong tài khoản. Rèn luyện phản xạ toàn thư tốt nhất cho đề thi tiếng Anh 10."
        };
        topicWords = [...AppState.flashcards];
    } else {
        topic = AppState.topics.find(t => t.id === topicId);
        if (topic) {
            topicWords = AppState.flashcards.filter(w => topic.words.includes(w.id));
        } else {
            topic = { id: 'unknown', name: 'Unknown Topic', desc: '' };
        }
    }
    
    container.innerHTML = `
        <div class="topic-detail-container animate-zoom" style="max-width: 800px; margin: 0 auto;">
            <!-- Back Navigation & Action Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <button class="btn btn-secondary" onclick="exitTopicDetail()" style="padding: 8px 16px; font-size: 13px;">
                    ← Quay lại danh sách chủ đề
                </button>
                ${topicId !== 'all' ? `
                    <button class="btn btn-secondary" onclick="deleteTopic('${topic.id}')" style="border-color: rgba(211,47,47,0.4); color: var(--color-danger); padding: 8px 16px; font-size: 13px; font-weight: 700;">
                        🗑️ Xóa chủ đề này
                    </button>
                ` : ''}
            </div>
            
            <!-- Topic Info Card -->
            <div class="glass-card" style="padding: 28px; margin-bottom: 28px;">
                <h2 style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--text-primary);">${escapeHtml(topic.name)}</h2>
                <p style="color: var(--text-secondary); margin-top: 8px; font-size: 13px; line-height: 1.6;">${escapeHtml(topic.desc)}</p>
                <div style="margin-top: 16px;">
                    <span class="modal-badge warning" style="background: rgba(0, 176, 255, 0.1); color: var(--color-interactive); font-weight: 600;">
                        ${topicWords.length} từ vựng trong chủ đề
                    </span>
                </div>
            </div>
            
            <!-- 4 Mini-games Portal Grid -->
            <div style="margin-bottom: 36px;">
                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                    🎮 Chế độ ôn tập chủ đề
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <!-- Game 1: 3D Flashcards -->
                    <div class="glass-card game-mode-tile" onclick="startStudyTopic('${topic.id}', 'standard')" style="cursor: pointer; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color);">
                        <div style="font-size: 28px;">🗂️</div>
                        <div style="text-align: left;">
                            <h4 style="font-family: var(--font-heading); font-size: 14px; font-weight:700; color: var(--text-primary);">Thẻ lật 3D</h4>
                            <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">Spaced Repetition cổ điển</p>
                        </div>
                    </div>
                    
                    <!-- Game 2: Spelling Bee -->
                    <div class="glass-card game-mode-tile" onclick="startStudyTopic('${topic.id}', 'spelling')" style="cursor: pointer; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color);">
                        <div style="font-size: 28px;">🐝</div>
                        <div style="text-align: left;">
                            <h4 style="font-family: var(--font-heading); font-size: 14px; font-weight:700; color: var(--text-primary);">Thử thách Đánh vần</h4>
                            <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">Luyện gõ đúng ngữ cảnh</p>
                        </div>
                    </div>
                    
                    <!-- Game 3: Rapid MCQ -->
                    <div class="glass-card game-mode-tile" onclick="startStudyTopic('${topic.id}', 'rapid')" style="cursor: pointer; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color);">
                        <div style="font-size: 28px;">⚡</div>
                        <div style="text-align: left;">
                            <h4 style="font-family: var(--font-heading); font-size: 14px; font-weight:700; color: var(--text-primary);">Trắc nghiệm Tốc độ</h4>
                            <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">Phản xạ 20s đếm ngược</p>
                        </div>
                    </div>
                    
                    <!-- Game 4: Gravity Match -->
                    <div class="glass-card game-mode-tile" onclick="startStudyTopic('${topic.id}', 'gravity')" style="cursor: pointer; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color);">
                        <div style="font-size: 28px;">🌌</div>
                        <div style="text-align: left;">
                            <h4 style="font-family: var(--font-heading); font-size: 14px; font-weight:700; color: var(--text-primary);">Ghép cặp Trọng lực</h4>
                            <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">Ghép nối các thẻ song ngữ</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Topic Words List -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                    <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                        📋 Danh sách từ vựng chủ đề
                    </h3>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="showTopicQuickAddForm()" style="font-size: 11px; padding: 6px 12px; font-weight:700;">
                            ➕ Thêm từ nhanh
                        </button>
                        <button class="btn btn-secondary" onclick="openTopicBulkImporter('${topic.id}')" style="font-size: 11px; padding: 6px 12px; font-weight:700;">
                            📥 Nhập hàng loạt
                        </button>
                    </div>
                </div>
                
                <!-- Topic Quick Add Form inline card -->
                <div id="topic-quick-add-container" class="glass-card" style="display: none; padding: 24px; margin-bottom: 24px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h4 style="font-family: var(--font-heading); font-weight: 800; font-size: 14px;">➕ Thêm từ vựng nhanh vào chủ đề</h4>
                        <button class="btn btn-secondary" onclick="hideTopicQuickAddForm()" style="padding: 4px 10px; font-size: 11px;">Hủy</button>
                    </div>
                    <form onsubmit="submitTopicQuickAdd(event, '${topic.id}')">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 12px;">
                            <input type="text" class="form-input" id="topic-add-word" placeholder="Từ Tiếng Anh (Ví dụ: Analyze)" required>
                            <input type="text" class="form-input" id="topic-add-ipa" placeholder="Phát âm (Ví dụ: /ˈæn.əl.aɪz/)">
                            <select class="form-input" id="topic-add-type">
                                <option value="Noun">Noun (Danh từ)</option>
                                <option value="Verb">Verb (Động từ)</option>
                                <option value="Adjective">Adjective (Tính từ)</option>
                                <option value="Adverb">Adverb (Trạng từ)</option>
                                <option value="Phrasal Verb">Phrasal Verb (Cụm động từ)</option>
                                <option value="Idiom">Idiom (Thành ngữ)</option>
                            </select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                            <input type="text" class="form-input" id="topic-add-translation" placeholder="Giải nghĩa Tiếng Việt" required>
                            <input type="text" class="form-input" id="topic-add-example" placeholder="Ví dụ đặt câu">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; font-size: 12px; padding: 10px 20px;">Lưu vào chủ đề</button>
                    </form>
                </div>
                
                <div class="word-cards-list">
                    ${topicWords.length === 0 ? `
                        <div class="glass-card" style="text-align: center; padding: 48px; color: var(--text-tertiary); border: 1px dashed var(--border-color);">
                            Chủ đề này chưa có từ vựng nào. Hãy dán văn bản hàng loạt hoặc thêm từ nhanh ở trên!
                        </div>
                    ` : topicWords.map(w => `
                        <div class="word-card-item">
                            <div class="word-card-left">
                                <button class="btn-pronounce" onclick="speakWord('${escapeHtml(w.word)}')" title="Phát âm">
                                    🔊
                                </button>
                                <div class="word-card-info">
                                    <h4>${escapeHtml(w.word)} <span class="modal-badge warning" style="font-size: 9px; padding: 2px 6px; font-weight: normal; margin-left: 8px;">${w.type || 'Noun'}</span></h4>
                                    <div class="word-meta">${escapeHtml(w.ipa || '')}</div>
                                    <div class="word-translation">${escapeHtml(w.translation)}</div>
                                    ${w.example ? `<div class="word-example">"${window.formatMarkdownAndHtml(w.example)}"</div>` : ''}
                                </div>
                            </div>
                            <div class="word-card-actions">
                                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;" onclick="editWordFromTopic(${w.id})">Sửa</button>
                                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px; border-color: rgba(211,47,47,0.4); color: var(--color-danger);" onclick="deleteWordFromTopic('${topic.id}', ${w.id})">Xóa</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    
    // Add CSS hover glows to the topic games tiles
    const tiles = document.querySelectorAll('.game-mode-tile');
    tiles.forEach(tile => {
        tile.addEventListener('mouseenter', () => {
            tile.style.borderColor = 'var(--color-interactive)';
            tile.style.boxShadow = 'var(--shadow-glow-cyan)';
            tile.style.transform = 'translateY(-2px)';
            tile.style.background = 'rgba(255, 255, 255, 0.02)';
        });
        tile.addEventListener('mouseleave', () => {
            tile.style.borderColor = 'var(--border-color)';
            tile.style.boxShadow = 'none';
            tile.style.transform = 'none';
            tile.style.background = 'rgba(255, 255, 255, 0.01)';
        });
    });
}

window.startStudyTopic = function(topicId, mode) {
    AppState.activeTopicId = topicId;
    
    // Select correct words list
    let list;
    if (topicId === 'all') {
        list = [...AppState.flashcards];
    } else {
        const topic = AppState.topics.find(t => t.id === topicId);
        if (topic) {
            list = AppState.flashcards.filter(w => topic.words.includes(w.id));
        } else {
            list = [];
        }
    }
    
    if (list.length === 0) {
        alert("Chủ đề này chưa có từ vựng để ôn tập! Vui lòng thêm từ vựng trước.");
        return;
    }
    
    AppState.flashcardQueue = [...list];
    AppState.currentFlashcardIndex = 0;
    
    selectFlashcardMode(mode);
};

window.selectFlashcardMode = function(mode) {
    // Clear rapid timers if any
    if (AppState.rapidTimerInterval) clearInterval(AppState.rapidTimerInterval);
    AppState.selectedFlashcardMode = mode;
    renderFlashcards(document.getElementById('app-viewport'));
};

function renderStandardFlashcards(container) {
    container.innerHTML = `
        <div class="animate-zoom" style="max-width: 600px; margin: 0 auto;">
            <button class="btn btn-secondary" onclick="selectFlashcardMode(null)" style="margin-bottom: 24px;"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
            
            <div class="flashcard-stage">
                <div style="text-align:center;">
                    <h3>Bàn học flashcard 3D</h3>
                    <p style="font-size:12px; color:var(--text-tertiary); margin-top:4px;">Chạm vào thẻ để lật ngược xem ý nghĩa, IPA và ví dụ cụ thể.</p>
                </div>

                <!-- 3D flipping card wrapper -->
                <div class="flashcard-3d-container" id="fc-3d-card" onclick="flipFlashcard()">
                    <div class="flashcard-flipper">
                        <div class="card-face front">
                            <span class="modal-badge warning" style="position:absolute; top:16px; left:16px;" id="fc-tag-txt">Noun</span>
                            <span id="fc-status-badge" style="position:absolute; top:16px; right:16px;"></span>
                            <h2 class="card-front-word" id="fc-word-txt">Investigate</h2>
                            <span class="card-ipa" id="fc-ipa-txt">/ɪnˈves.tɪ.ɡeɪt/</span>
                            <span class="card-tip-label">Nhấp chuột để lật thẻ</span>
                        </div>
                        <div class="card-face back">
                            <h3 class="card-back-translation" id="fc-trans-txt">Điều tra, khám phá</h3>
                            <p class="card-back-example" id="fc-ex-txt">The police are investigating the cause of the accident.</p>
                            <span class="card-tip-label">Nhấp chuột để lật lại</span>
                        </div>
                    </div>
                </div>

                <!-- Learning action triggers -->
                <div class="learning-action-row">
                    <button class="btn btn-secondary" style="border-color:var(--color-danger); color:var(--color-danger); background:var(--color-danger-light);" onclick="swipeFlashcard('left')">Chưa thuộc ✗</button>
                    <button class="btn btn-secondary" style="border-color:var(--color-discovery); color:var(--color-discovery); background:rgba(255,193,7,0.05);" onclick="swipeFlashcard('stay')">Đang học 🔄</button>
                    <button class="btn btn-primary" style="background:var(--color-validation); box-shadow:none; color:#fff;" onclick="swipeFlashcard('right')">Đã thuộc ✓</button>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
    updateFlashcardContent();
}

function renderSpellingBee(container) {
    if (AppState.flashcardQueue.length === 0) {
        container.innerHTML = `
            <div class="animate-zoom" style="max-width: 600px; margin: 0 auto; text-align: center;">
                <button class="btn btn-secondary" onclick="selectFlashcardMode(null)" style="margin-bottom: 24px;"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
                <div class="glass-card" style="padding:40px;">
                    <h3>🎉 Tuyệt vời!</h3>
                    <p style="font-size:13px; color:var(--text-secondary); margin-top:8px;">Bạn đã đánh vần đúng tất cả từ vựng hôm nay!</p>
                    <button class="btn btn-primary" style="margin-top:16px;" onclick="resetFlashcardsQueue()">Học lại từ đầu</button>
                </div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const item = AppState.flashcardQueue[AppState.currentFlashcardIndex];
    // Extract only English sentence part of the example, and mask the target word
    const englishExample = (item.example || '').split(/<br>|<small/i)[0];
    const regex = new RegExp(item.word, 'gi');
    const maskedSentence = englishExample.replace(regex, "___");
    const formattedSentence = window.formatMarkdownAndHtml(maskedSentence);

    container.innerHTML = `
        <div class="animate-zoom" style="max-width: 600px; margin: 0 auto;">
            <button class="btn btn-secondary" onclick="selectFlashcardMode(null)" style="margin-bottom: 24px;"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
            
            <div class="glass-card" style="padding: 32px; text-align: center;">
                <span class="modal-badge warning" style="background:rgba(255,193,7,0.15); color:var(--color-discovery);">${item.type}</span>
                <h3 style="margin-top: 16px; font-size: 18px; font-family:var(--font-heading);">Thử thách Đánh vần (Spelling Bee)</h3>
                
                <div style="background: var(--bg-card, #FFFFFF); padding: 24px; border-radius: var(--radius-md); border:1px solid var(--border-color); margin: 20px 0; box-shadow: var(--shadow-sm);">
                    <p style="font-size: 20px; font-weight: 700; color: var(--color-commitment);">${item.translation}</p>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">IPA: ${item.ipa}</p>
                    <p style="font-size: 15px; margin-top: 16px; color: var(--text-primary); line-height: 1.6;">"${formattedSentence}"</p>
                </div>
                
                <div class="form-group" style="margin-bottom:20px;">
                    <input type="text" class="form-input" id="spelling-input" style="font-size: 18px; font-weight: 700; text-align: center; letter-spacing: 2px;" placeholder="Gõ từ Tiếng Anh ở đây..." autocomplete="off">
                </div>
                
                <div id="spelling-feedback" style="font-size: 13px; font-weight: 600; margin-bottom: 20px; min-height: 20px;"></div>
                
                <button class="btn btn-primary" id="spelling-check-btn" style="width: 100%;">Kiểm tra</button>
            </div>
        </div>
    `;

    lucide.createIcons();

    const input = document.getElementById('spelling-input');
    const feedback = document.getElementById('spelling-feedback');
    const checkBtn = document.getElementById('spelling-check-btn');

    input.focus();

    function checkSpelling() {
        const value = input.value.trim().toLowerCase();
        const correct = item.word.trim().toLowerCase();
        
        if (!value) return;

        if (value === correct) {
            feedback.innerText = "🎉 Chính xác!";
            feedback.style.color = "var(--color-validation-light)";
            playSuccessSound();
            triggerConfetti();
            AppState.xp += 15;
            saveAppStateToLocalStorage();
            
            // Advance to next word after 1.5s
            setTimeout(() => {
                AppState.flashcardQueue.splice(AppState.currentFlashcardIndex, 1);
                if (AppState.flashcardQueue.length > 0) {
                    AppState.currentFlashcardIndex = AppState.currentFlashcardIndex % AppState.flashcardQueue.length;
                }
                renderSpellingBee(container);
            }, 1500);
        } else {
            feedback.innerText = `❌ Sai rồi! Đáp án đúng là: ${item.word}`;
            feedback.style.color = "var(--color-danger)";
            playFailSound();
            input.classList.add('mismatched');
            setTimeout(() => input.classList.remove('mismatched'), 500);
            
            // Move word to the end of the queue and show next after 2.5s
            setTimeout(() => {
                AppState.currentFlashcardIndex = (AppState.currentFlashcardIndex + 1) % AppState.flashcardQueue.length;
                renderSpellingBee(container);
            }, 2500);
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkSpelling();
        }
    });

    checkBtn.addEventListener('click', checkSpelling);
}

function renderRapidFire(container) {
    if (AppState.flashcardQueue.length === 0) {
        container.innerHTML = `
            <div class="animate-zoom" style="max-width: 600px; margin: 0 auto; text-align: center;">
                <button class="btn btn-secondary" onclick="selectFlashcardMode(null)" style="margin-bottom: 24px;"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
                <div class="glass-card" style="padding:40px;">
                    <h3>🎉 Tuyệt vời!</h3>
                    <p style="font-size:13px; color:var(--text-secondary); margin-top:8px;">Bạn đã hoàn thành chế độ Trắc nghiệm Tốc độ!</p>
                    <button class="btn btn-primary" style="margin-top:16px;" onclick="resetFlashcardsQueue()">Học lại từ đầu</button>
                </div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const item = AppState.flashcardQueue[AppState.currentFlashcardIndex];
    
    // Generate MCQ choices
    const correctOption = item.translation;
    const others = AppState.flashcards
        .filter(f => f.id !== item.id)
        .map(f => f.translation);
    const incorrectOptions = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5);

    container.innerHTML = `
        <div class="animate-zoom" style="max-width: 600px; margin: 0 auto;">
            <button class="btn btn-secondary" onclick="selectFlashcardMode(null)" style="margin-bottom: 24px;"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
            
            <div class="glass-card" style="padding: 32px; text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span class="modal-badge warning" style="background:rgba(0,176,255,0.15); color:var(--color-interactive);">Rapid Fire MCQ</span>
                    <div id="rapid-timer" style="background:var(--color-danger-light); border:1px solid rgba(211,47,47,0.3); color:var(--color-danger); padding:6px 16px; border-radius:var(--radius-sm); font-weight:700;">20s</div>
                </div>
                
                <h2 style="font-family:var(--font-heading); font-size:32px; margin: 24px 0 4px; font-weight: 800;">${item.word}</h2>
                <p style="color:var(--color-interactive); font-size:14px; margin-bottom:24px;">${item.ipa}</p>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px; max-width: 440px; margin: 0 auto 24px;">
                    ${choices.map((choice, idx) => `
                        <button class="btn btn-secondary rapid-choice-btn" style="text-align: left; padding: 14px 20px; font-size: 13px; font-weight: 600; width: 100%; border:1px solid var(--border-color);" onclick="selectRapidChoice(this, '${choice}', '${correctOption}')">
                            <span style="background:rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 4px; margin-right: 12px; font-family:var(--font-heading); font-weight:800;">${idx + 1}</span>
                            ${choice}
                        </button>
                    `).join('')}
                </div>
                
                <div id="rapid-feedback" style="font-size:14px; font-weight:700; min-height: 24px;"></div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Timer logic
    let secondsLeft = 20;
    const timerDisplay = document.getElementById('rapid-timer');
    const feedback = document.getElementById('rapid-feedback');

    if (AppState.rapidTimerInterval) clearInterval(AppState.rapidTimerInterval);
    
    AppState.rapidTimerInterval = setInterval(() => {
        secondsLeft--;
        if (timerDisplay) timerDisplay.innerText = `${secondsLeft}s`;
        
        if (secondsLeft <= 0) {
            clearInterval(AppState.rapidTimerInterval);
            handleRapidFailure();
        }
    }, 1000);

    function handleRapidFailure() {
        document.querySelectorAll('.rapid-choice-btn').forEach(btn => btn.disabled = true);
        if (feedback) {
            feedback.innerText = `⏰ Hết giờ! Đáp án đúng là: ${correctOption}`;
            feedback.style.color = "var(--color-danger)";
        }
        playFailSound();
        
        setTimeout(() => {
            AppState.currentFlashcardIndex = (AppState.currentFlashcardIndex + 1) % AppState.flashcardQueue.length;
            renderRapidFire(container);
        }, 2500);
    }

    window.selectRapidChoice = function(btn, selected, correct) {
        clearInterval(AppState.rapidTimerInterval);
        document.querySelectorAll('.rapid-choice-btn').forEach(b => b.disabled = true);
        
        if (selected === correct) {
            btn.style.borderColor = "var(--color-validation-light)";
            btn.style.background = "rgba(46,125,50,0.15)";
            feedback.innerText = "🎉 Chính xác!";
            feedback.style.color = "var(--color-validation-light)";
            playSuccessSound();
            triggerConfetti();
            AppState.xp += 10;
            saveAppStateToLocalStorage();
            
            setTimeout(() => {
                AppState.flashcardQueue.splice(AppState.currentFlashcardIndex, 1);
                if (AppState.flashcardQueue.length > 0) {
                    AppState.currentFlashcardIndex = AppState.currentFlashcardIndex % AppState.flashcardQueue.length;
                }
                renderRapidFire(container);
            }, 1500);
        } else {
            btn.style.borderColor = "var(--color-danger)";
            btn.style.background = "var(--color-danger-light)";
            feedback.innerText = `❌ Sai rồi! Đáp án đúng là: ${correct}`;
            feedback.style.color = "var(--color-danger)";
            playFailSound();
            
            setTimeout(() => {
                AppState.currentFlashcardIndex = (AppState.currentFlashcardIndex + 1) % AppState.flashcardQueue.length;
                renderRapidFire(container);
            }, 2500);
        }
    };
}

function renderGravityMatch(container) {
    container.innerHTML = `
        <div class="animate-zoom" style="max-width: 800px; margin: 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                <button class="btn btn-secondary" onclick="selectFlashcardMode(null)"><i data-lucide="arrow-left"></i> Quay lại Menu game</button>
                <div style="font-size:14px; font-weight:700;">
                    Đã ghép đúng: <span style="color:var(--color-validation-light);" id="gravity-score-txt">0/8</span>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 32px; min-height: 400px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="font-family:var(--font-heading); text-align:center; margin-bottom:6px;">Ghép Cặp Trọng Lực (Gravity Match)</h3>
                    <p style="font-size:12px; color:var(--text-tertiary); text-align:center; margin-bottom:24px;">Ghép đôi tất cả từ Tiếng Anh với nghĩa Tiếng Việt tương ứng nhanh nhất có thể.</p>
                    
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;" id="gravity-grid-container">
                        <!-- 16 tiles -->
                    </div>
                </div>
                
                <div style="text-align:center; border-top:1px solid var(--border-color); padding-top:20px; margin-top:20px;">
                    <button class="btn btn-secondary" onclick="resetGravityMatch()">Chơi lại / Tráo thẻ</button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    resetGravityMatch();
}

window.resetGravityMatch = function() {
    const sourceList = AppState.flashcardQueue.length > 0 ? AppState.flashcardQueue : AppState.flashcards;
    const enTiles = sourceList.map(i => ({ id: i.id, text: i.word, type: 'en', matched: false }));
    const viTiles = sourceList.map(i => ({ id: i.id, text: i.translation, type: 'vi', matched: false }));
    
    AppState.matchTiles = [...enTiles, ...viTiles].sort(() => Math.random() - 0.5);
    AppState.selectedTile = null;
    AppState.matchedCount = 0;
    
    renderGravityTiles();
};

function renderGravityTiles() {
    const container = document.getElementById('gravity-grid-container');
    if (!container) return;
    
    container.innerHTML = '';
    AppState.matchTiles.forEach((tile, index) => {
        const tileNode = document.createElement('div');
        tileNode.className = `match-tile ${tile.matched ? 'matched' : ''}`;
        tileNode.style.minHeight = "80px";
        tileNode.style.display = "flex";
        tileNode.style.alignItems = "center";
        tileNode.style.justifyContent = "center";
        tileNode.style.fontSize = "12px";
        tileNode.style.fontWeight = "700";
        tileNode.style.padding = "10px";
        tileNode.innerText = tile.text;
        tileNode.onclick = () => selectGravityTile(index);
        container.appendChild(tileNode);
    });
    
    const scoreEl = document.getElementById('gravity-score-txt');
    if (scoreEl) scoreEl.innerText = `${AppState.matchedCount}/8`;
}

function selectGravityTile(index) {
    const tiles = document.querySelectorAll('#gravity-grid-container .match-tile');
    const clicked = AppState.matchTiles[index];
    
    if (clicked.matched) return;
    
    if (AppState.selectedTile && AppState.selectedTile.index === index) {
        tiles[index].classList.remove('selected');
        AppState.selectedTile = null;
        return;
    }
    
    tiles[index].classList.add('selected');
    
    if (!AppState.selectedTile) {
        AppState.selectedTile = { ...clicked, index };
    } else {
        const prev = AppState.selectedTile;
        
        if (prev.id === clicked.id && prev.type !== clicked.type) {
            // Correct Match!
            AppState.matchTiles[prev.index].matched = true;
            AppState.matchTiles[index].matched = true;
            AppState.matchedCount++;
            
            playSuccessSound();
            
            if (AppState.matchedCount === 8) {
                triggerConfetti();
                AppState.xp += 100;
                saveAppStateToLocalStorage();
            }
        } else {
            // Mismatch
            tiles[prev.index].classList.add('mismatched');
            tiles[index].classList.add('mismatched');
            playFailSound();
            
            setTimeout(() => {
                tiles[prev.index].classList.remove('mismatched', 'selected');
                tiles[index].classList.remove('mismatched', 'selected');
            }, 500);
        }
        
        AppState.selectedTile = null;
        setTimeout(renderGravityTiles, 600);
    }
}

window.flipFlashcard = function() {
    const card = document.getElementById('fc-3d-card');
    if (card) card.classList.toggle('flipped');
};

window.updateFlashcardContent = function() {
    const q = AppState.flashcardQueue;
    if (q.length === 0) {
        // Build status summary
        const statuses = AppState.wordStatuses || {};
        const allWords = AppState.flashcards;
        const known = allWords.filter(w => (statuses[w.id] || 'new') === 'known').length;
        const learning = allWords.filter(w => (statuses[w.id] || 'new') === 'learning').length;
        const notKnown = allWords.filter(w => (statuses[w.id] || 'new') === 'new').length;
        
        document.getElementById('fc-3d-card').innerHTML = `
            <div class="card-face front" style="text-align:center; padding: 32px;">
                <h3 style="color: var(--color-commitment); font-family: var(--font-heading); font-size: 22px;">🎉 Hoàn thành!</h3>
                <p style="font-size:13px; color:var(--text-secondary); margin: 12px 0 20px;">Kết quả phiên học hôm nay</p>
                <div style="display:flex; gap:12px; justify-content:center; margin-bottom:20px;">
                    <div style="background:#FFF3E0; border:1px solid rgba(255,111,0,0.2); border-radius:10px; padding:12px 16px; text-align:center;">
                        <div style="font-size:22px; font-weight:800; color:var(--color-commitment);">${known}</div>
                        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); margin-top:2px;">Đã thuộc</div>
                    </div>
                    <div style="background:#FFF8E1; border:1px solid rgba(255,193,7,0.2); border-radius:10px; padding:12px 16px; text-align:center;">
                        <div style="font-size:22px; font-weight:800; color:#F9A825;">${learning}</div>
                        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); margin-top:2px;">Đang học</div>
                    </div>
                    <div style="background:#FFEBEE; border:1px solid rgba(211,47,47,0.2); border-radius:10px; padding:12px 16px; text-align:center;">
                        <div style="font-size:22px; font-weight:800; color:var(--color-danger);">${notKnown}</div>
                        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-tertiary); margin-top:2px;">Chưa thuộc</div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="resetFlashcardsQueue()" style="margin-bottom:8px;">Ôn lại từ đầu</button>
                <button class="btn btn-secondary" onclick="showWordStatusList()" style="font-size:12px;">Xem danh sách theo trạng thái</button>
            </div>
        `;
        return;
    }

    const item = q[AppState.currentFlashcardIndex];
    const currentStatus = (AppState.wordStatuses || {})[item.id] || 'new';
    const statusBadge = currentStatus === 'known' ? '<span style="font-size:10px; background:rgba(76,175,80,0.1); color:#388E3C; border:1px solid rgba(76,175,80,0.3); border-radius:20px; padding:2px 8px; font-weight:700;">✓ Đã thuộc</span>' 
        : currentStatus === 'learning' ? '<span style="font-size:10px; background:rgba(255,193,7,0.1); color:#F9A825; border:1px solid rgba(255,193,7,0.3); border-radius:20px; padding:2px 8px; font-weight:700;">🔄 Đang học</span>' 
        : '';
    
    document.getElementById('fc-word-txt').innerText = item.word;
    document.getElementById('fc-ipa-txt').innerText = item.ipa;
    document.getElementById('fc-trans-txt').innerText = item.translation;
    // Use innerHTML to properly render HTML in example text
    const exEl = document.getElementById('fc-ex-txt');
    const cleanExample = window.formatMarkdownAndHtml(item.example);
    exEl.innerHTML = `<em>Ví dụ:</em> ${cleanExample}`;
    document.getElementById('fc-tag-txt').innerText = item.type;
    // Show current status badge if available
    const statusEl = document.getElementById('fc-status-badge');
    if (statusEl) statusEl.innerHTML = statusBadge;
};

window.swipeFlashcard = function(direction) {
    const card = document.getElementById('fc-3d-card');
    if (!card) return;

    // Save word status
    if (!AppState.wordStatuses) AppState.wordStatuses = {};
    const q = AppState.flashcardQueue;
    const item = q[AppState.currentFlashcardIndex];
    if (item) {
        if (direction === 'right') {
            AppState.wordStatuses[item.id] = 'known';
        } else if (direction === 'stay') {
            AppState.wordStatuses[item.id] = 'learning';
        } else if (direction === 'left') {
            AppState.wordStatuses[item.id] = 'new';
        }
        saveAppStateToLocalStorage();
    }

    if (direction === 'left') {
        card.classList.add('swipe-left');
        playFailSound();
    } else if (direction === 'right') {
        card.classList.add('swipe-right');
        playSuccessSound();
        triggerConfetti();
    }

    setTimeout(() => {
        card.classList.remove('swipe-left', 'swipe-right', 'flipped');
        
        if (direction === 'right') {
            // Remove from queue
            AppState.flashcardQueue.splice(AppState.currentFlashcardIndex, 1);
        } else {
            // Push to back of queue
            AppState.currentFlashcardIndex = (AppState.currentFlashcardIndex + 1) % AppState.flashcardQueue.length;
        }

        if (AppState.flashcardQueue.length > 0) {
            AppState.currentFlashcardIndex = AppState.currentFlashcardIndex % AppState.flashcardQueue.length;
        }

        updateFlashcardContent();
    }, 400);
};

// Show word list filtered by status
window.showWordStatusList = function() {
    const statuses = AppState.wordStatuses || {};
    const allWords = AppState.flashcards;
    
    const groups = {
        new: allWords.filter(w => (statuses[w.id] || 'new') === 'new'),
        learning: allWords.filter(w => statuses[w.id] === 'learning'),
        known: allWords.filter(w => statuses[w.id] === 'known'),
    };
    
    const renderGroup = (words, label, color, bg, borderColor) => {
        if (words.length === 0) return '';
        return `
            <div style="margin-bottom: 24px;">
                <h4 style="font-family:var(--font-heading); font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:${color}; background:${bg}; border:1px solid ${borderColor}; display:inline-block; padding:4px 10px; border-radius:20px; margin-bottom:12px;">${label} (${words.length})</h4>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${words.map(w => `
                        <div style="background:#fff; border:1px solid #F0F0F0; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                            <div>
                                <span style="font-weight:700; font-size:15px; color:var(--text-primary);">${w.word}</span>
                                <span style="font-size:11px; color:var(--text-tertiary); margin-left:8px;">${w.ipa || ''}</span>
                                <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${w.translation}</div>
                            </div>
                            <button class="btn btn-secondary" style="font-size:11px; padding:6px 12px; white-space:nowrap;" onclick="startReviewWord(${w.id})">Ôn lại</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };
    
    const container = document.getElementById('app-viewport');
    container.innerHTML = `
        <div class="animate-zoom" style="max-width: 640px; margin: 0 auto;">
            <button class="btn btn-secondary" onclick="selectFlashcardMode('standard')" style="margin-bottom:24px;"><i data-lucide="arrow-left"></i> Quay lại học thẻ</button>
            <h2 style="font-family:var(--font-heading); font-size:20px; font-weight:800; margin-bottom:4px; color:var(--text-primary);">Danh sách từ vựng theo trạng thái</h2>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:28px;">Click "Ôn lại" để học lại bất kỳ từ nào.</p>
            ${renderGroup(groups.new, '❌ Chưa thuộc', '#D32F2F', '#FFEBEE', 'rgba(211,47,47,0.2)')}
            ${renderGroup(groups.learning, '🔄 Đang học', '#F9A825', '#FFF8E1', 'rgba(255,193,7,0.2)')}
            ${renderGroup(groups.known, '✓ Đã thuộc', '#388E3C', '#F1F8E9', 'rgba(76,175,80,0.2)')}
        </div>
    `;
    lucide.createIcons();
};

window.startReviewWord = function(wordId) {
    const word = AppState.flashcards.find(w => w.id === wordId);
    if (!word) return;
    AppState.flashcardQueue = [word];
    AppState.currentFlashcardIndex = 0;
    renderStandardFlashcards(document.getElementById('app-viewport'));
};

window.resetFlashcardsQueue = function() {
    if (AppState.activeTopicId && AppState.activeTopicId !== 'all') {
        const topic = AppState.topics.find(t => t.id === AppState.activeTopicId);
        if (topic) {
            AppState.flashcardQueue = AppState.flashcards.filter(w => topic.words.includes(w.id));
        } else {
            AppState.flashcardQueue = [...AppState.flashcards];
        }
    } else {
        AppState.flashcardQueue = [...AppState.flashcards];
    }
    AppState.currentFlashcardIndex = 0;
    navigateTab('flashcards');
};

// --- F. GRAMMAR TIMELINE SHELF ---
// --- F. GRAMMAR TIMELINE SHELF ---
let grammarDrawerState = {
    topicId: '',
    subTopicIdx: '',
    activeTab: 'theory',
    currentRound: 1,
    overallQuestionIndex: 0,
    roundIncorrectCount: 0,
    practiceQuestions: [],
    selectedOption: null,
    selectedWords: [],
    availableWords: [],
    hasChecked: false,
    isCorrect: false,
    isRoundCleared: false,
    lastRenderedQIndex: -1,
    lastRenderedRound: -1
};

function generatePracticeQuestions(topic, subTopicIdx) {
    const bankKey = `${topic.id}_${subTopicIdx}`;
    if (typeof PRACTICE_BANK !== 'undefined' && PRACTICE_BANK[bankKey]) {
        const bank = PRACTICE_BANK[bankKey];
        const questions = [];
        // Round 1: exactly 5 questions (no repeat)
        bank.round1.forEach(q => questions.push(q));
        // Round 2: exactly 10 questions (no repeat)
        bank.round2.forEach(q => questions.push(q));
        // Round 3: exactly 5 questions (no repeat)
        bank.round3.forEach(q => questions.push(q));
        return questions;
    }


    const subTopicData = (topic.id === 'tense') ? topic.visualConfig.timeStates[subTopicIdx] : topic.visualConfig.types[subTopicIdx];
    if (!subTopicData) return [];

    const name = subTopicData.name || subTopicData.title || '';
    const examples = subTopicData.examples || [];
    const counterExamples = subTopicData.counterExamples || [];
    
    const questions = [];

    // Helper: generate 5-step explanation
    const getExplanation = (verdict, rule, why, trap, tip) => ({
        verdict: verdict,
        rule: rule,
        why: why,
        trap: trap,
        tip: tip
    });

    // Helper: shuffle options
    const shuffleOptions = (correctVal, incorrectVals) => {
        // Lọc bỏ trùng lặp và giá trị rỗng
        let vals = [correctVal, ...incorrectVals].filter((v, i, a) => v && a.indexOf(v) === i);
        // Đảm bảo đủ 4 options, nếu thiếu thì tự sinh ra thêm
        while(vals.length < 4) {
            vals.push(correctVal + ["s", "ed", "ing", "ly", " to"][vals.length - 1]);
        }
        vals = vals.slice(0, 4);

        for (let i = vals.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [vals[i], vals[j]] = [vals[j], vals[i]];
        }
        const options = {};
        const keys = ['A', 'B', 'C', 'D'];
        vals.forEach((v, idx) => {
            options[keys[idx]] = v;
        });
        const correctKey = keys[vals.indexOf(correctVal)];
        return { options, correct: correctKey };
    };

    // Helper to clean words for Word Builder
    const getWordBuilderWords = (sentence) => {
        return sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(w => w.trim() !== "");
    };

    // Helper to extract a plausible verb
    const extractVerb = (sent) => {
        const words = sent.split(' ');
        return words.find(w => w.length > 2 && !['she', 'he', 'they', 'we', 'school', 'yesterday', 'tomorrow', 'already', 'the', 'and', 'with', 'for'].includes(w.toLowerCase())) || words[1] || 'verb';
    };

    // Safe access to examples
    const ex1 = examples[0] || { sentence: "She walks to school.", translation: "Cô ấy đi bộ đến trường.", explanation: "Chủ ngữ số ít." };
    const ex2 = examples[1] || ex1;
    const ex3 = examples[2] || ex2;
    const ce1 = counterExamples[0] || { sentence: "He don't like coffee.", correction: "He doesn't like coffee.", rule: "Sai trợ động từ." };
    const ce2 = counterExamples[1] || ce1;
    const ce3 = counterExamples[2] || ce2;

    // ================= ROUND 1: EASY (1-5) =================
    // Dạng bài: Trắc nghiệm hoàn thành câu (Điền từ cơ bản)
    for (let i = 0; i < 5; i++) {
        const ex = examples[i % examples.length] || ex1;
        const verb = extractVerb(ex.sentence);
        const stem = ex.sentence.replace(new RegExp('\\b' + verb + '\\b', 'gi'), '________');
        
        // Remove s/es/ed/ing from correct verb to make distractors
        const baseVerb = verb.replace(/s$|es$|ed$|ing$/i, '');
        const opt = shuffleOptions(verb, [
            baseVerb !== verb ? baseVerb : verb + 's',
            baseVerb + 'ed',
            baseVerb + 'ing'
        ]);
        
        questions.push({
            type: 'multiple_choice',
            stem: `Hoàn thành câu sau: *"${stem}"*<br>(Dịch: ${ex.translation})`,
            options: opt.options,
            correct: opt.correct,
            explanation: getExplanation(
                `Đáp án đúng là **${opt.correct}**: *"${ex.sentence}"*.`,
                `Quy tắc: ${ex.explanation}`,
                `Cần chia động từ phù hợp với chủ ngữ và ngữ cảnh thời gian.`,
                `Chia sai đuôi động từ hoặc sai thì cơ bản.`,
                `Nhìn dấu hiệu thời gian và chủ ngữ ngay trước khoảng trống để chọn đuôi động từ.`
            )
        });
    }

    // ================= ROUND 2: MEDIUM (6-15) =================
    // Dạng bài: Hoàn thành câu (Cloze) + Sửa lỗi sai
    
    // 6-10: Cloze (Trắc nghiệm hoàn thành câu - Mức độ khó hơn)
    for (let i = 0; i < 5; i++) {
        const ex = examples[(i+1) % examples.length] || ex2;
        const verb = extractVerb(ex.sentence);
        const stem = ex.sentence.replace(new RegExp('\\b' + verb + '\\b', 'gi'), '________');
        const opt = shuffleOptions(verb, [
            'to ' + verb, 'will ' + verb, 'was ' + verb
        ]);
        questions.push({
            type: 'cloze',
            stem: `Điền vào chỗ trống dạng chia đúng của từ:<br> *"${stem}"*<br>(Dịch: ${ex.translation})`,
            options: opt.options,
            correct: opt.correct,
            explanation: getExplanation(
                `Đáp án đúng là **${opt.correct}**.`,
                `Quy tắc: ${ex.explanation}`,
                `Phân tích kỹ cấu trúc câu để chia động từ chính xác.`,
                `Dễ nhầm lẫn với các thì khác hoặc dạng to-V / V-ing.`,
                `Xác định rõ cấu trúc thì hoặc loại từ cần điền.`
            )
        });
    }

    // 11-15: Error Identification (Sửa lỗi sai)
    for (let i = 0; i < 5; i++) {
        const ce = counterExamples[i % counterExamples.length] || ce1;
        const opt = shuffleOptions(ce.correction, [
            ce.sentence,
            ce.correction.replace(/s\b/g, 'ing'),
            ce.correction + ' today'
        ]);
        questions.push({
            type: 'multiple_choice',
            stem: `Câu sau có một lỗi sai ngữ pháp: *"${ce.sentence}"*.<br>Hãy chọn phương án **sửa đúng nhất**:`,
            options: opt.options,
            correct: opt.correct,
            explanation: getExplanation(
                `Đáp án đúng là **${opt.correct}**.`,
                `Lỗi sai: ${ce.rule}`,
                `Cần sửa lại cho đúng với công thức chuẩn của ${name}.`,
                `Học sinh thường chia thừa động từ hoặc mượn sai trợ động từ.`,
                `Tìm chủ ngữ và xác định thì trước khi quyết định phương án sửa.`
            )
        });
    }

    // ================= ROUND 3: HARD (16-30) =================
    // Dạng bài: Viết lại câu (Trắc nghiệm chọn câu đồng nghĩa + Word Builder)

    // 16-20: Sentence Transformation MCQ (Trắc nghiệm chọn câu đồng nghĩa)
    for (let i = 0; i < 5; i++) {
        const ex = examples[(i+2) % examples.length] || ex3;
        const opt = shuffleOptions(ex.sentence, [
            ex.sentence.replace(/s\b/g, ''),
            ex.sentence.replace(/ed\b/g, ''),
            "It is " + ex.sentence
        ]);
        questions.push({
            type: 'multiple_choice',
            stem: `Chọn câu tiếng Anh **viết đúng ngữ pháp và sát nghĩa nhất** với câu tiếng Việt sau:<br> *"${ex.translation}"*`,
            options: opt.options,
            correct: opt.correct,
            explanation: getExplanation(
                `Đáp án đúng là **${opt.correct}**.`,
                `Quy tắc: ${ex.explanation}`,
                `Câu chuyển ngữ phải giữ nguyên nghĩa và chính xác tuyệt đối về mặt ngữ pháp.`,
                `Các câu nhiễu thường thiếu mạo từ (a/an/the) hoặc sai cách chia thì.`,
                `Đừng vội chọn câu có vẻ đúng, hãy kiểm tra kỹ đuôi động từ và giới từ.`
            )
        });
    }

    // 21-30: Word Builder (Sắp xếp từ để viết lại câu)
    for (let i = 0; i < 10; i++) {
        const ex = (i % 2 === 0) ? (examples[i % examples.length] || ex1) : (counterExamples[i % counterExamples.length] || ce1);
        const correctSent = ex.correction || ex.sentence; // use correction if counterExample
        const promptText = ex.correction ? `Sắp xếp các từ sau để sửa thành câu ĐÚNG: *"${ex.sentence}"*` : `Dịch sang tiếng Anh bằng cách xếp từ: "${ex.translation}"`;
        questions.push({
            type: 'word_builder',
            prompt: promptText,
            correct: correctSent,
            words: getWordBuilderWords(correctSent),
            explanation: getExplanation(
                `Đáp án chính xác: *"${correctSent}"*.`,
                `Thử thách tự xây dựng câu hoàn chỉnh.`,
                `Nắm vững trật tự từ: S + V + O + Trạng từ.`,
                `Lắp sai vị trí trạng từ chỉ thời gian/tần suất.`,
                `Gắn kết cụm chủ ngữ - động từ trước, sau đó xếp các thành phần bổ ngữ.`
            )
        });
    }

    return questions;
}

function getSubTopicsHtml(node, chIdx) {
    let html = '<div class="sub-topics-list">';
    
    // Overview is always unlocked
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
        const completedList = AppState.grammarSubTopicsCompleted && AppState.grammarSubTopicsCompleted[node.id] ? AppState.grammarSubTopicsCompleted[node.id] : [];
        const isUnlocked = (idx === 0) || (completedList.includes(idx - 1));
        
        let formulaStr = '';
        if (codeSnippet) {
            if (typeof codeSnippet === 'object') {
                formulaStr = codeSnippet.affirmative || '';
            } else {
                formulaStr = codeSnippet;
            }
        }
        let codeHtml = ''; // Removed grammatical structure per user request
        
        let btnHtml = '';
        let rowClass = 'sub-topic-row';
        if (isUnlocked) {
            btnHtml = `
                <button class="sub-topic-cta-btn" onclick="window.openGrammarLesson('${node.id}', ${idx})">
                    HỌC NGAY 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            `;
        } else {
            rowClass += ' locked';
            btnHtml = `
                <button class="sub-topic-cta-btn locked" disabled>
                    ĐANG KHÓA 🔒
                </button>
            `;
        }
        
        html += `
            <div class="${rowClass}">
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
                    ${btnHtml}
                </div>
            </div>
        `;
    };

    if (node.id === 'tense') {
        const states = node.visualConfig.timeStates || [];
        states.forEach((state, idx) => {
            addSubTopicRow(idx, state.name, 'Cách dùng & Dấu hiệu nhận biết', state.formula, idx);
        });
    } else if (node.visualConfig && node.visualConfig.types) {
        const types = node.visualConfig.types;
        types.forEach((type, idx) => {
            const titleText = type.title || type.pronoun || `Cấu trúc ${idx + 1}`;
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

function renderGrammarShelf(container) {
    let cardsHtml = '';

    EXAM_RUNNERS_DB.grammarTimeline.forEach((node, idx) => {
        const chIdx = idx + 1;
        const masteryVal = AppState.grammarMastery[node.id] !== undefined ? AppState.grammarMastery[node.id] : (node.mastery || 0);
        const statusVal = AppState.grammarStatus[node.id] !== undefined ? AppState.grammarStatus[node.id] : node.status;
        
        let statusBadgeText = 'Chưa học';
        let statusBadgeStyle = 'background: rgba(0, 0, 0, 0.04); color: var(--text-tertiary); border: 1px solid var(--border-color);';
        
        if (statusVal === 'completed') {
            statusBadgeText = 'Đã học';
            statusBadgeStyle = 'background: rgba(21, 128, 61, 0.08); color: var(--color-validation); border: 1px solid rgba(21, 128, 61, 0.15);';
        } else if (statusVal === 'active') {
            statusBadgeText = 'Đang học';
            statusBadgeStyle = 'background: rgba(0, 176, 255, 0.08); color: var(--color-interactive); border: 1px solid rgba(0, 176, 255, 0.15); font-weight: 800;';
        }
        
        const subTopicsHtml = getSubTopicsHtml(node, chIdx);
        
        cardsHtml += `
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

window.toggleChapter = function(topicId) {
    const card = document.getElementById(`chapter-card-${topicId}`);
    if (!card) return;
    
    const isOpen = card.classList.contains('open');
    
    const allCards = document.querySelectorAll('.grammar-chapter-card');
    allCards.forEach(c => {
        if (c.id !== `chapter-card-${topicId}`) {
            c.classList.remove('open');
            const body = c.querySelector('.chapter-body');
            if (body) {
                body.style.maxHeight = null;
            }
        }
    });
    
    const body = card.querySelector('.chapter-body');
    if (!body) return;
    
    if (isOpen) {
        card.classList.remove('open');
        body.style.maxHeight = null;
    } else {
        card.classList.add('open');
        body.style.maxHeight = body.scrollHeight + "px";
    }
};

window.openGrammarLesson = function(topicId, subTopicIdx) {
    document.body.classList.add('grammar-fullscreen-mode');
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === topicId);
    if (!topic) return;

    grammarDrawerState = {
        topicId: topicId,
        subTopicIdx: subTopicIdx,
        activeTab: 'theory',
        currentRound: 1,
        overallQuestionIndex: 0,
        roundIncorrectCount: 0,
        practiceQuestions: [],
        selectedOption: null,
        selectedWords: [],
        availableWords: [],
        hasChecked: false,
        isCorrect: false,
        isRoundCleared: false,
        lastRenderedQIndex: -1,
        lastRenderedRound: -1
    };

    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = `<div id="grammar-lesson-container"></div>`;
    
    renderGrammarLesson();
};

window.closeGrammarLesson = function() {
    document.body.classList.remove('grammar-fullscreen-mode');
    navigateTab('grammar'); // Go back to grammar shelf
};

window.switchLessonSubTopic = function(idx) {
    grammarDrawerState.subTopicIdx = idx;
    grammarDrawerState.activeTab = 'theory'; // reset to theory
    grammarDrawerState.practiceQuestions = []; // force regenerate questions for new subtopic
    grammarDrawerState.isRoundCleared = false;
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
    else if (topic.visualConfig && topic.visualConfig.types) subTopics = topic.visualConfig.types || [];

    subTopics.forEach((st, idx) => {
        const title = st.title || st.name || st.pronoun || `Mục ${idx + 1}`;
        const isActive = subTopicIdx === idx;
        
        // Gating display inside selectors
        const completedList = AppState.grammarSubTopicsCompleted && AppState.grammarSubTopicsCompleted[topic.id] ? AppState.grammarSubTopicsCompleted[topic.id] : [];
        const isUnlocked = (idx === 0) || (completedList.includes(idx - 1));
        
        if (isUnlocked) {
            selectorHtml += `
                <div class="lesson-subtopic-pill ${isActive ? 'active' : ''}" onclick="window.switchLessonSubTopic(${idx})">
                    <span style="opacity: ${isActive ? 1 : 0.7};">${idx + 1}.</span> ${title}
                </div>
            `;
        } else {
            selectorHtml += `
                <div class="lesson-subtopic-pill locked" style="opacity: 0.5; cursor: not-allowed;" title="Hãy hoàn thành mục trước để mở khóa">
                    <span>🔒 ${idx + 1}.</span> ${title}
                </div>
            `;
        }
    });

    const masteryVal = AppState.grammarMastery[topic.id] !== undefined ? AppState.grammarMastery[topic.id] : (topic.mastery || 0);

    container.innerHTML = `
        <div class="grammar-lesson-view with-sidebar">
            <!-- Left Sidebar -->
            <div class="lesson-sidebar" id="grammar-lesson-sidebar">
                <div class="lesson-sidebar-top">
                    <button class="lesson-back-btn" onclick="window.closeGrammarLesson()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Trở lại
                    </button>
                </div>

                <div class="lesson-sidebar-header">
                    <span class="lesson-header-subtitle">GRAMMAR INTERACTIVE LAB</span>
                    <h2 class="lesson-header-title">${topic.title}</h2>
                </div>

                <div class="lesson-sidebar-progress">
                    <span class="lesson-mastery-label">Mastery: ${masteryVal}%</span>
                    <div class="lesson-mastery-bar-bg" style="width: 100%;">
                        <div class="lesson-mastery-bar-fill" style="width: ${masteryVal}%"></div>
                    </div>
                </div>

                <div class="lesson-sidebar-nav">
                    <div class="lesson-sidebar-nav-label">Tiểu mục học tập</div>
                    ${selectorHtml}
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="lesson-main-area">
                <div class="lesson-main-topbar">
                    <button class="lesson-sidebar-toggle" onclick="document.getElementById('grammar-lesson-sidebar').classList.toggle('hidden')" title="Ẩn/Hiện Menu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <span class="lesson-main-topbar-label">Chế độ tập trung</span>
                </div>
                <div class="lesson-body-card">
                    <div id="lesson-tab-pane"></div>
                </div>
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
        const overview = topic.overview || { frequency: '', importance: '', advice: '' };
        pane.innerHTML = `
            <div class="focused-theory-card animate-zoom">
                <details class="grammar-strategy-details">
                    <summary>💡 Khám phá Chiến lược ôn thi (Click để mở)</summary>
                    <div class="grammar-strategy-details-content">
                        <div class="focused-title-row" style="margin-bottom: 20px;">
                            <h4 style="font-family: var(--font-heading); color: var(--color-interactive); font-size: 20px; font-weight: 800;">CHIẾN LƯỢC TỔNG QUAN</h4>
                            <span class="focused-tag" style="background: rgba(0, 176, 255, 0.15); color: var(--color-interactive); font-weight: 800; border-radius: 4px; padding: 4px 8px; font-size: 11px;">Overview</span>
                        </div>
                        
                        <div style="font-size: 14.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                            Chào mừng bạn đến với chuyên đề <strong>${topic.title}</strong>! Dưới đây là phân tích chiến lược từ ban chuyên môn <em>Exam Runners</em> giúp bạn tối ưu hóa điểm số trong kỳ thi tuyển sinh vào lớp 10.
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="glass-card" style="padding: 16px; border: 1px solid rgba(255, 179, 0, 0.15); background: rgba(255, 179, 0, 0.03);">
                                <div style="font-weight: 800; color: #ffb300; font-size: 13.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                    📊 Tần suất xuất hiện (GD&ĐT Exam Frequency)
                                </div>
                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${overview.frequency || 'Đang cập nhật...'}</div>
                            </div>
                            
                            <div class="glass-card" style="padding: 16px; border: 1px solid rgba(0, 176, 255, 0.15); background: rgba(0, 176, 255, 0.03);">
                                <div style="font-weight: 800; color: var(--color-interactive); font-size: 13.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                    🎯 Tầm quan trọng sư phạm (Core Importance)
                                </div>
                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${overview.importance || 'Đang cập nhật...'}</div>
                            </div>
                            
                            <div class="glass-card" style="padding: 16px; border: 1px solid rgba(76, 175, 80, 0.15); background: rgba(76, 175, 80, 0.03);">
                                <div style="font-weight: 800; color: var(--color-validation-light); font-size: 13.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                    💡 Gợi ý tiếp cận & Lộ trình (Strategic Advice)
                                </div>
                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${overview.advice || 'Đang cập nhật...'}</div>
                            </div>
                        </div>
                    </div>
                </details>
                <!-- Overview has no practice questions, but we can add a button to go to next subtopic if needed. For now just hide practice CTA for overview -->
            </div>
        `;
        return;
    }

    const subTopicIdx = parseInt(grammarDrawerState.subTopicIdx);
    let subTopicData = null;

    if (topic.id === 'tense' && topic.visualConfig.timeStates) {
        subTopicData = topic.visualConfig.timeStates[subTopicIdx];
    } else if (topic.visualConfig && topic.visualConfig.types) {
        subTopicData = topic.visualConfig.types[subTopicIdx];
    }

    if (!subTopicData) {
        pane.innerHTML = `<div style="color: var(--text-tertiary); font-style: italic;">Đang cập nhật nội dung chi tiết cho tiểu mục này...</div>`;
        return;
    }

    const titleText = subTopicData.name || subTopicData.title || `Mục ${subTopicIdx + 1}`;
    const usageText = subTopicData.usage || subTopicData.desc || '';
    const signalsText = subTopicData.signals || '';

    // 1. Formula 3col grid
    const formula = subTopicData.formula || {};
    const aff = formula.affirmative || '';
    const neg = formula.negative || '';
    const int = formula.interrogative || '';
    
    let formulaGridHtml = '';
    if (aff || neg || int) {
        formulaGridHtml = `
        <div class="focused-section" style="margin-top: 16px;">
            <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.5px;">Cấu trúc & Công thức 3 Thể</div>
            <div class="formula-3col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                <div class="glass-card" style="border: 1px solid rgba(76, 175, 80, 0.25); border-top: 4px solid var(--color-validation-light); padding: 16px; background: rgba(76, 175, 80, 0.02);">
                    <div style="font-weight: 800; color: var(--color-validation-light); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <span style="background: rgba(76, 175, 80, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">+</span> Khẳng Định
                    </div>
                    <div class="focused-formula-block" style="font-family: monospace; font-size: 13.5px; color: var(--text-primary); font-weight: 700; word-break: break-word;">${aff}</div>
                </div>
                
                <div class="glass-card" style="border: 1px solid rgba(244, 67, 54, 0.25); border-top: 4px solid var(--color-error); padding: 16px; background: rgba(244, 67, 54, 0.02);">
                    <div style="font-weight: 800; color: var(--color-error); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <span style="background: rgba(244, 67, 54, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">-</span> Phủ Định
                    </div>
                    <div class="focused-formula-block" style="font-family: monospace; font-size: 13.5px; color: var(--text-primary); font-weight: 700; word-break: break-word;">${neg}</div>
                </div>
                
                <div class="glass-card" style="border: 1px solid rgba(0, 176, 255, 0.25); border-top: 4px solid var(--color-interactive); padding: 16px; background: rgba(0, 176, 255, 0.02);">
                    <div style="font-weight: 800; color: var(--color-interactive); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <span style="background: rgba(0, 176, 255, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">?</span> Nghi Vấn
                    </div>
                    <div class="focused-formula-block" style="font-family: monospace; font-size: 13.5px; color: var(--text-primary); font-weight: 700; word-break: break-word;">${int}</div>
                </div>
            </div>
        </div>
        `;
    }

    // 2. Examples custom pills list
    const examples = subTopicData.examples || [];
    let examplesHtml = '';
    if (examples.length > 0) {
        examplesHtml = `
        <div class="focused-section" style="margin-top: 24px;">
            <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.5px;">Ví Dụ Minh Họa (Examples)</div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${examples.map((ex, exIdx) => `
                    <div class="glass-card" style="padding: 14px 18px; border: 1px solid rgba(76, 175, 80, 0.15); display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 10px; background: rgba(76, 175, 80, 0.15); color: var(--color-validation-light); padding: 3px 8px; border-radius: 99px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Example ${exIdx + 1}</span>
                            <strong style="font-size: 14.5px; color: var(--text-primary); font-family: monospace;">${ex.sentence}</strong>
                        </div>
                        <div style="font-size: 13px; color: var(--text-secondary);">${ex.translation}</div>
                        <div style="font-size: 12px; color: var(--text-tertiary); font-style: italic; border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 2px;">📚 ${ex.explanation}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    // 3. Counter examples (Incorrect vs Correct)
    const counterExamples = subTopicData.counterExamples || [];
    let counterExamplesHtml = '';
    if (counterExamples.length > 0) {
        counterExamplesHtml = `
        <div class="focused-section" style="margin-top: 28px;">
            <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.5px;">Phân Tích Lỗi Sai Thực Tế (Incorrect vs. Correct)</div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${counterExamples.map((ce, ceIdx) => `
                    <div style="display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-sm); background: var(--bg-main);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
                            <div class="glass-card" style="border: 1px solid rgba(244,67,54,0.15); padding: 12px 14px; background: rgba(244,67,54,0.04);">
                                <div style="color: var(--color-error); font-weight: 800; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                                    ❌ LỖI SAI (Incorrect)
                                </div>
                                <div style="font-family: monospace; font-size: 13.5px; color: var(--text-secondary); text-decoration: line-through;">${ce.sentence}</div>
                            </div>
                            <div class="glass-card" style="border: 1px solid rgba(76, 175, 80, 0.15); padding: 12px 14px; background: rgba(76, 175, 80, 0.04);">
                                <div style="color: var(--color-validation-light); font-weight: 800; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                                    ✅ SỬA ĐÚNG (Correct)
                                </div>
                                <div style="font-family: monospace; font-size: 13.5px; color: var(--text-primary); font-weight: 700;">${ce.correction}</div>
                            </div>
                        </div>
                        <div style="font-size: 12.5px; color: var(--text-secondary); padding: 6px 10px; background: var(--bg-main); border-radius: 4px; border: 1px solid var(--border-color); margin-top: 4px;">
                            <strong>💡 Quy tắc:</strong> ${ce.rule}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    // 4. Common Mistakes Warning Cards
    const commonMistakes = subTopicData.commonMistakes || [];
    let commonMistakesHtml = '';
    if (commonMistakes.length > 0) {
        commonMistakesHtml = `
        <div class="focused-section" style="margin-top: 28px;">
            <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.5px;">⚠️ Bẫy Phòng Thi Cực Kỳ Dễ Sai</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                ${commonMistakes.map((cm, cmIdx) => `
                    <div class="glass-card" style="border: 1px solid rgba(255,193,7,0.2); padding: 16px; background: rgba(255,193,7,0.02); display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-weight: 800; color: #ffb300; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                            ⚠️ ${cm.title}
                        </div>
                        <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                            <strong>Chi tiết:</strong> ${cm.detail}
                        </div>
                        <div style="font-size: 12.5px; color: var(--color-validation-light); font-weight: 700; border-top: 1px dashed rgba(255,193,7,0.1); padding-top: 6px; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                            ✨ Cách khắc phục: <span style="font-weight: normal; color: var(--text-secondary);">${cm.fix}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    pane.innerHTML = `
        <div class="focused-theory-card animate-zoom">
            <div class="focused-title-row" style="margin-bottom: 16px; border-bottom: 1px dashed var(--border-color); padding-bottom: 16px;">
                <h4 style="font-family: var(--font-heading); color: var(--text-primary); font-size: 18px; font-weight: 800;">${titleText}</h4>
                <span class="focused-tag" style="background: rgba(0, 176, 255, 0.15); color: var(--color-interactive); font-weight: 800; border-radius: 4px; padding: 4px 8px; font-size: 11px;">Chuyên đề</span>
            </div>
            
            ${usageText ? `
            <div class="focused-section">
                <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.5px;">Cách dùng & Bản chất sư phạm</div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; padding: 14px 18px; background: rgba(0,176,255,0.04); border: 1px solid rgba(0, 176, 255, 0.15); border-radius: 6px;">
                    ${usageText}
                </div>
            </div>
            ` : ''}

            ${signalsText ? `
            <div class="focused-section" style="margin-top: 20px;">
                <div class="focused-section-title" style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.5px;">Dấu hiệu nhận biết trọng tâm</div>
                <div class="focused-signals-box" style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${signalsText.split(',').map(s => `<span class="focused-signal-pill" style="background: rgba(0, 176, 255, 0.1); color: var(--color-interactive); padding: 4px 10px; border-radius: 4px; font-size: 12.5px; font-family: monospace; font-weight: 700; border: 1px solid rgba(0, 176, 255, 0.15);">${s.trim()}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${formulaGridHtml}
            ${examplesHtml}
            ${counterExamplesHtml}
            ${commonMistakesHtml}
            <button class="btn-mega-practice" onclick="window.switchLessonTab('practice')">🎯 Đã hiểu lý thuyết, Bắt đầu luyện tập ngay!</button>
        </div>
    `;
};

window.renderLessonPracticeTab = function() {
    const pane = document.getElementById('lesson-tab-pane');
    if (!pane) return;

    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === grammarDrawerState.topicId);
    if (!topic) return;

    // 1. Initialize questions if empty
    if (!grammarDrawerState.practiceQuestions || grammarDrawerState.practiceQuestions.length === 0) {
        grammarDrawerState.practiceQuestions = generatePracticeQuestions(topic, grammarDrawerState.subTopicIdx);
        grammarDrawerState.currentRound = 1;
        grammarDrawerState.overallQuestionIndex = 0;
        grammarDrawerState.roundIncorrectCount = 0;
        grammarDrawerState.hasChecked = false;
        grammarDrawerState.selectedOption = null;
        grammarDrawerState.selectedWords = [];
        grammarDrawerState.isCorrect = false;
    }

    const questions = grammarDrawerState.practiceQuestions;
    const qIndex = grammarDrawerState.overallQuestionIndex;
    const currentRound = grammarDrawerState.currentRound || 1;

    const isNewQuestionOrRound = (grammarDrawerState.lastRenderedQIndex !== qIndex || grammarDrawerState.lastRenderedRound !== currentRound);
    grammarDrawerState.lastRenderedQIndex = qIndex;
    grammarDrawerState.lastRenderedRound = currentRound;
    const zoomClass = isNewQuestionOrRound ? 'animate-zoom' : '';

    // Check if we finished the entire subtopic (Round 3 completed)
    if (qIndex >= questions.length) {
        pane.innerHTML = `
            <div class="glass-card animate-zoom" style="text-align:center; padding:32px 24px; border-color:var(--color-validation-light);">
                <div style="font-size:48px; margin-bottom:16px;">🏆</div>
                <h3 style="font-family:var(--font-heading); color:var(--color-validation-light); margin-bottom:8px;">Tiểu mục đã được chinh phục!</h3>
                <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px;">Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ 3 Vòng thử thách Sandbox của tiểu mục kiến thức này!</p>
                <div class="drawer-mastery-progress" style="margin-bottom:24px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size:12px; font-weight:800; color:var(--color-validation-light);">Mastery của Tiểu Mục: 100%</span>
                    <div class="mastery-progress-bar-bg" style="width:70%;">
                        <div class="mastery-progress-bar-fill" style="width: 100%; background: var(--color-validation-light);"></div>
                    </div>
                </div>
                <button class="btn btn-interactive animate-pulse" style="width:100%; padding:12px; font-weight: 800;" onclick="finishSandboxChallenge()">Lưu tiến trình & Quay lại Shelf 🏆</button>
            </div>`;
        return;
    }

    // Determine current round parameters
    let roundStartIdx = 0;
    let roundEndIdx = 4;
    let roundTotalQs = 5;
    if (currentRound === 2) {
        roundStartIdx = 5;
        roundEndIdx = 14;
        roundTotalQs = 10;
    } else if (currentRound === 3) {
        roundStartIdx = 15;
        roundEndIdx = 29;
        roundTotalQs = 15;
    }


    // Check if we are showing the Round congrats screen (round cleared)
    if (grammarDrawerState.isRoundCleared) {
        let roundSuccessMsg = '';
        if (currentRound === 1) {
            roundSuccessMsg = 'Bạn đã vượt qua Vòng 1 (Dễ) với điểm số tuyệt đối! Bạn đã sẵn sàng cho các câu hỏi Cloze đầy thử thách ở Vòng 2 chưa?';
        } else if (currentRound === 2) {
            roundSuccessMsg = 'Tuyệt vời! Vòng 2 (Trung bình) đã được chinh phục hoàn hảo. Vòng 3 (Khó) đang chờ đón bạn với các bẫy ngữ pháp nâng cao và thử thách Word Builder!';
        }
        
        pane.innerHTML = `
            <div class="glass-card animate-zoom" style="text-align:center; padding:32px 24px; border-color:var(--color-interactive);">
                <div style="font-size:48px; margin-bottom:16px;">✨</div>
                <h3 style="font-family:var(--font-heading); color:var(--color-interactive); margin-bottom:8px;">Hoàn thành Vòng ${currentRound}!</h3>
                <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px;">${roundSuccessMsg}</p>
                <button class="btn btn-interactive animate-pulse" style="width:100%; padding:12px; font-weight: 800;" onclick="startNextRound()">Tiến vào Vòng ${currentRound + 1} ➔</button>
            </div>`;
        return;
    }

    const question = questions[qIndex];

    // Initialize/sync interactive question states
    if (grammarDrawerState.initializedQuestionIndex !== qIndex) {
        grammarDrawerState.hasChecked = false;
        grammarDrawerState.selectedOption = null;
        grammarDrawerState.selectedWords = [];
        if (question.type === 'word_builder') {
            grammarDrawerState.availableWords = [...question.words];
            grammarDrawerState.availableWords.sort(() => Math.random() - 0.5);
        }
        grammarDrawerState.initializedQuestionIndex = qIndex;
    }

    const roundProgressPercent = Math.round(((qIndex - roundStartIdx) / roundTotalQs) * 100);

    // Build Round Tracker HTML
    let trackerHtml = `
    <div class="round-tracker-container" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; background: var(--bg-main); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-tertiary); margin-right: 12px;">Vòng:</div>
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; justify-content: space-around;">
            <div class="round-step ${currentRound === 1 ? 'active' : (currentRound > 1 ? 'completed' : '')}" style="display: flex; align-items: center; gap: 6px;">
                <span class="round-dot" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; 
                    ${currentRound === 1 ? 'background: var(--color-interactive); color: #000; box-shadow: 0 0 10px var(--color-interactive);' : (currentRound > 1 ? 'background: var(--color-validation-light); color: #000;' : 'background: rgba(0,0,0,0.06); color: var(--text-tertiary);')}">1</span>
                <span style="font-size: 12px; font-weight: ${currentRound === 1 ? '800' : 'normal'}; color: ${currentRound === 1 ? 'var(--text-primary)' : 'var(--text-secondary)'};">Vòng 1 (Dễ)</span>
            </div>
            
            <div style="height: 1px; background: var(--border-color); flex: 1; max-width: 40px;"></div>
            
            <div class="round-step ${currentRound === 2 ? 'active' : (currentRound > 2 ? 'completed' : '')}" style="display: flex; align-items: center; gap: 6px;">
                <span class="round-dot" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; 
                    ${currentRound === 2 ? 'background: var(--color-interactive); color: #000; box-shadow: 0 0 10px var(--color-interactive);' : (currentRound > 2 ? 'background: var(--color-validation-light); color: #000;' : 'background: rgba(0,0,0,0.06); color: var(--text-tertiary);')}">
                    ${currentRound > 2 ? '2' : (currentRound < 2 ? '🔒' : '2')}
                </span>
                <span style="font-size: 12px; font-weight: ${currentRound === 2 ? '800' : 'normal'}; color: ${currentRound === 2 ? 'var(--text-primary)' : 'var(--text-secondary)'};">Vòng 2 (Vừa)</span>
            </div>
            
            <div style="height: 1px; background: var(--border-color); flex: 1; max-width: 40px;"></div>
            
            <div class="round-step ${currentRound === 3 ? 'active' : ''}" style="display: flex; align-items: center; gap: 6px;">
                <span class="round-dot" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; 
                    ${currentRound === 3 ? 'background: var(--color-interactive); color: #000; box-shadow: 0 0 10px var(--color-interactive);' : 'background: rgba(0,0,0,0.06); color: var(--text-tertiary);'}">
                    ${currentRound === 3 ? '3' : '🔒'}
                </span>
                <span style="font-size: 12px; font-weight: ${currentRound === 3 ? '800' : 'normal'}; color: ${currentRound === 3 ? 'var(--text-primary)' : 'var(--text-secondary)'};">Vòng 3 (Khó)</span>
            </div>
        </div>
    </div>
    `;

    // Build question body content
    let cardContentHtml = '';
    if (question.type === 'multiple_choice' || question.type === 'cloze' ||
        question.type === 'error_identification' || question.type === 'sentence_transformation' ||
        question.type === 'communication') {
        const typeLabels = {
            'multiple_choice': '',
            'cloze': '',
            'error_identification': '<div style="font-size:10px; font-weight:800; color:#ffb300; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">⚠️ Error Identification — Sửa lỗi sai</div>',
            'sentence_transformation': '<div style="font-size:10px; font-weight:800; color:var(--color-interactive); text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">🔄 Sentence Transformation — Viết lại câu</div>',
            'communication': '<div style="font-size:10px; font-weight:800; color:#a855f7; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">💬 Communication — Tình huống giao tiếp</div>'
        };
        let optionsHtml = '';
        Object.entries(question.options).forEach(([key, val]) => {
            let stateClass = '';
            if (grammarDrawerState.hasChecked) {
                if (key === question.correct) {
                    stateClass = 'correct';
                } else if (grammarDrawerState.selectedOption === key) {
                    stateClass = 'incorrect';
                }
            } else {
                if (grammarDrawerState.selectedOption === key) {
                    stateClass = 'selected';
                }
            }
            optionsHtml += `
                <div class="sandbox-option ${stateClass}" onclick="if(!grammarDrawerState.hasChecked) selectSandboxOption('${key}')">
                    <span class="sandbox-option-badge">${key}</span>
                    <span class="sandbox-option-text">${val}</span>
                </div>`;
        });
        cardContentHtml = `
            ${typeLabels[question.type] || ''}
            <div class="sandbox-stem">${question.stem}</div>
            <div class="sandbox-options">${optionsHtml}</div>`;
    } else if (question.type === 'word_builder') {

        let selectedZoneHtml = '';
        if (grammarDrawerState.selectedWords.length === 0) {
            selectedZoneHtml = `<span style="color:var(--text-tertiary); font-size:11px; margin:auto;">Nhấp vào các từ bên dưới để ghép câu hoàn chỉnh...</span>`;
        } else {
            grammarDrawerState.selectedWords.forEach((word, idx) => {
                selectedZoneHtml += `<div class="sandbox-word-tile active" onclick="if(!grammarDrawerState.hasChecked) deselectSandboxWord(${idx})">${word}</div>`;
            });
        }
        let availableZoneHtml = '';
        grammarDrawerState.availableWords.forEach((word, idx) => {
            availableZoneHtml += `<div class="sandbox-word-tile" onclick="if(!grammarDrawerState.hasChecked) selectSandboxWord(${idx})">${word}</div>`;
        });
        cardContentHtml = `
            <div class="sandbox-stem" style="margin-bottom:12px;"><strong>Thử thách lắp ghép:</strong> ${question.prompt}</div>
            <strong style="font-size:10px; color:var(--text-tertiary); display:block; margin-bottom:6px; text-transform:uppercase;">Mảnh ghép đã chọn:</strong>
            <div id="sandbox-selected-zone" style="min-height:54px; background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; display:flex; flex-wrap:wrap; gap:8px; align-content:flex-start; margin-bottom:16px;">
                ${selectedZoneHtml}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="font-size:10px; color:var(--text-tertiary); text-transform:uppercase;">Kho từ vựng của bạn:</strong>
                ${!grammarDrawerState.hasChecked ? `<button class="btn btn-secondary" style="font-size:10px; padding:3px 8px; min-height:auto;" onclick="triggerSandboxWordHint()">💡 Gợi ý (Hint)</button>` : ''}
            </div>
            <div id="sandbox-available-zone" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; min-height:40px; background:var(--bg-main); padding:8px; border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                ${availableZoneHtml}
            </div>`;
    }

    // Explainer formatting
    let explainerCardHtml = '';
    if (grammarDrawerState.hasChecked) {
        const exp = question.explanation;
        
        let headerHtml = '';
        if (grammarDrawerState.isCorrect) {
            headerHtml = `<div style="background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.2); color: var(--color-validation-light); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                🎉 CHÍNH XÁC! Bạn đã vượt qua câu hỏi này.
            </div>`;
        } else {
            headerHtml = `<div style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.2); color: var(--color-error); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                ⚠️ SAI LẦM! Câu trả lời chưa chính xác. Bạn bắt buộc phải làm lại vòng này từ đầu để vượt qua thử thách.
            </div>`;
        }

        explainerCardHtml = `
            ${headerHtml}
            <div class="deep-explainer-card animate-zoom" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-main); padding: 16px; margin-top: 20px;">
                <div class="explainer-step verdict" style="margin-bottom: 12px;">
                    <div class="explainer-step-title" style="font-weight: 800; font-size: 12px; color: var(--color-interactive); text-transform: uppercase;">1. Verdict (Kết luận)</div>
                    <div class="explainer-step-text" style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">${exp.verdict}</div>
                </div>
                <div class="explainer-step rule" style="margin-bottom: 12px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <div class="explainer-step-title" style="font-weight: 800; font-size: 12px; color: var(--color-interactive); text-transform: uppercase;">2. Rule (Quy tắc phòng thi)</div>
                    <div class="explainer-step-text" style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">${exp.rule}</div>
                </div>
                <div class="explainer-step why" style="margin-bottom: 12px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <div class="explainer-step-title" style="font-weight: 800; font-size: 12px; color: var(--color-interactive); text-transform: uppercase;">3. Why (Tại sao đúng)</div>
                    <div class="explainer-step-text" style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">${exp.why}</div>
                </div>
                <div class="explainer-step trap" style="margin-bottom: 12px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <div class="explainer-step-title" style="font-weight: 800; font-size: 12px; color: #ffb300; text-transform: uppercase;">4. Trap (Cạm bẫy cần tránh)</div>
                    <div class="explainer-step-text" style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">${exp.trap}</div>
                </div>
                <div class="explainer-step tip" style="border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <div class="explainer-step-title" style="font-weight: 800; font-size: 12px; color: var(--color-validation-light); text-transform: uppercase;">5. Tip (Mẹo làm bài nhanh)</div>
                    <div class="explainer-step-text" style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">${exp.tip}</div>
                </div>
            </div>`;
    }

    // Build action buttons
    let actionBtnHtml = '';
    if (!grammarDrawerState.hasChecked) {
        actionBtnHtml = `<button class="btn btn-primary" style="width:100%; min-height: 44px; font-weight: 800;" onclick="checkSandboxAnswer()">Kiểm tra đáp án</button>`;
    } else {
        if (grammarDrawerState.isCorrect) {
            if (qIndex === roundEndIdx) {
                if (currentRound < 3) {
                    actionBtnHtml = `<button class="btn btn-interactive animate-pulse" style="width:100%; min-height: 44px; font-weight: 800;" onclick="triggerRoundClearance()">Hoàn thành Vòng ${currentRound}! 🏆</button>`;
                } else {
                    actionBtnHtml = `<button class="btn btn-interactive animate-pulse" style="width:100%; min-height: 44px; font-weight: 800;" onclick="finishSandboxChallenge()">Hoàn thành thử thách 🏆</button>`;
                }
            } else {
                actionBtnHtml = `<button class="btn btn-primary" style="width:100%; min-height: 44px; font-weight: 800;" onclick="nextSandboxQuestion()">Câu tiếp theo ➔</button>`;
            }
        } else {
            actionBtnHtml = `<button class="btn btn-interactive" style="width:100%; min-height: 44px; font-weight: 800; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; border: none; box-shadow: 0 4px 15px rgba(244,67,54,0.4);" onclick="resetActiveRound()">Làm lại vòng này 🔄</button>`;
        }
    }

    pane.innerHTML = `
        <div class="practice-sandbox ${zoomClass}">
            <button class="btn btn-secondary" style="margin-bottom: 20px; font-size: 13px; padding: 8px 16px;" onclick="window.switchLessonTab('theory')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Quay lại Lý thuyết
            </button>
            ${trackerHtml}
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:12px; font-weight:700; color:var(--text-secondary);">Tiến độ vòng: Câu ${qIndex - roundStartIdx + 1}/${roundTotalQs}</span>
                <span style="font-size:11px; background:rgba(0,176,255,0.1); color:var(--color-interactive); padding:2px 6px; border-radius:4px; font-weight:700;">Sandbox Mode</span>
            </div>
            <div class="mastery-progress-bar-bg" style="width:100%; margin-bottom:20px; background: rgba(0,0,0,0.05); height: 6px; border-radius: 3px; overflow: hidden;">
                <div class="mastery-progress-bar-fill" style="width:${roundProgressPercent}%; background: var(--color-interactive); height: 100%; transition: width 0.2s ease;"></div>
            </div>
            
            <div class="glass-card sandbox-card" style="margin-bottom: 20px; padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                ${cardContentHtml}
            </div>
            
            ${actionBtnHtml}
            
            ${explainerCardHtml}
        </div>`;
};

window.selectSandboxOption = function(key) {
    if (grammarDrawerState.hasChecked) return;
    grammarDrawerState.selectedOption = key;
    renderLessonPracticeTab();
};

window.selectSandboxWord = function(idx) {
    if (grammarDrawerState.hasChecked) return;
    const word = grammarDrawerState.availableWords[idx];
    grammarDrawerState.selectedWords.push(word);
    grammarDrawerState.availableWords.splice(idx, 1);
    renderLessonPracticeTab();
};

window.deselectSandboxWord = function(idx) {
    if (grammarDrawerState.hasChecked) return;
    const word = grammarDrawerState.selectedWords[idx];
    grammarDrawerState.availableWords.push(word);
    grammarDrawerState.selectedWords.splice(idx, 1);
    renderLessonPracticeTab();
};

window.triggerSandboxWordHint = function() {
    if (grammarDrawerState.hasChecked) return;
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === grammarDrawerState.topicId);
    const question = grammarDrawerState.practiceQuestions[grammarDrawerState.overallQuestionIndex];
    const correctSeq = question.correct.split(' ');
    
    const currentLength = grammarDrawerState.selectedWords.length;
    const nextWord = correctSeq[currentLength];
    if (!nextWord) return;
    
    const avIdx = grammarDrawerState.availableWords.findIndex(w => w.toLowerCase() === nextWord.toLowerCase());
    if (avIdx !== -1) {
        const actualWord = grammarDrawerState.availableWords[avIdx];
        grammarDrawerState.selectedWords.push(actualWord);
        grammarDrawerState.availableWords.splice(avIdx, 1);
    } else {
        const targetSeq = correctSeq.slice(0, currentLength + 1);
        grammarDrawerState.selectedWords = [...targetSeq];
        const remainingWords = [...question.words];
        targetSeq.forEach(tw => {
            const rIdx = remainingWords.findIndex(rw => rw.toLowerCase() === tw.toLowerCase());
            if (rIdx !== -1) {
                remainingWords.splice(rIdx, 1);
            }
        });
        grammarDrawerState.availableWords = remainingWords;
    }
    renderLessonPracticeTab();
};

window.checkSandboxAnswer = function() {
    const question = grammarDrawerState.practiceQuestions[grammarDrawerState.overallQuestionIndex];
    
    let isCorrect = false;
    if (question.type === 'multiple_choice' || question.type === 'cloze' ||
        question.type === 'error_identification' || question.type === 'sentence_transformation' ||
        question.type === 'communication') {
        if (!grammarDrawerState.selectedOption) {
            alert('Vui lòng chọn một đáp án!');
            return;
        }
        isCorrect = (grammarDrawerState.selectedOption === question.correct);
    } else if (question.type === 'word_builder') {
        if (grammarDrawerState.selectedWords.length === 0) {
            alert('Vui lòng ghép các từ thành câu hoàn chỉnh!');
            return;
        }
        const userStr = grammarDrawerState.selectedWords.join(' ').trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
        const correctStr = question.correct.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
        isCorrect = (userStr === correctStr);
    }
    
    grammarDrawerState.isCorrect = isCorrect;
    grammarDrawerState.hasChecked = true;
    
    if (isCorrect) {
        playSuccessSound();
    } else {
        playFailSound();
        const card = document.querySelector('.sandbox-card');
        if (card) {
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 500);
        }
    }
    renderLessonPracticeTab();
};

window.nextSandboxQuestion = function() {
    grammarDrawerState.overallQuestionIndex += 1;
    grammarDrawerState.hasChecked = false;
    grammarDrawerState.selectedOption = null;
    grammarDrawerState.selectedWords = [];
    renderLessonPracticeTab();
};

window.triggerRoundClearance = function() {
    playSuccessSound();
    triggerConfetti();
    grammarDrawerState.isRoundCleared = true;
    renderLessonPracticeTab();
};

window.startNextRound = function() {
    grammarDrawerState.currentRound += 1;
    grammarDrawerState.isRoundCleared = false;
    if (grammarDrawerState.currentRound === 2) {
        grammarDrawerState.overallQuestionIndex = 5;
    } else if (grammarDrawerState.currentRound === 3) {
        grammarDrawerState.overallQuestionIndex = 15;
    }
    grammarDrawerState.hasChecked = false;
    grammarDrawerState.selectedOption = null;
    grammarDrawerState.selectedWords = [];
    renderLessonPracticeTab();
};

window.resetActiveRound = function() {
    const currentRound = grammarDrawerState.currentRound || 1;
    if (currentRound === 1) {
        grammarDrawerState.overallQuestionIndex = 0;
    } else if (currentRound === 2) {
        grammarDrawerState.overallQuestionIndex = 5;
    } else if (currentRound === 3) {
        grammarDrawerState.overallQuestionIndex = 15;
    }
    grammarDrawerState.hasChecked = false;
    grammarDrawerState.selectedOption = null;
    grammarDrawerState.selectedWords = [];
    grammarDrawerState.roundIncorrectCount = 0;
    grammarDrawerState.isCorrect = false;
    renderLessonPracticeTab();
};

window.finishSandboxChallenge = function() {
    const topicId = grammarDrawerState.topicId;
    const subTopicIdx = parseInt(grammarDrawerState.subTopicIdx);
    
    // Save completed subtopic index
    if (!AppState.grammarSubTopicsCompleted) {
        AppState.grammarSubTopicsCompleted = {};
    }
    if (!AppState.grammarSubTopicsCompleted[topicId]) {
        AppState.grammarSubTopicsCompleted[topicId] = [];
    }
    if (!AppState.grammarSubTopicsCompleted[topicId].includes(subTopicIdx)) {
        AppState.grammarSubTopicsCompleted[topicId].push(subTopicIdx);
    }

    // Calculate new mastery
    const topic = EXAM_RUNNERS_DB.grammarTimeline.find(t => t.id === topicId);
    let totalSubtopics = 0;
    if (topic.id === 'tense') {
        totalSubtopics = topic.visualConfig.timeStates ? topic.visualConfig.timeStates.length : 12;
    } else {
        totalSubtopics = topic.visualConfig && topic.visualConfig.types ? topic.visualConfig.types.length : 3;
    }

    const completedCount = AppState.grammarSubTopicsCompleted[topicId].length;
    const newMastery = Math.round((completedCount / totalSubtopics) * 100);
    AppState.grammarMastery[topicId] = newMastery;

    // Mark completed & unlock next if mastery is 100%
    if (newMastery === 100) {
        AppState.grammarStatus[topicId] = 'completed';
        
        const currentIndex = EXAM_RUNNERS_DB.grammarTimeline.findIndex(t => t.id === topicId);
        if (currentIndex !== -1 && currentIndex < EXAM_RUNNERS_DB.grammarTimeline.length - 1) {
            const nextNode = EXAM_RUNNERS_DB.grammarTimeline[currentIndex + 1];
            if (AppState.grammarStatus[nextNode.id] === 'locked' || !AppState.grammarStatus[nextNode.id]) {
                AppState.grammarStatus[nextNode.id] = 'active';
            }
        }
    }

    // Update XP & accuracy
    AppState.xp += 50;
    AppState.grammarAccuracy = Math.min(100, (AppState.grammarAccuracy || 74) + 2);
    
    // Sync with DB
    EXAM_RUNNERS_DB.grammarTimeline.forEach(node => {
        node.mastery = AppState.grammarMastery[node.id] !== undefined ? AppState.grammarMastery[node.id] : node.mastery;
        node.status = AppState.grammarStatus[node.id] !== undefined ? AppState.grammarStatus[node.id] : node.status;
    });

    saveAppStateToLocalStorage();
    triggerConfetti();
    playSuccessSound();

    // Reset drawer state questions
    grammarDrawerState.practiceQuestions = [];
    grammarDrawerState.isRoundCleared = false;

    // Return to grammar shelf tab
    closeGrammarLesson();
};


// --- G. PARENT & TUTOR REPORT HUB ---
function renderParentHub(container) {
    // 1. Calculate dynamic statistics
    const completedCount = Object.keys(AppState.completedExams || {}).length;
    const totalCount = EXAM_RUNNERS_DB.exams ? EXAM_RUNNERS_DB.exams.length : 50;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const currentStreak = AppState.streak || 0;

    // Determine parent discipline state based on current learning activity
    const logs = AppState.activityLog || [];
    const lastActivity = logs.length > 0 ? new Date(logs[logs.length - 1].timestamp) : null;
    const today = new Date();
    const daysSinceLastActivity = lastActivity ? Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24)) : 999;
    const activeWeaknesses = AppState.weaknesses ? AppState.weaknesses.length : 0;

    let disciplineState = "green";
    let stateBadgeText = "🟢 Rất Chăm Chỉ";
    let statusText = "Con đang duy trì kỷ luật rất tốt, chủ động rèn luyện thường xuyên.";
    let actionPromptHtml = "";
    
    // Actionable Insights logic
    if (logs.length === 0) {
        disciplineState = "yellow";
        stateBadgeText = "🟡 Chưa Bắt Đầu";
        statusText = "Con chưa thực hiện hoạt động học tập nào trên hệ thống.";
        actionPromptHtml = `
            <div style="padding: 16px; background:rgba(255,152,0,0.06); border-radius:12px; border:1px dashed rgba(255,152,0,0.25);">
                <div style="font-size:14px; font-weight:700; color:#ffb74d; margin-bottom: 8px;">💡 Lời khuyên cho Phụ huynh:</div>
                <div style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom: 12px;">Con mới bắt đầu tham gia lộ trình học. Bố mẹ hãy khích lệ con bắt đầu làm quen bằng cách hoàn thành 15 phút bài học ngữ pháp hoặc ôn từ vựng đầu tiên nhé!</div>
                <blockquote style="font-size:13px; font-style:italic; border-left: 3px solid #ffb74d; padding-left: 10px; margin: 0; color: #ffcc80;">"Con hãy thử khám phá kho từ vựng Flashcard hoặc thử thách ngữ pháp đầu tiên xem sao nhé!"</blockquote>
            </div>
        `;
    } else if (daysSinceLastActivity <= 2 || currentStreak >= 3) {
        disciplineState = "green";
        stateBadgeText = "🟢 Rất Chăm Chỉ";
        statusText = currentStreak > 0 ? `Tuyệt vời! Con đã duy trì chuỗi học ${currentStreak} ngày liên tục.` : "Con đang có nhịp độ học khá tốt. Hãy tiếp tục duy trì nhé!";
        actionPromptHtml = `
            <div style="padding: 16px; background:rgba(76,175,80,0.06); border-radius:12px; border:1px dashed rgba(76,175,80,0.25);">
                <div style="font-size:14px; font-weight:700; color:#81c784; margin-bottom: 8px;">🌟 Lời khuyên cho Phụ huynh:</div>
                <div style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom: 12px;">Con đang có đà học rất tốt. Khích lệ sự nỗ lực (thay vì chỉ khen điểm số) sẽ giúp con duy trì động lực lâu dài.</div>
                <blockquote style="font-size:13px; font-style:italic; border-left: 3px solid #81c784; padding-left: 10px; margin: 0; color: #a5d6a7;">"Bố/mẹ thấy dạo này con rất tự giác học Tiếng Anh, mẹ rất tự hào về sự kiên trì nỗ lực này của con!"</blockquote>
            </div>
        `;
    } else if (daysSinceLastActivity <= 4 || activeWeaknesses < 10) {
        disciplineState = "yellow";
        stateBadgeText = "🟡 Cần Động Viên";
        statusText = `Con đang chững lại nhẹ, đã ${daysSinceLastActivity} ngày chưa nộp bài mới.`;
        actionPromptHtml = `
            <div style="padding: 16px; background:rgba(255,152,0,0.06); border-radius:12px; border:1px dashed rgba(255,152,0,0.25);">
                <div style="font-size:14px; font-weight:700; color:#ffb74d; margin-bottom: 8px;">⚠️ Lời khuyên cho Phụ huynh:</div>
                <div style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom: 12px;">Con có thể đang gặp áp lực hoặc bài khó. Hãy hỏi thăm nhẹ nhàng để giúp con giải tỏa.</div>
                <blockquote style="font-size:13px; font-style:italic; border-left: 3px solid #ffb74d; padding-left: 10px; margin: 0; color: #ffcc80;">"Dạo này lịch học của con có vẻ căng thẳng. Tối nay hai mẹ con đi dạo một chút cho khuây khỏa nhé?"</blockquote>
            </div>
        `;
    } else {
        disciplineState = "red";
        stateBadgeText = "🔴 Cần Nhắc Nhở";
        statusText = `Cảnh báo: Con đã bỏ bê việc học quá ${daysSinceLastActivity} ngày.`;
        actionPromptHtml = `
            <div style="padding: 16px; background:rgba(244,67,54,0.06); border-radius:12px; border:1px dashed rgba(244,67,54,0.25);">
                <div style="font-size:14px; font-weight:700; color:#e57373; margin-bottom: 8px;">🚨 Lời khuyên cho Phụ huynh:</div>
                <div style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom: 12px;">Đừng trách mắng, hãy đồng hành. Thuyết phục con bắt đầu bằng "quy tắc 15 phút" sẽ dễ dàng hơn.</div>
                <blockquote style="font-size:13px; font-style:italic; border-left: 3px solid #e57373; padding-left: 10px; margin: 0; color: #ef9a9a;">"Đề Tiếng Anh đợt này khó con nhỉ? Tối nay mẹ ngồi cạnh, con chỉ cần làm 15 phút thôi rồi nghỉ nhé!"</blockquote>
            </div>
        `;
    }

    // 2. Generate Calendar Heatmap dynamically
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let heatmapHtml = '';
    let totalStudyHours = 0;

    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
            totalStudyHours += (log.durationMinutes || 0) / 60;
        }
    });

    for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - i);
        const dayLabel = daysOfWeek[targetDate.getDay()];
        
        const dayStart = new Date(targetDate.setHours(0,0,0,0));
        const dayEnd = new Date(targetDate.setHours(23,59,59,999));
        
        const dayLogs = logs.filter(log => {
            const d = new Date(log.timestamp);
            return d >= dayStart && d <= dayEnd;
        });

        let dotClass = 'flexible';
        let dotContent = `<span style="font-size: 14px; opacity: 0.35;">-</span>`;

        if (dayLogs.length > 0) {
            const firstLog = dayLogs[0];
            if (firstLog.status === 'late') {
                dotClass = 'yellow';
                dotContent = `<i data-lucide="clock" style="width:14px; height:14px; color:#ffb74d;"></i>`;
            } else {
                dotClass = 'green';
                dotContent = `<i data-lucide="check-circle" style="width:14px; height:14px; color:#81c784;"></i>`;
            }
        } else if (i > 0 && targetDate.getDay() === 0) {
            dotClass = 'rest';
            dotContent = `<span style="font-size: 12px;">☕</span>`;
        }

        heatmapHtml += `
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                <span style="font-size:10px; font-weight:700; color:${i === 0 ? 'var(--color-interactive)' : 'var(--text-tertiary)'};">${dayLabel}</span>
                <div class="day-dot ${dotClass}" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${dotClass === 'green' ? 'rgba(76,175,80,0.1)' : dotClass === 'yellow' ? 'rgba(255,152,0,0.1)' : dotClass === 'rest' ? 'rgba(143,130,117,0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${dotClass === 'green' ? 'rgba(76,175,80,0.3)' : dotClass === 'yellow' ? 'rgba(255,152,0,0.3)' : dotClass === 'rest' ? 'rgba(143,130,117,0.2)' : 'var(--border-color)'};">
                    ${dotContent}
                </div>
            </div>
        `;
    }

    // 3. Generate Dynamic SVG Sparkline (ROI)
    let defsHtml = `
        <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-interactive)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--color-interactive)" stop-opacity="0.0"/>
            </linearGradient>
            <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4caf50" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#4caf50" stop-opacity="0.0"/>
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    `;
    let svgPathHtml = defsHtml;
    let svgDotsHtml = '';
    let chartSummaryText = '';
    
    let examScores = [];
    if (AppState.completedExams) {
        const sortedExams = Object.keys(AppState.completedExams).sort((a,b) => a - b);
        examScores = sortedExams.map(id => AppState.completedExams[id]);
    }
    
    if (examScores.length >= 2) {
        const totalPoints = examScores.length;
        const widthBetween = totalPoints > 1 ? 260 / (totalPoints - 1) : 260;
        
        let points = examScores.map((score, index) => ({
            x: 20 + index * widthBetween,
            y: 105 - score * 0.8
        }));
        
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i+1];
            pathD += ` C ${(p1.x + p2.x)/2} ${p1.y}, ${(p1.x + p2.x)/2} ${p2.y}, ${p2.x} ${p2.y}`;
        }
        
        let areaPathD = pathD + ` L ${points[points.length-1].x} 115 L ${points[0].x} 115 Z`;
        
        svgPathHtml += `
            <path d="${areaPathD}" fill="url(#chartGradient)" />
            <path d="${pathD}" fill="none" stroke="var(--color-interactive)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
        `;
        
        points.forEach((p, index) => {
            const isLast = index === totalPoints - 1;
            svgDotsHtml += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg-primary)" stroke="${isLast ? '#4caf50' : 'var(--color-interactive)'}" stroke-width="2.5" />`;
            if (isLast) {
                svgDotsHtml += `
                    <rect x="${p.x - 22}" y="${p.y - 28}" width="44" height="20" rx="4" fill="#4caf50" />
                    <polygon points="${p.x},${p.y - 8} ${p.x - 5},${p.y - 12} ${p.x + 5},${p.y - 12}" fill="#4caf50" />
                    <text x="${p.x}" y="${p.y - 14}" fill="#ffffff" font-size="11" text-anchor="middle" font-weight="bold">${examScores[index]}%</text>
                `;
            }
        });
        
        const scoreDiff = examScores[examScores.length - 1] - examScores[0];
        chartSummaryText = scoreDiff > 0 ? `Điểm số đã tăng +${scoreDiff}% so với ban đầu.` : `Con đang duy trì điểm số ở mức ${examScores[examScores.length - 1]}%.`;
    } else {
        const goalVal = parseFloat(AppState.scoreGoal) * 10 || 80;
        let points = [
            { x: 20, y: 95 },
            { x: 100, y: 70 },
            { x: 190, y: 45 },
            { x: 280, y: 105 - goalVal * 0.8 }
        ];
        
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i+1];
            pathD += ` C ${(p1.x + p2.x)/2} ${p1.y}, ${(p1.x + p2.x)/2} ${p2.y}, ${p2.x} ${p2.y}`;
        }
        let areaPathD = pathD + ` L ${points[points.length-1].x} 115 L ${points[0].x} 115 Z`;
        
        svgPathHtml += `
            <path d="${areaPathD}" fill="url(#goalGradient)" />
            <path d="${pathD}" fill="none" stroke="#4caf50" stroke-dasharray="6,6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        `;
        
        svgDotsHtml = `
            <circle cx="20" cy="95" r="4" fill="var(--bg-primary)" stroke="#4caf50" stroke-width="2.5" />
            <circle cx="280" cy="${105 - goalVal * 0.8}" r="5" fill="#4caf50" stroke="#4caf50" stroke-width="2" filter="url(#glow)" />
            <rect x="240" y="${105 - goalVal * 0.8 - 32}" width="80" height="22" rx="4" fill="#4caf50" />
            <polygon points="280,${105 - goalVal * 0.8 - 10} 274,${105 - goalVal * 0.8 - 15} 286,${105 - goalVal * 0.8 - 15}" fill="#4caf50" />
            <text x="280" y="${105 - goalVal * 0.8 - 16}" fill="#ffffff" font-size="11" text-anchor="middle" font-weight="bold">${AppState.scoreGoal} Mục tiêu</text>
        `;
        chartSummaryText = `Đang hướng tới mục tiêu bứt phá đạt ${AppState.scoreGoal} điểm.`;
    }

    // 4. Calculate self-study stats
    const grammarMastery = AppState.grammarMastery || {};
    const totalGrammarTopics = Object.keys(grammarMastery).length || 10;
    const completedGrammarTopics = Object.values(grammarMastery).filter(m => m === 100).length;
    const grammarAccuracy = AppState.grammarAccuracy || 0;

    const statuses = AppState.wordStatuses || {};
    const allWords = AppState.flashcards || [];
    const totalWordsCount = allWords.length;
    const learnedWordsCount = allWords.filter(w => (statuses[w.id] || 'new') === 'known').length;
    const learningWordsCount = allWords.filter(w => (statuses[w.id] || 'new') === 'learning').length;

    const topics = AppState.topics || [];
    const totalTopicsCount = topics.length;
    let completedTopicsCount = 0;
    topics.forEach(topic => {
        if (topic.words && topic.words.length > 0) {
            const allKnown = topic.words.every(wordId => (statuses[wordId] || 'new') === 'known');
            if (allKnown) {
                completedTopicsCount++;
            }
        }
    });

    // 5. Build output HTML
    let examProgressBlockHtml = "";
    if (completedCount === 0) {
        examProgressBlockHtml = `
            <div style="text-align: center; padding: 32px 16px; background: rgba(0,0,0,0.01); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                <span style="font-size: 32px; display: block; margin-bottom: 12px;">📝</span>
                <p style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Chưa bắt đầu luyện đề</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height:1.5;">Con chưa thực hiện bài thi thử nào. Báo cáo tiến trình luyện đề và biểu đồ phân tích điểm số sẽ được vẽ tại đây ngay sau khi con hoàn thành bài thi thử đầu tiên.</p>
            </div>
        `;
    } else {
        examProgressBlockHtml = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- Progress Bar -->
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-tertiary); font-weight:700; margin-bottom:6px; text-transform:uppercase;">
                        <span>Tiến độ luyện đề</span>
                        <span style="color:var(--color-interactive);">${progressPercent}%</span>
                    </div>
                    <div style="height:8px; background:rgba(0,0,0,0.06); border-radius:4px; overflow:hidden;">
                        <div style="height:100%; width:${progressPercent}%; background:linear-gradient(90deg, #ff9800, #00b0ff, #4caf50); border-radius:4px;"></div>
                    </div>
                </div>
                
                <!-- Chart -->
                <div style="width:100%; position:relative; background:rgba(0,0,0,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px;">
                    <svg viewBox="0 0 325 120" style="width:100%; height:auto; overflow:visible;">
                        <line x1="0" y1="115" x2="325" y2="115" stroke="var(--border-color)" stroke-width="1" />
                        ${svgPathHtml}${svgDotsHtml}
                    </svg>
                </div>
            </div>
        `;
    }

    let diagnosticsBlockHtml = "";
    if (completedCount === 0 && logs.length === 0) {
        diagnosticsBlockHtml = `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:center; grid-column: 1 / -1;">
                <p style="font-size:13px; color:var(--text-secondary); margin:0; line-height:1.5;">Hệ thống đang tích lũy dữ liệu học tập của học sinh. Sau khi làm bài thi thử hoặc rèn luyện từ vựng/ngữ pháp, bản chẩn đoán chi tiết điểm mù kiến thức sẽ được phân tích tự động tại đây.</p>
            </div>
        `;
    } else {
        diagnosticsBlockHtml = `
            <!-- Weakness Summary -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px;">
                <div style="font-size:12px; font-weight:700; color:var(--text-tertiary); text-transform:uppercase; margin-bottom:12px;">Điểm mù kiến thức (Đang gặp khó)</div>
                <ul style="margin:0; padding-left:16px; font-size:13px; color:var(--text-secondary); line-height:1.6;">
                    <li>Ngữ pháp: <span style="color:#ffb74d;">${completedGrammarTopics > 0 ? 'Câu điều kiện (Thường sai)' : 'Chưa thu thập đủ lỗi sai'}</span></li>
                    <li>Từ vựng: <span style="color:#ffb74d;">${learnedWordsCount > 0 ? 'Chủ đề Môi trường' : 'Chưa thu thập đủ lỗi sai'}</span></li>
                    <li>Kỹ năng: <span style="color:#ffb74d;">${completedCount > 0 ? 'Đọc điền từ (Cloze test)' : 'Chưa thu thập đủ lỗi sai'}</span></li>
                </ul>
            </div>
            
            <!-- Action Prompt -->
            ${actionPromptHtml}
        `;
    }

    container.innerHTML = `
        <div class="animate-zoom" style="color: var(--text-primary); display:flex; flex-direction:column; gap:20px; max-width: 800px; margin: 0 auto; padding-bottom:40px;">
            <!-- Top Sync Status Panel -->
            <div style="display:flex; justify-content:flex-end; margin-bottom: 4px;">
                <div style="font-size:11px; background: rgba(76, 175, 80, 0.08); border: 1px solid rgba(76, 175, 80, 0.15); padding: 6px 12px; border-radius: 20px; color:#81c784; font-weight:700; display:flex; align-items:center;">
                    <span style="width:6px; height:6px; background:#81c784; border-radius:50%; display:inline-block; margin-right:6px;"></span>Đã đồng bộ
                </div>
            </div>

            <!-- Block 1: Effort & Discipline -->
            <div style="background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px;">
                    <div>
                        <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin:0 0 6px 0; color:var(--text-primary);">1. Mức Độ Chăm Chỉ & Kỷ Luật</h4>
                        <p style="font-size:13px; color:var(--text-secondary); margin:0;">${statusText}</p>
                    </div>
                    <span style="font-size:12px; font-weight:700; background:${disciplineState === 'green' ? 'rgba(76,175,80,0.12)' : disciplineState === 'yellow' ? 'rgba(255,152,0,0.12)' : 'rgba(244,67,54,0.12)'}; color:${disciplineState === 'green' ? '#81c784' : disciplineState === 'yellow' ? '#ffb74d' : '#e57373'}; padding:6px 12px; border-radius:20px;">
                        ${stateBadgeText}
                    </span>
                </div>
                
                <div style="display:flex; gap:24px; align-items:center; background: rgba(0,0,0,0.02); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="text-align:center; padding-right: 24px; border-right: 1px dashed var(--border-color);">
                        <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase; font-weight:700; margin-bottom:4px;">Thời gian học tuần</div>
                        <div style="font-size:20px; font-weight:800; color:var(--color-interactive); font-family:var(--font-heading);">${totalStudyHours.toFixed(1)} <span style="font-size:12px;">giờ</span></div>
                    </div>
                    <div style="flex:1; display:flex; justify-content:space-around;">
                        ${heatmapHtml}
                    </div>
                </div>
            </div>

            <!-- Block 2: Progress & Performance -->
            <div style="background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
                <div style="margin-bottom: 16px;">
                    <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin:0 0 6px 0; color:var(--text-primary);">2. Tiến Độ & Hiệu Quả Học Tập</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin:0;">Con đã hoàn thành ${completedCount}/${totalCount} đề thi (Đạt ${progressPercent}% lộ trình). ${completedCount > 0 ? chartSummaryText : ''}</p>
                </div>
                
                ${examProgressBlockHtml}
            </div>

            <!-- Block 3: Self-Study Progress -->
            <div style="background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
                <div style="margin-bottom: 16px;">
                    <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin:0 0 6px 0; color:var(--text-primary);">3. Tiến Độ Tự Học (Ngữ Pháp & Từ Vựng)</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin:0;">Thống kê chi tiết tiến trình tích lũy học liệu tại Grammar Shelf và Flashcard Desk.</p>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                    <!-- Grammar Shelf Stats -->
                    <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size:13px; font-weight:700; color:var(--text-primary);">⚖️ Grammar Shelf</span>
                                <span style="font-size:11px; font-weight:700; background:rgba(0,176,255,0.1); color:var(--color-interactive); padding:2px 6px; border-radius:4px;">Chuyên đề</span>
                            </div>
                            <p style="font-size:12px; color:var(--text-secondary); margin: 0 0 12px 0;">Học tập cấu trúc ngữ pháp trọng tâm thi vào lớp 10.</p>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--text-primary); margin-bottom:6px;">
                                <span>Chủ đề đã hoàn thành</span>
                                <span>${completedGrammarTopics}/${totalGrammarTopics}</span>
                            </div>
                            <div style="height:6px; background:rgba(0,0,0,0.06); border-radius:3px; overflow:hidden; margin-bottom:12px;">
                                <div style="height:100%; width:${(completedGrammarTopics/totalGrammarTopics)*100}%; background:var(--color-interactive); border-radius:3px;"></div>
                            </div>
                            <div style="font-size:11px; color:var(--text-tertiary); display:flex; justify-content:space-between;">
                                <span>Độ chính xác trung bình</span>
                                <span style="font-weight:700; color:var(--color-interactive);">${grammarAccuracy}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Flashcard Desk Stats -->
                    <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size:13px; font-weight:700; color:var(--text-primary);">📚 Flashcard Desk</span>
                                <span style="font-size:11px; font-weight:700; background:rgba(76,175,80,0.1); color:#81c784; padding:2px 6px; border-radius:4px;">Từ vựng</span>
                            </div>
                            <p style="font-size:12px; color:var(--text-secondary); margin: 0 0 12px 0;">Luyện từ vựng theo phương pháp lặp lại ngắt quãng.</p>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--text-primary); margin-bottom:6px;">
                                <span>Đã thuộc (Mastered)</span>
                                <span>${learnedWordsCount}/${totalWordsCount} từ</span>
                            </div>
                            <div style="height:6px; background:rgba(0,0,0,0.06); border-radius:3px; overflow:hidden; margin-bottom:12px;">
                                <div style="height:100%; width:${totalWordsCount > 0 ? (learnedWordsCount/totalWordsCount)*100 : 0}%; background:#81c784; border-radius:3px;"></div>
                            </div>
                            <div style="font-size:11px; color:var(--text-tertiary); display:flex; justify-content:space-between;">
                                <span>Đang học: <strong>${learningWordsCount} từ</strong></span>
                                <span>Chủ đề xong: <strong>${completedTopicsCount}/${totalTopicsCount}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Block 4: Actionable Insights -->
            <div style="background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
                <div style="margin-bottom: 16px;">
                    <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin:0 0 6px 0; color:var(--text-primary);">4. Điểm Cần Lưu Ý & Hành Động Gợi Ý</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin:0;">Chẩn đoán nhược điểm gần nhất và gợi ý tương tác dành cho bố mẹ.</p>
                </div>
                
                </div>
            </div>
        </div>
    `;
    
    // Re-initialize lucide icons for the new content
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
function renderAdminVault(container) {
    // Generate rows for existing questions
    let rowsHtml = '';
    EXAM_RUNNERS_DB.questions.slice().reverse().forEach((q) => {
        rowsHtml += `
            <tr class="tutor-q-row" id="q-row-${q.id}">
                <td style="padding: 12px 16px;"><strong>#${q.id}</strong></td>
                <td style="padding: 12px 16px;"><span class="admin-cell-tag" style="background: rgba(0, 176, 255, 0.12); color: var(--color-interactive); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${q.skill}</span></td>
                <td style="padding: 12px 16px; font-weight: 600;">${q.subskill}</td>
                <td style="padding: 12px 16px; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${q.stem}">${q.stem}</td>
                <td style="padding: 12px 16px;"><strong style="color:var(--color-validation-light); font-family: monospace;">${q.correct}</strong></td>
                <td style="padding: 12px 16px;">
                    <div class="admin-cell-action" style="display: flex; gap: 8px;">
                        <button class="tutor-edit-btn" onclick="window.tutorQuickEditQuestion(${q.id})"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Sửa</button>
                        <button class="tutor-delete-btn" onclick="window.tutorDeleteQuestion(${q.id})"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    });

    // Generate health card grid for Tutor
    const healthMatrixHtml = [
        { key: "cloze", title: "Đọc Điền Từ", accuracy: 62, status: "red", statusText: "Nguy Kịch (Yếu)", recommendation: "Học sinh hổng nặng từ vựng chủ đề Giáo dục và Môi trường.", icon: "📝" },
        { key: "reading", title: "Đọc Hiểu", accuracy: 68, status: "yellow", statusText: "Cần Lưu Ý", recommendation: "Kỹ năng tìm ý chính và loại trừ phương án nhiễu còn yếu.", icon: "📖" },
        { key: "grammar", title: "Ngữ Pháp", accuracy: AppState.grammarAccuracy || 74, status: "yellow", statusText: "Cần Lưu Ý", recommendation: "Nhầm lẫn Câu bị động đặc biệt và Mệnh đề quan hệ.", icon: "⚖️" },
        { key: "synonyms", title: "Từ Vựng", accuracy: 78, status: "yellow", statusText: "Cần Lưu Ý", recommendation: "Từ đồng nghĩa cơ bản tốt, cần bồi dưỡng thêm cụm động từ.", icon: "📚" },
        { key: "error", title: "Sửa Lỗi Sai", accuracy: 72, status: "yellow", statusText: "Cần Lưu Ý", recommendation: "Lỗi về sự hòa hợp giữa chủ ngữ số nhiều và động từ.", icon: "❌" },
        { key: "phonetics", title: "Phát Âm", accuracy: 95, status: "green", statusText: "Xuất Sắc", recommendation: "Kỹ năng phát âm đuôi -ed/-s tốt, duy trì phong độ.", icon: "🗣️" },
        { key: "stress", title: "Trọng Âm", accuracy: 88, status: "green", statusText: "Tốt", recommendation: "Quy tắc trọng âm từ 2 và 3 âm tiết vững vàng.", icon: "🎯" }
    ].map(item => `
        <div class="health-card">
            <span class="health-badge ${item.status}">${item.statusText}</span>
            <div>
                <div class="health-header">
                    <span class="health-icon-wrapper">${item.icon}</span>
                    <span class="health-title">${item.title}</span>
                </div>
                <div class="health-accuracy ${item.status}">${item.accuracy}%</div>
            </div>
            <p class="health-reco">💡 <strong>Chẩn đoán:</strong> ${item.recommendation}</p>
            <button style="width:100%; padding:7px 12px; font-size:11.5px; font-weight:700; border-radius:var(--radius-sm); border:1px solid ${item.status === 'red' ? 'rgba(244,67,54,0.35)' : 'rgba(0,176,255,0.2)'}; background:${item.status === 'red' ? 'rgba(244,67,54,0.08)' : 'rgba(0,176,255,0.05)'}; color:${item.status === 'red' ? '#e57373' : 'var(--color-interactive)'}; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;" onclick="window.assignTutorHomework('${item.key}', '${item.title}')" onmouseover="this.style.background='${item.status === 'red' ? '#f44336' : 'var(--color-interactive)'}'; this.style.color='#fff';" onmouseout="this.style.background='${item.status === 'red' ? 'rgba(244,67,54,0.08)' : 'rgba(0,176,255,0.05)'}'; this.style.color='${item.status === 'red' ? '#e57373' : 'var(--color-interactive)'}'">
                <i data-lucide="pin" style="width:13px; height:13px;"></i> Ghim luyện tập
            </button>
        </div>
    `).join('');

    const completedCount = Object.keys(AppState.completedExams || {}).length;
    const totalCount = EXAM_RUNNERS_DB.exams ? EXAM_RUNNERS_DB.exams.length : 50;
    
    const scores = Object.values(AppState.completedExams || {});
    let avgScore = 6.2;
    if (scores.length > 0) {
        avgScore = Math.round(scores.reduce((a,b) => a+b, 0) / scores.length * 10) / 100;
    }

    container.innerHTML = `
        <div class="animate-zoom" style="color: var(--text-primary);">
            <style>
                .tutor-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                @media (max-width: 1024px) {
                    .tutor-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .health-matrix-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                    margin-top: 16px;
                }
                .health-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-md);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .health-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .health-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    letter-spacing: 0.5px;
                }
                .health-badge.green {
                    background: rgba(46, 125, 50, 0.15);
                    color: #81c784;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                }
                .health-badge.yellow {
                    background: rgba(255, 152, 0, 0.15);
                    color: #ffb74d;
                    border: 1px solid rgba(255, 152, 0, 0.3);
                }
                .health-badge.red {
                    background: rgba(244, 67, 54, 0.15);
                    color: #e57373;
                    border: 1px solid rgba(244, 67, 54, 0.3);
                }
                .health-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .health-icon-wrapper {
                    font-size: 20px;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                }
                .health-title {
                    font-family: var(--font-heading);
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .health-accuracy {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 16px 0 8px 0;
                    font-family: var(--font-heading);
                }
                .health-accuracy.green { color: #81c784; }
                .health-accuracy.yellow { color: #ffb74d; }
                .health-accuracy.red { color: #e57373; }
                
                .health-reco {
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0 0 16px 0;
                    padding-top: 12px;
                    border-top: 1px dashed rgba(255, 255, 255, 0.06);
                }

                /* Tutor actions */
                .tutor-edit-btn {
                    background: none;
                    border: none;
                    color: var(--color-interactive);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .tutor-edit-btn:hover {
                    background: rgba(0, 176, 255, 0.1);
                }
                .tutor-delete-btn {
                    background: none;
                    border: none;
                    color: var(--color-danger);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .tutor-delete-btn:hover {
                    background: rgba(255, 82, 82, 0.1);
                }

                /* Tutor action toast */
                .tutor-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: rgba(23, 23, 23, 0.95);
                    border: 1px solid var(--color-interactive);
                    padding: 16px 20px;
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    backdrop-filter: blur(10px);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .tutor-toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .action-prompt-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 16px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    margin-bottom: 12px;
                }
            </style>

            <!-- Dashboard Header -->
            <div style="margin-bottom: 24px;">
                <div class="glass-card" style="padding: 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                    <div>
                        <h4 style="margin-bottom:6px; font-size: 20px; font-family: var(--font-heading);">🛡️ Tutor Diagnostic Dashboard</h4>
                        <p style="font-size:13px; color:var(--text-tertiary);">Chẩn đoán nhanh năng lực học sinh. Phiên bản tối ưu cho lộ trình luyện thi độc quyền.</p>
                    </div>
                    <div style="display:flex; gap:24px;">
                        <div style="text-align:center;">
                            <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase; font-weight:700;">Đề đã luyện</div>
                            <div style="font-size:24px; font-weight:900; color:var(--color-validation-light); font-family:var(--font-heading);">${completedCount}/${totalCount}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase; font-weight:700;">Điểm trung bình</div>
                            <div style="font-size:24px; font-weight:900; color:var(--color-interactive); font-family:var(--font-heading);">${avgScore}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gợi ý hành động cho Gia sư -->
            <div style="margin-bottom: 32px;">
                <h3 style="font-size: 18px; font-family: var(--font-heading); font-weight: 700; margin-bottom: 16px;">🎯 03 Hành Động Tập Trung (Gợi Ý Từ AI)</h3>
                <div class="action-prompt-card" style="border-left: 4px solid #e57373;">
                    <div style="font-size:24px;">1️⃣</div>
                    <div>
                        <div style="font-weight:700; font-size:14.5px; color:var(--text-primary); margin-bottom:4px;">Chữa lỗi sai dạng Đọc Điền Từ</div>
                        <div style="font-size:12.5px; color:var(--text-secondary);">Học sinh đang hổng nặng từ vựng chủ đề Giáo dục và Môi trường. Gia sư cần chuẩn bị thêm 2 đoạn văn ngắn chủ đề này cho buổi học tới.</div>
                    </div>
                </div>
                <div class="action-prompt-card" style="border-left: 4px solid #81c784;">
                    <div style="font-size:24px;">2️⃣</div>
                    <div>
                        <div style="font-weight:700; font-size:14.5px; color:var(--text-primary); margin-bottom:4px;">Khen ngợi kỹ năng Phát Âm</div>
                        <div style="font-size:12.5px; color:var(--text-secondary);">Phong độ duy trì rất xuất sắc (95%). Hãy dành 2 phút đầu giờ học để khen ngợi nhằm tạo động lực.</div>
                    </div>
                </div>
                <div class="action-prompt-card" style="border-left: 4px solid #ffb74d;">
                    <div style="font-size:24px;">3️⃣</div>
                    <div>
                        <div style="font-weight:700; font-size:14.5px; color:var(--text-primary); margin-bottom:4px;">Nhắc nhở nhẹ về Ngữ Pháp</div>
                        <div style="font-size:12.5px; color:var(--text-secondary);">Vẫn hay nhầm lẫn Câu bị động đặc biệt. Yêu cầu học sinh làm lại các bài luyện tập trên hệ thống trước buổi học tiếp theo.</div>
                    </div>
                </div>
            </div>

            <!-- Health map / diagnose matrix -->
            <div style="margin-bottom: 32px;">
                <h3 style="font-size: 18px; font-family: var(--font-heading); font-weight: 700;">📊 Bản đồ Sức khỏe Ma trận</h3>
                <p style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
                    Chẩn đoán năng lực chi tiết của Học sinh theo từng nhóm kiến thức. Nhấn "Ghim luyện tập" để ép học sinh ôn tập dạng bài yếu.
                </p>
                <div class="health-matrix-grid">
                    ${healthMatrixHtml}
                </div>
            </div>

            <!-- Questions Grid (T-1: hidden by default, toggle to show) -->
            <div>
                <div class="admin-header-row" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 18px; font-family: var(--font-heading); font-weight: 700;">Kho Câu Hỏi & Biên Tập Giải Thích</h3>
                        <p style="font-size:11.5px; color:var(--text-tertiary); margin-top:3px;">${EXAM_RUNNERS_DB.questions.length} câu hỏi hệ thống với giải thích 5 bước AI</p>
                    </div>
                    <button id="toggle-vault-table" class="btn btn-secondary" style="padding:8px 16px; font-size:12px; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="database" style="width:14px; height:14px;"></i> Xem / Quản lý Kho Đề
                    </button>
                </div>

                <div id="vault-table-wrapper" style="display:none;">
                    <div class="glass-card admin-questions-table-card" style="padding: 0; overflow: hidden; border-radius: var(--radius-md);">
                        <div class="admin-table-scroll" style="max-height: 400px; overflow-y: auto;">
                            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                                <thead>
                                    <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">ID</th>
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">Kỹ năng</th>
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">Chủ đề con</th>
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">Nội dung câu hỏi</th>
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">Đáp án</th>
                                        <th style="padding: 14px 16px; font-size: 12px; text-transform: uppercase; color: var(--text-tertiary);">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody id="tutor-questions-tbody">
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tutor Toast Alert -->
        <div id="tutor-action-toast" class="tutor-toast">
            <span style="font-size: 20px;">⚡</span>
            <div id="tutor-toast-text" style="font-size: 13px; font-weight: 600; line-height: 1.4;"></div>
        </div>
    `;
    lucide.createIcons();

    // T-1: Toggle vault questions table
    const toggleBtn = document.getElementById('toggle-vault-table');
    const tableWrapper = document.getElementById('vault-table-wrapper');
    if (toggleBtn && tableWrapper) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = tableWrapper.style.display === 'none';
            tableWrapper.style.display = isHidden ? 'block' : 'none';
            toggleBtn.innerHTML = isHidden
                ? '<i data-lucide="x" style="width:14px; height:14px;"></i> Thu gọn'
                : '<i data-lucide="database" style="width:14px; height:14px;"></i> Xem / Quản lý Kho Đề';
            lucide.createIcons();
        });
    }
}

// --- GLOBAL METHODS FOR TUTOR INTERACTIVES ---
window.assignTutorHomework = function(topicKey, topicTitle) {
    playSuccessSound();
    triggerConfetti();
    
    // Show toast
    const toast = document.getElementById('tutor-action-toast');
    const toastText = document.getElementById('tutor-toast-text');
    if (toast && toastText) {
        toastText.innerHTML = `Đã giao 10 bài tập phụ đạo bổ trợ về chuyên đề <strong>${topicTitle}</strong> thành công! Lộ trình của Học sinh đã được cập nhật.`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
};

window.simulateFileDragDrop = function() {
    const dropzone = document.getElementById('tutor-dropzone');
    if (!dropzone) return;
    
    // Change dropzone into a progressive loading spinner
    dropzone.onclick = null; // Disable subsequent clicks during execution
    dropzone.style.cursor = 'default';
    dropzone.innerHTML = `
        <div class="ai-upload-progress" style="width: 100%;">
            <div class="ai-spinner"></div>
            <div class="ai-step-text" id="ai-parse-step">📂 Đang tải tài liệu đề thi và trích xuất chữ...</div>
            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; position: relative;">
                <div id="ai-progress-bar" style="height: 100%; width: 10%; background: var(--color-interactive); transition: width 0.8s ease; border-radius: 3px;"></div>
            </div>
        </div>
    `;

    const steps = [
        { text: "📂 Đang tải tài liệu đề thi và trích xuất chữ...", width: "25%" },
        { text: "🧠 AI đang phân loại câu hỏi & gán nhãn ma trận kỹ năng...", width: "55%" },
        { text: "⚙️ Đang khởi tạo lời giải thích chi tiết 5 bước độc quyền...", width: "85%" },
        { text: "🎉 Số hóa hoàn tất! Nạp câu hỏi chất lượng cao...", width: "100%" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
            const stepEl = document.getElementById('ai-parse-step');
            const progressEl = document.getElementById('ai-progress-bar');
            if (stepEl) stepEl.innerText = steps[currentStep].text;
            if (progressEl) progressEl.style.width = steps[currentStep].width;
        } else {
            clearInterval(interval);
            
            // Add questions to the memory database
            const lastId = EXAM_RUNNERS_DB.questions.length > 0 ? EXAM_RUNNERS_DB.questions[EXAM_RUNNERS_DB.questions.length - 1].id : 0;
            const freshQuestions = [
                {
                    id: lastId + 1,
                    skill: "Grammar",
                    subskill: "Passive Voice (Bị động đặc biệt)",
                    stem: "It is believed that the new highway _______ by next year.",
                    options: { A: "will be completed", B: "completes", C: "will complete", D: "has completed" },
                    correct: "A",
                    explanation: {
                        verdict: "Đáp án đúng là A. Đây là cấu trúc bị động với tương lai đơn.",
                        rule: "S + will be + V3/ed (Bị động tương lai đơn)",
                        why: "Chủ ngữ chịu tác động của hành động hoàn thành kết hợp trạng ngữ 'by next year'.",
                        trap: "Không chọn chủ động C.",
                        tip: "Chủ ngữ chỉ vật + 'by + thời gian' thường là câu bị động."
                    }
                },
                {
                    id: lastId + 2,
                    skill: "Vocabulary",
                    subskill: "Phrasal Verbs (Cụm động từ)",
                    stem: "She decided to _______ the job offer because the salary was too low.",
                    options: { A: "turn down", B: "turn up", C: "get over", D: "go off" },
                    correct: "A",
                    explanation: {
                        verdict: "Đáp án đúng là A. turn down nghĩa là từ chối.",
                        rule: "Phrasal verbs: turn down (từ chối), turn up (xuất hiện).",
                        why: "Dựa vào ngữ cảnh 'salary was too low' (lương quá thấp).",
                        trap: "Tránh nhầm với 'go off' (đổ chuông).",
                        tip: "Học thuộc các cụm từ đi với 'turn'."
                    }
                },
                {
                    id: lastId + 3,
                    skill: "Reading",
                    subskill: "Main Ideas (Tìm ý chính)",
                    stem: "What is the main topic of the passage about online learning?",
                    options: { A: "The disadvantages of classroom learning", B: "The rapid growth and benefits of online education", C: "The history of internet usage", D: "How to use computers" },
                    correct: "B",
                    explanation: {
                        verdict: "Đáp án đúng là B. Cả đoạn văn nói về sự phát triển và lợi ích của giáo dục trực tuyến.",
                        rule: "Tìm ý chính (Main Idea) bằng cách đọc câu đầu/cuối các đoạn văn.",
                        why: "Đoạn 1 mở đầu, đoạn 2 nêu tăng trưởng, đoạn 3 tóm tắt ưu điểm.",
                        trap: "Tránh đáp án quá hẹp (C, D).",
                        tip: "Ý chính thường nằm ở đoạn mở đầu."
                    }
                }
            ];

            freshQuestions.forEach(q => {
                EXAM_RUNNERS_DB.questions.push(q);
            });
            
            // Add dynamically to Mock Exams counts
            EXAM_RUNNERS_DB.exams[0].questionsCount += freshQuestions.length;

            playSuccessSound();
            triggerConfetti();

            // Render view again to show the table updated
            renderAdminVault(document.getElementById('app-viewport'));
            
            // Show toast
            const toast = document.getElementById('tutor-action-toast');
            const toastText = document.getElementById('tutor-toast-text');
            if (toast && toastText) {
                toastText.innerHTML = `🎉 Số hóa đề thi thành công! Đã trích xuất & nạp <strong>3 câu hỏi chuẩn ma trận</strong> kèm lời giải thích 5 bước vào kho luyện tập.`;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 5000);
            }
        }
    }, 800);
};

window.tutorQuickEditQuestion = function(qId) {
    const question = EXAM_RUNNERS_DB.questions.find(q => q.id === qId);
    if (!question) return;
    
    const newStem = prompt(`✏️ Sửa nhanh nội dung câu hỏi #${qId}:`, question.stem);
    if (newStem === null) return; // cancelled
    
    if (newStem.trim() === '') {
        alert("Nội dung câu hỏi không được để trống!");
        return;
    }
    
    question.stem = newStem.trim();
    
    playSuccessSound();
    triggerConfetti();
    
    renderAdminVault(document.getElementById('app-viewport'));
    
    // Show toast
    const toast = document.getElementById('tutor-action-toast');
    const toastText = document.getElementById('tutor-toast-text');
    if (toast && toastText) {
        toastText.innerHTML = `✏️ Đã cập nhật nội dung câu hỏi <strong>#${qId}</strong> thành công!`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
};

window.tutorDeleteQuestion = function(qId) {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa câu hỏi #${qId} ra khỏi ma trận không?`)) {
        return;
    }
    
    const index = EXAM_RUNNERS_DB.questions.findIndex(q => q.id === qId);
    if (index === -1) return;
    
    EXAM_RUNNERS_DB.questions.splice(index, 1);
    
    // Dec mock exams questionsCount
    if (EXAM_RUNNERS_DB.exams[0].questionsCount > 0) {
        EXAM_RUNNERS_DB.exams[0].questionsCount--;
    }
    
    playSuccessSound();
    
    renderAdminVault(document.getElementById('app-viewport'));
    
    // Show toast
    const toast = document.getElementById('tutor-action-toast');
    const toastText = document.getElementById('tutor-toast-text');
    if (toast && toastText) {
        toastText.innerHTML = `🗑️ Đã xóa câu hỏi <strong>#${qId}</strong> khỏi ma trận đề thi!`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
};

// --- I. ADMIN ROADMAP PLANNER ---
function renderAdminRoadmap(container) {
    container.innerHTML = `
        <div class="glass-card animate-zoom" style="max-width:700px; margin: 0 auto;">
            <h3 style="margin-bottom:8px;">Lộ trình phân bổ đề thi tự động</h3>
            <p style="font-size:12px; color:var(--text-tertiary); margin-bottom:24px;">Hệ thống chia đều 50 đề thi thử vào lớp 10 theo chuỗi thời gian dựa vào ngày thi mục tiêu.</p>
            
            <div class="form-group">
                <label class="form-label">Chọn ngày diễn ra kỳ thi chính thức</label>
                <input type="date" class="form-input" value="2026-06-15" id="roadmap-exam-date">
            </div>

            <div class="form-group">
                <label class="form-label">Số lượng đề thi mục tiêu</label>
                <input type="number" class="form-index form-input" value="50" min="5" max="100" id="roadmap-test-count">
            </div>

            <div class="form-group">
                <label class="form-label">Tần suất làm đề tối đa</label>
                <select class="form-input" id="roadmap-frequency">
                    <option value="1">1 đề / tuần</option>
                    <option value="2" selected>2 đề / tuần</option>
                    <option value="3">3 đề / tuần</option>
                </select>
            </div>

            <button class="btn btn-interactive" style="width:100%; margin-top:8px;" onclick="calculateRoadmapDistribution()">Tự động lập lộ trình</button>
            
            <div id="roadmap-results-area" style="margin-top:24px; border-top:1px solid var(--border-color); padding-top:20px; display:none;">
                <h4 style="font-family:var(--font-heading); color:var(--color-validation-light); margin-bottom:12px;">Kế hoạch phân bổ chi tiết:</h4>
                <div style="display:flex; flex-direction:column; gap:10px;" id="roadmap-list-distribution">
                    <!-- Injected dynamically -->
                </div>
            </div>
        </div>
    `;
}

window.calculateRoadmapDistribution = function() {
    const examDateVal = document.getElementById('roadmap-exam-date').value;
    const testCount = parseInt(document.getElementById('roadmap-test-count').value);
    const freq = parseInt(document.getElementById('roadmap-frequency').value);

    const examDate = new Date(examDateVal);
    const now = new Date();
    
    // Difference in weeks
    const timeDiff = examDate - now;
    const weeksRemaining = Math.max(1, Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7)));

    const resultArea = document.getElementById('roadmap-results-area');
    const listContainer = document.getElementById('roadmap-list-distribution');

    listContainer.innerHTML = `
        <div style="background:rgba(0,176,255,0.06); padding:16px; border-radius:var(--radius-md); font-size:13px; margin-bottom:12px; border:1px solid rgba(0,176,255,0.15)">
            🗓️ Còn lại <strong>${weeksRemaining} tuần</strong> trước ngày thi. Để hoàn thành mục tiêu <strong>${testCount} đề</strong>, con bạn cần đẩy nhanh tần suất rèn luyện đề.
        </div>
        <div style="padding:8px 16px; border-radius:var(--radius-sm); background:var(--bg-main); border: 1px solid var(--border-color); display:flex; justify-content:space-between; font-size:12px;">
            <span>Giai đoạn 1: Khởi động (Tuần 1 - Tuần 8)</span>
            <strong>1 đề / tuần</strong>
        </div>
        <div style="padding:8px 16px; border-radius:var(--radius-sm); background:var(--bg-main); border: 1px solid var(--border-color); display:flex; justify-content:space-between; font-size:12px;">
            <span>Giai đoạn 2: Tăng tốc (Tuần 9 - Tuần 20)</span>
            <strong>${freq} đề / tuần</strong>
        </div>
        <div style="padding:8px 16px; border-radius:var(--radius-sm); background:var(--bg-main); border: 1px solid var(--border-color); display:flex; justify-content:space-between; font-size:12px;">
            <span>Giai đoạn 3: Về đích (4 tuần cuối)</span>
            <strong>3 đề / tuần + Ôn luyện Active Recall lỗi sai</strong>
        </div>
    `;

    resultArea.style.display = 'block';
    playSuccessSound();
};

// --- MULTI-SENSORY GRAPHICS & DOPAMINE TRIGGERS ---
function triggerConfetti() {
    const container = document.getElementById('confetti-effect');
    if (!container) return;

    const colors = ['#ff6f00', '#ffc107', '#00b0ff', '#4caf50', '#ff4081', '#ffffff'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        
        container.appendChild(piece);
        
        // Remove after animation done
        setTimeout(() => piece.remove(), 4000);
    }
}

function playSuccessSound() {
    const snd = document.getElementById('sound-success');
    if (snd) {
        snd.currentTime = 0;
        snd.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
    }
}

function playFailSound() {
    const snd = document.getElementById('sound-fail');
    if (snd) {
        snd.currentTime = 0;
        snd.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
    }
    // Haptic Feedback for error state (Supported on mobile devices)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}
// --- STATE PERSISTENCE UTILITIES ---
function saveAppStateToLocalStorage() {
    const dataToSave = {
        streak: AppState.streak,
        xp: AppState.xp,
        completedExams: AppState.completedExams || {},
        weaknesses: AppState.weaknesses || [],
        activityLog: AppState.activityLog || [],
        examDate: AppState.examDate,
        scoreGoal: AppState.scoreGoal,
        weeklyCommitment: AppState.weeklyCommitment,
        parentPin: AppState.parentPin || '',
        tutorPin: AppState.tutorPin || '',
        examHighlights: AppState.examHighlights || {},
        examScratchpads: AppState.examScratchpads || {},
        examFlags: AppState.examFlags || {},
        examStrikethroughs: AppState.examStrikethroughs || {},
        flashcards: AppState.flashcards || [],
        topics: AppState.topics || [],
        deletedTopicIds: AppState.deletedTopicIds || [],
        grammarAccuracy: AppState.grammarAccuracy !== undefined ? AppState.grammarAccuracy : 0,
        grammarMastery: AppState.grammarMastery || { tense: 0, passive: 0, conditional: 0, comparison: 0, relative: 0, gerund: 0, connectors: 0, reported_speech: 0, word_form: 0, phrasal_verb: 0 },
        grammarStatus: AppState.grammarStatus || { tense: 'active', passive: 'locked', conditional: 'locked', comparison: 'locked', relative: 'locked', gerund: 'locked', connectors: 'locked', reported_speech: 'locked', word_form: 'locked', phrasal_verb: 'locked' },
        grammarSubTopicsCompleted: AppState.grammarSubTopicsCompleted || {},
        wordStatuses: AppState.wordStatuses || {}
    };
    localStorage.setItem('exam_runners_app_state', JSON.stringify(dataToSave));
    
    // Sync UI stats
    const streakCount = document.getElementById('streak-count');
    if (streakCount) streakCount.innerText = `${AppState.streak} ngày`;
    
    const xpBadge = document.querySelector('.xp-badge');
    if (xpBadge) {
        const fill = xpBadge.querySelector('.xp-progress-fill');
        const val = xpBadge.querySelector('.badge-value');
        if (val) val.innerText = `${AppState.xp} XP`;
        if (fill) {
            const percentage = Math.min(100, (AppState.xp % 1000) / 10);
            fill.style.width = `${percentage}%`;
        }
    }
}

function loadAppStateFromLocalStorage() {
    const saved = localStorage.getItem('exam_runners_app_state');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            AppState.streak = data.streak !== undefined ? data.streak : 0;
            AppState.xp = data.xp !== undefined ? data.xp : 0;
            AppState.completedExams = data.completedExams || {};
            AppState.weaknesses = data.weaknesses || [];
            AppState.activityLog = data.activityLog || [];
            
            // Reset activityLog for fresh new users to prevent legacy pre-seeded mock logs
            if (Object.keys(AppState.completedExams).length === 0 && (!AppState.xp || AppState.xp === 0)) {
                AppState.activityLog = [];
            }

            AppState.examDate = data.examDate || '';
            AppState.scoreGoal = data.scoreGoal || '8.0';
            AppState.weeklyCommitment = data.weeklyCommitment || '6';
            AppState.parentPin = data.parentPin || '';
            AppState.tutorPin = data.tutorPin || '';
            AppState.examHighlights = data.examHighlights || {};
            AppState.examScratchpads = data.examScratchpads || {};
            AppState.examFlags = data.examFlags || {};
            AppState.examStrikethroughs = data.examStrikethroughs || {};
            
            AppState.grammarAccuracy = data.grammarAccuracy !== undefined ? data.grammarAccuracy : 0;
            AppState.grammarMastery = data.grammarMastery || { tense: 0, passive: 0, conditional: 0, comparison: 0, relative: 0, gerund: 0, connectors: 0, reported_speech: 0, word_form: 0, phrasal_verb: 0 };
            AppState.grammarStatus = data.grammarStatus || { tense: 'active', passive: 'locked', conditional: 'locked', comparison: 'locked', relative: 'locked', gerund: 'locked', connectors: 'locked', reported_speech: 'locked', word_form: 'locked', phrasal_verb: 'locked' };
            AppState.grammarSubTopicsCompleted = data.grammarSubTopicsCompleted || {};
            AppState.wordStatuses = data.wordStatuses || {};
            
            // Dynamically resolve and synchronize chapter statuses from masteries
            if (typeof EXAM_RUNNERS_DB !== "undefined" && EXAM_RUNNERS_DB.grammarTimeline) {
                EXAM_RUNNERS_DB.grammarTimeline.forEach((node, idx) => {
                    const nodeMastery = AppState.grammarMastery[node.id] !== undefined ? AppState.grammarMastery[node.id] : 0;
                    if (nodeMastery === 100) {
                        AppState.grammarStatus[node.id] = 'completed';
                    } else if (idx === 0) {
                        AppState.grammarStatus[node.id] = 'active';
                    } else {
                        // Check if previous chapter is completed
                        const prevNode = EXAM_RUNNERS_DB.grammarTimeline[idx - 1];
                        const prevMastery = AppState.grammarMastery[prevNode.id] !== undefined ? AppState.grammarMastery[prevNode.id] : 0;
                        if (prevMastery === 100) {
                            AppState.grammarStatus[node.id] = 'active';
                        } else {
                            AppState.grammarStatus[node.id] = 'locked';
                        }
                    }
                });
            }

            // Apply grammar database initial sync
            if (typeof EXAM_RUNNERS_DB !== "undefined" && EXAM_RUNNERS_DB.grammarTimeline) {
                EXAM_RUNNERS_DB.grammarTimeline.forEach(node => {
                    node.mastery = AppState.grammarMastery[node.id] !== undefined ? AppState.grammarMastery[node.id] : node.mastery;
                    node.status = AppState.grammarStatus[node.id] !== undefined ? AppState.grammarStatus[node.id] : node.status;
                });
            }
            AppState.flashcards = data.flashcards || [...EXAM_RUNNERS_DB.flashcards];
            AppState.topics = data.topics || [...EXAM_RUNNERS_DB.topics];
            AppState.deletedTopicIds = data.deletedTopicIds || [];
            
            if (typeof EXAM_RUNNERS_DB !== "undefined") {
                if (EXAM_RUNNERS_DB.topics) {
                    EXAM_RUNNERS_DB.topics.forEach(dt => {
                        if (AppState.deletedTopicIds.includes(dt.id)) return;
                        const exists = AppState.topics.some(t => t.id === dt.id);
                        if (!exists) {
                            AppState.topics.push(dt);
                        }
                    });
                }
                if (EXAM_RUNNERS_DB.flashcards) {
                    EXAM_RUNNERS_DB.flashcards.forEach(df => {
                        const exists = AppState.flashcards.some(f => f.id === df.id);
                        if (!exists) {
                            AppState.flashcards.push(df);
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing AppState from localStorage", e);
        }
    } else {
        // First-time setup default values
        AppState.grammarSubTopicsCompleted = {};
        if (typeof EXAM_RUNNERS_DB !== "undefined") {
            AppState.flashcards = [...EXAM_RUNNERS_DB.flashcards];
            AppState.topics = [...EXAM_RUNNERS_DB.topics];
        }
    }
}

// --- ONBOARDING ENGINE ---
function initOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;

    // Check if onboarding is already completed
    if (localStorage.getItem('ob_completed') === 'true') {
        return;
    }

    // Otherwise, show onboarding modal
    modal.classList.add('open');

    let currentStep = 1;
    const totalSteps = 5;

    const nextBtn = document.getElementById('ob-next-btn');
    const prevBtn = document.getElementById('ob-prev-btn');

    // Score selection binding
    const scoreBtns = document.querySelectorAll('.ob-score-btn');
    scoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scoreBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Commitment selection binding
    const commitItems = document.querySelectorAll('.ob-commitment-item');
    commitItems.forEach(item => {
        item.addEventListener('click', () => {
            commitItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Next/Prev events
    nextBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            const sName = document.getElementById('ob-student-name').value.trim();
            const pName = document.getElementById('ob-parent-name').value.trim();
            if (!sName || !pName) {
                alert('Vui lòng nhập đầy đủ Tên Học sinh và Tên Phụ huynh (Bắt buộc)!');
                return;
            }
            AppState.studentName = sName;
            AppState.parentName = pName;
            AppState.school = document.getElementById('ob-school').value.trim();
            AppState.className = document.getElementById('ob-class').value.trim();
        }

        if (currentStep === 2) {
            const dateInput = document.getElementById('ob-exam-date').value;
            if (!dateInput) {
                alert('Vui lòng chọn ngày diễn ra kỳ thi của bạn!');
                return;
            }
            AppState.examDate = dateInput;
        }

        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        } else {
            // Validate Step 5 inputs
            const parentPinVal = document.getElementById('ob-parent-pin').value;
            const tutorPinVal = document.getElementById('ob-tutor-pin').value;
            const pinRegex = /^\d{4}$/;

            if (!pinRegex.test(parentPinVal)) {
                alert('Vui lòng nhập đúng 4 chữ số cho mã PIN Phụ huynh!');
                return;
            }
            if (!pinRegex.test(tutorPinVal)) {
                alert('Vui lòng nhập đúng 4 chữ số cho mã PIN Gia sư / Quản trị!');
                return;
            }

            // Save PIN values to AppState
            AppState.parentPin = parentPinVal;
            AppState.tutorPin = tutorPinVal;

            // Done onboarding!
            const activeScoreBtn = document.querySelector('.ob-score-btn.active');
            AppState.scoreGoal = activeScoreBtn ? activeScoreBtn.getAttribute('data-score') : '8.0';

            const activeCommitItem = document.querySelector('.ob-commitment-item.active');
            AppState.weeklyCommitment = activeCommitItem ? activeCommitItem.getAttribute('data-hours') : '6';

            // Fresh start for newly onboarded user
            AppState.streak = 0;
            AppState.xp = 0;
            AppState.activityLog = [];
            AppState.completedExams = {};
            document.getElementById('streak-count').innerText = `${AppState.streak} ngày`;

            localStorage.setItem('ob_completed', 'true');
            saveAppStateToLocalStorage();

            modal.classList.remove('open');
            triggerConfetti();
            playSuccessSound();

            // Refresh countdown and dashboard
            startCountdownClock();
            if (AppState.currentTab === 'dashboard') {
                renderDashboard(document.getElementById('app-viewport'));
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    function showStep(step) {
        document.querySelectorAll('.onboarding-step-view').forEach((view, idx) => {
            if (idx + 1 === step) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        document.querySelectorAll('.step-dot').forEach((dot, idx) => {
            if (idx + 1 <= step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (step === 1) {
            prevBtn.style.visibility = 'hidden';
            nextBtn.innerText = 'Tiếp theo';
        } else {
            prevBtn.style.visibility = 'visible';
            if (step === totalSteps) {
                nextBtn.innerText = 'Bắt đầu ngay!';
            } else {
                nextBtn.innerText = 'Tiếp theo';
            }
        }
    }
}

// --- Highlighting System ---
AppState.examHighlights = AppState.examHighlights || {};

window.applyHighlightsToPassage = function(passageText, passageKey) {
    if (!AppState.examHighlights[passageKey] || AppState.examHighlights[passageKey].length === 0) return passageText;
    
    // Convert to array of valid highlights
    let highlights = AppState.examHighlights[passageKey].map((hl, i) => {
        let text = typeof hl === 'object' && hl !== null ? hl.text : hl;
        let color = typeof hl === 'object' && hl !== null ? (hl.color || 'yellow') : 'yellow';
        return {
            text: text,
            color: color,
            start: typeof hl === 'object' && hl.start !== undefined ? hl.start : -1,
            end: typeof hl === 'object' && hl.end !== undefined ? hl.end : -1,
            originalIndex: i
        };
    });
    
    // For legacy highlights (without start/end), fallback to finding the first occurrence
    highlights.forEach(hl => {
        if (hl.start === -1 && hl.text) {
            let idx = passageText.indexOf(hl.text);
            if (idx !== -1) {
                hl.start = idx;
                hl.end = idx + hl.text.length;
            }
        }
    });
    
    // Filter out invalid ones
    highlights = highlights.filter(hl => hl.start !== -1 && hl.start !== undefined && hl.end > hl.start);
    
    // We use a character-painting approach to perfectly handle overlapping highlights.
    // Highlights added later will paint over earlier highlights.
    let chars = new Array(passageText.length);
    for (let i = 0; i < passageText.length; i++) {
        chars[i] = { color: null, originalIndex: -1 };
    }
    
    highlights.forEach(hl => {
        for (let i = hl.start; i < hl.end; i++) {
            if (i >= 0 && i < passageText.length) {
                chars[i] = { color: hl.color, originalIndex: hl.originalIndex };
            }
        }
    });
    
    // Group adjacent characters with the same color and originalIndex
    let result = "";
    let currentGroup = null;
    
    for (let i = 0; i < passageText.length; i++) {
        let c = chars[i];
        if (!currentGroup) {
            currentGroup = { color: c.color, originalIndex: c.originalIndex, text: passageText[i] };
        } else if (currentGroup.color === c.color && currentGroup.originalIndex === c.originalIndex) {
            currentGroup.text += passageText[i];
        } else {
            // Push current group to result
            if (currentGroup.color) {
                result += `<span class="user-highlight hl-${currentGroup.color}" onclick="removeHighlight('${passageKey}', ${currentGroup.originalIndex}, event)">${currentGroup.text}</span>`;
            } else {
                result += currentGroup.text;
            }
            currentGroup = { color: c.color, originalIndex: c.originalIndex, text: passageText[i] };
        }
    }
    
    if (currentGroup) {
        if (currentGroup.color) {
            result += `<span class="user-highlight hl-${currentGroup.color}" onclick="removeHighlight('${passageKey}', ${currentGroup.originalIndex}, event)">${currentGroup.text}</span>`;
        } else {
            result += currentGroup.text;
        }
    }
    
    return result;
}

// Helper to get exact offsets within a text container
function getSelectionCharacterOffsetWithin(element) {
    let start = 0;
    let end = 0;
    let doc = element.ownerDocument || element.document;
    let win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection !== "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
        }
    }
    return { start: start, end: end };
}

window.handlePassageSelection = function(e, passageKey, elementId) {
    if (e.target.classList.contains('user-highlight')) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    
    const text = sel.toString().trim();
    if (text.length < 2) return; 

    const passageEl = document.getElementById(elementId);
    let offsets = { start: -1, end: -1 };
    if (passageEl) {
        offsets = getSelectionCharacterOffsetWithin(passageEl);
    }
    const rawTextSelection = sel.toString();

    const existing = document.querySelector('.highlight-popover');
    if (existing) existing.remove();

    const popover = document.createElement('div');
    popover.className = 'highlight-popover';
    popover.style.position = 'fixed';
    popover.style.left = e.clientX + 'px';
    popover.style.top = (e.clientY - 50) + 'px';
    popover.style.zIndex = '9999';
    
    popover.innerHTML = `
        <div class="hl-color-btn color-yellow" data-color="yellow" title="Từ khóa quan trọng (Keyword)"></div>
        <div class="hl-color-btn color-blue" data-color="blue" title="Bằng chứng / Ý chính (Evidence)"></div>
        <div class="hl-color-btn color-red" data-color="red" title="Từ phủ định / Bẫy nhiễu (Trap)"></div>
    `;
    
    popover.querySelectorAll('.hl-color-btn').forEach(btn => {
        btn.onclick = (event) => {
            event.stopPropagation();
            const color = btn.getAttribute('data-color');
            
            if (!AppState.examHighlights[passageKey]) AppState.examHighlights[passageKey] = [];
            
            // Check if exact text position already highlighted
            const alreadyExists = AppState.examHighlights[passageKey].some(hl => {
                if (hl.start !== undefined && offsets.start !== -1) {
                    return hl.start === offsets.start && hl.end === offsets.end;
                }
                return hl.text === rawTextSelection;
            });
            
            if (!alreadyExists) {
                AppState.examHighlights[passageKey].push({ 
                    text: rawTextSelection, 
                    color: color,
                    start: offsets.start,
                    end: offsets.end
                });
                saveAppStateToLocalStorage();
            }
            
            // Update DOM locally
            const passageEl = document.getElementById(elementId);
            if (passageEl) {
                let rawText = '';
                EXAM_RUNNERS_DB.exams.forEach(ex => {
                    const q = ex.questions.find(q => 'passage-' + q.id === passageKey);
                    if (q) rawText = q.passage;
                });
                if (rawText) {
                    passageEl.innerHTML = applyHighlightsToPassage(rawText, passageKey);
                }
            }
            if (document.body.contains(popover)) popover.remove();
            window.getSelection().removeAllRanges();
        };
    });
    
    document.body.appendChild(popover);
    
    setTimeout(() => {
        const remover = (ev) => {
            if (!popover.contains(ev.target)) {
                if (document.body.contains(popover)) popover.remove();
                document.removeEventListener('mousedown', remover);
            }
        };
        document.addEventListener('mousedown', remover);
    }, 100);
}

window.removeHighlight = function(passageKey, index, e) {
    if (e) e.stopPropagation();
    if (AppState.examHighlights[passageKey]) {
        AppState.examHighlights[passageKey].splice(index, 1);
        saveAppStateToLocalStorage();
        
        const elementId = 'passage-el-' + passageKey;
        const passageEl = document.getElementById(elementId);
        if (passageEl) {
            let rawText = '';
            EXAM_RUNNERS_DB.exams.forEach(ex => {
                const q = ex.questions.find(q => 'passage-' + q.id === passageKey);
                if (q) rawText = q.passage;
            });
            if (rawText) {
                passageEl.innerHTML = applyHighlightsToPassage(rawText, passageKey);
            }
        }
    }
}

function seedActivityLogIfEmpty() {
    if (!AppState.activityLog) AppState.activityLog = [];
    if (AppState.activityLog.length > 0) return;

    const today = new Date();
    const completedIds = Object.keys(AppState.completedExams || {});

    if (completedIds.length > 0) {
        // seeding dynamic activities based on completed exams
        completedIds.forEach((id, index) => {
            const examId = parseInt(id);
            const score = AppState.completedExams[examId];
            let examTitle = `Đề số ${examId}`;
            if (typeof EXAM_RUNNERS_DB !== 'undefined' && EXAM_RUNNERS_DB.exams) {
                const examObj = EXAM_RUNNERS_DB.exams.find(e => e.id === examId);
                if (examObj) examTitle = examObj.title;
            }
            
            // Set days apart dynamically
            const activityDate = new Date();
            activityDate.setDate(today.getDate() - (completedIds.length - index) * 2);
            
            AppState.activityLog.push({
                type: 'exam',
                examId: examId,
                title: examTitle,
                score: score,
                timestamp: activityDate.toISOString(),
                durationMinutes: Math.round(35 + Math.random() * 20),
                status: 'ontime'
            });
        });
    } else {
        // Disabled seeding mock activities to prevent confusion with 0-day streaks and fake chart data.
    }
    
    // Save to local storage
    const dataToSave = {
        streak: AppState.streak,
        xp: AppState.xp,
        completedExams: AppState.completedExams || {},
        weaknesses: AppState.weaknesses || [],
        activityLog: AppState.activityLog || [],
        examDate: AppState.examDate,
        scoreGoal: AppState.scoreGoal,
        weeklyCommitment: AppState.weeklyCommitment,
        parentPin: AppState.parentPin || '',
        tutorPin: AppState.tutorPin || '',
        examHighlights: AppState.examHighlights || {},
        flashcards: AppState.flashcards || [],
        topics: AppState.topics || [],
        deletedTopicIds: AppState.deletedTopicIds || [],
        grammarAccuracy: AppState.grammarAccuracy !== undefined ? AppState.grammarAccuracy : 0,
        grammarMastery: AppState.grammarMastery || { tense: 0, passive: 0, conditional: 0, comparison: 0, relative: 0, gerund: 0, connectors: 0, reported_speech: 0, word_form: 0, phrasal_verb: 0 },
        grammarStatus: AppState.grammarStatus || { tense: 'active', passive: 'locked', conditional: 'locked', comparison: 'locked', relative: 'locked', gerund: 'locked', connectors: 'locked', reported_speech: 'locked', word_form: 'locked', phrasal_verb: 'locked' },
        grammarSubTopicsCompleted: AppState.grammarSubTopicsCompleted || {}
    };
    localStorage.setItem('exam_runners_app_state', JSON.stringify(dataToSave));
}
