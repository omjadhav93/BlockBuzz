// import { NextRequest, NextResponse } from "next/server";

// const PUBLIC_ROUTES = [
//     "/",
//     "/onboarding",
//     "/SignIn",
// ];

// const PUBLIC_API_ROUTES = [
//     "/api/auth",
//     "/api/user/me",
// ];

// export function middleware(req: NextRequest) {
//     const pathname = req.nextUrl.pathname.toLowerCase();

//     // 1️⃣ Next internals
//     if (
//         pathname.startsWith("/_next") ||
//         pathname.startsWith("/favicon") ||
//         pathname.startsWith("/assets")
//     ) {
//         return NextResponse.next();
//     }

//     const authToken = req.cookies.get("token")?.value;

//     // 2️⃣ Logged-in users should NOT see auth pages
//     if (authToken && (pathname === "/SignIn" || pathname === "/onboarding")) {
//         return NextResponse.redirect(new URL("/homepage", req.url));
//     }

//     // 3️⃣ Allow public routes
//     if (PUBLIC_ROUTES.includes(pathname)) {
//         return NextResponse.next();
//     }

//     // 4️⃣ Allow public APIs
//     if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
//         return NextResponse.next();
//     }

//     // 5️⃣ Block protected routes
//     if (!authToken) {
//         const loginUrl = new URL("/SignIn", req.url);
//         loginUrl.searchParams.set("from", pathname);
//         return NextResponse.redirect(loginUrl);
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };
