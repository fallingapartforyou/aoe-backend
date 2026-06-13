const params = new URLSearchParams(location.search);

const assignmentId =
    params.get("assignmentId");

const assignmentType =
    params.get("type");

let assignedClasses = [];
let editingId = null;
let currentQuestions = [];
let allQuestions = [];
let assignmentInfo = null;
let aiQuestions = [];
let lastAIPayload = null;

// ================= INIT =================

if (!assignmentId || !assignmentType) {

    alert("Missing assignment info");

    location.href =
        "/pages/teacher/assignments.html";
}

window.onload = async () => {

    renderLayout("teacher");

    setupAssignmentTypeUI();

    showSkeleton();

    await loadAssignmentInfo();

    await loadQuestions();

    await loadAssignedClasses();

    await loadClasses();
};

// ================= UI =================

function setupAssignmentTypeUI() {

    const label =
        document.getElementById(
            "assignmentTypeLabel"
        );

    label.innerText =
        "Question Type: "
        + assignmentType.replaceAll("_", " ");

    if (
        assignmentType ===
        "single_choice"
    ) {

        document
            .getElementById("optionsBox")
            .style.display = "grid";

        document
            .getElementById("fillAnswerBox")
            .style.display = "none";
    }

    else {

        document
            .getElementById("optionsBox")
            .style.display = "none";

        document
            .getElementById("fillAnswerBox")
            .style.display = "block";
    }
}

function showSkeleton() {

    document
        .getElementById("questionList")
        .innerHTML = `
            <tr>
                <td colspan="5">
                    Loading...
                </td>
            </tr>

            <tr>
                <td colspan="5">
                    Loading...
                </td>
            </tr>
        `;
}

// ================= STATS =================

function updateStats() {

    const total =
        currentQuestions.length;

    const totalChoice =
        currentQuestions.filter(
            x => x.type === "single_choice"
        ).length;

    const totalFill =
        currentQuestions.filter(
            x => x.type === "fill_blank"
        ).length;

    document
        .getElementById("totalQuestions")
        .innerText = total;

    document
        .getElementById("totalChoice")
        .innerText = totalChoice;

    document
        .getElementById("totalFill")
        .innerText = totalFill;
}

function updateQuestionCounter() {

    if (!assignmentInfo)
        return;

    const current =
        currentQuestions.length;

    const max =
        assignmentInfo.questionCount;

    const counter =
        document.getElementById(
            "questionCounter"
        );

    counter.innerText =
        `${current} / ${max} Questions`;

    if (current >= max) {

        counter.classList.add(
            "danger-text"
        );

        document
            .getElementById("createBtn")
            .disabled = true;
    }

    else {

        counter.classList.remove(
            "danger-text"
        );

        document
            .getElementById("createBtn")
            .disabled = false;
    }
}

// ================= LOAD =================

async function loadAssignmentInfo() {

    try {

        assignmentInfo =
            await API.request(
                "/api/assignment/" + assignmentId
            );

        updateQuestionCounter();

    }

    catch (err) {

        console.error(err);
    }
}

async function loadQuestions()
{
    try
    {
        showSkeleton();

        const data =
            await API.request(
                "/api/question/by-assignment/"
                + assignmentId
            );

        allQuestions = data;

        currentQuestions = [...data];

        applyFilters();

        updateStats();

        updateQuestionCounter();
    }
    catch (err)
    {
        console.error(err);
    }
}

// ================= RENDER =================

function renderQuestions(list) {

    const container =
        document.getElementById(
            "questionList"
        );

    container.innerHTML = "";

    if (!list || list.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5">
                    No questions found
                </td>
            </tr>
        `;

        return;
    }

    list.forEach((q, index) => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>
                ${index + 1}
            </td>

            <td>
                <div class="question-title">
                    ${q.content}
                </div>

                ${
                    q.options?.length
                    ? `
                        <div class="question-options">
                            ${q.options.map(o => `
                                <div class="
                                    option-item
                                    ${o.label === q.correctAnswer
                                        ? "correct-option"
                                        : ""}
                                ">
                                    <b>${o.label}.</b>
                                    ${o.content}
                                </div>
                            `).join("")}
                        </div>
                    `
                    : ""
                }

                ${
                    q.explanation
                    ? `
                        <div class="question-explanation">
                            ${q.explanation}
                        </div>
                    `
                    : ""
                }
            </td>

            <td>
                <span class="answer-badge">
                    ${q.correctAnswer}
                </span>
            </td>

            <td>
            <span class="score-badge">
            ${q.score ?? 0}
            </span>
            </td>

            <td>

                <div class="table-actions">

                    <button class="btn-edit"
                        onclick="openEdit(${q.id})">

                        Edit

                    </button>

                    <button class="btn-ai"
                        onclick="generateExplanation(event,${q.id})">

                        AI Explain

                    </button>

                    <button
                        class="btn-danger"
                        onclick="deleteQuestion(${q.id})">

                        Delete

                    </button>

                </div>

            </td>
        `;

        container.appendChild(tr);
    });
}

