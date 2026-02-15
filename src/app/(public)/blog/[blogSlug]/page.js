import BlogComponent from "@/components/BlogComponent";
import api from "@/lib/api";

export const generateMetadata = async ({ params }) => {
    const blogSlug = (await params)?.blogSlug;
    const res = await api.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_BLOG_API.replace("blogSlug", blogSlug)}`,
    );
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
