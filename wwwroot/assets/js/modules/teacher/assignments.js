window.onload = async () =>
{

renderLayout("teacher");

showSkeleton();

await loadAssignments();

};



function showSkeleton()
{

document.getElementById("assignmentList").innerHTML =

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



async function loadAssignments()
{

try
{

showSkeleton();

const keyword =
document
.getElementById("keyword")
?.value || "";


const assignments =
await API.request(
"/assignment/my-assignments?keyword="
+ keyword
);


renderAssignments(assignments);

}
catch(err)
{
console.error(err);
}

}



function renderAssignments(assignments)
{

const container =
document.getElementById(
"assignmentList"
);


container.innerHTML = "";


assignments.forEach(a =>
{

const card =
document.createElement("div");

card.className = "card";


card.innerHTML =

`

<h3>${a.name}</h3>

<p>${a.questionCount} questions</p>

<p>Type: ${a.questionType}</p>

`;


card.innerHTML +=

`

<button onclick="openQuestions(${a.id}, '${a.questionType}')">

Questions

</button>


<button onclick="assignClass(${a.id})">

Assign class

</button>


<button onclick="viewResults(${a.id})">

Results

</button>


<button onclick="deleteAssignment(${a.id})">

Delete

</button>

`;


container.appendChild(card);

});

}



async function createAssignment()
{

try
{

const name =
document
.getElementById("assignmentName")
.value
.trim();


if(!Validator.assignmentName(name))
return alert(
"Assignment name max 20 characters"
);


const questionType =
document
.getElementById("questionType")
.value;


const questionCount =
document
.getElementById("questionCount")
.value;


if(!questionCount || questionCount <= 0)
return alert(
"Question count must be > 0"
);


const openTime =
document
.getElementById("openTime")
.value || null;


const closeTime =
document
.getElementById("closeTime")
.value || null;


const showResult =
document
.getElementById("showResult")
.checked;


const showExplanation =
document
.getElementById("showExplanation")
.checked;


await API.request(
"/assignment/create",
"POST",
{
name,
questionType,
questionCount,
openTime,
closeTime,
showResult,
showExplanation
}
);


alert("Created successfully");

loadAssignments();

}
catch(err)
{
console.error(err);

alert("Create failed");
}

}



async function deleteAssignment(id)
{

if(!confirm("Delete assignment?"))
return;


await API.request(
"/assignment/delete/" + id,
"DELETE"
);


loadAssignments();

}



function openQuestions(id, type)
{

location.href =

"/pages/teacher/questions.html?assignmentId="
+ id
+ "&type="
+ type;

}



function viewResults(id)
{

location.href =

"/pages/teacher/results.html?assignmentId="
+ id;

}



function assignClass(id)
{

location.href =

"/pages/teacher/assign-class.html?assignmentId="
+ id;

}