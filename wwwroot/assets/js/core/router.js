const Router = {

    redirectByRole() {

        const role =
            Storage.getRole();

        if (
            role ===
            CONFIG.ROLES.TEACHER
        )

            location.href =
                "/pages/teacher/dashboard.html";

        else if (
            role ===
            CONFIG.ROLES.STUDENT
        )

            location.href =
                "/pages/student/dashboard.html";

        else

            location.href =
                "/pages/auth/login.html";

    },
    
    goTeacherClasses() {

location.href =
"/pages/teacher/classes.html";

},

goLogin() {

location.href =
"/pages/auth/login.html";

},

goTeacherDashboard() {

location.href =
"/pages/teacher/dashboard.html";

},

goStudentDashboard() {

location.href =
"/pages/student/dashboard.html";

},

goAssignments() {

location.href =
"/pages/teacher/assignments.html";

},

goStudentClasses() {

location.href =
"/pages/student/my-classes.html";

},

goJoinClass() {

location.href =
"/pages/student/join-class.html";

},

goProfile() {

location.href =
"/pages/shared/profile.html";

}

};