"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateMiningWallet, updateTotalAndMiningWallet, collectMiningRewards, setCoinAnimation, fetchWalletData } from "@/app/store/walletSlice";

export default function AppContainer() {
  const dispatch = useDispatch();
  
  // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে লাইভ ডাটা রিড
  const dbMiningWallet = useSelector((state) => state.wallet.dbMiningWallet);
  const miningSpeed = useSelector((state) => state.wallet.miningSpeed || 1.5); 

  // 🔒 লোকালস্টোরেজ সেফ কাউন্টার স্টেট
  const [coins, setCoins] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("d_current_mining_coins");
      return saved ? parseFloat(saved) : 12.56000000;
    }
    return 12.56000000;
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("d_mining_time_left");
      const lastSavedTimestamp = localStorage.getItem("d_last_saved_timestamp");

      if (savedTime && lastSavedTimestamp) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSavedTimestamp)) / 1000);
        const remainingTime = parseInt(savedTime) - elapsedSeconds;
        return remainingTime > 0 ? remainingTime : 43200;
      }
      return 31665;
    }
    return 31665;
  });

  const [isMining, setIsMining] = useState(true);
  const [isHybridMode, setIsHybridMode] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // 🪙 অ্যানিমেশনের জন্য আলাদা আলাদা পার্টিকল স্টেট
  const [collectParticles, setCollectParticles] = useState([]);
  const [syncParticles, setSyncParticles] = useState([]);

  const centralRingRef = useRef(null);
  const miningWalletRef = useRef(null); // Mining Wallet কার্ডের রেফারেন্স
  const maxCoinTarget = 100;

  // 📡 সেফটি গার্ড লুপ
  useEffect(() => {
    dispatch(fetchWalletData());
  }, [dispatch]);

  // ==========================================
  // 📥 ACTION 1: CLAIM REWARDS (Live Counter -> Mining Wallet)
  // ==========================================
  const handleCollectRewards = async () => {
    if (coins <= 0 || loadingAction) return;

    if (centralRingRef.current && miningWalletRef.current) {
      const startRect = centralRingRef.current.getBoundingClientRect();
      const endRect = miningWalletRef.current.getBoundingClientRect();

      const centerX = startRect.left + startRect.width / 2;
      const centerY = startRect.top + startRect.height / 2;

      // 🪙 লাইভ কাউন্টার থেকে Mining Wallet-এর দিকে যাওয়ার পার্টিকল জেনারেট
      const particles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        startX: centerX + (Math.random() * 30 - 15),
        startY: centerY + (Math.random() * 30 - 15),
        endX: endRect.left + endRect.width / 2,
        endY: endRect.top + endRect.height / 2,
        delay: i * 80,
      }));

      setCollectParticles(particles);

      setTimeout(async () => {
        try {
          setLoadingAction(true);
          const currentCoinsToCollect = coins;

          const res = await fetch("/api/dashboard/sync-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: currentCoinsToCollect, action: "COLLECT" })
          });
          const json = await res.json();

          if (json.success) {
            dispatch(collectMiningRewards({
              newTotalCoin: json.newTotalCoin,
              newMiningWallet: json.newMiningWallet
            }));

            // ❌ আপনার রিকোয়ারমেন্ট অনুযায়ী: এখানে টপবার অ্যানিমেশন ট্রিগার করা হবে না (False)
            dispatch(setCoinAnimation(false)); 

            setCoins(0.00000000);
            localStorage.setItem("d_current_mining_coins", "0.00000000");
          }
        } catch (err) {
          console.error("Collection error:", err);
        } finally {
          setCollectParticles([]);
          setLoadingAction(false);
        }
      }, 1000);
    }
  };

  // ==========================================
  // 🔄 ACTION 2: SYNC TO VAULT (Mining Wallet -> Topbar Total Coin)
  // ==========================================
  const handleSyncToCentralVault = async () => {
    if (dbMiningWallet <= 0 || loadingAction) return;

    if (miningWalletRef.current) {
      const startRect = miningWalletRef.current.getBoundingClientRect();

      // 🪙 Mining Wallet থেকে স্ক্রিনের উপরের দিকে (Topbar) উড়ে যাওয়ার পার্টিকল জেনারেট
      const particles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        startX: startRect.left + startRect.width / 2 + (Math.random() * 40 - 20),
        startY: startRect.top + startRect.height / 2,
        delay: i * 80,
      }));

      setSyncParticles(particles);

      setTimeout(async () => {
        try {
          setLoadingAction(true);
          const res = await fetch("/api/dashboard/sync-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "SYNC" })
          });
          const json = await res.json();

          if (json.success) {
            dispatch(updateTotalAndMiningWallet({
              newTotalCoin: json.newTotalCoin,
              newMiningWallet: json.newMiningWallet
            }));

            // 🔥 টপবার কয়েন গ্লোবাল অ্যানিমেশন ট্র্রিগার করা হলো (True)
            dispatch(setCoinAnimation(true));

            setTimeout(() => {
              dispatch(setCoinAnimation(false));
            }, 1000);
          }
        } catch (err) {
          console.error("Sync error:", err);
        } finally {
          setSyncParticles([]);
          setLoadingAction(false);
        }
      }, 1000);
    }
  };

  // ⚡ সুপার ফাস্ট কাউন্টার জেনারেশন লুপ
  useEffect(() => {
    let interval = null;
    if (isMining && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const timeTick = isBoostActive ? 0.2 : 0.1;
          const updatedTime = prevTime - timeTick;
          localStorage.setItem("d_mining_time_left", Math.max(0, Math.floor(updatedTime)).toString());
          return updatedTime > 0 ? updatedTime : 43200;
        });

        let currentBaseSpeed = (miningSpeed / 48000); 
        
        let multiplier = 1.0;
        if (isHybridMode && isBoostActive) multiplier = 3.0;
        else if (isBoostActive) multiplier = 2.0;
        else if (isHybridMode) multiplier = 1.5;

        const baseRate = currentBaseSpeed * multiplier;

        setCoins((prevCoins) => {
          const newCoins = parseFloat((prevCoins + baseRate).toFixed(8));
          localStorage.setItem("d_current_mining_coins", newCoins.toFixed(8));
          return newCoins;
        });

        localStorage.setItem("d_last_saved_timestamp", Date.now().toString());
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isMining, isHybridMode, isBoostActive, timeLeft, miningSpeed]);

  const formatMiningTime = (totalSeconds) => {
    const secondsInt = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(secondsInt / 3600);
    const mins = Math.floor((secondsInt % 3600) / 60);
    const secs = secondsInt % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const getCurrentSpeedLabel = () => {
    let factor = 1.0;
    if (isHybridMode && isBoostActive) factor = 3.0;
    else if (isBoostActive) factor = 2.0;
    else if (isHybridMode) factor = 1.5;
    
    const absoluteSpeed = (miningSpeed * factor).toFixed(1);
    return `⚡ ${absoluteSpeed}X /sec`;
  };

  const progressPercentage = Math.min((coins / maxCoinTarget) * 100, 100);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn select-none relative overflow-hidden p-3 bg-[#060907] text-white space-y-3">
      
      {/* ⛏️ গ্লোবাল লাইভ মাইনিং ওয়ালেট ডিসপ্লে (Ref যোগ করা হয়েছে) */}
      <div 
        ref={miningWalletRef}
        className="w-full bg-[#0b120d]/80 border border-lime-950/40 p-2.5 rounded-xl flex justify-between items-center shadow-inner relative overflow-hidden"
      >
        <div className="truncate pr-2">
          <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">Mining Wallet</span>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-xs mt-0.5 truncate">
            ⛏️ <span>{dbMiningWallet.toFixed(8)}</span> <span className="text-[10px] text-zinc-500 font-sans font-bold">D</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSyncToCentralVault}
            disabled={dbMiningWallet <= 0 || loadingAction}
            className={`px-2 py-1.5 rounded-lg text-black font-black text-[10px] uppercase transition-all active:scale-95 ${
              dbMiningWallet <= 0 ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
          >
            {loadingAction ? "..." : "Sync"}
          </button>
        </div>
      </div>

      {/* সাব-অ্যাকশন কন্ট্রোল পিলস */}
      <div className="flex justify-between items-center w-full gap-2">
        <button 
          onClick={() => setIsHybridMode(!isHybridMode)}
          className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
            isHybridMode 
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-orange-400" 
              : "bg-[#121b15] text-zinc-400 border-lime-950/40"
          }`}
        >
          🧬 <span className="tracking-wide">{isHybridMode ? `Hybrid: ${(miningSpeed * 1.5).toFixed(1)}X` : "Hybrid"}</span>
        </button>
        
        <button 
          onClick={() => setIsBoostActive(!isBoostActive)}
          className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
            isBoostActive 
              ? "bg-cyan-500 text-black border-cyan-400 animate-pulse" 
              : "bg-[#121b15] text-lime-400 border border-lime-500/10"
          }`}
        >
          🚀 <span className="tracking-wide">{isBoostActive ? "Boost: 2X Active" : "Boost"}</span>
        </button>
      </div>

      {/* সেন্ট্রাল গ্লোয়িং নিয়ন লুপ */}
      <div ref={centralRingRef} className="relative flex justify-center items-center py-2 w-full my-1">
        <div className={`absolute h-40 w-40 rounded-full blur-2xl animate-pulse transition-colors ${
          isBoostActive ? "bg-cyan-500/[0.05]" : isHybridMode ? "bg-orange-500/[0.04]" : "bg-lime-500/[0.02]"
        }`}></div>
        
        <div className={`absolute h-32 w-32 rounded-full border border-dashed flex items-center justify-center transition-all ${
          isBoostActive 
            ? "border-cyan-500/20 animate-[spin_12s_linear_infinite]" 
            : isHybridMode ? "border-orange-500/15 animate-[spin_35s_linear_infinite]" : "border-lime-500/10 animate-[spin_60s_linear_infinite]"
        }`}>
          <div className={`h-28 w-28 rounded-full border ${isBoostActive ? "border-cyan-500/5" : isHybridMode ? "border-orange-500/5" : "border-lime-500/5"}`}></div>
        </div>

        <div className={`h-[104px] w-[104px] rounded-full border-[4px] bg-[#060907] flex items-center justify-center shadow-[inset_0_0_10px_rgba(132,204,22,0.05)] transition-all duration-300 ${
          isBoostActive
            ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            : isHybridMode 
              ? "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
              : "border-lime-500/90 shadow-[0_0_20px_rgba(132,204,22,0.1)]"
        }`}>
          
          {isHybridMode ? (
            <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
              <span className="text-2xl animate-bounce filter drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]">🏃</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-orange-400 mt-0.5">Tracking</span>
            </div>
          ) : (
            <span className={`text-3xl font-black tracking-tighter font-sans transition-colors ${
              isBoostActive ? "text-cyan-400 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" : "text-lime-400 filter drop-shadow-[0_0_6px_rgba(132,204,22,0.5)]"
            }`}>
              D
            </span>
          )}
        </div>
      </div>

      {/* লাইভ কাউন্টিং এরিয়া */}
      <div className="text-center w-full">
        <h2 className="text-2xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
          {coins.toFixed(8)} 
          <span className={`text-[8px] font-sans font-black px-1 py-0.5 rounded border shadow-inner tracking-wider ${
            isBoostActive && isHybridMode
              ? "text-orange-400 bg-orange-500/10 border-orange-500/30 animate-pulse"
              : isBoostActive 
                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 animate-pulse" 
                : isHybridMode
                  ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                  : "text-lime-400 bg-lime-500/10 border-lime-500/20"
          }`}>
            {isBoostActive && isHybridMode ? "3X" : isBoostActive ? "2X" : isHybridMode ? "HYB" : "D"}
          </span>
        </h2>
        
        <div className="flex justify-center items-center gap-2 text-[9px] font-mono font-bold text-zinc-500 mt-0.5">
          <p>{isBoostActive ? "⚡ Fast" : "⏱️"} {formatMiningTime(timeLeft)}</p>
          <span className="text-zinc-700">|</span>
          <p className="text-lime-400 font-sans font-black">{getCurrentSpeedLabel()}</p>
        </div>
      </div>

      {/* প্রোগ্রেস বার ও মেইন ক্লেইম বাটন */}
      <div className="w-full space-y-2 pt-1">
        <div className="w-full bg-[#0d1410] border border-lime-950/40 h-1.5 rounded-full p-[1px] overflow-hidden shadow-inner relative">
          <div 
            className={`h-full rounded-full transition-all duration-100 ${
              isBoostActive 
                ? "bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.4)]" 
                : "bg-gradient-to-r from-lime-600 via-lime-400 to-lime-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <button 
          onClick={handleCollectRewards}
          disabled={coins <= 0 || loadingAction}
          className={`w-full py-2.5 text-black font-black text-[11px] tracking-widest rounded-xl uppercase transition-all duration-200 active:scale-[0.99] border-t ${
            coins <= 0 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-900 shadow-none" 
              : isBoostActive 
                ? "bg-gradient-to-r from-cyan-400 to-cyan-500 border-cyan-200/20" 
                : "bg-gradient-to-r from-lime-400 to-lime-500 border-lime-300/20"
          }`}
        >
          {isBoostActive ? "Claim Boosted Rewards" : "Claim Rewards"}
        </button>
      </div>

      {/* 📥 🪙 ১. COLLECT ANIMATION: কাউন্টার থেকে উড়ে Mining Wallet-এ যাবে */}
      {collectParticles.map((p) => (
        <span
          key={p.id}
          className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] select-none animate-collectFly"
          style={{
            "--start-x": `${p.startX}px`,
            "--start-y": `${p.startY}px`,
            "--end-x": `${p.endX}px`,
            "--end-y": `${p.endY}px`,
            animationDelay: `${p.delay}ms`,
            animationFillMode: "forwards",
          }}
        >
          🪙
        </span>
      ))}

      {/* 🔄 🪙 ২. SYNC ANIMATION: Mining Wallet থেকে উড়ে সোজা Topbar-এ যাবে */}
      {syncParticles.map((p) => (
        <span
          key={p.id}
          className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_4px_rgba(163,230,53,0.8)] select-none animate-syncFly"
          style={{
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            animationDelay: `${p.delay}ms`,
            animationFillMode: "forwards",
          }}
        >
          🪙
        </span>
      ))}

      {/* 📈 সিঙ্কড সিএসএস কীফ্রেম ও অ্যানিমেশন কন্ট্রোল */}
      <style jsx global>{`
        @keyframes collectFly {
          0% { left: var(--start-x); top: var(--start-y); transform: scale(1); opacity: 1; }
          100% { left: var(--end-x); top: var(--end-y); transform: scale(0.5); opacity: 0.2; }
        }
        @keyframes syncFly {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-40px) scale(1.1); opacity: 0.8; }
          100% { left: 50%; top: 15px; transform: scale(0.2); opacity: 0; }
        }
        .animate-collectFly { animation: collectFly 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
        .animate-syncFly { animation: syncFly 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      `}</style>

    </div>
  );  
}

// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { updateMiningWallet, updateTotalAndMiningWallet, collectMiningRewards, setCoinAnimation, fetchWalletData } from "@/app/store/walletSlice";

// export default function AppContainer() {
//   const dispatch = useDispatch();
  
//   // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে লাইভ ডাটা রিড
//   const dbMiningWallet = useSelector((state) => state.wallet.dbMiningWallet);
//   const miningSpeed = useSelector((state) => state.wallet.miningSpeed || 1.5); // ডাটাবেজ থেকে লাইভ স্পিড রিড

//   // 🔒 লোকালস্টোরেজ সেফ ৮-ডিজিট কাউন্টার স্টেট
//   const [coins, setCoins] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("d_current_mining_coins");
//       return saved ? parseFloat(saved) : 12.56000000;
//     }
//     return 12.56000000;
//   });
  
//   const [timeLeft, setTimeLeft] = useState(() => {
//     if (typeof window !== "undefined") {
//       const savedTime = localStorage.getItem("d_mining_time_left");
//       const lastSavedTimestamp = localStorage.getItem("d_last_saved_timestamp");

//       if (savedTime && lastSavedTimestamp) {
//         const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSavedTimestamp)) / 1000);
//         const remainingTime = parseInt(savedTime) - elapsedSeconds;
//         return remainingTime > 0 ? remainingTime : 43200;
//       }
//       return 31665;
//     }
//     return 31665;
//   });

