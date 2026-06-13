const role =
    localStorage.getItem("role");

if (role !== "teacher")
{
    location.href =
        "../auth/login.html";
}

renderLayout(role);

/* =========================
   PARAMS
========================= */

const params =
    new URLSearchParams(
        location.search
    );

const assignmentId =
    params.get("assignmentId");

const studentId =
    params.get("studentId");

let currentResultId = null;

let allAttempts = [];

/* =========================
   LOAD ATTEMPTS
========================= */

async function loadAttempts()
{
    try
    {
        const attempts =
            await API.get(
                `/api/result/attempts/${assignmentId}/${studentId}`
            );

        allAttempts =
            attempts || [];

        const attemptList =
            document.getElementById(
                "attemptList"
            );

        if (
            !allAttempts.length
        )
        {
            attemptList.innerHTML =
                `
                <div class="card">
                    No attempts found
                </div>
                `;

            return;
        }

        if (!currentResultId)
        {
            currentResultId =
                allAttempts[0].id;
        }

        renderAttempts(
            allAttempts
        );

        loadReview(
            currentResultId
        );
    }
    catch (err)
    {
        console.error(err);

        alert(
            "Failed to load attempts"
        );
    }
}

/* =========================
   RENDER ATTEMPTS
========================= */

function renderAttempts(attempts)
{
    const attemptList =
        document.getElementById(
            "attemptList"
        );

    attemptList.innerHTML =
        attempts.map(attempt =>

            `
            <div
                class="
                    attempt-item
                    ${
                        attempt.id === currentResultId
                        ?
                        "active"
                        :
                        ""
                    }
                "

                onclick="
                    selectAttempt(
                        ${attempt.id}
                    )
                "
            >

                <div class="attempt-title">

                    Attempt #${attempt.attemptNumber}

                </div>

                <div class="attempt-meta">

                    Score:
                    ${attempt.score}

                </div>

                <div class="attempt-meta">

                    ${
                        formatDate(
                            attempt.submittedAt
                        )
                    }

                </div>

            </div>
            `
        ).join("");
}

/* =========================
   SELECT ATTEMPT
========================= */

function selectAttempt(resultId)
{
    currentResultId =
        resultId;

    renderAttempts(
        allAttempts
    );

    loadReview(
        resultId
    );
}

/* =========================
   LOAD REVIEW
========================= */

async function loadReview(resultId)
{
    try
    {
        const data =
            await API.get(
                `/api/result/review/${resultId}`
            );

        renderSummary(data);

        renderQuestions(
            data.review || data.Review
        );
    }
    catch (err)
    {
        console.error(err);

        alert(
            "Failed to load review"
        );
    }
}

/* =========================
   RENDER SUMMARY
========================= */

function renderSummary(data)
{
    const reviewSummary =
        document.getElementById(
            "reviewSummary"
        );

    reviewSummary.innerHTML =
        `
        <div class="summary-card">

            <div class="summary-label">
                Attempt
            </div>

            <div class="summary-value">
                #${data.attemptNumber}
            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">
                Score
            </div>

            <div class="summary-value">
                ${data.score}
            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">
                Time Spent
            </div>

            <div class="summary-value">
                ${
                    formatDuration(
                        data.timeSpentSeconds
                    )
                }
            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">
                Tab Switches
            </div>

            <div class="summary-value">
                ${data.tabSwitchCount}
            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">
                Suspicious
            </div>

            <div class="summary-value">

                ${
                    data.suspicious
                    ?
                    "YES"
                    :
                    "NO"
                }

            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">
                Submitted
            </div>

            <div
                class="summary-value"
                style="
                    font-size:16px;
                ">

                ${
                    formatDate(
                        data.submittedAt
                    )
                }

            </div>

        </div>
        `;
}

/* =========================
   RENDER QUESTIONS
========================= */

function renderQuestions(questions)
{
    const reviewQuestions =
        document.getElementById(
            "reviewQuestions"
        );

    reviewQuestions.innerHTML =
        questions.map(
            (
                question,
                index
            ) =>

            `
            <div class="
                question-card
                ${
                    question.isCorrect
                    ?
                    "correct"
                    :
                    "wrong"
                }
            ">

                <div class="question-header">

                    <div class="question-title">

                        Q${index + 1}.
                        ${question.content}

                    </div>

                    <div class="
                        question-badge
                        ${
                            question.isCorrect
                            ?
                            "badge-correct"
                            :
                            "badge-wrong"
                        }
                    ">

                        ${
                            question.isCorrect
                            ?
                            "Correct"
                            :
                            "Wrong"
                        }

                    </div>

                </div>

                <div class="question-body">

                    ${
                        renderOptions(
                            question
                        )
                    }

                    <div class="answer-grid">

                        <div class="answer-box">

                            <div class="answer-label">
                                Student Answer
                            </div>

                            <div class="answer-value">

                                ${
                                    question.studentAnswer
                                    ||
                                    "No Answer"
                                }

                            </div>

                        </div>

                        <div class="answer-box">

                            <div class="answer-label">
                                Correct Answer
                            </div>

                            <div class="answer-value">

                                ${
                                    question.correctAnswer
                                }

                            </div>

                        </div>

                    </div>

                    <div class="explanation-box">

                        <div class="explanation-title">

                            Explanation

                        </div>

                        <div class="explanation-content">

                            ${
                                question.explanation
                                ||
                                "No explanation"
                            }

                        </div>

                    </div>

                </div>

            </div>
            `
        ).join("");
}

/* =========================
   OPTIONS
========================= */

function renderOptions(question)
{
    if (
        !question.options ||
        question.options.length === 0
    )
    {
        return "";
    }

    return `
        <div class="option-list">

            ${
                question.options.map(option =>

                    `
                    <div class="
                        option-item
                        ${
                            option === question.correctAnswer
                            ?
                            "correct-answer"
                            :
                            ""
                        }
                    ">

                        ${option}

                    </div>
                    `
                ).join("")
            }

        </div>
    `;
}

/* =========================
   HELPERS
========================= */

function formatDate(date)
{
    if (!date)
        return "Unknown";

    return new Date(date)
        .toLocaleString();
}

function formatDuration(seconds)
{
    if (!seconds)
        return "0m";

    const minutes =
        Math.floor(seconds / 60);

    const remain =
        seconds % 60;

    return `${minutes}m ${remain}s`;
}

/* =========================
   INIT
========================= */

loadAttempts();