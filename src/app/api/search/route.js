import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Comment from "@/models/Comment";
import Image from "@/models/Image";
import Tag from "@/models/Tag";
import TagBlogJunction from "@/models/TagBlogJunction";
import User from "@/models/User";

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get("limit")
            ? Math.min(parseInt(searchParams.get("limit"), 10), 50)
            : 0;
        const q = searchParams.get("q").trim();

        if (!q || q.length <= 2) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Query length is too short",
                    search_suggestions: {
                        categories: [],
                        blogs: [],
                        tags: [],
                        authors: [],
                    },
                },
                { status: 200 },
            );
        }

        const [blogs, categories, tags, authors] = await Promise.all([
            Blog.find({
                $or: [
                    {
                        title: { $regex: q, $options: "i" },
                    },
                    {
                        slug: { $regex: q, $options: "i" },
                    },
                ],
            })
                .select("title slug")
                .limit(limit || undefined)
                .lean(),

            Category.aggregate([
                {
                    $match: {
                        name: { $regex: q, $options: "i" },
                    },
                },
                ...(limit ? [{ $limit: limit }] : []),
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
                    $sort: { name: 1 },
                },
            ]),
            await Tag.find({
                $or: [
                    {
                        name: { $regex: q, $options: "i" },
                    },
                ],
            })
                .select("name")
                .limit(limit || undefined)
                .lean(),
            User.find({
                $or: [
                    {
                        firstName: { $regex: q, $options: "i" },
                    },
                    {
                        lastName: { $regex: q, $options: "i" },
                    },
                ],
            })
                .select("firstName lastName")
                .limit(limit || undefined)
                .lean(),
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "Suggestions fetched successfully",
                search_suggestions: {
                    categories,
                    blogs,
                    tags,
                    authors,
                },
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Fetching Suggestions: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Suggestions",
                success: false,
            },
            { status: err?.statusCode || 500 },
        );
    }
};
