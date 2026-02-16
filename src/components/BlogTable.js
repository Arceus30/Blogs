"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/toast-provider";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import Link from "next/link";
import api from "@/lib/api";
import { useUser } from "@/context/user-provider";
import Loading from "@/app/loading";

const LIMIT = 6;
export default function BlogTable({ page, author, isArchived = false }) {
    const [blogs, setBlogs] = useState([]);
    const [maxPage, setMaxPage] = useState(-1);
    const router = useRouter();
    const { setToast } = useToast();
    const { user } = useUser();
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                let route = "";
                if (!isArchived) route = process.env.NEXT_PUBLIC_BLOGS_API;
                else route = process.env.NEXT_PUBLIC_ADMIN_ARCHIVED_BLOG_API;
                route += `?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(LIMIT)}&author=${author?._id}`;
                const res = await api.get(route);
                setBlogs(res?.data?.blogs);
                setMaxPage(res?.data?.maxPage);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setToast(errorMessage, "error");
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        if (author) {
            fetchBlogs();
        }
    }, [page, author, refresh, isArchived, setToast]);

    const toggleArchive = async (blog) => {
        try {
            await api.patch(
                `${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", blog?.slug)}`,
                {
                    field: "status",
                    value:
                        blog.status === "archived" ? "published" : "archived",
                },
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast(
                blog.status === "archived"
                    ? "Blog Unarchived"
                    : "Blog Archived",
                "success",
            );
            setRefresh((prev) => !prev);
        } catch (err) {
            console.error(`Archive Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        }
    };

    const handleDelete = async (slug) => {
        try {
            await api.delete(
                `${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", slug)}`,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setRefresh((prev) => !prev);
            setToast("Blog deleted successfully", "success");
        } catch (err) {
            console.error(`Delete Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-8 py-4 text-center text-sm font-medium text-gray-500 uppercase">
                            Serial No.
                        </th>
                        <th className="px-8 py-4 text-center text-sm font-medium text-gray-500 uppercase">
                            Blog Title
                        </th>
                        <th className="px-8 py-4 text-center text-sm font-medium text-gray-500 uppercase">
                            Category
                        </th>
                        {user?._id?.toString() === author?._id?.toString() && (
                            <>
                                <th className="px-8 py-4 text-center text-sm font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-8 py-4 text-center text-sm font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {blogs?.map((blog, index) => (
                        <tr
                            key={blog?._id || index}
                            className="hover:bg-gray-400/25"
                        >
                            <td className="px-8 py-4 text-center text-sm font-medium text-gray-900">
                                {index + 1}
                            </td>
                            <td className="px-8 py-4 max-w-md text-center">
                                <Link
                                    href={`${process.env.NEXT_PUBLIC_BLOG}/${blog?.slug}`}
                                    className="text-sm font-medium text-gray-900 truncate hover:underline"
                                >
                                    {blog.title}
                                </Link>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap text-center">
                                <Link
                                    href={`${user?._id?.toString() !== author?._id?.toString() ? process.env.NEXT_PUBLIC_CATEGORY : process.env.NEXT_ADMIN_CATEGORY}/${blog?.category?.slug}`}
                                    className="text-sm text-gray-900 hover:underline"
                                >
                                    {blog.category?.name}
                                </Link>
                            </td>
                            {user?._id?.toString() ===
                                author?._id?.toString() && (
                                <>
                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                        <span
                                            className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full`}
                                        >
                                            {blog.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-center">
                                        {blog?.author?._id?.toString() ===
                                            user?._id?.toSing() && (
                                            <button
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                onClick={() =>
                                                    router.push(
                                                        `${process.env.NEXT_PUBLIC_UPDATE_BLOG}/${blog.slug}`,
                                                    )
                                                }
                                            >
                                                Update
                                            </button>
                                        )}
                                        {blog.status !== "archived" ? (
                                            <button
                                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                                                onClick={() =>
                                                    toggleArchive(blog)
                                                }
                                            >
                                                Archive
                                            </button>
                                        ) : (
                                            <button
                                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                                                onClick={() =>
                                                    toggleArchive(blog)
                                                }
                                            >
                                                Unarchive
                                            </button>
                                        )}
                                        <button
                                            className="text-red-600 hover:text-red-900 font-medium"
                                            onClick={() =>
                                                handleDelete(blog?.slug)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {maxPage > 1 && (
                <div className="flex items-center justify-center gap-6">
                    <button
                        className="flex items-center justify-center hover:scale-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() =>
                            router.push(`?page=${Math.max(page - 1, 1)}`)
                        }
                    >
                        <FaAngleLeft size={30} />
                    </button>
                    <div className="flex items-center gap-2 py-2 text-center">
                        <span className="text-2xl font-bold">{page}</span>
                        <span className="text-3xl font-medium">...</span>
                        <span className="text-2xl font-bold">{maxPage}</span>
                    </div>
                    <button
                        className="flex items-center justify-center hover:scale-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                        disabled={page >= maxPage}
                        onClick={() =>
                            router.push(`?page=${Math.min(page + 1, maxPage)}`)
                        }
                    >
                        <FaAngleRight size={30} />
                    </button>
                </div>
            )}
        </>
    );
}
