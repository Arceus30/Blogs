import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { verifyAccessToken } from "@/utils/token";
import slug from "slug";
import { categorySchema } from "@/utils/serverSchema";

export const GET = async (req, { params }) => {
    try {
        const { catSlug } = await params;
        await dbConnect();
        const accessToken = await req.headers
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
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            console.error("User does not exists");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        await Category.ensureGeneralCategory(user._id);
        const category = await Category.findOne({
            slug: catSlug,
            user: user._id,
        });
        if (!category) {
            console.error(`Category with ${catSlug} does not exists`);
            return NextResponse.json(
                {
                    message: `Category with ${catSlug} does not exists`,
                    success: false,
                },
                { status: 400 },
            );
        }

        return NextResponse.json({ category }, { status: 200 });
    } catch (err) {
        console.error("Error fetching category", err);
        return NextResponse.json(
            {
                message: err.message || "Error Fetching Category",
                success: false,
            },
            {
                status:
                    err?.message === "jwt expired"
                        ? 401
                        : err.statusCode || 500,
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
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            console.error("User does not exists");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const { catSlug } = await params;
        const formData = await request.formData();
        const categoryData = Object.fromEntries(formData.entries());
        const { error, value: validatedData } = categorySchema.validate(
            categoryData,
            {
                abortEarly: false,
                stripUnknown: true,
            },
        );

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

        const category = await Category.findOne({
            slug: catSlug,
            user: user._id,
        });

        if (!category) {
            console.error(`Category with ${catSlug} does not exists`);
            return NextResponse.json(
                {
                    message: `Category with ${catSlug} does not exists`,
                    success: false,
                },
                { status: 400 },
            );
        }

        if (category?.slug === "general") {
            console.error("General Category cannot be updated");
            return NextResponse.json(
                {
                    message: "General category cannot be updated",
                    success: false,
                },
                { status: 400 },
            );
        }

        let newSlug = slug(validatedData.name);
        let slugFound = await Category.findOne({
            slug: newSlug,
            user: user._id,
        });
        let i = 1;
        while (
            slugFound &&
            slugFound?._id?.toString() !== category?._id?.toString()
        ) {
            newSlug = slug(validatedData.name + i);
            slugFound = await Category.findOne({
                slug: newSlug,
                user: user._id,
            });
            i += 1;
        }

        category.name = validatedData.name;
        category.slug = newSlug;
        await category.save();

        return NextResponse.json(
            { message: "Category updated", success: true },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error Updating Category: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Updating Category",
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
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const { catSlug } = await params;
        const category = await Category.findOne({
            slug: catSlug,
            user: user._id,
        });

        if (category.name === "general") {
            console.error("General category cannot be deleted");
            return NextResponse.json(
                {
                    success: false,
                    messsage: "General category cannot be deleted",
                },
                { status: 400 },
            );
        }

        const generalCategory = await Category.ensureGeneralCategory(user._id);

        const res = await Blog.updateMany(
            { category: category._id },
            { category: generalCategory._id },
        );
        generalCategory.blogCount += res.modifiedCount;
        await generalCategory.save();
        await Category.deleteOne({ slug: catSlug });
        return NextResponse.json(
            { success: true, message: "Category deleted" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error deleting category", err);
        return NextResponse.json(
            {
                message: err.message || "Error Deleting Category",
                success: false,
            },
            {
                status:
                    err?.message === "jwt expired"
                        ? 401
                        : err.statusCode || 500,
            },
        );
    }
};
