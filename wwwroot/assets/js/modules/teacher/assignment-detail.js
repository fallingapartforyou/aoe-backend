const params = new URLSearchParams(location.search);

const assignmentId = params.get("assignmentId");
const assignmentType = params.get("type");

let assignMode = false;
let editingId = null;

if (!assignmentId) {
    alert("Missing assignmentId");
    history.back();
}

window.onload = async () => {
    renderLayout("teacher");
    await loadQuestions();
};

// ================= MODE =================
function toggleAssignMode()
{
    assignMode = !assignMode;

    document.getElementById("questionSection").style.display =
        assignMode ? "none" : "block";

    document.getElementById("assignSection").style.display =
        assignMode ? "block" : "none";

    if(assignMode) loadClasses();
}

// ================= MODAL =================
function openCreateModal(q = null)
{
    document.getElementById("createModal").style.display = "flex";

    editingId = q ? q.id : null;

    if(q)
    {
        document.getElementById("modalTitle").innerText = "Edit Question";
        document.getElementById("content").value = q.content;
        document.getElementById("explanation").value = q.explanation || "";
    }
    else
    {
        resetForm();
    }

    if (assignmentType === "single_choice")
    {
        optionsBox.style.display = "block";
        fillAnswerBox.style.display = "none";
    }
    else
    {
        optionsBox.style.display = "none";
        fillAnswerBox.style.display = "block";
    }
}

function closeModal()
{
    document.getElementById("createModal").style.display = "none";
}

// ================= QUESTIONS =================
async function loadQuestions()
{
    const data =
        await API.request("/question/by-assignment/" + assignmentId);

    renderQuestions(data);
}

function renderQuestions(list)
{
    const container = document.getElementById("questionSection");
    container.innerHTML = "";

    list.forEach((q, index) =>
    {
        const div = document.createElement("div");
        div.className = "question-card";

        let optionsHtml = "";

        if(q.options)
        {
            q.options.forEach((o,i)=>
            {
                const letters=["A","B","C","D"];
                const correct = letters[i] === q.correctAnswer;

                optionsHtml += `
                    <div class="option ${correct?"correct":""}">
                        ${letters[i]}. ${o.content}
                    </div>
                `;
            });
        }

        div.innerHTML = `
            <div class="question-title">
                Q${index+1}. ${q.content}
            </div>

            <div>${optionsHtml}</div>

            <div class="question-footer">
                <span>${q.explanation||""}</span>

                <div>
                    <button onclick='editQuestion(${JSON.stringify(q)})'>Edit</button>
                    <button onclick="deleteQuestion(${q.id})">Delete</button>
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}

function editQuestion(q)
{
    openCreateModal(q);
}

async function submitQuestion()
{
    const content = document.getElementById("content").value.trim();
    if(!content) return alert("Content required");

    let correctAnswer;

    if(assignmentType === "single_choice")
    {
        const A = A.value.trim();
        const B = B.value.trim();
        const C = C.value.trim();
        const D = D.value.trim();

        if(!A||!B||!C||!D)
            return alert("All options required");

        correctAnswer = correctAnswer.value;
    }
    else
    {
        correctAnswer = fillCorrectAnswer.value.trim();
    }

    const explanation = explanation.value.trim();

    if(editingId)
    {
        await API.request("/question/update","PUT",{
            id: editingId,
            content,
            correctAnswer,
            explanation
        });
    }
    else
    {
        const q = await API.request("/question/create","POST",{
            assignmentId,
            type: assignmentType,
            content,
            correctAnswer,
            explanation
        });

        if(assignmentType==="single_choice")
        {
            await API.request("/question/add-options","POST",{
                questionId:q.id,
                A:A.value,B:B.value,C:C.value,D:D.value
            });
        }
    }

    closeModal();
    loadQuestions();
}

async function deleteQuestion(id)
{
    if(!confirm("Delete?")) return;
    await API.request("/question/delete/"+id,"DELETE");
    loadQuestions();
}

// ================= ASSIGN =================
async function loadClasses()
{
    const classes = await API.request("/class/my-classes");
    renderClasses(classes);
}

function renderClasses(classes)
{
    const container = document.getElementById("assignSection");
    container.innerHTML = "";

    classes.forEach(cls =>
    {
        const assigned = cls.isAssigned;

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${cls.name}</h3>
            <button ${assigned?"disabled":""}>
                ${assigned?"Assigned":"Assign"}
            </button>
        `;

        if(!assigned)
        {
            div.querySelector("button").onclick =
                () => assign(cls.id);
        }

        container.appendChild(div);
    });
}

async function assign(classId)
{
    await API.request("/assignment/assign-to-class","POST",{
        assignmentId: parseInt(assignmentId),
        classId
    });

    loadClasses();
}

// ================= UTIL =================
function resetForm()
{
    content.value="";
    explanation.value="";
    fillCorrectAnswer.value="";

    if(A)
    {
        A.value="";
        B.value="";
        C.value="";
        D.value="";
    }
}