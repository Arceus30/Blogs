import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Category from "@/models/Category";
import Blog from "@/models/Blog";
import { categorySchema } from "@/utils/serverSchema";
import { verifyAccessToken } from "@/utils/token";
import slug from "slug";

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = req.nextUrl;
        const page = parseInt(searchParams.get("page"), 10) || 1;
        const limit = parseInt(searchParams.get("limit")) || 45;
        const skip = (page - 1) * limit;
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
            console.error("User not found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const blogs = await Blog.find({ author: user._id });
        if (blogs.length <= 0)
            return NextResponse.json(
                {
                    success: true,
                    message: "Categories fetched successfully",
                    categories: [],
                    totalPages: 0,
                },
                { status: 200 },
            );

        await Category.ensureGeneralCategory(user._id);

        const categories = await Category.find({ user: user._id })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(
            (await Category.countDocuments({ user: user._id })) / limit,
        );
        return NextResponse.json(
            {
                success: true,
                message: "Categories fetched successfully",
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
            {
                status:
                    err?.message === "jwt expired"
                        ? 401
                        : err?.statusCode || 500,
            },
        );
    }
};

export const POST = async (req) => {
    try {
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
            console.error("User not Found");
            return NextResponse.json(
                { message: "User not Found", success: false },
                { status: 400 },
            );
        }

        const formData = await req.formData();
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
                { message: errorMessage, success: false },
                { status: 400 },
            );
        }

        const categoryExists = await Category.findOne({
            name: validatedData.name,
            user: user._id,
        });

        if (categoryExists) {
            console.error("Category already exists");
            return NextResponse.json(
                {
                    message: "Category already exist.",
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
        while (slugFound) {
            newSlug = slug(validatedData.name + i);
            slugFound = await Category.findOne({
                slug: newSlug,
                user: user._id,
            });
            i += 1;
        }

        const newCategory = new Category({
            name: validatedData.name,
            slug: newSlug,
            user: user._id,
            blogCount: 0,
        });

        await newCategory.save();
        return NextResponse.json(
            { success: true, message: "Category Created successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error creating category: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Creating Categories",
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
