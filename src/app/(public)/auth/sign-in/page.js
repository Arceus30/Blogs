import Link from "next/link";
import { SignInForm } from "@/components/AuthForms";

export const metadata = {
    title: "Sign In",
    descruption: "Blog App Sign in page",
};

export default async function SignInPage({ searchParams }) {
    const { returnTo } = await searchParams;

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl px-8 py-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome
                </h1>
                <p className="text-gray-600">Sign in to your account</p>
            </div>
            <SignInForm returnTo={returnTo} />
            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    Don&apos;t have an account?
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SIGN_UP}${returnTo ? `?returnTo=${returnTo}` : ""}`}
                        className="font-semibold text-blue-600 hover:text-blue-500 hover:underline pl-1"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
