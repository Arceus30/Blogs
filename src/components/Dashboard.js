"use client";
import { fullName } from "@/utils/formatName";
import { useUser } from "@/context/user-provider";
import Link from "next/link";
import BlogTable from "@/components/BlogTable";
import { FaRegSquarePlus } from "react-icons/fa6";

export default function DashboardCompnent({ page = 1 }) {
    const { user, userLoading } = useUser();

    return (
        !userLoading &&
        user && (
            <>
                <div className="flex justify-between items-center p-2">
                    <div className="px-5 py-1">
                        <h1 className="text-lg font-semibold">
                            Hi, {fullName(user?.firstName, user?.lastName)}
                        </h1>
                        <p className="text-sm text-gray-500">{user.bio}</p>
                    </div>
                    <Link
                        className="flex justify-center items-center gap-2 text-lg font-semibold text-white px-5 py-1 bg-green-500 rounded-2xl mr-25 hover:bg-green-700"
                        href={process.env.NEXT_PUBLIC_CREATE_BLOG}
                    >
                        Create new Blog <FaRegSquarePlus />
                    </Link>
                </div>
                <div className="border-b-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        All Blogs
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your blog posts</p>
                </div>
                <div className="overflow-x-auto">
                    {!userLoading && <BlogTable page={page} author={user} />}
                </div>
            </>
        )
    );
}
