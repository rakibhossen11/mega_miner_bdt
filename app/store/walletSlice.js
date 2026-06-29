import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 📡 থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের প্রোফাইল ও ওয়ালেটের কম্বাইন্ড ডাটা লোড করা
export const fetchWalletData = createAsyncThunk(
  "wallet/fetchWalletData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/user-profile");
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📡 থাঙ্ক: মাইনিং কয়েন ক্লেইম করা
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
    name: "Loading...",
    avatar: "..",
    totalCoin: 0.00000000,
    totalDollar: 0.00,
    dbMiningWallet: 0.00000000,
    miningSpeed: 0.0,
    loading: false,
    error: null,
    isCoinAnimating: false,
    // মাইনিং সেশনের জন্য নতুন স্টেট
    sessionId: null,
    miningHistory: [],
  },
  reducers: {
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
      // Fetch Wallet Data
      .addCase(fetchWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name || "User Node";
        state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
        state.totalCoin = parseFloat(action.payload.totalCoin || 0);
        state.totalDollar = parseFloat(action.payload.totalDollar || 0);
        state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0);
        state.miningSpeed = parseFloat(action.payload.miningSpeed || 1.5);
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wallet data.";
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

// অ্যাকশন এক্সপোর্ট
export const { 
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

// // 📡 ১. থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের প্রোফাইল ও ওয়ালেটের কম্বাইন্ড ডাটা লোড করা
// export const fetchWalletData = createAsyncThunk(
//   "wallet/fetchWalletData",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile");
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json.data; // এই ডাটার ভেতরেই এপিআই রুটের পাঠানো অবজেক্টটি আছে
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// const walletSlice = createSlice({
//   name: "wallet",
//   initialState: {
//     name: "Loading...",
//     avatar: "..",
//     totalCoin: 0.00000000,       // মেইন ওয়ালেট কয়েন ব্যালেন্স
//     totalDollar: 0.00,           // 🪙 [NEW] কয়েন কনভার্ট হয়ে এখানে ডলার জমা হবে
//     dbMiningWallet: 0.00000000,  // মাইনিং ওয়ালেটের গ্লোবাল স্টেট
//     miningSpeed: 0.0,
//     loading: false,
//     error: null,
//     isCoinAnimating: false,
//   },
//   reducers: {
//     // 🎯 [NEW] কয়েন কনভার্ট বাটনে ক্লিক করার পর ফ্রন্টএন্ডে ইনস্ট্যান্ট ব্যালেন্স আপডেট করার রিডিউসার
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
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchWalletData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchWalletData.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // 👤 ইউজার প্রোফাইল ডাটা ম্যাপ
//         state.name = action.payload.name || "User Node";
//         state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
        
//         // 💳 🎯 এপিআই রেসপন্সের কী (Key) অনুযায়ী নিখুঁত ম্যাপিং
//         state.totalCoin = parseFloat(action.payload.totalCoin || 0);
//         state.totalDollar = parseFloat(action.payload.totalDollar || 0); // 💵 ডাটাবেজের 'totaldollar' কলামের ভ্যালু সিঙ্ক
//         state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0);
//         state.miningSpeed = parseFloat(action.payload.miningSpeed || 1.5);
//       })
//       .addCase(fetchWalletData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Failed to load wallet data.";
//       });
//   },
// });

// // অ্যাকশন এক্সপোর্ট
// export const { 
//   updateBalances, // 👈 নতুন এডিটেড একশন
//   updateMiningWallet, 
//   updateTotalAndMiningWallet, 
//   collectMiningRewards, 
//   setCoinAnimation 
// } = walletSlice.actions;

// export default walletSlice.reducer;