function applyFilters()
{
    const keyword =
        document
        .getElementById(
            "questionSearch"
        )
        .value
        .toLowerCase();

    const sort =
        document
        .getElementById(
            "questionSort"
        )
        .value;

    let list =
        [...allQuestions];

    // SEARCH

    if(keyword)
    {
        list =
            list.filter(q =>
                q.content
                .toLowerCase()
                .includes(keyword)
            );
    }

    // SORT

    switch(sort)
    {
        case "az":

            list.sort(
                (a,b) =>
                a.content.localeCompare(
                    b.content
                )
            );

            break;

        case "za":

            list.sort(
                (a,b) =>
                b.content.localeCompare(
                    a.content
                )
            );

            break;

        case "oldest":

            list.sort(
                (a,b) =>
                a.id - b.id
            );

            break;

        default:

            list.sort(
                (a,b) =>
                b.id - a.id
            );
    }

    currentQuestions = list;

    renderQuestions(list);
}
// ================= MODAL =================

function toggleCreate() {

    editingId = null;

    resetForm();

    document
        .getElementById("modalTitle")
        .innerText =
            "Create Question";

    document
        .getElementById("editModal")
        .style.display = "flex";
}

function openEdit(id) {

    const q =
        currentQuestions.find(
            x => x.id === id
        );

    if (!q)
        return;

    editingId = id;

    document
        .getElementById("modalTitle")
        .innerText =
            "Edit Question";

    document
        .getElementById("content")
        .value = q.content;

    document
        .getElementById("explanation")
        .value =
            q.explanation || "";

    if (
        assignmentType ===
        "single_choice"
    ) {

        document
            .getElementById("correctAnswer")
            .value =
                q.correctAnswer;

        q.options?.forEach(o => {

            const input =
                document.getElementById(
                    o.label
                );

            if (input)
                input.value = o.content;
        });
    }

    else {

        document
            .getElementById(
                "fillCorrectAnswer"
            )
            .value =
                q.correctAnswer;
    }

    document
        .getElementById("editModal")
        .style.display = "flex";
}

function closeEdit() {

    document
        .getElementById("editModal")
        .style.display = "none";

    editingId = null;
}

// ================= CREATE / UPDATE =================

async function createQuestion() {

    try {

        if (
            currentQuestions.length >=
            assignmentInfo.questionCount
            &&
            !editingId
        ) {

            alert(
                "Maximum question count reached"
            );

            return;
        }

        const content =
            document
            .getElementById("content")
            .value
            .trim();

        if (!content)
            return alert(
                "Content required"
            );

        let correctAnswer = "";

        const payload = {

            assignmentId,
            type: assignmentType,
            content,

            explanation:
                document
                .getElementById(
                    "explanation"
                )
                .value
                .trim()
        };

        if (
            assignmentType ===
            "single_choice"
        ) {

            const A =
                document
                .getElementById("A")
                .value
                .trim();

            const B =
                document
                .getElementById("B")
                .value
                .trim();

            const C =
                document
                .getElementById("C")
                .value
                .trim();

            const D =
                document
                .getElementById("D")
                .value
                .trim();

            if (!A || !B || !C || !D)
                return alert(
                    "All options required"
                );

            correctAnswer =
                document
                .getElementById(
                    "correctAnswer"
                )
                .value;

            payload.correctAnswer =
                correctAnswer;

            let question;

            if (editingId) {

                await API.request(
                    "/api/question/update/"
                    + editingId,
                    "PUT",
                    payload
                );

                await API.request(
                    "/api/question/update-options/"
                    + editingId,
                    "PUT",
                    {
                        A,
                        B,
                        C,
                        D
                    }
                );
            }

            else {

                question =
                    await API.request(
                        "/api/question/create",
                        "POST",
                        payload
                    );

                await API.request(
                    "/api/question/add-options",
                    "POST",
                    {
                        questionId:
                            question.id,
                        A,
                        B,
                        C,
                        D
                    }
                );
            }
        }

        else {

            correctAnswer =
                document
                .getElementById(
                    "fillCorrectAnswer"
                )
                .value
                .trim();

            payload.correctAnswer =
                correctAnswer;

            if (editingId) {

                await API.request(
                    "/api/question/update/"
                    + editingId,
                    "PUT",
                    payload
                );
            }

            else {

                await API.request(
                    "/api/question/create",
                    "POST",
                    payload
                );
            }
        }

        closeEdit();

        resetForm();

        await loadQuestions();
    }

    catch (err) {

        console.error(err);

        alert(
            err?.message ||
            "Save failed"
        );
    }
}

