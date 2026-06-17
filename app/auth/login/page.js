"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    identifier: "", // Accepts either Username or Email
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.identifier || !formData.password) {
      setError("Please fill out all credentials.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (json.success) {
        setSuccessMsg(json.message);
        // Successful login routes directly to core Dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(json.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Network pipeline mismatch. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Header Block */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Secure Sign In
          </h2>
          <p className="text-slate-400 text-sm">Access your node dashboard and synchronization grid.</p>
        </div>

        {/* Dynamic Warning Notification Popups */}
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

        {/* Login Form Core */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Username or Email
            </label>
            <input
              type="text"
              required
              placeholder="Enter your registration username/email"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black p-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 text-center text-sm uppercase tracking-wider"
          >
            {loading ? "Authenticating Token..." : "Sign In"}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="text-slate-500 text-sm text-center mt-6">
          Do not have an account?{" "}
          <Link href="/auth/register" className="text-amber-400 hover:underline font-medium">
            Sign Up Now
          </Link>
        </p>

      </div>
    </div>
  );
}