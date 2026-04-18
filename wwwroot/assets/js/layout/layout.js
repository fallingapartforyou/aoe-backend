function renderLayout(role) {

const container =
document.getElementById("layout");

if(!container)
return;

if(role === "teacher")

container.innerHTML =
Sidebar.renderTeacher();

else

container.innerHTML =
Sidebar.renderStudent();

}