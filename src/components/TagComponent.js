"use client";
import api from "@/lib/api";
import BlogCard from "@/components/BlogCard";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

export default function TagComponent({ page, tagId }) {
    const [name, setName] = useState("");
    const { setToast } = useToast();
    const [blogs, setBlogs] = useState([]);
    const [maxPage, setMaxPage] = useState(-1);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTag = async () => {
            setLoading(true);
            try {
                const tagResponse = await api.get(
                    `${process.env.NEXT_PUBLIC_TAG_API.replace("tagId", tagId)}`,
                );
                setName(tagResponse.data?.tag?.name);

                const blogResponse = await api.get(
                    `${process.env.NEXT_PUBLIC_BLOGS_API}?tag=${tagId}&page=${page}&limit=9`,
                );
                setBlogs(blogResponse?.data?.blogs);
                setMaxPage(blogResponse?.data?.maxPage);
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

        if (tagId) fetchTag();
    }, [page, tagId, setToast]);

    if (loading) return <Loading />;

    return (
        <>
            <h2 className="text-3xl font-bold mb-8 text-center">
                Latest Blogs {name && `from tag ${name}`}
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
