const params =
new URLSearchParams(window.location.search);

const assignmentId =
params.get("assignmentId");

const assignmentType =
params.get("type");


if(!assignmentId || !assignmentType)
{
alert("Missing assignment info");

location.href =
"/pages/teacher/assignments.html";
}


window.onload = async () =>
{
renderLayout("teacher");

setupAssignmentTypeUI();

showSkeleton();

await loadQuestions();
};



function setupAssignmentTypeUI()
{
document
.getElementById("assignmentTypeLabel")
.innerText =
"Question type: " + assignmentType;


if(assignmentType === "single_choice")
{
document
.getElementById("optionsBox")
.style.display = "block";

document
.getElementById("fillAnswerBox")
.style.display = "none";
}
else
{
document
.getElementById("optionsBox")
.style.display = "none";

document
.getElementById("fillAnswerBox")
.style.display = "block";
}
}



function showSkeleton()
{
document.getElementById("questionList").innerHTML =
`
<div class="skeleton-card"></div>
<div class="skeleton-card"></div>
<div class="skeleton-card"></div>
`;
}



async function createQuestion()
{
try
{

const content =
document.getElementById("content").value.trim();

if(!content)
return alert("Content required");


let correctAnswer;

// ===== SINGLE CHOICE =====
if(assignmentType === "single_choice")
{
const A = document.getElementById("A").value.trim();
const B = document.getElementById("B").value.trim();
const C = document.getElementById("C").value.trim();
const D = document.getElementById("D").value.trim();

if(!A || !B || !C || !D)
return alert("All options A B C D are required");

correctAnswer =
document.getElementById("correctAnswer").value;

if(!correctAnswer)
return alert("Select correct answer");
}
else
{
correctAnswer =
document.getElementById("fillCorrectAnswer").value.trim();

if(!correctAnswer)
return alert("Correct answer required");
}


const explanation =
document.getElementById("explanation").value.trim();


// ===== CREATE QUESTION =====
const question =
await API.request(
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


// ===== ADD OPTIONS =====
if(assignmentType === "single_choice")
{
await API.request(
"/question/add-options",
"POST",
{
questionId: question.id,
A: document.getElementById("A").value.trim(),
B: document.getElementById("B").value.trim(),
C: document.getElementById("C").value.trim(),
D: document.getElementById("D").value.trim()
}
);
}


// ===== RESET FORM =====
resetForm();


alert("Created successfully");

loadQuestions();

}
catch(err)
{
console.error(err);
alert("Create failed");
}
}



function resetForm()
{
document.getElementById("content").value = "";
document.getElementById("correctAnswer").value = "";
document.getElementById("fillCorrectAnswer").value = "";
document.getElementById("explanation").value = "";

if(document.getElementById("A"))
{
document.getElementById("A").value = "";
document.getElementById("B").value = "";
document.getElementById("C").value = "";
document.getElementById("D").value = "";
}
}



async function loadQuestions()
{
showSkeleton();

const data =
await API.request(
"/question/by-assignment/" + assignmentId
);

render(data);
}



function render(list)
{
const container =
document.getElementById("questionList");

container.innerHTML = "";

list.forEach(q =>
{

const card =
document.createElement("div");

card.className = "card";

card.innerHTML =
`
<h3>${q.type}</h3>
<p>${q.content}</p>
`;


// show options
if(q.options && q.options.length > 0)
{
q.options.forEach((o, i) =>
{
const letters = ["A","B","C","D"];

card.innerHTML +=
`<p>${letters[i]}. ${o.content}</p>`;
});
}
else if(q.type === "single_choice")
{
card.innerHTML += `<p style="color:red">No options</p>`;
}


card.innerHTML +=
`
<p><b>Correct:</b> ${q.correctAnswer}</p>
<p><b>Explanation:</b> ${q.explanation ?? ""}</p>

<button onclick="deleteQuestion(${q.id})">
Delete
</button>
`;

container.appendChild(card);

});
}



async function deleteQuestion(id)
{
await API.request(
"/question/delete/" + id,
"DELETE"
);

loadQuestions();
}