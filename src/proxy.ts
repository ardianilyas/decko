import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/chat"];
const publicRoutes = ["/auth/login", "/auth/signup"];

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

    // getSessionCookie checks for the existence of the better-auth cookie
    const sessionCookie = getSessionCookie(request);

    // Redirect to login if accessing protected route without a session cookie
    if (isProtectedRoute && !sessionCookie) {
        return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
    }

    // Redirect to chat if accessing auth pages with a session cookie
    if (isPublicRoute && sessionCookie) {
        return NextResponse.redirect(new URL("/chat", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
