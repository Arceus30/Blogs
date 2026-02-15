"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/auth-provider";
import { useUser } from "@/context/user-provider";
import Searchbar from "./Searchbar";
import { useToast } from "@/context/toast-provider";
import Loading from "@/app/loading";
import api from "@/lib/api";

export default function Header() {
    const { isAuthenticated, clearToken } = useAuth();
    const { user } = useUser();
    const { setToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await api.post(process.env.NEXT_PUBLIC_SIGN_OUT_API);
            setIsOpen(false);
            clearToken();
            setToast("Logout Successful", "success");
            window.location.href = process.env.NEXT_PUBLIC_HOMEPAGE;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
            console.error("Error logging out:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <header className="px-8 pt-2 pb-2 gap-2 flex items-center justify-between">
            <div className="flex grow items-center justify-between gap-3">
                <nav className="flex gap-5 mx-5 items-center">
                    <Link
                        href={process.env.NEXT_PUBLIC_HOMEPAGE}
                        className="flex items-center gap-5"
                    >
                        <Image
                            src="/KK_Logo.png"
                            alt="KK logo"
                            width={40}
                            height={40}
                            priority
                            className="w-13"
                        />
                        <span className="hover:text-blue-600">Home</span>
                    </Link>
                    <Link
                        href={process.env.NEXT_PUBLIC_ABOUT}
                        className="hover:text-blue-600"
                    >
                        About
                    </Link>
                    <Link
                        href={process.env.NEXT_PUBLIC_CONTACT_US}
                        className="hover:text-blue-600"
                    >
                        Contact Us
                    </Link>
                    <Link
                        href={process.env.NEXT_PUBLIC_CATEGORY}
                        className="hover:text-blue-600"
                    >
                        Category
                    </Link>
                    <Link
                        href={process.env.NEXT_PUBLIC_TAG}
                        className="hover:text-blue-600"
                    >
                        Tag
                    </Link>
                </nav>
                <Searchbar />
            </div>
            <div className="flex items-center justify-center gap-3 w-35 relative">
                {isAuthenticated ? (
                    <>
                        <button
                            onClick={() => {
                                setIsOpen((prev) => !prev);
                            }}
                            className="cursor-pointer hover:opacity-75 text-white p-2 rounded-md text-lg relative"
                        >
                            {user?.profilePhoto ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", user?.profilePhoto)}`}
                                    alt="Profile"
                                    height={50}
                                    width={50}
                                    className="w-[50px] h-[50px] rounded-full object-cover  object-center overflow-hidden"
                                    loading="lazy"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-[50px] h-[50px] rounded-full border border-2 border-black text-black flex items-center justify-center font-medium text-xl">
                                    {user?.firstName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                    {user?.lastName?.charAt(0)?.toUpperCase() ||
                                        "U"}
                                </div>
                            )}
                        </button>
                        {isOpen && (
                            <div
                                className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-md py-2 w-48 z-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <Link
                                    href={process.env.NEXT_PUBLIC_DASHBOARD}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href={
                                        process.env
                                            .NEXT_PUBLIC_UPDATE_ADMIN_PROFILE
                                    }
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Update Profile
                                </Link>
                                <Link
                                    href={
                                        process.env.NEXT_PUBLIC_CHANGE_PASSWORD
                                    }
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Change Password
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <FiLogOut />
                                    Logout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-3 w-full">
                        <Link
                            href={`${process.env.NEXT_PUBLIC_SIGN_UP}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm cursor-pointer"
                        >
                            Sign Up
                        </Link>
                        <Link
                            href={`${process.env.NEXT_PUBLIC_SIGN_IN}`}
                            className="border border-gray-300 hover:opacity-75 p-2 rounded-md text-sm cursor-pointer"
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
