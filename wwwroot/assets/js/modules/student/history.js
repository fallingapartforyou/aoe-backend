const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


async function loadHistory() {

try {

const history =
await API.request(

"/submission/history/"

+ assignmentId

);

render(history);

}

catch(err) {

console.error(err);

}

}



function render(history) {

const container =
document.getElementById("historyList");

container.innerHTML = "";

history.forEach(h => {

container.innerHTML +=

`
Score:

${h.score}

Submitted at:

${h.submittedAt}

<hr>
`;

});

}



loadHistory();