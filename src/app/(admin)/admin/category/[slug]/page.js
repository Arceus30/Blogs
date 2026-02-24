import AdminCategoryComponent from "@/components/AdminCategoryComponent";

export default async function CategoryPage({ params, searchParams }) {
    const slug = (await params)?.slug;
    const page = (await searchParams)?.page;
    return (
        <div className="grow py-6 px-4">
            <AdminCategoryComponent
                slug={slug}
                page={parseInt(page, 10) || 1}
            />
        </div>
    );
}
