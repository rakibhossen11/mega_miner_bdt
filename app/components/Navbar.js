"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [session, setSession] = useState({
    loggedIn: false,
    coin_balance: 0,
    dollar_balance: 0.00,
    username: ""
  });
  const [loading, setLoading] = useState(true);

  // Sync Global Wallet Counter across all application paths
  useEffect(() => {
    async function syncEcosystemBalances() {
      try {
        const res = await fetch("/api/wallet/status");
        const json = await res.json();
        if (json.success && json.loggedIn) {
          setSession({
            loggedIn: true,
            coin_balance: json.coin_balance,
            dollar_balance: json.dollar_balance,
            username: json.username
          });
        }
      } catch (err) {
        console.error("Navbar failed to capture tracking node frames.");
      } finally {
        setLoading(false);
      }
    }

    syncEcosystemBalances();
  }, [pathname]); // pathname অ্যাড করার কারণে ইউজার পেজ চেঞ্জ করলেই ব্যালেন্স অটো-আপডেট হবে

  // Do not show navigation bar elements if user is on authentication routes
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 fixed top-0 left-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-xl">
      {/* Brand Identity / Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tighter">
          MEGAMINER <span className="text-xs text-slate-500 font-mono">BDT</span>
        </span>
      </Link>

      {/* Dynamic Asset Counters Node */}
      <div className="flex items-center gap-3">
        {session.loggedIn ? (
          <>
            {/* Live Coin Ledger Display */}
            <Link 
              href="/dashboard/wallet"
              className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-xs font-black text-yellow-400 shadow-inner hover:bg-yellow-500/20 transition-all"
            >
              <span className="animate-pulse">★</span>
              <span>{loading ? "..." : session.coin_balance.toLocaleString()}</span>
              <span className="text-[10px] text-yellow-600 font-normal">Coins</span>
            </Link>

            {/* Live USD Liquid Ledger Display */}
            <Link 
              href="/dashboard/wallet"
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-black text-emerald-400 shadow-inner hover:bg-emerald-500/20 transition-all"
            >
              <span>৳</span>
              <span>{loading ? "..." : `$${session.dollar_balance.toFixed(2)}`}</span>
            </Link>

            {/* Profile Frame Tag */}
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Node</p>
              <p className="text-xs text-slate-300 font-mono font-bold">@{session.username}</p>
            </div>
          </>
        ) : (
          <Link 
            href="/auth/login" 
            className="text-xs font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-500/10"
          >
            Connect Node
          </Link>
        )}
      </div>
    </nav>
  );
}