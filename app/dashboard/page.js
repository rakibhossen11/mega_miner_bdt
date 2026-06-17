"use client";

import { useState, useEffect, useRef } from "react";
import "./mining.css";

export default function MiningPage() {
  // ===== স্টেট ভেরিয়েবল =====
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [balance, setBalance] = useState(0.00000000);
  const [totalMined, setTotalMined] = useState(0.00000000);
  const [sessionCount, setSessionCount] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [level, setLevel] = useState(1);
  const [nextLevelProgress, setNextLevelProgress] = useState(0);
  const [notification, setNotification] = useState("");

  // ===== রেফারেন্স =====
  const miningInterval = useRef(null);
  const energyInterval = useRef(null);
  const hashInterval = useRef(null);

  // ===== হ্যাশ রেট জেনারেটর (রিয়েলিস্টিক ফ্লাকচুয়েশন) =====
  const generateHashRate = () => {
    const baseRate = 50 + level * 15;
    const fluctuation = Math.random() * 20 - 10;
    return Math.max(10, Math.floor(baseRate + fluctuation));
  };

  // ===== মাইনিং লজিক =====
  const startMining = () => {
    if (energy <= 0) {
      setNotification("⚠️ এনার্জি শেষ! রিচার্জ হওয়া পর্যন্ত অপেক্ষা করুন।");
      return;
    }

    if (isMining) return;
    setIsMining(true);
    setNotification("⛏️ মাইনিং শুরু হয়েছে...");

    // হ্যাশ রেট আপডেট (প্রতি ১ সেকেন্ড)
    hashInterval.current = setInterval(() => {
      setHashRate(generateHashRate());
    }, 1000);

    // মাইনিং আয় (প্রতি ২ সেকেন্ড)
    miningInterval.current = setInterval(() => {
      if (energy <= 0) {
        stopMining();
        setNotification("🔋 এনার্জি শেষ! মাইনিং বন্ধ হয়েছে।");
        return;
      }

      // প্রতি সেকেন্ডে আয় (হ্যাশ রেট অনুযায়ী)
      const currentHash = hashRate || generateHashRate();
      const earning = (currentHash / 1000000) * (0.00000001 + level * 0.000000005);
      const roundedEarning = parseFloat(earning.toFixed(8));

      setBalance((prev) => parseFloat((prev + roundedEarning).toFixed(8)));
      setTotalMined((prev) => parseFloat((prev + roundedEarning).toFixed(8)));

      // এনার্জি কমানো
      setEnergy((prev) => Math.max(0, prev - 0.5));

      // লেভেল প্রোগ্রেস বাড়ানো
      setNextLevelProgress((prev) => {
        const newProgress = prev + roundedEarning * 100;
        if (newProgress >= 1000) {
          setLevel((l) => l + 1);
          setNotification(`🎉 কংগ্র্যাচুলেশন! লেভেল ${level + 1} এ আপগ্রেড!`);
          return 0;
        }
        return newProgress;
      });

      // সেশন কাউন্ট বাড়ানো
      setSessionCount((prev) => prev + 1);
    }, 2000);

    // এনার্জি রিচার্জ (প্রতি ৩ সেকেন্ড)
    energyInterval.current = setInterval(() => {
      setEnergy((prev) => Math.min(100, prev + 1));
    }, 3000);
  };

  const stopMining = () => {
    setIsMining(false);
    setNotification("⏹️ মাইনিং বন্ধ হয়েছে।");
    clearInterval(miningInterval.current);
    clearInterval(hashInterval.current);
    clearInterval(energyInterval.current);
    setHashRate(0);
  };

  // ===== ক্লেইম ফাংশন =====
  const claimReward = () => {
    if (balance < 0.0001) {
      setNotification("⚠️ মিনিমাম ০.০০০১ কোইন জমা হলে ক্লেইম করতে পারবেন।");
      return;
    }
    setNotification(`✅ ${balance.toFixed(8)} কোইন ক্লেইম করা হয়েছে!`);
    setBalance(0);
  };

  // ===== বুস্ট ফাংশন =====
  const activateBoost = () => {
    if (isMining) {
      setHashRate((prev) => prev * 2);
      setNotification("⚡ ২x বুস্ট অ্যাক্টিভেটেড! (৩০ সেকেন্ড)");
      setTimeout(() => {
        setHashRate((prev) => prev / 2);
        setNotification("⏳ বুস্ট শেষ হয়েছে।");
      }, 30000);
    } else {
      setNotification("⚠️ মাইনিং চালু থাকলে বুস্ট দিতে পারবেন।");
    }
  };

  // ===== ক্লিনআপ =====
  useEffect(() => {
    return () => {
      clearInterval(miningInterval.current);
      clearInterval(energyInterval.current);
      clearInterval(hashInterval.current);
    };
  }, []);

  // ===== UI রেন্ডার =====
  return (
    <div className="mining-container">
      {/* হেডার */}
      <header className="mining-header">
        <h1>⛏️ Crypto Miner Pro</h1>
        <div className="level-badge">
          Lv. {level} <span className="progress-bar" style={{ width: `${(nextLevelProgress / 1000) * 100}%` }}></span>
        </div>
      </header>

      {/* নোটিফিকেশন */}
      {notification && <div className="notification">{notification}</div>}

      {/* মেইন ড্যাশবোর্ড */}
      <div className="dashboard">
        <div className="card hash-card">
          <h3>⚡ হ্যাশ রেট</h3>
          <div className="value">{hashRate.toLocaleString()} H/s</div>
          <div className="sub-text">{isMining ? "⏳ মাইনিং চলছে..." : "⏸️ স্টপড"}</div>
        </div>

        <div className="card balance-card">
          <h3>💰 ব্যালেন্স</h3>
          <div className="value">{balance.toFixed(8)} BTC</div>
          <button className="claim-btn" onClick={claimReward}>
            ক্লেইম করুন
          </button>
        </div>

        <div className="card energy-card">
          <h3>🔋 এনার্জি</h3>
          <div className="energy-bar">
            <div className="energy-fill" style={{ width: `${energy}%` }}></div>
          </div>
          <div className="value">{Math.round(energy)}%</div>
        </div>
      </div>

      {/* স্ট্যাটস */}
      <div className="stats-grid">
        <div className="stat-item">
          <span>📊 মোট মাইন</span>
          <strong>{totalMined.toFixed(8)} BTC</strong>
        </div>
        <div className="stat-item">
          <span>🔄 সেশন</span>
          <strong>{sessionCount}</strong>
        </div>
        <div className="stat-item">
          <span>📈 লেভেল</span>
          <strong>{level}</strong>
        </div>
      </div>

      {/* কন্ট্রোল বাটন */}
      <div className="controls">
        {!isMining ? (
          <button className="start-btn" onClick={startMining}>
            ▶️ মাইনিং শুরু করুন
          </button>
        ) : (
          <button className="stop-btn" onClick={stopMining}>
            ⏹️ মাইনিং বন্ধ করুন
          </button>
        )}
        <button className="boost-btn" onClick={activateBoost}>
          🚀 বুস্ট (২x)
        </button>
      </div>

      {/* ফুটার */}
      <footer className="mining-footer">
        <p>💡 টিপ: এনার্জি ০ হলে মাইনিং বন্ধ হয়। বুস্ট দিতে ভিডিও অ্যাড দেখুন।</p>
      </footer>
    </div>
  );
}


