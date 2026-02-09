import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/onboarding", "/SignIn"];
const PUBLIC_API_ROUTES = ["/api/auth", "/api/user/me"];

// ✅ Allowed frontend origins (important for prod)
const ALLOWED_ORIGINS = [
    'capacitor://localhost',      // iOS
    'https://localhost',           // Android
    'http://localhost:3000',
];

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const origin = req.headers.get("origin");

    // ---- Create response early so we can attach headers ----
    const res = NextResponse.next();

    // ================= CORS HEADERS =================
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.headers.set("Access-Control-Allow-Origin", origin);
    }

    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Credentials", "true");

    // Handle Preflight requests
    if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: res.headers });
    }
    // ===============================================

    // 1️⃣ Skip Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/assets")
    ) {
        return res;
    }

    const authToken = req.cookies.get("token")?.value;

    // 2️⃣ Logged-in users should NOT see auth pages
    if (authToken && (pathname === "/SignIn" || pathname === "/onboarding")) {
        return NextResponse.redirect(new URL("/homepage", req.url));
    }

    // 3️⃣ Allow public pages
    if (PUBLIC_ROUTES.includes(pathname)) {
        return res;
    }

    // 4️⃣ Allow public APIs
    if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
        return res;
    }

    // 5️⃣ Protect everything else
    if (!authToken) {
        const loginUrl = new URL("/SignIn", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return res;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
