"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
  const router = useRouter();

  const [data, setData] = useState({
    totalCoin: 0,
    totalDollar: 0.00,
    totalReferrals: 0,
    referralEarnings: 0,
    referralLink: "",
    referredFriends: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync state data engine with live secure API endpoint
  useEffect(() => {
    async function getLiveStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/referral");
        const json = await res.json();

        if (json.success) {
          setData(json.data);
          setError(null);
        } else {
          if (res.status === 401) {
            router.push("/auth/login");
            return;
          }
          setError(json.error || "Failed to load dynamic pipeline rows.");
        }
      } catch (err) {
        setError("Network sync error. Check database infrastructure status.");
      } finally {
        setLoading(false);
      }
    }

    getLiveStats();
  }, [router]);

  const handleCopy = () => {
    if (!data.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-Fidelity Skeleton Pulse Effect for seamless UX
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d08] text-white p-6 animate-pulse space-y-8">
        <div className="h-7 bg-[#121b15] w-1/3 rounded-xl"></div>
        <div className="h-40 bg-[#121b15] rounded-3xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-[#121b15] rounded-2xl"></div>
          <div className="h-28 bg-[#121b15] rounded-2xl"></div>
        </div>
        <div className="h-28 bg-[#121b15] rounded-2xl max-w-xl mx-auto"></div>
        <div className="h-56 bg-[#121b15] rounded-3xl"></div>
      </div>
    );
  }

  // Graceful Error Boundary Handler
  if (error) {
    return (
      <div className="min-h-screen bg-[#060d08] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-sm shadow-2xl shadow-red-500/10 backdrop-blur-sm">
          <span className="text-5xl">⚠️</span>
          <h3 className="text-lg font-black text-red-400 mt-4 tracking-wide uppercase">Network Breach Detected</h3>
          <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-xs text-white font-black px-5 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            Retry Quantum Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d08] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-lime-500/30">
      
      {/* 🚀 Top Header Component */}
      <div className="max-w-xl mx-auto mb-6 flex justify-between items-center bg-[#0d160f]/60 border border-lime-950/40 p-4 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            Affiliate Node Hub
          </h1>
          <p className="text-zinc-500 text-[11px] font-medium">Expand your network cluster to inject coin yields.</p>
        </div>
        <div className="text-right bg-[#09110b] border border-lime-950 px-3 py-1 rounded-xl">
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Main Balance</p>
          <p className="text-xs font-mono font-black text-lime-400 flex items-center gap-1 justify-end mt-1.5 leading-none">
            🪙 {data.totalCoin.toFixed(0)} <span className="text-zinc-500 font-normal">D</span>
          </p>
        </div>
      </div>

      {/* Main Layout Command Center */}
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* CENTER MODULE: GIANT NEON NETWORK HUB VISUAL */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-6 rounded-[32px] relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[360px]">
          
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2 bg-[#060a07] border border-lime-950/80 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-lime-500 animate-pulse">🧬</span>
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Affiliate Core</span>
            </div>
            <div className="bg-[#060a07] border border-lime-950/80 px-3 py-1.5 rounded-xl text-right">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Net Status</p>
              <p className="text-xs font-mono font-black text-lime-400 flex items-center gap-1.5 justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse inline-block"></span> Secure
              </p>
            </div>
          </div>

          {/* THE GIANT INTERACTIVE NEON HUB */}
          <div className="relative flex justify-center items-center my-auto py-2">
            <div className="absolute h-60 w-60 bg-lime-500/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative h-44 w-44 rounded-full bg-[#060a07] border-[6px] border-lime-500 shadow-[0_0_40px_rgba(132,204,22,0.25)] flex items-center justify-center p-3 group transition-transform hover:scale-[1.02]">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-lime-500/10 to-lime-500/20 border border-lime-500 flex flex-col items-center justify-center gap-1">
                <span className="text-5xl font-black text-lime-400 tracking-tighter filter drop-shadow-[0_0_10px_rgba(132,204,22,0.6)]">
                  {data.totalReferrals}
                </span>
                <span className="text-[9px] font-black tracking-widest text-zinc-300 uppercase leading-none mt-0.5 group-hover:text-lime-400 transition-colors">
                  Linked Nodes
                </span>
              </div>
            </div>
          </div>

          <div className="text-center z-10 mb-4 bg-zinc-950/60 p-3 rounded-xl border border-lime-950/80">
            <h2 className="text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-2">
              <span className="text-amber-400 font-sans">🪙</span> {data.referralEarnings.toFixed(2)}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 leading-relaxed">
              Consolidated Net Ledger • <span className="text-lime-400">+500 D Tokens</span> / node sync
            </p>
          </div>
        </div>

        {/* REFINERY BOOST LINK BOX AREA */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-zinc-300 mb-1">Invitation Subsystem Gateway</h3>
            <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">Inject unique profile parameters into network routing. Attaching nodes auto-manifest 100 bonus tokens.</p>
          </div>

          <div className="bg-[#060a07] border border-lime-950 h-2 rounded-full overflow-hidden p-0.5 mb-5 relative group">
            <div className="bg-gradient-to-r from-lime-600 to-lime-400 h-full rounded-full shadow-[0_0_8px_rgba(132,204,22,0.4)] relative w-full"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value={data.referralLink || "Compiling unique routing parameters..."}
              className="flex-1 bg-[#09110b] border border-lime-950/80 rounded-xl p-4 text-[11px] text-lime-400 font-mono tracking-tighter focus:outline-none select-all shadow-inner"
            />
            <button
              onClick={handleCopy}
              disabled={!data.referralLink}
              className={`sm:w-36 p-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg border ${
                copied 
                  ? "bg-lime-500 text-[#070d08] border-lime-400 shadow-lime-500/20" 
                  : "bg-gradient-to-r from-cyan-600 to-lime-500 text-black border-lime-400 shadow-lime-500/10 hover:shadow-lime-500/20"
              }`}
            >
              {copied ? "Link Copied ✓" : "Copy Node Link"}
            </button>
          </div>
        </div>

        {/* STORAGE PIPELINE: REFERRED FRIENDS LEDGER */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="mb-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🏭</span>
                <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Surface Refinery Nodes</h3>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Secured browser data matrix rows.</p>
            </div>
            <div className="text-right bg-[#09110b] border border-lime-950 px-3 py-1.5 rounded-xl font-mono">
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Net Value</p>
              <p className="text-sm font-black text-lime-400 leading-none mt-1.5 flex items-center gap-1 justify-end">
                <span className="text-[10px] font-normal text-zinc-500">USD</span> ${data.totalDollar.toFixed(2)} 
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar pt-1">
            {data.referredFriends.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950/60 rounded-xl border border-lime-950/60">
                <span className="text-2xl block mb-2 opacity-30">👤</span>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">No sub-nodes linked yet.</p>
                <p className="text-[9px] text-zinc-700 mt-1">Spread your link to populate data rows.</p>
              </div>
            ) : (
              <table className="w-full text-left text-[11px] text-zinc-300 border-collapse">
                <thead className="bg-[#09110b] border-b border-lime-950/60">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Node ID</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Username</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Your Cargo</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Node cargo</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referredFriends.map((friend) => (
                    <tr key={friend.referred_id} className="border-b border-lime-950/30 hover:bg-[#121b15]/40 transition-colors duration-150">
                      <td className="px-4 py-3 font-mono text-xs text-lime-400 font-bold">#{friend.referred_id}</td>
                      <td className="px-4 py-3 font-medium text-slate-100">{friend.referred_username}</td>
                      <td className="px-4 py-3 text-amber-400 font-bold">+{friend.referrer_bonus_coins} D</td>
                      <td className="px-4 py-3 text-zinc-400">+{friend.referred_bonus_coins} D</td>
                      <td className="px-4 py-3 font-mono text-zinc-500">
                        {new Date(friend.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}