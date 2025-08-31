
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import recipesReducer from './slices/recipesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    recipes: recipesReducer,
  },
});
