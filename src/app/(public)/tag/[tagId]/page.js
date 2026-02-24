import TagComponent from "@/components/TagComponent";
import api from "@/lib/api";

export const generateMetadata = async ({ params }) => {
    const tagId = (await params)?.tagId;

    const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    const apiPath = process.env.NEXT_PUBLIC_TAG_API.replace("tagId", tagId);
    baseUrl.pathname = apiPath;
    const fullUrl = baseUrl.toString();

    const response = await api.get(fullUrl);

    const name = response?.data?.tag?.name;
    return {
        title: name.charAt(0).toUpperCase() + name.slice(1),
    };
};

export default async function TagPage({ params, searchParams }) {
    const tagId = (await params)?.tagId;
    const page = (await searchParams)?.page;

    return (
        <div className="grow py-6 px-4">
            <TagComponent page={parseInt(page, 10) || 1} tagId={tagId} />
        </div>
    );
}
