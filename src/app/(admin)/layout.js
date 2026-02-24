import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Link from "next/link";
import { UserProvider } from "@/context/user-provider";
import { AuthProvider } from "@/context/auth-provider";
import { ToastProvider } from "@/context/toast-provider";
import { ToastContainer, Slide } from "react-toastify";
import AdminLayoutComponent from "@/components/AdminLayoutComponent";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: { default: "Admin", template: "%s | Admin Dashboard" },
    description: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
    return (
        <html lang="en">
            <ToastProvider>
                <AuthProvider>
                    <UserProvider>
                        <body
                            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
                        >
                            <AdminLayoutComponent>
                                {children}
                            </AdminLayoutComponent>
                            <footer className="bg-gray-900 text-white pt-2">
                                <div className="container mx-auto px-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">
                                                Blogs
                                            </h3>
                                            <p className="text-gray-400 mb-1">
                                                Discover amazing stories and
                                                insights from our community of
                                                passionate writers.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">
                                                Quick Links
                                            </h4>
                                            <ul className="flex flex-col sm:flex-row gap-5">
                                                <li>
                                                    <Link
                                                        href={
                                                            process.env
                                                                .NEXT_PUBLIC_HOMEPAGE
                                                        }
                                                        className="hover:text-blue-400"
                                                    >
                                                        Home
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href={
                                                            process.env
                                                                .NEXT_PUBLIC_ABOUT
                                                        }
                                                        className="hover:text-blue-400"
                                                    >
                                                        About
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href={
                                                            process.env
                                                                .NEXT_PUBLIC_CONTACT_US
                                                        }
                                                        className="hover:text-blue-400"
                                                    >
                                                        Contact
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-800  text-center text-gray-400">
                                        <p>
                                            &copy; 2026 Blogs. All rights
                                            reserved.
                                        </p>
                                    </div>
                                </div>
                            </footer>
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick={false}
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="light"
                                transition={Slide}
                            />
                        </body>
                    </UserProvider>
                </AuthProvider>
            </ToastProvider>
        </html>
    );
}
