"use client";
import { useState } from "react";

const MOCK_USERS = [
  {
    id: 1,
    user_id: 67108,
    user_email: "sakib1664@gmail.com",
    username: "sakib_miner",
    total_coin: 100.00000000,
    total_dollar: 0.00,
    mining_wallet: 0.00000000,
    mining_speed: 1.50,
    hybrid_speed: 0.00,
    boost_power: 1.00,
    daily_bonus: 0.00,
    last_claim_daily_bonus_time: "2026-06-17T12:14:58.669Z",
    last_claim_reward_time: null,
    created_at: "2026-06-17T12:14:58.669Z"
  },
  {
    id: 2,
    user_id: 51598,
    user_email: "dipu1660@gmail.com",
    username: "",
    total_coin: 100.00000000,
    total_dollar: 0.00,
    mining_wallet: 0.00000000,
    mining_speed: 1.50,
    hybrid_speed: 0.00,
    boost_power: 1.00,
    daily_bonus: 0.00,
    last_claim_daily_bonus_time: null,
    last_claim_reward_time: null,
    created_at: "2026-06-17T12:20:18.897Z"
  },
  {
    id: 3,
    user_id: 53275,
    user_email: "sano0099@gmail.com",
    username: "sano_admin",
    total_coin: 1003.99090595,
    total_dollar: 10.00,
    mining_wallet: 0.12450000,
    mining_speed: 1.50,
    hybrid_speed: 0.50,
    boost_power: 1.00,
    daily_bonus: 5.00,
    last_claim_daily_bonus_time: "2026-06-17T17:14:34.736Z",
    last_claim_reward_time: "2026-06-17T17:39:00.242Z",
    created_at: "2026-06-17T17:14:34.736Z"
  },
  {
    id: 4,
    user_id: 85935,
    user_email: "dipu0099@gmail.com",
    username: "dipu_pro",
    total_coin: 1000.00000000,
    total_dollar: 0.00,
    mining_wallet: 0.00000000,
    mining_speed: 2.00,
    hybrid_speed: 0.00,
    boost_power: 1.50,
    daily_bonus: 0.00,
    last_claim_daily_bonus_time: null,
    last_claim_reward_time: null,
    created_at: "2026-06-17T17:16:38.498Z"
  }
];

