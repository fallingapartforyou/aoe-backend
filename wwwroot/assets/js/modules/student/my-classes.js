window.onload = async () => {
    renderLayout("student");

    showSkeleton();
    await loadClasses();
};

// ================= LOAD CLASSES =================
async function loadClasses() {
    try {
        const classes = await API.request("/api/student/my-classes");
        render(classes);
    }
    catch (err) {
        console.error(err);
        alert("Load classes failed");
    }
}

// ================= SKELETON =================
function showSkeleton() {
    const container = document.getElementById("classList");

    container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;
}

// ================= RENDER =================
function render(classes) {
    const container = document.getElementById("classList");
    container.innerHTML = "";

    if (!classes || classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                You have not joined any class yet
            </div>
        `;
        return;
    }

    classes.forEach(c => {
        const card = document.createElement("div");
        card.className = "card";

        card.onclick = () => openAssignments(c.id);

        card.innerHTML = `
            <h3>${c.name}</h3>
            <p>Code: ${c.classCode}</p>
            <p>Teacher: ${c.teacherName || "N/A"}</p>
        `;

        container.appendChild(card);
    });
}

// ================= JOIN CLASS =================
async function joinClass() {
    try {
        const input = document.getElementById("classCode");
        const classCode = input.value.trim();

        if (!classCode) {
            alert("Enter class code");
            return;
        }

        if (!Validator.classCode(classCode)) {
            alert("Invalid class code");
            return;
        }

        await API.request(
            "/api/student/join-class",
            "POST",
            {
                classCode: classCode
            }
        );

        input.value = "";
        alert("Join request sent");

        await loadClasses();

    } catch (err) {
        console.error(err);
        alert(err?.message || "Join failed");
    }
}

// ================= NAVIGATION =================
function openAssignments(classId) {
    location.href =
        "/pages/student/assignments.html?classId=" + classId;
}