"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fullName } from "@/utils/formatName";
import { useToast } from "@/context/toast-provider";
import Link from "next/link";
import api from "@/lib/api";
import Loading from "@/app/loading";
import Comments from "@/components/Comments.js";

export default function BlogComponent({ slug }) {
    const [blog, setBlog] = useState(null);
    const { setToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(
                    `${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", slug)}`,
                );
                setBlog(res?.data?.blog);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [slug, refresh, setToast]);

    if (loading) return <Loading />;

    return (
        <>
            <article className="w-full p-2">
                {blog?.bannerImage &&
                    blog?.bannerImage !== null &&
                    blog?.bannerImage !== undefined && (
                        <div>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", blog?.bannerImage)}`}
                                alt={blog?.title}
                                width={100}
                                height={100}
                                className="w-full max-h-[250px] object-contain object-center mx-auto"
                                unoptimized
                            />
                        </div>
                    )}
                <div className="text-center mt-3">
                    <h1 className="text-4xl sm:text-6xl font-black">
                        {blog?.title}
                    </h1>

                    <div className="flex flex-col justify-center items-center sm:flex-row sm:gap-14 text-slate-600">
                        <Link
                            href={`${process.env.NEXT_PUBLIC_AUTHOR}/${blog?.author?._id}`}
                            className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:underline"
                        >
                            {blog?.author?.profilePhoto && (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", blog?.author?.profilePhoto)}`}
                                    alt="Profile"
                                    height={50}
                                    width={50}
                                    className="w-[50px] h-[50px] rounded-full object-cover  object-center overflow-hidden"
                                    loading="lazy"
                                    unoptimized
                                />
                            )}
                            <span className="font-semibold">
                                {fullName(
                                    blog?.author?.firstName,
                                    blog?.author?.lastName,
                                )}
                            </span>
                        </Link>
                        <div className="flex flex-col gap-1 p-3 rounded-2xl cursor-pointer">
                            {blog?.category && (
                                <Link
                                    href={`${process.env.NEXT_PUBLIC_CATEGORY}/${blog?.category?.slug}`}
                                    className="font-medium hover:underline"
                                >
                                    {blog?.category?.name
                                        .charAt(0)
                                        .toUpperCase() +
                                        blog?.category?.name.slice(1)}
                                </Link>
                            )}
                            <>
                                {blog?.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {blog?.tags.map((tag, idx) => (
                                            <Link
                                                key={tag?._id || idx}
                                                href={`${process.env.NEXT_PUBLIC_TAG}/${tag?._id}`}
                                                className="font-semibold rounded-full text-sm overflow-hidden text-gray-500 hover:underline"
                                            >
                                                {tag?.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        </div>
                        {blog?.publishedAt && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl">
                                <time
                                    dateTime={blog?.publishedAt}
                                    className="font-medium"
                                >
                                    {new Date(
                                        blog?.publishedAt,
                                    ).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-justify leading-relaxed px-4 py-6 bg-gray-50 rounded-lg shadow-sm">
                    {blog?.content}
                </div>
                <Comments
                    comments={blog?.comments || null}
                    blog={blog}
                    setRefresh={setRefresh}
                />
            </article>
        </>
    );
}
