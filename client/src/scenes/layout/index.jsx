import React, {useState} from 'react'
import {Box, useMediaQuery} from "@mui/material";
import {Outlet} from "react-router-dom"
import {useSelector} from "react-redux"
import Navbar from "components/Navbar"
import Sidebar from "components/Sidebar"

const Layout = () => {

    const isNonMobile = useMediaQuery("(min-width: 600px)"); //or 768
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    return (
        <Box display={isNonMobile ? "flex" : "block"} width={"100%"} height={"100%"}>
            {isLoggedIn && (<Sidebar drawerWidth={"250px"} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>)}

            <Box
                flexGrow={1}
                minWidth={0}
                overflowY="auto"
                display="flex"
                flexDirection="column"
            >
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isLogIn={!isLoggedIn} />
                <Outlet/>
            </Box>
        </Box>
        )

}
export default Layout