// ================= DELETE =================

async function deleteQuestion(id) {

    const confirmed =
        confirm(
            "Delete this question?"
        );

    if (!confirmed)
        return;

    try {

        await API.request(
            "/api/question/delete/" + id,
            "DELETE"
        );

        await loadQuestions();
    }

    catch (err) {

        console.error(err);

        alert("Delete failed");
    }
}

// ================= RESET =================

function resetForm() {

    document
        .getElementById("content")
        .value = "";

    document
        .getElementById("explanation")
        .value = "";

    [
        "A",
        "B",
        "C",
        "D"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el)
            el.value = "";
    });

    const correct =
        document.getElementById(
            "correctAnswer"
        );

    if (correct)
        correct.value = "";

    const fill =
        document.getElementById(
            "fillCorrectAnswer"
        );

    if (fill)
        fill.value = "";
}

// ================= ASSIGN =================

function toggleAssign() {

    document
        .getElementById("assignModal")
        .classList
        .add("show");
}

function closeAssignModal() {

    document
        .getElementById("assignModal")
        .classList
        .remove("show");
}

async function loadClasses() {

    try {

        const classes =
            await API.request(
                "/api/class/my-classes"
            );

        renderClasses(classes);
    }

    catch (err) {

        console.error(err);
    }
}

async function loadAssignedClasses()
{
    try
    {
        assignedClasses =
            await API.request(
                "/api/assignment/classes/" +
                assignmentId
            );
    }
    catch(err)
    {
        console.error(err);
    }
}

function renderClasses(classes) {

    const container =
        document.getElementById(
            "classList"
        );

    container.innerHTML = "";

    classes.forEach(cls => {

        const alreadyAssigned = assignedClasses.some(
        x => x.id === cls.id);

        const div =
            document.createElement("div");

        div.className =
            "assign-class-card";

        div.innerHTML = `
            <div>

                <h3>
                    ${cls.name}
                </h3>

                <p>
                    ${cls.classCode || ""}
                </p>

            </div>

            <button
    id="assignBtn-${cls.id}"
    ${alreadyAssigned ? "disabled" : ""}>

    ${
        alreadyAssigned
            ? "Assigned"
            : "Assign"
    }

</button>
        `;

        const btn =
            div.querySelector("button");

            if(alreadyAssigned) {
             btn.classList.add("assigned");
            }

        btn.onclick =
            () => assign(cls.id);

        container.appendChild(div);
    });
}

async function assign(classId) {

    try {

        const btn =
            document.getElementById(
                "assignBtn-" + classId
            );

        btn.disabled = true;

        btn.innerText =
            "Assigning...";

        await API.request(
            "/api/assignment/assign-to-class",
            "POST",
            {
                assignmentId,
                classId
            }
        );

        btn.innerText =
            "Assigned";

        btn.classList.add(
            "assigned"
        );
    }

    catch (err) {

        console.error(err);

        alert(
            err?.message ||
            "Assign failed"
        );
    }
}

// ================= AI =================

async function generateAIQuestions() {

    try {

        const topic =
            document
            .getElementById("aiTopic")
            .value
            .trim();

        const difficulty =
            document
            .getElementById(
                "aiDifficulty"
            )
            .value;

            lastAIPayload ={
             topic,
             difficulty,
             type: assignmentType
            };

        const count =
            parseInt(
                document
                .getElementById(
                    "aiCount"
                )
                .value
            );

        if (!topic)
            return alert(
                "Topic required"
            );

        const result =
            await API.request(
                "/api/ai/generate-questions",
                "POST",
                {
                    topic,
                    difficulty,
                    type: assignmentType,
                    count
                }
            );

        aiQuestions = result.map(q => ({...q, selected: true}));

        closeAIModal();

        renderAIPreview();
    }

    catch (err) {

        console.error(err);

        alert(
            "AI generation failed"
        );
    }
}

