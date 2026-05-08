const params = new URLSearchParams(location.search);

const assignmentId =
    params.get("assignmentId");

if (!assignmentId) {
    alert("Missing assignmentId");
    history.back();
}

let assignmentState = null;

// ===== INIT =====
window.onload = async () => {

    renderLayout("student");

    await loadState();
};

// ===== LOAD =====
async function loadState() {

    try {

        const data =
            await API.request(
                "/exam/state/" + assignmentId
            );

        assignmentState = data;

        applyState(data);

    } catch (err) {

        console.error(err);

        alert("Cannot load assignment state");
    }
}

// ===== APPLY UI =====
function applyState(a) {

    const startCard =
        document.getElementById("startCard");

    const resultCard =
        document.getElementById("resultCard");

    const reviewCard =
        document.getElementById("reviewCard");

    const startDesc =
        document.getElementById("startDesc");

    const resultDesc =
        document.getElementById("resultDesc");

    const reviewDesc =
        document.getElementById("reviewDesc");

    const now = new Date();

    const open =
        a.openTime
            ? new Date(a.openTime)
            : null;

    const close =
        a.closeTime
            ? new Date(a.closeTime)
            : null;

    // ===== RESET =====
    disable(startCard);
    disable(resultCard);
    disable(reviewCard);

    startCard.onclick = null;
    resultCard.onclick = null;
    reviewCard.onclick = null;

    // ===== NOT OPEN =====
    if (open && now < open) {

        startDesc.innerText =
            "Not opened yet";

        resultDesc.innerText =
            "Unavailable";

        reviewDesc.innerText =
            "Unavailable";

        return;
    }

    // ===== CLOSED =====
    if (close && now > close) {

        startDesc.innerText =
            "Closed";

        if (a.submitted) {

            enable(resultCard);
            resultCard.onclick = viewResult;

            resultDesc.innerText =
                "View score";

            if (a.showExplanation) {

                enable(reviewCard);
                reviewCard.onclick = reviewExam;

                reviewDesc.innerText =
                    "Review answers";
            }
        }
        else {

            resultDesc.innerText =
                "No submission";

            reviewDesc.innerText =
                "No review";
        }

        return;
    }

    // ===== AVAILABLE =====
    if (!a.submitted) {

        enable(startCard);

        startCard.onclick = startExam;

        startDesc.innerText =
            "Ready to start";

        resultDesc.innerText =
            "No result yet";

        reviewDesc.innerText =
            "Complete exam first";
    }

    // ===== SUBMITTED =====
    if (a.submitted) {

        enable(startCard);

        startCard.onclick = startExam;

        startDesc.innerText =
            "Retake exam";

        enable(resultCard);

        resultCard.onclick = viewResult;

        resultDesc.innerText =
            "View latest result";

        if (a.showExplanation) {

            enable(reviewCard);

            reviewCard.onclick = reviewExam;

            reviewDesc.innerText =
                "Review answers";
        }
        else {

            reviewDesc.innerText =
                "Review disabled";
        }
    }
}

// ===== HELPERS =====
function disable(el) {

    el.classList.add("disabled");
}

function enable(el) {

    el.classList.remove("disabled");
}

// ===== START =====
function startExam() {

    openModal();
}

// ===== MODAL =====
function openModal() {

    document.getElementById(
        "startModal"
    ).style.display = "flex";
}

function closeModal() {

    document.getElementById(
        "startModal"
    ).style.display = "none";
}

// ===== CONFIRM =====
function confirmStart() {

    location.href =
        "/pages/student/exam.html?assignmentId="
        + assignmentId;
}

// ===== RESULT =====
function viewResult() {

    location.href =
        "/pages/student/result.html?assignmentId="
        + assignmentId;
}

// ===== REVIEW =====
function reviewExam() {

    location.href =
        "/pages/student/review.html?assignmentId="
        + assignmentId;
}

// ===== CLOSE MODAL OUTSIDE =====
window.onclick = function (e) {

    const modal =
        document.getElementById("startModal");

    if (e.target === modal) {

        closeModal();
    }
};