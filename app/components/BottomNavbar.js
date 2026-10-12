"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, ClipboardList, User } from "lucide-react";

export default function BottomNavbar() {
  const pathname = usePathname();

  // পেশাদার লুকের জন্য Lucide আইকন ম্যাপ করা হলো
  const navItems = [
    { name: "Home", path: "/dashboard/home", icon: Home },
    // { name: "Wallet", path: "/dashboard/withdraw", icon: Wallet },
    { name: "Team", path: "/dashboard/referral", icon: Users },
    // { name: "Task", path: "/dashboard/tasks", icon: ClipboardList },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  // যদি ইউজার ড্যাশবোর্ডের বাইরে থাকে (যেমন লগইন পেজ), তবে বারটি হাইড থাকবে
  if (!pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pb-4">
      <div className="w-full max-w-md bg-[#060907]/90 border border-lime-500/20 px-3 py-2.5 grid grid-cols-3 gap-1 rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center py-1.5 transition-all rounded-2xl active:scale-90 ${
                isActive ? "text-lime-400 bg-lime-500/10 scale-105" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {/* প্রিমিয়াম নিয়ন-গ্রিন গ্লো ইফেক্টসহ Lucide আইকন */}
              <IconComponent 
                size={20} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? "text-lime-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)] scale-110 stroke-[2.5]" 
                    : "text-zinc-500 stroke-[1.75]"
                }`} 
              />
              
              {/* টেক্সট লেবেল */}
              <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 transition-colors ${
                isActive ? "text-lime-400 font-extrabold" : "text-zinc-500 font-medium"
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