const CONFIG = {
    API_BASE: window.location.hostname === "localhost"
        ? "https://localhost:7225/api"
        : "/api",

    ROLES: {
        TEACHER: "teacher",
        STUDENT: "student"
    }
};