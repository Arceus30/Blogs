import CategoriesComponent from "@/components/CategoriesComponent";

export const metadata = {
    title: "Categories",
    description: "Categories",
};

export default async function Category({ searchParams }) {
    const { page } = await searchParams;
    return (
        <div className="grow flex flex-col">
            <h2 className="text-3xl font-bold mb-8 text-center">Categories</h2>
            <CategoriesComponent page={parseInt(page, 10) || 1} />
        </div>
    );
}
