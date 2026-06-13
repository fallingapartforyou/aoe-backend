const CONFIG = {

    API_BASE:
        window.location.hostname === "localhost"
            ? "https://localhost:7225"
            : "https://aoe-backend-3.onrender.com",

    ROLES: {

        ADMIN: "admin",

        TEACHER: "teacher",

        STUDENT: "student"
    },

    ENDPOINTS: {

        EXAM: "/api/exam",

        AI: "/api/ai",

        STUDENT: "/student",

        TEACHER: "/teacher"
    }
};