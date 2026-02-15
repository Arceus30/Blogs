import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/utils/token";
import Comment from "@/models/Comment";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";
import Joi from "joi";

export const POST = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const blog = searchParams.get("blog");

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
        const commentData = Object.fromEntries(formData.entries());

        const { error, value: validatedData } = Joi.object({
            text: Joi.string()
                .trim()
                .required()
                .messages({ "any.required": "Comment Text is required" }),
        }).validate(commentData, {
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

        const newComment = new Comment({
            text: validatedData.text,
            author: user._id,
        });
        await newComment.save();

        const blogFound = await Blog.findOne({ slug: blog });
        if (!blogFound) {
            console.error("Blog not Found");
            return NextResponse.json(
                { message: "Blog not Found", success: false },
                { status: 400 },
            );
        }
        blogFound?.comments?.push(newComment);
        await blogFound.save();

        return NextResponse.json(
            { success: true, message: "Comment Created successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error creating comment: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Creating Comment",
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
