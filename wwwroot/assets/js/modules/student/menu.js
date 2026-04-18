const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


function startAttempt() {

if(confirm("Start assignment?"))

location.href =

"/pages/student/exam.html?assignmentId="

+ assignmentId;

}



function viewHistory() {

location.href =

"/pages/student/history.html?assignmentId="

+ assignmentId;

}



function exitMenu() {

history.back();

}