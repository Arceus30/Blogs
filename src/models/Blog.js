import { Types, Schema, model, models } from "mongoose";

const blogSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9-]+$/],
        },
        content: { type: String, required: true },
        category: { type: Types.ObjectId, ref: "Category", required: true },
        bannerImage: { type: Types.ObjectId, ref: "Image" },
        status: {
            type: String,
            enum: ["published", "archived"],
            default: "published",
        },
        publishedAt: { type: Date, default: Date.now() },
        author: { type: Types.ObjectId, ref: "User", required: true },
        comments: [{ type: Types.ObjectId, ref: "Comment" }],
    },
    { timestamps: true },
);

blogSchema.index({ author: 1, publishedAt: -1 });

const Blog = models?.Blog || model("Blog", blogSchema);

export default Blog;
