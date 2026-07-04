"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/app/components/AuthProvider";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"; // 🚀 প্রিমিয়াম আইকন ইম্পোর্ট

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ পাসওয়ার্ড ভিউ স্টেট

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email/username and password.");
      return;
    }

    try {
      setLoading(true);

      // 🔐 AuthContext এর গ্লোবাল লগইন মেথড কল (টোস্ট নোটিফিকেশন এটার ভেতরেই হ্যান্ডেল হবে)
      await login(formData.email, formData.password);
      
      // ড্যাশবোর্ডে স্মুথ রিডাইরেকশন
      setTimeout(() => {
        router.push('/dashboard/profile');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error("Login Error:", err);
      // গ্লোবাল কন্টেক্সট যদি এরর থ্রো করে তবে তা এখানে ধরা পড়বে, তবে টোস্ট অলরেডি কন্টেক্সট থেকেই ফায়ার হয়ে যাবে।
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 antialiased">
      
      <div className="w-full max-w-md bg-[#111827]/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* 🔮 প্রিমিয়াম সাইবার ব্যাকগ্রাউন্ড গ্লো ইফেক্টস */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 🎯 হেডার ব্লক */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-amber-500" />
            <span>Sign in to Account</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Welcome back! Please enter your details to continue.
          </p>
        </div>

        {/* 📝 ফর্ম স্ট্রাকচার */}
        <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
          
          {/* ইউজারনেম/ইমেইল ইনপুট */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Username or Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="name@example.com or username"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* পাসওয়ার্ড ইনপুট */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* 👁️ পাসওয়ার্ড হাইড/শো বাটন */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* সাবমিট বাটন */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold p-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 text-center text-sm uppercase tracking-wider cursor-pointer mt-5"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* ফুটার লিঙ্ক */}
        <p className="text-slate-400 text-xs sm:text-sm text-center mt-6 relative z-10">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors ml-1">
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}