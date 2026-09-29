import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        auth: false,
    },

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setAuth: (state, action) => {
            state.auth = action.payload;
        }
    }
});

export const { setUser, setAuth } = authSlice.actions;
export default authSlice.reducer;