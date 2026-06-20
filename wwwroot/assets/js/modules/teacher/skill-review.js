const token =
    localStorage.getItem(
        "token"
    );

const params =
    new URLSearchParams(
        location.search
    );

const reviewId =
    params.get(
        "reviewId"
    );

const submissionId =
    params.get(
        "submissionId"
    );

const API =
    CONFIG.API_BASE +
    "/api/skills";

let reviewData =
    null;

let trackMode =
    false;

/* =========================
   REQUEST
========================= */

async function request(
    url,
    options = {}
)
{
    const response =
        await fetch(
            url,
            {
                ...options,

                headers:
                {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );

    if (!response.ok)
    {
        throw new Error(
            await response.text()
        );
    }

    return await response.json();
}

/* =========================
   LOAD REVIEW
========================= */

async function loadReview()
{
    try
    {
        reviewData =
            await request(
                `${API}/review-detail/${reviewId}`
            );

        console.log(
            "reviewData",
            reviewData
        );

        if (
            !reviewData ||
            !reviewData.review
        )
        {
            alert(
                "Review not found"
            );

            return;
        }

        renderReview();
    }
    catch (error)
    {
        console.error(
            error
        );

        alert(
            "Failed to load review"
        );
    }
}

/* =========================
   RENDER
========================= */

function renderReview()
{
    const submission =
        reviewData.submission;

    const review =
        reviewData.review;

    const annotations =
        reviewData.annotations;

    document.getElementById(
    "studentInfo"
).innerHTML =
`
<span>
    <i class="bi bi-person"></i>
    ${submission.studentName}
</span>

<span>
    <i class="bi bi-file-text"></i>
    ${submission.wordCount} words
</span>
`;

    document.getElementById(
        "mainTopic"
    ).innerText =
        review.mainTopic || "-";

    document.getElementById(
        "level"
    ).innerText =
        review.estimatedLevel || "-";

    document.getElementById(
    "expectedLevel"
).innerText =
    review.expectedLevel || "-";

document.getElementById(
    "taskRelevance"
).innerText =
    review.taskRelevance || "-";

    document.getElementById(
        "summary"
    ).innerText =
        review.aiSummary || "";

    document.getElementById(
        "grammar"
    ).innerText =
        review.grammarFeedback || "";

    document.getElementById(
        "vocabulary"
    ).innerText =
        review.vocabularyFeedback || "";

    document.getElementById(
        "coherence"
    ).innerText =
        review.coherenceFeedback || "";

    document.getElementById(
        "taskCompletion"
    ).innerText =
        review.taskCompletionFeedback || "";

    document.getElementById(
        "teacherScore"
    ).value =
        review.teacherScore || "";

    document.getElementById(
        "teacherComment"
    ).value =
        review.teacherComment || "";

    renderAnnotations(
        submission.rawText,
        annotations
    );
}

/* =========================
   ANNOTATIONS
========================= */

function renderAnnotations(
    text,
    annotations
)
{
    const container =
        document.getElementById(
            "writingContent"
        );

    container.contentEditable =
        true;

    if (
        !annotations ||
        annotations.length === 0
    )
    {
        container.innerText =
            text;

        updateWordCount();

        return;
    }

    let html =
        text;

    const allowedTypes =
    [
        "grammar",
        "vocabulary",
        "spelling",
        "collocation"
    ];

    annotations.forEach(
        annotation =>
        {
            if (
                !annotation ||
                !annotation.errorText
            )
            {
                return;
            }

            const errorType =
                (
                    annotation.errorType ||
                    ""
                )
                .trim()
                .toLowerCase();

            if (
                !allowedTypes.includes(
                    errorType
                )
            )
            {
                return;
            }

            if (
                annotation.errorText.length > 40
            )
            {
                return;
            }

            if (
                annotation.errorText
                .split(" ")
                .length > 5
            )
            {
                return;
            }

            if (
                annotation.errorText.includes(
                    "."
                )
            )
            {
                return;
            }

            const escaped =
                annotation.errorText
                .replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                );

            const regex =
    new RegExp(
        `(^|\\s)(${escaped})(?=\\s|$|[.,!?;:])`,
        "gi"
    );

html =
    html.replace(
        regex,
        `$1
        <span
            class="ai-mark"
            title="${annotation.suggestion || ""}">
            $2
        </span>`
    );

            html =
                html.replace(
                    regex,
                    `
                    <strong
                        class="ai-mark"
                        data-type="${errorType}"
                        title="${annotation.suggestion || ""}">

                        ${annotation.errorText}

                    </strong>
                    `
                );
        }
    );

    container.innerHTML =
        html;

    updateWordCount();

    container.removeEventListener(
        "input",
        updateWordCount
    );

    container.addEventListener(
        "input",
        updateWordCount
    );
}

/* =========================
   WORD COUNT
========================= */

function updateWordCount()
{
    const text =
        document
        .getElementById(
            "writingContent"
        )
        .innerText;

    const count =
        text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    document
    .getElementById(
        "wordCounter"
    )
    .innerText =
        `${count} words`;
}

/* =========================
   SAVE REVIEW
========================= */

async function saveTeacherReview()
{
    try
    {
        await request(
            `${API}/review/${reviewData.review.id}`,
            {
                method:
                    "PUT",

                body:
                    JSON.stringify(
                    {
                        teacherScore:
                            parseFloat(
                                document.getElementById(
                                    "teacherScore"
                                ).value
                            ),

                        teacherComment:
                            document.getElementById(
                                "teacherComment"
                            ).value
                    })
            }
        );

        alert(
            "Review saved"
        );
    }
    catch (error)
    {
        console.error(
            error
        );

        alert(
            "Save failed"
        );
    }
}

/* =========================
   EXPORT
========================= */

function exportPdf()
{
    location.href =
        `${API}/review/${submissionId}/export/pdf`;
}

function exportDocx()
{
    location.href =
        `${API}/review/${submissionId}/export/docx`;
}

/* =========================
   TOOLBAR
========================= */

function exec(command)
{
    document.execCommand(
        command,
        false,
        null
    );
}

function setupToolbar()
{
    const boldBtn =
        document.getElementById(
            "boldBtn"
        );

    if (boldBtn)
    {
        boldBtn.addEventListener(
            "click",
            () =>
                exec("bold")
        );
    }

    const italicBtn =
        document.getElementById(
            "italicBtn"
        );

    if (italicBtn)
    {
        italicBtn.addEventListener(
            "click",
            () =>
                exec("italic")
        );
    }

    const underlineBtn =
        document.getElementById(
            "underlineBtn"
        );

    if (underlineBtn)
    {
        underlineBtn.addEventListener(
            "click",
            () =>
                exec("underline")
        );
    }

    const trackBtn =
        document.getElementById(
            "trackBtn"
        );

    if (trackBtn)
    {
        trackBtn.addEventListener(
            "click",
            () =>
            {
                trackMode =
                    !trackMode;

                trackBtn.classList.toggle(
                    "active"
                );

                alert(
                    trackMode
                    ? "Track Change ON"
                    : "Track Change OFF"
                );
            }
        );
    }

    const commentBtn =
        document.getElementById(
            "commentBtn"
        );

    if (commentBtn)
    {
        commentBtn.addEventListener(
            "click",
            addComment
        );
    }
}

/* =========================
   COMMENTS
========================= */

function addComment()
{
    const selected =
        window
        .getSelection()
        .toString();

    if (!selected)
    {
        alert(
            "Select text first"
        );

        return;
    }

    const comment =
        prompt(
            "Enter comment"
        );

    if (!comment)
    {
        return;
    }

    console.log(
        {
            text:
                selected,

            comment:
                comment
        }
    );

    alert(
        "Comment added (UI only)"
    );
}

/* =========================
   EVENTS
========================= */

document
.getElementById(
    "saveReviewBtn"
)
?.addEventListener(
    "click",
    saveTeacherReview
);

document
.getElementById(
    "exportPdfBtn"
)
?.addEventListener(
    "click",
    exportPdf
);

document
.getElementById(
    "exportDocxBtn"
)
?.addEventListener(
    "click",
    exportDocx
);

/* =========================
   START
========================= */

setupToolbar();

loadReview();