// "use client";
// import { useState, useEffect } from "react";

// export default function Dashboard() {
//   // Core Local Storage Connected States
//   const [minedCoins, setMinedCoins] = useState(0.0000);
//   const [isMining, setIsMining] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(0); 
//   const [hashPower, setHashPower] = useState(100); // 100 Gh/s base speed
//   const [claimReady, setClaimReady] = useState(false);

//   const COIN_PER_SECOND_MULTIPLIER = hashPower / 50000; // Secure mining generation formula
//   const TOTAL_SESSION_TIME = 24 * 60 * 60; // 24 Hours in seconds

//   // 1. Initial Handshake: Load States securely from localStorage
//   useEffect(() => {
//     const savedIsMining = localStorage.getItem("miner_active") === "true";
//     const savedCoins = parseFloat(localStorage.getItem("miner_coins") || "0");
//     const savedEndTime = parseInt(localStorage.getItem("miner_end_time") || "0");

//     if (savedIsMining && savedEndTime > 0) {
//       const currentTime = Math.floor(Date.now() / 1000);
//       const remaining = savedEndTime - currentTime;

//       if (remaining > 0) {
//         // User returned while session is still active -> Recalculate offline coins!
//         const elapsedSeconds = TOTAL_SESSION_TIME - remaining;
//         const offlineEarned = elapsedSeconds * COIN_PER_SECOND_MULTIPLIER;
        
//         setIsMining(true);
//         setTimeLeft(remaining);
//         setMinedCoins(offlineEarned);
//       } else {
//         // Session finished while user was away
//         setIsMining(false);
//         setTimeLeft(0);
//         setMinedCoins(TOTAL_SESSION_TIME * COIN_PER_SECOND_MULTIPLIER);
//         setClaimReady(true);
//       }
//     } else {
//       setMinedCoins(savedCoins);
//     }
//   }, []);

//   // 2. Real-time Ticker Engine
//   useEffect(() => {
//     let ticker = null;
//     if (isMining && timeLeft > 0) {
//       ticker = setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1) {
//             clearInterval(ticker);
//             setIsMining(false);
//             setClaimReady(true);
//             return 0;
//           }
//           return prev - 1;
//         });

