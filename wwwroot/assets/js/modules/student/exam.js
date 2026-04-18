const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


let answers = {};
let duration = 0;
let interval;

async function loadQuestions() {

const data =
await API.request(

"/assignment/start/" +

assignmentId

);

/*
backend trả:

{
questions,
durationSeconds
}
*/

duration =
data.durationSeconds;

render(data.questions);

startTimer();

}



function render(questions) {

const container =
document.getElementById("questionList");

questions.forEach(q => {

let html =
`<div>${q.content}<br>`;



if(q.questionType === "mcq") {

q.options.forEach(opt => {

html +=

`
<label>

<input type="radio"

name="${q.questionId}"

value="${opt}"

onchange="saveAnswer(${q.questionId}, '${opt}')">

${opt}

</label><br>
`;

});

}



else {

html +=

`
<input

onchange="saveAnswer(

${q.questionId},

this.value

)"

/>
`;

}



html += "<hr></div>";

container.innerHTML += html;

});

}



function saveAnswer(id,value) {

answers[id] = value;

}



async function submitExam() {

if(duration <= 0)

return alert("Expired");

if(!confirm("Submit?"))

return;

await API.request(

"/submission/submit",

"POST",

{

assignmentId,

answers

}

);

location.href =

"/pages/student/result.html?assignmentId="

+ assignmentId;

}

function startTimer() {

const timerEl =
document.getElementById("timer");

interval =
setInterval(() => {

if(duration <= 0) {

clearInterval(interval);

alert("Time up");

submitExam();

return;

}

duration--;

timerEl.innerText =
"Time left: " + duration + "s";

},1000);

}

loadQuestions();