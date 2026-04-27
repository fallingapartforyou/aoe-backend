// ===== LOAD CLASSES =====
async function loadClasses() {
    try {
        showSkeleton();

        const classes = await API.request("/student/my");

        render(classes);
    }
    catch (err) {
        console.error(err);
        alert(err.message || "Load classes failed");
    }
}

// ===== SKELETON =====
function showSkeleton() {
    const container = document.getElementById("classList");
    container.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const col = document.createElement("div");
        col.className = "col-md-4";

        col.innerHTML = `<div class="skeleton-card"></div>`;

        container.appendChild(col);
    }
}

// ===== RENDER =====
function render(classes) {
    const container = document.getElementById("classList");
    container.innerHTML = "";

    if (!classes || classes.length === 0) {
        container.innerHTML = `<p class="text-muted">No classes joined yet</p>`;
        return;
    }

    classes.forEach(c => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        col.innerHTML = `
            <div class="card p-3 shadow-sm h-100">
                <h5>${c.name}</h5>

                <button class="btn btn-primary btn-sm mt-2"
                        onclick="openAssignments(${c.id})">
                    Assignments
                </button>
            </div>
        `;

        container.appendChild(col);
    });
}

// ===== OPEN ASSIGNMENTS =====
function openAssignments(classId) {
    location.href = "/pages/student/assignments.html?classId=" + classId;
}

// ===== GO BACK =====
function goBack() {
    history.back();
}

// ===== JOIN CLASS (GỘP VÀO) =====
async function joinClass() {
    try {
        const classCode = document
            .getElementById("classCode")
            .value
            .trim();

        if (!classCode)
            return alert("Enter class code");

        if (!Validator.classCode(classCode))
            return alert("Class code max 8 characters (letters + numbers only)");

        await API.request(
            "/student/join-class",
            "POST",
            { classCode }
        );

        alert("Joined successfully");

        // 🔥 KHÔNG redirect nữa → reload list luôn
        document.getElementById("classCode").value = "";
        loadClasses();

    }
    catch (err) {
        console.error(err);
        alert(err.message || "Join failed");
    }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    loadClasses();
});