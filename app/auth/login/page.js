"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email/username and password.");
      return;
    }

    try {
      setLoading(true); // বাটন লোডিং স্টেট চালু

      // 🔄 ফিক্সড: formData থেকে ইমেইল এবং পাসওয়ার্ড রিড করা হচ্ছে
      console.log(formData.email, formData.password);
      await login(formData.email, formData.password);
      
      toast.success("Welcome back! Login successful.");
      
      setTimeout(() => {
        router.push('/dashboard/profile');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false); // বাটন লোডিং স্টেট বন্ধ
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 antialiased">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            Sign in to Account
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Welcome back! Please enter your details to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Username or Email Address
            </label>
            <input
              type="text"
              required
              placeholder="name@example.com or username"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-300 block">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-amber-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold p-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 text-center text-sm uppercase tracking-wider cursor-pointer mt-2"
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

        <p className="text-slate-400 text-xs sm:text-sm text-center mt-6 relative z-10">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}