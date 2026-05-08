const params =
    new URLSearchParams(location.search);

const assignmentId =
    params.get("assignmentId");

// ===== INIT =====
window.onload = async () => {

    try {

        renderLayout("student");

        await loadReview();

    } catch (err) {

        console.error(err);

        document.getElementById(
            "reviewContainer"
        ).innerHTML = `
            <div class="card">
                Failed to load review
            </div>
        `;
    }
};

// ===== LOAD =====
async function loadReview() {

    try {

        const data =
            await API.request(
                "/exam/review/" + assignmentId
            );

        renderReview(data);

    } catch (err) {

        console.error(err);

        document.getElementById(
            "reviewContainer"
        ).innerHTML = `
            <div class="card">
                Review load failed
            </div>
        `;
    }
}

// ===== RENDER =====
function renderReview(list) {

    const container =
        document.getElementById(
            "reviewContainer"
        );

    container.innerHTML = "";

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="card">
                No review data
            </div>
        `;

        return;
    }

    list.forEach((q, index) => {

        const card =
            document.createElement("div");

        card.className = "card";

        let html = `
            <div class="question-title">
                Question ${index + 1}
            </div>

            <div class="question-content">
                ${q.content}
            </div>
        `;

        // ===== SINGLE CHOICE =====
        if (q.type === "single_choice") {

            html += `<div class="options">`;

            q.options.forEach(o => {

                const isCorrect =
                    o.label === q.correctAnswer;

                const isChosen =
                    o.label === q.studentAnswer;

                html += `
                    <div class="
                        option
                        ${isCorrect ? "correct" : ""}
                        ${isChosen ? "selected" : ""}
                    ">

                        <b>${o.label}.</b>
                        ${o.content}

                        ${isChosen
                            ? "(Your answer)"
                            : ""}

                    </div>
                `;
            });

            html += `</div>`;
        }

        // ===== FILL BLANK =====
        else {

            html += `
                <div class="option">

                    <b>Your answer:</b>
                    ${q.studentAnswer || "-"}

                </div>

                <div class="option correct">

                    <b>Correct answer:</b>
                    ${q.correctAnswer}

                </div>
            `;
        }

        // ===== STATUS =====
        html += `
            <div class="
                review-status
                ${q.isCorrect
                    ? "success"
                    : "fail"}
            ">

                ${q.isCorrect
                    ? "Correct"
                    : "Wrong"}

            </div>
        `;

        // ===== EXPLANATION =====
        if (q.explanation) {

            html += `
                <div class="explanation">

                    <b>Explanation:</b>

                    <br><br>

                    ${q.explanation}

                </div>
            `;
        }

        card.innerHTML = html;

        container.appendChild(card);
    });
}

// ===== BACK =====
function goBack() {

    location.href =
        "/pages/student/exam-menu.html?assignmentId="
        + assignmentId;
}