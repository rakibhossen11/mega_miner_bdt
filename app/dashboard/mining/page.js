"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchWalletData,
  claimMiningRewards,
  syncToVault,
  setCoinAnimation,
  collectMiningRewards,
  updateMiningWallet
} from "@/app/store/walletSlice";
import AdsterraBanner from "@/app/components/AdsterraBanner";

export default function AppContainer() {
  const dispatch = useDispatch();
  
  // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে ডাটা রিড
  const { 
    dbMiningWallet, 
    totalCoin, 
    miningSpeed, 
    loading, 
    isCoinAnimating
  } = useSelector((state) => state.wallet);

  // 🔒 লোকালস্টোরেজ সেফ লাইভ কাউন্টার স্টেট (পেজ রিলোড দিলেও মুছবে না)
  const [coins, setCoins] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("d_current_mining_coins");
      return saved ? parseFloat(saved) : 0.00000000;
    }
    return 0.00000000;
  });

  const [isMining] = useState(true);
  const [isHybridMode, setIsHybridMode] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // 🪙 অ্যানিমেশন পার্টিকল স্টেট
  const [collectParticles, setCollectParticles] = useState([]);
  const [syncParticles, setSyncParticles] = useState([]);

  const centralRingRef = useRef(null);
  const miningWalletRef = useRef(null);
  const maxCoinTarget = 100; // প্রোগ্রেস বারের ভিজ্যুয়াল ম্যাক্সিমাম লিমিট

  // 📡 প্রথমবার মাউন্ট হওয়ার সময় রিডাক্স ও লোকাল ডাটা অ্যালাইন করা
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTotalCoin = localStorage.getItem("d_total_coin");
      if (savedTotalCoin) {
        const parsedTotal = parseFloat(savedTotalCoin);
        if (!isNaN(parsedTotal) && parsedTotal > 0) {
          dispatch(collectMiningRewards({
            newTotalCoin: parsedTotal,
            newMiningWallet: dbMiningWallet
          }));
        }
      }

      const savedMiningWallet = localStorage.getItem("d_mining_wallet");
      if (savedMiningWallet) {
        const parsedMining = parseFloat(savedMiningWallet);
        if (!isNaN(parsedMining) && parsedMining > 0) {
          dispatch(updateMiningWallet(parsedMining));
        }
      }
    }
    // API থেকে লেটেস্ট ডাটা ডাটাবেজ থেকে নিয়ে আসা
    dispatch(fetchWalletData());
  }, [dispatch]);

  // 📋 রিডাক্স স্টেট চেঞ্জ হলে লোকালস্টোরেজ আপডেট (ব্যাকআপ)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("d_total_coin", totalCoin.toString());
      localStorage.setItem("d_mining_wallet", dbMiningWallet.toString());
    }
  }, [totalCoin, dbMiningWallet]);

  // ⚡ নন-স্টপ আনলিমিটেড মাইনিং লুপ (টাইমার ছাড়া অনবরত চলবে)
  useEffect(() => {
    let interval = null;
    if (isMining) {
      interval = setInterval(() => {
        // স্পিড মাল্টিপ্লায়ার ক্যালকুলেশন
        const currentBaseSpeed = (miningSpeed / 48000); 
        let multiplier = 1.0;
        if (isHybridMode && isBoostActive) multiplier = 3.0;
        else if (isBoostActive) multiplier = 2.0;
        else if (isHybridMode) multiplier = 1.5;

        const baseRate = currentBaseSpeed * multiplier;

        // লাইভ কয়েন বৃদ্ধি এবং লোকালস্টোরেজে ইনস্ট্যান্ট সেভ (রিলোড প্রোটেকশন)
        setCoins((prevCoins) => {
          const newCoins = parseFloat((prevCoins + baseRate).toFixed(8));
          localStorage.setItem("d_current_mining_coins", newCoins.toFixed(8));
          return newCoins;
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isMining, isHybridMode, isBoostActive, miningSpeed]);

  // ==========================================
  // 📥 ACTION 1: CLAIM REWARDS (লাইভ কয়েন যাবে মাইনিং ওয়ালেটে)
  // ==========================================
  const handleCollectRewards = async () => {
    if (coins <= 0 || loadingAction) return;

    if (centralRingRef.current && miningWalletRef.current) {
      const startRect = centralRingRef.current.getBoundingClientRect();
      const endRect = miningWalletRef.current.getBoundingClientRect();

      const centerX = startRect.left + startRect.width / 2;
      const centerY = startRect.top + startRect.height / 2;

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

          // রিডাক্স অ্যাকশন কল - মাইনিং ওয়ালেটে অ্যাড হবে
          const result = await dispatch(claimMiningRewards(currentCoinsToCollect)).unwrap();
          
          if (result.success) {
            setCoins(0.00000000);
            localStorage.setItem("d_current_mining_coins", "0.00000000");

            dispatch(setCoinAnimation(true));
            setTimeout(() => dispatch(setCoinAnimation(false)), 1000);
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
  // 🔄 ACTION 2: SYNC TO VAULT (মাইনিং ওয়ালেট থেকে ডাটাবেজে/Total Coin)
  // ==========================================
  const handleSyncToCentralVault = async () => {
    if (dbMiningWallet <= 0 || loadingAction) return;

    if (miningWalletRef.current) {
      const startRect = miningWalletRef.current.getBoundingClientRect();

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
          // রিডাক্স অ্যাকশন কল - API এর মাধ্যমে ডাটাবেজে সিঙ্ক হবে এবং টোটাল কয়েন আপডেট করবে
          const result = await dispatch(syncToVault()).unwrap();
          
          if (result.success) {
            dispatch(setCoinAnimation(true));
            setTimeout(() => dispatch(setCoinAnimation(false)), 1000);
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

  const getCurrentSpeedLabel = () => {
    let factor = 1.0;
    if (isHybridMode && isBoostActive) factor = 3.0;
    else if (isBoostActive) factor = 2.0;
    else if (isHybridMode) factor = 1.5;
    
    return `⚡ ${(miningSpeed * factor).toFixed(1)}X /sec`;
  };

  const progressPercentage = Math.min((coins / maxCoinTarget) * 100, 100);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn select-none relative overflow-hidden p-3 bg-[#060907] text-white space-y-3">
      
      {/* ⛏️ মাইনিং ওয়ালেট (এখানে ক্লেইম করা কয়েন জমা হয়) */}
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
            disabled={dbMiningWallet <= 0 || loadingAction || loading}
            className={`px-3 py-1.5 rounded-lg text-black font-black text-[10px] uppercase transition-all active:scale-95 ${
              dbMiningWallet <= 0 || loading ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30"
            }`}
          >
            {loading ? "⏳" : loadingAction ? "..." : "Sync to DB"}
          </button>
        </div>
      </div>

      {/* 💰 টোটাল কয়েন (ডাটাবেজ ও মেইন ব্যালেন্স) */}
      <div className={`w-full bg-[#0b120d]/50 border p-2 rounded-lg transition-all duration-300 ${
        isCoinAnimating ? "border-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.3)]" : "border-lime-950/30"
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black tracking-widest text-lime-400 uppercase">Total Coin (Database)</span>
          <span className={`text-sm font-mono font-bold transition-all duration-300 ${
            isCoinAnimating ? "text-lime-400 scale-110" : "text-white"
          }`}>
            {totalCoin.toFixed(8)} D
          </span>
        </div>
      </div>

      {/* মোড কন্ট্রোল */}
      <div className="flex justify-between items-center w-full gap-2">
        <button 
          onClick={() => setIsHybridMode(!isHybridMode)}
          className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
            isHybridMode 
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-orange-400" 
              : "bg-[#121b15] text-zinc-400 border-lime-950/40 hover:border-lime-800/50"
          }`}
        >
          🧬 <span className="tracking-wide">{isHybridMode ? `Hybrid: ${(miningSpeed * 1.5).toFixed(1)}X` : "Hybrid"}</span>
        </button>
        
        <button 
          onClick={() => setIsBoostActive(!isBoostActive)}
          className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 active:scale-98 ${
            isBoostActive 
              ? "bg-cyan-500 text-black border-cyan-400 animate-pulse" 
              : "bg-[#121b15] text-lime-400 border border-lime-500/10 hover:border-lime-500/30"
          }`}
        >
          🚀 <span className="tracking-wide">{isBoostActive ? "Boost: 2X Active" : "Boost"}</span>
        </button>
      </div>

      {/* সেন্ট্রাল রিং */}
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
              <span className="text-[7px] font-black uppercase tracking-widest text-orange-400 mt-0.5">Mining</span>
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

      {/* লাইভ কাউন্টিং */}
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
            LIVE
          </span>
        </h2>
        
        <div className="flex justify-center items-center gap-2 text-[9px] font-mono font-bold text-zinc-500 mt-0.5">
          <p>⛏️ Non-Stop Mining Mode</p>
          <span className="text-zinc-700">|</span>
          <p className="text-lime-400 font-sans font-black">{getCurrentSpeedLabel()}</p>
        </div>
      </div>

      {/* প্রোগ্রেস বার ও ক্লেইম বাটন */}
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
          disabled={coins <= 0 || loadingAction || loading}
          className={`w-full py-2.5 text-black font-black text-[11px] tracking-widest rounded-xl uppercase transition-all duration-200 active:scale-[0.99] border-t ${
            coins <= 0 || loading 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-900 shadow-none" 
              : isBoostActive 
                ? "bg-gradient-to-r from-cyan-400 to-cyan-500 border-cyan-200/20 hover:shadow-lg hover:shadow-cyan-500/30" 
                : "bg-gradient-to-r from-lime-400 to-lime-500 border-lime-300/20 hover:shadow-lg hover:shadow-lime-500/30"
          }`}
        >
          {loading ? "⏳ Processing..." : "💰 Claim to Mining Wallet"}
        </button>
      </div>

      {/* 🪙 পার্টিকল অ্যানিমেশন ফ্লাইং ইফেক্ট */}
      {collectParticles.map((p) => (
        <span
          key={p.id}
          className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] select-none animate-collectFly"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${p.startX}px, ${p.startY}px, 0)`,
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
      
      <AdsterraBanner />

      {/* 🎨 সিএসএস অ্যানিমেশন */}
      <style jsx global>{`
        @keyframes collectFly {
          0% { transform: translate3d(var(--start-x), var(--start-y), 0) scale(1); opacity: 1; }
          100% { transform: translate3d(var(--end-x), var(--end-y), 0) scale(0.5); opacity: 0.2; }
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