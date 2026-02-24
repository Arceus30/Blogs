"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/auth-provider";
import { useUser } from "@/context/user-provider";
import Searchbar from "./Searchbar";
import { useToast } from "@/context/toast-provider";
import Loading from "@/app/loading";
import api from "@/lib/api";
import { FaTimes } from "react-icons/fa";

export default function Header() {
    const { isAuthenticated, clearToken } = useAuth();
    const { user } = useUser();
    const { setToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [openNavbar, setOpenNavbar] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const profileButtonRef = useRef(null);

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

    useEffect(() => {
        if (openNavbar) {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }
        return () => document.body.classList.remove("sidebar-open");
    }, [openNavbar]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    if (loading) return <Loading />;

    return (
        <header className="p-1 md:px-8 sm:py-2 gap-2 flex items-center justify-between">
            <div className="flex grow items-center justify-between gap-3">
                <button
                    onClick={() => setOpenNavbar(true)}
                    className="sm:hidden cursor-pointer hover:opacity-50 pl-5 pt-5"
                >
                    <RxHamburgerMenu size={40} />
                </button>

                {/* Mobile Nav */}
                {openNavbar && (
                    <div className="fixed inset-0 bg-white flex z-50 h-[100vh]">
                        <div className="flex flex-col w-full p-1 sm:px-8 sm:py-2 gap-2">
                            <button
                                onClick={() => setOpenNavbar(false)}
                                className="cursor-pointer hover:opacity-50 pl-5 pt-5 mb-2"
                            >
                                <FaTimes size={40} />
                            </button>
                            <div className="w-9/10 mx-auto">
                                <Searchbar />
                            </div>
                            <nav className="border-t-2 flex flex-col gap-6 mx-5 my-3 py-6 justify-center">
                                <Link
                                    href={process.env.NEXT_PUBLIC_HOMEPAGE}
                                    className="hover:text-blue-600 text-2xl"
                                    onClick={() => setOpenNavbar(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    href={process.env.NEXT_PUBLIC_ABOUT}
                                    className="hover:text-blue-600 text-2xl"
                                    onClick={() => setOpenNavbar(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    href={process.env.NEXT_PUBLIC_CONTACT_US}
                                    className="hover:text-blue-600 text-2xl"
                                    onClick={() => setOpenNavbar(false)}
                                >
                                    Contact Us
                                </Link>
                                <Link
                                    href={process.env.NEXT_PUBLIC_CATEGORY}
                                    className="hover:text-blue-600 text-2xl"
                                    onClick={() => setOpenNavbar(false)}
                                >
                                    Category
                                </Link>
                                <Link
                                    href={process.env.NEXT_PUBLIC_TAG}
                                    className="hover:text-blue-600 text-2xl"
                                    onClick={() => setOpenNavbar(false)}
                                >
                                    Tag
                                </Link>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Desktop Nav */}
                <div className="hidden grow sm:flex items-center justify-start w-full md:mr-3">
                    <nav className="flex grow items-center justify-start sm:gap-2 md:gap-4 lg:gap-5">
                        <Link
                            href={process.env.NEXT_PUBLIC_HOMEPAGE}
                            className="hover:text-blue-600 lg:text-lg"
                        >
                            Home
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_ABOUT}
                            className="hover:text-blue-600 lg:text-lg"
                        >
                            About
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_CONTACT_US}
                            className="hover:text-blue-600 lg:text-lg"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_CATEGORY}
                            className="hover:text-blue-600 lg:text-lg"
                        >
                            Category
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_TAG}
                            className="hover:text-blue-600 lg:text-lg"
                        >
                            Tag
                        </Link>
                    </nav>
                    <div className="w-9/10 sm:w-2/5 lg:w-2/4 md:mx-auto">
                        <Searchbar />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 relative z-60">
                {isAuthenticated ? (
                    <>
                        <button
                            ref={profileButtonRef}
                            onClick={() => {
                                setIsOpen((prev) => !prev);
                            }}
                            className="pr-5 pt-5 sm:pt-0 sm:pr-0 flex items-center justify-center cursor-pointer hover:opacity-75 relative"
                        >
                            {user?.profilePhoto ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", user?.profilePhoto)}`}
                                    alt="Profile"
                                    height={44}
                                    width={44}
                                    className="rounded-full object-cover  object-center overflow-hidden"
                                    loading="lazy"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-11 h-11 text-lg rounded-full border-2 border-black text-black flex items-center justify-center font-semibold">
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
                                ref={dropdownRef}
                                className="absolute right-3 top-18 sm:top-13 sm:right-1 bg-white border border-gray-200 rounded-md py-2 w-48 z-60"
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
                    <div className="pr-5 pt-5 sm:p-0 flex items-center justify-center gap-3">
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
