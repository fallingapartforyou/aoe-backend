const params = new URLSearchParams(location.search);
const assignmentId = params.get("assignmentId");

let historyData = [];

// ================= INIT =================
window.onload = async () => {
    await loadResult();
};

// ================= LOAD =================
async function loadResult() {

    try {

        const result =
            await API.request("/api/exam/result/" + assignmentId);

        renderResult(result);

        const history =
            await API.request("/api/exam/history/" + assignmentId);

        historyData = history || [];
        renderHistory(historyData);

    } catch (err) {
        console.error(err);
        alert("Load failed");
    }
}

// ================= SAFE SET =================
function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// ================= RESULT =================
function renderResult(result) {

    if (!result) return;

    set("scoreValue", result.score ?? 0);

    set(
        "scoreStatus",
        result.score >= 8 ? "Excellent"
        : result.score >= 5 ? "Pass"
        : "Fail"
    );

    set(
        "scoreMessage",
        result.score >= 8 ? "Outstanding performance"
        : result.score >= 5 ? "Good job"
        : "Needs improvement"
    );

    set("submitTime", formatTime(result.submittedAt));
    set("tabSwitches", result.tabSwitchCount ?? 0);
    set("suspiciousScore", result.suspicious ? "High" : "Low");

    set("assignmentName", "Assignment");
}

// ================= HISTORY =================
function renderHistory(list) {

    const container = document.getElementById("history");
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML =
            `<tr><td colspan="4">No attempts</td></tr>`;
        return;
    }

    list.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.attemptNumber}</td>
            <td>${item.score}</td>
            <td>${formatSeconds(item.timeSpentSeconds)}</td>
            <td>
                ${formatTime(item.submittedAt)}
                <button onclick="goReview(${item.id})">Review</button>
            </td>
        `;

        container.appendChild(tr);
    });
}

// ================= NAV =================
function goReview(id) {
    location.href =
        "/pages/student/review.html?resultId=" + id;
}

function reviewExam() {
    if (historyData.length > 0)
        goReview(historyData[0].id);
}

function goMenu() {
    location.href =
        "/pages/student/exam-menu.html?assignmentId=" + assignmentId;
}

// ================= FORMAT =================
function formatTime(t) {
    if (!t) return "--";
    return new Date(t).toLocaleString();
}

function formatSeconds(sec) {
    if (sec == null) return "--";
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}