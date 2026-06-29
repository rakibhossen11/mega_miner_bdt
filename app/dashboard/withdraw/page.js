"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// 🎯 রিডাক্স অ্যাকশনসমূহ ইম্পোর্ট
import { fetchWalletData, updateBalances } from "@/app/store/walletSlice"; 

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

  // Transaction History
  const [history, setHistory] = useState([
    { id: 1, type: "Convert", amount: "$25.00", status: "Completed", date: "2026-06-12" },
    { id: 2, type: "Withdraw (bKash)", amount: "$10.00", status: "Pending", date: "2026-06-15" },
  ]);

  // 💱 Conversion System Config
  const CONVERSION_RATE = 100; 

  // ইউজার ইনপুট দেওয়া মাত্রই পয়েন্টের আগের পূর্ণসংখ্যা নিয়ে ডলার এস্টিমেট করবে
  const integerConvertInput = convertInput ? Math.floor(parseFloat(convertInput)) : 0;
  const estimatedDollar = integerConvertInput > 0 ? (integerConvertInput / CONVERSION_RATE) : 0;

  // 📡 প্রথমবার পেজ লোড হলে ব্যালেন্স সিঙ্ক করা
  useEffect(() => {
    dispatch(fetchWalletData());
  }, [dispatch]);

  // Converter Handler (Coin to Dollar)
  const handleConvert = async (e) => {
    e.preventDefault();
    
    // ১. দশমিকের পরের অংশ বাদ দিয়ে শুধুমাত্র পূর্ণসংখ্যা (Integer) নেওয়া হলো
    const coinsToConvert = Math.floor(parseFloat(convertInput));
    // console.log(coinsToConvert);

    if (!coinsToConvert || coinsToConvert <= 0) {
      alert("Please enter a valid amount of coins.");
      return;
    }

    // ২. মিনিমাম ১০০০ কয়েন কনভার্ট করার কন্ডিশন চেকিং
    if (coinsToConvert < 1000) {
      alert("Minimum conversion limit is 1,000 Coins!");
      return;
    }

    // ৩. শুধুমাত্র পয়েন্টের আগের অ্যাভেইলেবল কয়েনের সাথে ইনপুট চেক করা
    const availableIntegerCoins = Math.floor(totalCoin);
    
    if (coinsToConvert > availableIntegerCoins) {
      alert(`Insufficient balance! You can only convert the whole number part of your coins (Max: ${availableIntegerCoins} Coins).`);
      return;
    }

    const earnedDollar = coinsToConvert / CONVERSION_RATE;
    // console.log(earnedDollar);
    setIsLoading(true);

    try {
      // 📡 রিডাক্সের মাধ্যমে কানেক্ট করার জন্য ব্যাকএন্ড এপিআই কল
      const res = await fetch("/api/wallet/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          coinsToMinus: coinsToConvert, 
          dollarsToPlus: earnedDollar 
        })
      });

      const json = await res.json();

      if (json.success) {
        // ৪. ডাটাবেজে আপডেট সফল হলে রিডাক্স স্টোরে সরাসরি লাইভ ভ্যালু সিঙ্ক
        dispatch(updateBalances({
          newTotalCoin: json.newTotalCoin, // ব্যাকএন্ড থেকে আসা নিখুঁত ব্যালেন্স
          newTotalDollar: json.newTotalDollar
        }));
        setConvertInput("");
        alert(`Success! Converted ${coinsToConvert.toLocaleString()} Coins to $${earnedDollar.toFixed(2)} USD successfully.`);
      } else {
        alert(json.message || "Conversion rejected by database engine.");
      }
    } catch (err) {
      console.error("Conversion failed:", err);
      alert("Server pipeline error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw Handler
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!accountNumber || !amount || amount <= 0) {
      alert("Please fill up all fields accurately.");
      return;
    }
    if (amount < 5) {
      alert("Minimum withdrawal limit is $5.00 USD!");
      return;
    }
    if (amount > totalDollar) {
      alert("Insufficient USD balance in your main wallet!");
      return;
    }

    try {
      setHistory(prev => [
        { id: Date.now(), type: `Withdraw (${paymentMethod})`, amount: `$${amount.toFixed(2)}`, status: "Pending", date: new Date().toISOString().split('T')[0] },
        ...prev
      ]);

      setWithdrawAmount("");
      setAccountNumber("");
      alert("Your withdrawal request has been sent.");
      dispatch(fetchWalletData());
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d08] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-lime-500/30">
      
      {/* 🚀 Top Cmd Header */}
      <div className="max-w-xl mx-auto mb-6 flex justify-between items-center bg-[#0d160f]/60 border border-lime-950/40 p-4 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            Financial Core
          </h1>
          <p className="text-zinc-500 text-[11px] font-medium">Convert assets and request secure fiat/crypto gateway payouts.</p>
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
          {/* Total Live Coins Card */}
          <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Mined Coins</p>
            <h2 className="text-xl font-black text-amber-400 font-mono tracking-tight">
              {totalCoin.toFixed(8)} <span className="text-[10px] font-normal text-zinc-500">COIN</span>
            </h2>
            <span className="text-[9px] text-zinc-600 block mt-1">Convertible: {Math.floor(totalCoin).toLocaleString()} COIN</span>
            <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">🪙</div>
          </div>
          
          {/* Total USD Balance Card */}
          <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Available USD Balance</p>
            <h2 className="text-xl font-black text-lime-400 font-mono tracking-tight">${totalDollar.toFixed(2)}</h2>
            <span className="text-[9px] text-zinc-600 block mt-1">Min Payout Level: $5.00</span>
            <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">💳</div>
          </div>
        </div>

        {/* 🔄 MODULE 1: COIN TO USD CONVERTER */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
            <span className="text-base">🔄</span>
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Coin Converter Subsystem</h3>
          </div>
          
          <form onSubmit={handleConvert} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Coins Volume to Convert (Integer Only)</label>
              <input
                type="number"
                placeholder="Minimum 1,000 (No decimals)"
                value={convertInput}
                disabled={isLoading}
                onChange={(e) => setConvertInput(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-wide focus:outline-none focus:border-amber-500/50 shadow-inner"
              />
            </div>
            
            {estimatedDollar > 0 && (
              <div className="p-3 bg-lime-500/5 border border-lime-500/10 rounded-xl animate-fade-in">
                <p className="text-[11px] text-lime-400 font-medium flex items-center gap-1.5">
                  ✨ Est. Value Output: <span className="font-mono font-black">${estimatedDollar.toFixed(2)} USD</span>
                </p>
                <span className="text-[9px] text-zinc-500 block mt-0.5">* Converting exactly {integerConvertInput.toLocaleString()} whole coins.</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-400 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Convert to USD Cargo"}
            </button>
          </form>
        </div>

        {/* 💸 MODULE 2: SECURED WITHDRAW FORM */}
        <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
            <span className="text-base">💸</span>
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Secure USD Withdrawal</h3>
          </div>
          
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Select Payout Node Gateway</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-zinc-300 font-bold focus:outline-none focus:border-lime-500/50 appearance-none cursor-pointer"
              >
                <option value="bKash" className="bg-[#060a07]">bKash (Local Mobile Wallet)</option>
                <option value="Nagad" className="bg-[#060a07]">Nagad (Local Mobile Wallet)</option>
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
              <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Payout Volume (USD)</label>
              <input
                type="number"
                placeholder="Minimum 5"
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

// "use client";
// import { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchWalletData } from "@/app/store/walletSlice"; // আপনার ওয়ালেট ডাটা ফেচ করার অ্যাকশন

// export default function WithdrawPage() {
//   const dispatch = useDispatch();

//   // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে লাইভ ডাটা রিড
//   const totalCoin = useSelector((state) => state.wallet.totalCoin || 0);
//   const totalDollar = useSelector((state) => state.wallet.totalDollar || 0);

//   // Converter States
//   const [convertInput, setConvertInput] = useState("");    
  
//   // Withdraw States
//   const [paymentMethod, setPaymentMethod] = useState("bKash");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [withdrawAmount, setWithdrawAmount] = useState("");

//   // Transaction History Mock Data (Fully English)
//   const [history, setHistory] = useState([
//     { id: 1, type: "Convert", amount: "$25.00", status: "Completed", date: "2026-06-12" },
//     { id: 2, type: "Withdraw (bKash)", amount: "$10.00", status: "Pending", date: "2026-06-15" },
//   ]);

//   // 💱 Conversion System Config (e.g., 100 Coins = 1.00 USD)
//   const CONVERSION_RATE = 100; 
//   const estimatedDollar = convertInput ? (parseFloat(convertInput) / CONVERSION_RATE) : 0;

//   // 📡 ডাটাবেজ থেকে রিয়েল-টাইম ওয়ালেট ব্যালেন্স সিঙ্ক রাখা
//   useEffect(() => {
//     dispatch(fetchWalletData());
//   }, [dispatch]);

//   // Converter Handler (Coin to Dollar)
//   const handleConvert = async (e) => {
//     e.preventDefault();
//     const coinsToConvert = parseFloat(convertInput);

//     if (!coinsToConvert || coinsToConvert <= 0) {
//       alert("Please enter a valid amount of coins.");
//       return;
//     }
//     if (coinsToConvert > totalCoin) {
//       alert("Insufficient coin balance in your account!");
//       return;
//     }

//     const earnedDollar = coinsToConvert / CONVERSION_RATE;

//     try {
//       // 📡 এখানে আপনার ব্যাকএন্ড এপিআই কল করতে পারেন
//       // const res = await fetch("/api/wallet/convert", { ... });
      
//       setHistory(prev => [
//         { id: Date.now(), type: "Convert", amount: `$${earnedDollar.toFixed(2)}`, status: "Completed", date: new Date().toISOString().split('T')[0] },
//         ...prev
//       ]);

//       setConvertInput("");
//       alert(`Success! Converted ${coinsToConvert} Coins to $${earnedDollar.toFixed(2)} USD successfully.`);
//       dispatch(fetchWalletData()); // রিডাক্স ব্যালেন্স রি-লোডের জন্য
//     } catch (err) {
//       console.error("Conversion failed:", err);
//     }
//   };

//   // Withdraw Handler
//   const handleWithdraw = async (e) => {
//     e.preventDefault();
//     const amount = parseFloat(withdrawAmount);

//     if (!accountNumber || !amount || amount <= 0) {
//       alert("Please fill up all fields accurately.");
//       return;
//     }
//     if (amount < 5) {
//       alert("Minimum withdrawal limit is $5.00 USD!");
//       return;
//     }
//     if (amount > totalDollar) {
//       alert("Insufficient USD balance in your main wallet!");
//       return;
//     }

//     try {
//       // 📡 এখানে উইথড্র রিকোয়েস্ট এপিআই ইন্টিগ্রেশন করতে পারেন
      
//       setHistory(prev => [
//         { id: Date.now(), type: `Withdraw (${paymentMethod})`, amount: `$${amount.toFixed(2)}`, status: "Pending", date: new Date().toISOString().split('T')[0] },
//         ...prev
//       ]);

//       setWithdrawAmount("");
//       setAccountNumber("");
//       alert("Your withdrawal request has been sent to the admin payload pipeline. Payout settles within 24 hours.");
//       dispatch(fetchWalletData());
//     } catch (err) {
//       console.error("Withdrawal failed:", err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#060d08] text-white p-4 pb-24 md:pb-6 font-sans antialiased selection:bg-lime-500/30">
      
//       {/* 🚀 Top Cmd Header */}
//       <div className="max-w-xl mx-auto mb-6 flex justify-between items-center bg-[#0d160f]/60 border border-lime-950/40 p-4 rounded-2xl backdrop-blur-md shadow-xl">
//         <div>
//           <h1 className="text-xl font-black bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
//             Financial Core
//           </h1>
//           <p className="text-zinc-500 text-[11px] font-medium">Convert assets and request secure fiat/crypto gateway payouts.</p>
//         </div>
//         <div className="flex items-center gap-2 bg-[#060a07] border border-lime-950/80 px-3 py-1.5 rounded-xl">
//           <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse"></span>
//           <span className="text-[10px] font-black tracking-widest text-lime-400 uppercase">Gateway Live</span>
//         </div>
//       </div>

//       {/* Main Layout Container */}
//       <div className="max-w-xl mx-auto space-y-6">
        
//         {/* 📊 Live Balance Matrix Preview Grid */}
//         <div className="grid grid-cols-2 gap-4">
//           {/* Total Live Coins Card */}
//           <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
//             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Mined Coins</p>
//             <h2 className="text-xl font-black text-amber-400 font-mono tracking-tight">
//               {totalCoin.toFixed(8)} <span className="text-[10px] font-normal text-zinc-500">COIN</span>
//             </h2>
//             <span className="text-[9px] text-zinc-600 block mt-1">Rate: 100 COIN = $1.00 USD</span>
//             <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">🪙</div>
//           </div>
          
//           {/* Total USD Balance Card */}
//           <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-4 rounded-2xl relative overflow-hidden shadow-xl">
//             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Available USD Balance</p>
//             <h2 className="text-xl font-black text-lime-400 font-mono tracking-tight">${totalDollar.toFixed(2)}</h2>
//             <span className="text-[9px] text-zinc-600 block mt-1">Min Payout Level: $5.00</span>
//             <div className="absolute right-2 bottom-1 text-3xl opacity-[0.03] pointer-events-none">💳</div>
//           </div>
//         </div>

//         {/* 🔄 MODULE 1: COIN TO USD CONVERTER */}
//         <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
//           <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
//             <span className="text-base">🔄</span>
//             <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Coin Converter Subsystem</h3>
//           </div>
          
//           <form onSubmit={handleConvert} className="space-y-4">
//             <div>
//               <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Coins Volume to Convert</label>
//               <input
//                 type="number"
//                 placeholder="e.g. 500"
//                 value={convertInput}
//                 onChange={(e) => setConvertInput(e.target.value)}
//                 className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-wide focus:outline-none focus:border-amber-500/50 shadow-inner"
//               />
//             </div>
            
//             {estimatedDollar > 0 && (
//               <div className="p-3 bg-lime-500/5 border border-lime-500/10 rounded-xl animate-fade-in">
//                 <p className="text-[11px] text-lime-400 font-medium flex items-center gap-1.5">
//                   ✨ Est. Value Output: <span className="font-mono font-black">${estimatedDollar.toFixed(2)} USD</span>
//                 </p>
//               </div>
//             )}
            
//             <button
//               type="submit"
//               className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-400"
//             >
//               Convert to USD Cargo
//             </button>
//           </form>
//         </div>

//         {/* 💸 MODULE 2: SECURED WITHDRAW FORM */}
//         <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
//           <div className="flex items-center gap-2 mb-4 border-b border-lime-950/30 pb-3">
//             <span className="text-base">💸</span>
//             <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Secure USD Withdrawal</h3>
//           </div>
          
//           <form onSubmit={handleWithdraw} className="space-y-4">
//             <div>
//               <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Select Payout Node Gateway</label>
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-zinc-300 font-bold focus:outline-none focus:border-lime-500/50 appearance-none cursor-pointer"
//               >
//                 <option value="bKash" className="bg-[#060a07]">bKash (Local Mobile Wallet)</option>
//                 <option value="Nagad" className="bg-[#060a07]">Nagad (Local Mobile Wallet)</option>
//               </select>
//             </div>
            
//             <div>
//               <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Terminal Account Number</label>
//               <input
//                 type="text"
//                 placeholder="01XXXXXXXXX"
//                 value={accountNumber}
//                 onChange={(e) => setAccountNumber(e.target.value)}
//                 className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-widest focus:outline-none focus:border-lime-500/50 shadow-inner"
//               />
//             </div>
            
//             <div>
//               <label className="text-[11px] font-bold tracking-wide text-zinc-500 uppercase block mb-2">Payout Volume (USD)</label>
//               <input
//                 type="number"
//                 placeholder="Minimum 5"
//                 value={withdrawAmount}
//                 onChange={(e) => setWithdrawAmount(e.target.value)}
//                 className="w-full bg-[#09110b] border border-lime-950/80 rounded-xl p-3.5 text-xs text-lime-400 font-mono tracking-wide focus:outline-none focus:border-lime-500/50 shadow-inner"
//               />
//             </div>
            
//             <button
//               type="submit"
//               className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-lime-500 text-black text-xs font-black tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-lime-500/10 border border-lime-400"
//             >
//               Fire Payout Pipeline
//             </button>
//           </form>
//         </div>

//         {/* 📜 STORAGE PIPELINE: TRANSACTION HISTORY */}
//         <div className="bg-gradient-to-b from-[#0b140d] to-[#060a07] border border-lime-950/40 p-5 rounded-3xl shadow-xl">
//           <div className="mb-4 flex items-center gap-2 border-b border-lime-950/30 pb-3">
//             <span className="text-base">🏭</span>
//             <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Financial Node History</h3>
//           </div>
          
//           <div className="overflow-x-auto pt-1">
//             <table className="w-full text-left text-[11px] text-zinc-300 border-collapse">
//               <thead className="bg-[#09110b] border-b border-lime-950/60">
//                 <tr>
//                   <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Operation Type</th>
//                   <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Net Volume</th>
//                   <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Core Status</th>
//                   <th className="px-4 py-3 font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.map((item) => (
//                   <tr key={item.id} className="border-b border-lime-950/30 hover:bg-[#121b15]/40 transition-colors duration-150">
//                     <td className="px-4 py-3 font-medium text-slate-200">{item.type}</td>
//                     <td className="px-4 py-3 text-lime-400 font-mono font-bold">{item.amount}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border ${
//                         item.status === "Completed" 
//                           ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
//                           : "bg-amber-500/10 text-amber-400 border-amber-500/20"
//                       }`}>
//                         {item.status.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 font-mono text-zinc-500 text-[10px]">{item.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }