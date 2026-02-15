import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Image from "@/models/Image";
import { verifyAccessToken } from "@/utils/token";
import { NextResponse } from "next/server";

export const GET = async (request) => {
    try {
        await dbConnect();
        const accessToken = request.headers
            ?.get("authorization")
            ?.replace("Bearer ", "");

        if (!accessToken) {
            console.error("Token does not exists");
            return NextResponse.json(
                { message: "Invalid Request", success: false },
                { status: 401 },
            );
        }

        const decodedToken = verifyAccessToken(accessToken);
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

        return NextResponse.json(
            {
                success: true,
                message: "User details fetched successfully",
                user,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("User Fetch Error: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Cannot fetch user",
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

export const PUT = async (request) => {
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
        const user = await User.findById(decodedToken?.userId);
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const formData = await request.formData();
        const userData = Object.fromEntries(formData.entries());

        const updatedUser = await User.findByIdAndUpdate(user._id, userData, {
            returnDocument: "after",
            runValidators: true,
        });

        if (!updatedUser) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not found", success: false },
                { status: 404 },
            );
        }
        return NextResponse.json(
            { success: true, message: "User profile updated successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("User Fetch Error: ", err.message);
        return NextResponse.json(
            {
                message: err?.message || "Error updating profile",
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
