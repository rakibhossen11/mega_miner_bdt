"use client";
import { useState, useEffect } from "react";
import GoogleMiniCup from "@/app/components/MiniCup";

export default function GamesListView() {
  const [playingGameId, setPlayingGameId] = useState(null); // ট্র্যাক করবে কোন গেমটি সচল আছে

  // একটিমাত্র মেইন ফাইল বা প্লেলিস্টের জন্য গেম রেজিস্ট্রি ডাটা
  const gamesList = [
    { id: "math", name: "🧮 Math Matrix Decoder" },
    { id: "minicup", name: "⚽ Google Mini Cup (Cartoon Live)" },
  ];

  return (
    <div className="min-h-screen bg-[#040805] text-zinc-200 p-8 font-mono antialiased">

      {/* 📑 হেডার */}
      <div className="border-b border-lime-950/50 pb-4 mb-8">
        <h1 className="text-xl font-black text-white tracking-wide uppercase">
          System Game Registry
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Select a gaming module from the list ledger to deploy the interactive window.
        </p>
      </div>

      {/* 📋 মেইন গেম লিস্ট ভিউ */}
      <div className="max-w-2xl mx-auto bg-[#060c07] border border-lime-950/40 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-[#0b110c] px-4 py-2 border-b border-lime-950/60 text-lime-500 font-bold text-[10px] tracking-wider uppercase">
          Active Game Nodes
        </div>

        <div className="divide-y divide-lime-950/30">
          {gamesList.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 hover:bg-lime-950/10 transition-colors"
            >
              {/* গেমের নাম */}
              <span className="text-sm font-bold text-zinc-200 tracking-wide">
                {game.name}
              </span>

              {/* প্লে বাটন */}
              <button
                onClick={() => setPlayingGameId(game.id)}
                className="bg-lime-500 hover:bg-lime-400 text-black font-bold text-xs px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Play
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🖥️ গেম প্লেয়িং ইন্টারফেস (মডাল ভিউ) */}
      {playingGameId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#060c07] border border-lime-500/30 rounded-2xl p-6 w-full max-w-xl relative shadow-2xl flex flex-col items-center">

            {/* ক্লোজ বাটন */}
            <button
              onClick={() => setPlayingGameId(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 text-xs uppercase font-bold tracking-wider cursor-pointer border border-lime-950/50 bg-[#0b110c] px-2 py-1 rounded"
            >
              [✕ Close Console]
            </button>

            {/* লাইভ গেম মাউন্ট লজিক */}
            <div className="mt-6 w-full flex justify-center items-center min-h-[420px]">
              {playingGameId === "math" && <MathMcqGame />}
              {playingGameId === "minicup" && <GoogleMiniCup />} {/* আপনার কার্টুন গেমটি এখানে লোড হবে */}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 🔮 DYNAMIC MATH MCQ GAME PROTOCOL
// ==========================================
function MathMcqGame() {
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const generateQuestion = () => {
    const operators = ["+", "-", "*", "/"];
    const randomOp = operators[Math.floor(Math.random() * operators.length)];

    let num1, num2, correctAnswer;

    switch (randomOp) {
      case "+":
        num1 = Math.floor(Math.random() * 80) + 10;
        num2 = Math.floor(Math.random() * 80) + 10;
        correctAnswer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 80) + 20;
        num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
        correctAnswer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
        correctAnswer = num1 * num2;
        break;
      case "/":
        num2 = Math.floor(Math.random() * 10) + 2;
        correctAnswer = Math.floor(Math.random() * 10) + 2;
        num1 = num2 * correctAnswer;
        break;
      default:
        break;
    }

    const symbolMap = { "+": "➕", "-": "➖", "*": "✖", "/": "➗" };

    const wrongOptions = new Set();
    while (wrongOptions.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrongAns = correctAnswer + offset;
      if (wrongAns !== correctAnswer && wrongAns >= 0) {
        wrongOptions.add(wrongAns);
      }
    }

    const allOptions = [correctAnswer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      num1,
      num2,
      operatorSymbol: symbolMap[randomOp],
      options: allOptions,
      correctAnswer
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const startGame = () => {
    setScore(0);
    setQuestionCount(1);
    setGameOver(false);
    setGameStarted(true);
    generateQuestion();
  };

  const handleOptionClick = (option) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option);
    const check = option === currentQuestion.correctAnswer;
    setIsCorrect(check);

    if (check) {
      setScore(prev => prev + 20);
    }
  };

  const handleNext = () => {
    if (questionCount >= 5) {
      setGameOver(true);
    } else {
      setQuestionCount(prev => prev + 1);
      generateQuestion();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full font-mono max-w-sm text-center">

      <div className="flex justify-between w-full text-xs text-zinc-500 border-b border-lime-950/40 pb-2 mb-2">
        <span>MODULE: MATH_MCQ.SYS</span>
        <span className="text-lime-500 font-bold">SCORE: {score}</span>
      </div>

      {!gameStarted || gameOver ? (
        <div className="bg-[#0b110c] border border-lime-950/60 p-6 rounded-xl w-full flex flex-col items-center gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {gameOver ? "📊 Session Evaluation" : "🧮 Math Matrix Decoder"}
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {gameOver
              ? `Verification sequence finished. Total points secured: ${score}/100.`
              : "Solve dynamic arithmetic node puzzles using standard core operators."}
          </p>
          <button
            onClick={startGame}
            className="w-full bg-lime-500 text-black text-xs font-bold py-2 rounded-lg uppercase tracking-wider cursor-pointer transition-all hover:bg-lime-400"
          >
            {gameOver ? "Run Diagnostics Again" : "Boot Math Stream"}
          </button>
        </div>
      ) : (
        currentQuestion && (
          <div className="w-full space-y-4">

            <div className="text-[10px] text-zinc-600 uppercase tracking-widest text-left">
              Processing Node: {questionCount} / 5
            </div>

            <div className="bg-[#0b110c] border border-lime-950/80 rounded-xl py-6 flex items-center justify-center gap-4 text-xl font-black text-white shadow-inner">
              <span className="font-sans bg-[#050a06] border border-lime-950 px-3 py-1 rounded-lg shadow">{currentQuestion.num1}</span>
              <span className="text-lime-500 text-base">{currentQuestion.operatorSymbol}</span>
              <span className="font-sans bg-[#050a06] border border-lime-950 px-3 py-1 rounded-lg shadow">{currentQuestion.num2}</span>
              <span className="text-zinc-600">=</span>
              <span className="text-cyan-400 font-sans tracking-widest">?</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = "bg-[#050a06] border border-lime-950/80 text-zinc-300 hover:border-lime-500/40 hover:text-white";

                if (selectedAnswer !== null) {
                  if (option === currentQuestion.correctAnswer) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                  } else if (selectedAnswer === option && !isCorrect) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-400 font-bold";
                  } else {
                    btnStyle = "bg-[#050a06]/50 border-lime-950/30 text-zinc-700 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleOptionClick(option)}
                    className={`p-3 rounded-xl text-center text-sm font-sans transition-all cursor-pointer ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="pt-2 space-y-3">
                <div className={`text-[11px] uppercase font-bold tracking-wider ${isCorrect ? "text-emerald-400" : "text-red-500"}`}>
                  {isCorrect ? "✓ Access Granted: Correct Value Match" : "✕ Access Denied: Vector Mismatch"}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full bg-cyan-500 text-black font-bold text-xs py-2 rounded-lg uppercase tracking-wider cursor-pointer transition-all hover:bg-cyan-400 shadow-md"
                >
                  {questionCount === 5 ? "Compile Final Report" : "Load Next Query →"}
                </button>
              </div>
            )}

          </div>
        )
      )}
    </div>
  );
}