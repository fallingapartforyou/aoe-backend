console.log("ASSIGNMENTS READY");

const params = new URLSearchParams(location.search);
const classId = params.get("classId");

// ===== LOAD =====
async function loadAssignments() {
    const container = document.getElementById("assignmentList");

    try {
        if (!classId) {
            container.innerHTML = `<p class="text-danger">Missing classId</p>`;
            return;
        }

        showSkeleton();

        const assignments = await API.request(
            "/exam/assignments/" + classId
        );

        render(assignments);

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-danger">Cannot load assignments</p>`;
    }
}

// ===== SKELETON =====
function showSkeleton() {
    const container = document.getElementById("assignmentList");
    container.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const div = document.createElement("div");

        div.innerHTML = `
            <div class="skeleton-card"></div>
        `;

        container.appendChild(div);
    }
}

// ===== RENDER =====
function render(assignments) {
    const container = document.getElementById("assignmentList");
    container.innerHTML = "";

    if (!assignments || assignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No assignments yet</h4>
                <p class="text-muted">You're all caught up 🎉</p>
            </div>
        `;
        return;
    }

    assignments.forEach(a => {
        const div = document.createElement("div");

        div.className = "assignment-card";

        div.innerHTML = `
            <div>
                <div class="assignment-title">${a.name}</div>
                <p class="text-muted">Click to view details</p>
            </div>

            <button onclick="openMenu(${a.id})">
                Open
            </button>
        `;

        container.appendChild(div);
    });
}

// ===== NAV =====
function openMenu(assignmentId) {
    location.href =
        "/pages/student/assignment-menu.html?assignmentId=" +
        assignmentId;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", loadAssignments);