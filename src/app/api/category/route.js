import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import Category from "@/models/Category";
import User from "@/models/User";

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = req.nextUrl;
        const page = parseInt(searchParams?.get("page"), 10);
        const limit = parseInt(searchParams?.get("limit"), 10);
        const sortBy = searchParams?.get("sortBy") || "createdAt";
        const skip = (page - 1) * limit;
        const pipeline = [
            {
                $group: {
                    _id: "$name",
                    slug: { $first: "$slug" },
                    user: { $first: "$user" },
                    blogCount: { $sum: "$blogCount" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    slug: 1,
                    user: 1,
                    blogCount: 1,
                    groupedCount: { $ifNull: ["$count", 1] },
                },
            },
            {
                $sort: { [sortBy]: 1 },
            },
        ];

        let categories = await Category.aggregate(pipeline);

        const totalPages = Math.ceil(categories.length / limit);

        if (
            page &&
            limit &&
            !isNaN(page) &&
            !isNaN(limit) &&
            !isNaN(skip) &&
            skip >= 0
        ) {
            categories = await Category.aggregate([
                ...pipeline,
                { $skip: skip },
                { $limit: limit },
            ]);
        }
        return NextResponse.json(
            {
                success: true,
                message: "Categories fetched succesfully",
                categories,
                totalPages,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Fetching Categories: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Categories",
                success: false,
            },
            { status: err?.statusCode || 500 },
        );
    }
};
