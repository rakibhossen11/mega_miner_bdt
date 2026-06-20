"use client";
import { useState } from "react";

export default function WithdrawPage() {
  // Mock States
  const [minedPoints, setMinedPoints] = useState(2500.00); 
  const [takaBalance, setTakaBalance] = useState(40.00);   
  const [convertInput, setConvertInput] = useState("");    
  
  // Withdraw States
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Transaction History
  const [history, setHistory] = useState([
    { id: 1, type: "Convert", amount: "৳২৫.০০", status: "Completed", date: "2026-06-12" },
    { id: 2, type: "Withdraw (bKash)", amount: "৳১০০.০০", status: "Pending", date: "2026-06-15" },
  ]);

  const CONVERSION_RATE = 100; 
  const estimatedTaka = convertInput ? (parseFloat(convertInput) / CONVERSION_RATE) : 0;

  // Converter Handler
  const handleConvert = (e) => {
    e.preventDefault();
    const pointsToConvert = parseFloat(convertInput);

    if (!pointsToConvert || pointsToConvert <= 0) {
      alert("দয়া করে সঠিক পয়েন্ট সংখ্যা লিখুন।");
      return;
    }
    if (pointsToConvert > minedPoints) {
      alert("আপনার অ্যাকাউন্টে পর্যাপ্ত পয়েন্ট নেই!");
      return;
    }

    const earnedTaka = pointsToConvert / CONVERSION_RATE;
    setMinedPoints(prev => prev - pointsToConvert);
    setTakaBalance(prev => prev + earnedTaka);
    
    setHistory(prev => [
      { id: Date.now(), type: "Convert", amount: `৳${earnedTaka.toFixed(2)}`, status: "Completed", date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    setConvertInput("");
    alert(`সাফল্যের সাথে ${pointsToConvert} পয়েন্ট কনভার্ট করে ৳${earnedTaka} মেইন ব্যালেন্সে যোগ করা হয়েছে!`);
  };

  // Withdraw Handler
  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!accountNumber || !amount || amount <= 0) {
      alert("সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।");
      return;
    }
    if (amount < 50) {
      alert("নূন্যতম উইথড্র সীমা ৫০ টাকা!");
      return;
    }
    if (amount > takaBalance) {
      alert("আপনার মেইন ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");
      return;
    }

    setTakaBalance(prev => prev - amount);
    
    setHistory(prev => [
      { id: Date.now(), type: `Withdraw (${paymentMethod})`, amount: `৳${amount.toFixed(2)}`, status: "Pending", date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    setWithdrawAmount("");
    setAccountNumber("");
    alert("আপনার উইথড্র রিকোয়েস্টটি অ্যাডমিনের কাছে পাঠানো হয়েছে। ২৪ ঘণ্টার মধ্যে পেমেন্ট পেয়ে যাবেন।");
  };

  return (
    <div className="min-h-screen bg-[#060d08] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-lime-500/30">
      
      {/* 🚀 Top Cmd Header */}
      <div className="max-w-xl mx-auto mb-6 flex justify-between items-center bg-[#0d160f]/60 border border-lime-950/40 p-4 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            Financial Core
          </h1>
          <p className="text-zinc-500 text-[11px] font-medium">Convert points and request decentralized payouts.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#060a07] border border-lime-950/80 px-3 py-1.5 rounded-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse"></span>
          <span className="text-[10px] font-black tracking-widest text-lime-400 uppercase">Gateway Live</span>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* 📊 Live Balance Matrix Preview Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mined Points Card */}
          <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Mined Points Available</p>
            <h2 className="text-xl font-black text-amber-400 font-mono tracking-tight">{minedPoints.toFixed(2)} <span className="text-[10px] font-normal text-zinc-500">PTS</span></h2>
            <span className="text-[9px] text-zinc-600 block mt-1">১০০ PTS = ৳১.০০ BDT</span>
            <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">🪙</div>
          </div>
          
          {/* Main Taka Balance Card */}
          <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Main Taka Balance</p>
            <h2 className="text-xl font-black text-lime-400 font-mono tracking-tight">৳{takaBalance.toFixed(2)}</h2>
            <span className="text-[9px] text-zinc-600 block mt-1">Min Withdraw: ৳৫০.০০</span>
            <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">💳</div>
          </div>
        </div>

        {/* 🔄 MODULE 1: POINT TO BDT CONVERTER */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
            <span className="text-base">🔄</span>
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Point Converter Subsystem</h3>
          </div>
          
          <form onSubmit={handleConvert} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Points Amount to Convert</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={convertInput}
                onChange={(e) => setConvertInput(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-wide focus:outline-none focus:border-amber-500/50 shadow-inner"
              />
            </div>
            
            {estimatedTaka > 0 && (
              <div className="p-3 bg-lime-500/5 border border-lime-500/10 rounded-xl animate-fade-in">
                <p className="text-[11px] text-lime-400 font-medium flex items-center gap-1.5">
                  ✨ Multiplier Output: <span className="font-mono font-black">৳{estimatedTaka.toFixed(2)} BDT</span>
                </p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-400"
            >
              Convert to BDT Cargo
            </button>
          </form>
        </div>

        {/* 💸 MODULE 2: SECURED WITHDRAW FORM */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
            <span className="text-base">💸</span>
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Secure BDT Withdrawal</h3>
          </div>
          
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Select Payout Node Gateway</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-zinc-300 font-bold focus:outline-none focus:border-lime-500/50 appearance-none cursor-pointer"
              >
                <option value="bKash" className="bg-[#060a07]">bKash (Personal Account)</option>
                <option value="Nagad" className="bg-[#060a07]">Nagad (Personal Account)</option>
              </select>
            </div>
            
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Terminal Account Number</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-widest focus:outline-none focus:border-lime-500/50 shadow-inner"
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Payout Volume (BDT)</label>
              <input
                type="number"
                placeholder="Minimum 50"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-wide focus:outline-none focus:border-lime-500/50 shadow-inner"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-lime-500 text-black text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-lime-500/10 border border-lime-400"
            >
              Fire Payout Pipeline
            </button>
          </form>
        </div>

        {/* 📜 STORAGE PIPELINE: TRANSACTION HISTORY */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
          <div className="mb-4 flex items-center gap-2 border-b border-lime-950/30 pb-3">
            <span className="text-base">🏭</span>
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Financial Node History</h3>
          </div>
          
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-[11px] text-zinc-300 border-collapse">
              <thead className="bg-[#09110b] border-b border-lime-950/60">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Operation Type</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Net Volume</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Core Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-lime-950/30 hover:bg-[#121b15]/40 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-slate-200">{item.type}</td>
                    <td className="px-4 py-3 text-lime-400 font-mono font-bold">{item.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border ${
                        item.status === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500 text-[10px]">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}