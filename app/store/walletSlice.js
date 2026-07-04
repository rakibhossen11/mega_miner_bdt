import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 📡 থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের প্রোফাইল ও ওয়ালেটের কম্বাইন্ড ডাটা লোড করা
export const fetchWalletData = createAsyncThunk(
  "wallet/fetchWalletData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/user-profile");
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json.data; // এখানে ইউজারের profile আইডি, ইমেইল সহ রিটার্ন করবে
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📡 থাঙ্ক: মাইনিং কয়েন ক্লেইম করা
export const claimMiningRewards = createAsyncThunk(
  "wallet/claimMiningRewards",
  async (amount, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/sync-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount, 
          action: "COLLECT" 
        })
      });
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📡 থাঙ্ক: হিস্ট্রি আইটেম ক্লেইম করা
export const claimHistoryItem = createAsyncThunk(
  "wallet/claimHistoryItem",
  async (amount, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/sync-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount, 
          action: "CLAIM_HISTORY" 
        })
      });
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📡 থাঙ্ক: সিঙ্ক টু ভল্ট
export const syncToVault = createAsyncThunk(
  "wallet/syncToVault",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/sync-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC" })
      });
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    // 🔐 নতুন অথেনটিকেশন ও ইউজার ডাটা স্টেট
    userId: null,
    email: "",
    joined: null,
    isAuthenticated: false,

    // 💰 আগের ওয়ালেট ও ডিসপ্লে স্টেট
    name: "Loading...",
    avatar: "..",
    totalCoin: 0.00000000,
    totalDollar: 0.00,
    dbMiningWallet: 0.00000000,
    miningSpeed: 0.0,
    loading: false,
    error: null,
    isCoinAnimating: false,
    sessionId: null,
    miningHistory: [],
  },
  reducers: {
    // 🧹 লগআউট এর সময় রিডাক্স স্টেট ম্যানুয়ালি রিসেট করার জন্য নতুন রিডিউসার
    purgeSession: (state) => {
      state.userId = null;
      state.email = "";
      state.joined = null;
      state.isAuthenticated = false;
      state.name = "Guest Node";
      state.avatar = "??";
      state.totalCoin = 0;
      state.totalDollar = 0;
      state.dbMiningWallet = 0;
      state.miningHistory = [];
    },
    updateBalances: (state, action) => {
      state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
      state.totalDollar = parseFloat(action.payload.newTotalDollar || 0);
    },
    collectMiningRewards: (state, action) => {
      state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
      state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
    },
    updateMiningWallet: (state, action) => {
      state.dbMiningWallet = parseFloat(action.payload || 0);
    },
    updateTotalAndMiningWallet: (state, action) => {
      state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
      state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
    },
    setCoinAnimation: (state, action) => {
      state.isCoinAnimating = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setMiningHistory: (state, action) => {
      state.miningHistory = action.payload;
    },
    addMiningHistoryEntry: (state, action) => {
      state.miningHistory = [action.payload, ...state.miningHistory];
    },
    updateMiningHistoryEntry: (state, action) => {
      const { id, claimed } = action.payload;
      state.miningHistory = state.miningHistory.map(item => 
        item.id === id ? { ...item, claimed } : item
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet Data (এখানেই ইউজার ও প্রোফাইল ডাটা রিডাক্সে রাইট হবে)
      .addCase(fetchWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        
        // 💾 সার্ভার রেসপন্স থেকে ইউজার স্পেসিফিক ডাটা স্টোর করা
        state.userId = action.payload.id || null;
        state.email = action.payload.email || "";
        state.joined = action.payload.joined || null;
        state.isAuthenticated = !!action.payload.id; // আইডি থাকলে ট্রু হবে

        state.name = action.payload.name || "User Node";
        state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
        state.totalCoin = parseFloat(action.payload.totalCoin || 0);
        state.totalDollar = parseFloat(action.payload.totalDollar || 0);
        state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0);
        state.miningSpeed = parseFloat(action.payload.miningSpeed || 1.5);
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to load secure node data.";
      })
      
      // Claim Mining Rewards
      .addCase(claimMiningRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimMiningRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
        state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
        state.isCoinAnimating = true;
      })
      .addCase(claimMiningRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to claim rewards.";
      })
      
      // Claim History Item
      .addCase(claimHistoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimHistoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
        state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
        state.isCoinAnimating = true;
      })
      .addCase(claimHistoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to claim history item.";
      })
      
      // Sync to Vault
      .addCase(syncToVault.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncToVault.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
        state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
        state.isCoinAnimating = true;
      })
      .addCase(syncToVault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to sync to vault.";
      });
  },
});

