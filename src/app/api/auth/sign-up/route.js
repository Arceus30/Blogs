import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Image from "@/models/Image";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signUpSchema } from "@/utils/serverSchema";
import { hashPwd } from "@/utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";

const photoType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

export const POST = async (request) => {
    let profilePhotoId = null;
    try {
        await dbConnect();
        const formData = await request.formData();
        const userData = Object.fromEntries(formData.entries());
        delete userData.profilePhoto;

        const { error, value: validatedData } = signUpSchema.validate(
            userData,
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
                { status: 401 },
            );
        }

        const profilePhoto = formData.get("profilePhoto[]");

        if (profilePhoto?.size > 0 && photoType.includes(profilePhoto?.type)) {
            const bytes = await profilePhoto.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const imageExist = await Image.findOne({
                buffer: buffer,
                size: buffer.length,
                contentType: profilePhoto.type,
            });
            profilePhotoId = imageExist._id;

            if (!imageExist) {
                const imageDoc = new Image({
                    filename: profilePhoto.name,
                    contentType: profilePhoto.type,
                    buffer: buffer,
                    size: buffer.length,
                });
                const savedImage = await imageDoc.save();
                profilePhotoId = savedImage._id;
            }
        }

        const userFound = await User.findOne({
            email: validatedData.email.toLowerCase(),
        });

        if (userFound) {
            console.error("User already exists");
            return NextResponse.json(
                {
                    message: "User already exist. Please log in",
                    success: false,
                },
                { status: 400 },
            );
        }

        const hashedPassword = await hashPwd(validatedData.password);

        const newUser = new User({
            ...validatedData,
            password: hashedPassword,
            profilePhoto: profilePhotoId || undefined,
            version: 0,
        });

        const savedUser = await newUser.save();

        const accessToken = generateAccessToken(savedUser);
        const refreshToken = generateRefreshToken(savedUser);

        const cookieStore = await cookies();
        cookieStore.set("refresh_token", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NEXT_ENV === "production",
            sameSite: "strict",
        });

        return NextResponse.json(
            {
                message: "Sign Up Successful",
                success: true,
                token: accessToken,
            },
            { status: 200 },
        );
    } catch (err) {
        if (profilePhotoId) {
            const user = await User.findOne({ profilePhoto: profilePhotoId });
            const blog = await Blog.findOne({ bannerImage: profilePhotoId });
            if (!user && !blog) await Image.findByIdAndDelete(profilePhotoId);
        }
        console.error("Sign Up Error: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Sign Up Error",
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
