import Link from "next/link";
import { SignUpForm } from "@/components/AuthForms";

export const metadata = {
    title: "Sign Up",
    description: "Blog App Sign up page",
};

export default async function SignUpPage({ searchParams }) {
    const { returnTo } = await searchParams;

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl px-8 py-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Account
                </h1>
                <p className="text-gray-600">Join Blogs today</p>
            </div>
            <SignUpForm returnTo={returnTo} />
            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    Already have an account?
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SIGN_IN}${returnTo ? `?returnTo=${returnTo}` : ""}`}
                        className="font-semibold text-blue-600 hover:text-blue-500 hover:underline pl-1"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
