const params =
new URLSearchParams(location.search);

const classId =
params.get("classId");


async function loadAssignments() {

try {

const assignments =
await API.request(

"/assignment/by-class/"

+ classId

);

render(assignments);

}

catch(err) {

console.error(err);

}

}



function render(assignments) {

const container =
document.getElementById("assignmentList");

container.innerHTML = "";

assignments.forEach(a => {

const div =
document.createElement("div");

div.innerHTML =

`
${a.name}

<button
onclick="openMenu(${a.assignmentId})">

Open

</button>

<hr>
`;

container.appendChild(div);

});

}



function openMenu(assignmentId) {

location.href =

"/pages/student/assignment-menu.html?assignmentId="

+ assignmentId;

}



loadAssignments();