import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 📡 ১. থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের প্রোফাইল ও ওয়ালেটের কম্বাইন্ড ডাটা লোড করা
export const fetchWalletData = createAsyncThunk(
  "wallet/fetchWalletData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dashboard/user-profile");
      const json = await res.json();
      if (!json.success) return rejectWithValue(json.error);
      return json.data; // এই ডাটার ভেতরেই এপিআই রুটের পাঠানো অবজেক্টটি আছে
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
    totalCoin: 0.00000000,       // মেইন ওয়ালেট ব্যালেন্স
    dbMiningWallet: 0.00000000,  // মাইনিং ওয়ালেটের গ্লোবাল স্টেট
    miningSpeed: 0.0,
    loading: false,
    error: null,
    isCoinAnimating: false,
  },
  reducers: {
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        
        // 👤 ইউজার প্রোফাইল ডাটা ম্যাপ (এপিআই এর name প্রপার্টি থেকে)
        state.name = action.payload.name || "User Node";
        state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
        
        // 💳 🎯 এপিআই রেসপন্সের কী (Key) অনুযায়ী নিখুঁত ম্যাপিং
        state.totalCoin = parseFloat(action.payload.totalCoin || 0);
        state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0);
        state.miningSpeed = parseFloat(action.payload.miningSpeed || 1.5);
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wallet data.";
      });
  },
});

export const { 
  updateMiningWallet, 
  updateTotalAndMiningWallet, 
  collectMiningRewards, 
  setCoinAnimation 
} = walletSlice.actions;

export default walletSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // 📡 ১. থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের ওয়ালেট প্রোফাইল ডাটা লোড করা
// export const fetchWalletData = createAsyncThunk(
//   "wallet/fetchWalletData",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("/api/dashboard/user-profile");
//       const json = await res.json();
//       if (!json.success) return rejectWithValue(json.error);
//       return json.data;
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
//     totalCoin: 0,
//     dbMiningWallet: 0.00000000, // মাইনিং ওয়ালেটের গ্লোবাল স্টেট
//     miningSpeed: 0.0,
//     loading: false,
//     error: null,
//     isCoinAnimating: false,
//   },
//   reducers: {
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
//         state.name = action.payload.name || "User Node";
//         state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
//         state.totalCoin = parseFloat(action.payload.totalCoin || 0);
        
//         // 🔥 ফিক্সড লাইন: রিলোড দিলে যেন ডাটাবেজের মাইনিং ওয়ালেট ব্যালেন্স এখানে সেট হয়
//         // আপনার ব্যাকএন্ড এপিআই প্রোফাইল থেকে "miningWallet" কলামের ভ্যালু রিটার্ন করে, তা এখানে ম্যাপ করা হলো
//         state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0); 
        
//         state.miningSpeed = action.payload.miningSpeed || 0.0;
//       })
//       .addCase(fetchWalletData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Failed to load wallet core data.";
//       });
//   },
// });

// export const { 
//   updateMiningWallet, 
//   updateTotalAndMiningWallet, 
//   collectMiningRewards, 
//   setCoinAnimation 
// } = walletSlice.actions;

// export default walletSlice.reducer;