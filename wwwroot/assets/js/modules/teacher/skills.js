alert("skills loaded");
console.log("skills loaded");
const token =
    localStorage.getItem(
        "token"
    );

if (!token)
{
    location.href =
        "/pages/auth/login.html";
}

const API_BASE =
    CONFIG.API_BASE +
    "/api/skills";

const skillsGrid =
    document.getElementById(
        "skillsGrid"
    );

const totalTasks =
    document.getElementById(
        "totalTasks"
    );

const totalSubmissions =
    document.getElementById(
        "totalSubmissions"
    );

const reviewedCount =
    document.getElementById(
        "reviewedCount"
    );

const pendingCount =
    document.getElementById(
        "pendingCount"
    );

const createModal =
    document.getElementById(
        "createModal"
    );

const openCreateBtn =
    document.getElementById(
        "openCreateBtn"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

const createSkillBtn =
    document.getElementById(
        "createSkillBtn"
    );

async function request(
    url,
    options = {}
)
{
    const response =
        await fetch(url,
        {
            ...options,

            headers:
            {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        });

    if (!response.ok)
    {
        throw new Error(
            "Request failed"
        );
    }

    return await response.json();
}

async function loadDashboard()
{
    try
    {
        const data =
            await request(
                `${API_BASE}/dashboard`
            );

        totalTasks.textContent =
            data.totalTasks;

        totalSubmissions.textContent =
            data.totalSubmissions;

        reviewedCount.textContent =
            data.reviewed;

        pendingCount.textContent =
            data.pending;
    }
    catch (err)
    {
        console.error(err);
    }
}

async function loadTasks()
{
    try
    {
        const tasks =
            await request(
                API_BASE
            );

        renderTasks(
            tasks
        );
    }
    catch (err)
    {
        console.error(err);
    }
}

function renderTasks(
    tasks
)
{
    if (
        !tasks ||
        tasks.length === 0
    )
    {
        skillsGrid.innerHTML =
            `
            <div class="empty-state">

                <i class="bi bi-folder2-open"></i>

                <h3>
                    No Skill Tasks
                </h3>

            </div>
            `;

        return;
    }

    skillsGrid.innerHTML =
        tasks.map(task =>

            `
            <div class="card skill-card">

                <div class="skill-card-top">

                    <span class="skill-badge">

                        ${task.skillType}

                    </span>

                    <span class="skill-level">

                        ${task.level}

                    </span>

                </div>

                <h3>

                    ${task.topic || "Untitled"}

                </h3>

                <p>

                    ${task.requirements || ""}

                </p>

                <div class="skill-meta">

                    <span>

                        ${task.submissionCount}
                        submissions

                    </span>

                </div>

                <div class="skill-actions">

                    <button
                        class="btn btn-primary"
                        onclick="
                            Router.goSkillSubmissions(
                                ${task.id}
                            )
                        ">

                        Open

                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="
                            deleteTask(
                                ${task.id}
                            )
                        ">

                        Delete

                    </button>

                </div>

            </div>
            `
        ).join("");
}

async function createTask()
{
    try
    {
        const payload =
        {
            skillType:
                document.getElementById(
                    "skillType"
                ).value,

            inputType:
                document.getElementById(
                    "inputType"
                ).value,

            level:
                document.getElementById(
                    "level"
                ).value,

            topic:
                document.getElementById(
                    "topic"
                ).value,

            requirements:
                document.getElementById(
                    "requirements"
                ).value
        };

        await request(
            API_BASE,
            {
                method: "POST",

                body:
                    JSON.stringify(
                        payload
                    )
            }
        );

        createModal.classList.add(
            "hidden"
        );

        loadTasks();

        loadDashboard();
    }
    catch (err)
    {
        alert(
            err.message
        );
    }
}

async function deleteTask(
    id
)
{
    const confirmDelete =
        confirm(
            "Delete this task?"
        );

    if (!confirmDelete)
        return;

    try
    {
        await request(
            `${API_BASE}/${id}`,
            {
                method: "DELETE"
            }
        );

        loadTasks();

        loadDashboard();
    }
    catch (err)
    {
        alert(
            err.message
        );
    }
}

openCreateBtn.addEventListener(
    "click",
    () => {
        createModal.classList.remove(
            "hidden"
        );

        createModal.classList.add(
            "show"
        );
    }
);

closeModalBtn.addEventListener(
    "click",
    () => {
        createModal.classList.remove(
            "show"
        );

        createModal.classList.add(
            "hidden"
        );
    }
);

createSkillBtn.addEventListener(
    "click",
    () =>
    {
        console.log(
            "CREATE CLICKED"
        );

        createTask();
    }
);

renderLayout(
    CONFIG.ROLES.TEACHER
);

loadDashboard();

loadTasks();

console.log(
    "openCreateBtn",
    openCreateBtn
);

console.log(
    "createSkillBtn",
    createSkillBtn
);

console.log(
    "createModal",
    createModal
);