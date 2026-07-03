"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider"; // 🔐 আপনার AuthContext পাথ অনুযায়ী নিশ্চিত করুন
import { Eye, EyeOff, User, Mail, Lock, UserPlus, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register } = useAuth() || {}; // 🔑 কন্টেক্সট থেকে রেজিস্টার মেথড নেওয়া হলো (যদি এক্সিস্ট করে)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    referralCode: "",
  });
  
  const [isRefLocked, setIsRefLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // 👁️ পাসওয়ার্ড ভিউ স্টেট

  // URL থেকে ?ref=username ডিটেক্ট করার লাইভ মেকানিজম
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
      setIsRefLocked(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill out all mandatory fields.");
      return;
    }

    try {
      setLoading(true);

      // 📡 যদি কন্টেক্সটে register ফাংশন থাকে তবে সেটি কল হবে, অন্যথায় ডিরেক্ট এপিআই কল হবে
      if (register) {
        await register(formData);
        setSuccessMsg("Registration successful! Redirecting to dashboard...");
      } else {
        // const response = await fetch("/api/auth/register", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(formData),
        // });

        // const json = await response.json();

        // if (json.success) {
        //   setSuccessMsg(json.message || "Account created successfully! Redirecting...");
        //   setTimeout(() => {
        //     router.push("/auth/login");
        //   }, 2000);
        // } else {
        //   setError(json.error || "Registration failed.");
        // }
      }
    } catch (err) {
      setError(err.message || "Network connectivity issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      
      {/* 🔮 প্রিমিয়াম সাইবার ব্যাকগ্রাউন্ড গ্লো ইফেক্টস */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* 🎯 হেডার ব্লক */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-amber-500" />
          <span>Create Account</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Join MegaMiner BDT and start earning rewards daily.
        </p>
      </div>

      {/* ⚠️ ডায়নামিক নোটিফিকেশন অ্যালার্টস */}
      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span>🎉</span> {successMsg}
        </div>
      )}

      {/* 📝 ফর্ম স্ট্রাকচার */}
      <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
        
        {/* ইউজারনেম ইনপুট */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Username *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g., rahim_99"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        {/* ইমেইল ইনপুট */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* পাসওয়ার্ড ইনপুট (আইকন আই সহ) */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Password *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {/* 👁️ পাসওয়ার্ড লুকানো বা দেখানোর বাটন */}
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* রেফারেল কোড ইনপুট (ডাইনামিক লক মেকানিজম) */}
        <div>
          <label className="text-xs font-medium block mb-1.5 text-amber-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Referral Code {isRefLocked ? "(Locked)" : "(Optional)"}</span>
          </label>
          <input
            type="text"
            placeholder={isRefLocked ? "" : "Enter referrer username if any"}
            disabled={isRefLocked}
            className={`w-full bg-slate-950/60 border rounded-xl p-3 text-sm transition-all focus:outline-none ${
              isRefLocked 
                ? "text-slate-400 border-amber-500/30 bg-amber-950/10 cursor-not-allowed opacity-80 font-bold tracking-wide" 
                : "text-white border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
            }`}
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          />
        </div>

        {/* সাবমিট বাটন */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold p-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 text-center text-sm uppercase tracking-wider cursor-pointer mt-4"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Node...</span>
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      {/* ফুটার লিঙ্ক */}
      <p className="text-slate-400 text-xs sm:text-sm text-center mt-6 relative z-10">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors ml-1">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 antialiased">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing Secure Engine...</span>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

// "use client";
// import { useState, useEffect, Suspense } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";

// function RegisterForm() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     referralCode: "",
//   });
  
//   const [isRefLocked, setIsRefLocked] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null);

//   // URL থেকে ?ref=username ডিটেক্ট করার ইঞ্জিন
//   useEffect(() => {
//     const ref = searchParams.get("ref");
//     if (ref) {
//       setFormData((prev) => ({ ...prev, referralCode: ref }));
//       setIsRefLocked(true); // লিংক থেকে আসলে ইনপুট লক হবে
//     }
//   }, [searchParams]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMsg(null);

//     if (!formData.username || !formData.email || !formData.password) {
//       setError("Please fill out all mandatory fields.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const json = await response.json();

//       if (json.success) {
//         setSuccessMsg(json.message);
//         // অ্যাকাউন্ট ক্রিয়েট সফল হলে লগইন পেজে রিডাইরেক্ট
//         setTimeout(() => {
//           router.push("/auth/login");
//         }, 2500);
//       } else {
//         // ব্যাকএন্ড থেকে আসা এক্সিসটিং ইউজারনেম/ভুল রেফারেল এরর এখানে ক্যাচ হবে
//         setError(json.error || "Registration failed.");
//       }
//     } catch (err) {
//       setError("Network connectivity issue. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
//           Create Account
//         </h2>
//         <p className="text-slate-400 text-sm">Join MegaMiner BDT and start earning rewards daily.</p>
//       </div>

//       {/* Dynamic Notifications */}
//       {error && (
//         <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-semibold">
//           ⚠️ {error}
//         </div>
//       )}
//       {successMsg && (
//         <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-sm font-semibold">
//           🎉 {successMsg}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-5">
//         <div>
//           <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Username *</label>
//           <input
//             type="text"
//             required
//             placeholder="e.g., rahim_99"
//             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
//             value={formData.username}
//             onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//           />
//         </div>

//         <div>
//           <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Email Address *</label>
//           <input
//             type="email"
//             required
//             placeholder="example@gmail.com"
//             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
//             value={formData.email}
//             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           />
//         </div>

//         <div>
//           <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Password *</label>
//           <input
//             type="password"
//             required
//             placeholder="••••••••"
//             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
//             value={formData.password}
//             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//           />
//         </div>

//         <div>
//           <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-amber-500">
//             Referral Code {isRefLocked ? "(Locked)" : "(Optional)"}
//           </label>
//           <input
//             type="text"
//             placeholder={isRefLocked ? "" : "Enter referrer username if any"}
//             disabled={isRefLocked}
//             className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm transition-colors focus:outline-none focus:border-amber-500 ${
//               isRefLocked ? "text-slate-500 bg-slate-950 cursor-not-allowed opacity-60 border-amber-500/40 font-bold" : "text-white"
//             }`}
//             value={formData.referralCode}
//             onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black p-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 text-center text-sm uppercase tracking-wider"
//         >
//           {loading ? "Creating Node..." : "Sign Up"}
//         </button>
//       </form>

//       <p className="text-slate-500 text-sm text-center mt-6">
//         Already have an account?{" "}
//         <Link href="/auth/login" className="text-amber-400 hover:underline font-medium">
//           Sign In
//         </Link>
//       </p>
//     </div>
//   );
// }

// export default function Register() {
//   return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
//       <Suspense fallback={<div className="text-white text-sm">Initializing Secure Engine...</div>}>
//         <RegisterForm />
//       </Suspense>
//     </div>
//   );
// }