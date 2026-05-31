window.onload = async () => {
    renderLayout("teacher");

    await loadStats();
    await loadNotifications();
};

// =========================
// STATS
// =========================
async function loadStats() {
    try {
        const classes = await API.get("/api/class/my-classes");
        document.getElementById("totalClasses").innerText = classes.length;

        const assignments = await API.get("/assignment/my-assignments");
        document.getElementById("totalAssignments").innerText = assignments.length;

        // teacher không có endpoint student list toàn hệ thống
        // nên lấy từ class students
        let studentCount = 0;

        for (const c of classes) {
            const res = await API.get(`/api/class/students/${c.id}`);
            studentCount += res.length;
        }

        document.getElementById("totalStudents").innerText = studentCount;

        const submissions = await API.get("/submission/my");
        document.getElementById("totalSubmissions").innerText = submissions.length;

    } catch (err) {
        console.log("Dashboard load error", err);
    }
}

// =========================
// NOTIFICATIONS
// =========================
async function loadNotifications() {
    const container = document.getElementById("notifications");

    container.innerHTML = `
        <div class="text-muted">Loading...</div>
    `;

    try {
        const data = await API.get("/api/notification/my");

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="text-muted">No notifications yet</div>`;
            return;
        }

        container.innerHTML = "";

        data.slice(0, 10).forEach(n => {
            const div = document.createElement("div");

            div.className = "notification-item";

            div.innerHTML = `
                <strong>${n.title}</strong>
                <div>${n.message}</div>
                <small class="text-muted">
                    ${new Date(n.createdAt).toLocaleString()}
                </small>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="text-danger">Failed to load notifications</div>`;
    }
}