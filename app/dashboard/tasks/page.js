"use client";
import { useState } from "react";

export default function TasksPage() {
  // Mock States
  const [minedPoints, setMinedPoints] = useState(1500.00); // ইউজারের কারেন্ট পয়েন্ট
  const [activeTab, setActiveTab] = useState("offerwall"); // ট্যাব কন্ট্রোল

  // কাস্টম পিটিসি (PTC) অ্যাডের নকল ডেটা
  const [ptcAds, setPtcAds] = useState([
    { id: 1, title: "Visit Tech Blog & Earn", duration: 15, reward: 20, clicked: false },
    { id: 2, title: "Watch Youtube Video 30s", duration: 30, reward: 40, clicked: false },
    { id: 3, title: "Check Crypto News Site", duration: 10, reward: 15, clicked: false },
  ]);

  // পিটিসি অ্যাড ক্লিক হ্যান্ডলার (সিমুলেশন)
  const handlePtcClick = (id, reward) => {
    setPtcAds(prev =>
      prev.map(ad => (ad.id === id ? { ...ad, clicked: true } : ad))
    );
    setMinedPoints(prev => prev + reward);
    alert(`অ্যাডটি সফলভাবে দেখা হয়েছে! আপনার অ্যাকাউন্টে ${reward} পয়েন্ট যোগ করা হয়েছে।`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* হেডার */}
      <div className="mb-8 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Task Center & Offerwalls
          </h1>
          <p className="text-slate-400 text-sm">নিচের সহজ কাজগুলো সম্পন্ন করে আনলিমিটেড পয়েন্ট আয় করুন।</p>
        </div>
        {/* লাইভ পয়েন্ট স্ট্যাটাস */}
        <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-lg">
          <p className="text-slate-500 text-xs font-medium uppercase">Your Points</p>
          <h2 className="text-xl font-black text-amber-400">{minedPoints.toFixed(2)} PTS</h2>
        </div>
      </div>

      {/* ট্যাব বাটন্স (Offerwall vs PTC Ads) */}
      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("offerwall")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 ${
            activeTab === "offerwall"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🔥 Premium Offerwalls
        </button>
        <button
          onClick={() => setActiveTab("ptc")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 ${
            activeTab === "ptc"
              ? "border-pink-500 text-pink-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          ⏱️ PTC Ads (Paid to Click)
        </button>
      </div>

      {/* ট্যাব ১: প্রিমিয়াম অফারওয়াল (এখানে থার্ড পার্টি অফারওয়াল বসবে) */}
      {activeTab === "offerwall" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl max-w-3xl">
            <h3 className="text-lg font-bold text-slate-200 mb-2">CPALead Offerwall</h3>
            <p className="text-sm text-slate-400 mb-6">
              এখানে বিভিন্ন অ্যাপ ইনস্টল, গেম লেভেল কমপ্লিট এবং সার্ভে করার কাজ থাকে। (ব্যাকএন্ড কানেক্ট করার পর এখানে আসল অফারওয়াল লোড হবে)।
            </p>
            
            {/* নকল অফারওয়াল বক্স (Placeholder) */}
            <div className="w-full h-96 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl mb-3">📱</span>
              <p className="text-slate-400 font-medium">Offerwall Integration Area</p>
              <p className="text-xs text-slate-600 max-w-xs mt-1">
                [আপনার CPALead বা AdGate আইফ্রেম (Iframe) লিংকটি এখানে লোড করা হবে]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ট্যাব ২: পিটিসি অ্যাডস সেকশন */}
      {activeTab === "ptc" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ptcAds.map((ad) => (
            <div
              key={ad.id}
              className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between transition-all ${
                ad.clicked ? "opacity-50" : "hover:border-pink-500/50 shadow-xl"
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs bg-slate-950 text-slate-400 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                    ⏱️ {ad.duration} Seconds
                  </span>
                  <span className="text-xs bg-pink-500/10 text-pink-400 px-2.5 py-1 rounded-md font-bold">
                    +{ad.reward} PTS
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-6">{ad.title}</h3>
              </div>

              <button
                onClick={() => handlePtcClick(ad.id, ad.reward)}
                disabled={ad.clicked}
                className={`w-full p-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  ad.clicked
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                }`}
              >
                {ad.clicked ? "Already Claimed ✓" : "Watch Ad & Earn"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}