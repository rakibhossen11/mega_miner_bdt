"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  // নেভিগেশন আইটেমগুলোর লিস্ট (পাথ, আইকন এবং নাম)
  const navItems = [
    { name: "Mining", path: "/dashboard", icon: "⛏️" },
    { name: "Tasks", path: "/dashboard/tasks", icon: "📋" },
    { name: "Lucky Spin", path: "/dashboard/spin", icon: "🎡" },
    { name: "Referral", path: "/dashboard/referral", icon: "📢" },
    { name: "Wallet", path: "/dashboard/withdraw", icon: "💸" },
  ];

  // যদি ইউজার অ্যাডমিন প্যানেল বা লগইন পেজে থাকে, তবে বটম বার দেখানোর দরকার নেই
  if (!pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-2 py-2 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all active:scale-90"
            >
              {/* আইকন */}
              <span className={`text-xl mb-1 ${isActive ? "scale-110" : "opacity-60"}`}>
                {item.icon}
              </span>
              {/* নাম */}
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isActive ? "text-amber-400 font-black" : "text-slate-400 font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}