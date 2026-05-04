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
    const container = document.getElementById("studentList");
    container.innerHTML = "";

    students.forEach(s =>
    {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="select-cell" style="display:none;">
                <input type="checkbox" value="${s.studentId}">
            </td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>
                <button onclick="removeStudent(${s.studentId})">
                    Remove
                </button>
            </td>
        `;

        container.appendChild(tr);
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

async function removeSelected()
{
    const checked =
        document.querySelectorAll(
            ".select-cell input:checked"
        );

    if (checked.length === 0) return;

    if (!confirm("Remove selected students?")) return;

    for (let cb of checked)
    {
        const studentId = cb.value;

        await API.request(
            `/class/remove-student/${studentId}/${classId}`,
            "DELETE"
        );
    }

    loadStudents();
}

let bulkMode = false;

function toggleBulkRemove()
{
    bulkMode = !bulkMode;

    document.getElementById("bulkBtn").style.display =
        bulkMode ? "inline-block" : "none";

    document.querySelectorAll(".select-cell")
        .forEach(td => td.style.display = bulkMode ? "" : "none");

    document.getElementById("selectCol").style.display =
        bulkMode ? "" : "none";
}