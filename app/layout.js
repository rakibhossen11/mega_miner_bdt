"use client";

import "./globals.css";
import { ReduxProvider } from "./store/provider";
import BottomNavbar from "./components/BottomNavbar";
import TopNavbar from "./components/TopNavbar";
import { usePathname } from "next/navigation"; 
import { Toaster } from "react-hot-toast"; // 🍿 গ্লোবাল টোস্ট কন্টেইনার
import { AuthProvider } from "./components/AuthProvider"; // 🔑 ইম্পোর্ট করা আছে

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // 🕵️‍♂️ চেক করা হচ্ছে ইউজার অ্যাডমিন পেজে আছে কিনা (অ্যাডমিন হলে ফুল স্ক্রিন পিসি ভিউ)
  const isAdminRoute = pathname?.startsWith("/admin");

  // 🚪 চেক করা হচ্ছে ইউজার লগইন বা অথ পেজে আছে কিনা (ক্লিন ভিউর জন্য নেভবার হাইড হবে)
  const isAuthRoute = pathname === "/auth/login" || pathname?.startsWith("/auth");

  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-[#060907] text-white selection:bg-lime-500/20 overflow-x-hidden m-0 p-0">
        <ReduxProvider>
          {/* 🚀 AuthProvider এখানে যুক্ত করা হলো যেন অ্যাডমিন এবং ইউজার সব রুটই এর অ্যাক্সেস পায় */}
          <AuthProvider>
            
            {/* গ্লোবাল টোস্ট নোটিফিকেশন এলার্ট সিস্টেম */}
            <Toaster position="top-center" reverseOrder={false} />

            {isAdminRoute ? (
              /* 🖥️ অ্যাডমিন প্যানেলের জন্য ফুল স্ক্রিন পিসি ভিউ (মোবাইল ফ্রেম থাকবে না) */
              <div className="w-full min-h-screen bg-[#040805] flex flex-col">
                <main className="flex-1 w-full overflow-y-auto">
                  {children}
                </main>
              </div>
            ) : (
              /* 📱 ইউজার মোড: সকল স্ক্রিনে আপনার আগের সেইম মোবাইল কন্টেইনার ফ্রেম (হাইট লকড) */
              <div className="h-full w-full flex justify-center items-center p-0 sm:p-4 overflow-hidden fixed inset-0">
                <div className="w-full max-w-md h-full sm:h-[840px] bg-[#0a0f0c] sm:border sm:border-lime-950/40 sm:rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col">
                  
                  {/* ১. গ্লোবাল টপ বার (লগইন/অথ পেজ হলে রেন্ডার হবে না) */}
                  {!isAuthRoute && <TopNavbar />}

                  {/* ২. মেইন কন্টেন্ট এরিয়া (লগইন পেজ সহ সব পেজ এই ফেমের ভেতরেই থাকবে) */}
                  <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
                    {children}
                  </main>

                  {/* ৩. গ্লোবাল বটম বার (লগইন/অথ পেজ হলে রেন্ডার হবে না) */}
                  {!isAuthRoute && <BottomNavbar />}

                </div>
              </div>
            )}

          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}