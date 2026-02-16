import { dbConnect } from "@/lib/db";
import { verifyAccessToken } from "@/utils/token";
import { NextResponse } from "next/server";
import { blogSchema } from "@/utils/serverSchema";
import slug from "slug";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Comment from "@/models/Comment";
import Image from "@/models/Image";
import Tag from "@/models/Tag";
import TagBlogJunction from "@/models/TagBlogJunction";
import User from "@/models/User";
import mongoose from "mongoose";

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
            .populate("category author")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                },
            })
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

export const PUT = async (request, { params }) => {
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
        let user = await User.findById(decodedToken?.userId);
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const { blogSlug } = await params;
        const formData = await request.formData();

        const blog = await Blog.findOne({ slug: blogSlug }).populate(
            "category",
        );

        if (!blog)
            return NextResponse.json(
                {
                    message: "No Blogs Found",
                    success: false,
                },
                { status: 400 },
            );

        if (blog?.author.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: "You are not authorized",
                    success: false,
                },
                { status: 400 },
            );
        }

        const blogData = Object.fromEntries(formData.entries());
        delete blogData.tags;
        delete blogData.bannerImage;

        const { error, value: validatedData } = blogSchema.validate(blogData, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessage = error.details[0];
            console.error(errorMessage);
            return NextResponse.json(
                {
                    message: errorMessage,
                    success: false,
                },
                { status: 400 },
            );
        }

        let category = await Category.findById(blog?.category?._id);
        if (!validatedData?.category) {
            category = await Category.ensureGeneralCategory(user._id);
            category.blogCount += 1;
            await category.save();
        }
        if (
            validatedData?.category &&
            validatedData?.category !== blog?.category?._id
        ) {
            category = await Category.findByIdAndUpdate(
                validatedData?.category,
                { $inc: { blogCount: 1 } },
                { returnDocument: "after" },
            );
            await Category.findByIdAndUpdate(
                blog?.category?._id,
                { $inc: { blogCount: -1 } },
                { returnDocument: "after", runValidators: true },
            );
        }

        const rawTags = formData.get("tags");

        if (rawTags) {
            const tagNames = rawTags
                .split(" ")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "");

            const existingTags = await Tag.find({
                name: { $in: tagNames },
            });
            const existingTagsIds = existingTags.map((tag) => tag._id);

            const oldTagsToKeep = await TagBlogJunction.find({
                $and: [{ blog: blog?._id }, { tag: { $in: existingTagsIds } }],
            }).populate("tag");
            const oldTagsToKeepIds = oldTagsToKeep.map(
                (oldTags) => oldTags.tag._id,
            );

            const oldTagsToDelete = await TagBlogJunction.find({
                $and: [
                    { blog: blog?._id },
                    { tag: { $nin: oldTagsToKeepIds } },
                ],
            });
            const oldTagsToDeleteIds = oldTagsToDelete.map((jun) => jun.tag);
            await TagBlogJunction.deleteMany({
                $and: [
                    { blog: blog?._id },
                    { tag: { $in: oldTagsToDeleteIds } },
                ],
            });

            for (const tagName of tagNames) {
                if (
                    !oldTagsToKeep.some(
                        (tagBlog) => tagBlog?.tag?.name === tagName,
                    )
                ) {
                    let tag = await Tag.findOne({ name: tagName });
                    if (!tag) {
                        tag = new Tag({ name: tagName });
                        await tag.save();
                    }
                    if (tag) {
                        await TagBlogJunction.insertOne({
                            tag,
                            blog,
                        });
                    }
                }
            }

            for (const jun of oldTagsToDelete) {
                const remainingJun = await TagBlogJunction.countDocuments({
                    tag: jun.tag,
                    blog: { $ne: blog?._id },
                });
                if (remainingJun === 0) {
                    await Tag.findByIdAndDelete(jun.tag);
                }
            }
        }

        let newSlug = slug(validatedData.title);
        let slugFound = await Blog.findOne({ slug: newSlug });
        let i = 1;
        while (
            slugFound &&
            slugFound?._id?.toString() !== blog?._id?.toString()
        ) {
            newSlug = slug(validatedData.title + i);
            slugFound = await Blog.findOne({ slug: newSlug });
            i += 1;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            blog._id,
            {
                title: validatedData?.title,
                slug: newSlug,
                content: validatedData?.content,
                category: category?._id,
                publishedAt: Date.now(),
            },
            { runValidators: true, returnDocument: "after" },
        );
        return NextResponse.json(
            { message: "Blog Updated Successfully", success: true },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Updating Blog: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Updating Blog",
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

export const PATCH = async (request, { params }) => {
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
        let user = await User.findById(decodedToken?.userId);
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const { blogSlug } = await params;

        const formData = await request.formData();
        const field = formData.get("field");
        const value = formData.get("value");

        const blog = await Blog.findOne({ slug: blogSlug });
        if (!blog) {
            console.error(`Blog with slug ${blogSlug} not found`);
            return NextResponse.json(
                {
                    message: "No Blogs Found",
                    success: false,
                },
                { status: 400 },
            );
        }

        if (blog?.author.toString() !== user?._id.toString()) {
            console.error(`You are not authorized`);
            return NextResponse.json(
                {
                    message: "You are not authorized",
                    success: false,
                },
                { status: 400 },
            );
        }
        blog[field] = value;
        await blog.save({ runValidators: true });
        return NextResponse.json(
            { success: true, message: "Blog Updated Successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Updating Blog: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Updating Blog",
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

export const DELETE = async (request, { params }) => {
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
        let user = await User.findById(decodedToken?.userId);
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const { blogSlug } = await params;

        const blogToBeDeleted = await Blog.findOne({ slug: blogSlug });

        if (!blogToBeDeleted) {
            console.error(`Blog with slug ${blogSlug} does not exist`);
            return NextResponse.json(
                {
                    message: "No Blogs Found",
                    success: false,
                },
                { status: 404 },
            );
        }
        if (blogToBeDeleted?.author.toString() !== user._id.toString()) {
            console.error("You are not authorized");
            return NextResponse.json(
                {
                    message: "You are not authorized",
                    success: false,
                },
                { status: 403 },
            );
        }
        await Category.findByIdAndUpdate(blogToBeDeleted.category, {
            $inc: { blogCount: -1 },
        });

        const tagsToBeDeleted = await TagBlogJunction.find({
            blog: blogToBeDeleted._id,
        });

        const tagIds = tagsToBeDeleted.map((t) => t?.tag);

        await TagBlogJunction.deleteMany({ blog: blogToBeDeleted._id });

        await User.findByIdAndUpdate(blogToBeDeleted.author, {
            $inc: { numBlogs: -1 },
        });

        await Promise.all(
            tagIds.map(async (t) => {
                const tagFound = await TagBlogJunction.countDocuments({
                    tag: t,
                });
                if (tagFound <= 0) await Tag.findByIdAndDelete(t);
            }),
        );

        await Blog.deleteOne({ slug: blogSlug });

        const imagesFound =
            (await Blog.countDocuments({
                bannerImage: blogToBeDeleted.bannerImage,
            })) +
            (await User.countDocuments({
                profilePhoto: blogToBeDeleted.bannerImage,
            }));
        if (imagesFound === 0) {
            await Image.findByIdAndDelete(blogToBeDeleted.bannerImage);
        }

        return NextResponse.json(
            { message: "Blog deleted Successfully", success: true },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Deleting Blog: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Deleting Blog",
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
