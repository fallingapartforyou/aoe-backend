const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");

let answers = {};


async function loadQuestions()
{
try
{

if(!assignmentId)
{
alert("Missing assignmentId");
return;
}

const questions =
await API.request(
"/exam/start/" + assignmentId
);

console.log("QUESTIONS:", questions);

render(questions);

}
catch(err)
{
console.error(err);
alert("Cannot load exam");
}

}


function render(questions)
{

const container =
document.getElementById("questionList");

container.innerHTML = "";

// ✅ build HTML 1 lần (fix lỗi chỉ hiện 1 câu)
let allHtml = "";

questions.forEach((q, index) =>
{

let html =
`<div>
<b>Question ${index + 1}:</b><br>
${q.content}<br>
`;

// SINGLE CHOICE
if(q.type === "single_choice")
{

const letters = ["A","B","C","D"];

q.options.forEach((opt, i) =>
{

html += `
<label>

<input type="radio"
name="${q.id}"
value="${opt}"
onchange="saveAnswer(${q.id}, '${opt}')">

${letters[i]}. ${opt}

</label><br>
`;

});

}

// FILL BLANK
else
{

html += `
<input
placeholder="Your answer"
onchange="saveAnswer(${q.id}, this.value)"
/>
`;

}

html += "<hr></div>";

allHtml += html;

});

// render 1 lần duy nhất
container.innerHTML = allHtml;

}


function saveAnswer(id,value)
{
answers[id] = value;
}


async function submitExam()
{

// check unanswered
const total =
document.querySelectorAll("#questionList > div").length;

if(Object.keys(answers).length < total)
{
if(!confirm("You haven't answered all questions. Submit anyway?"))
return;
}

// confirm submit
if(!confirm("Are you sure to submit? You cannot change answers after this."))
return;

try
{

await API.request(

"/exam/submit",

"POST",

{

assignmentId,

answers:

Object.entries(answers).map(
([questionId,answer]) => ({
questionId: parseInt(questionId),
answer
})
)

}

);

alert("Submit success");

location.href =
"/pages/student/result.html?assignmentId=" +
assignmentId;

}
catch(err)
{
console.error(err);
alert("Submit failed");
}

}


loadQuestions();