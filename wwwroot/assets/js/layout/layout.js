function renderLayout(role) {

    const container = document.getElementById("layout");
    if (!container) return;

    const sidebar =
        role === CONFIG.ROLES.TEACHER
            ? Sidebar.renderTeacher()
            : Sidebar.renderStudent();

    container.innerHTML = `
        <div class="app-layout">

            ${sidebar}

            <div class="main-layout">

                <header class="topbar">

                    <div class="topbar-left">
                        <h2>English Hub</h2>
                    </div>

                    <div class="topbar-right">

                        <div class="notification-wrapper">

                            <button class="notification-btn"
                                onclick="toggleNotifications()">

                                🔔

                                <span id="notificationCount"
                                      class="notification-count">
                                    0
                                </span>

                            </button>

                            <div id="notificationDropdown"
                                 class="notification-dropdown">

                                <div class="notification-loading">
                                    Loading...
                                </div>

                            </div>

                        </div>

                    </div>

                </header>

            </div>

        </div>
    `;

    if (typeof loadNotificationCount === "function") {
        loadNotificationCount();
    }
}