"use client";
import { useState, useEffect } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import Link from "next/link";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
const LIMIT = 45;

export default function CategoriesComponent({ page }) {
    const router = useRouter();
    const { setToast } = useToast();
    const [maxPage, setMaxPage] = useState(-1);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `${process.env.NEXT_PUBLIC_CATEGORIES_API}?page=${page}&limit=${LIMIT}&sortBy=name`,
                );
                const allCount = response.data?.categories?.reduce(
                    (acc, val) => acc + val.blogCount,
                    0,
                );

                const categories = [
                    {
                        _v: 0,
                        _id: "",
                        name: "All",
                        slug: "all",
                        blogCount: allCount,
                    },
                    ...response.data?.categories,
                ];
                setCategories(categories);
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
    }, [page, setToast]);

    if (loading) return <Loading />;

    return (
        <>
            <div className="grow grid grid-rows-9 grid-cols-5 gap-3">
                {categories?.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={`${process.env.NEXT_PUBLIC_CATEGORY}/${cat?.slug}`}
                        className="p-1 cursor-pointer rounded-lg flex items-center justify-center hover:text-blue-900 hover:underline"
                    >
                        <h3 className="text-xl font-semibold hover:font-bold">
                            {cat?.name.charAt(0).toUpperCase() +
                                cat?.name.slice(1)}
                        </h3>
                    </Link>
                ))}
            </div>
            {maxPage > 1 && (
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