//   const [isMining, setIsMining] = useState(true);
//   const [isHybridMode, setIsHybridMode] = useState(false);
//   const [isBoostActive, setIsBoostActive] = useState(false);
//   const [loadingAction, setLoadingAction] = useState(false);
//   const [claimParticles, setClaimParticles] = useState([]);
//   const centralRingRef = useRef(null);
//   const maxCoinTarget = 100;

//   // 📡 সেফটি গার্ড লুপ: পেজ ডিরেক্ট রিলোড দিলে যদি রিডাক্স স্টোর ফাকা থাকে, তবে ডাটা রি-পুল করবে
//   useEffect(() => {
//     dispatch(fetchWalletData());
//   }, [dispatch]);

//   // COLLECT: লাইভ কয়েন ডাটাবেজে পাঠানো এবং রিডাক্স স্টোরে সিঙ্ক করা
//   const handleCollectRewards = async () => {
//     if (coins <= 0 || loadingAction) return;

//     if (centralRingRef.current) {
//       const rect = centralRingRef.current.getBoundingClientRect();
//       const centerX = rect.left + rect.width / 2;
//       const centerY = rect.top + rect.height / 2;

//       const particles = Array.from({ length: 5 }).map((_, i) => ({
//         id: Date.now() + i,
//         x: centerX + (Math.random() * 30 - 15),
//         y: centerY + (Math.random() * 30 - 15),
//         delay: i * 80,
//       }));

