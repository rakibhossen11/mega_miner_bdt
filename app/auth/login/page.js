"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/app/components/AuthProvider";
import { Eye, EyeOff, Mail, Lock, LogIn, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email/username and password.");
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      
      setTimeout(() => {
        router.push('/dashboard/profile');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 antialiased selection:bg-[#2EFF2E] selection:text-slate-950">
      
      <div className="w-full max-w-md bg-[#0b101d]/90 backdrop-blur-3xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(46,255,46,0.08)] relative overflow-hidden">
        
        {/* 🔮 Cyber-Neon Brand Background Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#2EFF2E]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* 🎯 fyermm Branding Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2EFF2E] to-emerald-600 shadow-lg shadow-[#2EFF2E]/20 mb-4 border border-[#2EFF2E]/30">
            <Zap className="w-7 h-7 text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2EFF2E] to-emerald-400">fyermm</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sign in to access your dashboard, mining node, and earnings.
          </p>
        </div>

        {/* 📝 Form Structure */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          {/* Email / Username Field */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
              Username or Email
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-[#2EFF2E] transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="name@example.com or username"
                className="w-full bg-[#060913]/90 border border-slate-800/80 rounded-xl p-3.5 pl-11 text-white placeholder-slate-600 focus:outline-none focus:border-[#2EFF2E] focus:ring-2 focus:ring-[#2EFF2E]/20 transition-all text-sm font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-[#2EFF2E] hover:text-emerald-400 transition-colors font-semibold">
                Forgot password?
              </Link>
            </div>
            
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-[#2EFF2E] transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your secure password"
                className="w-full bg-[#060913]/90 border border-slate-800/80 rounded-xl p-3.5 pl-11 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-[#2EFF2E] focus:ring-2 focus:ring-[#2EFF2E]/20 transition-all text-sm font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2EFF2E] to-emerald-500 text-slate-950 font-extrabold p-4 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#2EFF2E]/20 disabled:opacity-50 text-center text-sm uppercase tracking-wider cursor-pointer mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </div>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800/60 relative z-10">
          <p className="text-slate-400 text-xs sm:text-sm">
            Don't have an account on fyermm?{" "}
            <Link href="/auth/register" className="text-[#2EFF2E] hover:text-emerald-400 font-bold transition-colors ml-1">
              Sign Up Free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}