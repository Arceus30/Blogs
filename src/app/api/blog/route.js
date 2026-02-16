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

const photoType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

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

export const POST = async (request) => {
    let bannerImageId = null;
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
        const blogData = Object.fromEntries(formData.entries());
        delete blogData.bannerImage;

        const { error, value: validatedData } = blogSchema.validate(blogData, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessage = error.details[0];
            console.error(errorMessage);
            return NextResponse.json(
                { message: errorMessage, success: false },
                { status: 400 },
            );
        }

        const bannerImage = formData.get("bannerImage[]");
        if (bannerImage?.size > 0 && photoType.includes(bannerImage?.type)) {
            const bytes = await bannerImage.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const imageExist = await Image.findOne({
                buffer: buffer,
                size: buffer.length,
                contentType: bannerImage.type,
            });
            bannerImageId = imageExist?._id;

            if (!imageExist) {
                const imageDoc = new Image({
                    filename: bannerImage.name,
                    contentType: bannerImage.type,
                    buffer: buffer,
                    size: buffer.length,
                });
                const savedImage = await imageDoc.save();
                bannerImageId = savedImage?._id;
            }
        }

        let category = await Category.ensureGeneralCategory(user._id);
        if (validatedData.category) {
            category = await Category.findByIdAndUpdate(
                validatedData.category,
                { $inc: { blogCount: 1 } },
                { returnDocument: "after" },
            );
        } else {
            category = await Category.findByIdAndUpdate(
                category._id,
                { $inc: { blogCount: 1 } },
                { returnDocument: "after" },
            );
        }

        user.numBlogs += 1;
        await user.save();

        let newSlug = slug(validatedData.title);
        let slugFound = await Blog.findOne({ slug: newSlug });
        let i = 1;
        while (slugFound) {
            newSlug = slug(validatedData.title + i);
            slugFound = await Blog.findOne({ slug: newSlug });
            i += 1;
        }
        const newBlog = new Blog({
            title: validatedData.title,
            slug: newSlug,
            content: validatedData.content,
            category: category._id,
            bannerImage: bannerImageId,
            status: "published",
            author: user._id,
        });

        const savedBlog = await newBlog.save();

        const rawTags = formData.get("tags");

        if (rawTags) {
            const tagNames = rawTags
                .split(" ")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "");
            const tags = await Promise.all(
                tagNames.map(async (name) => {
                    return await Tag.findOneAndUpdate(
                        { name: { $regex: name, $options: "i" } },
                        { name },
                        { upsert: true, returnDocument: "after" },
                    );
                }),
            );

            const junctions = tags.map(
                (tag) =>
                    new TagBlogJunction({
                        tag: tag._id,
                        blog: savedBlog._id,
                    }),
            );

            await Promise.all(junctions.map((j) => j.save()));
        }

        return NextResponse.json(
            {
                message: "Blog Created Successfully",
                success: true,
                blog: savedBlog,
            },
            { status: 200 },
        );
    } catch (err) {
        if (bannerImageId) {
            const blog = await Blog.findOne({ bannerImage: bannerImageId });
            const user = await User.findOne({ profilePhoto: bannerImageId });
            if (!user & !blog) await Image.findByIdAndDelete(bannerImageId);
        }
        console.error("Blog Creation error:", err);
        return NextResponse.json(
            {
                message: err?.message || "Blog Creation Failed",
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
