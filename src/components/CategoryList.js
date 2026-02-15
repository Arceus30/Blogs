"use client";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/context/toast-provider";
import Loading from "@/app/loading";

const LIMIT = 6;

export default function CategoryList() {
    const [allCategories, setAllCategories] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const { setToast } = useToast();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    process.env.NEXT_PUBLIC_CATEGORIES_API,
                );
                const allCount = response.data?.categories?.reduce(
                    (acc, val) => acc + val?.blogCount,
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
                setAllCategories(categories);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setAllCategories([]);
                setToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [setToast]);

    const maxIdx = allCategories?.length;
    const currentCategories = allCategories?.slice(
        currentIdx,
        currentIdx + LIMIT,
    );

    if (loading) return <Loading />;

    return (
        allCategories.length > 1 && (
            <>
                <h2 className="text-3xl font-bold mb-8 text-center">
                    Categories
                </h2>
                <div className="flex items-center justify-center gap-7">
                    <button
                        className="cursor-pointer hover:scale-120 hover:text-[#296374] disabled:cursor-not-allowed flex items-center"
                        disabled={currentIdx === 0}
                        onClick={() =>
                            setCurrentIdx((prevIdx) => Math.max(0, prevIdx - 1))
                        }
                    >
                        <FaAngleLeft size={25} />
                    </button>
                    <div className="w-2/3 flex items-center justify-center gap-5">
                        {currentCategories?.map((cat, idx) => (
                            <Link
                                key={cat?._id || idx}
                                href={`${process.env.NEXT_PUBLIC_HOMEPAGE}?cat=${cat?.slug}`}
                                className="p-1 cursor-pointer rounded-lg hover:bg-gray-300 flex items-center justify-center hover:text-blue-900"
                            >
                                <h3 className="text-xl font-semibold hover:font-bold">
                                    {cat?.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                    <button
                        className="cursor-pointer hover:scale-120 hover:text-[#296374] disabled:cursor-not-allowed flex items-center"
                        disabled={currentIdx + LIMIT >= maxIdx}
                        onClick={() =>
                            setCurrentIdx((prevIdx) =>
                                Math.min(maxIdx, prevIdx + 1),
                            )
                        }
                    >
                        <FaAngleRight size={25} />
                    </button>
                </div>
            </>
        )
    );
}
