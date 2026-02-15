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
            <div className="flex items-center justify-center p-2">
                <h2 className="text-3xl font-semibold px-5 py-1">Categories</h2>
                <div className="p-1">
                    <Link
                        href={process.env.NEXT_PUBLIC_ADMIN_CATEGORY_CREATE}
                        className="flex justify-center items-center gap-2 text-lg font-semibold text-white px-5 py-1 bg-green-500 rounded-2xl mr-25 hover:bg-green-700"
                    >
                        Create new Category <FaRegSquarePlus />
                    </Link>
                </div>
            </div>
            <AdminCategoriesComponent page={parseInt(page, 10) || 1} />
        </div>
    );
}
