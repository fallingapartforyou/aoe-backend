window.onload = async () => {
    renderLayout("student");

    showSkeleton();
    await loadClasses();
};

// ===== LOAD =====
async function loadClasses() {
    try {
        const classes = await API.request("/student/my");
        render(classes);
    }
    catch (err) {
        console.error(err);
        alert("Load classes failed");
    }
}

// ===== SKELETON =====
function showSkeleton() {
    const container = document.getElementById("classList");

    container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;
}

// ===== RENDER =====
function render(classes) {
    const container = document.getElementById("classList");
    container.innerHTML = "";

    if (!classes || classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No classes joined yet
            </div>
        `;
        return;
    }

    classes.forEach(c => {
        const card = document.createElement("div");

        card.className = "card";

        // 🔥 CLICK NGUYÊN CARD
        card.onclick = () => openAssignments(c.id);

        card.innerHTML = `
            <h3>${c.name}</h3>
            <p>Click to view assignments</p>
        `;

        container.appendChild(card);
    });
}

// ===== JOIN =====
async function joinClass() {
    try {
        const input = document.getElementById("classCode");
        const classCode = input.value.trim();

        if (!classCode)
            return alert("Enter class code");

        if (!Validator.classCode(classCode))
            return alert("Invalid class code");

        await API.request(
            "/student/join-class",
            "POST",
            { classCode }
        );

        input.value = "";

        // reload list
        loadClasses();

    } catch (err) {
        console.error(err);
        alert("Join failed");
    }
}

// ===== NAVIGATION =====
function openAssignments(classId) {
    location.href =
        "/pages/student/assignments.html?classId=" + classId;
}