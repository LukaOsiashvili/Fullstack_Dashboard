import React, {useState, useMemo, useCallback} from 'react';
import {
    Box,
    Typography,
    IconButton,
    InputAdornment,
    Stack,
    Tooltip,
    Button,
    Divider,
    Paper,
    LinearProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    Avatar,
    ToggleButtonGroup,
    ToggleButton,
    alpha,
    useTheme,
    useMediaQuery,
    OutlinedInput,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    DeleteOutlined as DeleteIcon,
    Search as SearchIcon,
    PersonAdd as PersonAddIcon,
    People as PeopleIcon,
    Close as CloseIcon,
    ContentCopy as CopyIcon,
    Refresh as RefreshIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Visibility as ViewIcon,
    AdminPanelSettings as AdminIcon,
    PointOfSale as SalesIcon,
} from '@mui/icons-material';
import FlexBetween from 'components/FlexBetween';
import UserFormPopup from 'forms/UserFormPopup';
import toast from 'react-hot-toast';
import {
    useDeleteUserByIdMutation,
    useGetAllUsersQuery,
    useUpdateUserByIdMutation
} from 'state/apis/api';
import {useRegisterMutation} from 'state/apis/authApi';
import {getRelativeTime, isNewUser} from 'utils/dateUtils';
import {buildColumns, getMobileColumns} from './columns';
import {ROLE_CONFIG, getInitials, INITIAL_FORM_VALUES} from './constants';
import StatCard from './StatCard';
import UserDetailDrawer from './UserDetailDrawer';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import Header from "../../components/Header";

