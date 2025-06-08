import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import filesReducer from './filesSlice';
import uploadReducer from './uploadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
