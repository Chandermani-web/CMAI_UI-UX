import { configureStore } from '@reduxjs/toolkit';
import resumeSlice from './resumeSlice.js';
import authSlice from './authSlice.js';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        resume: resumeSlice,
    },
});