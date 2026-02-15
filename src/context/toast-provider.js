"use client";
import { createContext, useContext, useCallback } from "react";
import { toast } from "react-toastify";

const ToastContext = createContext({
    setToast: () => {},
    clearToast: () => {},
});

const typeMap = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warn,
};

export function ToastProvider({ children }) {
    const setToast = useCallback((message, type = "info") => {
        const toastFn = typeMap[type];
        toastFn(message);
    }, []);

    return (
        <ToastContext.Provider value={{ setToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
