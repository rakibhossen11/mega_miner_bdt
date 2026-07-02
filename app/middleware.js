import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 🔒 যে যে পেজগুলো লগইন ছাড়া ভিজিট করা যাবে না (Array list)
  const protectedRoutes = ["/dashboard/mining", "/dashboard/wallet", "/dashboard/team", "/dashboard/task", "/dashboard/profile", "/admin"];

  // চেক করা হচ্ছে ইউজার কোনো প্রটেক্টেড পেজে যাওয়ার চেষ্টা করছে কিনা
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // ১. ইউজার যদি লগইন করা না থাকে এবং প্রটেক্টেড পেজে যেতে চায়, তাকে /login এ পাঠানো হবে
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ২. ইউজার যদি অলরেডি লগইন থাকে, তবে সে আবার /login পেজে ঢুকতে পারবে না
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url)); // ডিফল্ট হোম পেজে রিডাইরেক্ট
  }

  return NextResponse.next();
}

// matcher কনফিগারেশন যাতে অপ্রয়োজনীয় ফাইলে মিডলওয়্যার রান না হয়
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};