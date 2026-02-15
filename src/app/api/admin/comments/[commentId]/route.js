import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/utils/token";
import Comment from "@/models/Comment";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const blog = searchParams.get("blog");
        const { commentId } = await params;

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

        const blogFound = await Blog.findOne({ slug: blog });
        if (!blogFound) {
            console.error("Blog not Found");
            return NextResponse.json(
                { message: "Blog not Found", success: false },
                { status: 400 },
            );
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            console.error("Comment not Found");
            return NextResponse.json(
                { message: "Comment not Found", success: false },
                { status: 400 },
            );
        }

        if (
            comment?.author.toString() !== user?._id.toString() &&
            user?._id.toString() !== blogFound?.author.toString()
        ) {
            console.error("You are not authorized");
            return NextResponse.json(
                { message: "Not authorized", success: false },
                { status: 400 },
            );
        }

        const commentIndex = blogFound?.comments?.findIndex(
            (id) => id.toString() === commentId,
        );

        if (commentIndex !== -1) {
            blogFound.comments.splice(commentIndex, 1);
        }

        await blogFound.save();

        await Comment.findByIdAndDelete(commentId);

        return NextResponse.json(
            { success: true, message: "Comment Deleted successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error deleting comment: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Error Deleting Comment",
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
