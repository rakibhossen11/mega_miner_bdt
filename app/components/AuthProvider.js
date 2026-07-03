'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      console.error('Session ledger verification failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
      await checkSession(); // লগইনের পর সেশন রি-সিঙ্ক
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }

      const data = await res.json();
      await checkSession();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
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

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   console.log('auth provider', user);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // 🔄 ১. সেশন চেক করা এবং ইউজারের লাইভ ওয়ালেট ডাটা লোড করা
//   const checkSession = async () => {
//     try {
//       // আমরা যে ডাইনামিক এপিআই বানিয়েছিলাম, কুকি থেকে অটো ইউজার রিড করবে
//       const res = await fetch('/api/auth/session');
//       console.log('auth page', res);

//       if (res.ok) {
//         const result = await res.json();
//         console.log('auth page', result);
//         if (result.success) {
//           setUser(result.data); // ডাইনামিক ওয়ালেট ও প্রোফাইল ডাটা স্টেটে সেট
//         } else {
//           setUser(null);
//         }
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Session ledger synchronization failed:', error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔑 ২. ইউজার লগইন (Sign In)
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

//       // লগইন সাকসেস হলে সাথে সাথে তার প্রোফাইল ও ওয়ালেট ডাটা সিঙ্ক করার জন্য সেশন চেক কল করা
//       await checkSession();

//       return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // 📝 ৩. ইউজার রেজিস্ট্রেশন (Sign Up)
//   const register = async (name, email, password) => {
//     try {
//       const res = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password }), // অবজেক্ট আকারে ডেটা পাস করা হলো
//       });

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.error || "Registration failed");
//       }

//       const data = await res.json();

//       // রেজিস্ট্রেশনের পর ওয়ালেট ডাটাবেজ সেটআপ রানিং এর জন্য সেশন সিঙ্ক করা
//       await checkSession();

//       return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // 🚪 ৪. লগআউট (Sign Out)
//   const logout = async () => {
//     try {
//       await fetch('/api/auth/signout', { method: 'POST' });
//     } catch (error) {
//       console.error("Signout API error:", error);
//     } finally {
//       setUser(null);
//       router.push('/auth/login'); // আপনার প্রজেক্টের লগইন পেজে রিডাইরেক্ট
//     }
//   };

//   //   ⚡ প্রথমবার অ্যাপ লোড বা রিফ্রেশ হলে অটো সেশন চেক রান হবে
//   useEffect(() => {
//     checkSession();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         register,
//         logout,
//         checkSession // রিডাক্স বা কোনো অ্যাকশন শেষে ব্যালেন্স রিফ্রেশ করতে কাজে লাগবে
//       }}
//     >
//       {/* সেশন চেক করার সময় স্ক্রিন ব্ল্যাঙ্ক না রেখে একটা সিম্পল লোডিং স্টেট দেওয়া */}
//       {loading ? (
//         <div className="h-full w-full bg-[#060907] flex flex-col antialiased animate-pulse">

//           {/* ১. টপ নেভবার স্কেলিটন */}
//           <div className="w-full h-14 border-b border-lime-950/20 bg-[#0a0f0c] flex items-center justify-between px-4">
//             <div className="w-24 h-5 bg-zinc-800 rounded-lg"></div> {/* লোগো */}
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-zinc-800 rounded-full"></div> {/* নোটিফিকেশন */}
//               <div className="w-16 h-5 bg-zinc-800 rounded-lg"></div> {/* ব্যালেন্স */}
//             </div>
//           </div>

//           {/* ২. মেইন কন্টেন্ট এরিয়া স্কেলিটন (মোবাইল ফ্রেমের ভেতরের কন্টেন্ট) */}
//           <div className="flex-1 p-4 space-y-6 overflow-hidden">

//             {/* ইউজার কার্ড বা ব্যানার স্কেলিটন */}
//             <div className="w-full h-24 bg-[#0a0f0c] border border-zinc-900 rounded-2xl p-4 flex items-center gap-4">
//               <div className="w-12 h-12 bg-zinc-800 rounded-full shrink-0"></div> {/* প্রোফাইল পিক */}
//               <div className="space-y-2 flex-1">
//                 <div className="w-32 h-4 bg-zinc-800 rounded"></div>
//                 <div className="w-20 h-3 bg-zinc-800 rounded"></div>
//               </div>
//             </div>

//             {/* স্ট্যাটস বা আর্নিং কার্ডস */}
//             <div className="grid grid-cols-2 gap-3">
//               <div className="h-20 bg-[#0a0f0c] border border-zinc-900 rounded-xl p-3 space-y-2">
//                 <div className="w-12 h-3 bg-zinc-800 rounded"></div>
//                 <div className="w-16 h-5 bg-zinc-800 rounded"></div>
//               </div>
//               <div className="h-20 bg-[#0a0f0c] border border-zinc-900 rounded-xl p-3 space-y-2">
//                 <div className="w-12 h-3 bg-zinc-800 rounded"></div>
//                 <div className="w-16 h-5 bg-zinc-800 rounded"></div>
//               </div>
//             </div>

//             {/* টাস্ক বা জব লিস্ট স্কেলিটন (লুপের মতো ৩টি কার্ড) */}
//             <div className="space-y-3">
//               <div className="w-28 h-4 bg-zinc-900 rounded mb-2"></div> {/* "Available Jobs" টেক্সট */}
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="w-full h-16 bg-[#0a0f0c] border border-zinc-900/60 rounded-xl p-3 flex items-center justify-between">
//                   <div className="flex items-center gap-3 flex-1">
//                     <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0"></div> {/* টাস্ক আইকন */}
//                     <div className="space-y-1.5 flex-1">
//                       <div className="w-3/4 h-3 bg-zinc-800 rounded"></div>
//                       <div className="w-1/2 h-2.5 bg-zinc-800 rounded"></div>
//                     </div>
//                   </div>
//                   <div className="w-14 h-6 bg-zinc-800 rounded-full"></div> {/* বাটন */}
//                 </div>
//               ))}
//             </div>

//           </div>

//           {/* ৩. বটম নেভবার স্কেলিটন */}
//           <div className="w-full h-16 border-t border-lime-950/20 bg-[#0a0f0c] flex items-center justify-around px-2">
//             {[1, 2, 3, 4, 5].map((i) => (
//               <div key={i} className="flex flex-col items-center gap-1">
//                 <div className="w-5 h-5 bg-zinc-800 rounded"></div>
//                 <div className="w-8 h-2 bg-zinc-800 rounded"></div>
//               </div>
//             ))}
//           </div>

//           {/* ফ্লোটিং টেক্সট (আপনার আগের নোটিফিকেশনটি প্রফেশনাল স্টাইলে নিচে ব্লার মোডে শো করবে) */}
//           <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] pointer-events-none">
//             <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-full px-4 py-2 flex items-center shadow-2xl">
//               <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2.5"></div>
//               <span className="text-xs font-medium text-zinc-300 tracking-wide">Syncing secure node...</span>
//             </div>
//           </div>

//         </div>
//       ) : (
//         children
//       )}
//       {/* {loading ? (
//         <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
//           <span className="ml-3 text-sm text-zinc-400">Verifying safe node session...</span>
//         </div>
//       ) : (
//         children
//       )} */}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }