const API = {

    get base() {
        return CONFIG.API_BASE.replace(/\/$/, "");
    },

    async request(endpoint, method = "GET", body = null) {

        const token = Storage.getToken();

        const url = endpoint.startsWith("http")
            ? endpoint
            : this.base + endpoint;

        const options = {
            method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (token) {
            options.headers.Authorization = "Bearer " + token;
        }

        if (body !== null) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {

            let errorText = "";

            try {
                errorText = await response.text();
            } catch {}

            try {
                throw errorText
                    ? JSON.parse(errorText)
                    : {
                        message: "Request failed",
                        status: response.status
                    };
            } catch {
                throw {
                    message: errorText || "Request failed",
                    status: response.status
                };
            }
        }

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }

        return await response.text();
    },

    async get(endpoint) {
        return this.request(endpoint, "GET");
    },

    async post(endpoint, body = null) {
        return this.request(endpoint, "POST", body);
    },

    async put(endpoint, body = null) {
        return this.request(endpoint, "PUT", body);
    },

    async delete(endpoint) {
        return this.request(endpoint, "DELETE");
    }
};