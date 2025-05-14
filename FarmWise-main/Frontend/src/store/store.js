import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/getMe/fulfilled', 'auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export { store }; 