export const { 
  purgeSession, // এক্সপোর্ট করা হলো
  updateBalances,
  updateMiningWallet, 
  updateTotalAndMiningWallet, 
  collectMiningRewards, 
  setCoinAnimation,
  setSessionId,
  setMiningHistory,
  addMiningHistoryEntry,
  updateMiningHistoryEntry
} = walletSlice.actions;

export default walletSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import toast from "react-hot-toast"; // 🚀 গ্লোবাল টোস্ট ফিডব্যাকের জন্য

// // 📡 থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের প্রোফাইল ও ওয়ালেটের কম্বাইন্ড ডাটা লোড করা
// export const fetchWalletData = createAsyncThunk(
//   "wallet/fetchWalletData",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile");
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json.data; // এখানে ইউজারের profile আইডি, ইমেইল সহ রিটার্ন করবে
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 📡 থাঙ্ক: মাইনিং কয়েন ক্লেইম করা (🚀 পাথ ফিক্সড: /api/dashboard/user-profile)
// export const claimMiningRewards = createAsyncThunk(
//   "wallet/claimMiningRewards",
//   async (amount, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           amount: amount, 
//           action: "COLLECT" 
//         })
//       });
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 📡 থাঙ্ক: হিস্ট্রি আইটেম ক্লেইম করা (🚀 পাথ ফিক্সড: /api/dashboard/user-profile)
// export const claimHistoryItem = createAsyncThunk(
//   "wallet/claimHistoryItem",
//   async (amount, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           amount: amount, 
//           action: "CLAIM_HISTORY" 
//         })
//       });
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// -- 📡 থাঙ্ক: সিঙ্ক টু ভল্ট (🚀 পাথ ফিক্সড: /api/dashboard/user-profile)
// export const syncToVault = createAsyncThunk(
//   "wallet/syncToVault",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "SYNC" })
//       });
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// const walletSlice = createSlice({
//   name: "wallet",
//   initialState: {
//     // 🔐 অথেনটিকেশন ও ইউজার ডাটা স্টেট
//     userId: null,
//     email: "",
//     joined: null,
//     isAuthenticated: false,

