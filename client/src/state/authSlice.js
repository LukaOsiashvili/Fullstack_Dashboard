import {createSlice} from "@reduxjs/toolkit"
import {isTokenExpired} from "../middleware/middlewareFunctions";
import {api} from "./apis/api";

const initialState = {
    user: localStorage.getItem("user") || null,
    accessToken: localStorage.getItem("accessToken") || null,
    // isLoggedIn: !!localStorage.getItem("accessToken") || false,
    isLoggedIn: !isTokenExpired(localStorage.getItem("accessToken")),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const {user, accessToken} = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            if(state.accessToken && !isTokenExpired(state.accessToken)) {
                state.isLoggedIn = true;
            }
            localStorage.setItem("user", user);
            localStorage.setItem("accessToken", accessToken);
        },
        logout: (state, action) => {
            state.user = null;
            state.accessToken = null;
            state.isLoggedIn = false;
            state = null;
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
        },
    },
})

export const {setCredentials, logout} = authSlice.actions;

export const logoutAndClear = () => (dispatch) => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
};

export default authSlice.reducer;