'use client';

import { useAuth } from '@/app/components/AuthProvider'; 
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Cpu, 
  Wallet, 
  Zap, 
  Rocket, 
  RefreshCw, 
  LogOut, 
  Lock 
} from 'lucide-react'; // 🚀 সাইবার থিম আইকনসমূহ

export default function ProfilePage() {
  const { user, loading, logout, checkSession } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 ওয়ালেট ব্যালেন্স ম্যানুয়ালি রিফ্রেশ করার প্রফেশনাল টোস্ট মেকানিজম
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);

    await toast.promise(
      checkSession(),
      {
        loading: 'Syncing ledger data...',
        success: 'Vault data updated!',
        error: 'Failed to sync vault.',
      },
      {
        style: {
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
        }
      }
    );
    
    setRefreshing(false);
  };

  // ⏳ সিকিউর নোড লোডিং কন্ডিশন
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-zinc-400 antialiased">
        <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-full px-5 py-2.5 flex items-center shadow-2xl">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent mr-3"></div>
          <span className="text-xs font-semibold text-zinc-300 tracking-wide">Syncing user ledger...</span>
        </div>
      </div>
    );
  }

  // 🔒 আনঅথরাইজড স্টেট (ইউজার লগইন না থাকলে)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 antialiased">
        <div className="text-center p-8 bg-[#111827]/60 backdrop-blur-2xl rounded-2xl border border-slate-800/80 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
          <p className="text-slate-400 text-sm mb-6">Please log in to verify secure node connection and view your mining profile.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold py-3 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all text-sm uppercase tracking-wider cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex  justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* 🔮 সাইবার গ্লো ইফেক্টস */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 👤 ইউজার প্রোফাইল হেডার */}
        <div className="flex items-center space-x-4 mb-6 relative z-10">
          <div className="h-14 w-14 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full flex items-center justify-center font-black text-slate-950 text-xl uppercase shadow-lg shadow-orange-500/20">
            {user.username ? user.username.substring(0, 2) : user.userEmail.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-white tracking-wide truncate flex items-center gap-1.5">
              <span>{user.username}</span>
            </h2>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{user.userEmail}</span>
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-slate-950/80 border border-slate-800/60 font-mono text-amber-500 px-2 py-0.5 rounded-md">
              <Cpu className="w-3 h-3" />
              <span>USER ID: {user.userId}</span>
            </span>
          </div>
        </div>

        {/* 💰 ওয়ালেট ব্যালেন্স ও লাইভ মাইনিং স্ট্যাটাস */}
        <div className="space-y-3.5 border-t border-slate-800/80 pt-5 relative z-10">
          
          {/* ভল্ট ব্যালেন্স */}
          <div className="flex justify-between items-center bg-slate-950/50 border border-slate-800/40 p-3.5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-400">Vault Balance</span>
            </div>
            <span className="text-amber-400 font-bold text-base tracking-wide">
              {parseFloat(user.totalCoin || 0).toFixed(4)} <span className="text-xs font-medium text-amber-500/70">COIN</span>
            </span>
          </div>

          {/* মাইনিং ওয়ালেট */}
          <div className="flex justify-between items-center bg-slate-950/50 border border-slate-800/40 p-3.5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-400">Mining Counter</span>
            </div>
            <span className="text-emerald-400 font-bold text-base tracking-wide">
              {parseFloat(user.miningWallet || 0).toFixed(4)} <span className="text-xs font-medium text-emerald-500/70">COIN</span>
            </span>
          </div>

          {/* মাইনিং স্পেসিফিকেশনস */}
          <div className="grid grid-cols-2 gap-2.5 pt-1.5">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between">
              <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Mining Speed</span>
              </p>
              <p className="text-sm font-bold text-slate-200 tracking-wide">{user.miningSpeed} GH/s</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between">
              <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Rocket className="w-3 h-3 text-orange-500" />
                <span>Boost Power</span>
              </p>
              <p className="text-sm font-bold text-slate-200 tracking-wide">{user.boostPower}x</p>
            </div>
          </div>
        </div>

        {/* ⚙️ অ্যাকশন বাটনসমূহ */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex gap-3 relative z-10">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex-1 bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 text-slate-300 font-semibold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Update Balance</span>
          </button>
          
          <button 
            onClick={logout} 
            className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}