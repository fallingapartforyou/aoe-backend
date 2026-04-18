window.onload = async () =>
{
renderLayout("student");

await loadStats();
};

async function loadStats()
{
try
{

const classes =
await API.get("/student/my");

document.getElementById(
"myClasses"
).innerText =
classes.length;


const assignments =
await API.get("/assignment/student");

document.getElementById(
"myAssignments"
).innerText =
assignments.length;


const attempts =
await API.get("/attempt/my");

document.getElementById(
"myAttempts"
).innerText =
attempts.length;

}
catch(err)
{
console.log("Dashboard load error", err);
}

}