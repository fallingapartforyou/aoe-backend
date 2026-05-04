const params = new URLSearchParams(location.search);

const assignmentId = params.get("assignmentId");
const assignmentType = params.get("type");

if (!assignmentId || !assignmentType) {
    alert("Missing assignment info");
    location.href = "/pages/teacher/assignments.html";
}

window.onload = async () => {
    renderLayout("teacher");

    setupAssignmentTypeUI();
    showSkeleton();

    await loadQuestions();
    await loadClasses();
};

// ===== TOGGLE =====
function toggleCreate() {
    const box = document.getElementById("createBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function toggleAssign() {
    const box = document.getElementById("assignBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

// ===== TYPE UI =====
function setupAssignmentTypeUI() {
    document.getElementById("assignmentTypeLabel").innerText =
        "Question type: " + assignmentType;

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

// ===== CREATE =====
async function createQuestion() {
    try {
        const content = document.getElementById("content").value.trim();
        if (!content) return alert("Content required");

        let correctAnswer;

        if (assignmentType === "single_choice") {
            const A = document.getElementById("A").value.trim();
            const B = document.getElementById("B").value.trim();
            const C = document.getElementById("C").value.trim();
            const D = document.getElementById("D").value.trim();

            if (!A || !B || !C || !D)
                return alert("All options required");

            correctAnswer =
                document.getElementById("correctAnswer").value;
        } else {
            correctAnswer =
                document.getElementById("fillCorrectAnswer").value.trim();

            if (!correctAnswer)
                return alert("Correct answer required");
        }

        const explanation =
            document.getElementById("explanation").value.trim();

        const question = await API.request(
            "/question/create",
            "POST",
            {
                assignmentId,
                type: assignmentType,
                content,
                correctAnswer,
                explanation
            }
        );

        if (assignmentType === "single_choice") {
            await API.request("/question/add-options", "POST", {
                questionId: question.id,
                A: document.getElementById("A").value.trim(),
                B: document.getElementById("B").value.trim(),
                C: document.getElementById("C").value.trim(),
                D: document.getElementById("D").value.trim()
            });
        }

        resetForm();
        alert("Created");
        loadQuestions();

    } catch (err) {
        console.error(err);
        alert("Create failed");
    }
}

// ===== RESET =====
function resetForm() {
    document.getElementById("content").value = "";
    document.getElementById("correctAnswer").value = "";
    document.getElementById("fillCorrectAnswer").value = "";
    document.getElementById("explanation").value = "";

    ["A","B","C","D"].forEach(id => {
        if (document.getElementById(id))
            document.getElementById(id).value = "";
    });
}

// ===== LOAD QUESTIONS =====
async function loadQuestions() {
    showSkeleton();

    const data =
        await API.request("/question/by-assignment/" + assignmentId);

    renderQuestions(data);
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
        card.className = "question-card";

        let html = `
            <div class="question-header">
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

            if (q.options && q.options.length > 0) {
                q.options.forEach((o, i) => {
                    const isCorrect =
                        letters[i] === q.correctAnswer;

                    html += `
                        <div class="option ${isCorrect ? "correct" : ""}">
                            ${letters[i]}. ${o.content}
                        </div>
                    `;
                });
            } else {
                html += `<p style="color:red">No options</p>`;
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

                <button class="danger"
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
    if (!confirm("Delete?")) return;

    await API.request("/question/delete/" + id, "DELETE");
    loadQuestions();
}

// ===== LOAD CLASSES =====
async function loadClasses() {
    const classes = await API.request("/class/my-classes");

    const container = document.getElementById("classList");
    container.innerHTML = "";

    classes.forEach(cls => {
        const div = document.createElement("div");
        div.className = "assign-item";

        div.innerHTML = `
            <span>${cls.name}</span>
            <button id="btn-${cls.id}" onclick="assign(${cls.id})">
                Assign
            </button>
        `;

        container.appendChild(div);
    });
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
        alert("Failed");
    }
}