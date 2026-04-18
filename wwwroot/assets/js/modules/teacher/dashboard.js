window.onload = async () =>
{
renderLayout("teacher");

await loadStats();
};

async function loadStats()
{
try
{

const classes =
await API.get("/class/my");

document.getElementById(
"totalClasses"
).innerText =
classes.length;


const assignments =
await API.get("/assignment/my");

document.getElementById(
"totalAssignments"
).innerText =
assignments.length;


const students =
await API.get("/student/my");

document.getElementById(
"totalStudents"
).innerText =
students.length;


const submissions =
await API.get("/submission/my");

document.getElementById(
"totalSubmissions"
).innerText =
submissions.length;

}
catch(err)
{
console.log("Dashboard load error", err);
}

}