'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 🚀 গ্লোবাল টোস্ট নোটিফিকেশনের জন্য ইম্পোর্ট করা হলো
import { Toaster, toast } from 'react-hot-toast'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📡 লাইভ সেশন এবং ইউজার প্রোফাইল ভেরিফিকেশন ইঞ্জিন
  const checkSession = async () => {
    try {
      const res = await fetch('/api/dashboard/user-profile');
      if (res.ok) {
        const result = await res.json();
        // নতুন ডেটাবেস রেসপন্স স্ট্রাকচার চেক
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session ledger verification failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 প্রফেশনাল লগইন মেথড (টোস্ট ফিডব্যাক সহ)
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
      
      await checkSession(); // সেশন রি-সিঙ্ক
      return data;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Invalid credentials.");
      throw error;
    }
  };

  // 📝 প্রফেশনাল রেজিস্ট্রেশন মেথড (টোস্ট ফিডব্যাক সহ)
  const register = async (formData) => {
    const loadingToast = toast.loading("Configuring your miner node...");
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

      await checkSession(); // অটো-লগইন সিঙ্ক
      return data;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Registration failed.");
      throw error;
    }
  };

  // ❌ লগআউট মেথড
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

  // প্রথমবার অ্যাপ রান হওয়ার সময় সেশন ডিটেক্ট করবে
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      
      {/* 🔮 টোস্ট কনফিগারেশন: আপনার অ্যাপের সাইবার ডার্ক থিমের সাথে সিঙ্কড */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#111827', // ডার্ক গ্রে ব্যাকগ্রাউন্ড
            color: '#fff',         // হোয়াইট টেক্সট
            border: '1px solid rgba(245, 158, 11, 0.2)', //-- গোল্ডেন গ্লো বর্ডার
            borderRadius: '16px',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b', // গোল্ডেন সাকসেস আইকন
              secondary: '#111827',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // রেড এরর আইকন
              secondary: '#111827',
            },
          },
        }} 
      />

      {loading ? (
        /* 🎨 প্রিমিয়াম বুট-আপ স্ক্রিন লোডার */
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#090d16] text-white antialiased relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-full px-5 py-2.5 flex items-center shadow-2xl relative z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent mr-3"></div>
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


// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const checkSession = async () => {
//     try {
//       const res = await fetch('/api/dashboard/user-profile');
//       if (res.ok) {
//         const result = await res.json();
//         if (result.success && result.data) {
//           setUser(result.data);
//         } else {
//           setUser(null);
//         }
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Session ledger verification failed:', error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
      
//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.error || "Login failed");
//       }

//       const data = await res.json();
//       await checkSession(); // লগইনের পর সেশন রি-সিঙ্ক
//       return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const register = async (formData) => {
//     console.log(formData);
//     try {
//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       // if (!res.ok) {
//       //   const error = await res.json();
//       //   throw new Error(error.error || "Registration failed");
//       // }

//       // const data = await res.json();
//       // await checkSession();
//       // return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch('/api/auth/signout', { method: 'POST' });
//     } catch (error) {
//       console.error("Signout API error:", error);
//     } finally {
//       setUser(null);
//       router.push('/auth/login');
//     }
//   };

//   useEffect(() => {
//     checkSession();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
//       {loading ? (
//         <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
//           <span className="ml-3 text-sm text-zinc-400">Verifying safe node session...</span>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
