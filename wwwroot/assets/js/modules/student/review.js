const params = new URLSearchParams(location.search);

const assignmentId = params.get("assignmentId");
let attempts = [];
let questions = [];
let currentResultId = null;
let currentIndex = 0;

window.onload = async () => {

    renderLayout("student");

    if (!assignmentId) {
        console.error("Missing assignmentId");
        return;
    }

    try {
        attempts = await API.get(`/api/exam/attempts/${assignmentId}`);
    } catch (e) {
        console.error("load attempts failed", e);
        attempts = [];
    }

    renderAttempts();

    if (attempts.length > 0) {
        await loadReview(attempts[0].id);
    }
};

function renderAttempts() {

    const el = document.getElementById("attemptSelector");
    if (!el) return;

    el.innerHTML = "";

    attempts.forEach(a => {

        const opt = document.createElement("option");

        opt.value = a.id;

        opt.textContent =
            `Attempt ${a.attemptNumber} | Score ${a.score} | ${new Date(a.submittedAt).toLocaleString()}`;

        el.appendChild(opt);
    });

    el.onchange = async e => {
        await loadReview(e.target.value);
    };
}

async function loadReview(resultId) {

    currentResultId = resultId;

    if (!resultId) return;

    try {
        questions = await API.get(`/api/exam/review/${resultId}`);
    } catch (e) {
        console.error("review load failed", e);
        questions = [];
    }

    renderStats();
    renderQuestions();
}

function renderStats() {

    const correct = questions.filter(q => q.isCorrect === true).length;
    const wrong = questions.length - correct;
    const acc = questions.length
        ? ((correct / questions.length) * 100).toFixed(1)
        : 0;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    set("correctCount", correct);
    set("wrongCount", wrong);
    set("accuracy", acc + "%");
    set("attemptScore", `${correct}/${questions.length}`);
}

function renderQuestions() {

    const container = document.getElementById("reviewContainer");
    if (!container) return;

    container.innerHTML = "";

    questions.forEach((q, i) => {

        let optionsHtml = "";

        if (q.options?.length) {

            q.options.forEach(o => {

                const isCorrect = o.label === q.correctAnswer;
                const isUser = o.label === q.studentAnswer;

                let cls = "option";

                if (isCorrect) cls += " correct";
                else if (isUser) cls += " wrong";

                optionsHtml += `
                    <div class="${cls}">
                        <b>${o.label}.</b> ${o.content}
                        ${isUser ? "<span> (Your answer)</span>" : ""}
                        ${isCorrect ? "<span> (Correct)</span>" : ""}
                    </div>
                `;
            });

        } else {

            optionsHtml = `
                <div class="option wrong">
                    Your answer: ${q.studentAnswer || "-"}
                </div>

                <div class="option correct">
                    Correct: ${q.correctAnswer}
                </div>
            `;
        }

        const div = document.createElement("div");

        const isCorrect = q.isCorrect === true;

        div.className =
            "review-question " + (isCorrect ? "correct" : "wrong");

        div.innerHTML = `
            <div class="question-title">
                Q${i + 1}. ${q.content}
            </div>

            <div class="answer-box">
                ${optionsHtml}
            </div>

            <div class="answer-block">
                <div class="answer-item student-answer">
                    Your answer: ${q.studentAnswer || "-"}
                </div>

                <div class="answer-item correct-answer">
                    Correct answer: ${q.correctAnswer}
                </div>
            </div>

            <div class="ai-section">
                <textarea id="ai-input-${i}" class="ai-input"
                    placeholder="Ask AI about this question..."></textarea>

                <button class="btn-primary ai-btn" onclick="askAI(${i})">
                    Ask AI
                </button>

                <div id="ai-${i}" class="ai-explanation"></div>
            </div>
        `;

        container.appendChild(div);
    });
}

async function askAI(index) {

    const q = questions[index];

    const box = document.getElementById(`ai-${index}`);
    const input = document.getElementById(`ai-input-${index}`);

    if (!q || !box) return;

    const ask = input?.value || "Explain why this answer is correct/incorrect";

    box.innerHTML = "Thinking...";

    try {

        const res = await API.post("/api/ai/review-answer", {
            question: q.content,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            studentAnswer: q.studentAnswer || "",
            explanation: q.explanation || "",
            ask: ask
        });

        box.innerHTML = res?.response || "No response";

    } catch (err) {

        console.error(err);
        box.innerHTML = "AI failed";
    }
}

function goBack() {
    history.back();
}