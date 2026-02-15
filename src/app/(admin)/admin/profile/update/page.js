import Link from "next/link";
import { UpdateProfileForm } from "@/components/AuthForms";

export const metadata = {
    title: "Update User Profile",
};

export default function UpdateUserProfile() {
    return (
        <div className="grow flex flex-col bg-gray-300/20 relative p-10 items-center">
            <h2 className="text-center text-3xl font-bold">Update Profile</h2>
            <UpdateProfileForm />
            <div className="text-center mt-4">
                <Link
                    href={process.env.NEXT_PUBLIC_CHANGE_PASSWORD}
                    className="font-semibold text-blue-600 hover:text-blue-500 hover:underline pl-1"
                >
                    Changing Password
                </Link>
            </div>
        </div>
    );
}
