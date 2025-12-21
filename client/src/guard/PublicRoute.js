import React from 'react'
import {Navigate} from "react-router-dom";
import {useSelector} from "react-redux";

const PublicRoute = ({children}) => {
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    return !isLoggedIn ? children : <Navigate to="/dashboard" />;
};

export default PublicRoute
