const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


async function loadResult() {

const result =
await API.request(

"/submission/my-result/"

+ assignmentId

);

document.getElementById(

"score"

).innerText =

"Score: " + result.score;



render(result.details);

}



function render(details) {

const container =
document.getElementById("answers");

details.forEach(q => {

container.innerHTML +=

`
${q.questionContent}

<br>

Your answer:

${q.studentAnswer}

<br>

Correct:

${q.correctAnswer}

<hr>
`;

});

}



loadResult();