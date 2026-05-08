const params = new URLSearchParams(location.search);

const assignmentId = params.get("assignmentId");

let questions = [];
let currentIndex = 0;
let answers = {};

let time = 0;
let timerInterval;

// ===== INIT =====
window.onload = async () => {

    renderLayout("student");

    await loadQuestions();

    startTimer();
};

// ===== LOAD QUESTIONS =====
async function loadQuestions() {

    try {

        if (!assignmentId) {

            alert("Missing assignmentId");
            return;
        }

        const data =
            await API.request(
                "/exam/start/" + assignmentId
            );

        // normalize
        questions = data.map(q => ({

            ...q,

            // normalize answer
            correctAnswer:
                q.correctAnswer
                    ? q.correctAnswer.trim().toUpperCase()
                    : "",

            // normalize options
            options:
                q.options
                    ? q.options.map(o => ({
                        ...o,
                        label: o.label?.toUpperCase()
                    }))
                    : []
        }));

        renderNav();

        renderQuestion();

    }
    catch (err) {

        console.error(err);

        alert("Cannot load exam");
    }
}

// ===== NAV =====
function renderNav() {

    const nav =
        document.getElementById("questionNav");

    nav.innerHTML = "";

    questions.forEach((q, i) => {

        const btn =
            document.createElement("button");

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

    const box =
        document.getElementById("questionBox");

    let html = `
        <h3>
            Question ${currentIndex + 1}
        </h3>

        <p>
            ${q.content}
        </p>
    `;

    // ===== SINGLE CHOICE =====
    if (q.type === "single_choice") {

    q.options.forEach((opt) => {

        const label = opt.label;
        const content = opt.content;

        const checked =
            answers[q.id] === label
                ? "checked"
                : "";

        html += `
            <label class="option">

                <input
                    type="radio"
                    name="q${q.id}"
                    value="${label}"
                    ${checked}
                    onchange="saveAnswer(${q.id}, '${label}')"
                >

                <b>${label}.</b>
                ${content}

            </label>
        `;
    });
}

    // ===== FILL BLANK =====
    else {

        html += `
            <input
                class="form-input"
                value="${answers[q.id] || ""}"
                placeholder="Your answer"
                oninput="saveAnswer(${q.id}, this.value)"
            />
        `;
    }

    box.innerHTML = html;

    renderNav();
}

// ===== SAVE ANSWER =====
function saveAnswer(id, value) {

    answers[id] =
        String(value)
            .trim()
            .toUpperCase();

    console.log(answers);

    renderNav();
}

// ===== NEXT =====
function nextQuestion() {

    if (currentIndex < questions.length - 1) {

        currentIndex++;

        renderQuestion();
    }
}

// ===== PREV =====
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

        const min =
            Math.floor(time / 60);

        const sec =
            time % 60;

        document.getElementById("timer").innerText =
            `${pad(min)}:${pad(sec)}`;

    }, 1000);
}

function pad(n) {

    return n < 10
        ? "0" + n
        : n;
}

// ===== SUBMIT =====
async function submitExam() {

    const total =
        questions.length;

    if (Object.keys(answers).length < total) {

        if (!confirm(
            "You haven't answered all questions. Submit anyway?"
        )) {
            return;
        }
    }

    if (!confirm("Submit exam?")) {
        return;
    }

    try {

        clearInterval(timerInterval);

        // 🔥 IMPORTANT FIX
        // single_choice gửi A/B/C/D
        // fill_blank trim()
        const payloadAnswers =
            Object.entries(answers).map(
                ([questionId, answer]) => {

                    const q =
                        questions.find(
                            x => x.id === parseInt(questionId)
                        );

                    let finalAnswer = answer;

                    if (q.type === "single_choice") {

                        finalAnswer =
                            String(answer)
                                .trim()
                                .toUpperCase();
                    }
                    else {

                        finalAnswer =
                            String(answer)
                                .trim();
                    }

                    return {

                        questionId:
                            parseInt(questionId),

                        answer:
                            finalAnswer
                    };
                }
            );

        console.log("SUBMIT PAYLOAD:", payloadAnswers);

        const result =
            await API.request(
                "/exam/submit",
                "POST",
                {
                    assignmentId:
                        parseInt(assignmentId),

                    answers:
                        payloadAnswers
                }
            );

        console.log("RESULT:", result);

        alert(
            "Submit success. Score: " +
            result.score
        );

        location.href =
            "/pages/student/result.html?assignmentId="
            + assignmentId;
    }
    catch (err) {

        console.error(err);

        alert("Submit failed");
    }
}