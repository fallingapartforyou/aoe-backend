const params =
    new URLSearchParams(
        location.search
    );

const classId =
    params.get("classId");

let bulkMode = false;

window.onload = async () =>
{
    renderLayout("teacher");

    showSkeleton();

    await Promise.all([
        loadStudents(),
        loadRequests()
    ]);
};

function showSkeleton()
{
    document.getElementById(
        "studentList"
    ).innerHTML = `

        <tr>
            <td colspan="4">
                Loading...
            </td>
        </tr>

    `;
}

async function loadStudents()
{
    try
    {
        const students =
            await API.request(
                "/api/class/students/" +
                classId
            );

        renderStudents(students);

        document.getElementById(
            "totalStudents"
        ).innerText =
            students.length;
    }
    catch(err)
    {
        console.error(err);
    }
}

async function loadRequests()
{
    try
    {
        const requests =
            await API.request(
                "/api/class/join-requests/" +
                classId
            );

        renderRequests(requests);

        document.getElementById(
            "pendingRequests"
        ).innerText =
            requests.length;
    }
    catch(err)
    {
        console.error(err);
    }
}

function renderStudents(students)
{
    const container =
        document.getElementById(
            "studentList"
        );

    container.innerHTML = "";

    students.forEach(s =>
    {
        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td
                class="select-cell"
                style="display:none;">

                <input
                    type="checkbox"
                    value="${s.id}"
                    onchange="updateSelectedCount()">

            </td>

            <td>
                ${s.name}
            </td>

            <td>
                ${s.email}
            </td>

            <td>

                <button
                    class="btn-secondary"
                    onclick="editStudent(
                        ${s.id},
                        '${s.name}',
                        '${s.phone || ""}'
                    )">

                    Edit

                </button>

                <button
                    class="btn-danger"
                    onclick="removeStudent(${s.id})">

                    Remove

                </button>

            </td>

        `;

        container.appendChild(tr);
    });
}

function renderRequests(requests)
{
    const container =
        document.getElementById(
            "requestList"
        );

    if(!container)
        return;

    container.innerHTML = "";

    requests.forEach(r =>
    {
        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${r.studentName}
            </td>

            <td>
                ${r.studentEmail}
            </td>

            <td>
                ${r.type}
            </td>

            <td>

                <button
                    class="btn-primary"
                    onclick="approveRequest(${r.id})">

                    Accept

                </button>

                <button
                    class="btn-secondary"
                    onclick="rejectRequest(${r.id})">

                    Reject

                </button>

            </td>

        `;

        container.appendChild(tr);
    });
}

async function addStudent()
{
    const email =
        document
        .getElementById("email")
        .value
        .trim();

    if(!email)
        return;

    await API.request(
        "/api/class/add-student",
        "POST",
        {
            classId,
            email
        }
    );

    document.getElementById(
        "email"
    ).value = "";

    await loadRequests();
}

async function removeStudent(studentId)
{
    if(
        !confirm(
            "Remove student?"
        )
    )
        return;

    await API.request(
        `/api/class/remove-student/${studentId}/${classId}`,
        "DELETE"
    );

    await loadStudents();
}

async function removeSelected()
{
    const checked =
        document.querySelectorAll(
            ".select-cell input:checked"
        );

    if(!checked.length)
        return;

    if(
        !confirm(
            "Remove selected students?"
        )
    )
        return;

    for(const cb of checked)
    {
        await API.request(
            `/api/class/remove-student/${cb.value}/${classId}`,
            "DELETE"
        );
    }

    await loadStudents();

    updateSelectedCount();
}

async function approveRequest(id)
{
    await API.request(
        "/api/class/approve-request/" +
        id,
        "POST"
    );

    await loadStudents();
    await loadRequests();
}

async function rejectRequest(id)
{
    await API.request(
        "/api/class/reject-request/" +
        id,
        "POST"
    );

    await loadRequests();
}

async function editStudent(
    studentId,
    currentName,
    currentPhone
)
{
    const name =
        prompt(
            "Student name",
            currentName
        );

    if(name === null)
        return;

    const phone =
        prompt(
            "Phone",
            currentPhone
        );

    if(phone === null)
        return;

    await API.request(
        "/api/class/update-student",
        "PUT",
        {
            studentId,
            name,
            phone
        }
    );

    await loadStudents();
}

function toggleBulkRemove()
{
    bulkMode =
        !bulkMode;

    document.getElementById(
        "bulkBtn"
    ).style.display =
        bulkMode
            ? "inline-block"
            : "none";

    document.getElementById(
        "selectCol"
    ).style.display =
        bulkMode
            ? ""
            : "none";

    document
        .querySelectorAll(
            ".select-cell"
        )
        .forEach(td =>
        {
            td.style.display =
                bulkMode
                    ? ""
                    : "none";
        });

    updateSelectedCount();
}

function updateSelectedCount()
{
    const count =
        document.querySelectorAll(
            ".select-cell input:checked"
        ).length;

    document.getElementById(
        "selectedStudents"
    ).innerText =
        count;
}