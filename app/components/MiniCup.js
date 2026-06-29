"use client";
import { useState, useEffect, useRef } from "react";

export default function GoogleMiniCup3D() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gkPosition, setGkPosition] = useState(50); // গোলকিপারের X পজিশন (%)
  const [ballStyle, setBallStyle] = useState({ bottom: "10px", left: "50%", transform: "translate(-50%, 0) scale(1) translateZ(0)" });
  const [gameState, setGameState] = useState("ready"); // ready, kicking, goal, saved
  const [gameMessage, setGameMessage] = useState("গোলপোস্টে যেকোনো জায়গায় ক্লিক করে শট মারুন!");
  
  const goalRef = useRef(null);
  const gkDirection = useRef(1); // 1 = ডান, -1 = বাম
  const currentGkPos = useRef(50);

  useEffect(() => {
    currentGkPos.current = gkPosition;
  }, [gkPosition]);

  // 🤖 স্লাইডার গোলকিপার লজিক (কিক করার সময়ও কিপার থামবে না)
  useEffect(() => {
    let interval;
    if (gameState === "ready" || gameState === "kicking") {
      const currentSpeed = Math.min(2.2 + score * 0.4, 5.8); // স্কোর বাড়লে স্পিড বাড়বে

      interval = setInterval(() => {
        setGkPosition((prev) => {
          if (prev >= 78) gkDirection.current = -1;
          if (prev <= 22) gkDirection.current = 1;
          return prev + gkDirection.current * currentSpeed;
        });
      }, 30);
    } 
    
    return () => clearInterval(interval);
  }, [gameState, score]);

  // ⚽ ৩ডি কিক ও ব্যালিস্টিক ট্র্যাজেক্টরি মেকানিক্স
  const handleGoalClick = (e) => {
    if (gameState === "kicking" || gameState === "goal" || gameState === "saved") return;

    const rect = goalRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100; // 0% থেকে 100%
    const clickY = ((rect.bottom - e.clientY) / rect.height) * 100;

    setGameState("kicking");
    setGameMessage("শট নেওয়া হয়েছে! 🚀");

    // 🚀 3D Ball Effect: বলটি ভেতরের দিকে চলে যাবে (translateZ) এবং থ্রিডি আর্ক তৈরি করবে
    setBallStyle({
      bottom: `${clickY + 45}%`,
      left: `${clickX}%`,
      transform: "translate(-50%, -40px) scale(0.4) rotate(360deg)",
      transition: "all 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    });

    // বল যখন থ্রিডি স্পেসে গোলবারে পৌঁছাবে
    setTimeout(() => {
      const distance = Math.abs(clickX - currentGkPos.current);
      const isSaved = distance < 13; // ক্যাচিং রেঞ্জ ব্যালেন্স করা হয়েছে

      if (isSaved) {
        setGameState("saved");
        setStreak(0);
        setGameMessage("🧤 অসাধারণ সেভ! গোলকিপার আটকে দিল!");
      } else {
        setGameState("goal");
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setGameMessage("🎉 গোল্ল্ল্ল্ল্ল!! চমৎকার শট!");
      }

      // ১.৫ সেকেন্ড পর আবার খেলা সচল হবে
      setTimeout(() => {
        resetBall();
      }, 1500);

    }, 550);
  };

  const resetBall = () => {
    setBallStyle({
      bottom: "10px",
      left: "50%",
      transform: "translate(-50%, 0) scale(1) translateZ(0)",
      transition: "none"
    });
    setGameState("ready");
    setGameMessage("আবারো কোণ বেছে নিয়ে শট মারুন!");
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-b from-sky-400 to-indigo-600 rounded-3xl p-4 shadow-2xl font-sans overflow-hidden select-none text-center border-4 border-white">
      
      {/* 🏆 স্কোরবোর্ড */}
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white mb-4">
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">মোট গোল</p>
          <p className="text-2xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
            🔥 স্ট্রাইক: {streak}
          </div>
          <div className="text-[9px] text-sky-100 font-bold uppercase">
            কিপার লেভেল: {Math.min(1 + Math.floor(score/2), 5)}
          </div>
        </div>
      </div>

      {/* 🥅 3D PERSPECTIVE STADIUM ENCLOSURE */}
      <div 
        className="w-full h-80 bg-gradient-to-b from-emerald-800 to-emerald-500 rounded-2xl relative shadow-2xl flex flex-col justify-between overflow-hidden border-b-4 border-emerald-900"
        style={{ perspective: "600px" }} // এটি স্টেডিয়ামে থ্রিডি গভীরতা তৈরি করে
      >
        
        {/* আকাশ ও গ্যালারি ব্যাকগ্রাউন্ড ইফেক্ট */}
        <div className="absolute top-0 inset-x-0 h-12 bg-emerald-900/60 border-b border-emerald-900"></div>

        {/* 🥅 ৩ডি গোলপোস্ট নেট (ক্লিক জোন) */}
        <div 
          ref={goalRef}
          onClick={handleGoalClick}
          className="w-10/12 h-36 bg-[radial-gradient(circle,_transparent_20%,_rgba(255,255,255,0.15)_21%)] bg-[size:8px_8px] border-t-8 border-x-8 border-white mx-auto mt-8 rounded-t-md relative cursor-crosshair shadow-[inset_0_10px_30px_rgba(0,0,0,0.6)] z-20"
          style={{ transform: "translateZ(10px)" }}
        >
          {/* 🧍‍♂️ ৩ডি ট্র্যাক করা স্লাইডার হিউম্যান গোলকিপার */}
          <div 
            className="absolute bottom-0 text-9xl transition-all duration-75 ease-out filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
            style={{ 
              left: `${gkPosition}%`, 
              transform: `translateX(-50%) ${gameState === "saved" ? "scale(1.15) translateY(-8px)" : "scale(1)"}`,
            }}
          >
            {gameState === "saved" ? "🏃‍♂️🧤" : "🧍‍♂️"}
          </div>
        </div>

        {/* 🌿 ৩ডি পিচ গ্রাস ম্যাট (3D Flat Plane Rotation) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-500 to-emerald-600 pointer-events-none origin-bottom border-t-4 border-white/20"
          style={{ transform: "rotateX(25deg) scaleY(1.1)", zIndex: 1 }}
        >
          {/* ডি-বক্সের এরিয়া লাইন */}
          <div className="w-8/12 h-24 border-2 border-white/30 mx-auto mt-0 rounded-b-full bg-emerald-600/20"></div>
          {/* পেনাল্টি স্পট */}
          <div className="w-3 h-3 bg-white/80 rounded-full mx-auto mt-4 shadow"></div>
        </div>

        {/* ⚽ ৩ডি ফুটবল (জেমিনি ট্র্যাজেক্টরি সিস্টেম) */}
        <div 
          className="absolute text-6xl z-30 filter drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)] pointer-events-none select-none"
          style={{
            bottom: ballStyle.bottom,
            left: ballStyle.left,
            transform: ballStyle.transform,
            transition: ballStyle.transition || "none"
          }}
        >
          ⚽
        </div>

      </div>

      {/* 💬 লাইভ কন্সোল অ্যানাউন্সমেন্ট বক্স */}
      <div className="mt-4 bg-white/95 rounded-2xl p-3 shadow-lg min-h-[55px] flex items-center justify-center border border-indigo-100">
        <p className={`font-black uppercase tracking-wide text-sm ${
          gameState === "goal" ? "text-emerald-600 animate-bounce" :
          gameState === "saved" ? "text-rose-500" : "text-slate-700"
        }`}>
          {gameMessage}
        </p>
      </div>

    </div>
  );
}


// "use client";
// import { useState, useEffect, useRef } from "react";

// export default function GoogleMiniCup() {
//   const [score, setScore] = useState(0);
//   const [streak, setStreak] = useState(0);
//   const [gkPosition, setGkPosition] = useState(50); // Goalkeeper X Position (%)
//   const [ballStyle, setBallStyle] = useState({ bottom: "20px", left: "50%", scale: "1" });
//   const [gameState, setGameState] = useState("ready"); // ready, kicking, goal, saved
//   const [gameMessage, setGameMessage] = useState("TAP ANYWHERE ON THE GOAL TO SHOOT!");
  
//   const goalRef = useRef(null);
//   const gkDirection = useRef(1); // 1 = Right, -1 = Left
//   const currentGkPos = useRef(50);

//   useEffect(() => {
//     currentGkPos.current = gkPosition;
//   }, [gkPosition]);

//   // 🤖 স্লাইডার গোলকিপার লজিক (কিক করার সময়ও কিপার থামবে না)
//   useEffect(() => {
//     let interval;
//     // শুধু গোল বা সেভ হওয়ার পর রেজাল্ট দেখানোর সময় কিপার সাময়িক থামবে
//     if (gameState === "ready" || gameState === "kicking") {
//       const currentSpeed = Math.min(2.0 + score * 0.4, 5.5);

//       interval = setInterval(() => {
//         setGkPosition((prev) => {
//           if (prev >= 75) gkDirection.current = -1;
//           if (prev <= 25) gkDirection.current = 1;
//           return prev + gkDirection.current * currentSpeed;
//         });
//       }, 30);
//     } 
    
//     return () => clearInterval(interval);
//   }, [gameState, score]);

//   // ⚽ কিক বা ক্লিক মেকানিক্স
//   const handleGoalClick = (e) => {
//     if (gameState === "kicking" || gameState === "goal" || gameState === "saved") return;

//     const rect = goalRef.current.getBoundingClientRect();
//     const clickX = ((e.clientX - rect.left) / rect.width) * 100; // 0% to 100%
//     const clickY = ((rect.bottom - e.clientY) / rect.height) * 100;

//     setGameState("kicking");
//     setGameMessage("STRIKE!");

//     // বল উড়ে যাওয়ার অ্যানিমেশন
//     setBallStyle({
//       bottom: `${clickY + 40}%`,
//       left: `${clickX}%`,
//       scale: "0.5",
//     });

//     // বল জালে পৌঁছানোর পর গোল বা সেভ নির্ধারণের ডিলে
//     setTimeout(() => {
//       const distance = Math.abs(clickX - currentGkPos.current);
//       const isSaved = distance < 12; 

//       if (isSaved) {
//         setGameState("saved"); // এখানে এসে কিপার ১ সেকেন্ডের জন্য থামবে রেজাল্ট দেখাতে
//         setStreak(0);
//         setGameMessage("🧤 GREAT SAVE BY THE KEEPER!");
//       } else {
//         setGameState("goal"); // এখানে এসে কিপার ১ সেকেন্ডের জন্য থামবে রেজাল্ট দেখাতে
//         setScore((prev) => prev + 1);
//         setStreak((prev) => prev + 1);
//         setGameMessage("🎉 GOAAALLL!!");
//       }

//       // ১.২ সেকেন্ড পর আবার বল ও কিপার রিসেট হয়ে খেলা সচল হবে
//       setTimeout(() => {
//         resetBall();
//       }, 1200);

//     }, 550);
//   };

//   const resetBall = () => {
//     setBallStyle({ bottom: "20px", left: "50%", scale: "1" });
//     setGameState("ready");
//     setGameMessage("CHOOSE YOUR NEXT ANGLE!");
//   };

//   return (
//     <div className="w-full max-w-md bg-gradient-to-b from-sky-400 to-emerald-500 rounded-3xl p-4 shadow-2xl font-sans overflow-hidden select-none text-center border-4 border-white">
      
//       {/* 🏆 স্কোরবোর্ড */}
//       <div className="flex justify-between items-center bg-black/30 backdrop-blur-md rounded-2xl px-4 py-2 text-white mb-4">
//         <div className="text-left">
//           <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Total Goals</p>
//           <p className="text-2xl font-black">{score}</p>
//         </div>
//         <div className="flex flex-col items-end gap-1">
//           <div className="bg-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
//             🔥 STREAK: {streak}
//           </div>
//           <div className="text-[9px] text-emerald-100 font-bold uppercase">
//             GK Reflex: Level {Math.min(1 + Math.floor(score/2), 5)}
//           </div>
//         </div>
//       </div>

//       {/* 🥅 গোলপোস্ট এবং স্টেডিয়াম পিচ */}
//       <div className="w-full h-72 bg-gradient-to-b from-emerald-600 to-emerald-500 rounded-2xl relative border-b-8 border-emerald-700 shadow-inner flex flex-col justify-between">
        
//         {/* গোলবার হিট এরিয়া */}
//         <div 
//           ref={goalRef}
//           onClick={handleGoalClick}
//           className="w-11/12 h-36 bg-[radial-gradient(circle,_transparent_20%,_rgba(255,255,255,0.15)_21%)] bg-[size:10px_10px] border-t-8 border-x-8 border-white mx-auto mt-4 rounded-t-md relative cursor-crosshair shadow-[inset_0_10px_20px_rgba(0,0,0,0.3)]"
//         >
//           {/* 🧍‍♂️ স্লাইডার হিউম্যান গোলকিপার (ইমোজি সাইজ বড় করা হয়েছে) */}
//           <div 
//             className="absolute bottom-0 text-6xl transition-transform duration-75 ease-out"
//             style={{ 
//               left: `${gkPosition}%`, 
//               transform: `translateX(-50%) ${gameState === "saved" ? "scale(1.1) translateY(-5px)" : "scale(1)"}` 
//             }}
//           >
//             {gameState === "saved" ? "🏃‍♂️🧤" : "🧍‍♂️"}
//           </div>
//         </div>

//         {/* ⚽ ফুটবল (ইমোজি সাইজ বড় করা হয়েছে) */}
//         <div 
//           className="absolute text-5xl transition-all duration-500 ease-out z-10 filter drop-shadow-md"
//           style={{
//             bottom: ballStyle.bottom,
//             left: ballStyle.left,
//             transform: `translateX(-50%) scale(${ballStyle.scale})`,
//           }}
//         >
//           ⚽
//         </div>

//         {/* পিচ লাইনিং */}
//         <div className="w-full h-8 bg-emerald-600/40 border-t border-dashed border-white/30 flex items-center justify-center">
//           <div className="w-3 h-3 bg-white/60 rounded-full"></div>
//         </div>
//       </div>

//       {/* 💬 অ্যানাউন্সমেন্ট প্যানেল */}
//       <div className="mt-4 bg-white/90 rounded-xl p-3 shadow-md min-h-[50px] flex items-center justify-center">
//         <p className={`font-black uppercase tracking-wide text-sm ${
//           gameState === "goal" ? "text-emerald-600 animate-bounce" :
//           gameState === "saved" ? "text-rose-500" : "text-slate-700"
//         }`}>
//           {gameMessage}
//         </p>
//       </div>

//     </div>
//   );
// }