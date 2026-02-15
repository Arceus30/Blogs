import CategoryList from "@/components/CategoryList";
import BlogList from "@/components/BlogList";

export default async function Home({ searchParams }) {
    const { cat, page } = await searchParams;
    return (
        <main className="grow py-6 px-4">
            <section className="text-center py-20 bg-blue-500/70 text-white rounded-2xl mb-8">
                <h1 className="text-5xl font-bold mb-4">Welcome to Blogs</h1>
            </section>

            <section className="mb-16 max-w-5xl mx-auto">
                <CategoryList />
            </section>
            <section>
                <BlogList
                    cat={cat === "all" ? "" : cat || ""}
                    page={parseInt(page, 10) || 1}
                />
            </section>
        </main>
    );
}
