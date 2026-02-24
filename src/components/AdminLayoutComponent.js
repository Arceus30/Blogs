"use client";
import { useAuth } from "@/context/auth-provider";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { useUser } from "@/context/user-provider";
import SidebarComponent from "@/components/SidebarComponent";

export default function AdminLayoutComponent({ children }) {
    const { isAuthenticated, isHydrated } = useAuth();
    const { user, userLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isHydrated && !isAuthenticated)
            router.replace(
                `${process.env.NEXT_PUBLIC_SIGN_IN}?returnTo=${pathname}`,
            );
    }, [isAuthenticated, isHydrated, pathname, router]);

    if (userLoading || !user) return <Loading />;
    return (
        <div className="grow flex bg-gray-300/20 relative flex-col sm:flex-row">
            <div className="flex items-start gap-2">
                <SidebarComponent />
            </div>
            <main className="grow sm:mx-3 flex flex-col">{children}</main>
        </div>
    );
}
