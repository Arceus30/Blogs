import TagsComponent from "@/components/TagsComponent";

export const metadata = {
    title: "Tags",
    description: "Tags",
};

export default async function Tag({ searchParams }) {
    const { page } = await searchParams;

    return (
        <div className="grow flex flex-col">
            <h2 className="text-3xl font-bold mb-8 text-center">Tags</h2>
            <TagsComponent page={parseInt(page, 10) || 1} />
        </div>
    );
}
