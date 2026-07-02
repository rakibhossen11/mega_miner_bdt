'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  console.log(user);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔄 ১. সেশন চেক করা এবং ইউজারের লাইভ ওয়ালেট ডাটা লোড করা
  const checkSession = async () => {
    try {
      // আমরা যে ডাইনামিক এপিআই বানিয়েছিলাম, কুকি থেকে অটো ইউজার রিড করবে
      const res = await fetch('/api/dashboard/user-profile');
      console.log('auth page',res);
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setUser(result.data); // ডাইনামিক ওয়ালেট ও প্রোফাইল ডাটা স্টেটে সেট
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session ledger synchronization failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 ২. ইউজার লগইন (Sign In)
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await res.json();
      
      // লগইন সাকসেস হলে সাথে সাথে তার প্রোফাইল ও ওয়ালেট ডাটা সিঙ্ক করার জন্য সেশন চেক কল করা
      await checkSession();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // 📝 ৩. ইউজার রেজিস্ট্রেশন (Sign Up)
  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), // অবজেক্ট আকারে ডেটা পাস করা হলো
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }

      const data = await res.json();
      
      // রেজিস্ট্রেশনের পর ওয়ালেট ডাটাবেজ সেটআপ রানিং এর জন্য সেশন সিঙ্ক করা
      await checkSession();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // 🚪 ৪. লগআউট (Sign Out)
  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error("Signout API error:", error);
    } finally {
      setUser(null);
      router.push('/auth/login'); // আপনার প্রজেক্টের লগইন পেজে রিডাইরেক্ট
    }
  };

//   ⚡ প্রথমবার অ্যাপ লোড বা রিফ্রেশ হলে অটো সেশন চেক রান হবে
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, 
        loading,
        login,
        register,
        logout,
        checkSession // রিডাক্স বা কোনো অ্যাকশন শেষে ব্যালেন্স রিফ্রেশ করতে কাজে লাগবে
      }}
    >
      {/* সেশন চেক করার সময় স্ক্রিন ব্ল্যাঙ্ক না রেখে একটা সিম্পল লোডিং স্টেট দেওয়া */}
      {loading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-sm text-zinc-400">Verifying safe node session...</span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}