import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './auth';
import { gallerySlice } from './gallery';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    gallery: gallerySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispach = typeof store.dispatch;
