const params =
new URLSearchParams(location.search);


const assignmentId =
params.get("assignmentId");


if(!assignmentId)
{

alert("Missing assignmentId");

location.href =
"/pages/teacher/assignments.html";

}



window.onload = async () =>
{

renderLayout("teacher");

showSkeleton();

await loadResults();

};



function showSkeleton()
{

document.getElementById("resultList").innerHTML =

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



async function loadResults()
{

try
{

showSkeleton();


const results =
await API.request(

"/result/assignment/" +
assignmentId

);


render(results);

}
catch(err)
{

console.error(err);

alert("Load results failed");

}

}



function render(results)
{

const container =
document.getElementById("resultList");


container.innerHTML = "";


if(results.length === 0)
{

container.innerHTML =

`
<div class="card">

No students submitted yet

</div>
`;

return;

}



results.forEach(r =>
{

const card =
document.createElement("div");


card.className = "card";


card.innerHTML =

`

<h3>${r.name}</h3>

<p>Email: ${r.email}</p>

<p>Phone: ${r.phone ?? ""}</p>

<p>Score: ${r.score}</p>

<p>Submitted at:

${new Date(
r.submittedAt
).toLocaleString()}

</p>

`;


container.appendChild(card);

});

}



function exportCSV()
{

window.open(

CONFIG.API_BASE
+
"/result/export/"
+
assignmentId

);

}



function backExam()
{

location.href =
"/pages/teacher/assignments.html";

}