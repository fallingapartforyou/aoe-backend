let deleteMode = false;

let selectedIds = new Set();

let assignmentsCache = [];

// ================= INIT =================

window.onload = async () => {

    renderLayout("teacher");

    showSkeleton();

    await loadAssignments();

};

// ================= SKELETON =================

function showSkeleton() {

    document.getElementById(
        "assignmentList"
    ).innerHTML = `

        <div class="assignment-card skeleton-card"></div>

        <div class="assignment-card skeleton-card"></div>

        <div class="assignment-card skeleton-card"></div>

    `;
}

// ================= LOAD =================

async function loadAssignments() {

    try {

        showSkeleton();

        const keyword =
            document
            .getElementById("keyword")
            ?.value
            ?.trim() || "";

        const data =
            await API.request(
                "/api/assignment/my-assignments?keyword="
                + encodeURIComponent(keyword)
            );

        assignmentsCache = data || [];

        renderAssignments(assignmentsCache);

        updateStats(assignmentsCache);

    }
    catch (err) {

        console.error(err);

        document.getElementById(
            "assignmentList"
        ).innerHTML = `
            <div class="card">
                Load failed
            </div>
        `;
    }
}

// ================= RENDER =================

function renderAssignments(assignments) {

    const container =
        document.getElementById(
            "assignmentList"
        );

    container.innerHTML = "";

    if (!assignments.length) {

        container.innerHTML = `
            <div class="card empty-card">

                <h3>
                    No assignments
                </h3>

                <p>
                    Create your first assignment
                </p>

            </div>
        `;

        return;
    }

    assignments.forEach(a => {

        const type =
            formatType(
                a.questionType
            );

        const openTime =
            formatDate(
                a.openTime
            );

        const closeTime =
            formatDate(
                a.closeTime
            );

        const card =
            document.createElement("div");

        card.className =
            "assignment-card";

        card.innerHTML = `

            <div class="assignment-top">

                ${
                    deleteMode
                    ?
                    `
                    <input
                        type="checkbox"
                        class="assignment-checkbox"
                        onchange="
                            toggleSelect(
                                ${a.id},
                                this.checked
                            )
                        ">
                    `
                    :
                    ""
                }

                <div class="assignment-badge">

                    ${type}

                </div>

            </div>

            <div class="assignment-title">

                ${a.name}

            </div>

            <div class="assignment-meta">

                <div class="meta-item">

                    <span>
                        Questions
                    </span>

                    <b>
                        ${a.questionCount}
                    </b>

                </div>

                <div class="meta-item">

                    <span>
                        Result
                    </span>

                    <b>
                        ${
                            a.showResult
                            ? "Visible"
                            : "Hidden"
                        }
                    </b>

                </div>

            </div>

            <div class="assignment-time">

                <div>

                    <small>
                        Open
                    </small>

                    <div>
                        ${openTime}
                    </div>

                </div>

                <div>

                    <small>
                        Close
                    </small>

                    <div>
                        ${closeTime}
                    </div>

                </div>

            </div>

            <div class="assignment-actions">

                <button
                    class="btn-primary"
                    onclick="
                        openQuestions(
                            ${a.id},
                            '${a.questionType}'
                        )
                    ">

                    Questions

                </button>

                <button
                    class="btn-secondary"
                    onclick="
                        viewResult(
                            ${a.id}
                        )
                    ">

                    Results

                </button>

                <button
                    class="btn-danger"
                    onclick="
                        deleteSingle(
                            ${a.id}
                        )
                    ">

                    Delete

                </button>

            </div>

        `;

        container.appendChild(card);

    });
}

// ================= STATS =================

function updateStats(assignments) {

    const totalAssignmentsEl =
        document.getElementById(
            "totalAssignments"
        );

    const totalQuestionsEl =
        document.getElementById(
            "totalQuestions"
        );

    const totalAssignedEl =
        document.getElementById(
            "totalAssigned"
        );

    if (
        !totalAssignmentsEl ||
        !totalQuestionsEl ||
        !totalAssignedEl
    ) {
        return;
    }

    totalAssignmentsEl.innerText =
        assignments.length;

    let totalQuestions = 0;

    assignments.forEach(a => {

        totalQuestions +=
            a.questionCount || 0;

    });

    totalQuestionsEl.innerText =
        totalQuestions;

    totalAssignedEl.innerText =
        "-";
}
// ================= DELETE MODE =================

