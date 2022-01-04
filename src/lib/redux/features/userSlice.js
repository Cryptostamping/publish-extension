import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    moralisUser: null,
    isLoggedIn: false,
  },
  reducers: {
    setMoralisUser: (state, action) => {
      state.moralisUser = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setMoralisUser,
  setLoggedIn,
} = userSlice.actions;

export default userSlice.reducer;
