import React, {useState, useMemo, useEffect} from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Chip,
    Tabs,
    Tab,
    InputAdornment,
    Stack,
    Badge,
    Tooltip,
    alpha,
    useTheme,
    ButtonGroup,
    OutlinedInput,
    styled,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Icons
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';

// Imported Components and Util Functions
import {
    getOrderTypeColor,
    getStatusColor,
} from "../../components/orderComponents/getFunctions";
import OrderStats from "../../components/orderComponents/orderStats";
import OrderFormDialog from "../../components/orderComponents/orderFormDialog";
import OrderDetailDialog from "../../components/orderComponents/orderDetailDialog";
import StatusChangeDialog from "../../components/orderComponents/statusChangeDialog";
import FilterDrawer from "../../components/orderComponents/filterDrawer";
import {columns} from '../../components/orderComponents/columns';
import QuickActionsMenu from "../../components/orderComponents/quickActionsMenu";
import Header from "../../components/Header";

// RTK Query Endpoints
import {
    useAddOrderMutation,
    useGetAllBranchesQuery,
    useGetAllOrdersQuery,
    useGetUsersByRolesQuery,
    useUpdateOrderMutation,
    useUpdateOrderStatusMutation
} from "../../state/apis/api";

import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const SearchInput = styled(OutlinedInput)(({theme}) => ({
    borderRadius: theme.shape.borderRadius * 2,
    '& fieldset': {
        borderColor: alpha(theme.palette.divider, 0.3),
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
}));

// ============================================
// MAIN ORDERS PAGE
// ============================================

const OrdersPage = () => {
    const theme = useTheme();

    // State
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [statusOption, setStatusOption] = useState('');

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    })

    const [rowCount, setRowCount] = useState(0);


    // Dialog States
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);

    // Menu State
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuOrder, setMenuOrder] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: [],
        orderType: [],
        branchId: '',
        dateRange: {start: null, end: null},
        paymentMethod: [],
        minAmount: '',
        maxAmount: '',
    });

    // RTK Endpoint Calls
    const {
        data: allOrders,
        isLoading: isOrdersLoading,
        isFetching: isOrdersFetching,
        refetch: refetchOrders
    } = useGetAllOrdersQuery({
        page: paginationModel.page + 1,
        size: paginationModel.pageSize,
        filters: {
            ...filters,
            dateRange: JSON.stringify(filters.dateRange),
        }
    });
    const [addOrder] = useAddOrderMutation();
    const [updateOrder] = useUpdateOrderMutation();
    const [updateOrderStatus] = useUpdateOrderStatusMutation();
    const {data: branches, isLoading: isBranchesLoading, fetching: isBranchesFetching} = useGetAllBranchesQuery();
    const {data: salesUsers, isLoading: isSalesUsersLoading, fetching: isSalesUsersFetching} = useGetUsersByRolesQuery(["admin", "sales"]);
    const {data: laserWorkers, isLoading: isLaserWorkersLoading, fetching: isLaserWorkersFetching} = useGetUsersByRolesQuery(["laser"]);

    useEffect(() => {
        if (!allOrders) return;

        // console.log(allOrders.stats);

        setOrders(allOrders.data);
        setRowCount(allOrders.stats.total)
    }, [allOrders]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchQuery(searchInput);
            // console.log("Set: ", searchInput);
        }, 400); // 300–500ms sweet spot

        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        const statuses = {
            0: [],
            1: ['PENDING'],
            2: ['IN_PROGRESS'],
            3: ['COMPLETED'],
            4: ['CUSTOM']
        }

        setPaginationModel((prev) => ({...prev, page: 0}));

        setFilters((prev) => ({
            ...prev,
            status: tabValue !== 4 ? statuses[tabValue] ?? [] : [],
            orderType: tabValue === 4 ? statuses[tabValue] ?? [] : [],
        }))
    }, [tabValue]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status.length > 0) count++;
        if (filters.orderType.length > 0) count++;
        if (filters.branchId) count++;
        if (filters.dateRange.start) count++;
        if (filters.dateRange.end) count++;
        if (filters.paymentMethod.length > 0) count++;
        if (filters.minAmount) count++;
        if (filters.maxAmount) count++;
        return count;
    }, [filters]);

    // Handlers
    const handleCreateOrder = async (orderData) => {
        try {
            // console.log("OrderData Received at Index.js [Parent]", orderData);
            setPaginationModel((prev) => ({...prev, page: 0}))
            await addOrder(orderData).unwrap();
            toast.success("Order Created Successfully!")
        } catch (error) {
            toast.error("Order Creation Failed!");
        }
    };

    const handleUpdateOrder = async (orderData) => {
        try {
            const result = await updateOrder({orderId: editingOrder._id, formData: orderData}).unwrap();
            toast.success("Order Updated Successfully!");
        } catch (error) {
            toast.error("Order Update Failed!");
        } finally {
            setEditingOrder(null);
        }
    };

    const handleStatusChange = async (orderId, updates) => {
        try{
            await updateOrderStatus({orderId: orderId, formData: updates}).unwrap();
            toast.success("Order Status Updated Successfully!");
        } catch (error) {
            toast.error("Order Status Update Failed!")
        } finally {
            setEditingOrder(null);
        }
    };

    const handleQuickAction = (action, order) => {
        switch (action) {
            case 'view':
                setSelectedOrder(order);
                setDetailDialogOpen(true);
                break;
            case 'edit':
                setEditingOrder(order);
                setCreateDialogOpen(true);
                break;
            case 'status':
                setSelectedOrder(order);
                setStatusDialogOpen(true);
                break;
            case 'cancel':
                setSelectedOrder(order);
                setStatusOption("CANCELLED")
                setStatusDialogOpen(true);
                break;
            default:
                break;
        }
    };

    const handleRefresh = async () => {
        try {
            setPaginationModel((prev) => ({...prev, page: 0}))
            await refetchOrders().unwrap();
            toast.success("Orders Refreshed!")
        } catch (error) {
            toast.error("Orders Could Not be Refetched!")
        }

    };

    const handleExport = () => {
        toast.error("Export Functionality Coming Soon!")
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box m="1.5rem 2rem">
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Header title={"Orders Management"} subtitle={"Manage and track all your orders in one place"}/>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon/>}
                        onClick={() => {
                            setEditingOrder(null);
                            setCreateDialogOpen(true);
                        }}
                        sx={{borderRadius: 2}}
                    >
                        New Order
                    </Button>
                </Stack>

                <OrderStats/>

                {/* Main Content */}
                <Paper sx={{borderRadius: "5px 5px 0 0", overflow: 'hidden', minWidth: 0}}>
                    {/* Tabs */}
                    <Box sx={{borderBottom: 1, borderColor: 'divider',}}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, newValue) => setTabValue(newValue)}
                            sx={{px: 2, backgroundColor: theme.palette.background.alt}}
                        >
                            <Tab
                                label={
                                    <Badge badgeContent={rowCount} color="primary" max={999}>
                                        <Typography textTransform="capitalize">
                                            All Orders
                                        </Typography>
                                    </Badge>
                                }
                                sx={{
                                    color: theme.palette.text.primary, // unselected text
                                    '&.Mui-selected': {
                                        color: theme.palette.primary[200] // selected tab
                                    }
                                }}
                            />
                            <Tab
                                label={
                                    <Badge
                                        badgeContent={allOrders?.stats.pending}
                                        color="warning"
                                    >
                                        <Typography textTransform="capitalize">
                                            Pending
                                        </Typography>
                                    </Badge>
                                }
                                sx={{
                                    color: theme.palette.text.primary, // unselected text
                                    '&.Mui-selected': {
                                        color: theme.palette.primary[200] // selected tab
                                    }
                                }}
                            />
                            <Tab
                                label={
                                    <Badge
                                        badgeContent={allOrders?.stats.inProgress}
                                        color="info"
                                    >
                                        <Typography textTransform="capitalize">
                                            In Progress
                                        </Typography>
                                    </Badge>
                                }
                                sx={{
                                    color: theme.palette.text.primary, // unselected text
                                    '&.Mui-selected': {
                                        color: theme.palette.primary[200] // selected tab
                                    }
                                }}
                            />
                            <Tab
                                label={
                                    <Badge
                                        badgeContent={allOrders?.stats.completed}
                                        color="success"
                                    >
                                        <Typography textTransform="capitalize">
                                            Completed
                                        </Typography>
                                    </Badge>
                                }
                                sx={{
                                    color: theme.palette.text.primary, // unselected text
                                    '&.Mui-selected': {
                                        color: theme.palette.primary[200] // selected tab
                                    }
                                }}
                            />
                            <Tab
                                label={
                                    <Badge
                                        badgeContent={allOrders?.stats.custom}
                                        color="secondary"
                                    >
                                        <Typography textTransform="capitalize">
                                            Custom Orders
                                        </Typography>
                                    </Badge>
                                }
                                sx={{
                                    color: theme.palette.text.primary, // unselected text
                                    '&.Mui-selected': {
                                        color: theme.palette.primary[200] // selected tab
                                    }
                                }}
                            />
                        </Tabs>
                    </Box>

                    {/* Toolbar */}
                    <Box sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.alt,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <SearchInput
                                size="small"
                                placeholder="Search orders..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon color="action"/>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchInput('')}>
                                                <ClearIcon fontSize="small"/>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                                sx={{width: 300}}
                            />

                            <Badge badgeContent={activeFilterCount} color="primary">
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterListIcon/>}
                                    onClick={() => setFilterDrawerOpen(true)}
                                    sx={{
                                        borderColor: alpha(theme.palette.divider, 0.3),
                                        color: theme.palette.text.primary,

                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            backgroundColor: theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    <Typography textTransform="capitalize">
                                        Filters
                                    </Typography>
                                </Button>
                            </Badge>

                            <Box sx={{flex: 1}}/>

                            <ButtonGroup variant="outlined" size="small">
                                <Tooltip title="Refresh">
                                    <Button
                                        onClick={handleRefresh}
                                        size="medium"
                                        sx={{
                                            borderColor: alpha(theme.palette.divider, 0.3),
                                            color: theme.palette.text.primary,

                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.primary.main,
                                            },
                                        }}
                                    >
                                        <RefreshIcon/>
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Export">
                                    <Button
                                        onClick={handleExport}
                                        size="medium"
                                        sx={{
                                            borderColor: alpha(theme.palette.divider, 0.3),
                                            color: theme.palette.text.primary,

                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.primary.main,
                                            },
                                        }}
                                    >
                                        <DownloadIcon/>
                                    </Button>
                                </Tooltip>
                            </ButtonGroup>
                        </Stack>

                        {/* Active Filters Display */}
                        {activeFilterCount > 0 && (
                            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                                <Typography variant="h6" sx={{
                                    alignSelf: 'center',
                                    color: theme.palette.secondary.light,
                                    textTransform: 'none'
                                }}>
                                    Active filters:
                                </Typography>
                                {filters.status.map((status) => (
                                    <Chip
                                        key={status}
                                        size="small"
                                        label={`Status: ${status}`}
                                        onDelete={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                status: prev.status.filter((s) => s !== status),
                                            }))
                                        }
                                        color={getStatusColor(status)}
                                    />
                                ))}
                                {filters.orderType.map((type) => (
                                    <Chip
                                        key={type}
                                        size="small"
                                        label={`Type: ${type}`}
                                        onDelete={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                orderType: prev.orderType.filter((t) => t !== type),
                                            }))
                                        }
                                        color={getOrderTypeColor(type)}
                                    />
                                ))}
                                {filters.branchId && (
                                    <Chip
                                        size="small"
                                        label={`Branch: ${branches?.find((b) => b._id === filters.branchId)?.name}`}
                                        onDelete={() => setFilters((prev) => ({...prev, branchId: ''}))}
                                    />
                                )}
                                {filters.dateRange.start && (
                                    <Chip
                                        size="small"
                                        label={`From: ${dayjs(filters.dateRange.start).format("DD MMM YYYY, HH:mm")}`}
                                        onDelete={() => setFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, start: ''}
                                        }))}
                                    />
                                )}
                                {filters.dateRange.end && (
                                    <Chip
                                        size="small"
                                        label={`Until: ${dayjs(filters.dateRange.end).format("DD MMM YYYY, HH:mm")}`}
                                        onDelete={() => setFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, end: ''}
                                        }))}
                                    />
                                )}
                                {filters.paymentMethod.map((payment) => (
                                    <Chip
                                        key={payment}
                                        size="small"
                                        label={`Payment: ${payment}`}
                                        onDelete={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                payment: prev.paymentMethod.filter((p) => p !== payment),
                                            }))
                                        }
                                        color={getStatusColor(payment)}
                                    />
                                ))}
                                {filters.minAmount && (
                                    <Chip
                                        size="small"
                                        label={`Min ₾: ${filters.minAmount}`}
                                        onDelete={() => setFilters((prev) => ({...prev, minAmount: ''}))}
                                    />
                                )}
                                {filters.maxAmount && (
                                    <Chip
                                        size="small"
                                        label={`Max ₾: ${filters.maxAmount}`}
                                        onDelete={() => setFilters((prev) => ({...prev, maxAmount: ''}))}
                                    />
                                )}
                                <Button
                                    size="small"
                                    color={theme.palette.secondary.light}
                                    onClick={() => {
                                        setFilters({
                                            status: [],
                                            orderType: [],
                                            branchId: '',
                                            dateRange: {start: null, end: null},
                                            paymentMethod: [],
                                            minAmount: '',
                                            maxAmount: '',
                                        })
                                        setTabValue(0)
                                    }
                                    }
                                >
                                    <Typography color="textSecondary" sx={{textTransform: 'none'}}>
                                        Clear All
                                    </Typography>
                                </Button>
                            </Stack>
                        )}
                    </Box>

                </Paper>
                {/* DataGrid */}
                <Box sx={{height: 600, midWidth: 0}}>
                    <DataGrid
                        rows={orders}
                        columns={columns(handleQuickAction, setMenuAnchorEl, setMenuOrder)}
                        getRowId={(row) => row._id}

                        paginationMode="server"
                        rowCount={rowCount}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}

                        loading={isOrdersLoading || isOrdersFetching}
                        pageSizeOptions={[5, 10, 15, 20, 25]}

                        disableColumnResize={true}
                        disableColumnSorting={true}
                        disableColumnFilter={true}
                        disableColumnSelector={true}
                        disableColumnMenu={true}
                        disableRowSelectionOnClick

                        initialState={{
                            pagination: {paginationModel: {pageSize: 10}},
                            // sorting: { sortModel: [{ field: 'orderDate', sort: 'desc' }] },
                        }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: false,
                                printOptions: {disableToolbarButton: true},
                            },
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            "& .MuiDataGrid-root": {
                                border: "none",
                            },
                            "& .MuiDataGrid-cell": {
                                borderBottom: "none",
                            },
                            "& .MuiDataGrid-columnHeader ": {
                                backgroundColor: `${theme.palette.background.alt} !important`,
                                color: theme.palette.secondary[200],
                                borderBottom: "none",
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: `${theme.palette.background.alt} !important`,
                                color: theme.palette.secondary[100],
                                borderBottom: "none",
                            },

                            "& .MuiDataGrid-columnSeparator": {
                                backgroundColor: `${theme.palette.background.alt} !important`,
                            },
                            "& .MuiDataGrid-scrollbarFiller--header": {
                                backgroundColor: `${theme.palette.background.alt} !important`,
                            },
                            "& .MuiDataGrid-virtualScroller": {
                                backgroundColor: theme.palette.primary.light,
                            },
                            "& .MuiDataGrid-footerContainer": {
                                backgroundColor: theme.palette.background.alt,
                                color: theme.palette.secondary[100],
                                borderTop: "none",
                            },
                            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {

                                color: `${theme.palette.secondary[200]} !important`,
                            },
                        }}
                    />
                </Box>

                {/*Quick Actions Menu*/}
                <QuickActionsMenu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={() => {
                        setMenuAnchorEl(null);
                        setMenuOrder(null);
                    }}
                    order={menuOrder}
                    onAction={handleQuickAction}
                />

                {/* Create/Edit Order Dialog */}
                <OrderFormDialog
                    open={createDialogOpen}
                    onClose={() => {
                        setCreateDialogOpen(false);
                        setEditingOrder(null);
                    }}
                    onSave={editingOrder ? handleUpdateOrder : handleCreateOrder}
                    order={editingOrder}
                    branches={!(isBranchesLoading || isBranchesFetching) ? branches : {}}
                    users={!(isSalesUsersLoading || isSalesUsersFetching) ? salesUsers : {}}
                    laserWorkers={!(isLaserWorkersLoading || isLaserWorkersFetching) ? laserWorkers : {}}
                />

                {/* Order Detail Dialog */}
                <OrderDetailDialog
                    open={detailDialogOpen}
                    onClose={() => {
                        setDetailDialogOpen(false);
                        setSelectedOrder(null);
                    }}
                    order={selectedOrder}
                />

                {/* Status Change Dialog */}
                <StatusChangeDialog
                    open={statusDialogOpen}
                    onClose={() => {
                        setStatusDialogOpen(false);
                        setStatusOption('');
                        setSelectedOrder(null);
                    }}
                    order={selectedOrder}
                    onStatusChange={handleStatusChange}
                    users={!(isLaserWorkersLoading || isLaserWorkersFetching) ? laserWorkers : {}}
                    option={statusOption}
                />

                {/* Filter Drawer */}
                <FilterDrawer
                    open={filterDrawerOpen}
                    onClose={() => setFilterDrawerOpen(false)}
                    filters={filters}
                    onFilterChange={setFilters}
                    branches={branches}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default OrdersPage;