//       setClaimParticles(particles);

//       setTimeout(async () => {
//         try {
//           setLoadingAction(true);
//           const currentCoinsToCollect = coins;

//           const res = await fetch("/api/dashboard/sync-wallet", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ amount: currentCoinsToCollect, action: "COLLECT" })
//           });
//           const json = await res.json();

//           if (json.success) {
//             // ⚡ রিডাক্স গ্লোবাল স্টোরে টপবার এবং মাইনিং ওয়ালেট একসাথে ডাটা সিঙ্ক
//             dispatch(collectMiningRewards({
//               newTotalCoin: json.newTotalCoin,
//               newMiningWallet: json.newMiningWallet
//             }));

//             // 🪙 টপবার এনিমেশন স্টেট ট্র্রিগার করা হলো
//             dispatch(setCoinAnimation(true));

//             setCoins(0.00000000);
//             localStorage.setItem("d_current_mining_coins", "0.00000000");

//             // ১ সেকেন্ড পর অ্যানিমেশন স্টেট রিসেট হবে স্মুথলি
//             setTimeout(() => {
//               dispatch(setCoinAnimation(false));
//             }, 1000);
//           }
//         } catch (err) {
//           console.error("Collection error:", err);
//         } finally {
//           setClaimParticles([]);
//           setLoadingAction(false);
//         }
//       }, 1200);
//     }
//   };