function toggleDeleteMode() {

    deleteMode = !deleteMode;

    selectedIds.clear();

    document.getElementById(
        "confirmDeleteBtn"
    ).style.display =
        deleteMode
        ? "inline-flex"
        : "none";

    document.getElementById(
        "deleteModeBtn"
    ).innerText =
        deleteMode
        ? "Cancel Delete"
        : "Delete Mode";

    renderAssignments(
        assignmentsCache
    );
}

function toggleSelect(id, checked) {

    if (checked)
        selectedIds.add(id);

    else
        selectedIds.delete(id);
}

// ================= DELETE =================

async function deleteSelected() {

    if (selectedIds.size === 0)
        return alert("No selected");

    const confirmed =
        confirm(
            "Delete selected assignments?"
        );

    if (!confirmed)
        return;

    try {

        for (const id of selectedIds) {

            await API.request(
                "/api/assignment/delete/" + id,
                "DELETE"
            );
        }

        deleteMode = false;

        selectedIds.clear();

        await loadAssignments();

    }
    catch (err) {

        console.error(err);

        alert("Delete failed");
    }
}

async function deleteSingle(id) {

    const confirmed =
        confirm(
            "Delete assignment?"
        );

    if (!confirmed)
        return;

    try {

        await API.request(
            "/api/assignment/delete/" + id,
            "DELETE"
        );

        await loadAssignments();

    }
    catch (err) {

        console.error(err);

        alert("Delete failed");
    }
}

// ================= CREATE MODAL =================

function openCreateModal() {

    document.getElementById(
        "createModal"
    ).style.display = "flex";
}

function closeModal() {

    document.getElementById(
        "createModal"
    ).style.display = "none";

    resetCreateForm();
}

function resetCreateForm() {

    document.getElementById(
        "assignmentName"
    ).value = "";

    document.getElementById(
        "questionCount"
    ).value = "";

    document.getElementById(
        "openTime"
    ).value = "";

    document.getElementById(
        "closeTime"
    ).value = "";

    document.getElementById(
        "showResult"
    ).checked = false;

    document.getElementById(
        "showExplanation"
    ).checked = false;
}

// ================= CREATE =================

async function createAssignment() {

    try {

        const name =
            document
            .getElementById(
                "assignmentName"
            )
            .value
            .trim();

        if (
            !Validator.assignmentName(name)
        ) {

            return alert(
                "Assignment name max 20 characters"
            );
        }

        const questionType =
            document
            .getElementById(
                "questionType"
            )
            .value;

        const questionCount =
            parseInt(
                document
                .getElementById(
                    "questionCount"
                )
                .value
            );

        if (
            !questionCount ||
            questionCount <= 0
        ) {

            return alert(
                "Question count must be > 0"
            );
        }

        const payload = {

            name,

            questionType,

            questionCount,

            openTime:
                document
                .getElementById(
                    "openTime"
                )
                .value || null,

            closeTime:
                document
                .getElementById(
                    "closeTime"
                )
                .value || null,

            showResult:
                document
                .getElementById(
                    "showResult"
                )
                .checked,

            showExplanation:
                document
                .getElementById(
                    "showExplanation"
                )
                .checked
        };

        await API.request(
            "/api/assignment/create",
            "POST",
            payload
        );

        closeModal();

        await loadAssignments();

    }
    catch (err) {

        console.error(err);

        alert("Create failed");
    }
}

// ================= NAVIGATION =================

function openQuestions(id, type) {

    if (!id || !type) {

        alert("Missing assignment info");

        return;
    }
 
    location.href =

        "/pages/teacher/questions.html?assignmentId="
        + id
        + "&type="
        + encodeURIComponent(type);
}

function viewResult(id) {

    location.href =
        "/pages/teacher/results.html?assignmentId="
        + id;
}

// ================= UTIL =================

function formatType(type) {

    if (type === "single_choice")
        return "Single Choice";

    if (type === "fill_blank")
        return "Fill Blank";

    return type;
}

function formatDate(date) {

    if (!date)
        return "--";

    return new Date(date)
        .toLocaleString();
}