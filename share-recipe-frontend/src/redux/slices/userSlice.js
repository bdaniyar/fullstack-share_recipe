// store/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  joined: "",
  role: "",
  isAuthenticated: false,
  photo_url: "",
  is_active: false,
  bio: "",
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      // Map both snake_case and camelCase for compatibility
      const payload = action.payload;
      state.username = payload.username || "";
      state.first_name = payload.first_name || payload.firstname || "";
      state.last_name = payload.last_name || payload.lastname || "";
      state.email = payload.email || "";
      state.joined = payload.joined || "";
      state.role = payload.role || "";
      state.isAuthenticated = true;
      state.photo_url = payload.photo_url || "";
      state.is_active = payload.is_active ?? false;
      state.bio = payload.bio || "";
    },
    clearUser(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
