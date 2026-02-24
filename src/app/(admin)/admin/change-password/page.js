import { ChangePasswordForm } from "@/components/AuthForms";

export const metadata = {
    title: "Change Password",
};

export default function ChangePassword() {
    return (
        <div className="grow flex flex-col bg-gray-300/20 relative py-10 px-5 sm:p-10 items-center">
            <h2 className="text-center text-3xl font-bold">Change Password</h2>
            <ChangePasswordForm />
        </div>
    );
}
