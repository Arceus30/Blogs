"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { blogSchema } from "@/utils/clientSchema";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";

export const CreateBlogForm = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(blogSchema),
        mode: "onChange",
    });
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    process.env.NEXT_PUBLIC_ADMIN_CATEGORIES_API,
                );
                setCategories(response?.data?.categories);
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
    }, [setToast]);

    useEffect(() => {
        if (categories?.length > 0) {
            const generalCategory = categories.find(
                (cat) => cat?.name?.toLowerCase() === "general",
            );
            if (generalCategory?._id) {
                setValue("category", generalCategory?._id);
            }
        }
    }, [categories, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.post(
                `${process.env.NEXT_PUBLIC_BLOGS_API}`,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Blog created", "success");
            router.replace(
                `${process.env.NEXT_PUBLIC_UPDATE_BLOG}/${response?.data?.blog?.slug}`,
            );
            reset();
        } catch (err) {
            console.error(`Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="title"
                >
                    Title
                </label>
                <input
                    id="title"
                    {...register("title")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.title
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Enter blog title"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="Content"
                >
                    Content
                </label>
                <textarea
                    id="content"
                    {...register("content")}
                    type="text"
                    rows={10}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-vertical ${
                        errors.content
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Write your blog here..."
                />
                {errors.content && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.content.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="category"
                >
                    Category
                </label>
                <select
                    id="category"
                    {...register("category")}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.category
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                >
                    {categories?.map((cat, idx) => (
                        <option key={cat._id || idx} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.category.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="tags"
                >
                    Tags
                </label>
                <input
                    id="tags"
                    {...register("tags")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-vertical ${
                        errors.tags
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Write tags (#)"
                />
                {errors.tags && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.tags.message}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="bannerImage"
                >
                    Banner Image (Optional)
                </label>
                <input
                    id="bannerImage"
                    {...register("bannerImage")}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className={`w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.bannerImage && "border-red-300 bg-red-50"
                    }`}
                />
                {errors.bannerImage && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.bannerImage.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting ? "Creating Blog..." : "Create Blog"}
            </button>
        </form>
    );
};

export const UpdateBlogForm = ({ slug }) => {
    const { setToast } = useToast();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(blogSchema),
        mode: "onChange",
    });

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    process.env.NEXT_PUBLIC_ADMIN_CATEGORIES_API,
                );
                setCategories(response?.data?.categories);

                const res = await api.get(
                    `${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", slug)}`,
                );
                reset({
                    title: res.data?.blog.title,
                    content: res.data?.blog.content,
                    tags: res.data?.blog?.tags
                        ?.map((tag) => tag.name)
                        .join(" "),
                    category: res.data?.blog?.category._id,
                });
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
    }, [slug, reset, setToast]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.put(
                `${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", slug)}`,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Blog Updated Successfully", "success");
            router.replace(process.env.NEXT_PUBLIC_DASHBOARD);
            reset();
        } catch (err) {
            console.error(`Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="title"
                >
                    Title
                </label>
                <input
                    id="title"
                    {...register("title")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.title
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Enter blog title"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="Content"
                >
                    Content
                </label>
                <textarea
                    id="content"
                    {...register("content")}
                    type="text"
                    rows={10}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-vertical ${
                        errors.content
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Write your blog here..."
                />
                {errors.content && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.content.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="category"
                >
                    Category
                </label>
                <select
                    id="category"
                    {...register("category")}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.category
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                >
                    {categories?.map((cat, idx) => (
                        <option key={cat?._id || idx} value={cat?._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.category.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="tags"
                >
                    Tags
                </label>
                <input
                    id="tags"
                    {...register("tags")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-vertical ${
                        errors.tags
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Write tags"
                />
                {errors.tags && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.tags.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting ? "Updating Blog..." : "Update Blog"}
            </button>
        </form>
    );
};
