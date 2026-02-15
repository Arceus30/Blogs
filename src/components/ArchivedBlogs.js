"use client";
import { useUser } from "@/context/user-provider";
import BlogTable from "./BlogTable";
import { fullName } from "@/utils/formatName";

export default function ArchivedBlogsComponent({ page = 1 }) {
    const { user, userLoading } = useUser();

    return (
        <div className="grow mx-3 flex flex-col">
            <div className="flex justify-between items-center p-2">
                {!userLoading && (
                    <h1 className="text-lg font-semibold px-5 py-1">
                        {fullName(user?.firstName, user?.lastName)}
                    </h1>
                )}
            </div>
            <div className="border-b-2 p-2">
                <h1 className="text-2xl font-bold text-gray-900">
                    Archived Blogs
                </h1>
            </div>
            <div className="overflow-x-auto">
                {!userLoading && (
                    <BlogTable page={page} author={user} isArchived={true} />
                )}
            </div>
        </div>
    );
}
