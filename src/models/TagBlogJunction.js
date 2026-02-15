import { Schema, Types, models, model } from "mongoose";

const tagBlogJunctionSchema = new Schema(
    {
        tag: { type: Types.ObjectId, ref: "Tag" },
        blog: { type: Types.ObjectId, ref: "Blog" },
    },
    {
        timestamps: true,
        autoIndex: false,
        indexes: [{ key: { tag: 1, blog: 1 }, unique: true }],
    },
);

const TagBlogJunction =
    models?.TagBlogJunction || model("TagBlogJunction", tagBlogJunctionSchema);

export default TagBlogJunction;
