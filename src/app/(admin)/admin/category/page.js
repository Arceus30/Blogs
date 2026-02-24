import Link from "next/link";
import AdminCategoriesComponent from "@/components/AdminCategoriesComponent";
import { FaRegSquarePlus } from "react-icons/fa6";

export const metadata = {
    title: "Categories",
};

export default async function AdminCategory({ searchParams }) {
    const { page } = await searchParams;

    return (
        <div className="grow flex flex-col">
            <div className="grow flex items-center justify-center sm:p-2 flex-col sm:flex-row">
                <h2 className="sm:grow text-center text-xl sm:text-3xl font-semibold px-2 sm:px-5 py-1">
                    Categories
                </h2>
                <div className="p-1">
                    <Link
                        href={process.env.NEXT_PUBLIC_ADMIN_CATEGORY_CREATE}
                        className="flex justify-center items-center gap-2 text-sm sm:text-lg font-semibold text-white px-2 sm:px-5 py-1 bg-green-500 rounded-2xl hover:bg-green-700"
                    >
                        Create new Category <FaRegSquarePlus size={25} />
                    </Link>
                </div>
            </div>
            <AdminCategoriesComponent page={parseInt(page, 10) || 1} />
        </div>
    );
}
