const Storage = {

    setToken(token) {

        localStorage.setItem(
            "token",
            token
        );

    },

    getToken() {

        return localStorage.getItem(
            "token"
        );

    },

    setRole(role) {

        localStorage.setItem(
            "role",
            role
        );

    },

    getRole() {

        return localStorage.getItem(
            "role"
        );

    },

    clear() {

        localStorage.clear();

    }

};