import { NextResponse } from "next/server";
import Image from "@/models/Image";
import { dbConnect } from "@/lib/db";
import { Types } from "mongoose";

export const GET = async (_req, { params }) => {
    try {
        await dbConnect();
        let { photoId } = await params;
        photoId = new Types.ObjectId(photoId);
        const photoFound = await Image.findById(photoId);
        if (!photoFound) {
            console.error("Phot not found");
            return NextResponse.json(
                { message: "Photo not found", success: false },
                { status: 404 },
            );
        }
        return new NextResponse(photoFound.buffer, {
            status: 200,
            headers: {
                "Content-Type": photoFound.contentType || "image/jpg",
            },
        });
    } catch (err) {
        console.error("Photo Fetching Error: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Failed to fetch photo",
                success: false,
            },
            { status: err?.statusCode || 500 },
        );
    }
};
