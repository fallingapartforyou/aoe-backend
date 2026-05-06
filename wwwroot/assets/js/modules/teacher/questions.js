const params = new URLSearchParams(location.search);

const assignmentId = params.get("assignmentId");
const assignmentType = params.get("type");

// ===== GUARD =====
if (!assignmentId || !assignmentType) {
    alert("Missing assignment info");
    location.href = "/pages/teacher/assignments.html";
}

// ===== INIT =====
window.onload = async () => {
    renderLayout("teacher");

    setupAssignmentTypeUI();
    showSkeleton();

    await loadQuestions();
    await loadClasses();
};

// ===== TOGGLE UI =====
function toggleCreate() {
    const box = document.getElementById("createBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function toggleAssign() {
    const box = document.getElementById("assignBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

// ===== SETUP TYPE =====
function setupAssignmentTypeUI() {
    document.getElementById("assignmentTypeLabel").innerText =
        "Question type: " + assignmentType.replace("_", " ");

    if (assignmentType === "single_choice") {
        document.getElementById("optionsBox").style.display = "block";
        document.getElementById("fillAnswerBox").style.display = "none";
    } else {
        document.getElementById("optionsBox").style.display = "none";
        document.getElementById("fillAnswerBox").style.display = "block";
    }
}

// ===== SKELETON =====
function showSkeleton() {
    document.getElementById("questionList").innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;
}

// ===== CREATE QUESTION =====
async function createQuestion() {
    try {
        const content = document.getElementById("content").value.trim();
        if (!content) return alert("Question content is required");

        let correctAnswer = "";
        let payload = {
            assignmentId,
            type: assignmentType,
            content
        };

        // ===== SINGLE CHOICE =====
        if (assignmentType === "single_choice") {
            const A = document.getElementById("A").value.trim();
            const B = document.getElementById("B").value.trim();
            const C = document.getElementById("C").value.trim();
            const D = document.getElementById("D").value.trim();

            if (!A || !B || !C || !D)
                return alert("All 4 options are required");

            correctAnswer =
                document.getElementById("correctAnswer").value;

            payload.correctAnswer = correctAnswer;

            // create question first
            const question = await API.request(
                "/question/create",
                "POST",
                payload
            );

            // add options
            await API.request("/question/add-options", "POST", {
                questionId: question.id,
                A, B, C, D
            });
        }

        // ===== FILL BLANK =====
        else {
            correctAnswer =
                document.getElementById("fillCorrectAnswer").value.trim();

            if (!correctAnswer)
                return alert("Correct answer required");

            payload.correctAnswer = correctAnswer;

            await API.request(
                "/question/create",
                "POST",
                payload
            );
        }

        const explanation =
            document.getElementById("explanation").value.trim();

        // optional update explanation (nếu backend tách)
        if (explanation) {
            // nếu backend hỗ trợ update riêng thì gọi thêm API
            // còn không thì nên gộp vào create
        }

        resetForm();
        alert("Created successfully");
        loadQuestions();

    } catch (err) {
        console.error(err);
        alert("Create failed");
    }
}

// ===== RESET FORM =====
function resetForm() {
    document.getElementById("content").value = "";
    document.getElementById("explanation").value = "";

    if (assignmentType === "single_choice") {
        document.getElementById("correctAnswer").value = "A";

        ["A", "B", "C", "D"].forEach(id => {
            document.getElementById(id).value = "";
        });
    } else {
        document.getElementById("fillCorrectAnswer").value = "";
    }
}

// ===== LOAD QUESTIONS =====
async function loadQuestions() {
    showSkeleton();

    try {
        const data =
            await API.request("/question/by-assignment/" + assignmentId);

        renderQuestions(data);

    } catch (err) {
        console.error(err);
        document.getElementById("questionList").innerHTML =
            `<div class="card">Failed to load questions</div>`;
    }
}

// ===== RENDER QUESTIONS =====
function renderQuestions(list) {
    const container = document.getElementById("questionList");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div class="card">No questions yet</div>
        `;
        return;
    }

    list.forEach((q, index) => {
        const card = document.createElement("div");
        card.className = "card";

        let html = `
            <div class="question-title">
                Question ${index + 1}
            </div>

            <div class="question-content">
                ${q.content}
            </div>
        `;

        // ===== SINGLE CHOICE =====
        if (q.type === "single_choice") {
            const letters = ["A","B","C","D"];

            html += `<div class="options">`;

            if (q.options?.length) {
                q.options.forEach((o, i) => {
                    const isCorrect =
                        letters[i] === q.correctAnswer;

                    html += `
                        <div class="option ${isCorrect ? "correct" : ""}">
                            <b>${letters[i]}.</b> ${o.content}
                        </div>
                    `;
                });
            } else {
                html += `<p style="color:red">No options found</p>`;
            }

            html += `</div>`;
        }

        // ===== FILL BLANK =====
        else {
            html += `
                <div class="option correct">
                    Answer: ${q.correctAnswer}
                </div>
            `;
        }

        // ===== EXPLANATION =====
        if (q.explanation) {
            html += `
                <div class="explanation">
                    ${q.explanation}
                </div>
            `;
        }

        // ===== ACTION =====
        html += `
            <div class="question-actions">
                <button onclick="editQuestion(${q.id})">
                    Edit
                </button>

                <button class="delete"
                        onclick="deleteQuestion(${q.id})">
                    Delete
                </button>
            </div>
        `;

        card.innerHTML = html;
        container.appendChild(card);
    });
}

// ===== DELETE =====
async function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return;

    await API.request("/question/delete/" + id, "DELETE");
    loadQuestions();
}

// ===== LOAD CLASSES =====
async function loadClasses() {
    try {
        const classes = await API.request("/class/my-classes");

        const container = document.getElementById("classList");
        container.innerHTML = "";

        classes.forEach(cls => {
            const div = document.createElement("div");
            div.className = "assign-item";

            div.innerHTML = `
                <span>${cls.name}</span>
                <button id="btn-${cls.id}"
                        onclick="assign(${cls.id})">
                    Assign
                </button>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
    }
}

// ===== ASSIGN =====
async function assign(classId) {
    const btn = document.getElementById(`btn-${classId}`);

    btn.disabled = true;
    btn.innerText = "Assigning...";

    try {
        await API.request(
            "/assignment/assign-to-class",
            "POST",
            { assignmentId, classId }
        );

        btn.innerText = "Assigned";
        btn.classList.add("assigned");

    } catch (err) {
        btn.disabled = false;
        btn.innerText = "Assign";
        alert("Assign failed");
    }
}