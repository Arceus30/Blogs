import { dbConnect } from "@/lib/db";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export const GET = async (_request, { params }) => {
    try {
        let tagId = (await params).tagId;
        tagId = new Types.ObjectId(tagId);
        await dbConnect();
        const tag = await Tag.findById(tagId);
        return NextResponse.json({ tag }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            {
                message: err.message || "Error Fetching Tags",
                success: false,
            },
            { status: err.statusCode || 500 },
        );
    }
};
