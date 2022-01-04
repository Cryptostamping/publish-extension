import { createSlice } from "@reduxjs/toolkit";

export const stamperSlice = createSlice({
  name: "stamper",
  initialState: {
    user: null,
    userStampsCount: 0,
    userBalance: 0,
    userAddress: null,
    url: null,
    embedId: null,
    title: null,
    currentChain: null,
    testnet: false,
    dataTheme: "light",
    showStampSelector: false,
    showStampLister: false,
    currentStamping: null,
    myStamps: [],
    stampings: [],
    stampingsCount: 0,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setCurrentChain: (state, action) => {
      state.currentChain = action.payload;
    },
    setCurrentStamping: (state, action) => {
      state.currentStamping = action.payload;
    },
    setDataTheme: (state, action) => {
      state.dataTheme = action.payload;
    },
    setURL: (state, action) => {
      state.url = action.payload;
    },
    setEmbedId: (state, action) => {
      state.embedId = action.payload;
    },
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setSettings: (state, action) => {
      state.title = action.payload?.title;
      state.url = action.payload?.url;
      if (action.payload?.embedId) 
        state.embedId = action.payload?.embedId;
      state.testnet = action.payload?.testnet;
    },
    setTestnet: (state, action) => {
      state.testnet = action.payload;
    },
    setStampSelector: (state, action) => {
      state.showStampSelector = action.payload;
    },
    setStampLister: (state, action) => {
      state.showStampLister = action.payload;
    },
    setMyStamps: (state, action) => {
      state.myStamps = action.payload;
    },
    setStampings: (state, action) => {
      state.stampings = action.payload;
    },
    updateStamping: (state, action) => {
      let this_stamping = action.payload;
      let this_stampings = [...state.stampings];
      for (let i = 0; i < this_stampings.length; i++) {
        if (this_stampings[i]?.objectId === this_stamping.objectId) {
          if (this_stamping.destroyed) {
            state.stampings.splice(i, 1);
            state.currentStamping = null;
            state.stampingsCount = state.stampingsCount - 1;
            return;
          }
          state.currentStamping = this_stamping;
          state.stampings[i] = this_stamping;
          return;
        }
      }
      state.currentStamping = this_stamping;
      state.stampings.push(this_stamping);
      state.stampingsCount += 1;
      return;
    },
    setUserStampsCount: (state, action) => {
      state.userStampsCount = action.payload;
    },
    setStampingsCount: (state, action) => {
      state.stampingsCount = action.payload;
    },
    setUserBalance: (state, action) => {
      state.userBalance = action.payload;
    },
    setUserAddress: (state, action) => {
      state.userAddress = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setUser,
  setURL,
  setEmbedId,
  setTestnet,
  setStampSelector,
  setCurrentChain,
  setMyStamps,
  setStampings,
  setTitle,
  setUserStampsCount,
  setUserBalance,
  setUserAddress,
  setStampingsCount,
  setCurrentStamping,
  updateStamping,
  setSettings,
  setStampLister,
  setDataTheme,
} = stamperSlice.actions;

export default stamperSlice.reducer;
