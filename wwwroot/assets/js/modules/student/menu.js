// ===== GET PARAM =====
const params = new URLSearchParams(location.search);
const assignmentId = params.get("assignmentId");

if (!assignmentId) {
    alert("Missing assignmentId");
}

// ===== START EXAM (MỞ MODAL) =====
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

// ===== CONFIRM START =====
function confirmStart() {
    location.href =
        "/pages/student/exam.html?assignmentId=" + assignmentId;
}

// ===== VIEW RESULT =====
function viewResult() {
    location.href =
        "/pages/student/result.html?assignmentId=" + assignmentId;
}

// ===== REVIEW =====
function reviewExam() {
    location.href =
        "/pages/student/review.html?assignmentId=" + assignmentId;
}