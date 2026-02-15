import { Types, Schema, models, model } from "mongoose";
import validator from "validator";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: validator.isEmail,
                message: "Invalid Email",
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [8, "Password should be at least 8 characters"],
            maxlength: [128, "Password cannot exceed 128 characters"],
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                "Password must contain uppercase, lowercase, number, and special character",
            ],
            select: false,
        },
        profilePhoto: {
            type: Types.ObjectId,
            ref: "Image",
        },
        bio: {
            type: String,
            max: 150,
        },
        numBlogs: {
            type: Number,
            default: 0,
            min: 0,
        },
        version: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true },
);

const User = models?.User || model("User", userSchema);

export default User;
