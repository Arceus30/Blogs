import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/token";
import { blogSchema } from "@/utils/serverSchema";
import slug from "slug";
import { Types } from "mongoose";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Comment from "@/models/Comment";
import Image from "@/models/Image";
import Tag from "@/models/Tag";
import TagBlogJunction from "@/models/TagBlogJunction";
import User from "@/models/User";

export const GET = async (request) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page"), 10) || 1;
        const limit = parseInt(searchParams.get("limit"), 10) || 6;
        const author = searchParams.get("author") || null;
        const tag = searchParams.get("tag") || null;
        const cat = searchParams.get("cat") || null;

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

        if (tag) {
            const tagJunctions = await TagBlogJunction.find({
                tag: new Types.ObjectId(tag),
            })
                .select("blog")
                .lean();
            matchStage._id = { $in: tagJunctions?.map((j) => j?.blog) };
        }

        if (cat) {
            const categories = await Category.find({ slug: cat })
                .select("_id")
                .lean();
            matchStage.category = { $in: categories?.map((cat) => cat?._id) };
        }

        if (author) matchStage.author = new Types.ObjectId(author);
        matchStage.status = "published";

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

        const maxPage = Math.ceil(totalDocuments / limit);

        return NextResponse.json({ blogs: blogsAggregation, maxPage });
    } catch (err) {
        console.error("Error Fetching Blogs: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Blogs",
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
