"use client";
import BlogCard from "./BlogCard";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { MdBlock } from "react-icons/md";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import Loading from "@/app/loading";
import Link from "next/link";
import useScreenLimit from "@/hooks/mobileHook";

export default function BlogList({ cat, page }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxPage, setMaxPage] = useState(-1);
    const { setToast } = useToast();
    const { blogLimit } = useScreenLimit();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                let route = `${process.env.NEXT_PUBLIC_BLOGS_API}`;
                route += `?cat=${encodeURIComponent(cat)}`;
                route += `&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(blogLimit)}`;
                const res = await api.get(route);
                setBlogs(res.data?.blogs);
                setMaxPage(res.data?.maxPage);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setToast(errorMessage, "error");
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [page, cat, setToast]);

    if (loading) return <Loading />;

    return (
        blogs.length > 0 && (
            <>
                <h2 className="text-3xl font-bold mb-8 text-center">
                    Latest Blogs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {blogs?.map((blog) => (
                        <BlogCard key={blog?._id} blog={blog} />
                    ))}
                </div>

                {maxPage > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-3">
                        {page === 1 ? (
                            <MdBlock size={32} style={{ color: "#9d9d9dd6" }} />
                        ) : (
                            <Link
                                className="flex items-center justify-center hover:scale-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous page"
                                disabled={page === 1}
                                href={`?page=${Math.max(1, page - 1)}`}
                            >
                                <FaAngleLeft size={30} />
                            </Link>
                        )}
                        <div className="flex items-center gap-2 py-2 text-center">
                            <span className="text-2xl font-bold">{page}</span>
                            <span className="text-3xl font-medium">...</span>
                            <span className="text-2xl font-bold">
                                {maxPage}
                            </span>
                        </div>
                        {page >= maxPage ? (
                            <MdBlock size={32} style={{ color: "#9d9d9dd6" }} />
                        ) : (
                            <Link
                                className="flex items-center justify-center hover:scale-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Next page"
                                href={`?page=${Math.min(maxPage, page + 1)}`}
                            >
                                <FaAngleRight size={30} />
                            </Link>
                        )}
                    </div>
                )}
            </>
        )
    );
}
