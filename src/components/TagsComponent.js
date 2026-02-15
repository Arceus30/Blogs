"use client";
import api from "@/lib/api";
const LIMIT = 90;
import { useState, useEffect } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import Link from "next/link";
import { useToast } from "@/context/toast-provider";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

export default function TagsComponent({ page }) {
    const router = useRouter();
    const [tag, setTag] = useState([]);
    const { setToast } = useToast();
    const [maxPage, setMaxPage] = useState(-1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `${process.env.NEXT_PUBLIC_TAGS_API}?page=${page}&limit=${LIMIT}`,
                );
                const tags = response.data.tags;
                setTag(tags);
                setMaxPage(response.data.totalPages);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setTag([]);
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
                {tag?.map((tg, idx) => (
                    <Link
                        key={tg?._id || idx}
                        href={`${process.env.NEXT_PUBLIC_TAG}/${tg._id}`}
                        className="p-1 cursor-pointer rounded-lg flex items-center justify-center hover:text-blue-900 hover:underline"
                    >
                        <h3 className="text-xl font-semibold hover:font-bold">
                            {tg.name}
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
