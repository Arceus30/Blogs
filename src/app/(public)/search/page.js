import SearchComponent from "@/components/SearchComponent";

export default async function Search({ searchParams }) {
    const { q } = await searchParams;
    return (
        <div className="grow grid grid-cols-4 gap-2 max-h-[584px]">
            <SearchComponent q={q} />
        </div>
    );
}
