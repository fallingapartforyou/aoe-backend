window.onload = async () => {
    renderLayout("student");

    await loadStats();
    await loadNotifications();
};

// ===== STATS =====
async function loadStats() {
    try {
        const classes = await API.get("/student/my");
        document.getElementById("myClasses").innerText = classes.length;

        const assignments = await API.get("/assignment/student");
        document.getElementById("myAssignments").innerText = assignments.length;

        const attempts = await API.get("/attempt/my");
        document.getElementById("myAttempts").innerText = attempts.length;
    }
    catch (err) {
        console.log("Dashboard load error", err);
    }
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
    const container = document.getElementById("notifications");

    // skeleton loading
    container.innerHTML = `
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-small"></div>
    `;

    try {
        // 🔥 giả lập: lấy assignments gần nhất
        const assignments = await API.get("/assignment/student");

        if (!assignments || assignments.length === 0) {
            container.innerHTML = `<p class="text-muted">No notifications</p>`;
            return;
        }

        // lấy 5 cái mới nhất
        const latest = assignments.slice(0, 5);

        container.innerHTML = "";

        latest.forEach(a => {
            const div = document.createElement("div");
            div.className = "mb-2 p-2 border rounded";

            div.innerHTML = `
                <strong>${a.title || "Assignment"}</strong><br>
                <small class="text-muted">New assignment available</small>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-danger">Failed to load notifications</p>`;
    }
}