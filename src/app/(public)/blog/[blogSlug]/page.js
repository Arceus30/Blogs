import BlogComponent from "@/components/BlogComponent";
import api from "@/lib/api";

export const generateMetadata = async ({ params }) => {
    const blogSlug = (await params)?.blogSlug;
    const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    const apiPath = process.env.NEXT_PUBLIC_BLOG_API.replace(
        "blogSlug",
        blogSlug,
    );
    baseUrl.pathname = apiPath;
    const fullUrl = baseUrl.toString();
    const res = await api.get(fullUrl);

    return {
        title: res?.data?.blog?.title,
        description: res?.data?.blog?.content?.slice(0, 16),
    };
};

export default async function ShowBlog({ params }) {
    const blogSlug = (await params)?.blogSlug;
    return (
        <main className="grow">
            <BlogComponent slug={blogSlug} />
        </main>
    );
}
