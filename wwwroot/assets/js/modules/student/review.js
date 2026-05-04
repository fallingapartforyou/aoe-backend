const params = new URLSearchParams(location.search);
const assignmentId = params.get("assignmentId");

let data = [];
let currentIndex = 0;

// ===== INIT =====
window.onload = async () => {
    await loadReview();
};

// ===== LOAD =====
async function loadReview() {
    try {
        if (!assignmentId) {
            alert("Missing assignmentId");
            return;
        }

        data = await API.request(
            "/result/review/" + assignmentId
        );

        renderNav();
        renderQuestion();

    } catch (err) {
        console.error(err);
        alert("Load review failed");
    }
}

// ===== NAV =====
function renderNav() {
    const nav = document.getElementById("reviewNav");
    nav.innerHTML = "";

    data.forEach((q, i) => {
        const btn = document.createElement("button");

        btn.innerText = i + 1;
        btn.className = "nav-btn";

        if (q.isCorrect) {
            btn.classList.add("answered");
        } else {
            btn.classList.add("wrong");
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

// ===== RENDER =====
function renderQuestion() {
    const q = data[currentIndex];
    const box = document.getElementById("reviewBox");

    let html = `
        <h3>Question ${currentIndex + 1}</h3>
        <p>${q.content}</p>
    `;

    // ===== OPTIONS =====
    if (q.options && q.options.length > 0) {

        const letters = ["A","B","C","D"];

        q.options.forEach((opt, i) => {

            let cls = "";

            if (opt === q.correctAnswer) {
                cls = "correct";
            }

            if (opt === q.studentAnswer && !q.isCorrect) {
                cls = "wrong";
            }

            html += `
                <div class="option ${cls}">
                    ${letters[i]}. ${opt}
                </div>
            `;
        });
    }

    // ===== FILL =====
    else {
        html += `
            <p>Your answer:
                <b class="${q.isCorrect ? 'correct' : 'wrong'}">
                    ${q.studentAnswer || "(empty)"}
                </b>
            </p>

            <p>Correct:
                <b class="correct">
                    ${q.correctAnswer}
                </b>
            </p>
        `;
    }

    // ===== EXPLANATION =====
    if (q.explanation) {
        html += `
            <div class="explanation">
                <b>Explanation:</b>
                <p>${q.explanation}</p>
            </div>
        `;
    }

    box.innerHTML = html;

    renderNav();
}