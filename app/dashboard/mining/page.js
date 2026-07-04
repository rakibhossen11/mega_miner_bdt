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
import { 
  Cpu, 
  Wallet, 
  Zap, 
  Flame, 
  RefreshCcw, 
  TrendingUp, 
  Info,
  Layers,
  CircleDollarSign
} from "lucide-react"; // 🚀 প্রফেশনাল সাইবার আইকন

export default function AppContainer() {
  const dispatch = useDispatch();
  
  // 🎯 রিডাক্স গ্লোবাল স্টোর থেকে লাইভ ডাটা রিড
  const { 
    dbMiningWallet, 
    totalCoin, 
    miningSpeed, 
    boostPower, // ডাটাবেজ থেকে আসা লাইভ বুস্ট কলাম
    loading, 
    isCoinAnimating
  } = useSelector((state) => state.wallet);

  // 🔒 লোকালস্টোরেজ সেফ লাইভ কাউন্টার স্টেট (রিলোড প্রোটেকশন)
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
  const maxCoinTarget = 10.0; // প্রোগ্রেস বারের ভিজ্যুয়াল লিমিট অপ্টিমাইজড করা হলো

  // 📡 মাউন্ট হওয়ার সময় লোকাল ব্যাকআপ ও গ্লোবাল রিডাক্স সিঙ্ক
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
    dispatch(fetchWalletData());
  }, [dispatch]);

  // 📋 ব্যাকআপ লোকালস্টোরেজ আপডেট
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("d_total_coin", totalCoin.toString());
      localStorage.setItem("d_mining_wallet", dbMiningWallet.toString());
    }
  }, [totalCoin, dbMiningWallet]);

  // ⚡ নন-স্টপ আল্ট্রা মাইনিং লুপ (১০০% নির্ভুল দশমিক ক্যালকুলেশন)
  useEffect(() => {
    let interval = null;
    if (isMining) {
      interval = setInterval(() => {
        // ডাটাবেজের রিয়েল মাইনিং স্পিড থেকে রেট হিসাব (প্রতি ১০০ms এ এডিশন)
        const currentBaseSpeed = (miningSpeed / 36000); 
        let multiplier = 1.0;
        
        // বুস্ট লজিকে ডাটাবেজের রিয়েল boostPower হ্যান্ডেল করা হলো
        const effectiveBoost = boostPower > 1 ? boostPower : 2.0; 
        
        if (isHybridMode && isBoostActive) multiplier = 1.5 * effectiveBoost;
        else if (isBoostActive) multiplier = effectiveBoost;
        else if (isHybridMode) multiplier = 1.5;

        const baseRate = currentBaseSpeed * multiplier;

        setCoins((prevCoins) => {
          const newCoins = parseFloat((prevCoins + baseRate).toFixed(8));
          localStorage.setItem("d_current_mining_coins", newCoins.toFixed(8));
          return newCoins;
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isMining, isHybridMode, isBoostActive, miningSpeed, boostPower]);

  // ==========================================
  // 📥 ACTION 1: CLAIM TO MINING WALLET
  // ==========================================
  const handleCollectRewards = async () => {
    if (coins <= 0 || loadingAction) return;

    if (centralRingRef.current && miningWalletRef.current) {
      const startRect = centralRingRef.current.getBoundingClientRect();
      const endRect = miningWalletRef.current.getBoundingClientRect();

      const centerX = startRect.left + startRect.width / 2;
      const centerY = startRect.top + startRect.height / 2;

      const particles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        startX: centerX + (Math.random() * 40 - 20),
        startY: centerY + (Math.random() * 40 - 20),
        endX: endRect.left + endRect.width / 2,
        endY: endRect.top + endRect.height / 2,
        delay: i * 60,
      }));

      setCollectParticles(particles);

      setTimeout(async () => {
        try {
          setLoadingAction(true);
          const currentCoinsToCollect = coins;

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
      }, 800);
    }
  };

  // ==========================================
  // 🔄 ACTION 2: SYNC TO VAULT
  // ==========================================
  const handleSyncToCentralVault = async () => {
    if (dbMiningWallet <= 0 || loadingAction) return;

    if (miningWalletRef.current) {
      const startRect = miningWalletRef.current.getBoundingClientRect();

      const particles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        startX: startRect.left + startRect.width / 2 + (Math.random() * 50 - 25),
        startY: startRect.top + startRect.height / 2,
        delay: i * 50,
      }));

      setSyncParticles(particles);

      setTimeout(async () => {
        try {
          setLoadingAction(true);
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
      }, 800);
    }
  };

  const getCurrentSpeedLabel = () => {
    let factor = 1.0;
    const effectiveBoost = boostPower > 1 ? boostPower : 2.0;
    if (isHybridMode && isBoostActive) factor = 1.5 * effectiveBoost;
    else if (isBoostActive) factor = effectiveBoost;
    else if (isHybridMode) factor = 1.5;
    
    return `+${(miningSpeed * factor).toFixed(2)} D/hr`;
  };

  const progressPercentage = Math.min((coins / maxCoinTarget) * 100, 100);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn select-none relative overflow-hidden p-4 bg-[#070a12] text-white space-y-4 rounded-2xl border border-slate-800/40">
      
      {/* ⛏️ প্রফেশনাল মাইনিং ওয়ালেট হেডার */}
      <div 
        ref={miningWalletRef}
        className="w-full bg-[#111827]/60 backdrop-blur-xl border border-slate-800/60 p-4 rounded-xl flex justify-between items-center shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Mining Counter</span>
            <div className="flex items-center gap-1 font-mono font-extrabold text-amber-400 text-sm mt-0.5">
              <span>{dbMiningWallet.toFixed(8)}</span> 
              <span className="text-[10px] text-amber-600 font-sans font-bold">COIN</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSyncToCentralVault}
          disabled={dbMiningWallet <= 0 || loadingAction || loading}
          className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
            dbMiningWallet <= 0 || loading 
              ? "bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed" 
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/10 hover:opacity-95"
          }`}
        >
          <RefreshCcw className={`w-3 h-3 ${loadingAction ? 'animate-spin' : ''}`} />
          <span>{loading ? "Syncing" : "Sync Vault"}</span>
        </button>
      </div>

      {/* 💰 টোটাল কয়েন সিকিউরড কার্ড */}
      <div className={`w-full bg-[#111827]/40 border p-3.5 rounded-xl transition-all duration-300 flex justify-between items-center ${
        isCoinAnimating ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/10" : "border-slate-800/50"
      }`}>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-400">Secured Vault Balance</span>
        </div>
        <span className={`text-base font-mono font-extrabold tracking-wide transition-all duration-300 ${
          isCoinAnimating ? "text-emerald-400 scale-105" : "text-white"
        }`}>
          {totalCoin.toFixed(8)} <span className="text-xs font-bold text-slate-500 font-sans">D</span>
        </span>
      </div>

      {/* 🛠️ প্রিমিয়াম মোড কন্ট্রোলার */}
      <div className="flex justify-between items-center w-full gap-3">
        <button 
          onClick={() => setIsHybridMode(!isHybridMode)}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            isHybridMode 
              ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-amber-400 border-amber-500/40 shadow-inner" 
              : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isHybridMode ? "Hybrid 1.5X" : "Hybrid Mode"}</span>
        </button>
        
        <button 
          onClick={() => setIsBoostActive(!isBoostActive)}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            isBoostActive 
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 animate-pulse shadow-inner" 
              : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isBoostActive ? `Boost ${boostPower}X` : "Turbo Boost"}</span>
        </button>
      </div>

      {/* 🔮 সেন্ট্রাল কোর মাইনিং অ্যানিমেশন রিট্যাক্ট */}
      <div ref={centralRingRef} className="relative flex justify-center items-center py-4 w-full my-1">
        <div className={`absolute h-44 w-44 rounded-full blur-3xl transition-colors duration-500 ${
          isBoostActive ? "bg-cyan-500/[0.08]" : isHybridMode ? "bg-orange-500/[0.06]" : "bg-amber-500/[0.04]"
        }`}></div>
        
        <div className={`absolute h-36 w-36 rounded-full border border-dashed flex items-center justify-center transition-all ${
          isBoostActive 
            ? "border-cyan-500/30 animate-[spin_10s_linear_infinite]" 
            : isHybridMode ? "border-orange-500/20 animate-[spin_25s_linear_infinite]" : "border-amber-500/15 animate-[spin_40s_linear_infinite]"
        }`}>
          <div className={`h-32 w-32 rounded-full border ${isBoostActive ? "border-cyan-500/10" : isHybridMode ? "border-orange-500/10" : "border-amber-500/10"}`}></div>
        </div>

        <div className={`h-[112px] w-[112px] rounded-full border-[3px] bg-slate-950 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative z-10 ${
          isBoostActive
            ? "border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
            : isHybridMode 
              ? "border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.2)]" 
              : "border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
        }`}>
          <CircleDollarSign className={`w-8 h-8 animate-spin ${isBoostActive ? "text-cyan-400" : isHybridMode ? "text-orange-400" : "text-amber-500"}`} style={{ animationDuration: isBoostActive ? '3s' : '6s' }} />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Core Engine</span>
        </div>
      </div>

      {/* 📊 লাইভ ক্রিপ্টো কাউন্টিং প্যানেল */}
      <div className="text-center w-full">
        <h2 className="text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1.5">
          {coins.toFixed(8)} 
          <span className={`text-[8px] font-sans font-black px-1.5 py-0.5 rounded-md border tracking-wider shrink-0 ${
            isBoostActive && isHybridMode
              ? "text-orange-400 bg-orange-500/10 border-orange-500/30 animate-pulse"
              : isBoostActive 
                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 animate-pulse" 
                : isHybridMode
                  ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          }`}>
            LIVE NODE
          </span>
        </h2>
        
        <div className="flex justify-center items-center gap-2 text-[10px] font-medium text-slate-500 mt-1">
          <p className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-slate-600" /> <span>Real-time Ledger</span></p>
          <span className="text-slate-800">|</span>
          <p className="text-amber-500 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{getCurrentSpeedLabel()}</span>
          </p>
        </div>
      </div>

      {/* 🔋 প্রোগ্রেস বার এবং মেগা ক্লেইম ইন্টিগ্রেশন */}
      <div className="w-full space-y-2.5 pt-1">
        <div className="w-full bg-slate-950 border border-slate-800/80 h-2 rounded-full p-[1px] overflow-hidden shadow-inner relative">
          <div 
            className={`h-full rounded-full transition-all duration-200 ${
              isBoostActive 
                ? "bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                : "bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <button 
          onClick={handleCollectRewards}
          disabled={coins <= 0 || loadingAction || loading}
          className={`w-full py-3 text-slate-950 font-extrabold text-[12px] tracking-widest rounded-xl uppercase transition-all duration-200 active:scale-[0.99] border-t cursor-pointer ${
            coins <= 0 || loading 
              ? "bg-slate-900 text-slate-600 border-slate-950 shadow-none cursor-not-allowed" 
              : isBoostActive 
                ? "bg-gradient-to-r from-cyan-400 to-cyan-500 border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-500/20" 
                : "bg-gradient-to-r from-amber-400 to-orange-500 border-amber-300/30 hover:shadow-xl hover:shadow-orange-500/20"
          }`}
        >
          {loading ? "⏳ Syncing Block..." : "💰 Collect Mined Coins"}
        </button>
      </div>

      {/* 🪙 ফ্লাইং কয়েন পার্টিকল রেন্ডারিং ইঞ্জিন */}
      {collectParticles.map((p) => (
        <span
          key={p.id}
          className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] select-none animate-collectFly"
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
          className="fixed text-sm z-50 pointer-events-none filter drop-shadow-[0_0_6px_rgba(16,185,129,0.9)] select-none animate-syncFly"
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
      
      {/* 📢 বিজ্ঞাপন ব্যানার */}
      <div className="w-full pt-1">
        <AdsterraBanner />
      </div>

      {/* 🎨 সিএসএস অ্যানিমেশন ট্র্যাকিং কোড */}
      <style jsx global>{`
        @keyframes collectFly {
          0% { transform: translate3d(var(--start-x), var(--start-y), 0) scale(1.1); opacity: 1; }
          100% { transform: translate3d(var(--end-x), var(--end-y), 0) scale(0.4); opacity: 0.1; }
        }
        @keyframes syncFly {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          40% { transform: translateY(-50px) scale(1.2); opacity: 0.9; }
          100% { left: 50%; top: 20px; transform: scale(0.1); opacity: 0; }
        }
        .animate-collectFly { animation: collectFly 0.8s cubic-bezier(0.1, 0.8, 0.25, 1) forwards; }
        .animate-syncFly { animation: syncFly 1.0s cubic-bezier(0.25, 1, 0.4, 1) forwards; }
      `}</style>

    </div>
  );  
}