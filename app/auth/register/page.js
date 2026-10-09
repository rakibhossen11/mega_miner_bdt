"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider"; 
import { Eye, EyeOff, User, Mail, Lock, UserPlus, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register } = useAuth() || {};

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
  const [showPassword, setShowPassword] = useState(false);

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

      if (register) {
        const data = await register(formData);
        if (data.success) {
          setSuccessMsg(data.message || "Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard"); // অথবা আপনার ইউজার হোম পেজ
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || "Network connectivity issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0a0f0c]/90 backdrop-blur-2xl border border-[#2EFF2E]/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#2EFF2E]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#2EFF2E]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-[#2EFF2E]" />
          <span>Create Account</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Join Fyermm and start earning rewards daily.
        </p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-5 bg-[#2EFF2E]/10 border border-[#2EFF2E]/30 text-[#2EFF2E] p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span>🎉</span> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
        
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Username *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <User className="w-4 h-4 text-[#2EFF2E]/70" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g., rahim_99"
              className="w-full bg-[#040805]/80 border border-slate-800 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-[#2EFF2E] focus:ring-1 focus:ring-[#2EFF2E]/30 transition-all text-sm"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Mail className="w-4 h-4 text-[#2EFF2E]/70" />
            </span>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              className="w-full bg-[#040805]/80 border border-slate-800 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-[#2EFF2E] focus:ring-1 focus:ring-[#2EFF2E]/30 transition-all text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Password *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Lock className="w-4 h-4 text-[#2EFF2E]/70" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full bg-[#040805]/80 border border-slate-800 rounded-xl p-3 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-[#2EFF2E] focus:ring-1 focus:ring-[#2EFF2E]/30 transition-all text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-[#2EFF2E] cursor-pointer transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 text-[#2EFF2E] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Referral Code {isRefLocked ? "(Locked)" : "(Optional)"}</span>
          </label>
          <input
            type="text"
            placeholder={isRefLocked ? "" : "Enter referrer username if any"}
            disabled={isRefLocked}
            className={`w-full border rounded-xl p-3 text-sm transition-all focus:outline-none ${
              isRefLocked 
                ? "text-[#2EFF2E] border-[#2EFF2E]/40 bg-[#2EFF2E]/5 cursor-not-allowed font-bold tracking-wide opacity-90" 
                : "bg-[#040805]/80 text-white border-slate-800 focus:border-[#2EFF2E] focus:ring-1 focus:ring-[#2EFF2E]/30"
            }`}
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2EFF2E] text-[#060907] font-bold p-3.5 rounded-xl hover:bg-[#26d626] active:scale-[0.99] transition-all shadow-lg shadow-[#2EFF2E]/20 disabled:opacity-50 text-center text-sm uppercase tracking-wider cursor-pointer mt-4"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#060907] border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Node...</span>
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <p className="text-slate-400 text-xs sm:text-sm text-center mt-6 relative z-10">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#2EFF2E] hover:underline font-semibold transition-all ml-1">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-[#060907] flex items-center justify-center p-4 antialiased">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-[#2EFF2E] text-sm">
          <div className="w-4 h-4 border-2 border-[#2EFF2E] border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing Secure Engine...</span>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}