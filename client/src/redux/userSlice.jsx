// src/redux/userSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  _id: "",
  name: "",
  userName: "",
  email: "",
  profilePic: "",
  isOnline: false,
  lastSeen: null,
  selectedFriend: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.profilePic = action.payload.profilePic;
      state.isOnline = action.payload.isOnline;
      state.lastSeen = action.payload.lastSeen;
    },
    logout: (state) => {
      state._id = "";
      state.name = "";
      state.userName = "";
      state.email = "";
      state.profilePic = "";
      state.isOnline = false;
      state.lastSeen = null;
      state.selectedFriend = null;
    },
    setSelectedFriend: (state, action) => {
      state.selectedFriend = action.payload;
    }
  },
});

// Export the updated actions
export const { setUser, logout, setSelectedFriend } = userSlice.actions;

export default userSlice.reducer;