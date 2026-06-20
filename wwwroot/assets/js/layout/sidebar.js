window.Sidebar = {

    renderTeacher() {
        return `
<aside class="sidebar">

    <div class="sidebar-brand">

        <div class="brand-logo">
            EH
        </div>

        <div class="brand-info">

            <h3>
                English Hub
            </h3>

            <span>
                Teacher Portal
            </span>

        </div>

    </div>

    <nav class="sidebar-menu">

        <button
            class="sidebar-item"
            onclick="Router.goTeacherDashboard()">

            <i class="bi bi-grid-1x2-fill sidebar-icon"></i>

            <span>
                Dashboard
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goTeacherClasses()">

            <i class="bi bi-collection-fill sidebar-icon"></i>

            <span>
                Classes
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goAssignments()">

            <i class="bi bi-journal-text sidebar-icon"></i>

            <span>
                Assignments
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goSkills()">

            <i class="bi bi-pencil-square sidebar-icon"></i>

            <span>
            Skills
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goNotifications()">

            <i class="bi bi-bell-fill sidebar-icon"></i>

            <span>
                Notifications
            </span>

            <span class="notification-badge js-noti-badge">
                0
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goProfile()">

            <i class="bi bi-person-fill sidebar-icon"></i>

            <span>
                Profile
            </span>

        </button>

    </nav>

    <div class="sidebar-footer">

        <button
            class="sidebar-item logout-btn"
            onclick="logout()">

            <i class="bi bi-box-arrow-right sidebar-icon"></i>

            <span>
                Logout
            </span>

        </button>

    </div>

</aside>
        `;
    },

    renderStudent() {
        return `
<aside class="sidebar">

    <div class="sidebar-brand">

        <div class="brand-logo">
            EH
        </div>

        <div class="brand-info">

            <h3>
                English Hub
            </h3>

            <span>
                Student Portal
            </span>

        </div>

    </div>

    <nav class="sidebar-menu">

        <button
            class="sidebar-item"
            onclick="Router.goStudentDashboard()">

            <i class="bi bi-grid-1x2-fill sidebar-icon"></i>

            <span>
                Dashboard
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goStudentClasses()">

            <i class="bi bi-collection-fill sidebar-icon"></i>

            <span>
                My Classes
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goNotifications()">

            <i class="bi bi-bell-fill sidebar-icon"></i>

            <span>
                Notifications
            </span>

            <span class="notification-badge js-noti-badge">
                0
            </span>

        </button>

        <button
            class="sidebar-item"
            onclick="Router.goProfile()">

            <i class="bi bi-person-fill sidebar-icon"></i>

            <span>
                Profile
            </span>

        </button>

    </nav>

    <div class="sidebar-footer">

        <button
            class="sidebar-item logout-btn"
            onclick="logout()">

            <i class="bi bi-box-arrow-right sidebar-icon"></i>

            <span>
                Logout
            </span>

        </button>

    </div>

</aside>
        `;
    }
};