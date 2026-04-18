async function loadClasses()
{

try
{

const classes =
await API.request(
"/student/my"
);

render(classes);

}

catch(err)
{

console.error(err);

alert(
err.message ||
"Load classes failed"
);

}

}



function render(classes)
{

const container =
document.getElementById(
"classList"
);

container.innerHTML = "";


if(!classes.length)
{

container.innerHTML =
"No classes joined yet";

return;

}


classes.forEach(c =>
{

const div =
document.createElement("div");

div.innerHTML =

`
${c.name}

<button
onclick="openAssignments(${c.id})">

Assignments

</button>

<hr>
`;

container.appendChild(div);

});

}



function openAssignments(classId)
{

location.href =

"/pages/student/assignments.html?classId="

+ classId;

}



loadClasses();