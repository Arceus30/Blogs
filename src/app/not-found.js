import Link from "next/link";
import { MdOutlineWarning } from "react-icons/md";
import "./globals.css";

export const metadata = {
    title: { absolute: "404 - Page Not Found" },
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="h-24 w-24 rounded-2xl bg-red-100 flex items-center justify-center mb-8">
                <MdOutlineWarning size={65} color="#f21f1fba" />
            </div>
            <div>
                <p className="text-center text-xl text-gray-600 max-w-sm mx-auto">
                    Sorry
                </p>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h1>
            </div>
            <Link
                href={process.env.NEXT_PUBLIC_HOMEPAGE}
                className="text-center px-6 py-3 font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800"
            >
                Go back home
            </Link>
        </div>
    );
}
