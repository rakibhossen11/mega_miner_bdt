'use client';

import { useAuth } from '@/app/components/AuthProvider'; // 👈 আপনার প্রোভাইডারের সঠিক পাথটি দিন
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  // 🚀 AuthProvider থেকে ইউজার ডাটা, লগআউট ফাংশন এবং রিফ্রেশ মেথড নিয়ে আসলাম
  const { user, loading, logout, checkSession } = useAuth();
  const router = useRouter();

  // 🔄 ওয়ালেট ব্যালেন্স ম্যানুয়ালি রিফ্রেশ করার ফাংশন
  const handleRefresh = async () => {
    await checkSession();
  };

  // ⏳ যদি সেশন চেক করতে লেট হয়
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-400">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
        Syncing user ledger...
      </div>
    );
  }

  // 🔒 ইউজার লগইন না থাকলে প্রোফাইল ডেটা দেখাবে না (নিরাপত্তার জন্য)
  if (!user) {
    return (
      <div className="text-center p-8 bg-zinc-900/50 rounded-xl border border-zinc-800 max-w-md mx-auto mt-10">
        <p className="text-zinc-400 mb-4">Please log in to view your mining profile.</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-900 text-white rounded-xl border border-zinc-800 max-w-md mx-auto mt-10 shadow-xl">
      {/* 👤 ইউজার প্রোফাইল হেডার */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-14 w-14 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-black text-2xl uppercase shadow-md">
          {user.name ? user.name.substring(0, 2) : user.userEmail.substring(0, 2)}
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wide">{user.name}</h2>
          <p className="text-xs text-zinc-400">{user.userEmail}</p>
          <span className="inline-block mt-1 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
            Node ID: {user.userId}
          </span>
        </div>
      </div>

      {/* 💰 ওয়ালেট ব্যালেন্স ও মাইনিং স্ট্যাটাস */}
      <div className="space-y-3 border-t border-zinc-800 pt-5">
        <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-lg">
          <span className="text-sm text-zinc-400">Vault Balance:</span>
          <span className="text-yellow-400 font-bold text-lg">{user.totalCoin.toFixed(4)} COIN</span>
        </div>

        <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-lg">
          <span className="text-sm text-zinc-400">Mining Wallet:</span>
          <span className="text-green-400 font-semibold">{user.miningWallet.toFixed(4)} COIN</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
          <div className="bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
            <p className="text-zinc-500 mb-0.5">Mining Speed</p>
            <p className="font-medium text-zinc-200">⚡ {user.miningSpeed} GH/s</p>
          </div>
          <div className="bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
            <p className="text-zinc-500 mb-0.5">Boost Power</p>
            <p className="font-medium text-zinc-200">🚀 {user.boostPower}x</p>
          </div>
        </div>
      </div>

      {/* ⚙️ অ্যাকশন বাটনসমূহ */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3">
        <button 
          onClick={handleRefresh} 
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2.5 rounded-lg text-sm transition border border-zinc-700 active:scale-95"
        >
          🔄 Update Balance
        </button>
        <button 
          onClick={logout} 
          className="bg-red-950/40 hover:bg-red-900/60 text-red-400 font-medium px-4 py-2.5 rounded-lg text-sm transition border border-red-900/50 active:scale-95"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}