"use client";
import BlogCard from "@/components/BlogCard";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

const LIMIT = 9;
export default function CategoryComponent({ slug, page }) {
    const [name, setName] = useState("");
    const { setToast } = useToast();
    const [blogs, setBlogs] = useState([]);
    const [maxPage, setMaxPage] = useState(-1);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCat = async () => {
            setLoading(true);
            try {
                const catResponse = await api.get(
                    `${process.env.NEXT_PUBLIC_CATEGORY_API.replace("catSlug", slug)}`,
                );
                setName(catResponse.data?.category?.name);
                const blogResponse = await api.get(
                    `${process.env.NEXT_PUBLIC_BLOGS_API}?cat=${slug}&page=${page}&limit=${encodeURIComponent(LIMIT)}`,
                );
                setBlogs(blogResponse.data?.blogs);
                setMaxPage(blogResponse.data?.maxPage);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setName("");
                setBlogs([]);
                setToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCat();
    }, [page, slug, setToast]);

    if (loading) return <Loading />;

    return (
        <>
            <h2 className="text-3xl font-bold mb-8 text-center">
                Latest Blogs
                {name &&
                    ` from category ${name.charAt(0).toUpperCase() + name.slice(1)}`}
            </h2>
            <div className="grid grid-cols-3 gap-8">
                {blogs?.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                ))}
            </div>
            {maxPage > 1 && (
                <div className="flex items-center justify-center gap-6">
                    <button
                        className="flex items-center justify-center hover:scale-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() =>
                            router.push(`?page=${Math.max(1, page - 1)}`)
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
                            router.push(`?page=${Math.min(maxPage, page + 1)}`)
                        }
                    >
                        <FaAngleRight size={30} />
                    </button>
                </div>
            )}
        </>
    );
}
