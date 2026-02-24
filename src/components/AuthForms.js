"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    signUpSchema,
    signInSchema,
    updateProfileSchema,
    passwordSchema,
} from "@/utils/clientSchema";
import { useAuth } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/toast-provider";
import api from "@/lib/api";
import { useUser } from "@/context/user-provider";
import { useState, useEffect } from "react";

export const SignUpForm = ({ returnTo }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(signUpSchema),
        mode: "onChange",
    });
    const { checkToken, clearToken } = useAuth();
    const router = useRouter();
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await api.post(
                process.env.NEXT_PUBLIC_SIGN_UP_API,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            sessionStorage.setItem("accessToken", response.data.token);
            checkToken();
            router.replace(
                returnTo ? returnTo : process.env.NEXT_PUBLIC_DASHBOARD,
            );
            setToast("Sign Up Successful", "success");
            reset();
        } catch (err) {
            console.error("Sign Up Failed:", err);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
            clearToken();
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="firstName"
                    >
                        First Name
                    </label>
                    <input
                        id="firstName"
                        {...register("firstName")}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                            errors.firstName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="First Name"
                    />
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="lastName"
                    >
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        {...register("lastName")}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                            errors.lastName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="Last Name"
                    />
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    id="email"
                    {...register("email")}
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="email@example.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="profilePhoto"
                >
                    Profile Photo (Optional)
                </label>
                <input
                    id="profilePhoto"
                    {...register("profilePhoto")}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className={`w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.profilePhoto && "border-red-300 bg-red-50"
                    }`}
                />
                {errors.profilePhoto && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.profilePhoto.message}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="password"
                >
                    Password
                </label>
                <input
                    id="password"
                    {...register("password")}
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Password"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}
            </div>
            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
        </form>
    );
};

export const SignInForm = ({ returnTo }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(signInSchema),
        mode: "onChange",
    });
    const { checkToken, clearToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setToast } = useToast();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.post(
                process.env.NEXT_PUBLIC_SIGN_IN_API,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            sessionStorage.setItem("accessToken", response.data.token);
            router.replace(
                returnTo ? returnTo : process.env.NEXT_PUBLIC_DASHBOARD,
            );
            setToast("Sign In Successful", "success");
            checkToken();
            reset();
        } catch (err) {
            console.error("Sign In Failed:", err);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
            clearToken();
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    id="email"
                    {...register("email")}
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="email@example.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="password"
                >
                    Password
                </label>
                <input
                    id="password"
                    {...register("password")}
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Password"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}
            </div>
            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting ? "Signing In..." : "Sign In"}
            </button>
        </form>
    );
};

export const UpdateProfileForm = () => {
    const { user, refreshUser } = useUser();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(updateProfileSchema),
        mode: "onChange",
    });
    const router = useRouter();
    const { setToast } = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        reset({
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            bio: user?.bio,
        });
    }, [user, reset]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const res = await api.put(
                process.env.NEXT_PUBLIC_ADMIN_PROFILE_API,
                data,
                {
                    headers: { "Content-type": "multipart/form-data" },
                },
            );
            setToast("Update Successful", "success");
            refreshUser();
            router.push(process.env.NEXT_PUBLIC_DASHBOARD);
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
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="firstName"
                    >
                        First Name
                    </label>
                    <input
                        id="firstName"
                        {...register("firstName")}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                            errors.firstName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="First Name"
                    />
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="lastName"
                    >
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        {...register("lastName")}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                            errors.lastName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="Last Name"
                    />
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    id="email"
                    {...register("email")}
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="email@example.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="bio"
                >
                    Bio
                </label>

                <textarea
                    id="bio"
                    {...register("bio")}
                    type="text"
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.bio
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Write something about yourself"
                />
                {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.bio.message}
                    </p>
                )}
            </div>
            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting
                    ? "Updating Profile..."
                    : "Update Profile"}
            </button>
        </form>
    );
};

export const ChangePasswordForm = () => {
    const { setToast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(passwordSchema),
    });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            if (data.newPassword === data.confirmPassword) {
                await api.post(
                    process.env.NEXT_PUBLIC_ADMIN_CHANGE_PASSWORD_API,
                    data,
                    {
                        headers: {
                            "Content-type": "multipart/form-data",
                        },
                    },
                );
                setToast("Password Updated Successfully", "success");
                router.replace(process.env.NEXT_PUBLIC_DASHBOARD);
                reset();
            } else {
                setToast("Passwords do not match", "error");
            }
        } catch (err) {
            console.error(`Error Occurred ${err}`);
            const errorMessage = err?.response?.data?.message || err?.message;
            setToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-4 md:w-2/5 w-full"
        >
            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="oldPassword"
                >
                    Old Password
                </label>
                <input
                    id="oldPassword"
                    {...register("oldPassword")}
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.oldPassword
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Old Password"
                />
                {errors.oldPassword && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.oldPassword.message}
                    </p>
                )}
            </div>
            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="newPassword"
                >
                    New Password
                </label>
                <input
                    id="newPassword"
                    {...register("newPassword")}
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.newPassword
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="New Password"
                />
                {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.newPassword.message}
                    </p>
                )}
            </div>
            <div className="mb-6">
                <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="confirmPassword"
                >
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                        errors.confirmPassword
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>
            <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading || isSubmitting
                    ? "Changing Password..."
                    : "Change Password"}
            </button>
        </form>
    );
};
