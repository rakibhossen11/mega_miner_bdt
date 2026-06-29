"use client";
import { useState } from "react";

const MOCK_WITHDRAWALS = [
  {
    id: 1,
    user_id: 53275,
    user_email: "sano0099@gmail.com",
    amount_dollar: 120.00,
    payment_method: "bKash",
    account_number: "01712345678",
    status: "pending",
    requested_at: "2026-06-24T10:15:30.000Z"
  },
  {
    id: 2,
    user_id: 67108,
    user_email: "sakib1664@gmail.com",
    amount_dollar: 80.50,
    payment_method: "Nagad",
    account_number: "01987654321",
    status: "pending",
    requested_at: "2026-06-21T14:22:10.000Z"
  },
  {
    id: 3,
    user_id: 51598,
    user_email: "dipu1660@gmail.com",
    amount_dollar: 250.00,
    payment_method: "Rocket",
    account_number: "015556667771",
    status: "approved",
    requested_at: "2026-06-18T09:05:00.000Z"
  },
  {
    id: 4,
    user_id: 85935,
    user_email: "dipu0099@gmail.com",
    amount_dollar: 45.00,
    payment_method: "bKash",
    account_number: "01311223344",
    status: "rejected",
    requested_at: "2026-06-12T17:40:00.000Z"
  }
];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState(MOCK_WITHDRAWALS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  // 📅 ডেট ফিল্টার স্টেট (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 📊 লাইভ ম্যাট্রিক্স ক্যালকুলেশন (সব ডাটার ওপর ভিত্তি করে)
  const totalPending = withdrawals.filter(r => r.status === "pending").reduce((acc, r) => acc + r.amount_dollar, 0);
  const totalApproved = withdrawals.filter(r => r.status === "approved").reduce((acc, r) => acc + r.amount_dollar, 0);
  const totalRejected = withdrawals.filter(r => r.status === "rejected").reduce((acc, r) => acc + r.amount_dollar, 0);
  const grandTotal = totalPending + totalApproved + totalRejected;

  // ⚡ কপি ফাংশন
  const handleCopyNumber = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 🛠️ স্ট্যাটাস আপডেট
  const handleUpdateStatus = (id, newStatus) => {
    const confirmAction = window.confirm(`Mark request #${id} as ${newStatus.toUpperCase()}?`);
    if (!confirmAction) return;
    setWithdrawals((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  // 🔍 কম্বাইন্ড ফিল্টারিং (স্ট্যাটাস + ডেট রেঞ্জ)
  const filteredWithdrawals = withdrawals.filter((req) => {
    // ১. স্ট্যাটাস ফিল্টার
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    // ২. ডেট ফিল্টার
    const reqDate = new Date(req.requested_at).toISOString().split("T")[0]; // Get YYYY-MM-DD
    let matchesFrom = true;
    let matchesTo = true;

    if (fromDate) matchesFrom = reqDate >= fromDate;
    if (toDate) matchesTo = reqDate <= toDate;

    return matchesStatus && matchesFrom && matchesTo;
  });

  return (
    <div className="min-h-screen bg-[#040805] text-zinc-200 p-8 font-sans antialiased space-y-6">
      
      {/* 📑 হেডার কনসোল */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-lime-950/50 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase font-mono">
            Withdrawal Terminal Ledger
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Financial analytics node & transaction authorization desk.
          </p>
        </div>

        {/* 🔘 ফিল্টার ট্যাব */}
        <div className="flex bg-[#060c07] border border-lime-950/60 p-1 rounded-xl font-mono text-[11px]">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg uppercase font-bold tracking-wider cursor-pointer transition-all ${
                statusFilter === status ? "bg-lime-500 text-black shadow-lg" : "text-zinc-400 hover:text-white hover:bg-lime-950/20"
              }`}
            >
              {status} ({withdrawals.filter((r) => status === "all" || r.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* 💰 ১. ফাইনান্সিয়াল লাইভ কাউন্টার কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#060c07] border-l-4 border-amber-500 border-y border-r border-lime-950/30 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Pending Pipeline</span>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalPending.toFixed(2)}</div>
          <div className="text-[9px] text-zinc-600 mt-1">Awaiting manual node release</div>
        </div>
        <div className="bg-[#060c07] border-l-4 border-emerald-500 border-y border-r border-lime-950/30 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Settled (Approved)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">${totalApproved.toFixed(2)}</div>
          <div className="text-[9px] text-zinc-600 mt-1">Successfully written to ledger</div>
        </div>
        <div className="bg-[#060c07] border-l-4 border-red-500 border-y border-r border-lime-950/30 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Bounced (Rejected)</span>
          <div className="text-2xl font-black text-red-500 mt-1">${totalRejected.toFixed(2)}</div>
          <div className="text-[9px] text-zinc-600 mt-1">Returned/Invalid configurations</div>
        </div>
      </div>

      {/* 📈 ২. গ্রাফ এবং চের্ট এনালিটিক্স সেকশন (Pure CSS/Tailwind Framework) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#060c07] p-5 border border-lime-950/30 rounded-xl font-mono">
        {/* ভলিউম ডিস্ট্রিবিউশন বার চার্ট */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-bold text-lime-500 tracking-wider">Pipeline Volume Distribution</h3>
          <div className="space-y-3 pt-2">
            {/* Pending Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">PENDING VOL.</span>
                <span className="text-amber-400 font-bold">${totalPending} ({grandTotal ? ((totalPending/grandTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[#0b110c] h-2.5 rounded-full overflow-hidden border border-lime-950/30">
                <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${grandTotal ? (totalPending/grandTotal)*100 : 0}%` }}></div>
              </div>
            </div>
            {/* Approved Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">APPROVED VOL.</span>
                <span className="text-emerald-400 font-bold">${totalApproved} ({grandTotal ? ((totalApproved/grandTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[#0b110c] h-2.5 rounded-full overflow-hidden border border-lime-950/30">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${grandTotal ? (totalApproved/grandTotal)*100 : 0}%` }}></div>
              </div>
            </div>
            {/* Rejected Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">REJECTED VOL.</span>
                <span className="text-red-500 font-bold">${totalRejected} ({grandTotal ? ((totalRejected/grandTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[#0b110c] h-2.5 rounded-full overflow-hidden border border-lime-950/30">
                <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${grandTotal ? (totalRejected/grandTotal)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ৩. ক্যালেন্ডার ডেট ফিল্টার (From - To) */}
        <div className="bg-[#0a110d] border border-lime-950/60 p-4 rounded-xl flex flex-col justify-center space-y-3">
          <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Temporal Date Filtering</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">From Date</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-[#050a06] border border-lime-950 rounded p-1.5 text-white focus:outline-none focus:border-lime-500/50 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">To Date</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-[#050a06] border border-lime-950 rounded p-1.5 text-white focus:outline-none focus:border-lime-500/50 [color-scheme:dark]"
              />
            </div>
          </div>
          {(fromDate || toDate) && (
            <button 
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer"
            >
              Reset Date Filter
            </button>
          )}
        </div>
      </div>

      {/* 📊 ৪. মেইন ট্রানজেকশন লেজার টেবিল */}
      <div className="bg-[#060c07] border border-lime-950/40 rounded-xl shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse font-mono text-[11px] tracking-tight">
          <thead>
            <tr className="bg-[#0b110c] border-b border-lime-950/60 text-lime-500 uppercase text-[10px]">
              <th className="p-3 border-r border-lime-950/20 text-center w-16">Req ID</th>
              <th className="p-3 border-r border-lime-950/20 w-24">User ID</th>
              <th className="p-3 border-r border-lime-950/20 w-56 font-sans">User Email</th>
              <th className="p-3 border-r border-lime-950/20 text-right w-32 text-emerald-500">Amount (USD)</th>
              <th className="p-3 border-r border-lime-950/20 text-center w-32 text-cyan-400">Method</th>
              <th className="p-3 border-r border-lime-950/20 w-48">Target Wallet/No.</th>
              <th className="p-3 border-r border-lime-950/20 text-center w-28">Status</th>
              <th className="p-3 border-r border-lime-950/20 w-40">Requested At</th>
              <th className="p-3 text-center w-48 text-lime-400">Action Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-950/20">
            {filteredWithdrawals.map((req) => (
              <tr key={req.id} className="hover:bg-lime-950/10 transition-all duration-100 border-b border-lime-950/10">
                <td className="p-3 border-r border-lime-950/20 text-center text-zinc-600 font-bold bg-[#080d09]">#{req.id}</td>
                <td className="p-3 border-r border-lime-950/20 text-zinc-400 font-bold">{req.user_id}</td>
                <td className="p-3 border-r border-lime-950/20 text-white font-sans font-medium">{req.user_email}</td>
                <td className="p-3 border-r border-lime-950/20 text-right font-bold text-emerald-400 font-sans">${req.amount_dollar.toFixed(2)}</td>
                <td className="p-3 border-r border-lime-950/20 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    req.payment_method === "bKash" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" :
                    req.payment_method === "Nagad" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}>
                    {req.payment_method}
                  </span>
                </td>
                
                {/* ওয়ালেট ও কপি বাটন */}
                <td className="p-3 border-r border-lime-950/20 text-zinc-300 font-sans tracking-normal font-semibold">
                  <div className="flex items-center justify-between group">
                    <span>{req.account_number}</span>
                    <button
                      onClick={() => handleCopyNumber(req.id, req.account_number)}
                      className={`ml-2 p-1 rounded border transition-all cursor-pointer ${
                        copiedId === req.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-[#0b110c] border-lime-950/80 text-zinc-500 hover:text-white"
                      }`}
                    >
                      {copiedId === req.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      )}
                    </button>
                  </div>
                </td>

                <td className="p-3 border-r border-lime-950/20 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    req.status === "pending" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                    req.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"
                  }`}>
                    • {req.status}
                  </span>
                </td>
                <td className="p-3 border-r border-lime-950/20 text-zinc-500 text-[10px]">{new Date(req.requested_at).toLocaleString()}</td>
                <td className="p-2 text-center flex justify-center gap-2">
                  {req.status === "pending" ? (
                    <>
                      <button onClick={() => handleUpdateStatus(req.id, "approved")} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer uppercase tracking-wider">Approve</button>
                      <button onClick={() => handleUpdateStatus(req.id, "rejected")} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer uppercase tracking-wider">Reject</button>
                    </>
                  ) : (
                    <span className="text-zinc-600 italic text-[10px] py-1">Processed Locked</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredWithdrawals.length === 0 && (
              <tr>
                <td colSpan="9" className="p-12 text-center text-zinc-600 tracking-widest text-xs">[INFO] NO MATCHING RECORDS CURRENTLY PIPED IN THIS QUEUE</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}