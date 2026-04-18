const params =
new URLSearchParams(
location.search
);


const classId =
params.get("classId");



window.onload = async () =>
{

renderLayout("teacher");

showSkeleton();

await loadStudents();

};



function showSkeleton()
{

document.getElementById("studentList").innerHTML =

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



async function loadStudents()
{

try
{

showSkeleton();


const students =
await API.request(

"/class/students/"
+ classId

);


renderStudents(students);

}
catch(err)
{
console.error(err);
}

}



function renderStudents(students)
{

const container =
document.getElementById(
"studentList"
);


container.innerHTML = "";


students.forEach(s =>
{

const card =
document.createElement("div");


card.className = "card";


card.innerHTML =

`

<h3>${s.name}</h3>

<p>${s.email}</p>

`;


card.innerHTML +=

`

<button onclick="removeStudent(${s.studentId})">

Remove

</button>

`;


container.appendChild(card);

});

}



async function addStudent()
{

const email =
document
.getElementById("email")
.value
.trim();


if(!email)
return;


await API.request(

"/class/add-student",

"POST",

{
classId,
email
}

);


loadStudents();

}



async function removeStudent(studentId)
{

if(!confirm("Remove student?"))
return;


await API.request(

`/class/remove-student/${studentId}/${classId}`,

"DELETE"

);


loadStudents();

}