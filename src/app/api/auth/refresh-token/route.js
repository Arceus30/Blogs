import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/utils/token";
import User from "@/models/User";
import Image from "@/models/Image";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";

export const POST = async (request) => {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!refreshToken) {
            console.error("Refresh Token deos not exists");
            return NextResponse.json(
                { error: "No refresh token", success: false },
                { status: 401 },
            );
        }

        const decodedToken = verifyRefreshToken(refreshToken);
        if (!decodedToken || !decodedToken?.userId) {
            console.error("Invalid Token");
            return NextResponse.json(
                { message: "Invalid token", success: false },
                { status: 401 },
            );
        }

        const user = await User.findById(decodedToken?.userId);
        if (!user) {
            console.error(`User with userId ${decodedToken?.userId} not found`);
            return NextResponse.json(
                { message: "User not found", success: false },
                { status: 404 },
            );
        }

        if (user?.version !== decodedToken?.version) {
            console.error("Token version do not match");
            return NextResponse.json(
                { error: "Token version mismatch", success: false },
                { status: 401 },
            );
        }

        user.version += 1;
        await user.save();
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        cookieStore.set("refresh_token", newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NEXT_ENV === "production",
            sameSite: "strict",
        });

        return NextResponse.json(
            {
                message: "Fresh Tokens issued Successful",
                success: true,
                token: newAccessToken,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Refreshing Token: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Cannot issue new tokens",
                success: false,
            },
            {
                status:
                    err?.message === "jwt expired"
                        ? 401
                        : err?.StatusCode || 500,
            },
        );
    }
};
