import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isPublicRoutes = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/events/:id",
]);

const isApiPublicRoutes = createRouteMatcher([
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/api/uploadthing"
])

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url);
    const isHome = currentUrl.pathname === "/";
    const isSignIn = currentUrl.pathname === "/sign-in";
    const isApiRequest = currentUrl.pathname.startsWith("/api");
  
    // If the user is signed in and on a public route, do not redirect
    if (userId && isPublicRoutes(req) && !isHome && !isSignIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  
    // If the user is not signed in and on a protected route, redirect to sign-in
    if (!userId && !isPublicRoutes(req) && !isApiPublicRoutes(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  
    // Handle API requests
    if (isApiRequest && !isApiPublicRoutes(req)) {
      return NextResponse.next();
    }
  
    return NextResponse.next();
  });
  

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};