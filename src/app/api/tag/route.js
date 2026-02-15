import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import Tag from "@/models/Tag";

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = req.nextUrl;
        const page = parseInt(searchParams?.get("page"), 10);
        const limit = parseInt(searchParams?.get("limit"), 10);
        const skip = (page - 1) * limit;
        if (
            !page ||
            !limit ||
            isNaN(page) ||
            isNaN(limit) ||
            isNaN(skip) ||
            skip < 0
        ) {
            return NextResponse.json(
                { message: "Invalid parameters", success: false },
                { status: 400 },
            );
        }

        const totalDocs = await Tag.countDocuments();
        const tags = await Tag.find().skip(skip).limit(limit);
        return NextResponse.json(
            {
                success: true,
                message: "Tags fetched successfully",
                tags,
                totalPages: Math.ceil(totalDocs / limit, 10),
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Fetching Tags: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Tags",
                success: false,
            },
            { status: err?.statusCode || 500 },
        );
    }
};
