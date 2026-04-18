const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


if (!assignmentId)
{
alert("Missing assignmentId");
history.back();
}



async function loadClasses()
{

try
{

const classes =
await API.request(
"/class/my-classes"
);

render(classes);

}
catch (err)
{

console.error(err);

document
.getElementById("loadingState")
.innerText =
"Failed to load classes";

}

}



function render(classes)
{

const loading =
document.getElementById(
"loadingState"
);

loading.remove();


const container =
document.getElementById(
"classList"
);


if (!classes.length)
{

container.innerHTML =

`
<div class="text-muted">

No classes available

</div>
`;

return;

}


classes.forEach(cls =>
{

const item =
document.createElement("div");

item.className =
"list-group-item d-flex justify-content-between align-items-center";


item.innerHTML =

`
<div>

<strong>

${cls.name}

</strong>

</div>


<button
class="btn btn-primary btn-sm"
id="btn-${cls.id}">

Assign

</button>
`;


item
.querySelector("button")
.onclick =
() => assign(cls.id);


container.appendChild(item);

});

}



async function assign(classId)
{

if (!classId)
return alert("Invalid classId");


const button =
document.getElementById(
`btn-${classId}`
);


button.disabled = true;
button.innerText =
"Assigning...";


try
{

await API.request(

"/assignment/assign-to-class",

"POST",

{
assignmentId:
parseInt(assignmentId),

classId
}

);


button.innerText =
"Assigned";

button.classList
.remove("btn-primary");

button.classList
.add("btn-success");


}
catch (err)
{

console.error(err);

button.disabled = false;

button.innerText =
"Assign";

alert(
"Assign failed"
);

}

}



function openAssignClass(id)
{

location.href =
"/pages/teacher/assign-class.html?assignmentId=" + id;

}



loadClasses();