//     // 💰 নতুন ওয়ালেট ও ডিসপ্লে স্টেট (আপনার নতুন কলামের সাথে ম্যাচড)
//     name: "Loading...",
//     avatar: "..",
//     totalCoin: 0.00000000,
//     totalDollar: 0.00,
//     dbMiningWallet: 0.00000000,
//     miningSpeed: 0.0,
//     boostPower: 1.00, // 🚀 নতুন স্কিমার কলাম সংযুক্ত করা হলো
//     loading: false,
//     error: null,
//     isCoinAnimating: false,
//     sessionId: null,
//     miningHistory: [],
//   },
//   reducers: {
//     // 🧹 লগআউট এর সময় স্টেট রিসেট
//     purgeSession: (state) => {
//       state.userId = null;
//       state.email = "";
//       state.joined = null;
//       state.isAuthenticated = false;
//       state.name = "Guest Node";
//       state.avatar = "??";
//       state.totalCoin = 0;
//       state.totalDollar = 0;
//       state.dbMiningWallet = 0;
//       state.boostPower = 1.00;
//       state.miningHistory = [];
//     },
//     updateBalances: (state, action) => {
//       state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//       state.totalDollar = parseFloat(action.payload.newTotalDollar || 0);
//     },
//     collectMiningRewards: (state, action) => {
//       state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//       state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
//     },
//     updateMiningWallet: (state, action) => {
//       state.dbMiningWallet = parseFloat(action.payload || 0);
//     },
//     updateTotalAndMiningWallet: (state, action) => {
//       state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//       state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
//     },
//     setCoinAnimation: (state, action) => {
//       state.isCoinAnimating = action.payload;
//     },
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//     },
//     setMiningHistory: (state, action) => {
//       state.miningHistory = action.payload;
//     },
//     addMiningHistoryEntry: (state, action) => {
//       state.miningHistory = [action.payload, ...state.miningHistory];
//     },
//     updateMiningHistoryEntry: (state, action) => {
//       const { id, claimed } = action.payload;
//       state.miningHistory = state.miningHistory.map(item => 
//         item.id === id ? { ...item, claimed } : item
//       );
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Wallet Data 
//       .addCase(fetchWalletData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchWalletData.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // 💾 নতুন এপিআই রেসপন্স (result.data) এর কি-নাম অনুযায়ী ম্যাপিং ফিক্সড
//         state.userId = action.payload.userId || null;
//         state.email = action.payload.userEmail || "";
//         state.joined = action.payload.joined || null;
//         state.isAuthenticated = !!action.payload.userId; 

//         state.name = action.payload.username || "User Node";
//         state.avatar = action.payload.username ? action.payload.username.slice(0, 2).toUpperCase() : "UN";
//         state.totalCoin = parseFloat(action.payload.totalCoin || 0);
//         state.totalDollar = parseFloat(action.payload.totalDollar || 0);
//         state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0);
//         state.miningSpeed = parseFloat(action.payload.miningSpeed || 1.5);
//         state.boostPower = parseFloat(action.payload.boostPower || 1.00); // 🚀 ডেটা সিঙ্কড
//       })
//       .addCase(fetchWalletData.rejected, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.error = action.payload || "Failed to load secure node data.";
//       })
      
//       // Claim Mining Rewards
//       .addCase(claimMiningRewards.fulfilled, (state, action) => {
//         state.loading = false;
//         state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//         state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
//         state.isCoinAnimating = true;
//         toast.success(action.payload.message || "Rewards collected!"); // 🚀 লাইভ টোস্ট
//       })
//       .addCase(claimMiningRewards.rejected, (state, action) => {
//         state.loading = false;
//         toast.error(action.payload || "Failed to claim rewards."); // 🚀 এরর টোস্ট
//       })
      
//       // Claim History Item
//       .addCase(claimHistoryItem.fulfilled, (state, action) => {
//         state.loading = false;
//         state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//         state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
//         state.isCoinAnimating = true;
//         toast.success(action.payload.message || "Milestone claimed!");
//       })
//       .addCase(claimHistoryItem.rejected, (state, action) => {
//         state.loading = false;
//         toast.error(action.payload || "Failed to claim history item.");
//       })
      
//       // Sync to Vault
//       .addCase(syncToVault.fulfilled, (state, action) => {
//         state.loading = false;
//         state.totalCoin = parseFloat(action.payload.newTotalCoin || 0);
//         state.dbMiningWallet = parseFloat(action.payload.newMiningWallet || 0);
//         state.isCoinAnimating = true;
//         toast.success(action.payload.message || "Vault sync successful!");
//       })
//       .addCase(syncToVault.rejected, (state, action) => {
//         state.loading = false;
//         toast.error(action.payload || "Failed to sync to vault.");
//       });
//   },
// });

// export const { 
//   purgeSession, 
//   updateBalances,
//   updateMiningWallet, 
//   updateTotalAndMiningWallet, 
//   collectMiningRewards, 
//   setCoinAnimation,
//   setSessionId,
//   setMiningHistory,
//   addMiningHistoryEntry,
//   updateMiningHistoryEntry
// } = walletSlice.actions;

// export default walletSlice.reducer;