import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth";

const { auth } = NextAuth(authConfig);

export async function middleware(req: NextRequest) {
  const session = await auth();
  const pathname = req.nextUrl.pathname;

  const publicPaths = ["/login"];
  if (publicPaths.includes(pathname)) {
    if (session && session.user.iConsent) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  if (!session) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url)
    );
  }
  if (session && !session.user.iConsent) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
