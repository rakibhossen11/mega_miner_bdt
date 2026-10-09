'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const res = await fetch('/api/dashboard/user-profile');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const loadingToast = toast.loading("Authenticating secure node...");
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Check credentials.");
      }

      toast.dismiss(loadingToast);
      toast.success("🎉 Access granted! Welcome back.");
      
      await checkSession();
      return data;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Invalid credentials.");
      throw error;
    }
  };

  const register = async (formData) => {
    const loadingToast = toast.loading("Registering new user node...");
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      toast.dismiss(loadingToast);
      toast.success("🚀 User created successfully! Logging in...");

      await checkSession();
      return data;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Registration failed.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success("Logged out from secure node.");
    } catch (error) {
      console.error("Signout API error:", error);
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#0a0f0c',
            color: '#fff',
            border: '1px solid rgba(46, 255, 46, 0.2)',
            borderRadius: '16px',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#2EFF2E',
              secondary: '#0a0f0c',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0f0c',
            },
          },
        }} 
      />

      {loading ? (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#060907] text-white antialiased relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2EFF2E]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#2EFF2E]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-[#0a0f0c] backdrop-blur-xl border border-[#2EFF2E]/20 rounded-full px-5 py-2.5 flex items-center shadow-2xl relative z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2EFF2E] border-t-transparent mr-3"></div>
            <span className="text-xs font-semibold text-zinc-300 tracking-wide">Verifying safe node session...</span>
          </div>
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