"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema } from "@/utils/clientSchema";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";

export const CreateCategoryForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(categorySchema),
        mode: "onChange",
    });
    const router = useRouter();
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post(
                `${process.env.NEXT_PUBLIC_ADMIN_CATEGORIES_API}`,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Category created", "success");
            router.replace(process.env.NEXT_PUBLIC_ADMIN_CATEGORIES);
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
                    htmlFor="name"
                >
                    Name
                </label>
                <input
                    id="name"
                    {...register("name")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Enter category name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting
                    ? "Creating Category..."
                    : "Create Category"}
            </button>
        </form>
    );
};

export const UpdateCategoryForm = ({ slug }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(categorySchema),
        mode: "onChange",
    });
    const router = useRouter();
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    process.env.NEXT_PUBLIC_ADMIN_CATEGORY_API.replace(
                        "catSlug",
                        slug,
                    ),
                );
                reset({ name: response?.data?.category.name });
            } catch (err) {
                const errorMessage =
                    err?.response?.data?.message || err?.message;
                setCategory(null);
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
            await api.put(
                `${process.env.NEXT_PUBLIC_ADMIN_CATEGORY_API.replace("catSlug", slug)}`,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Category updated", "success");
            router.replace(process.env.NEXT_PUBLIC_ADMIN_CATEGORIES);
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
                    htmlFor="name"
                >
                    Name
                </label>
                <input
                    id="name"
                    {...register("name")}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Enter category name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting
                    ? "Updating Category..."
                    : "Update Category"}
            </button>
        </form>
    );
};
