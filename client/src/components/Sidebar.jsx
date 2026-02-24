import React, {useEffect, useState} from 'react';
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Typography,
    useTheme,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRightOutlined,
    Home,
    ShoppingCart,
    Groups,
    Inventory,
    Store,
    Assignment,
    Build,
} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import {useLocation, useNavigate} from 'react-router-dom';
import Logo from './Logo'

const navItems = [
    {
        text: 'Dashboard',
        icon: <Home/>,
        url: '/dashboard',
    },
    {
        text: 'Services',
        icon: null,
    },
    {
        text: 'Orders',
        icon: <Assignment/>,
        url: '/orders',
    },
    {
        text: 'Cut Orders',
        icon: <Build/>,
        url: '/cutOrders',
    },
    {
        text: 'Management',
        icon: null,
    },
    {
        text: 'Products',
        icon: <ShoppingCart/>,
        url: '/products',
    },
    {
        text: 'Materials',
        icon: <Inventory/>,
        url: '/materials',
    },
    {
        text: 'Branches',
        icon: <Store/>,
        url: '/branches',
    },
    {
        text: 'Human Resources',
        icon: null,
    },
    {
        text: 'Profile',
        icon: <PersonIcon/>,
        url: '/profile',
    },
    {
        text: 'Users',
        icon: <Groups/>,
        url: '/users',
    },
];

const Sidebar = ({
                     drawerWidth,
                     isSidebarOpen,
                     setIsSidebarOpen,
                     isNonMobile,
                 }) => {
    const {pathname} = useLocation();
    const [active, setActive] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    // Match active state against the url field
    useEffect(() => {
        const firstSegment = pathname.split('/')[1] || '';

        const matchedItem = navItems.find((item) => {
            if (!item.url) return false;
            const itemSegment = item.url.split('/')[1] || '';
            return itemSegment === firstSegment;
        });

        setActive(matchedItem?.url || '');
    }, [pathname]);

    const handleNavClick = (url) => {
        navigate(url);
        if (!isNonMobile) {
            setIsSidebarOpen(false);
        }
    };

    const drawerContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Header 1 */}
            {/*<Box*/}
            {/*    sx={{*/}
            {/*        display: 'flex',*/}
            {/*        alignItems: 'center',*/}
            {/*        justifyContent: isNonMobile ? 'center' : 'space-between',*/}
            {/*        p: '1.5rem 1.5rem 2rem 1.5rem',*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Logo*/}
            {/*        sx={{*/}
            {/*            fontSize: '20px',*/}
            {/*            color: theme.palette.secondary.main,*/}
            {/*        }}*/}
            {/*    />*/}
            {/*    {!isNonMobile && (*/}
            {/*        <IconButton*/}
            {/*            onClick={() => setIsSidebarOpen(false)}*/}
            {/*            sx={{ color: theme.palette.secondary[200] }}*/}
            {/*        >*/}
            {/*            <ChevronLeft />*/}
            {/*        </IconButton>*/}
            {/*    )}*/}
            {/*</Box>*/}


            {/* Header 2 */}
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: '1.5rem 1.5rem 2rem 1.5rem',
                }}
            >
                <Logo
                    sx={{
                        fontSize: '20px',
                        // color: '#8140FF',
                        color: theme.palette.secondary.main,
                    }}
                />
                {!isNonMobile && (
                    <IconButton
                        onClick={() => setIsSidebarOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: '1.5rem',
                            color: theme.palette.secondary[200],
                        }}
                    >
                        <ChevronLeft/>
                    </IconButton>
                )}
            </Box>
            {/* Navigation List */}
            <Box sx={{flex: 1, overflowY: 'auto'}}>
                <List>
                    {navItems.map(({text, icon, url}) => {
                        if (!icon) {
                            return (
                                <Typography
                                    key={text}
                                    sx={{
                                        m: '2.25rem 0 1rem 3rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: theme.palette.secondary[300],
                                    }}
                                >
                                    {text}
                                </Typography>
                            );
                        }

                        const isActive = active === url;

                        return (
                            <ListItem key={text} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavClick(url)}
                                    sx={{
                                        py: '0.6rem',
                                        mx: '0.75rem',
                                        mb: '0.25rem',
                                        borderRadius: '8px',
                                        backgroundColor: isActive
                                            ? theme.palette.secondary[300]
                                            : 'transparent',
                                        color: isActive
                                            ? theme.palette.primary[600]
                                            : theme.palette.secondary[100],
                                        transition: 'all 0.2s ease-in-out',

                                        // Only apply hover on real mouse devices
                                        '@media (hover: hover) and (pointer: fine)': {
                                            '&:hover': {
                                                backgroundColor: isActive
                                                    ? theme.palette.secondary[300]
                                                    : theme.palette.primary[600],
                                                transform: 'translateX(4px)',
                                            },
                                        },

                                        // Prevent sticky hover on touch
                                        '@media (hover: none)': {
                                            '&:hover': {
                                                backgroundColor: isActive
                                                    ? theme.palette.secondary[300]
                                                    : 'transparent',
                                            },
                                        },

                                        '&:focus-visible': {
                                            backgroundColor: isActive
                                                ? theme.palette.secondary[300]
                                                : theme.palette.primary[700],
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            ml: '1.25rem',
                                            minWidth: '40px',
                                            color: isActive
                                                ? theme.palette.secondary[600]
                                                : theme.palette.secondary[200],
                                        }}
                                    >
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={text}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontWeight: isActive ? 600 : 400,
                                                },
                                            },
                                        }}
                                    />
                                    {isActive && (
                                        <ChevronRightOutlined sx={{ml: 'auto'}}/>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );

    // Shared paper styles
    const paperStyles = {
        color: theme.palette.secondary[200],
        backgroundColor: theme.palette.background.alt,
        boxSizing: 'border-box',
        borderRight: 'none',
    };

    // ─── Desktop: persistent fixed drawer ───
    if (isNonMobile) {
        return (
            <Drawer
                open={isSidebarOpen}
                variant="persistent"
                anchor="left"
                sx={{
                    '& .MuiDrawer-paper': {
                        ...paperStyles,
                        width: drawerWidth,
                        transition: 'transform 0.3s ease',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    // ─── Mobile: temporary full-screen overlay ───
    return (
        <Drawer
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            variant="temporary"
            anchor="left"
            elevation={0}
            disableRestoreFocus
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    ...paperStyles,
                    width: '100%',
                    maxWidth: '100vw',
                },
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default Sidebar;