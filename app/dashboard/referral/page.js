"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 🚀 গ্লোবাল টোস্ট ব্যবহার
import { 
  Network, 
  Wallet, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCcw, 
  Users, 
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react"; // 🚀 সাইবার থিম আইকনসমূহ

export default function ReferralPage() {
  const router = useRouter();

  const [data, setData] = useState({
    totalCoin: 0,
    totalDollar: 0.00,
    totalReferrals: 0,
    referralEarnings: 0,
    referralLink: "",
    referredFriends: [] // 🤝 referrals টেবিল থেকে আসা হিস্ট্রি রো
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // 📡 ডাটাবেজ এবং সেশন মেকানিজম থেকে লাইভ স্ট্যাটাস ফেচ করার ইঞ্জিন
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
            toast.error("Session expired. Redirecting to login...");
            router.push("/auth/login");
            return;
          }
          setError(json.error || "Failed to load dynamic network cluster rows.");
        }
      } catch (err) {
        setError("Network sync error. Check database infrastructure status.");
      } finally {
        setLoading(false);
      }
    }

    getLiveStats();
  }, [router]);

  // 📋 কপি বাটন হ্যান্ডেলার
  const handleCopy = () => {
    if (!data.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success("Referral Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ⏳ হাই-ফিডেলিটি কন্টেইনার পালস স্কেলিটন লোডার
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white p-6 animate-pulse space-y-6 flex flex-col items-center justify-center">
        <div className="h-12 bg-slate-900/60 border border-slate-800/40 w-full max-w-xl rounded-2xl"></div>
        <div className="h-64 bg-slate-900/60 border border-slate-800/40 w-full max-w-xl rounded-[24px]"></div>
        <div className="h-32 bg-slate-900/60 border border-slate-800/40 w-full max-w-xl rounded-2xl"></div>
      </div>
    );
  }

  // ⚠️ এরর বাউন্ডারি হ্যান্ডেলার
  if (error) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white p-6 flex flex-col items-center justify-center antialiased">
        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl text-center max-w-sm shadow-2xl backdrop-blur-2xl">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-red-400 tracking-wide uppercase">Pipeline Breach</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 border border-red-500/30 font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            Retry Secure Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-amber-500/30">
      
      {/* 🚀 টপ হেডার প্যানেল */}
      <div className="max-w-xl mx-auto mb-5 flex justify-between items-center bg-[#111827]/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white uppercase tracking-wider">
              Affiliate User Hub
            </h1>
            <p className="text-slate-400 text-[10px] font-medium">Expand your cluster network to inject yields.</p>
          </div>
        </div>
        <div className="text-right bg-slate-950/80 border border-slate-800/60 px-3 py-1.5 rounded-xl">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Main Balance</p>
          <p className="text-xs font-mono font-extrabold text-amber-400 flex items-center gap-1 justify-end mt-1.5 leading-none">
            <span>{parseFloat(data.totalCoin || 0).toFixed(2)}</span> <span className="text-slate-500 font-normal text-[10px]">COIN</span>
          </p>
        </div>
      </div>

      {/* মেইন কমান্ড সেন্টার */}
      <div className="max-w-xl mx-auto space-y-4.5">
        
        {/* 🔮 মেইন মডিউল: নেটওয়ার্ক হাব ডিসপ্লে */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-[24px] relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[340px]">
          
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/60 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-amber-500 animate-pulse">🧬</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">Affiliate Core</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/60 px-3 py-1.5 rounded-xl text-right">
              <p className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span> Secure
              </p>
            </div>
          </div>

          {/* ইন্টারঅ্যাক্টিভ সেন্ট্রাল নেটওয়ার্ক কোর */}
          <div className="relative flex justify-center items-center my-auto py-4">
            <div className="absolute h-48 w-48 bg-amber-500/[0.03] rounded-full blur-3xl animate-pulse"></div>

            <div className="relative h-36 w-36 rounded-full bg-slate-950 border-[4px] border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center justify-center p-3 group transition-transform duration-300 hover:scale-[1.02]">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-amber-500/5 to-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-amber-400 tracking-tighter filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">
                  {data.totalReferrals}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-300 uppercase mt-1">
                  Linked Users
                </span>
              </div>
            </div>
          </div>

          <div className="text-center z-10 bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
            <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1.5">
              <span className="text-amber-500 font-sans text-xl">🪙</span> {parseFloat(data.referralEarnings || 0).toFixed(2)}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Consolidated Net Ledger • <span className="text-amber-500">+500 COIN</span> / user sync
            </p>
          </div>
        </div>

        {/* 🔗 ইনভিটেশন লিঙ্ক গেটওয়ে এরিয়া */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl shadow-2xl">
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-200 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Invitation Subsystem Gateway</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Inject unique parameters into routing network. Attaching sub-users auto-manifest <span className="text-amber-500 font-medium">100 bonus tokens</span>.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 h-1.5 rounded-full overflow-hidden p-[1px] mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full shadow-[0_0_6px_rgba(245,158,11,0.3)] w-full"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={data.referralLink || "Compiling routing configuration parameters..."}
              className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-amber-500 font-mono tracking-tighter focus:outline-none select-all shadow-inner"
            />
            <button
              onClick={handleCopy}
              disabled={!data.referralLink}
              className={`sm:w-36 p-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-[0.98] border cursor-pointer flex items-center justify-center gap-1.5 ${
                copied 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400/20 font-bold hover:opacity-95"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* 📊 রেফারেল হিস্ট্রি টেবিল: রিয়েল ডেটাবেজ ফিল্ড ম্যাপিং */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl shadow-2xl">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Surface Refinery Users</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Secured data ledger clusters.</p>
              </div>
            </div>
            <div className="text-right bg-slate-950/80 border border-slate-800/60 px-3 py-1 rounded-xl font-mono">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Net Value</p>
              <p className="text-xs font-extrabold text-emerald-400 leading-none mt-1 flex items-center gap-0.5 justify-end">
                <span className="text-[9px] font-normal text-slate-500">USD</span> ${parseFloat(data.totalDollar || 0).toFixed(2)} 
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar pt-1">
            {data.referredFriends.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/50">
                <span className="text-xl block mb-1 opacity-40">👤</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No sub-users linked yet.</p>
                <p className="text-[9px] text-slate-600 mt-0.5">Spread your gateway parameters to populate rows.</p>
              </div>
            ) : (
              <table className="w-full text-left text-[11px] text-slate-300 border-collapse min-w-[400px]">
                <thead className="bg-slate-950/80 border-b border-slate-800/80">
                  <tr>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">User ID</th>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">Username</th>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">Your Yield</th>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">User Yield</th>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referredFriends.map((friend) => (
                    <tr key={friend.referral_id} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors">
                      {/* 🤝 ফিক্সড: আপনার referrals টেবিল অনুযায়ী জেনারেট করা referred_id কলাম রিড */}
                      <td className="px-3 py-3 font-mono text-xs text-amber-500 font-bold">#{friend.referred_id}</td>
                      <td className="px-3 py-3 font-semibold text-slate-200">{friend.referred_username}</td>
                      <td className="px-3 py-3 text-amber-400 font-bold">+{friend.referrer_bonus_coins} D</td>
                      <td className="px-3 py-3 text-slate-400">+{friend.referred_bonus_coins} D</td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[10px]">
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