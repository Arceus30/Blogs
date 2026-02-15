import { Schema, model, models } from "mongoose";

const imageSchema = new Schema(
    {
        filename: {
            type: String,
            required: true,
            trim: true,
        },
        contentType: {
            type: String,
            required: true,
            enum: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
        },
        buffer: {
            type: Buffer,
            required: true,
        },
        size: {
            type: Number,
            required: true,
            max: [2 * 1024 * 1024, "File size should not be more than 2MB"],
            min: [1024, "Min 1KB"],
        },
    },
    { timestamps: true },
);

const Image = models?.Image || model("Image", imageSchema);

export default Image;
