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
      <div className="min-h-screen bg-slate-950 text-white p-6 animate-pulse">
        <div className="h-7 bg-slate-900 w-1/5 rounded-lg mb-3"></div>
        <div className="h-4 bg-slate-900 w-2/5 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-28 bg-slate-900 rounded-2xl"></div>
          <div className="h-28 bg-slate-900 rounded-2xl"></div>
          <div className="h-28 bg-slate-900 rounded-2xl"></div>
        </div>
        <div className="h-32 bg-slate-900 rounded-2xl max-w-3xl"></div>
      </div>
    );
  }

  // Graceful Error Boundary Handler
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md shadow-2xl">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold text-red-400 mt-3">Pipeline Connection Failed</h3>
          <p className="text-slate-400 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-5 bg-gradient-to-r from-red-600 to-rose-600 text-xs text-white font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Retry Database Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Referral & Affiliate Hub
        </h1>
        <p className="text-slate-400 text-sm">
          Invite your friends to expand the network cluster and earn passive cryptographic coin yields instantly.
        </p>
      </div>

      {/* Numerical Data Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Referrals Box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Referrals</p>
          <h2 className="text-3xl font-black text-blue-400">{data.totalReferrals} <span className="text-xs font-normal text-slate-500">Users</span></h2>
          <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">👥</div>
        </div>
        
        {/* Total Coins Earned From Referral Box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Referral Coins Earned</p>
          <h2 className="text-3xl font-black text-amber-400">{data.referralEarnings} <span className="text-xs font-normal text-slate-500">Coins</span></h2>
          <span className="text-[10px] text-slate-500 block mt-1">* +500 Coins rewarded per successful verification node</span>
          <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">🪙</div>
        </div>

        {/* Live Wallet Cryptowallet Core Assets */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Main Wallet Assets</p>
          <h2 className="text-2xl font-black text-slate-100">{data.totalCoin} <span className="text-xs font-normal text-slate-400">Coins</span></h2>
          <h4 className="text-sm font-bold text-emerald-400 mt-0.5">${Number(data.totalDollar).toFixed(2)} USD</h4>
          <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">💼</div>
        </div>
      </div>

      {/* Unique Link Box Area */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mb-12">
        <h3 className="text-lg font-bold text-slate-200 mb-1">Unique Invitation Hub</h3>
        <p className="text-sm text-slate-400 mb-5">Distribute your customized access network parameters below. Newly attached nodes receive 100 bonus tokens automatically.</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={data.referralLink || "Compiling routing assets..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-400 font-mono focus:outline-none select-all"
          />
          <button
            onClick={handleCopy}
            disabled={!data.referralLink}
            className={`sm:w-36 p-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 ${
              copied 
                ? "bg-emerald-500 text-slate-950 font-black" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 disabled:opacity-50"
            }`}
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Relational Table History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-4">Referred Friends Ledger</h3>
        
        <div className="overflow-x-auto">
          {data.referredFriends.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm tracking-wide">
              No sub-nodes linked yet. Spread your encryption link to populate database rows.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-slate-950 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-4 tracking-wider">Friend ID</th>
                  <th className="p-4 tracking-wider">Username</th>
                  <th className="p-4 tracking-wider">Your Payout</th>
                  <th className="p-4 tracking-wider">Friend Payout</th>
                  <th className="p-4 tracking-wider">Timestamp Log</th>
                </tr>
              </thead>
              <tbody>
                {data.referredFriends.map((friend) => (
                  <tr key={friend.referred_id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all duration-150">
                    <td className="p-4 font-mono text-xs text-blue-400 font-bold">#{friend.referred_id}</td>
                    <td className="p-4 font-medium text-slate-200">{friend.referred_username}</td>
                    <td className="p-4 text-amber-400 font-bold">+{friend.referrer_bonus_coins} Coins</td>
                    <td className="p-4 text-slate-400">+{friend.referred_bonus_coins} Coins</td>
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {new Date(friend.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
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
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function ReferralPage() {
//   const router = useRouter();

//   const [data, setData] = useState({
//     takaBalance: 0.00,
//     referralEarnings: 0.00,
//     totalReferrals: 0,
//     referralLink: "",
//     referredFriends: []
//   });
  
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [copied, setCopied] = useState(false);

//   // Sync state data engine with live secure API endpoint
//   useEffect(() => {
//     async function getLiveStats() {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/dashboard/referral");
//         const json = await res.json();

//         if (json.success) {
//           setData(json.data);
//           setError(null);
//         } else {
//           // If unauthenticated, redirect directly to secure sign-in gateway
//           if (res.status === 401) {
//             router.push("/auth/login");
//             return;
//           }
//           setError(json.error || "Failed to load dynamic pipeline rows.");
//         }
//       } catch (err) {
//         setError("Network sync error. Check database infrastructure status.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     getLiveStats();
//   }, [router]);

//   const handleCopy = () => {
//     if (!data.referralLink) return;
//     navigator.clipboard.writeText(data.referralLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   // High-Fidelity Skeleton Pulse Effect for seamless UX
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 text-white p-6 animate-pulse">
//         <div className="h-7 bg-slate-900 w-1/5 rounded-lg mb-3"></div>
//         <div className="h-4 bg-slate-900 w-2/5 rounded-lg mb-8"></div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="h-28 bg-slate-900 rounded-2xl"></div>
//           <div className="h-28 bg-slate-900 rounded-2xl"></div>
//           <div className="h-28 bg-slate-900 rounded-2xl"></div>
//         </div>
//         <div className="h-32 bg-slate-900 rounded-2xl max-w-3xl"></div>
//       </div>
//     );
//   }

//   // Graceful Error Boundary Handler
//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
//         <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md shadow-2xl">
//           <span className="text-4xl">⚠️</span>
//           <h3 className="text-lg font-bold text-red-400 mt-3">Pipeline Connection Failed</h3>
//           <p className="text-slate-400 text-sm mt-1">{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="mt-5 bg-gradient-to-r from-red-600 to-rose-600 text-xs text-white font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
//           >
//             Retry Database Handshake
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 md:pb-6">
//       {/* Header */}
//       <div className="mb-8 border-b border-slate-800 pb-4">
//         <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
//           Affiliate Engine
//         </h1>
//         <p className="text-slate-400 text-sm">Expand the network grid. Distribute your token link to accumulate passive multipliers.</p>
//       </div>

//       {/* Numerical Data Overview Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
//           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Referred Sub-Nodes</p>
//           <h2 className="text-3xl font-black text-blue-400">{data.totalReferrals} <span className="text-xs font-normal text-slate-500">Users</span></h2>
//           <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">👥</div>
//         </div>
        
//         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
//           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Affiliate Yield Ledger</p>
//           <h2 className="text-3xl font-black text-emerald-400">৳{data.referralEarnings.toFixed(2)}</h2>
//           <span className="text-[10px] text-slate-500 block mt-1">* Calculated seamlessly at ৳5.00 BDT per node</span>
//           <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">💰</div>
//         </div>

//         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
//           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Liquid Assets</p>
//           <h2 className="text-3xl font-black text-slate-100">৳{data.takaBalance.toFixed(2)}</h2>
//           <span className="text-[10px] text-slate-500 block mt-1">* Combined calculation ready for instantaneous payout</span>
//           <div className="absolute right-4 bottom-3 text-4xl opacity-[0.02]">💳</div>
//         </div>
//       </div>

//       {/* Dynamic Link Box Area */}
//       <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mb-12">
//         <h3 className="text-lg font-bold text-slate-200 mb-1">Unique Invitation Hub</h3>
//         <p className="text-sm text-slate-400 mb-5">Your profile tracking query listens natively to the dynamic network identity parameter below.</p>
        
//         <div className="flex flex-col sm:flex-row gap-3">
//           <input
//             type="text"
//             readOnly
//             value={data.referralLink || "Compiling routing assets..."}
//             className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-400 font-mono focus:outline-none select-all"
//           />
//           <button
//             onClick={handleCopy}
//             disabled={!data.referralLink}
//             className={`sm:w-36 p-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 ${
//               copied 
//                 ? "bg-emerald-500 text-slate-950 font-black" 
//                 : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 disabled:opacity-50"
//             }`}
//           >
//             {copied ? "Copied! ✓" : "Copy Link"}
//           </button>
//         </div>
//       </div>

//       {/* Relational Table Logic */}
//       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
//         <h3 className="text-lg font-bold text-slate-200 mb-4">Relational Node History</h3>
        
//         <div className="overflow-x-auto">
//           {data.referredFriends.length === 0 ? (
//             <div className="text-center py-10 text-slate-500 text-sm tracking-wide">
//               No sub-nodes linked yet. Spread your encryption link to populate database rows.
//             </div>
//           ) : (
//             <table className="w-full text-left text-sm text-slate-400">
//               <thead className="text-xs uppercase bg-slate-950 text-slate-300 border-b border-slate-800">
//                 <tr>
//                   <th className="p-4 tracking-wider">Node ID</th>
//                   <th className="p-4 tracking-wider">Username</th>
//                   <th className="p-4 tracking-wider">Status Verification</th>
//                   <th className="p-4 tracking-wider">Yield Commission</th>
//                   <th className="p-4 tracking-wider">Timestamp Log</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.referredFriends.map((user) => (
//                   <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all duration-150">
//                     <td className="p-4 font-mono text-xs text-blue-400 font-bold">#{user.id}</td>
//                     <td className="p-4 font-medium text-slate-200">{user.username}</td>
//                     <td className="p-4">
//                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider ${
//                         user.status === "active" 
//                           ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
//                           : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
//                       }`}>
//                         {user.status.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="p-4 text-emerald-400 font-bold">{user.bonus}</td>
//                     <td className="p-4 text-xs font-mono text-slate-500">{user.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }