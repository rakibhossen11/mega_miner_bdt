"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // URL থেকে ?ref=username ডিটেক্ট করার ইঞ্জিন
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
      setIsRefLocked(true); // লিংক থেকে আসলে ইনপুট লক হবে
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (json.success) {
        setSuccessMsg(json.message);
        // অ্যাকাউন্ট ক্রিয়েট সফল হলে লগইন পেজে রিডাইরেক্ট
        setTimeout(() => {
          router.push("/auth/login");
        }, 2500);
      } else {
        // ব্যাকএন্ড থেকে আসা এক্সিসটিং ইউজারনেম/ভুল রেফারেল এরর এখানে ক্যাচ হবে
        setError(json.error || "Registration failed.");
      }
    } catch (err) {
      setError("Network connectivity issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-slate-400 text-sm">Join MegaMiner BDT and start earning rewards daily.</p>
      </div>

      {/* Dynamic Notifications */}
      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-sm font-semibold">
          🎉 {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Username *</label>
          <input
            type="text"
            required
            placeholder="e.g., rahim_99"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Email Address *</label>
          <input
            type="email"
            required
            placeholder="example@gmail.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Password *</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-amber-500">
            Referral Code {isRefLocked ? "(Locked)" : "(Optional)"}
          </label>
          <input
            type="text"
            placeholder={isRefLocked ? "" : "Enter referrer username if any"}
            disabled={isRefLocked}
            className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm transition-colors focus:outline-none focus:border-amber-500 ${
              isRefLocked ? "text-slate-500 bg-slate-950 cursor-not-allowed opacity-60 border-amber-500/40 font-bold" : "text-white"
            }`}
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black p-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 text-center text-sm uppercase tracking-wider"
        >
          {loading ? "Creating Node..." : "Sign Up"}
        </button>
      </form>

      <p className="text-slate-500 text-sm text-center mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-amber-400 hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">Initializing Secure Engine...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}