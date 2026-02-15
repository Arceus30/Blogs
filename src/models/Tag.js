import { Schema, models, model } from "mongoose";

const tagSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    { timestamps: true },
);

const Tag = models?.Tag || model("Tag", tagSchema);

export default Tag;
