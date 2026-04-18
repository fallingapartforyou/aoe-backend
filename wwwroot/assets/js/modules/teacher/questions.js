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



async function createQuestion()
{

try
{

const content =
document
.getElementById("content")
.value.trim();


if(!content)
return alert("Content required");


let correctAnswer;


if(assignmentType === "single_choice")

correctAnswer =
document
.getElementById("correctAnswer")
.value;

else

correctAnswer =
document
.getElementById("fillCorrectAnswer")
.value.trim();



const explanation =
document
.getElementById("explanation")
.value.trim();



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



if(assignmentType === "single_choice")
{

await API.request(

"/question/add-options",

"POST",

{

questionId: question.id,

A:
document.getElementById("A").value,

B:
document.getElementById("B").value,

C:
document.getElementById("C").value,

D:
document.getElementById("D").value

}

);

}


alert("Created successfully");

loadQuestions();

}
catch(err)
{

console.error(err);

alert("Create failed");

}

}



async function loadQuestions()
{

showSkeleton();


const data =
await API.request(

"/question/by-assignment/"
+ assignmentId

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


if(q.options)
{

q.options.forEach(o =>
{

card.innerHTML +=

`<p>${o.label}: ${o.content}</p>`;

});

}


card.innerHTML +=

`

<p><b>Correct:</b> ${q.correctAnswer}</p>

<p><b>Explanation:</b>
${q.explanation ?? ""}</p>

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