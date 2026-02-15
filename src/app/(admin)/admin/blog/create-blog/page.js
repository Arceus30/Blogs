import { CreateBlogForm } from "@/components/BlogForms";

export const metadata = {
    title: "Create Blog",
};

export default function CreateBlog() {
    return (
        <div className="grow flex flex-col items-center justify-center py-12 px-4">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 px-30">
                Create Blog
            </h1>
            <div className="w-full px-30">
                <CreateBlogForm />
            </div>
        </div>
    );
}
