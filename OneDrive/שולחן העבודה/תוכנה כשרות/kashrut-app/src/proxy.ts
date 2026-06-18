import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;

  // Pass through: auth pages, portals, API routes, static files
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/api") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Not logged in → redirect to signin (skip in development)
  if (!req.auth && process.env.NODE_ENV !== "development") {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Logged in → apply i18n routing
  return intlMiddleware(req as NextRequest);
});

export const config = {
  matcher: ["/((?!_next|_vercel).*)"],
};
