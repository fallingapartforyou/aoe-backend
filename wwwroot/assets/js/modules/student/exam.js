const params = new URLSearchParams(location.search);
const assignmentId = params.get("assignmentId");

let questions = [];
let currentIndex = 0;
let answers = {};

let time = 0;
let timerInterval;

// ===== INIT =====
window.onload = async () => {
    await loadQuestions();
    startTimer();
};

// ===== LOAD =====
async function loadQuestions() {
    try {
        if (!assignmentId) {
            alert("Missing assignmentId");
            return;
        }

        questions = await API.request(
            "/exam/start/" + assignmentId
        );

        renderNav();
        renderQuestion();

    } catch (err) {
        console.error(err);
        alert("Cannot load exam");
    }
}

// ===== RENDER NAV =====
function renderNav() {
    const nav = document.getElementById("questionNav");
    nav.innerHTML = "";

    questions.forEach((q, i) => {
        const btn = document.createElement("button");

        btn.innerText = i + 1;
        btn.className = "nav-btn";

        if (answers[q.id]) {
            btn.classList.add("answered");
        }

        if (i === currentIndex) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            currentIndex = i;
            renderQuestion();
        };

        nav.appendChild(btn);
    });
}

// ===== RENDER QUESTION =====
function renderQuestion() {
    const q = questions[currentIndex];
    const box = document.getElementById("questionBox");

    let html = `
        <h3>Question ${currentIndex + 1}</h3>
        <p>${q.content}</p>
    `;

    // SINGLE CHOICE
    if (q.type === "single_choice") {
        const letters = ["A","B","C","D"];

        q.options.forEach((opt, i) => {
            const checked =
                answers[q.id] === opt ? "checked" : "";

            html += `
                <label class="option">
                    <input type="radio"
                        name="q${q.id}"
                        value="${opt}"
                        ${checked}
                        onchange="saveAnswer(${q.id}, '${opt}')">

                    ${letters[i]}. ${opt}
                </label>
            `;
        });
    }

    // FILL
    else {
        html += `
            <input
                value="${answers[q.id] || ""}"
                placeholder="Your answer"
                oninput="saveAnswer(${q.id}, this.value)"
            />
        `;
    }

    box.innerHTML = html;

    renderNav();
}

// ===== SAVE =====
function saveAnswer(id, value) {
    answers[id] = value;
    renderNav();
}

// ===== NAV BUTTON =====
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

// ===== TIMER =====
function startTimer() {
    timerInterval = setInterval(() => {
        time++;

        const min = Math.floor(time / 60);
        const sec = time % 60;

        document.getElementById("timer").innerText =
            `${pad(min)}:${pad(sec)}`;

    }, 1000);
}

function pad(n) {
    return n < 10 ? "0" + n : n;
}

// ===== SUBMIT =====
async function submitExam() {

    const total = questions.length;

    if (Object.keys(answers).length < total) {
        if (!confirm("You haven't answered all questions. Submit anyway?"))
            return;
    }

    if (!confirm("Submit exam?"))
        return;

    try {
        clearInterval(timerInterval);

        await API.request(
            "/exam/submit",
            "POST",
            {
                assignmentId,
                answers: Object.entries(answers).map(
                    ([questionId, answer]) => ({
                        questionId: parseInt(questionId),
                        answer
                    })
                )
            }
        );

        alert("Submit success");

        location.href =
            "/pages/student/result.html?assignmentId=" +
            assignmentId;

    } catch (err) {
        console.error(err);
        alert("Submit failed");
    }
}