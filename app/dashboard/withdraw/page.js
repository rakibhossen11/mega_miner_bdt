"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast"; // 🚀 প্রফেশনাল টোস্ট নোটিফিকেশন
import { fetchWalletData, updateBalances } from "@/app/store/walletSlice"; 
import { 
  Coins, 
  DollarSign, 
  ArrowRightLeft, 
  Send, 
  History, 
  Smartphone, 
  TrendingUp,
  ShieldCheck
} from "lucide-react"; // 🚀 সাইবার থিম আইকনসমূহ

export default function WithdrawPage() {
  const dispatch = useDispatch();

  // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে লাইভ ডাটা রিড
  const totalCoin = useSelector((state) => state.wallet.totalCoin || 0);
  const totalDollar = useSelector((state) => state.wallet.totalDollar || 0);

  // Converter States
  const [convertInput, setConvertInput] = useState("");    
  const [isLoading, setIsLoading] = useState(false);
  
  // Withdraw States
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Transaction History (লোকাল মক ডাটা)
  const [history, setHistory] = useState([
    // { id: 1, type: "Convert", amount: "$25.00", status: "Completed", date: "2026-06-12" },
    // { id: 2, type: "Withdraw (bKash)", amount: "$10.00", status: "Pending", date: "2026-06-15" },
  ]);

  // 💱 Conversion System Config (১০০০ কয়েন = ১ ডলার ব্যাকএন্ড সিঙ্ক)
  const CONVERSION_RATE = 1000; 

  // ইউজার ইনপুট দেওয়া মাত্রই লাইভ এস্টিমেট ক্যালকুলেশন
  const integerConvertInput = convertInput ? Math.floor(parseFloat(convertInput)) : 0;
  const estimatedDollar = integerConvertInput > 0 ? (integerConvertInput / CONVERSION_RATE) : 0;

  // 📡 প্রথমবার পেজ লোড হলে ব্যালেন্স সিঙ্ক করা
  useEffect(() => {
    dispatch(fetchWalletData());
  }, [dispatch]);

  // ==========================================
  // 💱 ACTION 1: COIN TO USD CONVERSION
  // ==========================================
  const handleConvert = async (e) => {
    e.preventDefault();
    
    const coinsToConvert = Math.floor(parseFloat(convertInput));

    if (!coinsToConvert || coinsToConvert <= 0) {
      toast.error("Please enter a valid amount of coins.");
      return;
    }

    if (coinsToConvert < 1000) {
      toast.error("Minimum conversion limit is 1,000 Coins!");
      return;
    }

    const availableIntegerCoins = Math.floor(totalCoin);
    if (coinsToConvert > availableIntegerCoins) {
      toast.error(`Insufficient balance! Max whole coins: ${availableIntegerCoins}`);
      return;
    }

    const loadingToast = toast.loading("Processing ledger asset conversion...");
    setIsLoading(true);

    try {
      // 🚀 ফিক্সড পাথ: ব্যাকএন্ড কনভার্ট রাউটের সাথে ম্যাচড
      const res = await fetch("/api/dashboard/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinsToMinus: coinsToConvert })
      });

      const json = await res.json();

      toast.dismiss(loadingToast);

      if (json.success) {
        // রিডাক্স গ্লোবাল ব্যালেন্স সিঙ্ক
        dispatch(updateBalances({
          newTotalCoin: json.newTotalCoin,
          newTotalDollar: json.newTotalDollar
        }));
        setConvertInput("");
        toast.success(`Converted ${coinsToConvert.toLocaleString()} Coins into $${(coinsToConvert / CONVERSION_RATE).toFixed(2)} USD!`);
      } else {
        toast.error(json.message || "Conversion rejected.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Conversion failed:", err);
      toast.error("Server pipeline error during transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 💸 ACTION 2: PAYOUT WITHDRAWAL
  // ==========================================
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!accountNumber || !amount || amount <= 0) {
      toast.error("Please fill up all fields accurately.");
      return;
    }
    if (amount < 5) {
      toast.error("Minimum withdrawal limit is $5.00 USD!");
      return;
    }
    if (amount > totalDollar) {
      toast.error("Insufficient USD balance in your wallet!");
      return;
    }

    // উইথড্রাল রিকোয়েস্ট হিস্ট্রি পুশ (মক ট্র্যাকিং)
    setHistory(prev => [
      { id: Date.now(), type: `Withdraw (${paymentMethod})`, amount: `$${amount.toFixed(2)}`, status: "Pending", date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    setWithdrawAmount("");
    setAccountNumber("");
    toast.success("🚀 Payout request fired to pipeline! Pending review.");
    dispatch(fetchWalletData());
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-amber-500/30">
      
      {/* 🚀 টপ হেডার কমান্ড প্যানেল */}
      <div className="max-w-xl mx-auto mb-5 flex justify-between items-center bg-[#111827]/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white uppercase tracking-wider">
              Financial Core
            </h1>
            <p className="text-slate-400 text-[10px] font-medium">Convert assets and request secure fiat gateway payouts.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/60 px-3 py-1.5 rounded-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">Gateway Live</span>
        </div>
      </div>

      {/* মেইন লেআউট মডিউল */}
      <div className="max-w-xl mx-auto space-y-4.5">
        
        {/* 📊 লাইভ মেমোরি ব্যালেন্স ম্যাট্রিক্স গ্রিড */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* টোটাল কয়েন কার্ড */}
          <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/50 p-4 rounded-xl relative overflow-hidden shadow-xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Total Mined Coins</span>
            </p>
            <h2 className="text-lg font-black text-amber-400 font-mono tracking-tight">
              {totalCoin.toFixed(8)}
            </h2>
            <span className="text-[9px] text-slate-500 block mt-1 font-medium">Convertible: {Math.floor(totalCoin).toLocaleString()}</span>
          </div>
          
          {/* টোটাল ইউএসডি ব্যালেন্স কার্ড */}
          <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/50 p-4 rounded-xl relative overflow-hidden shadow-xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              <span>Available USD</span>
            </p>
            <h2 className="text-lg font-black text-emerald-400 font-mono tracking-tight">${totalDollar.toFixed(2)}</h2>
            <span className="text-[9px] text-slate-500 block mt-1 font-medium">Min Payout Level: $5.00</span>
          </div>
        </div>

        {/* 🔄 মডিউল ১: কয়েন টু ইউএসডি কনভার্টার সাবসিস্টেম */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/40 pb-3">
            <ArrowRightLeft className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Coin Converter Subsystem</h3>
          </div>
          
          <form onSubmit={handleConvert} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-2">Coins Volume to Convert (Integer Only)</label>
              <input
                type="number"
                placeholder="Minimum 1,000 whole coins"
                value={convertInput}
                disabled={isLoading}
                onChange={(e) => setConvertInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-mono tracking-wide focus:outline-none focus:border-amber-500/50 shadow-inner"
              />
            </div>
            
            {estimatedDollar > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
                  <span>Est. Value Output: <span className="font-mono font-black">${estimatedDollar.toFixed(2)} USD</span></span>
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">* System processing exactly {integerConvertInput.toLocaleString()} whole tokens.</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/10 border-t border-amber-400/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Syncing Ledger..." : "Convert to USD Balance"}
            </button>
          </form>
        </div>

        {/* 💸 মডিউল ২: সিকিউরড গেটওয়ে উইথড্রাল ফর্ম */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/40 pb-3">
            <Send className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Secure USD Withdrawal Pipeline</h3>
          </div>
          
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-2">Select Payout Node Gateway</label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-bold focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                >
                  <option value="bKash">bKash (Mobile Fiat Wallet)</option>
                  <option value="Nagad">Nagad (Mobile Fiat Wallet)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-2">Terminal Account Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                  <Smartphone className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-cyan-400 font-mono tracking-widest focus:outline-none focus:border-cyan-500/50 shadow-inner"
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-2">Payout Volume (USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
                <input
                  type="number"
                  placeholder="Minimum $5.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-cyan-400 font-mono tracking-wide focus:outline-none focus:border-cyan-500/50 shadow-inner"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/10 border-t border-cyan-400/20 cursor-pointer"
            >
              Fire Payout Pipeline
            </button>
          </form>
        </div>

        {/* 📜 লেজার হিস্ট্রি: ট্রানজেকশন ট্র্যাকিং টেবিল */}
        <div className="bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-800/40 pb-3">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Financial Node History</h3>
          </div>
          
          <div className="overflow-x-auto pt-0.5">
            <table className="w-full text-left text-[11px] text-slate-300 border-collapse min-w-[380px]">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operation Type</th>
                  <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Net Volume</th>
                  <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Core Status</th>
                  <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-colors">
                    <td className="px-3 py-3 font-semibold text-slate-200">{item.type}</td>
                    <td className="px-3 py-3 text-emerald-400 font-mono font-bold">{item.amount}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide border ${
                        item.status === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-500 text-[10px]">{item.date}</td>
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