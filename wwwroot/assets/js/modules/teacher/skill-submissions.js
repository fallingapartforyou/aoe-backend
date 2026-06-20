const token =
    localStorage.getItem(
        "token"
    );

const params =
    new URLSearchParams(
        location.search
    );

const taskId =
    params.get(
        "taskId"
    );

const API =
    CONFIG.API_BASE +
    "/api/skills";

const table =
    document.getElementById(
        "submissionTable"
    );

async function request(
    url,
    options = {}
)
{
    const response =
        await fetch(
            url,
            {
                ...options,

                headers:
                {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );

    if (!response.ok)
    {
        throw new Error(
            "Request failed"
        );
    }

    return await response.json();
}

async function loadSubmissions()
{
    const data =
        await request(
            `${API}/submissions/${taskId}`
        );

    renderTable(
        data
    );
}

function renderTable(
    items
)
{
    table.innerHTML =
        items.map(x =>
        `
        <tr>

            <td>

                ${x.studentName}

            </td>

            <td>

                ${x.fileName || "-"}

            </td>

            <td>

                ${x.wordCount}

            </td>

            <td>

                ${new Date(
                    x.createdAt
                ).toLocaleDateString()}

            </td>

            <td>

                <div class="action-group">

                    <button
                        class="btn btn-primary"
                        onclick="
                        analyzeSubmission(
                            ${x.id}
                        )
                        ">

                        Analyze

                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="
                        openReview(
                            ${x.id}
                        )
                        ">

                        Review

                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="
                        deleteSubmission(
                            ${x.id}
                        )
                        ">

                        Delete

                    </button>

                </div>

            </td>

        </tr>
        `
        ).join("");
}

async function analyzeSubmission(
    submissionId
)
{
    try
    {
        const result =
            await request(
                `${API}/analyze/${submissionId}`,
                {
                    method: "POST"
                }
            );

        console.log(
            "ANALYZE RESULT",
            result
        );

        if (
            !result ||
            !result.reviewId
        )
        {
            alert(
                "Review creation failed"
            );

            return;
        }

        location.href =
            `skill-review.html?reviewId=${result.reviewId}`;
    }
    catch (error)
    {
        console.error(
            error
        );

        alert(
            "Analyze failed"
        );
    }
}

async function openReview(
    submissionId
)
{
    try
    {
        const result =
            await request(
                `${API}/review-by-submission/${submissionId}`
            );

        location.href =
            `skill-review.html?reviewId=${result.reviewId}`;
    }
    catch (error)
    {
        console.error(error);

        alert(
            "Review not found"
        );
    }
}

async function deleteSubmission(
    submissionId
)
{
    if (
        !confirm(
            "Delete submission?"
        )
    )
    {
        return;
    }

    await request(
        `${API}/submission/${submissionId}`,
        {
            method: "DELETE"
        }
    );

    loadSubmissions();
}

renderLayout(
    CONFIG.ROLES.TEACHER
);

loadSubmissions();

const uploadModal =
    document.getElementById(
        "uploadModal"
    );

const openUploadBtn =
    document.getElementById(
        "openUploadBtn"
    );

const closeUploadBtn =
    document.getElementById(
        "closeUploadBtn"
    );

const uploadBtn =
    document.getElementById(
        "uploadBtn"
    );

openUploadBtn.addEventListener(
    "click",
    () =>
    {
        uploadModal.classList.remove(
            "hidden"
        );

        uploadModal.classList.add(
            "show"
        );
    }
);

closeUploadBtn.addEventListener(
    "click",
    () =>
    {
        uploadModal.classList.remove(
            "show"
        );

        uploadModal.classList.add(
            "hidden"
        );
    }
);

async function uploadSubmission()
{
    const payload =
    {
        skillTaskId:
            Number(taskId),

        studentName:
            document.getElementById(
                "studentName"
            ).value,

        rawText:
            document.getElementById(
                "rawText"
            ).value,

        fileName: null,

        fileUrl: null
    };

    await request(
        `${API}/upload`,
        {
            method: "POST",

            headers:
            {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`
            },

            body:
                JSON.stringify(
                    payload
                )
        }
    );

    uploadModal.classList.remove(
        "show"
    );

    uploadModal.classList.add(
        "hidden"
    );

    loadSubmissions();
}

uploadBtn.addEventListener(
    "click",
    uploadSubmission
);