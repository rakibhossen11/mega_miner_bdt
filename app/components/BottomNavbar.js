"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  // স্ক্রিনশটের ডিজাইন এবং আপনার রিয়েল প্রজেক্ট পাথের নিখুঁত ফিউশন
  const navItems = [
    { name: "Home", path: "/dashboard/mining", icon: "🏠" },
    { name: "Wallet", path: "/dashboard/withdraw", icon: "🏃" },
    { name: "Team", path: "/dashboard/referral", icon: "👥" },
    { name: "Task", path: "/dashboard/tasks", icon: "📋" },
    { name: "Profile", path: "/dashboard/profile", icon: "👤" }, // প্রোফাইল রুট যদি থাকে
  ];

  // যদি ইউজার ড্যাশবোর্ডের বাইরে থাকে (যেমন লগইন পেজ), তবে বারটি হাইড থাকবে
  if (!pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pb-4">
      {/* 
        PC ও মোবাইল সব জায়গাতেই পারফেক্ট ফ্রেম ধরে রাখার জন্য max-w-md এবং w-full ব্যবহার করা হয়েছে।
        pointer-events-auto দেওয়া হয়েছে যাতে ভেতরের বাটনগুলো ক্লিক করা যায়।
      */}
      <div className="w-full max-w-md bg-[#090e0b] border border-lime-950/50 px-2 py-3 grid grid-cols-5 gap-1 rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-auto">
        {navItems.map((item) => {
          // রুট পাথ ম্যাচিং ট্র্যাকার
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center py-1.5 transition-all rounded-xl active:scale-90 ${
                isActive ? "text-lime-400 scale-105" : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {/* নিয়ন-গ্রিন গ্লো ইফেক্টসহ আইকন */}
              <span className={`text-base mb-0.5 filter transition-all ${
                isActive ? "drop-shadow-[0_0_8px_rgba(132,204,22,0.6)] font-bold scale-110" : "opacity-70"
              }`}>
                {item.icon}
              </span>
              
              {/* টেক্সট লেবেল */}
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-lime-400 font-black" : "text-zinc-500 font-medium"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}