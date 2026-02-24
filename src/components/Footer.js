import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-2">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">Blogs</h3>
                        <p className="text-gray-400 mb-1">
                            Discover amazing stories and insights from our
                            community of passionate writers.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-1">
                            Quick Links
                        </h4>
                        <ul className="flex gap-2 md:gap-5 flex-col sm:flex-row">
                            <li>
                                <Link
                                    href={process.env.NEXT_PUBLIC_HOMEPAGE}
                                    className="hover:text-blue-400"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={process.env.NEXT_PUBLIC_ABOUT}
                                    className="hover:text-blue-400"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={process.env.NEXT_PUBLIC_CONTACT_US}
                                    className="hover:text-blue-400"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={process.env.NEXT_PUBLIC_CATEGORY}
                                    className="hover:text-blue-400"
                                >
                                    Category
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={process.env.NEXT_PUBLIC_TAG}
                                    className="hover:text-blue-400"
                                >
                                    Tag
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800  text-center text-gray-400">
                    <p>&copy; 2026 Blogs. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
