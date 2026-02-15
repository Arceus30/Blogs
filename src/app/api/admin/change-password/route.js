import { dbConnect } from "@/lib/db";
import { comparePwd, hashPwd } from "@/utils/bcrypt";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { passwordSchema } from "@/utils/serverSchema";
import { verifyAccessToken } from "@/utils/token";

export const POST = async (request) => {
    try {
        await dbConnect();
        const accessToken = await request.headers
            ?.get("authorization")
            ?.replace("Bearer ", "");

        if (!accessToken) {
            console.error("Token does not exist");
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 400 },
            );
        }
        const decodedToken = verifyAccessToken(accessToken);
        const user = await User.findById(decodedToken.userId).select(
            "+password",
        );
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const formData = await request.formData();
        const userData = Object.fromEntries(formData.entries());

        const { error, value: validatedData } = passwordSchema.validate(
            userData,
            {
                abortEarly: false,
                stripUnknown: true,
            },
        );
        if (error) {
            const errorMessage = error.details[0];
            console.error(errorMessage);
            return NextResponse.json(
                { message: errorMessage, success: false },
                { status: 401 },
            );
        }

        const isMatch = await comparePwd(
            validatedData.oldPassword,
            user.password,
        );
        if (!isMatch) {
            console.error("Invalid Credentials");
            return NextResponse.json(
                { message: "Invalid Credentials", success: false },
                { status: 401 },
            );
        }

        if (validatedData.newPassword !== validatedData.confirmPassword) {
            console.error("Passwords do not match");
            return NextResponse.json(
                { message: "Passwords do not match", success: false },
                { status: 400 },
            );
        }

        user.password = await hashPwd(validatedData.newPassword);
        await user.save();

        return NextResponse.json(
            { success: true, message: "User password updated successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Change Password Error: ", err.message);
        return NextResponse.json(
            {
                message: err?.message || "Error Changing Password",
                success: false,
            },
            {
                status:
                    err?.message === "jwt expired"
                        ? 401
                        : err?.statusCode || 500,
            },
        );
    }
};
