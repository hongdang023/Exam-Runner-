const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><div id="app-viewport"></div>`);
global.document = dom.window.document;
global.window = dom.window;

const appCode = fs.readFileSync('js/app.js', 'utf8');

global.AppState = {
    streak: 0,
    activityLog: [],
    weaknesses: [],
    completedExams: {},
    scoreGoal: 8,
    studentName: 'Test'
};
global.EXAM_RUNNERS_DB = { exams: [], grammarTimeline: [] };
global.lucide = { createIcons: () => {} };

try {
    eval(appCode);
    const container = document.getElementById('app-viewport');
    renderParentHub(container);
    console.log("SUCCESS");
} catch(e) {
    console.log("ERROR:", e.message);
    console.log(e.stack);
}
