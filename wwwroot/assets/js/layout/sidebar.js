window.Sidebar = {

    renderTeacher() {
        return `
<aside class="sidebar">

    <div class="sidebar-brand">
        <div class="brand-logo">EH</div>
        <div class="brand-info">
            <h3>English Hub</h3>
            <span>Teacher Portal</span>
        </div>
    </div>

    <nav class="sidebar-menu">

        <button class="sidebar-item" onclick="Router.goTeacherDashboard()">
            <span>🏠</span><span>Dashboard</span>
        </button>

        <button class="sidebar-item" onclick="Router.goTeacherClasses()">
            <span>📚</span><span>Classes</span>
        </button>

        <button class="sidebar-item" onclick="Router.goAssignments()">
            <span>📝</span><span>Assignments</span>
        </button>

        <button class="sidebar-item" onclick="Router.goNotifications()">
            <span>🔔</span><span>Notifications</span>
            <span class="notification-badge js-noti-badge">0</span>
        </button>

        <button class="sidebar-item" onclick="Router.goProfile()">
            <span>👤</span><span>Profile</span>
        </button>

    </nav>

    <div class="sidebar-footer">
        <button class="sidebar-item logout-btn" onclick="logout()">
            <span>🚪</span><span>Logout</span>
        </button>
    </div>

</aside>
        `;
    },

    renderStudent() {
        return `
<aside class="sidebar">

    <div class="sidebar-brand">
        <div class="brand-logo">EH</div>
        <div class="brand-info">
            <h3>English Hub</h3>
            <span>Student Portal</span>
        </div>
    </div>

    <nav class="sidebar-menu">

        <button class="sidebar-item" onclick="Router.goStudentDashboard()">
            <span>🏠</span><span>Dashboard</span>
        </button>

        <button class="sidebar-item" onclick="Router.goStudentClasses()">
            <span>📚</span><span>My Classes</span>
        </button>

        <button class="sidebar-item" onclick="Router.goNotifications()">
            <span>🔔</span><span>Notifications</span>
            <span class="notification-badge js-noti-badge">0</span>
        </button>

        <button class="sidebar-item" onclick="Router.goProfile()">
            <span>👤</span><span>Profile</span>
        </button>

    </nav>

    <div class="sidebar-footer">
        <button class="sidebar-item logout-btn" onclick="logout()">
            <span>🚪</span><span>Logout</span>
        </button>
    </div>

</aside>
        `;
    }
};