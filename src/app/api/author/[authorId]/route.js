import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";

export const GET = async (_request, { params }) => {
    try {
        await dbConnect();
        const { authorId } = await params;
        const user = await User.findById(authorId);
        if (!user) {
            console.error("Author not found");
            return NextResponse.json(
                { message: "Author not found", success: false },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { success: true, message: "Author fetched successfully", user },
            { status: 200 },
        );
    } catch (err) {
        console.error("Author Fetch Error: ", err);
        return NextResponse.json(
            { message: "Cannot fetch author", success: false },
            { status: err.statusCode || 500 },
        );
    }
};