//         setMinedCoins((prevCoins) => {
//           const nextCoins = prevCoins + COIN_PER_SECOND_MULTIPLIER;
//           localStorage.setItem("miner_coins", nextCoins.toFixed(4));
//           return nextCoins;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(ticker);
//   }, [isMining, timeLeft]);

//   // 3. Trigger Mining Loop Execution
//   const startMiningHandler = () => {
//     const currentTime = Math.floor(Date.now() / 1000);
//     const targetEndTime = currentTime + TOTAL_SESSION_TIME;

//     localStorage.setItem("miner_active", "true");
//     localStorage.setItem("miner_end_time", targetEndTime.toString());
//     localStorage.setItem("miner_coins", "0");

//     setIsMining(true);
//     setTimeLeft(TOTAL_SESSION_TIME);
//     setMinedCoins(0.0000);
//     setClaimReady(false);
//   };

//   // 4. Secure Claim Event Handler (Will be hooked with Database API in the next step)
//   const claimCoinsToDatabase = async () => {
//     alert(`🎉 Successfully added ${minedCoins.toFixed(4)} Coins to your permanent Central Database Wallet!`);
    
//     // Clear local cache variables safely
//     localStorage.removeItem("miner_active");
//     localStorage.removeItem("miner_end_time");
//     localStorage.setItem("miner_coins", "0");

//     setMinedCoins(0.0000);
//     setClaimReady(false);
//     setTimeLeft(0);
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
//     const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${h}:${m}:${s}`;
//   };

//   // Calculate standard percentage progress width for visual aesthetic
//   const progressPercentage = ((TOTAL_SESSION_TIME - timeLeft) / TOTAL_SESSION_TIME) * 100;

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-6">
      
//       {/* Overview Stat Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
//         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
//           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Local Session Vault</p>
//           <h2 className="text-3xl font-black text-yellow-400 font-mono">
//             ★ {minedCoins.toFixed(4)} <span className="text-xs font-normal text-slate-500">Coins</span>
//           </h2>
//           <div className="absolute right-4 bottom-3 text-3xl opacity-[0.03]">💎</div>
//         </div>

//         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
//           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Hash Allocation</p>
//           <h2 className="text-3xl font-black text-blue-400 font-mono">
//             {hashPower} <span className="text-xs font-normal text-slate-500">Gh/s Matrix</span>
//           </h2>
//           <div className="absolute right-4 bottom-3 text-3xl opacity-[0.03]">⚡</div>
//         </div>
//       </div>

//       {/* Main Mining Rig Console Frame */}
//       <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-xl mx-auto shadow-2xl relative">
        
//         {/* Core Node Pulse Circular Animation */}
//         <div className="relative mb-8">
//           {isMining && (
//             <div className="absolute inset-0 rounded-full bg-yellow-500/10 blur-2xl animate-pulse scale-125"></div>
//           )}
//           <button
//             onClick={startMiningHandler}
//             disabled={isMining || claimReady}
//             className={`w-48 h-48 rounded-full font-black tracking-wide text-xs uppercase border-4 flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
//               isMining
//                 ? "bg-slate-950 border-yellow-500 text-yellow-500 cursor-not-allowed"
//                 : claimReady
//                 ? "bg-slate-950 border-emerald-500 text-emerald-400 cursor-not-allowed"
//                 : "bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-300 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20"
//             }`}
//           >
//             {isMining ? (
//               <>
//                 <span className="text-slate-500 mb-1 tracking-widest text-[10px]">Processing</span>
//                 <span className="text-xl animate-spin">⚙️</span>
//               </>
//             ) : claimReady ? (
//               <>
//                 <span className="text-emerald-400 font-bold mb-1">Session</span>
//                 <span>Complete ✓</span>
//               </>
//             ) : (
//               "Initialize Node"
//             )}
//           </button>
//         </div>

//         {/* Dynamic Status Display & Progressive Sliders */}
//         <div className="w-full text-center">
//           {isMining ? (
//             <div className="w-full space-y-4">
//               <div>
//                 <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Time to Core Expiration</p>
//                 <p className="text-3xl font-mono font-black text-yellow-400 tracking-widest">{formatTime(timeLeft)}</p>
//               </div>
              
//               {/* Animated Progress Bar */}
//               <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
//                 <div 
//                   className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all duration-1000"
//                   style={{ width: `${progressPercentage}%` }}
//                 ></div>
//               </div>
//             </div>
//           ) : claimReady ? (
//             <div className="space-y-3">
//               <p className="text-sm text-emerald-400 font-medium animate-pulse">⚡ Mining Cycle Completed Successfully!</p>
//               <button
//                 onClick={claimCoinsToDatabase}
//                 className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:opacity-95 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
//               >
//                 Sync & Claim Coins
//               </button>
//             </div>
//           ) : (
//             <p className="text-slate-400 text-sm tracking-wide bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
//               🚀 Cloud rig is currently idle. Initialize terminal to inject data packets.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }