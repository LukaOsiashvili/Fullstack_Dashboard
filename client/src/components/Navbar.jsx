import React, {useEffect, useState} from 'react'
import {
    LightModeOutlined,
    DarkModeOutlined,
    Menu as MenuIcon,
    Search,
    SearchOutlined,
    LogoutOutlined,
    ArrowDropDownOutlined,
    SettingsOutlined
} from "@mui/icons-material"
import FlexBetween from "components/FlexBetween";

import {useDispatch, useSelector} from "react-redux";
import {setMode} from "state/themeSlice"
import {
    AppBar,
    Box,
    Button,
    IconButton,
    InputBase,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import {useLogoutMutation} from "../state/apis/authApi";
import {useNavigate} from "react-router-dom";
import {logoutAndClear} from "../state/authSlice";
import toast from "react-hot-toast";

const Navbar = ({user, isSidebarOpen, setIsSidebarOpen, isLogIn = false}) => {

    const dispatch = useDispatch();
    const theme = useTheme()
    const [logoutUser] = useLogoutMutation()
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    }

    // Close Menu on Scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleScroll = () => {
            handleClose()
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen]);

    // Log Out
    const handleLogOut = async () => {
        try {
            await logoutUser().unwrap();
            dispatch(logoutAndClear());
            navigate("/login");
            toast.success("Logout Successful");
        } catch (err) {
            console.log("Could not log-out user", err);
            toast.error("Logout Failed")
        }
    }

    return (
        <AppBar sx={{
            position: "static",
            backgroundColor: theme.palette.background.alt,
            boxShadow: "none"
        }}>

            <Toolbar sx={!isLogIn ? {justifyContent: "space-between"} : {justifyContent: "right"}}>
                {/*    LEFT SIDE*/}
                {!isLogIn && (
                    <FlexBetween>
                        <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <MenuIcon/>
                        </IconButton>
                        <FlexBetween
                            backgroundColor={theme.palette.background.alt}
                            borderRadius={"9px"}
                            gap={"3rem"}
                            p={"0.1rem 1.5rem"}
                        >
                            <InputBase placeholder={"Search..."}/>
                            <IconButton>
                                <Search/>
                            </IconButton>
                        </FlexBetween>
                    </FlexBetween>
                )}
                {/*RIGHT SIDE*/}
                <FlexBetween gap={"1.5rem"}>
                    <IconButton onClick={() => dispatch(setMode())}>
                        {theme.palette.mode === 'dark'
                            ? (<DarkModeOutlined sx={{fontSize: "25px"}}/>)
                            : (<LightModeOutlined sx={{fontSize: "25px"}}/>)}
                    </IconButton>

                    {!isLogIn && (
                        <>
                            <IconButton>
                                <SettingsOutlined sx={{fontSize: "25px"}}/>
                            </IconButton>
                            <IconButton onClick={() => handleLogOut()}>
                                <LogoutOutlined sx={{fontSize: "25px"}}/>
                            </IconButton>
                        </>
                    )}
                </FlexBetween>
            </Toolbar>
        </AppBar>
    )
}
export default Navbar