//   const handleSyncToCentralVault = async () => {
//     if (dbMiningWallet <= 0 || loadingAction) return;
//     try {
//       setLoadingAction(true);
//       const res = await fetch("/api/dashboard/sync-wallet", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "SYNC" })
//       });
//       const json = await res.json();

//       if (json.success) {
//         // ⚡ টপবার আপডেট এবং মাইনিং ওয়ালেট সিঙ্ক করে ব্যালেন্স রিডাক্সে ০ করার লজিক
//         dispatch(updateTotalAndMiningWallet({
//           newTotalCoin: json.newTotalCoin,
//           newMiningWallet: json.newMiningWallet
//         }));
//       }
//     } catch (err) {
//       console.error("Sync error:", err);
//     } finally {
//       setLoadingAction(false);
//     }
//   };

//   // ⚡ সুপার ফাস্ট কাউন্টার জেনারেশন লুপ (ডাটাবেজের miningSpeed এর সাথে কানেক্টেড)
//   useEffect(() => {
//     let interval = null;
//     if (isMining && timeLeft > 0) {
//       interval = setInterval(() => {
//         setTimeLeft((prevTime) => {
//           const timeTick = isBoostActive ? 0.2 : 0.1;
//           const updatedTime = prevTime - timeTick;
//           localStorage.setItem("d_mining_time_left", Math.max(0, Math.floor(updatedTime)).toString());
//           return updatedTime > 0 ? updatedTime : 43200;
//         });

