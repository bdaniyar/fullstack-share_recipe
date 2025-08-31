import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recipes: [],
};

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setRecipes: (state, action) => {
      state.recipes = action.payload;
    },
    clearRecipes: (state) => {
      state.recipes = [];
    },
  },
});

export const {
  setRecipes,
  clearRecipes,
} = recipesSlice.actions;

export default recipesSlice.reducer;
