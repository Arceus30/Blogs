import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import Blog from "@/models/Blog";
import { Types } from "mongoose";

export const GET = async (request) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page"), 10) || 1;
        const limit = parseInt(searchParams.get("limit"), 10) || 6;
        const author = searchParams.get("author") || null;
        const skipNum = (page - 1) * limit;
        if (
            !page ||
            !limit ||
            isNaN(page) ||
            isNaN(limit) ||
            isNaN(skipNum) ||
            skipNum < 0
        ) {
            return NextResponse.json(
                { message: "Invalid parameters", success: false },
                { status: 400 },
            );
        }

        let matchStage = {};

        if (author) matchStage.author = new Types.ObjectId(author);
        matchStage.status = "archived";

        const totalDocuments = await Blog.countDocuments(matchStage);

        const blogsAggregation = await Blog.aggregate([
            {
                $match: matchStage,
            },
            { $sort: { createdAt: -1 } },
            {
                $skip: skipNum,
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: "tagblogjunctions",
                    let: { blogId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$blog", "$$blogId"] },
                            },
                        },
                        {
                            $lookup: {
                                from: "tags",
                                localField: "tag",
                                foreignField: "_id",
                                as: "tagDetails",
                            },
                        },
                        {
                            $unwind: "$tagDetails",
                        },
                        {
                            $group: {
                                _id: "$tag",
                                name: { $first: "$tagDetails.name" },
                            },
                        },
                    ],
                    as: "tags",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            {
                $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        const maxPage = parseInt(totalDocuments / limit);

        return NextResponse.json({ blogs: blogsAggregation, maxPage });
    } catch (err) {
        console.error("Error Fetching Archived Blogs: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Archived Blogs",
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
