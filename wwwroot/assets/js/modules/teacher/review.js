const params = new URLSearchParams(location.search);

const resultId = params.get("resultId");

let reviewData = [];
let currentIndex = 0;

window.onload = async () => {
    renderLayout("teacher");
    await loadReview();
};

async function loadReview() {

    if (!resultId) return;

    const data = await API.request(
        "/api/exam/review/" + resultId
    );

    reviewData = data || [];

    render(reviewData);
}

function render(list) {

    const container = document.getElementById("reviewList");

    if (!container) return;

    container.innerHTML = "";

    if (!list || !list.length) return;

    list.forEach((q, index) => {

        const div = document.createElement("div");
        div.className = "question-card";

        div.onclick = () => {
            currentIndex = index;
        };

        let optionsHtml = "";

        if (q.options && q.options.length) {

            q.options.forEach(o => {

                const isCorrect = o.label === q.correctAnswer;
                const isSelected = o.label === q.studentAnswer;

                optionsHtml += `
                    <div class="option
                        ${isCorrect ? "correct" : ""}
                        ${isSelected ? "selected" : ""}">
                        <b>${o.label}.</b> ${o.content}
                    </div>
                `;
            });

        } else {

            optionsHtml = `
                <div class="option ${q.isCorrect ? "correct" : "wrong"}">
                    Student: ${q.studentAnswer || "-"}
                </div>

                <div class="option correct">
                    Correct: ${q.correctAnswer}
                </div>
            `;
        }

        div.innerHTML = `
            <div class="question-title">
                Q${index + 1}. ${q.content}
            </div>

            <div class="options">
                ${optionsHtml}
            </div>

            ${q.explanation ? `
                <div class="question-footer">
                    ${q.explanation}
                </div>
            ` : ""}
        `;

        container.appendChild(div);
    });
}

window.askAI = async function () {

    const input = document.getElementById("aiPrompt");
    const output = document.getElementById("aiResult");

    const q = reviewData[currentIndex];

    if (!q) {
        output.innerText = "No question selected";
        return;
    }

    try {
        output.innerText = "Thinking...";

        const res = await API.request(
            "/api/ai/review-answer",
            "POST",
            {
                question: q.content,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                studentAnswer: q.studentAnswer || "",
                explanation: q.explanation || "",
                ask: input?.value || ""
            }
        );

        output.innerText = res?.response || "No response";

    } catch (err) {
        console.error(err);
        output.innerText = "AI failed";
    }
};