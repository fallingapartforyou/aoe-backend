const params =
new URLSearchParams(location.search);

const submissionId =
params.get("submissionId");


async function loadDetail() {

try {

const detail =
await API.request(

"/submission/detail/"

+ submissionId

);

render(detail);

}

catch(err) {

console.error(err);

}

}


function render(detail) {

const container =
document.getElementById("detailList");

container.innerHTML = "";

detail.forEach(q => {

const div =
document.createElement("div");

div.innerHTML =

`
Question:

${q.questionContent}

<br>

Student answer:

${q.studentAnswer}

<br>

Correct answer:

${q.correctAnswer}

<br>

Explanation:

${q.explanation}

<hr>
`;

container.appendChild(div);

});

}


loadDetail();