console.log("ASSIGNMENTS READY");

const params = new URLSearchParams(location.search);

const classId = params.get("classId");

// ===== INIT =====
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        renderLayout("student");

        await loadClassInfo();

        await loadAssignments();
    }
);

// ===== CLASS INFO =====
async function loadClassInfo()
{
    try
    {
        const classes =
            await API.request(
            "/api/class/my-classes"
            );

        console.log("MY CLASSES:", classes);

        const cls =
            classes.find(
                x => String(x.id) === String(classId)
            );

        console.log("CURRENT CLASS:", cls);

        if (!cls)
        {
            document.getElementById(
                "className"
            ).innerText =
                "Class Not Found";

            document.getElementById(
                "teacherName"
            ).innerText =
                "Teacher: Unknown";

            document.querySelector(
                ".class-code"
            ).innerText =
                "N/A";

            return;
        }

        // ===== CLASS NAME =====
        document.getElementById(
            "className"
        ).innerText =
            cls.name ||
            "Unnamed Class";

        // ===== TEACHER =====
        document.getElementById(
            "teacherName"
        ).innerText =
            "Teacher: " +
            (
                cls.teacherName &&
                cls.teacherName.trim() !== ""
            )
                ? cls.teacherName
                : (
                    cls.teacherEmail ||
                    "Unknown"
                );

        // ===== CLASS CODE =====
        document.querySelector(
            ".class-code"
        ).innerText =
            cls.classCode ||
            "N/A";
    }
    catch (err)
    {
        console.error(err);

        document.getElementById(
            "className"
        ).innerText =
            "Load Failed";

        document.getElementById(
            "teacherName"
        ).innerText =
            "Teacher: Unknown";

        document.querySelector(
            ".class-code"
        ).innerText =
            "N/A";
    }
}

// ===== LOAD ASSIGNMENTS =====
async function loadAssignments()
{
    const container =
        document.getElementById(
            "assignmentList"
        );

    try
    {
        if (!classId)
        {
            container.innerHTML = `
                <p class="text-danger">
                    Missing classId
                </p>
            `;

            return;
        }

        showSkeleton();

        const assignments =
            await API.request(
                "/api/exam/assignments/" + classId
            );

        updateStats(assignments);

        render(assignments);
    }
    catch (err)
    {
        console.error(err);

        container.innerHTML = `
            <p class="text-danger">
                Cannot load assignments
            </p>
        `;
    }
}

// ===== STATS =====
function updateStats(assignments)
{
    document.getElementById(
        "totalAssignments"
    ).innerText =
        assignments.length;

    const completed =
        assignments.filter(
            x => x.submitted
        ).length;

    document.getElementById(
        "completedAssignments"
    ).innerText =
        completed;

    const scored =
        assignments.filter(
            x => x.score != null
        );

    let avg = 0;

    if (scored.length > 0)
    {
        avg =
            scored.reduce(
                (sum, x) => sum + x.score,
                0
            ) / scored.length;
    }

    document.getElementById(
        "avgScore"
    ).innerText =
        avg.toFixed(1);
}

// ===== SKELETON =====
function showSkeleton()
{
    const container =
        document.getElementById(
            "assignmentList"
        );

    container.innerHTML = "";

    for (let i = 0; i < 6; i++)
    {
        const div =
            document.createElement("div");

        div.innerHTML = `
            <div class="skeleton-card"></div>
        `;

        container.appendChild(div);
    }
}

// ===== STATUS =====
function getStatus(a)
{
    const now =
        new Date();

    const open =
        a.openTime
        ? new Date(a.openTime)
        : null;

    const close =
        a.closeTime
        ? new Date(a.closeTime)
        : null;

    if (open && now < open)
        return "not_open";

    if (close && now > close)
        return "closed";

    if (a.submitted)
        return "done";

    return "available";
}

// ===== STATUS BADGE =====
function getBadge(status)
{
    if (status === "available")
    {
        return `
            <span class="badge badge-success">
                Available
            </span>
        `;
    }

    if (status === "done")
    {
        return `
            <span class="badge badge-primary">
                Submitted
            </span>
        `;
    }

    if (status === "closed")
    {
        return `
            <span class="badge badge-danger">
                Closed
            </span>
        `;
    }

    return `
        <span class="badge badge-warning">
            Not Open
        </span>
    `;
}

// ===== RENDER =====
function render(assignments)
{
    const container =
        document.getElementById(
            "assignmentList"
        );

    container.innerHTML = "";

    if (!assignments ||
        assignments.length === 0)
    {
        container.innerHTML = `
            <div class="empty-state">

                <h4>
                    No assignments yet
                </h4>

                <p class="text-muted">
                    You're all caught up 🎉
                </p>

            </div>
        `;

        return;
    }

    assignments.forEach(a =>
    {
        const status =
            getStatus(a);

        let btnText =
            "Start";

        let disabled =
            false;

        if (status === "not_open")
        {
            btnText = "Locked";

            disabled = true;
        }

        if (status === "closed")
        {
            btnText = "Closed";

            disabled = true;
        }

        if (status === "done")
        {
            btnText = "View";
        }

        const div =
            document.createElement("div");

        div.className =
            "assignment-card";

        div.innerHTML = `

            <div class="assignment-top">

                <div class="assignment-title">
                    ${a.name}
                </div>

                ${getBadge(status)}

            </div>

            <div class="assignment-body">

                <div class="assignment-info">

                    <span>
                        Questions:
                    </span>

                    <strong>
                        ${a.questionCount || 0}
                    </strong>

                </div>

                <div class="assignment-info">

                    <span>
                        Type:
                    </span>

                    <strong>
                        ${a.questionType || "-"}
                    </strong>

                </div>

                <div class="assignment-date">

                    ${
                        a.openTime
                        ? `
                            <div>
                                Open:
                                ${formatDate(a.openTime)}
                            </div>
                        `
                        : ""
                    }

                    ${
                        a.closeTime
                        ? `
                            <div>
                                Close:
                                ${formatDate(a.closeTime)}
                            </div>
                        `
                        : ""
                    }

                </div>

            </div>

            <div class="assignment-footer">

                <button
                    ${disabled ? "disabled" : ""}
                    onclick="openMenu(${a.id})">

                    ${btnText}

                </button>

            </div>
        `;

        container.appendChild(div);
    });
}

// ===== FORMAT DATE =====
function formatDate(d)
{
    return new Date(d)
        .toLocaleString();
}

// ===== NAV =====
function openMenu(assignmentId)
{
    location.href =
        "/pages/student/assignment-menu.html?assignmentId="
        + assignmentId;
}