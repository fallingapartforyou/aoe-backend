const Router = {

redirectByRole() {

const role =
Storage.getRole();

if (
role === CONFIG.ROLES.TEACHER
)

location.href =
"/pages/teacher/dashboard.html";

else if (
role === CONFIG.ROLES.STUDENT
)

location.href =
"/pages/student/dashboard.html";

else

location.href =
"/pages/auth/login.html";

},

/* ================= AUTH ================= */

goLogin() {

location.href =
"/pages/auth/login.html";

},

goRegister() {

location.href =
"/pages/auth/register.html";

},

/* ================= TEACHER ================= */

goTeacherDashboard() {

location.href =
"/pages/teacher/dashboard.html";

},

goTeacherClasses() {

location.href =
"/pages/teacher/classes.html";

},

goStudents(classId) {

location.href =
"/pages/teacher/class-students.html?classId="
+ classId;

},

goAssignments() {

location.href =
"/pages/teacher/assignments.html";

},

goQuestions(assignmentId, type) {

    location.href =

        "/pages/teacher/questions.html?assignmentId="
        + assignmentId
        + "&type="
        + type;

},

goAssignmentResults(assignmentId) {

location.href =
"/pages/teacher/assignment-results.html?assignmentId="
+ assignmentId;

},

goReports() {

location.href =
"/pages/teacher/reports.html";

},

goSuspiciousReports() {

    location.href =
        "/pages/teacher/suspicious-list.html";
},

goStatistics() {

location.href =
"/pages/teacher/statistics.html";

},

goNotifications() {

location.href =
"/pages/teacher/notifications.html";

},

/* ================= STUDENT ================= */

goStudentDashboard() {

location.href =
"/pages/student/dashboard.html";

},

goStudentClasses() {

location.href =
"/pages/student/my-classes.html";

},

goStudentAssignments(classId) {

location.href =
"/pages/student/assignments.html?classId="
+ classId;

},

goAssignmentMenu(assignmentId) {

location.href =
"/pages/student/assignment-menu.html?assignmentId="
+ assignmentId;

},

goExam(assignmentId) {

location.href =
"/pages/student/exam.html?assignmentId="
+ assignmentId;

},

goResult(attemptId) {

location.href =
"/pages/student/result.html?attemptId="
+ attemptId;

},

goReview(attemptId) {

location.href =
"/pages/student/review.html?attemptId="
+ attemptId;

},

goStudentStatistics() {

    location.href =
        "/pages/student/statistics.html";
},

goStudentNotifications() {

    location.href =
        "/pages/student/notifications.html";
},
/* ================= SHARED ================= */

goProfile() {

location.href =
"/pages/shared/profile.html";

},

goNotifications() {

    location.href =
        "/pages/shared/notifications.html";
},

};

window.Router = Router;