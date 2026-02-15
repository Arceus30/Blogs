import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
    process.env.NEXT_PUBLIC_SIGN_UP_API,
    process.env.NEXT_PUBLIC_SIGN_IN_API,
];

const AUTH_PATHS = [
    process.env.NEXT_PUBLIC_ADMIN_ARCHIVED_BLOG_API,
    process.env.NEXT_PUBLIC_ADMIN_CATEGORY_API,
    process.env.NEXT_PUBLIC_ADMIN_CATEGORIES_API,
    process.env.NEXT_PUBLIC_ADMIN_CHANGE_PASSWORD_API,
    process.env.NEXT_PUBLIC_ADMIN_PROFILE_API,
    process.env.NEXT_PUBLIC_ADMIN_COMMENTS_API,
    process.env.NEXT_PUBLIC_ADMIN_COMMENT_API,
    process.env.NEXT_PUBLIC_SIGN_OUT_API,
];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    const authorizationHeader = request?.headers?.get("Authorization");
    const accessToken = authorizationHeader?.startsWith("Bearer ")
        ? authorizationHeader.split(" ")[1]
        : null;

    const refreshToken = request.headers
        ?.get("cookie")
        ?.split(";")
        ?.find((cookie) => cookie.includes("refresh_token="))
        ?.split("=")[1];

    if (pathname === process.env.NEXT_PUBLIC_REFRESH_TOKEN_API && !refreshToken)
        return NextResponse.json(
            { success: false, message: "You are not signed in" },
            { status: 400 },
        );

    if (PUBLIC_PATHS.includes(pathname) && accessToken) {
        return NextResponse.json(
            { success: false, message: "You are already signed in" },
            { status: 400 },
        );
    }

    if (AUTH_PATHS.includes(pathname) && (!accessToken || !refreshToken)) {
        return NextResponse.json(
            { success: false, message: "You are not signed in" },
            { status: 500 },
        );
    }
    return NextResponse.next();
}
