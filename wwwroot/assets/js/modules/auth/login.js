async function login() {

    try {

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        const response =
            await API.request(
                "/api/auth/login",
                "POST",
                { email, password }
            );

        // =========================
        // FIX AN TOÀN (HANDLE 2 FORMAT)
        // =========================

        const token = response.token;

        const user = response.user || response;

        const role = response.user?.role || response.role;

        if (!token || !role) {
            throw new Error("Invalid login response format");
        }

        Storage.setToken(token);
        Storage.setUser(user);
        Storage.setRole(role);

        Router.redirectByRole();

    }
    catch (err) {

        console.error(err);
        alert("Login failed");
    }
}