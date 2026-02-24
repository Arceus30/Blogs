import { UpdateBlogForm } from "@/components/BlogForms";

export const metadata = {
    title: "Update Blog",
};

export default async function UpdateBlog({ params }) {
    const { blogSlug } = await params;

    return (
        <div className="grow flex flex-col items-center justify-center py-12 px-4">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 sm:px-30">
                Update Blog
            </h1>
            <div className="w-full sm:px-30">
                <UpdateBlogForm slug={blogSlug} />
            </div>
        </div>
    );
}
