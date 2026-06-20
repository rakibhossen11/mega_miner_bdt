import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 📡 ১. থাঙ্ক (Thunk): ডাটাবেজ থেকে ইউজারের ওয়ালেট প্রোফাইল ডাটা লোড করা
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

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    name: "Loading...",
    avatar: "..",
    totalCoin: 0,
    dbMiningWallet: 0.00000000,
    miningSpeed: 0.0,
    loading: false,
    error: null,
    isCoinAnimating: false, // 🪙 টপবার অ্যানিমেশন ট্র্যাকার স্টেট
  },
  reducers: {
    // 📥 লোকাল রিডিউসার: Collect বাটনের রেসপন্স থেকে টপবার ও মাইনিং ওয়ালেট সিঙ্ক করা
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
    // অ্যানিমেশন অন/অফ ট্র্যাকার
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
        state.name = action.payload.name || "User Node";
        state.avatar = action.payload.name ? action.payload.name.slice(0, 2).toUpperCase() : "UN";
        state.totalCoin = parseFloat(action.payload.totalCoin || 0);
        state.dbMiningWallet = parseFloat(action.payload.miningWallet || 0); 
        state.miningSpeed = action.payload.miningSpeed || 0.0;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wallet core data.";
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