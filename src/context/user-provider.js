"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import api from "@/lib/api";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

const UserContext = createContext();

export function UserProvider({ children }) {
    const { accessToken } = useAuth();
    const [user, setUser] = useState(null);
    const { setToast } = useToast();
    const [userLoading, setUserLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setUserLoading(true);
        try {
            const res = await api.get(
                process.env.NEXT_PUBLIC_ADMIN_PROFILE_API,
            );
            setUser(res?.data?.user);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message;
            if (errorMessage !== "jwt expired") setToast(errorMessage, "error");
            setUser(null);
        } finally {
            setUserLoading(false);
        }
    }, [setToast]);

    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            setUserLoading(false);
            return;
        }
        fetchUser();
    }, [accessToken, fetchUser]);

    const refreshUser = fetchUser;

    const value = useMemo(
        () => ({
            user,
            userLoading,
            refreshUser,
        }),
        [user, userLoading, refreshUser],
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