function renderAIPreview() {

    const box =
        document.getElementById(
            "aiPreviewBox"
        );

    const list =
        document.getElementById(
            "aiPreviewList"
        );

    list.innerHTML = "";

    if (!aiQuestions.length) {

        box.style.display = "none";

        return;
    }

    box.style.display = "block";

    const selectedCount =
        aiQuestions.filter(x =>
            x.selected
        ).length;

    list.innerHTML = `
        <div class="ai-summary">

            Selected:
            ${selectedCount}
            /
            ${aiQuestions.length}

        </div>
    `;

    aiQuestions.forEach((q, index) => {

        const div =
            document.createElement("div");

        div.className =
            "ai-preview-item";

        div.innerHTML = `

            <div class="ai-preview-top">

                <div>

                    <div class="ai-preview-question">

                        Question ${index + 1}

                    </div>

                    <div class="ai-preview-content">

                        ${q.content}

                    </div>

                    <div class="ai-preview-answer">

                        Correct:
                        ${q.correctAnswer}

                    </div>

                </div>

                <label class="ai-keep-box">

                    <input
                        type="checkbox"
                        ${q.selected ? "checked" : ""}
                        onchange="toggleAIQuestion(${index})">

                    <span class="custom-check"></span>

                    <span class="keep-label">

                        Keep this question

                    </span>

                </label>

            </div>

            <div class="ai-actions">

                <button
                    class="btn-secondary"
                    onclick="regenerateQuestion(${index})">

                    Regenerate

                </button>

            </div>
        `;

        list.appendChild(div);
    });
}

async function saveAIQuestions() {

    const selectedQuestions =
    aiQuestions.filter(
        q => q.selected
    );

if(!selectedQuestions.length)
{
    alert(
        "No question selected"
    );

    return;
}

    try {

        for (const q of selectedQuestions) {

            const created =
                await API.request(
                    "/api/question/create",
                    "POST",
                    {
                        assignmentId,
                        type: assignmentType,
                        content: q.content,
                        correctAnswer:
                            q.correctAnswer,
                        explanation:
                            q.explanation
                    }
                );

            if (
                assignmentType ===
                "single_choice"
            ) {

                const A =
                    q.options.find(
                        x => x.label === "A"
                    )?.content || "";

                const B =
                    q.options.find(
                        x => x.label === "B"
                    )?.content || "";

                const C =
                    q.options.find(
                        x => x.label === "C"
                    )?.content || "";

                const D =
                    q.options.find(
                        x => x.label === "D"
                    )?.content || "";

                await API.request(
                    "/api/question/add-options",
                    "POST",
                    {
                        questionId:
                            created.id,
                        A,
                        B,
                        C,
                        D
                    }
                );
            }
        }

        alert(
            "Saved successfully"
        );

        clearAIPreview();

        await loadQuestions();
    }

    catch (err) {

        console.error(err);

        alert("Save failed");
    }
}

function clearAIPreview() {

    aiQuestions = [];

    document
        .getElementById(
            "aiPreviewList"
        )
        .innerHTML = "";

    document
        .getElementById(
            "aiPreviewBox"
        )
        .style.display = "none";
}

function openAIModal()
{
    document
        .getElementById("aiModal")
        .classList
        .add("show");
}

function closeAIModal()
{
    document
        .getElementById("aiModal")
        .classList
        .remove("show");
}
// ================= AI EXPLANATION =================

async function generateExplanation(event,id) {
    const btn =
    event.currentTarget;
if(btn.disabled)
    return;
btn.disabled = true;

btn.innerText =
    "Generating...";

    try {

        const q =
    currentQuestions.find(
        x => x.id === id
    );

if (!q)
{
    alert("Question not found");
    return;
}

        const payload = {
    question: q.content,
    correctAnswer: q.correctAnswer
};

if(
    q.type === "single_choice"
    &&
    q.options?.length
)
{
    payload.options =
        q.options.map(o => ({
            label: o.label,
            content: o.content
        }));
}

const result =
    await API.request(
        "/api/ai/generate-explanation",
        "POST",
        payload
    );
    const explanation =
    typeof result === "string"
        ? result
        : result.explanation;

        if(
    !explanation
    ||
    !explanation.trim()
)
{
    throw new Error(
        "AI returned empty explanation"
    );
}

        await API.request(
    "/api/question/update/" + id,
    "PUT",
    {
        assignmentId,
        type: q.type,
        content: q.content,
        correctAnswer: q.correctAnswer,
        explanation
    }
);

        alert(
            "Explanation generated"
        );

        await loadQuestions();
    }

    catch (err) {

        console.error(err);

        alert(
            "Generate failed"
        );
    }
    finally
{
    btn.disabled = false;

    btn.innerText =
        "AI Explain";
}
}

function toggleAIQuestion(index)
{
    aiQuestions[index].selected =
        !aiQuestions[index].selected;
}

async function regenerateQuestion(index)
{
    try
    {
        if(!lastAIPayload)
            return;

        const result =
            await API.request(
                "/api/ai/generate-questions",
                "POST",
                {
                    ...lastAIPayload,
                    count: 1
                }
            );

        if(
            !result ||
            !result.length
        )
        {
            alert(
                "AI returned empty result"
            );

            return;
        }

        aiQuestions[index] =
        {
            ...result[0],
            selected: true
        };

        renderAIPreview();
    }
    catch(err)
    {
        console.error(err);

        alert(
            "Regenerate failed"
        );
    }
}