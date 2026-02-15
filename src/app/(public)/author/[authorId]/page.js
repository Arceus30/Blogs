import AuthorComponent from "@/components/AuthorComponent";
import api from "@/lib/api";
import { fullName } from "@/utils/formatName";

export const generateMetadata = async ({ params }) => {
    const authorId = (await params)?.authorId;
    const response = await api.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_AUTHOR_API.replace("authorId", authorId)}`,
    );
    const { firstName, lastName } = response?.data?.user;
    return {
        title: fullName(firstName, lastName),
        description: response?.data?.user?.bio?.slice(0, 16),
    };
};

export default async function Author({ params, searchParams }) {
    const authorId = (await params)?.authorId;
    const page = (await searchParams)?.page;

    return (
        <div className="grow flex flex-col bg-gray-300/20 relative px-10">
            <AuthorComponent
                page={parseInt(page, 10) || 1}
                authorId={authorId}
            />
        </div>
    );
}
