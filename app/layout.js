import "./globals.css";
import { ReduxProvider } from "./store/provider";
import BottomNavbar from "./components/BottomNavbar";
import TopNavbar from "./components/TopNavbar";

export const metadata = {
  title: "MegaMiner BDT",
  description: "Virtual Mining Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-[#060907] text-white flex justify-center items-center p-0 sm:p-4 selection:bg-lime-500/20 overflow-hidden">
        <ReduxProvider>
          {/* মোবাইল কন্টেইনার ফ্রেম: 
            পিসি বা মোবাইলে হাইট লক রাখবে এবং ভেতরের লেআউটকে ভাঙতে দেবে না।
          */}
          <div className="w-full max-w-md h-full sm:h-[840px] bg-[#0a0f0c] sm:border sm:border-lime-950/40 sm:rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col">
            
            {/* ১. গ্লোবাল টপ বার */}
            <TopNavbar />

            {/* ২. মেইন কন্টেন্ট এরিয়া (প্যাডিং ডাবল হওয়া রোধ করতে p-4 সরিয়ে জাস্ট আপ-ডাউন ব্যালেন্স করা হয়েছে) */}
            <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
              {children}
            </main>

            {/* ৩. গ্লোবাল বটম বার */}
            <BottomNavbar />

          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}