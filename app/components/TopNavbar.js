"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWalletData } from "../store/walletSlice";

export default function TopNavbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  // Redux store theke global data read
  const { fullname, avatar, totalCoin, miningSpeed, loading, isCoinAnimating } = useSelector((state) => state.wallet);

  useEffect(() => {
    if (pathname && pathname.startsWith("/dashboard")) {
      dispatch(fetchWalletData());
    }
  }, [dispatch, pathname]);

  if (!pathname || !pathname.startsWith("/dashboard")) return null;

  return (
    <div className="w-full bg-[#030712] px-4 py-3 flex justify-between items-center border-b border-[#2EFF2E]/20 sticky top-0 backdrop-blur-md z-50 select-none shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-10 w-10 rounded-full bg-[#0a1410] animate-pulse border border-[#2EFF2E]/30"></div>
        ) : (
          <div className="h-10 w-10 rounded-full border border-[#2EFF2E]/40 bg-[#06120c] flex items-center justify-center font-black text-[#2EFF2E] text-sm tracking-tighter shadow-[0_0_15px_rgba(46,255,46,0.15)]">
            {avatar}
          </div>
        )}
        
        <div className="flex flex-col">
          {loading ? (
            <div className="space-y-2 py-0.5">
              <div className="h-3 bg-[#0a1410] w-24 rounded animate-pulse"></div>
              <div className="h-3 bg-[#0a1410] w-16 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-black tracking-wide text-zinc-100 flex items-center gap-1.5">
                {fullname || "Anonymous User"}
                <span className="h-2 w-2 rounded-full bg-[#2EFF2E] inline-block animate-pulse shadow-[0_0_8px_rgba(46,255,46,0.8)]"></span>
              </h4>
              
              {/* Coin balance o real-time animation container */}
              <div 
                className={`flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-lg transition-all duration-300 origin-left ${
                  isCoinAnimating 
                    ? "scale-110 bg-[#2EFF2E]/10 border border-[#2EFF2E]/40 shadow-[0_0_12px_rgba(46,255,46,0.3)] text-[#2EFF2E]" 
                    : "scale-100 text-[#2EFF2E]"
                }`}
              >
                {/* Optional coin display can be uncommented if needed */}
              </div>
            </>
          )}
        </div>
      </div>

      {!loading && (
        <div className="bg-[#050b14] border border-[#2EFF2E]/30 rounded-[14px] px-3.5 py-1.5 text-right min-w-[105px] shadow-[0_0_15px_rgba(46,255,46,0.08)]">
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest leading-none">MINING SPEED</p>
          <p className="text-xs font-mono font-black text-[#2EFF2E] flex items-center justify-end gap-1 mt-1 leading-none">
            <span className="text-[#2EFF2E] text-[10px] animate-bounce">⚡</span> {miningSpeed.toFixed(1)} <span className="text-zinc-400 font-bold lowercase text-[10px]">/hour</span>
          </p>
        </div>
      )}
    </div>
  );
}