import ArchivedBlogsComponent from "@/components/ArchivedBlogs";

export const metadata = {
    title: "Archived Blogs",
};

export default async function DashboardPage({ searchParams }) {
    const { page } = await searchParams;

    return <ArchivedBlogsComponent page={page} />;
}
