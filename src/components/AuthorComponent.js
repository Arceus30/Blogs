"use client";
import { fullName } from "@/utils/formatName";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import BlogTable from "@/components/BlogTable";
import api from "@/lib/api";
import Loading from "@/app/loading";

export default function AuthorComponent({ page, authorId }) {
    const [author, setAuthor] = useState(null);
    const { setToast } = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `${process.env.NEXT_PUBLIC_AUTHOR_API.replace("authorId", authorId)}`,
                );
                setAuthor(response.data.user);
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setAuthor(null);
                setToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };
        if (authorId) fetch();
    }, [authorId, setToast]);

    if (loading) return <Loading />;

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="text-white p-2 rounded-md text-lg">
                    {author?.profilePhoto ? (
                        <Image
                            src={process.env.NEXT_PUBLIC_PHOTO_API.replace(
                                "photoId",
                                author?.profilePhoto,
                            )}
                            alt={fullName(author?.firstName, author?.lastName)}
                            height={50}
                            width={50}
                            className="w-[50px] h-[50px] rounded-full object-cover object-center overflow-hidden"
                            loading="lazy"
                            unoptimized
                        />
                    ) : (
                        <div className="w-[50px] h-[50px] rounded-full border border-2 border-black text-black flex items-center justify-center font-medium text-xl">
                            {author?.firstName?.charAt(0)?.toUpperCase() || "U"}
                            {author?.lastName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <h1 className="font-semibold text-3xl">
                        {fullName(author?.firstName, author?.lastName)}
                    </h1>
                </div>
            </div>
            {author?.bio && (
                <p className="text-2xl text-gray-700">{author.bio}</p>
            )}
            <div>{author?.numBlogs} blogs</div>
            <div className="my-3">
                <div className="border-b-2 pb-1">
                    <h1 className="text-2xl text-gray-900">Blogs</h1>
                </div>
                <div className="overflow-x-auto">
                    <BlogTable page={page} author={author} />
                </div>
            </div>
        </>
    );
}
