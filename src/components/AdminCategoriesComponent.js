"use client";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import { MdEdit } from "react-icons/md";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

const limit = 45;
export default function Categories({ page }) {
    const [categories, setCategories] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [maxPage, setMaxPage] = useState(-1);
    const { setToast } = useToast();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `${process.env.NEXT_PUBLIC_ADMIN_CATEGORIES_API}?page=${page}&limit=${limit}`,
                );
                setCategories(response.data.categories);
                setMaxPage(response.data.totalPages);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setCategories([]);
                setToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [refresh, page, setToast]);

    const handleDeleteCategory = async (id, slug) => {
        if (categories.find((cat) => cat._id === id).name === "general") {
            setToast("General category cannot be deleted", "error");
            return;
        }
        setLoading(true);
        try {
            await api.delete(
                `${process.env.NEXT_PUBLIC_ADMIN_CATEGORY_API.replace("catSlug", slug)}`,
            );
            setToast("Category deleted successfully", "success");
            setRefresh((prev) => !prev);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    if (loading) return <Loading />;

    return (
        <>
            <div className="grow grid grid-rows-9 grid-cols-5 gap-5">
                {categories?.map((cat, idx) => (
                    <div
                        key={cat?._id || idx}
                        className="flex items-center justify-between hover:bg-gray-300 rounded-xl gap-2 px-2 mx-5"
                    >
                        <Link
                            href={`${process.env.NEXT_PUBLIC_ADMIN_CATEGORY.replace("catSlug", cat?.slug)}`}
                            className="p-1 cursor-pointer rounded-lg flex items-center justify-center hover:text-blue-900 hover:underline"
                        >
                            <h3 className="text-xl font-semibold hover:font-bold">
                                {cat?.name.charAt(0).toUpperCase() +
                                    cat?.name.slice(1)}
                            </h3>
                        </Link>
                        <div className="flex gap-2">
                            {cat?.slug !== "general" && (
                                <>
                                    <Link
                                        className="bg-yellow-500 text-white font-medium p-2 rounded-xl border cursor-pointer hover:bg-yellow-700"
                                        href={`${process.env.NEXT_PUBLIC_ADMIN_UPDATE_CATEGORY}/${cat?.slug}`}
                                    >
                                        <MdEdit />
                                    </Link>
                                    <button
                                        className="bg-red-500 text-white font-medium p-2 rounded-xl border cursor-pointer hover:bg-red-700"
                                        onClick={() =>
                                            handleDeleteCategory(
                                                cat?._id,
                                                cat?.slug,
                                            )
                                        }
                                    >
                                        <MdDelete />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {categories?.length > 0 && maxPage > 1 && (
                <div className="flex items-center justify-center gap-6 m-3">
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
                    <div className="flex items-center gap-2 py-3 text-center">
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