const AllUsers = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUser, setDrawerUser] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({open: false, user: null});
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [contextMenu, setContextMenu] = useState(null);
    const [contextUser, setContextUser] = useState(null);

    const {data: users, isLoading, refetch} = useGetAllUsersQuery();
    const [register] = useRegisterMutation();
    const [updateUserById] = useUpdateUserByIdMutation();
    const [deleteUserById] = useDeleteUserByIdMutation();

    // ── Computed (FOR NOW, SHOULD BE CHANGED TO BACKEND STATS COMPUTATION)─────────────────────────────────────────────────────
    const stats = useMemo(() => {
        if (!users) return {total: 0, active: 0, inactive: 0, byRole: {}, recentlyCreated: 0};
        const active = users.filter((u) => u.active).length;
        const byRole = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
        }, {});
        const recentlyCreated = users.filter((u) => isNewUser(u.createdAt, 30)).length;
        return {total: users.length, active, inactive: users.length - active, byRole, recentlyCreated};
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter((user) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
                user.username.toLowerCase().includes(q) ||
                (user.email && user.email.toLowerCase().includes(q));
            return (matchesSearch) &&
                (roleFilter === 'all' || user.role === roleFilter) &&
                (statusFilter === 'all' || (statusFilter === 'active' ? user.active : !user.active));
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleViewUser = useCallback((user) => {
        setDrawerUser(user);
        setDrawerOpen(true);
    }, []);
    const handleEditClick = useCallback((id) => () => {
        setSelectedUser(users?.find((u) => u._id === id));
        setFormOpen(true);
    }, [users]);
    const handleDeleteClick = useCallback((id) => () => {
        setConfirmDelete({open: true, user: users?.find((u) => u._id === id)});
    }, [users]);
    const handleToggleActive = useCallback(async (user) => {
        try {
            await updateUserById({updatedData: {...user, active: !user.active}, id: user._id}).unwrap();
            toast.success(`User ${!user.active ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update status');
        }
    }, [updateUserById]);

    const handleFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try {
            await register(values).unwrap();
            toast.success('User created!');
            setFormOpen(false);
            resetForm();
        } catch {
            toast.error('Creation failed!');
        } finally {
            setSubmitting(false);
        }
    };
    const processRowUpdate = async (newRow) => {
        try {
            await updateUserById({updatedData: newRow, id: newRow._id}).unwrap();
            toast.success('Updated');
            setFormOpen(false);
        } catch {
            toast.error('Update failed');
        }
    };
    const handleConfirmDelete = async () => {
        try {
            await deleteUserById(confirmDelete.user._id).unwrap();
            toast.success('Deleted');
        } catch {
            toast.error('Delete failed');
        } finally {
            setConfirmDelete({open: false, user: null});
        }
    };
    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
        setContextUser(null);
    }, []);

    // ── Columns ──────────────────────────────────────────────────────
    const columns = useMemo(
        () => buildColumns({theme, handleViewUser, handleEditClick, handleDeleteClick, handleToggleActive}),
        [theme, handleViewUser, handleEditClick, handleDeleteClick, handleToggleActive]
    );
    const mobileColumns = useMemo(() => getMobileColumns(columns), [columns]);

    const gridSx = useMemo(() => ({
        minHeight: '75vh',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        overflow: 'hidden',
        position: 'relative',

        '& .MuiDataGrid-root': {
            border: 'none',
        },

        '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            '&:focus, &:focus-within': {outline: 'none'},
        },

        '& .MuiDataGrid-columnHeader': {
            backgroundColor: `${theme.palette.background.alt} !important`,
            color: theme.palette.secondary[200],
            borderBottom: 'none',
            '&:focus, &:focus-within': {outline: 'none'},
        },

        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: `${theme.palette.background.alt} !important`,
            color: theme.palette.secondary[100],
            borderBottom: 'none',
        },

        '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 500,
            fontSize: '12px',
            textTransform: 'capitalize',
            color: theme.palette.secondary[200],
        },

        '& .MuiDataGrid-columnSeparator': {
            backgroundColor: `${theme.palette.background.alt} !important`,
        },

        '& .MuiDataGrid-row': {
            borderLeft: '3px solid transparent',
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            },
        },

        '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.primary.light,
        },

        '& .MuiDataGrid-footerContainer': {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: 'none',
            minHeight: 48,
        },

        '& .MuiDataGrid-toolbarContainer': {
            p: 1.5,
            gap: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            backgroundColor: theme.palette.background.alt,
            '& .MuiButton-text': {
                color: `${theme.palette.secondary[200]} !important`,
            },
            '& .MuiButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
            },
        },

        '& .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-scrollbarFiller--header': {
            backgroundColor: `${theme.palette.background.alt} !important`,
        },
    }), [theme]);

    // ── Render ───────────────────────────────────────────────────────
    return (
        <Box m={isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem 2.5rem'}>
            {/* Header */}
            <FlexBetween flexWrap="wrap" gap={2} mb={3}>
                <Header title="User Management" subtitle="Manage accounts, roles, and access permissions"/>
                <Box sx={{display: 'flex', gap: 1.5}}>
                    <Tooltip title="Refresh" arrow>
                        <IconButton onClick={() => refetch()} sx={{
                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            borderRadius: 2.5,
                            width: 42,
                            height: 42,
                            '&:hover': {backgroundColor: alpha(theme.palette.primary.main, 0.06)},
                        }}><RefreshIcon/></IconButton>
                    </Tooltip>
                    <Button variant="contained" startIcon={<PersonAddIcon/>}
                            onClick={() => {
                                setSelectedUser(null);
                                setFormOpen(true);
                            }}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                height: 42,
                                fontSize: '0.85rem',
                                backgroundColor: theme.palette.primary.main
                            }}
                    >
                        {isMobile ? 'Add' : 'Add User'}
                    </Button>
                </Box>
            </FlexBetween>

            {/* Stats */}
            <Box
                display="grid"
                gridTemplateColumns={{xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)'}}
                gap={2}
                mb={3}>
                <StatCard
                    title="Total Users"
                    value={stats.total}
                    icon={<PeopleIcon/>}
                    color="#6366f1"
                    subtitle={`${stats.recentlyCreated} new this month`}
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon={<CheckCircleIcon/>}
                    color={theme.palette.success.main}
                />
                <StatCard
                    title="Inactive"
                    value={stats.inactive}
                    icon={<BlockIcon/>}
                    color={theme.palette.error.main}
                />
                <StatCard
                    title="Admins"
                    value={stats.byRole.admin || 0}
                    icon={<AdminIcon/>}
                    color={ROLE_CONFIG.admin.color}
                />
                <StatCard
                    title="Sales"
                    value={stats.byRole.sales || 0}
                    icon={<SalesIcon/>}
                    color={ROLE_CONFIG.sales.color}
                />

            </Box>

            {/* Grid */}
            <Paper
                sx={{borderRadius: "5px 5px 0 0", overflow: 'hidden', minWidth: 0}}
            >
                <Box sx={{
                    p: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    backgroundColor: theme.palette.background.alt,
                }}>
                    <Stack
                        direction={{xs: 'column', sm: 'row'}}
                        spacing={2}
                        alignItems={{sm: 'center'}}
                        flexWrap="wrap">
                        <OutlinedInput
                            size="small"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                flex: 1, minWidth: 220,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                    '& fieldset': {border: 'none'},
                                    '&.Mui-focused': {
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                    }
                                },
                            }}
                            startAdornment={
                                <InputAdornment position="start"><SearchIcon sx={{
                                    color: alpha(theme.palette.text.secondary, 0.4),
                                    fontSize: 20
                                }}/></InputAdornment>
                            }
                            endAdornment={
                                searchQuery && <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchQuery('')}
                                        sx={{
                                            width: 24,
                                            height: 24
                                        }}
                                    >
                                        <CloseIcon sx={{fontSize: 14}}/>
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{opacity: 0.75}}/>
                        <ToggleButtonGroup
                            value={roleFilter}
                            exclusive
                            onChange={(_, v) => v && setRoleFilter(v)}
                            size="small"
                            sx={{
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: 'none',
                                    borderRadius: '10px !important',
                                    mx: 0.25,
                                    px: 1.5,
                                    py: 0.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: alpha(theme.palette.text.secondary, 0.6)
                                }
                            }}
                        >
                            <ToggleButton
                                value="all"
                                // sx={{
                                //     '&.Mui-selected': {
                                //         backgroundColor: alpha(theme.palette.text.primary, 0.08),
                                //         color: theme.palette.text.primary
                                //     }
                                // }}
                            >
                                All
                            </ToggleButton>
                            {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                <ToggleButton
                                    key={key}
                                    value={key}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: `${config.bgColor} !important`,
                                            color: `${config.color} !important`
                                        }
                                    }}
                                >
                                    {config.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{opacity: 0.75}}/>
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={(_, v) => v && setStatusFilter(v)}
                            size="small"
                            sx={{
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: 'none',
                                    borderRadius: '10px !important',
                                    mx: 0.25,
                                    px: 1.5,
                                    py: 0.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: alpha(theme.palette.text.secondary, 0.6)
                                }
                            }}
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton
                                value="active"
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: `${alpha('#10b981', 0.1)} !important`,
                                        color: '#10b981 !important'
                                    }
                                }}
                            >
                                Active
                            </ToggleButton>
                            <ToggleButton
                                value="inactive"
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: `${alpha('#ef4444', 0.1)} !important`,
                                        color: '#ef4444 !important'
                                    }
                                }}
                            >
                                Inactive
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Typography variant="caption" sx={{
                            ml: 'auto',
                            whiteSpace: 'nowrap',
                            color: alpha(theme.palette.text.secondary, 0.5),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            backgroundColor: alpha(theme.palette.text.primary, 0.04),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5
                        }}>
                            {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
                        </Typography>
                    </Stack>
                </Box>
                {(isLoading) &&
                    <LinearProgress sx={{position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: 3}}/>}
                <DataGrid
                    loading={isLoading || !users}
                    getRowId={(row) => row._id}
                    rows={filteredUsers}
                    columns={isMobile ? mobileColumns : columns}
                    rowHeight={75}

                    initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                    pageSizeOptions={[10, 25, 50]}

                    disableRowSelectionOnClick
                    disableColumnResize
                    disableColumnSorting
                    sx={gridSx}
                />
            </Paper>

            {/* Context Menu */}
            <Menu open={contextMenu !== null} onClose={closeContextMenu} anchorReference="anchorPosition"
                  anchorPosition={contextMenu ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined}
                  slotProps={{
                      paper: {
                          sx: {
                              borderRadius: 3,
                              minWidth: 200,
                              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                              '& .MuiMenuItem-root': {
                                  py: 1.25,
                                  px: 2,
                                  fontSize: '0.825rem',
                                  fontWeight: 500,
                                  '& .MuiListItemIcon-root': {minWidth: 32}
                              }
                          }
                      }
                  }}>
                {contextUser && (
                    <Box sx={{
                        px: 2,
                        py: 1.25,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <Avatar sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            backgroundColor: alpha((ROLE_CONFIG[contextUser.role] || ROLE_CONFIG.production).color, 0.15),
                            color: (ROLE_CONFIG[contextUser.role] || ROLE_CONFIG.production).color
                        }}>
                            {getInitials(contextUser.firstName, contextUser.lastName)}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700}
                                        fontSize="0.8rem">{contextUser.firstName} {contextUser.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Last
                                seen {getRelativeTime(contextUser.lastLogin)}</Typography>
                        </Box>
                    </Box>
                )}
                <MenuItem onClick={() => {
                    if (contextUser) handleViewUser(contextUser);
                    closeContextMenu();
                }}><ListItemIcon><ViewIcon sx={{fontSize: 18}}/></ListItemIcon>View Profile</MenuItem>
                <MenuItem onClick={() => {
                    if (contextUser) {
                        setSelectedUser(contextUser);
                        setFormOpen(true);
                    }
                    closeContextMenu();
                }}><ListItemIcon><EditIcon sx={{fontSize: 18}}/></ListItemIcon>Edit User</MenuItem>
                <MenuItem onClick={() => {
                    if (contextUser) handleToggleActive(contextUser);
                    closeContextMenu();
                }}>
                    <ListItemIcon>{contextUser?.active ? <BlockIcon sx={{fontSize: 18, color: '#f59e0b'}}/> :
                        <CheckCircleIcon sx={{fontSize: 18, color: '#10b981'}}/>}</ListItemIcon>
                    {contextUser?.active ? 'Deactivate' : 'Activate'}
                </MenuItem>
                <Divider sx={{opacity: 0.4}}/>
                <MenuItem onClick={() => {
                    if (contextUser) {
                        navigator.clipboard.writeText(contextUser.username);
                        toast.success('Copied!');
                    }
                    closeContextMenu();
                }}><ListItemIcon><CopyIcon sx={{fontSize: 18}}/></ListItemIcon>Copy Username</MenuItem>
                <Divider sx={{opacity: 0.4}}/>
                <MenuItem onClick={() => {
                    if (contextUser) setConfirmDelete({open: true, user: contextUser});
                    closeContextMenu();
                }} sx={{color: '#ef4444 !important'}}>
                    <ListItemIcon><DeleteIcon sx={{fontSize: 18, color: '#ef4444'}}/></ListItemIcon>Delete User
                </MenuItem>
            </Menu>

            <UserDetailDrawer
                open={drawerOpen}
                user={drawerUser}
                onClose={() => {
                    setDrawerOpen(false);
                    setDrawerUser(null);
                }}
                onEdit={(u) => {
                    setSelectedUser(u);
                    setFormOpen(true);
                }}
                onToggleActive={handleToggleActive}
            />
            <UserFormPopup
                open={formOpen}
                onClose={() => setFormOpen(false)}
                mode={selectedUser ? 'edit' : 'add'}
                initialValues={selectedUser || INITIAL_FORM_VALUES}
                onSubmit={selectedUser ? processRowUpdate : handleFormSubmit}
            />
            <DeleteConfirmDialog
                open={confirmDelete.open}
                user={confirmDelete.user}
                onCancel={() => setConfirmDelete({open: false, user: null})}
                onConfirm={handleConfirmDelete}/>
        </Box>
    );
};

export default AllUsers;