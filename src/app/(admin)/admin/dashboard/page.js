import DashboardComponent from "@/components/Dashboard";

export default async function AdminDashboard({ searchParams }) {
    const { page } = await searchParams;
    return (
        <div className="grow mx-3 flex flex-col">
            <DashboardComponent page={page} />
        </div>
    );
}
