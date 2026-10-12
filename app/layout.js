"use client";

import "./globals.css";
import { ReduxProvider } from "./store/provider";
import BottomNavbar from "./components/BottomNavbar";
import TopNavbar from "./components/TopNavbar";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast"; // 🍿 গ্লোবাল টোস্ট কন্টেইনার
import { AuthProvider } from "./components/AuthProvider"; // 🔑 ইম্পোর্ট করা আছে
import { Poppins } from "next/font/google"; // 🖋️ কাস্টম গুগল ফন্ট ইমপোর্ট

// ফন্ট কনফিগারেশন
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // 🕵️️‍♂️ চেক করা হচ্ছে ইউজার অ্যাডমিন পেজে আছে কিনা (অ্যাডমিন হলে ফুল স্ক্রিন পিসি ভিউ)
  const isAdminRoute = pathname?.startsWith("/admin");

  // 🚪 চেক করা হচ্ছে ইউজার লগইন বা অথ পেজে আছে কিনা (ক্লিন ভিউর জন্য নেভবার হাইড হবে)
  const isAuthRoute = pathname === "/auth/login" || pathname?.startsWith("/auth");

  return (
    <html lang="en" className={`h-full antialiased ${poppins.variable}`}>
      <body className="min-h-full bg-[#060907] text-white selection:bg-lime-500/25 m-0 p-0 font-sans">
        <AuthProvider>
          <ReduxProvider>

            {/* গ্লোবাল টোস্ট নোটিফিকেশন এলার্ট সিস্টেম */}
            <Toaster position="top-center" reverseOrder={false} />

            {isAdminRoute ? (
              /* 🖥️ অ্যাডমিন প্যানেলের জন্য ফুল স্ক্রিন পিসি ভিউ */
              <div className="w-full min-h-screen bg-[#040805] flex flex-col">
                <main className="flex-1 w-full overflow-y-auto">
                  {children}
                </main>
              </div>
            ) : (
              /* 📱 ইউজার মোড: মোবাইল ফ্রেম বা রেসপন্সিভ ভিউ (স্ক্রোল নিশ্চিত করা হয়েছে) */
              <div className="w-full min-h-screen flex justify-center items-start sm:p-4 bg-[#060907]">
                
                <div className="w-full max-w-md min-h-screen sm:min-h-[840px] bg-[#0a0f0c] sm:border sm:border-lime-950/40 sm:rounded-[32px] shadow-2xl flex flex-col relative">

                  {/* ১. গ্লোবাল টপ বার (Sticky করে দেওয়া হয়েছে যাতে উপরে আটকে থাকে) */}
                  {!isAuthRoute && (
                    <div className="sticky top-0 z-50">
                      <TopNavbar />
                    </div>
                  )}

                  {/* ২. মেইন কন্টेंट এরিয়া (এখানে flex-1 এবং overflow-y-auto যোগ করা হয়েছে যাতে স্ক্রোল কাজ করে) */}
                  <main className="flex-1 overflow-y-auto flex flex-col pb-24">
                    {children}
                  </main>

                  {/* ৩. গ্লোবাল বটম বার (Fixed করে দেওয়া হয়েছে যাতে স্ক্রোল করলেও নিচে আটকে থাকে) */}
                  {!isAuthRoute && (
                    <div className="absolute bottom-0 left-0 right-0 z-50">
                      <BottomNavbar />
                    </div>
                  )}

                </div>
              </div>
            )}

          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}