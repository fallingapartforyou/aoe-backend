let examStartTime = null;
let tabSwitchCount = 0;
let questionsCache = [];
let currentIndex = 0;

window.onload = async () => {
    renderLayout("student");

    initAntiCheat();

    await startExam();
};

// ================= START EXAM =================
async function startExam() {
    try {
        const assignmentId =
            new URLSearchParams(location.search)
                .get("assignmentId");

        examStartTime = Date.now();

        const questions = await API.get(
            `/api/exam/start/${assignmentId}`
        );

        questionsCache = questions;

        if (!questions || questions.length === 0) {
            document.getElementById("questionBox").innerHTML =
                "<p>No questions</p>";
            return;
        }

        renderQuestion(0);
        renderNav();
        updateProgress();
    }
    catch (err) {
        console.error(err);
        alert("Cannot start exam");
    }
}

// ================= RENDER SINGLE QUESTION =================
function renderQuestion(index) {
    const q = questionsCache[index];
    if (!q) return;

    currentIndex = index;

    const box = document.getElementById("questionBox");

    let optionsHtml = "";

    if (q.type === "single_choice" && q.options) {
        optionsHtml = q.options.map(o => `
            <label class="option-item">
                <input type="radio"
                    name="q_${q.id}"
                    value="${o.label}"
                    ${getSavedAnswer(q.id) === o.label ? "checked" : ""}>
                ${o.content}
            </label>
        `).join("");
    }

    box.innerHTML = `
        <h3>${q.content}</h3>
        <div class="options">
            ${optionsHtml}
        </div>
    `;

    updateHeader();
}

// ================= NAV =================
function renderNav() {
    const nav = document.getElementById("questionNav");
    nav.innerHTML = "";

    questionsCache.forEach((q, i) => {
        const btn = document.createElement("button");
        btn.innerText = i + 1;

        btn.onclick = () => renderQuestion(i);

        nav.appendChild(btn);
    });
}

// ================= PROGRESS =================
function updateProgress() {
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    const percent =
        ((currentIndex + 1) / questionsCache.length) * 100;

    progressText.innerText = `${Math.round(percent)}%`;
    progressFill.style.width = `${percent}%`;
}

// ================= HEADER =================
function updateHeader() {
    document.getElementById("questionIndex").innerText =
        `Question ${currentIndex + 1}`;

    document.getElementById("questionProgress").innerText =
        `${currentIndex + 1} / ${questionsCache.length}`;

    updateProgress();
}

// ================= NAV BUTTONS =================
function nextQuestion() {
    if (currentIndex < questionsCache.length - 1) {
        renderQuestion(currentIndex + 1);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        renderQuestion(currentIndex - 1);
    }
}

// ================= SAVE ANSWER (memory) =================
function getSavedAnswer(questionId) {
    const input = document.querySelector(
        `input[name="q_${questionId}"]:checked`
    );

    return input ? input.value : null;
}

// ================= ANTI CHEAT =================
function initAntiCheat() {

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            tabSwitchCount++;
            updateWarningUI();
        }
    });

    window.addEventListener("blur", () => {
        tabSwitchCount++;
        updateWarningUI();
    });

    setInterval(() => {
        document.getElementById("tabSwitchCount").innerText =
            tabSwitchCount;
    }, 500);
}

// ================= UI WARNING =================
function updateWarningUI() {
    document.getElementById("tabSwitchCount").innerText =
        tabSwitchCount;

    const toast = document.getElementById("warningToast");

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);

    const status = document.getElementById("securityStatus");

    if (tabSwitchCount >= 3) {
        status.innerText = "Suspicious";
        status.style.color = "red";
    }
}

// ================= TIMER =================
setInterval(() => {
    if (!examStartTime) return;

    const diff = Math.floor((Date.now() - examStartTime) / 1000);

    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");

    document.getElementById("timer").innerText =
        `${h}:${m}:${s}`;
}, 1000);

// ================= SUBMIT =================
function submitExam() {
    document.getElementById("submitModal").style.display = "block";
}

function closeSubmitModal() {
    document.getElementById("submitModal").style.display = "none";
}

async function confirmSubmit() {
    try {
        const assignmentId =
            new URLSearchParams(location.search)
                .get("assignmentId");

        const timeSpentSeconds =
            Math.floor((Date.now() - examStartTime) / 1000);

        const answers = questionsCache.map(q => {
            const selected = document.querySelector(
                `input[name="q_${q.id}"]:checked`
            );

            return {
                questionId: q.id,
                answer: selected ? selected.value : ""
            };
        });

        const res = await API.request(
            "/api/exam/submit",
            "POST",
            {
                assignmentId: parseInt(assignmentId),
                answers,
                timeSpentSeconds,
                tabSwitchCount
            }
        );

        alert(
            res.suspicious
                ? `⚠ Suspicious detected!\nScore: ${res.score}`
                : `Score: ${res.score}`
        );

        location.href =
            `/pages/student/result.html?assignmentId=${assignmentId}`;
    }
    catch (err) {
        console.error(err);
        alert("Submit failed");
    }
}