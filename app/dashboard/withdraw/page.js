"use client";
import { useState } from "react";

export default function WithdrawPage() {
  // Mock States
  const [minedPoints, setMinedPoints] = useState(2500.00); // ইউজারের কারেন্ট পয়েন্ট
  const [takaBalance, setTakaBalance] = useState(40.00);   // ইউজারের মেইন টাকা ব্যালেন্স
  const [convertInput, setConvertInput] = useState("");     // পয়েন্ট ইনপুট ফিল্ড
  
  // উইথড্র ফর্ম স্টেট
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // নকল ট্রানজেকশন হিস্ট্রি ডেটা
  const [history, setHistory] = useState([
    { id: 1, type: "Convert", amount: "৳২৫.০০", status: "Completed", date: "2026-06-12" },
    { id: 2, type: "Withdraw (bKash)", amount: "৳১০০.০০", status: "Pending", date: "2026-06-15" },
  ]);

  // কনভার্সন রেট: ১০০ পয়েন্ট = ১ টাকা
  const CONVERSION_RATE = 100; 
  const estimatedTaka = convertInput ? (parseFloat(convertInput) / CONVERSION_RATE) : 0;

  // পয়েন্ট টু টাকা কনভার্ট হ্যান্ডলার
  const handleConvert = (e) => {
    e.preventDefault();
    const pointsToConvert = parseFloat(convertInput);

    if (!pointsToConvert || pointsToConvert <= 0) {
      alert("দয়া করে সঠিক পয়েন্ট সংখ্যা লিখুন।");
      return;
    }
    if (pointsToConvert > minedPoints) {
      alert("আপনার অ্যাকাউন্টে পর্যাপ্ত পয়েন্ট নেই!");
      return;
    }

    // স্টেট আপডেট (টাকা যোগ এবং পয়েন্ট বিয়োগ)
    const earnedTaka = pointsToConvert / CONVERSION_RATE;
    setMinedPoints(prev => prev - pointsToConvert);
    setTakaBalance(prev => prev + earnedTaka);
    
    // হিস্ট্রিতে যোগ করা
    setHistory(prev => [
      { id: Date.now(), type: "Convert", amount: `৳${earnedTaka.toFixed(2)}`, status: "Completed", date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    setConvertInput("");
    alert(`সাফল্যের সাথে ${pointsToConvert} পয়েন্ট কনভার্ট করে ৳${earnedTaka} মেইন ব্যালেন্সে যোগ করা হয়েছে!`);
  };

  // উইথড্র সাবমিট হ্যান্ডলার
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
      alert("আপনার মেইন ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");
      return;
    }

    // ব্যালেন্স কেটে নেওয়া
    setTakaBalance(prev => prev - amount);
    
    // হিস্ট্রিতে পেন্ডিং হিসেবে যোগ করা
    setHistory(prev => [
      { id: Date.now(), type: `Withdraw (${paymentMethod})`, amount: `৳${amount.toFixed(2)}`, status: "Pending", date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    setWithdrawAmount("");
    setAccountNumber("");
    alert("আপনার উইথড্র রিকোয়েস্টটি অ্যাডমিনের কাছে পাঠানো হয়েছে। ২৪ ঘণ্টার মধ্যে পেমেন্ট পেয়ে যাবেন।");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* হেডার */}
      <div className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          Wallet & Cash Out
        </h1>
        <p className="text-slate-400 text-sm">আপনার পয়েন্ট টাকায় রূপান্তর করুন এবং বিকাশ বা নগদে উইথড্র দিন।</p>
      </div>

      {/* লাইভ ব্যালেন্স প্রিভিউ কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-1">Mined Points Available</p>
          <h2 className="text-3xl font-black text-amber-400">{minedPoints.toFixed(2)} PTS</h2>
          <span className="text-xs text-slate-500">*১০০ পয়েন্ট = ৳১ টাকা</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-1">Main Taka Balance</p>
          <h2 className="text-3xl font-black text-emerald-400">৳{takaBalance.toFixed(2)}</h2>
          <span className="text-xs text-slate-500">*নূন্যতম উইথড্র ৫০ টাকা</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* বক্স ১: পয়েন্ট টু টাকা কনভার্টার */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-slate-200 mb-4">🔄 Point Converter</h3>
          <form onSubmit={handleConvert} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">কত পয়েন্ট কনভার্ট করবেন?</label>
              <input
                type="number"
                placeholder="যেমন: ১০০০"
                value={convertInput}
                onChange={(e) => setConvertInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            {estimatedTaka > 0 && (
              <p className="text-sm text-emerald-400 font-medium">
                আপনি পাবেন: ৳{estimatedTaka.toFixed(2)} টাকা
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold p-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Convert to Taka
            </button>
          </form>
        </div>

        {/* বক্স ২: উইথড্র ফর্ম */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-slate-200 mb-4">💸 Withdraw BDT</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">পেমেন্ট মেথড সিলেক্ট করুন</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="bKash">bKash (Personal)</option>
                <option value="Nagad">Nagad (Personal)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">বিকাশ/নগদ নম্বর</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">টাকার পরিমাণ (BDT)</label>
              <input
                type="number"
                placeholder="মিনিমাম ৫০"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold p-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Submit Withdrawal
            </button>
          </form>
        </div>
      </div>

      {/* ট্রানজেকশন হিস্ট্রি টেবিল */}
      <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-4">📜 Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-slate-950 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-medium text-slate-200">{item.type}</td>
                  <td className="p-4 text-emerald-400 font-semibold">{item.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}