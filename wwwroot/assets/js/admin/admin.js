const API_BASE =
    "https://localhost:7225/api/admin";

const token =
    localStorage.getItem("token");

const role =
    localStorage.getItem("role");

// =========================
// AUTH CHECK
// =========================

if (!token || role !== "admin")
{
    location.href =
        "/pages/auth/login.html";
}

// =========================
// ELEMENTS
// =========================

const statsGrid =
    document.getElementById(
        "statsGrid"
    );

const usersTable =
    document.getElementById(
        "usersTable"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const roleFilter =
    document.getElementById(
        "roleFilter"
    );

const openCreateBtn =
    document.getElementById(
        "openCreateBtn"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

const createModal =
    document.getElementById(
        "createModal"
    );

const createUserBtn =
    document.getElementById(
        "createUserBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

// =========================
// FETCH WRAPPER
// =========================

async function request(
    url,
    options = {}
)
{
    const response =
        await fetch(url, {

            ...options,

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        });

    const data =
        await response.json();

    if (!response.ok)
    {
        throw new Error(
            data.message
            ||
            "Request failed"
        );
    }

    return data;
}

// =========================
// LOAD DASHBOARD
// =========================

async function loadDashboard()
{
    try
    {
        const data =
            await request(
                `${API_BASE}/dashboard`
            );

        statsGrid.innerHTML =
            `
            <div class="stat-card">
                <span>Total Users</span>
                <h2>${data.totalUsers}</h2>
            </div>

            <div class="stat-card">
                <span>Teachers</span>
                <h2>${data.totalTeachers}</h2>
            </div>

            <div class="stat-card">
                <span>Students</span>
                <h2>${data.totalStudents}</h2>
            </div>

            <div class="stat-card">
                <span>Classes</span>
                <h2>${data.totalClasses}</h2>
            </div>

            <div class="stat-card">
                <span>Assignments</span>
                <h2>${data.totalAssignments}</h2>
            </div>

            <div class="stat-card">
                <span>Results</span>
                <h2>${data.totalResults}</h2>
            </div>

            <div class="stat-card">
                <span>Suspicious</span>
                <h2>${data.suspiciousResults}</h2>
            </div>

            <div class="stat-card">
                <span>Average Score</span>
                <h2>${data.averageScore}</h2>
            </div>
            `;
    }
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// LOAD USERS
// =========================

async function loadUsers()
{
    try
    {
        const keyword =
            searchInput.value.trim();

        const role =
            roleFilter.value;

        const query =
            new URLSearchParams();

        if (keyword)
        {
            query.append(
                "keyword",
                keyword
            );
        }

        if (role)
        {
            query.append(
                "role",
                role
            );
        }

        const users =
            await request(
                `${API_BASE}/users?${query}`
            );

        usersTable.innerHTML =
            users.map(user =>

                `
                <tr>

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        ${user.name}
                    </td>

                    <td>
                        ${user.email}
                    </td>

                    <td>
                        ${user.phone}
                    </td>

                    <td>
                        ${user.role}
                    </td>

                    <td>
                        ${user.password}
                    </td>

                    <td>

                        <span class="
                            status
                            ${user.isBanned
                                ? "banned"
                                : "active"}
                        ">

                            ${user.isBanned
                                ? "Banned"
                                : "Active"}

                        </span>

                    </td>

                    <td>
                        ${
                            user.lastLoginAt
                            ?
                            new Date(
                                user.lastLoginAt
                            ).toLocaleString()
                            :
                            "Never"
                        }
                    </td>

                    <td>

                        <div class="action-group">

                            ${
                                user.isBanned
                                ?
                                `
                                <button
                                    class="
                                        action-btn
                                        unban-btn
                                    "
                                    onclick="
                                        unbanUser(
                                            ${user.id}
                                        )
                                    ">

                                    Unban

                                </button>
                                `
                                :
                                `
                                <button
                                    class="
                                        action-btn
                                        ban-btn
                                    "
                                    onclick="
                                        banUser(
                                            ${user.id}
                                        )
                                    ">

                                    Ban

                                </button>
                                `
                            }

                            <button
                                class="
                                    action-btn
                                    delete-btn
                                "
                                onclick="
                                    deleteUser(
                                        ${user.id}
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
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// CREATE USER
// =========================

async function createUser()
{
    try
    {
        const payload = {

            name:
                document.getElementById(
                    "nameInput"
                ).value,

            email:
                document.getElementById(
                    "emailInput"
                ).value,

            phone:
                document.getElementById(
                    "phoneInput"
                ).value,

            password:
                document.getElementById(
                    "passwordInput"
                ).value,

            role:
                document.getElementById(
                    "roleInput"
                ).value
        };

        await request(
            `${API_BASE}/create-user`,
            {
                method: "POST",
                body:
                    JSON.stringify(payload)
            }
        );

        alert("User created");

        createModal.classList.add(
            "hidden"
        );

        loadUsers();

        loadDashboard();
    }
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// BAN USER
// =========================

async function banUser(id)
{
    try
    {
        await request(
            `${API_BASE}/ban/${id}`,
            {
                method: "PUT"
            }
        );

        loadUsers();
    }
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// UNBAN USER
// =========================

async function unbanUser(id)
{
    try
    {
        await request(
            `${API_BASE}/unban/${id}`,
            {
                method: "PUT"
            }
        );

        loadUsers();
    }
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// DELETE USER
// =========================

async function deleteUser(id)
{
    const confirmDelete =
        confirm(
            "Delete this user?"
        );

    if (!confirmDelete)
        return;

    try
    {
        await request(
            `${API_BASE}/delete-user/${id}`,
            {
                method: "DELETE"
            }
        );

        loadUsers();

        loadDashboard();
    }
    catch (err)
    {
        alert(err.message);
    }
}

// =========================
// EVENTS
// =========================

searchBtn.addEventListener(
    "click",
    loadUsers
);

openCreateBtn.addEventListener(
    "click",
    () =>
    {
        createModal.classList.remove(
            "hidden"
        );
    }
);

closeModalBtn.addEventListener(
    "click",
    () =>
    {
        createModal.classList.add(
            "hidden"
        );
    }
);

createUserBtn.addEventListener(
    "click",
    createUser
);

logoutBtn.addEventListener(
    "click",
    () =>
    {
        localStorage.clear();

        location.href =
            "../auth/login.html";
    }
);

// =========================
// INIT
// =========================

loadDashboard();

loadUsers();