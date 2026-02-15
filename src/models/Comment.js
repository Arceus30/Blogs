import { Types, Schema, model, models } from "mongoose";

const commentSchema = new Schema(
    {
        text: { type: String, required: true, trim: true },
        author: { type: Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
);

commentSchema.index({ author: 1, createdAt: -1 });

const Comment = models?.Comment || model("Comment", commentSchema);

export default Comment;
