const Sidebar = {

renderTeacher() {

return `

<div class="sidebar">

<h3>Teacher</h3>

<button class="sidebar-item"
onclick="Router.goTeacherClasses()">
Classes
</button>

<button class="sidebar-item"
onclick="Router.goAssignments()">
Assignments
</button>

<button class="sidebar-item"
onclick="Router.goProfile()">
Profile
</button>

<button class="sidebar-item"
onclick="logout()">
Logout
</button>

</div>

`;

},

renderStudent() {

return `

<div class="sidebar">

<h3>Student</h3>

<button class="sidebar-item"
onclick="Router.goStudentClasses()">
My Classes
</button>

<button class="sidebar-item"
onclick="Router.goProfile()">
Profile
</button>

<button class="sidebar-item"
onclick="logout()">
Logout
</button>

</div>

`;

}

};