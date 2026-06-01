/* ==========================================================================
   EXAM RUNNERS - USER ONBOARDING & COACHING (DRIVER.JS)
   ========================================================================== */

const Tours = {
    driverObj: null,

    init() {
        if (!window.driver || !window.driver.js) {
            console.error("Driver.js is not loaded");
            return;
        }
        
        // Replay tour button listener
        const replayBtn = document.getElementById('replay-tour-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                if (AppState.currentRole === 'parent') {
                    this.startParentTour(true);
                } else if (AppState.currentRole === 'student') {
                    this.startStudentTour(true);
                }
            });
        }
    },

    startStudentTour(force = false) {
        if (!force && AppState.hasSeenStudentTour) return;

        this.driverObj = window.driver.js.driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: 'Hoàn Thành',
            closeBtnText: 'Đóng',
            nextBtnText: 'Tiếp Theo',
            prevBtnText: 'Quay Lại',
            steps: [
                {
                    element: '#sidebar-navigation',
                    popover: {
                        title: '1. Menu Điều Hướng',
                        description: 'Khám phá tất cả các tính năng từ Luyện Đề, Học Từ Vựng đến tra cứu Ngữ Pháp tại đây.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#app-viewport',
                    popover: {
                        title: '2. Nhiệm Vụ Hôm Nay',
                        description: 'Hệ thống tự động đề xuất những bài học quan trọng nhất (như khắc phục lỗi sai) để tối ưu thời gian của bạn.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '.streak-badge',
                    popover: {
                        title: '3. Chuỗi Học Tập (Streak)',
                        description: 'Cố gắng giữ lửa mỗi ngày để hình thành thói quen rèn luyện kỷ luật.',
                        side: 'bottom',
                        align: 'center'
                    }
                },
                {
                    element: '#sidebar-profile-btn',
                    popover: {
                        title: '4. Hồ Sơ Cá Nhân',
                        description: 'Cập nhật mục tiêu điểm số của bạn tại đây để hệ thống cá nhân hóa lộ trình học nhé!',
                        side: 'right',
                        align: 'center'
                    }
                }
            ],
            onDestroyStarted: () => {
                if (!this.driverObj.hasNextStep() || confirm("Bạn chắc chắn muốn đóng hướng dẫn?")) {
                    this.driverObj.destroy();
                    AppState.hasSeenStudentTour = true;
                    if (typeof saveAppStateToLocalStorage === 'function') {
                        saveAppStateToLocalStorage();
                    }
                }
            }
        });

        this.driverObj.drive();
    },

    startParentTour(force = false) {
        if (!force && AppState.hasSeenParentTour) return;

        this.driverObj = window.driver.js.driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: 'Hoàn Thành',
            closeBtnText: 'Đóng',
            nextBtnText: 'Tiếp Theo',
            prevBtnText: 'Quay Lại',
            steps: [
                {
                    element: '#app-viewport',
                    popover: {
                        title: '1. Báo Cáo Tổng Quan',
                        description: 'Tại đây Phụ huynh có thể theo dõi tiến độ, số giờ học và kết quả rèn luyện của con.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#sidebar-profile-btn',
                    popover: {
                        title: '2. Thông Tin Thí Sinh',
                        description: 'Kiểm tra thông tin cá nhân và mục tiêu điểm số mà con đã cam kết.',
                        side: 'right',
                        align: 'center'
                    }
                }
            ],
            onDestroyStarted: () => {
                if (!this.driverObj.hasNextStep() || confirm("Bạn chắc chắn muốn đóng hướng dẫn?")) {
                    this.driverObj.destroy();
                    AppState.hasSeenParentTour = true;
                    if (typeof saveAppStateToLocalStorage === 'function') {
                        saveAppStateToLocalStorage();
                    }
                }
            }
        });

        // Add a delay to let the UI render completely after switching role
        setTimeout(() => {
            this.driverObj.drive();
        }, 500);
    },
    
    // In-exam tooltips (Contextual)
    showExamTooltips() {
        if (!window.driver || !window.driver.js) return;
        
        // This is a subtle tooltip without overlay
        const examDriver = window.driver.js.driver({
            showProgress: false,
            overlayColor: 'transparent',
            popoverClass: 'driver-subtle-theme',
            steps: [
                {
                    element: '.exam-question-body',
                    popover: {
                        title: 'Mẹo: Highlight Từ Khóa',
                        description: 'Bôi đen văn bản để highlight thông tin quan trọng.',
                        side: 'top',
                        align: 'start'
                    }
                }
            ]
        });
        
        // Short delay to let user settle in
        setTimeout(() => {
            examDriver.drive();
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Tours.init();
});