//         // 🎯 ডাটাবেজ থেকে পাওয়া লাইভ miningSpeed-কে বেস রেট (যেমন: ১.৫ স্পিডের জন্য প্রতি টিকে কয়েন জেনারেশন) হিসেবে কনভার্ট করা হলো
//         let currentBaseSpeed = (miningSpeed / 48000); 
        
//         let multiplier = 1.0;
//         if (isHybridMode && isBoostActive) multiplier = 3.0;
//         else if (isBoostActive) multiplier = 2.0;
//         else if (isHybridMode) multiplier = 1.5;

//         const baseRate = currentBaseSpeed * multiplier;

//         setCoins((prevCoins) => {
//           const newCoins = parseFloat((prevCoins + baseRate).toFixed(8));
//           localStorage.setItem("d_current_mining_coins", newCoins.toFixed(8));
//           return newCoins;
//         });

//         localStorage.setItem("d_last_saved_timestamp", Date.now().toString());
//       }, 100); 
//     }
//     return () => clearInterval(interval);
//   }, [isMining, isHybridMode, isBoostActive, timeLeft, miningSpeed]);

//   const formatMiningTime = (totalSeconds) => {
//     const secondsInt = Math.max(0, Math.floor(totalSeconds));
//     const hrs = Math.floor(secondsInt / 3600);
//     const mins = Math.floor((secondsInt % 3600) / 60);
//     const secs = secondsInt % 60;
//     return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
//   };

//   // ⚡ ডাটাবেজের রিয়েল মাইনিং স্পিডের সাথে মিল রেখে লেবেল জেনারেশন
//   const getCurrentSpeedLabel = () => {
//     let factor = 1.0;
//     if (isHybridMode && isBoostActive) factor = 3.0;
//     else if (isBoostActive) factor = 2.0;
//     else if (isHybridMode) factor = 1.5;
    
//     const absoluteSpeed = (miningSpeed * factor).toFixed(1);
//     return `⚡ ${absoluteSpeed}X /sec`;
//   };

//   const progressPercentage = Math.min((coins / maxCoinTarget) * 100, 100);

//   return (
//     <div className="w-full flex flex-col items-center animate-fadeIn select-none relative overflow-hidden p-3 bg-[#060907] text-white space-y-3">
      
