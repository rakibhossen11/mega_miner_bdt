"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWalletData } from "../store/walletSlice";

export default function TopNavbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  // রিডাক্স স্টোর থেকে গ্লোবাল ডেটা রিড
  const { name, avatar, totalCoin, miningSpeed, loading, isCoinAnimating } = useSelector((state) => state.wallet);

  useEffect(() => {
    if (pathname && pathname.startsWith("/dashboard")) {
      dispatch(fetchWalletData());
    }
  }, [dispatch, pathname]);

  if (!pathname || !pathname.startsWith("/dashboard")) return null;

  return (
    <div className="w-full bg-[#060907] px-4 py-3 flex justify-between items-center border-b border-lime-950/20 sticky top-0 backdrop-blur-md z-50 select-none">
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-10 w-10 rounded-full bg-[#121b15] animate-pulse border border-lime-950/40"></div>
        ) : (
          <div className="h-10 w-10 rounded-full border border-lime-500/20 bg-[#161f19] flex items-center justify-center font-black text-lime-400 text-sm tracking-tighter shadow-[0_0_15px_rgba(132,204,22,0.05)]">
            {avatar}
          </div>
        )}
        
        <div className="flex flex-col">
          {loading ? (
            <div className="space-y-2 py-0.5">
              <div className="h-3 bg-[#121b15] w-24 rounded animate-pulse"></div>
              <div className="h-3 bg-[#121b15] w-16 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-black tracking-wide text-zinc-100 flex items-center gap-1.5">
                {name} 
                <span className="h-2 w-2 rounded-full bg-lime-400 inline-block animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.6)]"></span>
              </h4>
              
              {/* 🪙 কয়েন ব্যালেন্স ও রিয়েল-টাইম অ্যানিমেশন কন্টেইনার */}
              <div 
                className={`flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-lg transition-all duration-300 origin-left ${
                  isCoinAnimating 
                    ? "scale-110 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)] text-amber-400" 
                    : "scale-100 text-lime-400"
                }`}
              >
                <span className={`text-sm ${isCoinAnimating ? "animate-bounce" : ""}`}>🪙</span>
                <span className={`text-xs font-mono font-black tracking-wide transition-colors ${isCoinAnimating ? "text-amber-400" : "text-lime-400"}`}>
                  {totalCoin.toFixed(8)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {!loading && (
        <div className="bg-[#0b120d] border border-lime-950/80 rounded-[14px] px-3.5 py-1.5 text-right min-w-[105px] shadow-lg shadow-black/40">
          <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none">MINING SPEED</p>
          <p className="text-xs font-mono font-black text-lime-400 flex items-center justify-end gap-1 mt-1 leading-none">
            <span className="text-orange-400 text-[10px] animate-bounce">⚡</span> {miningSpeed.toFixed(1)} <span className="text-zinc-500 font-bold lowercase text-[10px]">/hour</span>
          </p>
        </div>
      )}
    </div>
  );
}