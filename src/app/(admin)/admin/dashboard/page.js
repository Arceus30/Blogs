import DashboardComponent from "@/components/Dashboard";

export default async function AdminDashboard({ searchParams }) {
    const { page } = await searchParams;
    
    return <DashboardComponent page={page} />;
}
