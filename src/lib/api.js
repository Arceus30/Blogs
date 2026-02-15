import axios from "axios";

const api = axios.create({ withCredentials: true });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token);
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    if (typeof window === "undefined") return config;

    const token =
        typeof window !== undefined
            ? sessionStorage.getItem("accessToken")
            : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            error.response?.data?.message?.includes("jwt expired") &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] =
                            `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    process.env.NEXT_PUBLIC_REFRESH_TOKEN_API,
                    {},
                    { withCredentials: true },
                );
                const newToken = refreshResponse?.data?.token;
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("accessToken", newToken);
                    window.dispatchEvent(
                        new CustomEvent("tokenRefreshed", { detail: newToken }),
                    );
                }
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("accessToken");
                    window.dispatchEvent(new CustomEvent("tokenCleared"));
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export default api;
