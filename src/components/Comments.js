"use client";
import { useForm } from "react-hook-form";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoSend } from "react-icons/io5";
import { useAuth } from "@/context/auth-provider";
import { MdDelete } from "react-icons/md";
import { useUser } from "@/context/user-provider";

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
};

export default function Comments({ comments, blog, setRefresh }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(
            yup.object({
                text: yup.string().trim().required("Please write a comment"),
            }),
        ),
        mode: "onChange",
    });
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const { user, userLoading } = useUser();

    const onSubmit = async (data) => {
        if (!isAuthenticated || !user || userLoading) {
            setToast("Please log in to comment", "error");
            return;
        }

        try {
            setLoading(true);
            await api.post(
                `${process.env.NEXT_PUBLIC_ADMIN_COMMENTS_API}?blog=${blog.slug}`,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Commented Successfully", "success");
            setRefresh((prev) => !prev);
            reset();
        } catch (err) {
            console.error("Comment Failed:", err);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (id) => {
        try {
            await api.delete(
                `${process.env.NEXT_PUBLIC_ADMIN_COMMENT_API.replace("commentId", id)}?blog=${blog.slug}`,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setRefresh((prev) => !prev);
            setToast("Comment deleted successfully", "success");
        } catch (err) {
            console.error(`Comment Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        }
    };

    return (
        <div className="flex flex-col mt-4">
            {comments?.map((comment, idx) => (
                <div
                    key={idx}
                    className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl mb-3 flex flex-col gap-2 "
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-900 text-justify wrap-break-word grow pr-4">
                            {comment.text}
                        </p>
                        {(user?._id === comment?.author ||
                            user?._id === blog?.auhor?._id) && (
                            <button
                                className="bg-red-500 text-white font-medium p-2 rounded-xl border cursor-pointer hover:bg-red-700"
                                onClick={() =>
                                    handleDeleteComment(comment?._id)
                                }
                            >
                                <MdDelete />
                            </button>
                        )}
                    </div>

                    {comment?.createdAt && (
                        <div className="flex items-center justify-end">
                            <time className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                            </time>
                        </div>
                    )}
                </div>
            ))}
            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex gap-2"
            >
                <input
                    id="text"
                    {...register("text")}
                    rows={1}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.text
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Comment here..."
                />
                {errors.text && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.text.message}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading || isSubmitting || !isValid}
                    className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && isSubmitting ? (
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <IoSend size={32} />
                    )}
                </button>
            </form>
        </div>
    );
}
