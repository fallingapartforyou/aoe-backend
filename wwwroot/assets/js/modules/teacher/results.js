const params =
    new URLSearchParams(
        location.search
    );

const assignmentId =
    params.get("assignmentId");

let rawResults = [];

if (!assignmentId)
{
    alert("Missing assignmentId");

    location.href =
        "/pages/teacher/assignments.html";
}

window.onload = async () =>
{
    renderLayout("teacher");

    await loadResults();
};

async function loadResults()
{
    try
    {
        const results =
            await API.request(
                "/api/result/assignment/" +
                assignmentId
            );

        rawResults = results || [];

        render(rawResults);
    }
    catch (err)
    {
        console.error(err);

        alert(
            "Load results failed"
        );
    }
}

function render(results)
{
    updateStatistics(results);

    const container =
        document.getElementById(
            "resultList"
        );

    container.innerHTML = "";

    if (!results.length)
    {
        container.innerHTML = `
            <tr>
                <td colspan="6">
                    No submissions
                </td>
            </tr>
        `;

        return;
    }

    results.forEach(r =>
    {
        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `
            <td>
                ${r.name}
            </td>

            <td>
                ${r.email}
            </td>

            <td>
                <b>${r.score}</b>
            </td>

            <td>
                ${formatDate(
                    r.submittedAt
                )}
            </td>

            <td>
                Submitted
            </td>

            <td>

                <button
                    class="btn-primary"
                    onclick="
                        event.stopPropagation();
                        reviewStudent(${r.studentId});
                    ">

                    Review

                </button>

            </td>
        `;

        tr.style.cursor =
            "pointer";

        tr.onclick = () =>
        {
            reviewStudent(
                r.studentId
            );
        };

        container.appendChild(
            tr
        );
    });
}

function updateStatistics(results)
{
    const total =
        results.length;

    const average =
        total
            ? (
                results.reduce(
                    (sum, r) =>
                        sum +
                        Number(
                            r.score || 0
                        ),
                    0
                ) / total
            ).toFixed(1)
            : 0;

    const highest =
        total
            ? Math.max(
                ...results.map(
                    r =>
                        Number(
                            r.score || 0
                        )
                )
            )
            : 0;

    document.getElementById(
        "totalStudents"
    ).innerText = total;

    document.getElementById(
        "submittedCount"
    ).innerText = total;

    document.getElementById(
        "averageScore"
    ).innerText = average;

    document.getElementById(
        "highestScore"
    ).innerText = highest;
}

function filterResults()
{
    const keyword =
        document
        .getElementById(
            "search"
        )
        .value
        .toLowerCase();

    const scoreSort =
        document
        .getElementById(
            "sortScore"
        )
        .value;

    const dateSort =
        document
        .getElementById(
            "sortDate"
        )
        .value;

    let filtered =
        [...rawResults];

    if (keyword)
    {
        filtered =
            filtered.filter(r =>
                r.name
                    .toLowerCase()
                    .includes(keyword)
                ||
                r.email
                    .toLowerCase()
                    .includes(keyword)
            );
    }

    if (scoreSort === "score-desc")
    {
        filtered.sort(
            (a, b) =>
                b.score -
                a.score
        );
    }

    if (scoreSort === "score-asc")
    {
        filtered.sort(
            (a, b) =>
                a.score -
                b.score
        );
    }

    if (dateSort === "date-desc")
    {
        filtered.sort(
            (a, b) =>
                new Date(
                    b.submittedAt
                ) -
                new Date(
                    a.submittedAt
                )
        );
    }

    if (dateSort === "date-asc")
    {
        filtered.sort(
            (a, b) =>
                new Date(
                    a.submittedAt
                ) -
                new Date(
                    b.submittedAt
                )
        );
    }

    render(filtered);
}

function reviewStudent(
    studentId
)
{
    location.href =
        `/pages/teacher/review.html?assignmentId=${assignmentId}&studentId=${studentId}`;
}

function exportCSV()
{
    window.open(
        CONFIG.API_BASE +
        "/api/result/export/" +
        assignmentId
    );
}

function formatDate(date)
{
    return new Date(
        date
    ).toLocaleString();
}

function backExam()
{
    location.href =
        "/pages/teacher/assignments.html";
}