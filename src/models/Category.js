import { Schema, model, models, Types } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        user: { type: Types.ObjectId, ref: "User", required: true },
        blogCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true },
);

categorySchema.index(
    { user: 1, slug: 1 },
    { unique: true, name: "custom_key_1" },
);

categorySchema.on("index", async function (err) {
    if (err) {
        console.error("Index error: ", err);
        return;
    }
    try {
        if (this.collection) {
            const indexes = await this.collection.indexes();
            for (const index of indexes) {
                if (index.name !== "_id_" && index.name !== "custom_key_1") {
                    await this.collection.dropIndex(index.name);
                    console.log(`Dropped index: ${index.name}`);
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
});

categorySchema.statics.ensureGeneralCategory = async function (userId) {
    let category = await this.findOne({
        name: "general",
        user: new Types.ObjectId(userId),
    });

    if (!category) {
        category = new this({
            name: "general",
            slug: "general",
            user: new Types.ObjectId(userId),
            blogCount: 0,
        });
        await category.save();
    }

    return category;
};

const Category = models?.Category || model("Category", categorySchema);
export default Category;
