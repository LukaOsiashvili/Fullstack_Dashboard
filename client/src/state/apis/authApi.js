import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {api} from "./api";

export const authApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BASE_URL,
        credentials: "include",
    }),
    reducerPath: "authApi",
    tagTypes: ["User"],
    endpoints: (build) => ({
        register: build.mutation({
            query: (userData) => ({

                url: "/users/register",
                method: "POST",
                body: userData,
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}){
                try{
                    await queryFulfilled;
                    dispatch(api.util.invalidateTags(["AllUsers"]));
                } catch (error) {
                }
            }
        }),
        login: build.mutation({
            query: (credentials) => ({
                url: "/users/login",
                method: "POST",
                body: credentials,
            })
        }),
        logout: build.mutation({
            query: () => ({
                url: "/users/logout",
                method: "POST",
            })
        })
    })

})

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
} = authApi