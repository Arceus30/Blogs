import mongoose from "mongoose";

let cached = global.mongoose;

const MONGODB_URL = process.env.MONGODB_URL;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

export const dbConnect = async () => {
    if (cached.conn) return cached.conn;
    cached.promise = cached.promise || mongoose.connect(MONGODB_URL);

    cached.conn = await cached.promise;

    return cached.conn;
};
