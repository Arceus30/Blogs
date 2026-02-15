"use client";
import { useToast } from "@/context/toast-provider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fullName } from "@/utils/formatName";
import api from "@/lib/api";
import Loading from "@/app/loading";

export default function SearchComponent({ q }) {
    const [data, setData] = useState({});
    const router = useRouter();
    const { setToast } = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `${process.env.NEXT_PUBLIC_SEARCH_SUGGESTIONS_API}?q=${encodeURIComponent(q)}`,
                );
                setData(response.data.search_suggestions);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setData([]);
                setToast(errorMessage, "error");
                console.error("Search suggestions error:", errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (q && q.length > 2) fetch();
        else setToast("Query is very short", info);
    }, [q, setToast]);

    const handleSuggestionClick = (dat, item) => {
        let route = "/";
        if (dat === "blogs") {
            route = `${process.env.NEXT_PUBLIC_BLOG}/${item.slug}`;
        } else if (dat === "categories") {
            route = `${process.env.NEXT_PUBLIC_CATEGORY}/${item.slug}`;
        } else if (dat === "tags") {
            route = `${process.env.NEXT_PUBLIC_TAG}/${item._id}`;
        } else if (dat === "authors") {
            route = `${process.env.NEXT_PUBLIC_AUTHOR}/${item._id}`;
        }
        setData([]);
        router.push(route);
    };

    if (loading) return <Loading />;

    return (
        <>
            {Object.keys(data).map((dat, idx) => {
                if (data[dat] && data[dat].length)
                    return (
                        <div
                            className="border-gray-500/40 px-2 border-r"
                            key={idx}
                        >
                            <h4 className="px-4 py-2 text-sm font-semibold text-red-500 uppercase">
                                {dat}
                            </h4>
                            <div className="overflow-auto max-h-[550px]">
                                {data[dat].map((item, jdx) => {
                                    return (
                                        <button
                                            key={item._id || jdx}
                                            onClick={() =>
                                                handleSuggestionClick(dat, item)
                                            }
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none rounded-lg cursor-pointer"
                                        >
                                            <div className="text-sm font-medium text-gray-900 truncate hover:underline">
                                                {dat === "blogs"
                                                    ? item.title
                                                    : dat === "tags"
                                                      ? `${item.name}`
                                                      : dat === "categories"
                                                        ? item.name
                                                        : dat === "authors"
                                                          ? fullName(
                                                                item?.firstName,
                                                                item?.lastName,
                                                            )
                                                          : ""}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
            })}
        </>
    );
}
