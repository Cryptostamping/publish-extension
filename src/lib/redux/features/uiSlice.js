import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isMarketOpen: false,
    isWalletOpen: false,
    isTrailerOpen: false,
    isWhitelistOpen: false,
    isTopLoading: false,
    cutOut: null,
    badgeNFTs: [],
  },
  reducers: {
    setTopLoading: (state, action) => {
      state.isTopLoading = action.payload;
    },
    setSidebarOpen: (state,action) => {
      if(action.payload.type === "Trailer"){
        state.isTrailerOpen = action.payload.open;
        return;
      }
      if(action.payload.type === "Wallet"){
        state.isWalletOpen = action.payload.open;
        return;
      }
      if(action.payload.type === "Whitelist"){
        state.isWhitelistOpen = action.payload.open;
        return;
      }
    },
    setBadgeNFTs: (state, action) => {
      state.badgeNFTs = action.payload;
    },
    setThemeColor: (state, action) => {
      state.cutOut.mainThemeColor = action.payload;
    },
    setCutOut: (state, action) => {
      state.cutOut = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSidebarOpen, setTopLoading, setBadgeNFTs, setCutOut } = uiSlice.actions;

export default uiSlice.reducer;
