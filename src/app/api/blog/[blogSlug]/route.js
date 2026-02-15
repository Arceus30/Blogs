import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/utils/token";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import TagBlogJunction from "@/models/TagBlogJunction";
import { blogSchema } from "@/utils/serverSchema";
import slug from "slug";
import Comment from "@/models/Comment";

export const GET = async (_request, { params }) => {
    try {
        await dbConnect();
        const { blogSlug } = await params;
        if (!blogSlug || blogSlug.length === 0) {
            console.error("slug does not exist");
            return NextResponse.json(
                { message: "Invalid parameters", success: false },
                { status: 400 },
            );
        }
        const blog = await Blog.findOne({ slug: blogSlug })
            .populate("category author comments")
            .lean();

        if (!blog) {
            console.error(`Blog with slug ${blogSlug} not found`);
            return NextResponse.json(
                {
                    message: "No Blogs Found",
                    success: false,
                },
                { status: 404 },
            );
        }
        const junction = await TagBlogJunction.find({ blog: blog._id })
            .populate("tag")
            .lean();
        blog.tags = junction.map((j) => j.tag);
        return NextResponse.json({ blog, success: true }, { status: 200 });
    } catch (err) {
        console.error("Error Fetching Blog: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Fetching Blog",
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