//       {/* ⛏️ গ্লোবাল লাইভ মাইনিং ওয়ালেট ডিসপ্লে */}
//       <div className="w-full bg-[#0b120d]/80 border border-lime-950/40 p-2.5 rounded-xl flex justify-between items-center shadow-inner relative overflow-hidden">
//         <div className="truncate pr-2">
//           <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">Mining Wallet</span>
//           <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-xs mt-0.5 truncate">
//             ⛏️ <span>{dbMiningWallet.toFixed(8)}</span> <span className="text-[10px] text-zinc-500 font-sans font-bold">D</span>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-1 shrink-0">
//           <button
//             onClick={handleSyncToCentralVault}
//             disabled={dbMiningWallet <= 0 || loadingAction}
//             className={`px-2 py-1.5 rounded-lg text-black font-black text-[10px] uppercase transition-all active:scale-95 ${
//               dbMiningWallet <= 0 ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500"
//             }`}
//           >
//             {loadingAction ? "..." : "Sync"}
//           </button>
//         </div>
//       </div>

//       {/* সাব-অ্যাকশন কন্ট্রোল পিলস */}
//       <div className="flex justify-between items-center w-full gap-2">
//         <button 
//           onClick={() => setIsHybridMode(!isHybridMode)}
//           className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
//             isHybridMode 
//               ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-orange-400" 
//               : "bg-[#121b15] text-zinc-400 border-lime-950/40"
//           }`}
//         >
//           🧬 <span className="tracking-wide">{isHybridMode ? `Hybrid: ${(miningSpeed * 1.5).toFixed(1)}X` : "Hybrid"}</span>
//         </button>
        
//         <button 
//           onClick={() => setIsBoostActive(!isBoostActive)}
//           className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
//             isBoostActive 
//               ? "bg-cyan-500 text-black border-cyan-400 animate-pulse" 
//               : "bg-[#121b15] text-lime-400 border border-lime-500/10"
//           }`}
//         >
//           🚀 <span className="tracking-wide">{isBoostActive ? "Boost: 2X Active" : "Boost"}</span>
//         </button>
//       </div>

//       {/* সেন্ট্রাল গ্লোয়িং নিয়ন লুপ */}
//       <div ref={centralRingRef} className="relative flex justify-center items-center py-2 w-full my-1">
//         <div className={`absolute h-40 w-40 rounded-full blur-2xl animate-pulse transition-colors ${
//           isBoostActive ? "bg-cyan-500/[0.05]" : isHybridMode ? "bg-orange-500/[0.04]" : "bg-lime-500/[0.02]"
//         }`}></div>
        
//         <div className={`absolute h-32 w-32 rounded-full border border-dashed flex items-center justify-center transition-all ${
//           isBoostActive 
//             ? "border-cyan-500/20 animate-[spin_12s_linear_infinite]" 
//             : isHybridMode ? "border-orange-500/15 animate-[spin_35s_linear_infinite]" : "border-lime-500/10 animate-[spin_60s_linear_infinite]"
//         }`}>
//           <div className={`h-28 w-28 rounded-full border ${isBoostActive ? "border-cyan-500/5" : isHybridMode ? "border-orange-500/5" : "border-lime-500/5"}`}></div>
//         </div>

//         <div className={`h-[104px] w-[104px] rounded-full border-[4px] bg-[#060907] flex items-center justify-center shadow-[inset_0_0_10px_rgba(132,204,22,0.05)] transition-all duration-300 ${
//           isBoostActive
//             ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
//             : isHybridMode 
//               ? "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
//               : "border-lime-500/90 shadow-[0_0_20px_rgba(132,204,22,0.1)]"
//         }`}>
          
