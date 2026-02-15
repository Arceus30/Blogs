import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const POST = async (_request) => {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        cookieStore.delete("refresh_token");

        return NextResponse.json(
            {
                message: "Sign Out Successful",
                success: true,
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie":
                        "refresh_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
                },
            },
        );
    } catch (err) {
        console.error("Sign Out Error: ", err);
        return NextResponse.json(
            {
                message: err?.message || "Sign Out Error",
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