export default function AdminUserManagement() {
  const [users] = useState(MOCK_USERS);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchId, setSearchId] = useState("");
  
  // 🎯 মডাল স্টেট ম্যানেজমেন্ট
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesEmail = user.user_email.toLowerCase().includes(searchEmail.toLowerCase().trim());
    const matchesId = user.user_id.toString().includes(searchId.trim());
    return matchesEmail && matchesId;
  });

  return (
    <div className="min-h-screen bg-[#040805] text-zinc-200 p-8 font-sans antialiased relative">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* 📑 হেডার */}
        <div className="flex justify-between items-center border-b border-lime-950/50 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase font-mono">
              Core Ledger Admin Console
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Real-time monitoring system with multi-field filtering capabilities.
            </p>
          </div>
          <div className="bg-[#0b110c] border border-lime-900/30 px-5 py-2.5 rounded-lg font-mono text-xs">
            <span className="text-zinc-500">TOTAL RECORDS:</span>{" "}
            <span className="text-lime-400 font-bold ml-1">{filteredUsers.length}</span>
          </div>
        </div>

        {/* 🔍 সার্চ ফিল্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#060c07] p-4 border border-lime-950/30 rounded-xl">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-lime-600 font-semibold tracking-wider">
              Search by User Email
            </label>
            <input
              type="text"
              placeholder="e.g. sano0099@gmail.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-[#0a110d] border border-lime-950/60 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-lime-500/50 transition-colors placeholder:text-zinc-700"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-lime-600 font-semibold tracking-wider">
              Search by User ID
            </label>
            <input
              type="text"
              placeholder="e.g. 53275"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-[#0a110d] border border-lime-950/60 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-lime-500/50 transition-colors placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* 📊 টেবিল */}
        <div className="bg-[#060c07] border border-lime-950/40 rounded-xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse font-mono text-[11px] tracking-tight">
            <thead>
              <tr className="bg-[#0b110c] border-b border-lime-950/60 text-lime-500 uppercase text-[10px]">
                <th className="p-3 border-r border-lime-950/20 text-center w-12">ID</th>
                <th className="p-3 border-r border-lime-950/20 w-20">User ID</th>
                <th className="p-3 border-r border-lime-950/20 w-52 font-sans">User Email</th>
                <th className="p-3 border-r border-lime-950/20 w-32">Username</th>
                <th className="p-3 border-r border-lime-950/20 text-right w-32 text-amber-500">Total Coin</th>
                <th className="p-3 border-r border-lime-950/20 text-right w-24 text-emerald-500">Total Dollar</th>
                <th className="p-3 border-r border-lime-950/20 text-center w-20">Min. Speed</th>
                <th className="p-3 border-r border-lime-950/20 text-center w-20">Boost</th>
                <th className="p-3 border-r border-lime-950/20 text-center w-32">Created At</th>
                <th className="p-3 text-center w-24 text-lime-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-950/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-lime-950/10 transition-all duration-100 border-b border-lime-950/10">
                  <td className="p-3 border-r border-lime-950/20 text-center text-zinc-600 font-bold bg-[#080d09]">{user.id}</td>
                  <td className="p-3 border-r border-lime-950/20 text-zinc-400 font-bold">{user.user_id}</td>
                  <td className="p-3 border-r border-lime-950/20 text-white font-sans font-medium break-all">{user.user_email}</td>
                  <td className="p-3 border-r border-lime-950/20 text-zinc-400 truncate max-w-[100px]">{user.username || "-"}</td>
                  <td className="p-3 border-r border-lime-950/20 text-right font-bold text-amber-400 font-sans">{Number(user.total_coin).toFixed(4)}</td>
                  <td className="p-3 border-r border-lime-950/20 text-right font-bold text-emerald-400 font-sans">${Number(user.total_dollar).toFixed(2)}</td>
                  <td className="p-3 border-r border-lime-950/20 text-center text-zinc-300">{user.mining_speed}x</td>
                  <td className="p-3 border-r border-lime-950/20 text-center text-purple-400 font-bold">{user.boost_power}x</td>
                  <td className="p-3 border-r border-lime-950/20 text-zinc-500 text-[10px] text-center">{new Date(user.created_at).toLocaleDateString()}</td>
                  {/* ⚡ অ্যাকশন বাটন */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="bg-lime-500/10 hover:bg-lime-500 text-lime-400 hover:text-black border border-lime-500/20 font-bold px-2.5 py-1 rounded text-[10px] transition-all duration-150 cursor-pointer uppercase tracking-wider"
                    >
                      View Node
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="10" className="p-12 text-center text-zinc-600 tracking-widest text-xs">[INFO] NO RECORDS FOUND</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌌 ট্রান্সপারেন্ট ব্লার মডাল ইন্টিগ্রেশন */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          {/* মডাল মেইন কার্ড */}
          <div className="w-full max-w-2xl bg-[#080f0a]/90 border border-lime-500/30 rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh] overflow-hidden font-mono">
            
            {/* মডাল হেডার */}
            <div className="flex justify-between items-start border-b border-lime-950 pb-3 mb-4">
              <div>
                <span className="text-[10px] bg-lime-500/20 text-lime-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Node Inspector
                </span>
                <h2 className="text-lg font-black text-white mt-1">
                  UID: <span className="text-lime-400">{selectedUser.user_id}</span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-red-500/20 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* মডাল কন্টেন্ট স্ক্রোলযোগ্য */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              
              {/* ১. প্রোফাইল ইনফো */}
              <div className="bg-[#0b140e] p-3 border border-lime-950/60 rounded-xl space-y-2">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide text-lime-600">Identity Block</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-zinc-500">System ID:</span> <span className="text-zinc-300">{selectedUser.id}</span></div>
                  <div><span className="text-zinc-500">Username:</span> <span className="text-white font-sans">{selectedUser.username || "-"}</span></div>
                  <div className="col-span-2"><span className="text-zinc-500">Registered Email:</span> <span className="text-lime-400 font-sans font-semibold break-all">{selectedUser.user_email}</span></div>
                </div>
              </div>

              {/* ২. ফাইনান্সিয়াল লেজার */}
              <div className="bg-[#0b140e] p-3 border border-lime-950/60 rounded-xl space-y-2">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide text-amber-500">Financial Ledger</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#050a06] p-2 rounded border border-lime-950/30">
                    <span className="text-[10px] text-zinc-500 block">Total Coin Balance</span>
                    <span className="text-amber-400 font-sans font-bold text-sm block mt-0.5">{selectedUser.total_coin.toFixed(8)}</span>
                  </div>
                  <div className="bg-[#050a06] p-2 rounded border border-lime-950/30">
                    <span className="text-[10px] text-zinc-500 block">Fiat Equivalent</span>
                    <span className="text-emerald-400 font-sans font-bold text-sm block mt-0.5">${selectedUser.total_dollar.toFixed(2)}</span>
                  </div>
                  <div className="bg-[#050a06] p-2 rounded border border-lime-950/30">
                    <span className="text-[10px] text-zinc-500 block">Mining Wallet</span>
                    <span className="text-cyan-400 font-sans font-bold text-sm block mt-0.5">{selectedUser.mining_wallet.toFixed(8)}</span>
                  </div>
                </div>
              </div>

              {/* ৩. মাইনিং কনফিগারেশন */}
              <div className="bg-[#0b140e] p-3 border border-lime-950/60 rounded-xl space-y-2">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide text-purple-400">Mining Architecture</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#050a06] py-1.5 rounded"><span className="text-zinc-500 block text-[9px]">Base Speed</span><span className="text-zinc-200 font-bold">{selectedUser.mining_speed}x</span></div>
                  <div className="bg-[#050a06] py-1.5 rounded"><span className="text-zinc-500 block text-[9px]">Hybrid Velocity</span><span className="text-teal-400 font-bold">{selectedUser.hybrid_speed}</span></div>
                  <div className="bg-[#050a06] py-1.5 rounded"><span className="text-zinc-500 block text-[9px]">Boost Factor</span><span className="text-purple-400 font-bold">{selectedUser.boost_power}x</span></div>
                </div>
              </div>

              {/* ৪. টাইমস্ট্যাম্প ও বোনাস হিস্ট্রি */}
              <div className="bg-[#0b140e] p-3 border border-lime-950/60 rounded-xl space-y-2 text-[11px]">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Timestamp Ledger</p>
                <div className="space-y-1.5 divide-y divide-lime-950/20">
                  <div className="flex justify-between pt-1"><span className="text-zinc-500">Daily Bonus Pool:</span> <span className="text-zinc-300 font-bold">{selectedUser.daily_bonus} BDT</span></div>
                  <div className="flex justify-between pt-1"><span className="text-zinc-500">Last Claim Daily Bonus:</span> <span className="text-zinc-400">{selectedUser.last_claim_daily_bonus_time ? new Date(selectedUser.last_claim_daily_bonus_time).toLocaleString() : "NEVER CLAIMED"}</span></div>
                  <div className="flex justify-between pt-1"><span className="text-zinc-500">Last Claim Reward Time:</span> <span className="text-zinc-400">{selectedUser.last_claim_reward_time ? new Date(selectedUser.last_claim_reward_time).toLocaleString() : "NEVER CLAIMED"}</span></div>
                  <div className="flex justify-between pt-1"><span className="text-zinc-500">Node Genesis (Created At):</span> <span className="text-zinc-400">{new Date(selectedUser.created_at).toLocaleString()}</span></div>
                </div>
              </div>

            </div>

            {/* মডাল ফুটার */}
            <div className="mt-4 border-t border-lime-950 pt-3 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}