//           {isHybridMode ? (
//             <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
//               <span className="text-2xl animate-bounce filter drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]">🏃</span>
//               <span className="text-[7px] font-black uppercase tracking-widest text-orange-400 mt-0.5">Tracking</span>
//             </div>
//           ) : (
//             <span className={`text-3xl font-black tracking-tighter font-sans transition-colors ${
//               isBoostActive ? "text-cyan-400 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" : "text-lime-400 filter drop-shadow-[0_0_6px_rgba(132,204,22,0.5)]"
//             }`}>
//               D
//             </span>
//           )}
//         </div>
//       </div>

//       {/* লাইভ কাউন্টিং এরিয়া */}
//       <div className="text-center w-full">
//         <h2 className="text-2xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
//           {coins.toFixed(8)} 
//           <span className={`text-[8px] font-sans font-black px-1 py-0.5 rounded border shadow-inner tracking-wider ${
//             isBoostActive && isHybridMode
//               ? "text-orange-400 bg-orange-500/10 border-orange-500/30 animate-pulse"
//               : isBoostActive 
//                 ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 animate-pulse" 
//                 : isHybridMode
//                   ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
//                   : "text-lime-400 bg-lime-500/10 border-lime-500/20"
//           }`}>
//             {isBoostActive && isHybridMode ? "3X" : isBoostActive ? "2X" : isHybridMode ? "HYB" : "D"}
//           </span>
//         </h2>
        
//         <div className="flex justify-center items-center gap-2 text-[9px] font-mono font-bold text-zinc-500 mt-0.5">
//           <p>{isBoostActive ? "⚡ Fast" : "⏱️"} {formatMiningTime(timeLeft)}</p>
//           <span className="text-zinc-700">|</span>
//           <p className="text-lime-400 font-sans font-black">{getCurrentSpeedLabel()}</p>
//         </div>
//       </div>

//       {/* প্রোগ্রেস বার ও মেইন ক্লেইম বাটন */}
//       <div className="w-full space-y-2 pt-1">
//         <div className="w-full bg-[#0d1410] border border-lime-950/40 h-1.5 rounded-full p-[1px] overflow-hidden shadow-inner relative">
//           <div 
//             className={`h-full rounded-full transition-all duration-100 ${
//               isBoostActive 
//                 ? "bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.4)]" 
//                 : "bg-gradient-to-r from-lime-600 via-lime-400 to-lime-500"
//             }`}
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
        
//         <button 
//           onClick={handleCollectRewards}
//           disabled={coins <= 0 || loadingAction}
//           className={`w-full py-2.5 text-black font-black text-[11px] tracking-widest rounded-xl uppercase transition-all duration-200 active:scale-[0.99] border-t ${
//             coins <= 0 
//               ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-900 shadow-none" 
//               : isBoostActive 
//                 ? "bg-gradient-to-r from-cyan-400 to-cyan-500 border-cyan-200/20" 
//                 : "bg-gradient-to-r from-lime-400 to-lime-500 border-lime-300/20"
//           }`}
//         >
//           {isBoostActive ? "Claim Boosted Rewards" : "Claim Rewards"}
//         </button>
//       </div>

//       {/* 🪙 ফ্লাইং কয়েন অ্যানিমেশন OVERLAY */}
//       {claimParticles.map((particle) => (
//         <span
//           key={particle.id}
//           className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_4px_rgba(163,230,53,0.8)] select-none animate-claimFly"
//           style={{
//             left: `${particle.x}px`,
//             top: `${particle.y}px`,
//             animationDelay: `${particle.delay}ms`,
//             animationFillMode: "forwards",
//           }}
//         >
//           🪙
//         </span>
//       ))}

//       <style jsx global>{`
//         @keyframes claimFly {
//           0% { transform: translateY(0) scale(1); opacity: 1; }
//           50% { transform: translateY(-50px) scale(1.1); opacity: 0.8; }
//           100% { left: 50%; top: 20px; transform: scale(0.3); opacity: 0; }
//         }
//         .animate-claimFly { animation: claimFly 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
//       `}</style>

//     </div>
//   );  
// }