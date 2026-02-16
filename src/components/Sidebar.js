"use client";
import { FaTimes } from "react-icons/fa";
import { useRef, useEffect } from "react";
import Image from "next/image";
import {
    MdDashboard,
    MdPostAdd,
    MdCategory,
    MdArchive,
    MdAccountCircle,
    MdLogout,
} from "react-icons/md";
import Link from "next/link";
import { useAuth } from "@/context/auth-provider";
import { fullName } from "@/utils/formatName";
import { useUser } from "@/context/user-provider";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import { IoIosReturnLeft } from "react-icons/io";

export default function Sidebar({ setIsOpen }) {
    const overlay = useRef(null);
    const wrapper = useRef(null);
    const { clearToken } = useAuth();
    const { user } = useUser();
    const { setToast } = useToast();

    const handleLogout = async () => {
        try {
            await api.post(process.env.NEXT_PUBLIC_SIGN_OUT_API);
            setIsOpen(false);
            clearToken();
            window.location.href = process.env.NEXT_PUBLIC_HOMEPAGE;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
            console.error("Error logging out:", err);
        }
    };

    const handleClick = useCallback(
        (e) => {
            if (
                wrapper.current &&
                !wrapper.current.contains(e.target) &&
                overlay.current &&
                overlay.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        },
        [setIsOpen],
    );

    const handleLinkClick = () => setIsOpen(false);

    useEffect(() => {
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [handleClick]);

    return (
        <div
            ref={overlay}
            className="fixed inset-0 bg-black/50 flex z-50 h-[100vh]"
        >
            <div className="wrapper" ref={wrapper}>
                <div className="absolute top-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col">
                    <div className="px-2 py-[23px] border-b-2 flex justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-white p-2 rounded-md text-lg">
                                {user?.profilePhoto ? (
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", user?.profilePhoto)}`}
                                        alt={`${fullName(user?.firstName, user?.lastName)}'s profile`}
                                        height={50}
                                        width={50}
                                        className="w-[50px] h-[50px] rounded-full object-cover object-center overflow-hidden"
                                        loading="lazy"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-[50px] h-[50px] rounded-full border border-2 border-black text-black flex items-center justify-center font-medium text-xl">
                                        {user?.firstName
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                        {user?.lastName
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="font-semibold text-lg">
                                    {fullName(user?.firstName, user?.lastName)}
                                </h1>
                            </div>
                        </div>
                        <button
                            className="mt-2 me-2 flex justify-center hover:text-gray-500 cursor-pointer"
                            onClick={handleLinkClick}
                        >
                            <FaTimes size={25} />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-5 p-7">
                        <Link
                            href={process.env.NEXT_PUBLIC_DASHBOARD}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-slate-800 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdDashboard size={30} />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_CREATE_BLOG}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-emerald-700 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdPostAdd size={30} />
                            <span>Create Blog</span>
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_ARCHIVED_BLOG}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-indigo-700 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdArchive size={30} />
                            <span>Archived Blogs</span>
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_ADMIN_CATEGORIES}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-amber-700 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdCategory size={30} />
                            <span>Show Category</span>
                        </Link>

                        <Link
                            href={process.env.NEXT_PUBLIC_UPDATE_ADMIN_PROFILE}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-purple-800 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdAccountCircle size={30} />
                            <span>Update Profile</span>
                        </Link>
                        <Link
                            href={process.env.NEXT_PUBLIC_CHANGE_PASSWORD}
                            className="flex items-center text-lg gap-1 hover:text-slate-700 hover:scale-105 cursor-pointer text-purple-800 hover:font-bold"
                            onClick={handleLinkClick}
                        >
                            <MdAccountCircle size={30} />
                            <span>Change Password</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-lg gap-1 hover:scale-105 cursor-pointer text-red-700 hover:opacity-75 hover:font-bold"
                        >
                            <MdLogout size={30} />
                            <span>Sign Out</span>
                        </button>
                    </nav>
                    <div className="flex justify-end items-end mx-1 absolute right-2 bottom-2">
                        <Link
                            className="text-blue-400 flex items-center relative top-3"
                            href={process.env.NEXT_PUBLIC_HOMEPAGE}
                            onClick={handleLinkClick}
                        >
                            <IoIosReturnLeft size={50} />
                            <span className="text-lg">To Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
