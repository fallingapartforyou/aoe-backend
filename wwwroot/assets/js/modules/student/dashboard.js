window.onload = async () => {
    renderLayout("student");

    await Promise.all([
        loadStats(),
        loadAssignments()
    ]);
};

// ================= STATS =================
async function loadStats() {
    try {
        // 1. classes
        const classes = await API.get("/api/student/my");

        // 2. assignments per class (compose logic)
        let assignments = [];

        for (const c of classes) {
            const classAssignments =
                await API.get(`/api/assignment/classes/${c.id}`)
                    .catch(() => []);

            assignments.push(...classAssignments);
        }

        // 3. attempts (submissions)
        const submissions =
            await API.get("/api/submission/my")
                .catch(() => []);

        document.getElementById("myClasses").innerText =
            classes.length;

        document.getElementById("myAssignments").innerText =
            assignments.length;

        document.getElementById("myAttempts").innerText =
            submissions.length;

    } catch (err) {
        console.log("Stats error:", err);
    }
}

// ================= ASSIGNMENTS =================
async function loadAssignments() {

    const container = document.getElementById("assignmentList");

    container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;

    try {
        const classes = await API.get("/api/student/my");

        let assignments = [];

        for (const c of classes) {
            const res =
                await API.get(`/api/assignment/classes/${c.id}`)
                    .catch(() => []);

            assignments.push(...res);
        }

        if (!assignments.length) {
            container.innerHTML = `<p>No assignments</p>`;
            return;
        }

        // remove duplicates (important)
        assignments = [...new Map(assignments.map(a => [a.id, a])).values()];

        assignments.sort((a, b) =>
            new Date(b.openTime) - new Date(a.openTime)
        );

        container.innerHTML = "";

        assignments.slice(0, 5).forEach(a => {

            const card = document.createElement("div");
            card.className = "card";

            const now = new Date();
            const open = a.openTime ? new Date(a.openTime) : null;
            const close = a.closeTime ? new Date(a.closeTime) : null;

            let status = "";
            let action = "";

            if (open && now < open) {
                status = "Not open";
                action = `<button disabled>Not open</button>`;
            }
            else if (close && now > close) {
                status = "Closed";
                action = `<button onclick="review(${a.id})">Review</button>`;
            }
            else {
                status = "Available";
                action = `<button onclick="startExam(${a.id})">Start</button>`;
            }

            card.innerHTML = `
                <h3>${a.name}</h3>
                <p>${a.questionCount} questions</p>
                <p>Status: ${status}</p>
                ${action}
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Assignment error:", err);
        container.innerHTML = `<p>Load failed</p>`;
    }
}

// ================= ACTION =================
function startExam(id) {
    location.href = `/pages/student/take-exam.html?assignmentId=${id}`;
}

function review(id) {
    location.href = `/pages/student/review.html?assignmentId=${id}`;
}