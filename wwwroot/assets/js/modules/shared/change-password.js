async function changePassword() {

    const btn =
        document.getElementById("changeBtn");

    const oldPassword =
        document.getElementById("oldPassword")
        .value
        .trim();

    const newPassword =
        document.getElementById("newPassword")
        .value
        .trim();

    if (!oldPassword || !newPassword) {

        return alert("Please fill all fields");

    }

    if (newPassword.length < 6) {

        return alert(
            "New password must be at least 6 characters"
        );
    }

    btn.disabled = true;

    btn.innerText = "Changing...";

    try {

        await API.request(
            "/api/user/change-password",
            "PUT",
            {
                oldPassword,
                newPassword
            }
        );

        btn.innerText = "Changed";

        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";

        setTimeout(() => {

            btn.disabled = false;

            btn.innerText = "Change Password";

        }, 1200);

    } catch (err) {

        console.error(err);

        btn.disabled = false;

        btn.innerText = "Change Password";

        alert("Change password failed");
    }
}