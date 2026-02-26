import AdminCategoryComponent from "@/components/AdminCategoryComponent";
import api from "@/lib/api";

export const generateMetadata = async ({ params }) => {
    const slug = (await params)?.slug;
    if (slug === "") return { title: "All" };

    const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    const apiPath = process.env.NEXT_PUBLIC_CATEGORY_API.replace(
        "catSlug",
        slug,
    );
    baseUrl.pathname = apiPath;
    const fullUrl = baseUrl.toString();

    const catResponse = await api.get(fullUrl);
    const name = catResponse?.data?.category?.name;
    return {
        title: name.charAt(0).toUpperCase() + name.slice(1),
    };
};

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
