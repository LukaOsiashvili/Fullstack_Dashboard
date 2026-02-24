import React, { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from 'components/Navbar';
import Sidebar from 'components/Sidebar';

const DRAWER_WIDTH = '275px';

const Layout = () => {
    const isNonMobile = useMediaQuery('(min-width: 600px)');
    // Start closed on mobile, open on desktop

    const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    return (
        <Box
            display="flex"
            width="100%"
            height="100%"
        >
            {isLoggedIn && (
                <Sidebar
                    drawerWidth={DRAWER_WIDTH}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isNonMobile={isNonMobile}
                />
            )}

            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflowY: 'auto',
                    transition: 'margin-left 0.3s ease',
                    ml: isNonMobile && isLoggedIn && isSidebarOpen ? DRAWER_WIDTH : 0,
                }}
            >
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isLogIn={!isLoggedIn}
                />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;