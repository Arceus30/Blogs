import { UpdateCategoryForm } from "@/components/CategoryForms";

export const metadata = {
    title: "Update Category",
};

export default async function UpdateCategoryPage({ params }) {
    const { catSlug } = await params;
    return (
        <div className="grow flex flex-col items-center justify-center py-12 px-4">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 px-30">
                Updaate Category
            </h1>
            <div className="w-full px-30">
                <UpdateCategoryForm slug={catSlug} />
            </div>
        </div>
    );
}
