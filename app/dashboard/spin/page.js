"use client";
import { useState } from "react";

export default function SpinPage() {
  // Mock States
  const [minedPoints, setMinedPoints] = useState(1500.00);
  const [hashPower, setHashPower] = useState(100);
  const [freeSpins, setFreeSpins] = useState(3); // ইউজারের আজকের ফ্রি স্পিন সংখ্যা
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0); // চাকা কত ডিগ্রী ঘুরবে

  // চাকার ৮টি স্লাইস বা পুরস্কারের তালিকা
  const prizes = [
    { text: "10 PTS", color: "bg-slate-800 text-amber-400" },
    { text: "50 PTS", color: "bg-slate-900 text-white" },
    { text: "Free Spin", color: "bg-slate-800 text-blue-400" },
    { text: "+10 Gh/s", color: "bg-slate-900 text-emerald-400" },
    { text: "0 PTS", color: "bg-slate-800 text-rose-500" },
    { text: "100 PTS", color: "bg-slate-900 text-amber-400" },
    { text: "5 PTS", color: "bg-slate-800 text-white" },
    { text: "+50 Gh/s", color: "bg-slate-900 text-emerald-400" },
  ];

  const handleSpin = () => {
    if (freeSpins <= 0) {
      alert("আপনার আজকের ফ্রি স্পিন শেষ! নতুন স্পিনের জন্য একটি ভিডিও অ্যাড দেখুন।");
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setFreeSpins((prev) => prev - 1);

    // ১ থেকে ৮ এর মধ্যে একটি র্যান্ডম পুরস্কার সিলেক্ট করা (নকল লজিক)
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    
    // চাকা ঘোরানোর ডিগ্রী হিসাব (কমপক্ষে ৫ বার পুরো ঘুরবে + পুরস্কারের এঙ্গেল)
    const degreesPerSlice = 360 / prizes.length;
    const targetDegrees = 360 * 5 + (prizeIndex * degreesPerSlice);
    
    // নতুন রোটেশন সেট করা (এটি CSS Transition-কে ট্রিগার করবে)
    const newRotation = rotation + targetDegrees - (rotation % 360);
    setRotation(newRotation);

    // ৩ সেকেন্ড পর অ্যানিমেশন শেষ হলে পুরস্কার দেওয়া
    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = prizes[(prizes.length - prizeIndex) % prizes.length];
      
      // পুরস্কার অনুযায়ী স্টেট আপডেট
      if (wonPrize.text.includes("PTS")) {
        const pts = parseInt(wonPrize.text);
        if (pts > 0) setMinedPoints((prev) => prev + pts);
      } else if (wonPrize.text.includes("Gh/s")) {
        const speed = parseInt(wonPrize.text.replace("+", ""));
        setHashPower((prev) => prev + speed);
      } else if (wonPrize.text === "Free Spin") {
        setFreeSpins((prev) => prev + 1);
      }

      alert(`🎉 অভিনন্দন! আপনি জিতেছেন: ${wonPrize.text}`);
    }, 3500);
  };

  // অ্যাড দেখে স্পিন পাওয়ার নকল ফাংশন (রেভিনিউ মডেল)
  const watchAdForSpin = () => {
    alert("ভিডিও বিজ্ঞাপন লোড হচ্ছে... (৫ সেকেন্ড অপেক্ষা করুন)");
    setTimeout(() => {
      setFreeSpins((prev) => prev + 1);
      alert("বিজ্ঞাপন দেখা শেষ! আপনি ১টি অতিরিক্ত স্পিন পেয়েছেন।");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      {/* হেডার */}
      <div className="w-full max-w-4xl mb-8 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Lucky Spin Wheel
          </h1>
          <p className="text-slate-400 text-sm">প্রতিদিন চাকা ঘুরিয়ে জিতে নিন ফ্রি কয়েন ও মাইনিং স্পিন পাওয়ার!</p>
        </div>
        
        {/* লাইভ ব্যালেন্স প্রিভিউ */}
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <p className="text-slate-500 text-xs">Points</p>
            <p className="text-amber-400 font-bold">{minedPoints.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <p className="text-slate-500 text-xs">Speed</p>
            <p className="text-blue-400 font-bold">{hashPower} Gh/s</p>
          </div>
        </div>
      </div>

      {/* মূল কন্টেন্ট এরিয়া */}
      <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full relative backdrop-blur-sm">
        
        {/* স্পিন কাউন্টার */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-sm font-semibold">
          🎁 Remaining Spins: {freeSpins}
        </div>

        {/* স্পিন হুইল ভিজ্যুয়াল কন্টেইনার */}
        <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
          
          {/* চাকার ওপরের নির্দেশক তীর (Pointer) */}
          <div className="absolute top-0 z-20 text-3xl transform -translate-y-3 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
            👇
          </div>

          {/* আসল ঘূর্ণায়মান চাকা */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 3.5s cubic-bezier(0.1, 0.8, 0.3, 1)" : "none",
            }}
            className="w-full h-full rounded-full border-8 border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl flex items-center justify-center"
          >
            {/* চাকার ভেতরের লাইন বা ডিভাইডার */}
            {prizes.map((prize, index) => (
              <div
                key={index}
                style={{ transform: `rotate(${index * 45}deg)` }}
                className="absolute w-full h-full top-0 left-0 flex justify-center origin-center"
              >
                {/* চাকার ভেতরের পুরস্কারের লেখা */}
                <div className="absolute top-4 text-center text-xs font-black tracking-tighter w-12 pt-2">
                  <p className={prize.color.split(" ")[1]}>{prize.text}</p>
                </div>
                {/* ডিভাইডার লাইন */}
                <div className="w-px h-1/2 bg-slate-800/50 origin-bottom absolute bottom-1/2"></div>
              </div>
            ))}

            {/* চাকার একদম মাঝখানের গোল বিন্দু */}
            <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-700 absolute z-10 shadow-lg flex items-center justify-center text-xs">
              💎
            </div>
          </div>
        </div>

        {/* অ্যাকশন বাটনস */}
        <div className="w-full space-y-3">
          <button
            onClick={handleSpin}
            disabled={isSpinning || freeSpins <= 0}
            className={`w-full p-4 rounded-xl font-black text-slate-950 transition-all text-center shadow-lg active:scale-95 ${
              isSpinning || freeSpins <= 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700"
                : "bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 shadow-orange-600/20"
            }`}
          >
            {isSpinning ? "Spinning..." : "SPIN NOW"}
          </button>

          {freeSpins === 0 && (
            <button
              onClick={watchAdForSpin}
              disabled={isSpinning}
              className="w-full bg-slate-950 border border-slate-800 hover:border-blue-500/50 p-3 rounded-xl font-bold text-sm text-blue-400 transition-all text-center active:scale-95"
            >
              📺 Watch Ad to Get 1 Free Spin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}