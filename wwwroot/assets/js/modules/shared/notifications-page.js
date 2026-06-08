window.onload = async () => {
    renderLayout("shared");
    await loadNotifications();
};

async function loadNotifications() {
    const container = document.getElementById("notificationList");

    container.innerHTML = `
        <p>Loading...</p>
    `;

    try {
        const notifications = await API.get("/api/notification/my");

        if (!notifications || notifications.length === 0) {
            container.innerHTML = `<p>No notifications</p>`;
            return;
        }

        container.innerHTML = "";

        notifications.forEach(n => {

            const div = document.createElement("div");

            div.className = n.isRead
                ? "card notification-read"
                : "card notification-unread";

            div.innerHTML = `
                <h3>${n.title}</h3>
                <p>${n.message}</p>
                <small>${new Date(n.createdAt).toLocaleString()}</small>
                <br><br>

                ${!n.isRead
                    ? `<button onclick="markRead(${n.id})">Mark as read</button>`
                    : ""
                }
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p>Failed to load notifications</p>`;
    }
}

async function markRead(id) {
    try {
        await API.post(`/api/notification/read/${id}`);
        await loadNotifications();
    } catch (err) {
        console.error(err);
    }
}