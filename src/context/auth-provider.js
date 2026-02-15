"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() =>
        typeof window !== "undefined"
            ? sessionStorage.getItem("accessToken")
            : null,
    );
    const [isHydrated, setIsHydrated] = useState(false);

    const checkToken = useCallback(() => {
        if (typeof window !== "undefined") {
            setAccessToken(sessionStorage.getItem("accessToken") || null);
        }
    }, []);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleTokenRefreshed = useCallback((e) => {
        if (!e?.detail) return;
        setAccessToken(e.detail);
    }, []);

    const clearToken = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("accessToken");
        }
        setAccessToken(null);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.addEventListener("tokenRefreshed", handleTokenRefreshed);
        window.addEventListener("tokenCleared", clearToken);

        return () => {
            window.removeEventListener("tokenRefreshed", handleTokenRefreshed);
            window.removeEventListener("tokenCleared", clearToken);
        };
    }, [handleTokenRefreshed, clearToken]);

    const value = {
        accessToken,
        isAuthenticated: !!accessToken && isHydrated,
        checkToken,
        clearToken,
        isHydrated,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
