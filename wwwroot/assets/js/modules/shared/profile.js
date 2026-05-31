window.onload = () => {

    const role = Storage.getRole();

    renderLayout(role);

    loadProfile();
};

async function loadProfile() {

    try {

        const profile =
            await API.request("/api/user/profile");

        // ===== FORM =====

        document.getElementById("name").value =
            profile.name || "";

        document.getElementById("email").value =
            profile.email || "";

        document.getElementById("phone").value =
            profile.phone || "";

        document.getElementById("role").value =
            profile.role || "";

        // ===== SIDEBAR =====

        document.getElementById("displayName").innerText =
            profile.name || "User";

        document.getElementById("avatar").innerText =
            (profile.name || "U")[0].toUpperCase();

        const badge =
            document.getElementById("roleBadge");

        badge.innerText =
            profile.role || "user";

        badge.classList.remove(
            "teacher",
            "student"
        );

        if (profile.role) {

            badge.classList.add(profile.role);

        }

    } catch (err) {

        console.error(err);

        alert("Failed to load profile");
    }
}

async function updateProfile() {

    const btn =
        document.getElementById("updateBtn");

    const name =
        document.getElementById("name")
        .value
        .trim();

    const phone =
        document.getElementById("phone")
        .value
        .trim();

    if (!name) {

        alert("Name cannot be empty");

        return;
    }

    btn.disabled = true;

    btn.innerText = "Updating...";

    try {

        await API.request(
            "/api/user/update-profile",
            "PUT",
            {
                name,
                phone
            }
        );

        // ===== UPDATE UI =====

        document.getElementById("displayName").innerText =
            name;

        document.getElementById("avatar").innerText =
            name[0].toUpperCase();

        btn.innerText = "Saved";

        setTimeout(() => {

            btn.disabled = false;

            btn.innerText = "Save Changes";

        }, 1200);

    } catch (err) {

        console.error(err);

        btn.disabled = false;

        btn.innerText = "Save Changes";

        alert("Update failed");
    }
}