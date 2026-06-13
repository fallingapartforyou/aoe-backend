window.Storage = {

    // ===== TOKEN =====
    getToken() {
        return localStorage.getItem("token");
    },

    setToken(token) {
        localStorage.setItem("token", token);
    },

    removeToken() {
        localStorage.removeItem("token");
    },

    // ===== USER =====
    getUser() {
        return JSON.parse(localStorage.getItem("user") || "null");
    },

    setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    },

    removeUser() {
        localStorage.removeItem("user");
    },

    // ===== ROLE (FIX CHÍNH Ở ĐÂY) =====
    getRole() {
        const user = Storage.getUser();
        return user?.role || null;
    },

    setRole(role) {
        // nếu backend trả role trong user thì vẫn set riêng cho chắc
        localStorage.setItem("role", role);
    },

    getRoleDirect() {
        return localStorage.getItem("role");
    },

    removeRole() {
        localStorage.removeItem("role");
    },

    clear() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "role"
    );
}
};