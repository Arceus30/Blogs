import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (_request, { params }) => {
    try {
        await dbConnect();
        const catSlug = (await params).catSlug;
        const category = await Category.findOne({ slug: catSlug });
        return NextResponse.json({ category }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            {
                message: err.message || "Error Fetching Categories",
                success: false,
            },
            { status: err.statusCode || 500 },
        );
    }
};
