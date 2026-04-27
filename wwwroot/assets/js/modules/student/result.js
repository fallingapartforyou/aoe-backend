const params =
new URLSearchParams(location.search);

const assignmentId =
params.get("assignmentId");


async function loadResult()
{
try
{
if(!assignmentId)
{
alert("Missing assignmentId");
return;
}

// latest score
const result =
await API.request(
"/exam/result/" + assignmentId
);

document.getElementById("score").innerText =
"Latest Score: " + result.score;


// history
const history =
await API.request(
"/exam/history/" + assignmentId
);

renderHistory(history);

}
catch(err)
{
console.error(err);
alert("Load failed");
}
}


function renderHistory(list)
{
const container =
document.getElementById("history");

container.innerHTML = "<h3>Attempts</h3>";

if(!list || list.length === 0)
{
container.innerHTML += "<p>No attempts</p>";
return;
}

list.forEach((item, index) =>
{
container.innerHTML +=
`
<div>
<b>Attempt ${index + 1}</b><br>
Score: ${item.score}<br>
Time: ${formatTime(item.time)}<hr>
</div>
`;
});
}


function formatTime(t)
{
if(!t) return "N/A";

const date = new Date(t);

return date.toLocaleString();
}

function backExam()
{
location.href =
"/pages/student/my-classes.html";
}
loadResult();