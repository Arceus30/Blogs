import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Image from "@/models/Image";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signInSchema } from "@/utils/serverSchema";
import { comparePwd } from "@/utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";

export const POST = async (request) => {
    try {
        await dbConnect();

        const formData = await request.formData();
        const userData = Object.fromEntries(formData.entries());

        const { error, value: validatedData } = signInSchema.validate(
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

        const user = await User.findOne({
            email: validatedData.email.toLowerCase(),
        }).select("+password");

        if (!user) {
            console.error("User does not exists");
            return NextResponse.json(
                {
                    message: "User does not exists",
                    success: false,
                },
                { status: 404 },
            );
        }

        const isMatch = await comparePwd(validatedData.password, user.password);

        if (!isMatch) {
            console.error("Invalid Credentials");
            return NextResponse.json(
                {
                    message: "Invalid Credentials",
                    success: false,
                },
                { status: 401 },
            );
        }

        user.version = 0;
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const cookieStore = await cookies();
        cookieStore.set("refresh_token", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NEXT_ENV === "production",
            sameSite: "strict",
        });

        return NextResponse.json(
            {
                message: "Sign In Successful",
                success: true,
                token: accessToken,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Sign In Error: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Sign In Error",
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
