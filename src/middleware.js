import { NextResponse } from "next/server";

export function middleware(req) {
    const basicAuth = req.headers.get("authorization");
    const url = req.nextUrl;

    if (!basicAuth) {
        return new NextResponse("Auth required", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Secure Area"',
            },
        });
    }

    const auth = basicAuth.split(" ")[1];
    const [user, pwd] = atob(auth).split(":");

    if (user === process.env.SITE_USER && pwd === process.env.SITE_PASSWORD) {
        return NextResponse.next();
    }

    return new NextResponse("Auth required", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
    });
}