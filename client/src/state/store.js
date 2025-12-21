import {configureStore} from "@reduxjs/toolkit"
import themeReducer from "./themeSlice";
import {setupListeners} from "@reduxjs/toolkit/query";
import authReducer from "./authSlice";
import {authApi} from "./apis/authApi"
import {api} from "./apis/api";

const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [api.reducerPath]: api.reducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, api.middleware),
});

setupListeners(store.dispatch);

export default store;