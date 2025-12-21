import React from 'react'
import {Box, Button} from "@mui/material"
import {useSelector} from 'react-redux';
import {useLogoutMutation} from "../../state/apis/authApi";
import {logout} from "../../state/authSlice"
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast"

const Dashboard = () => {

    const user = useSelector(state => state.auth.user);

    const accessToken = useSelector(state => state.auth.accessToken).split(".");

    return (
        <Box m={"1.5rem 2.5rem"}>
            <h1>Dashboard</h1>
            <ul/>
            <p>Logged in as {user}</p>
            <p>| token part 1: {accessToken[0]}</p>
            <p>| token part 2: {accessToken[1]}</p>
            <p>| token part 3: {accessToken[0]}</p>

        </Box>

    )
}
export default Dashboard
