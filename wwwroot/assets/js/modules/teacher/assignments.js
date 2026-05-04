window.onload = async () =>
{
    renderLayout("teacher");

    showSkeleton();

    await loadAssignments();
};


// ===== SKELETON =====
function showSkeleton()
{
    document.getElementById("assignmentList").innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-small"></div>
        </div>

        <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-small"></div>
        </div>

        <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-small"></div>
        </div>
    `;
}


// ===== LOAD =====
async function loadAssignments()
{
    try
    {
        showSkeleton();

        const keyword =
            document.getElementById("keyword")?.value || "";

        const assignments =
            await API.request(
                "/assignment/my-assignments?keyword=" + keyword
            );

        render(assignments);
    }
    catch(err)
    {
        console.error(err);
    }
}


// ===== RENDER =====
function render(assignments) {
    const container = document.getElementById("assignmentList");
    container.innerHTML = "";

    if (!assignments || assignments.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No assignments
                </td>
            </tr>
        `;
        return;
    }

    assignments.forEach(a => {

        const count =
            a.questionCount ??
            a.totalQuestions ??
            (a.questions ? a.questions.length : 0);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${a.name}</td>
            <td>${count}</td>
            <td>${a.type}</td>
            <td>
                <button onclick="openQuestions(${a.id}, '${a.type}')">Q</button>
                <button onclick="assignClass(${a.id})">Assign</button>
                <button onclick="viewResult(${a.id})">Result</button>
                <button onclick="deleteAssignment(${a.id})">Delete</button>
            </td>
        `;

        container.appendChild(row);
    });
}
// ===== CREATE MODAL =====
function openCreateModal()
{
    document.getElementById("createModal").style.display = "flex";
}

function closeModal()
{
    document.getElementById("createModal").style.display = "none";
}


// ===== CREATE =====
async function createAssignment()
{
    try
    {
        const name =
            document.getElementById("assignmentName").value.trim();

        if (!Validator.assignmentName(name))
            return alert("Assignment name max 20 characters");

        const questionType =
            document.getElementById("questionType").value;

        const questionCount =
            document.getElementById("questionCount").value;

        if (!questionCount || questionCount <= 0)
            return alert("Question count must be > 0");

        const openTime =
            document.getElementById("openTime").value || null;

        const closeTime =
            document.getElementById("closeTime").value || null;

        const showResult =
            document.getElementById("showResult").checked;

        const showExplanation =
            document.getElementById("showExplanation").checked;

        await API.request("/assignment/create", "POST", {
            name,
            questionType,
            questionCount,
            openTime,
            closeTime,
            showResult,
            showExplanation
        });

        closeModal();
        loadAssignments();
    }
    catch(err)
    {
        console.error(err);
        alert("Create failed");
    }
}


// ===== DELETE =====
async function deleteAssignment(id)
{
    if (!confirm("Delete assignment?"))
        return;

    await API.request(
        "/assignment/delete/" + id,
        "DELETE"
    );

    loadAssignments();
}


// ===== NAVIGATION =====
function openQuestions(id, type)
{
    location.href =
        "/pages/teacher/questions.html?assignmentId="
        + id
        + "&type="
        + type;
}

function viewResult(id)
{
    location.href =
        "/pages/teacher/results.html?assignmentId=" + id;
}

function assignClass(id)
{
    location.href =
        "/pages/teacher/assign-class.html?assignmentId=" + id;
}