const params = new URLSearchParams(location.search);
const assignmentId = params.get("assignmentId");

if (!assignmentId) {
    alert("Missing assignmentId");
}

// ===== INIT =====
window.onload = async () => {
    renderLayout("student");
    await loadState();
};

// ===== LOAD STATE =====
async function loadState() {
    try {
        const data = await API.request(
            "/exam/state/" + assignmentId
        );

        applyState(data);

    } catch (err) {
        console.error(err);
        alert("Cannot load assignment state");
    }
}

// ===== APPLY UI =====
function applyState(a) {
    const startCard = document.getElementById("startCard");
    const resultCard = document.getElementById("resultCard");
    const reviewCard = document.getElementById("reviewCard");

    const startDesc = document.getElementById("startDesc");
    const resultDesc = document.getElementById("resultDesc");
    const reviewDesc = document.getElementById("reviewDesc");

    const now = new Date();

    const open = a.openTime ? new Date(a.openTime) : null;
    const close = a.closeTime ? new Date(a.closeTime) : null;

    // ===== RESET =====
    disable(startCard);
    disable(resultCard);
    disable(reviewCard);

    // ===== NOT OPEN =====
    if (open && now < open) {
        startDesc.innerText = "Not opened yet";
        return;
    }

    // ===== CLOSED =====
    if (close && now > close) {
        startDesc.innerText = "Closed";

        if (a.submitted) {
            enable(resultCard);
            enable(reviewCard);
        }

        return;
    }

    // ===== AVAILABLE =====
    if (!a.submitted) {
        enable(startCard);
        startDesc.innerText = "Ready to start";
    }

    // ===== DONE =====
    if (a.submitted) {
        startDesc.innerText = "Already submitted";
        enable(resultCard);

        if (a.showExplanation) {
            enable(reviewCard);
        }
    }
}

// ===== UI HELPERS =====
function disable(el) {
    el.classList.add("disabled");
    el.onclick = null;
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
    document.getElementById("startModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("startModal").style.display = "none";
}

function confirmStart() {
    location.href =
        "/pages/student/exam.html?assignmentId=" + assignmentId;
}

// ===== NAV =====
function viewResult() {
    location.href =
        "/pages/student/result.html?assignmentId=" + assignmentId;
}

function reviewExam() {
    location.href =
        "/pages/student/review.html?assignmentId=" + assignmentId;
}