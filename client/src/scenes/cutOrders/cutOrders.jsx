import React, {useState, useMemo, useEffect} from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Tabs,
    Tab,
    Badge,
    Stack,
    InputAdornment,
    Tooltip,
    ButtonGroup,
    useTheme,
    styled,
    OutlinedInput, LinearProgress, alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    ContentCut as CutIcon,
    Factory as FactoryIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    Inventory as InventoryIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// My Components
import Header from "../../components/Header";
import CutStatsCards from "../../components/cutOrdersPageComponents/cutStatCards";
import FilterDrawer from "../../components/cutOrdersPageComponents/filterDrawer";
import OrderRow from "../../components/cutOrdersPageComponents/orderRow";
import ActionMenu from "../../components/cutOrdersPageComponents/actionMenu";
//Dialogs
import OrderFormDialog from "../../components/cutOrdersPageComponents/dialogs/orderFormDialog";
import ViewOrderDialog from "../../components/cutOrdersPageComponents/dialogs/viewOrderDialog";
import AssignCuttingDialog from "../../components/cutOrdersPageComponents/dialogs/assignCuttingDialog";
import AssignProductionDialog from "../../components/cutOrdersPageComponents/dialogs/assignProductionDialog";
import IssueDialog from "../../components/cutOrdersPageComponents/dialogs/issueDialog";
import DeleteConfirmDialog from "../../components/cutOrdersPageComponents/dialogs/deleteConfirmDialog";

//RTK Query Endpoint Hooks
import {
    useAddCutOrderMutation,
    useAddNewIssueMutation,
    useGetAllCutOrdersQuery,
    useUpdateCutOrderMutation
} from "../../state/apis/api";

import toast from "react-hot-toast";

// Styled Components
const SearchInput = styled(OutlinedInput)(({theme}) => ({
    borderRadius: theme.shape.borderRadius * 2,
    '& fieldset': {
        borderColor: alpha(theme.palette.divider, 0.3),
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
}));

// Constants

const productionGroups = ['Group A', 'Group B'];

const ORDER_ACTIONS = {
    VIEW: 'VIEW',
    EDIT: 'EDIT',
    ASSIGN_CUTTING: 'ASSIGN_CUTTING',
    START_CUTTING: 'START_CUTTING',
    ASSIGN_PRODUCTION: 'ASSIGN_PRODUCTION',
    MOVE_TO_PRODUCTION: 'MOVE_TO_PRODUCTION',
    COMPLETE: 'COMPLETE',
    REPORT_ISSUE: 'REPORT_ISSUE',
    CANCEL: 'CANCEL',
    DELETE: 'DELETE',
};

const CutOrdersPage = () => {
    const theme = useTheme();

    // State
    const [cutOrders, setCutOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusTab, setStatusTab] = useState('');
    const [orderBy, setOrderBy] = useState('addedDate'); // Kept only for code, probably will be removed
    const [order, setOrder] = useState('desc');
    const [expandedRows, setExpandedRows] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    // Filter state
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [filters, setFilters] = useState({
        priority: [],
        category: [],
        dateRange: {start: null, end: null},
        minQuantity: '',
        maxQuantity: '',
        hasIssues: null,
        isOverdue: null,
    });

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })

    const [rowCount, setRowCount] = useState(0);

    // Dialogs
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [assignCuttingDialogOpen, setAssignCuttingDialogOpen] = useState(false);
    const [assignProductionDialogOpen, setAssignProductionDialogOpen] = useState(false);
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    // Form state for new/edit cut order
    const initialOrderForm = {
        productId: '',
        variantId: '',
        quantity: 1,
        priority: 'NORMAL',
        dueDate: null,
        instructions: '',
        notes: '',
        materialsRequired: [],
    };
    const [orderForm, setOrderForm] = useState(initialOrderForm);

    //RTK Query Endpoint Calls
    const {
        data: allCutOrders,
        isLoading: isCutOrdersLoading,
        isFetching: isCutOrdersFetching,
        refetch: refetchCutOrders
    } = useGetAllCutOrdersQuery({
        page: paginationModel.page + 1,
        size: paginationModel.pageSize,
        filters: {
            ...filters,
            dateRange: JSON.stringify(filters.dateRange),
        }
    })
    const [addCutOrder] = useAddCutOrderMutation();
    const [updateCutOrder] = useUpdateCutOrderMutation();
    const [addNewIssue] = useAddNewIssueMutation();

    useEffect(() => {
        if (!allCutOrders) return;

        // console.log("Cut Orders:", allCutOrders);
        setCutOrders(allCutOrders.data);
        setRowCount(allCutOrders.stats.total);
    }, [allCutOrders]);

    useEffect(() => {
        setPaginationModel(prev => ({...prev, page: 0}));
        setFilters((prev) => ({
            ...prev,
            status: statusTab,
        }))
    }, [statusTab]);

    // ============================================
    // COMPUTED VALUES
    // ============================================


    const categories = useMemo(() => { // Later HAS to be interchanged with dedicated endpoint
        return [...new Set(cutOrders.map(o => o.category))];
    }, [cutOrders]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.priority.length > 0) count++;
        if (filters.category.length > 0) count++;
        if (filters.dateRange.start) count++;
        if (filters.dateRange.end) count++;
        if (filters.minQuantity) count++;
        if (filters.maxQuantity) count++;
        if (filters.hasIssues !== null) count++;
        if (filters.isOverdue !== null) count++;
        return count;
    }, [filters]);


    const clearAllFilters = () => {
        setFilters({
            priority: [],
            category: [],
            dateRange: {start: null, end: null},
            minQuantity: '',
            maxQuantity: '',
            hasIssues: null,
            isOverdue: null,
        });
    };

    // ============================================
    // HANDLERS
    // ============================================

    const handleCreateCutOrder = async (cutOrderData) => {
        try {
            await addCutOrder(cutOrderData).unwrap();
            toast.success("Cut Order Created Successfully!")
        } catch (error) {
            toast.error("Cut Order Creation Failed!");
        }
    };

    const handleEditCutOrder = async (cutOrderData) => {
        try {
            await updateCutOrder({cutOrderId: selectedOrder._id, data: cutOrderData}).unwrap();
            toast.success("Cut Order Edited Successfully!");
        } catch (error) {
            toast.error("Cut Order Edit Failed!");
        } finally {
            setEditDialogOpen(false);
            setSelectedOrder(null);
            setOrderForm(initialOrderForm);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setPaginationModel((prev) => ({...prev, page: 0}))
            await refetchCutOrders().unwrap();
            toast.success("Cut Orders Refreshed!");
        } catch (error) {
            toast.error("Cut Orders Could Not be Refreshed!");
        } finally {
            setRefreshing(false);
        }
    };

    const handleAssignCutting = async (user) => {
        try {
            const assignedToCutting = {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                assignedDate: new Date(),
            }

            const cutOrderData = {
                ...selectedOrder,
                assignedToCutting: assignedToCutting
            }

            await updateCutOrder({cutOrderId: selectedOrder._id, data: cutOrderData}).unwrap();
            toast.success("Laser Operator Assigned Successfully!");
        } catch (error) {
            toast.error("Laser Operator Assignment Failed!");
        } finally {
            setAssignCuttingDialogOpen(false);
            setSelectedOrder(null);
        }
    };

    const handleAssignProduction = async (group) => {
        try {
            const assignedToProduction = {
                group: group,
                assignedDate: new Date(),
            }

            await updateCutOrder({
                cutOrderId: selectedOrder._id,
                data: {assignedToProduction: assignedToProduction}
            }).unwrap();
            toast.success("Production Group Assigned Successfully!");
        } catch (error) {
            toast.error("Production Group Assignment Failed!");
        } finally {
            setAssignProductionDialogOpen(false);
            setSelectedOrder(null);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const order = cutOrders.find(o => o._id === orderId);

            const updates = {status: newStatus};

            if (newStatus === 'CUTTING' && order.cuttingStartedDate === null) {
                updates.cuttingStartedDate = new Date();
            } else if (newStatus === 'IN_PRODUCTION') {
                if (!order.cuttingCompletedDate) updates.cuttingCompletedDate = new Date();
                if (!order.productionStartedDate) updates.productionStartedDate = new Date();
            } else if (newStatus === 'COMPLETED') {
                updates.completedDate = new Date();
            }

            await updateCutOrder({cutOrderId: orderId, data: updates}).unwrap();
            toast.success("Cut Order Updated Successfully!");
        } catch (error) {
            console.error(error)
            toast.error("Cut Orders Update Failed!");
        }
    };

    const handleReportIssue = async (orderId, description) => {
        try {
            const issue = {
                description: description,
                reportedBy: {
                    userId: '68acdee03f62212a72502f36',
                    name: "Luka Osiashvili"
                },
                reportedDate: new Date(),
            }

            await addNewIssue({cutOrderId: orderId, data: issue}).unwrap();
            toast.success("New Issue Added!");
        } catch (error) {
            toast.error("Issue Could not be Added!");
        } finally {
            setSelectedOrder(null);
        }
    };

    const handleDeleteOrder = () => {
        setCutOrders(prev => prev.filter(o => o._id !== selectedOrder?._id));
        setDeleteConfirmOpen(false);
        setSelectedOrder(null);
        handleMenuClose();
    };

    // P.S. Currently it is not actively used in practice, only stayed as complete recipe for future reference
    // More likely to be removed
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleExpandRow = (orderId) => {
        setExpandedRows(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    //==================================================
    // HANDLE OPEN / CLOSE DIALOGS
    //==================================================

    const handleMenuOpen = (event, orderData) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedOrder(orderData);
    };

    const openEditDialog = (orderData) => {
        setSelectedOrder(orderData);
        setOrderForm({
            productId: orderData.productId,
            variantId: orderData.variantId,
            quantity: orderData.quantity,
            priority: orderData.priority,
            dueDate: orderData.dueDate ? dayjs(orderData.dueDate) : null,
            instructions: orderData.instructions || '',
            notes: orderData.notes || '',
            materialsRequired: [...orderData.materialsRequired],
        });
        setEditDialogOpen(true);
    };

    const handleViewOrder = (orderData) => {
        setSelectedOrder(orderData);
        setViewDialogOpen(true);
    };

    const handleOpenAssignCuttingDialog = (orderData) => {
        setSelectedOrder(orderData);
        setAssignCuttingDialogOpen(true);
    };

    const handleOpenAssignProductionDialog = (orderData) => {
        setSelectedOrder(orderData);
        setAssignProductionDialogOpen(true);
    };

    const handleOpenIssueDialog = (orderData) => {
        setSelectedOrder(orderData);
        setIssueDialogOpen(true);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    //==================================================

    const handleOrderAction = (action, order) => {
        switch (action) {
            case ORDER_ACTIONS.VIEW:
                handleViewOrder(order);
                break;

            case ORDER_ACTIONS.EDIT:
                openEditDialog(order);
                break;

            case ORDER_ACTIONS.ASSIGN_CUTTING:
                handleOpenAssignCuttingDialog(order);
                break;

            case ORDER_ACTIONS.START_CUTTING:
                handleStatusChange(order._id, 'CUTTING');
                break;

            case ORDER_ACTIONS.ASSIGN_PRODUCTION:
                handleOpenAssignProductionDialog(order);
                break;

            case ORDER_ACTIONS.MOVE_TO_PRODUCTION:
                handleStatusChange(order._id, 'IN_PRODUCTION');
                break;

            case ORDER_ACTIONS.COMPLETE:
                handleStatusChange(order._id, 'COMPLETED');
                break;

            case ORDER_ACTIONS.REPORT_ISSUE:
                handleOpenIssueDialog(order);
                break;

            case ORDER_ACTIONS.CANCEL:
                handleStatusChange(order._id, 'CANCELLED');
                break;

            case ORDER_ACTIONS.DELETE:
                setDeleteConfirmOpen(true);
                break;

            default:
                console.warn('Unhandled order action:', action);
        }
    };

    // ============================================
    // MAIN RETURN
    // ============================================

    return (
        <Box m="1.5rem 2rem">
            {/* Page Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Header title={"Cut Orders Management"}
                        subtitle={"Manage cutting orders, track production progress, and monitor materials"}/>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon/>}
                    onClick={() => setAddDialogOpen(true)}
                    sx={{borderRadius: 2}}
                >
                    New Cut Order
                </Button>
            </Stack>

            {/* Stats Cards */}
            <CutStatsCards/>

            <Paper sx={{
                borderRadius: "5px 5px 0 0",
                overflow: 'hidden',
                minWidth: 0,
                backgroundColor: theme.palette.background.alt
            }}>

                {/* Tabs */}
                <Box sx={{borderBottom: 1, borderColor: 'divider', backgroundColor: theme.palette.background.alt}}>
                    <Tabs
                        value={statusTab}
                        onChange={(_, newValue) => {
                            setStatusTab(newValue);
                            setPaginationModel((prev) => ({...prev, page: 0}));
                        }}
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 56,
                                px: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: theme.palette.background.alt
                            },
                        }}
                    >
                        {/*ALL ORDERS TAB*/}
                        <Tab
                            value=""
                            label={
                                <Badge badgeContent={rowCount} color="primary">
                                    All Orders
                                </Badge>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                        {/*PENDING ORDERS TAB*/}
                        <Tab
                            value="PENDING"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ScheduleIcon fontSize="small" color="warning"/>
                                    <Badge badgeContent={allCutOrders?.stats.pending} color="warning">
                                        Pending
                                    </Badge>
                                </Stack>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                        {/*CUTTING ORDERS TAB*/}
                        <Tab
                            value="CUTTING"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CutIcon fontSize="small" color="info"/>
                                    <Badge badgeContent={allCutOrders?.stats.cutting} color="info">
                                        Cutting
                                    </Badge>
                                </Stack>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                        {/*IN PRODUCTION ORDERS TAB*/}
                        <Tab
                            value="IN_PRODUCTION"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <FactoryIcon fontSize="small" color="primary"/>
                                    <Badge badgeContent={allCutOrders?.stats.inProduction} color="primary">
                                        In Production
                                    </Badge>
                                </Stack>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                        {/*COMPLETED ORDERS TAB*/}
                        <Tab
                            value="COMPLETED"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CheckCircleIcon fontSize="small" color="success"/>
                                    <Badge badgeContent={allCutOrders?.stats.completed} color="success">
                                        Completed
                                    </Badge>
                                </Stack>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                        {/*CANCELLED ORDERS TAB*/}
                        <Tab
                            value="CANCELLED"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CancelIcon fontSize="small" color="error"/>
                                    <Badge badgeContent={allCutOrders?.stats.cancelled} color="error">
                                        Cancelled
                                    </Badge>
                                </Stack>
                            }
                            sx={{
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary[200]
                                }
                            }}
                        />
                    </Tabs>
                </Box>

                {/* Search and Actions */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.alt,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        {/*SEARCH BAR*/}
                        <SearchInput
                            size="small"
                            placeholder="Search by product, variant, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchIcon color="action"/>
                                </InputAdornment>
                            }
                            endAdornment={
                                searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <ClearIcon fontSize="small"/>
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                            sx={{width: 300}}
                        />

                        {/*FILTERS BUTTON*/}
                        <Badge badgeContent={activeFiltersCount} color="primary">
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
                                <Typography textTransform="none">
                                    Filters
                                </Typography>
                            </Button>
                        </Badge>

                        <Box sx={{flex: 1}}/>

                        {/*REFRESH BUTTON*/}
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

                            {/*EXPORT BUTTON*/}
                            <Tooltip title="Export">
                                <Button
                                    size="medium"
                                    onClick={() => {
                                        toast.success("Feature Coming Soon!")
                                    }}
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
                    {activeFiltersCount > 0 && (
                        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                            <Typography variant="h6" sx={{
                                alignSelf: 'center',
                                color: theme.palette.secondary.light,
                                textTransform: 'none'
                            }}>
                                Active filters:
                            </Typography>

                            {filters.priority.map((priority) => (
                                <Chip
                                    key={priority}
                                    size="small"
                                    label={`Priority: ${priority}`}
                                    onDelete={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            priority: prev.priority.filter((p) => p !== priority),
                                        }))
                                    }
                                />
                            ))}

                            {filters.category.map((category) => (
                                <Chip
                                    key={category}
                                    size="small"
                                    label={`Category: ${category}`}
                                    onDelete={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            category: prev.category.filter((c) => c !== category),
                                        }))
                                    }
                                />
                            ))}

                            {(filters.dateRange.start) && (
                                <Chip
                                    size="small"
                                    label={`From: ${dayjs(filters.dateRange.start).format("DD MMM YYYY, HH:mm")}`}
                                    onDelete={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateRange: {start: null, end: null},
                                        }))
                                    }
                                />
                            )}

                            {(filters.dateRange.end) && (
                                <Chip
                                    size="small"
                                    label={`Until: ${dayjs(filters.dateRange.end).format("DD MMM YYYY, HH:mm")}`}

                                    onDelete={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateRange: {start: null, end: null},
                                        }))
                                    }
                                />
                            )}

                            {filters.minQuantity && (
                                <Chip
                                    size="small"
                                    label={`Min Qty: ${filters.minQuantity}`}
                                    onDelete={() =>
                                        setFilters((prev) => ({...prev, minQuantity: ''}))
                                    }
                                />
                            )}

                            {filters.maxQuantity && (
                                <Chip
                                    size="small"
                                    label={`Max Qty: ${filters.maxQuantity}`}
                                    onDelete={() =>
                                        setFilters((prev) => ({...prev, maxQuantity: ''}))
                                    }
                                />
                            )}

                            {filters.hasIssues !== null && (
                                <Chip
                                    size="small"
                                    label="Has Issues"
                                    onDelete={() =>
                                        setFilters((prev) => ({...prev, hasIssues: null}))
                                    }
                                />
                            )}

                            {filters.isOverdue !== null && (
                                <Chip
                                    size="small"
                                    label="Overdue"
                                    onDelete={() =>
                                        setFilters((prev) => ({...prev, isOverdue: null}))
                                    }
                                />
                            )}

                            <Button
                                size="small"
                                onClick={clearAllFilters}
                            >
                                <Typography color="textSecondary" sx={{textTransform: 'none'}}>
                                    Clear All
                                </Typography>
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Paper>

            {refreshing && <LinearProgress/>}

            {/* Orders Table */}
            <Paper elevation={0}
                   sx={{border: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.primary.alt}}>
                <TableContainer
                    sx={{
                        border: "none",
                        // backgroundColor: theme.palette.primary.light
                    }}
                >
                    <Table>
                        <TableHead
                            sx={{
                                backgroundColor: `${theme.palette.background.alt} !important`,
                            }}
                        >
                            <TableRow>
                                <TableCell
                                    sx={{
                                        width: 50,
                                        borderBottom: 'none',
                                        backgroundColor: theme.palette.background.alt,
                                    }}
                                />

                                {[
                                    {label: 'Product', key: 'productName'}, // was sortable
                                    {label: 'Category'},
                                    {label: 'Qty', align: 'center'},
                                    {label: 'Status'},
                                    {label: 'Priority', key: 'priority'}, // was sortable
                                    {label: 'Add Date', key: 'addedDate'},
                                    {label: 'Due Date', key: 'dueDate'}, // was sortable
                                    {label: 'Cutting By'},
                                    {label: 'Production'},
                                    {label: 'Est. Cost', align: 'right'},
                                    {label: 'Actions', align: 'center'},
                                ].map((col) => (
                                    <TableCell
                                        key={col.label}
                                        align={col.align || 'left'}
                                        sx={{
                                            borderBottom: 'none',
                                            color: theme.palette.secondary[200],
                                            backgroundColor: theme.palette.background.alt,
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {col.sortable ? (
                                            <TableSortLabel
                                                active={orderBy === col.key}
                                                direction={orderBy === col.key ? order : 'asc'}
                                                onClick={() => handleSort(col.key)}
                                                sx={{
                                                    color: theme.palette.secondary[200],
                                                    '&.Mui-active': {
                                                        color: theme.palette.secondary[100],
                                                    },
                                                    '& .MuiTableSortLabel-icon': {
                                                        color: `${theme.palette.secondary[200]} !important`,
                                                    },
                                                }}
                                            >
                                                {col.label}
                                            </TableSortLabel>
                                        ) : (
                                            col.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody
                            // sx={{
                            //     backgroundColor: theme.palette.primary.light,
                            // }}
                        >
                            {cutOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center" sx={{
                                        py: 8,
                                        borderBottom: 'none',
                                        backgroundColor: theme.palette.primary[400]
                                    }}>
                                        <Stack alignItems="center" spacing={2}>
                                            <InventoryIcon sx={{fontSize: 60, color: 'text.disabled'}}/>
                                            <Typography variant="h6" color="text.secondary">
                                                No cut orders found
                                            </Typography>
                                            <Typography variant="body2" color="text.disabled">
                                                {searchTerm || activeFiltersCount > 0
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Create a new cut order to get started'}
                                            </Typography>
                                            {!(searchTerm || activeFiltersCount > 0) && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<AddIcon/>}
                                                    onClick={() => setAddDialogOpen(true)}
                                                >
                                                    Create Cut Order
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cutOrders.map((orderData) => (
                                    <OrderRow
                                        key={orderData._id}
                                        orderData={orderData}
                                        isExpanded={expandedRows[orderData._id]}
                                        onExpandRow={handleExpandRow}
                                        onViewOrder={handleViewOrder}
                                        onMenuOpen={handleMenuOpen}
                                        onStatusChange={handleStatusChange}
                                        onOpenEditDialog={openEditDialog}
                                        onOpenAssignCuttingDialog={handleOpenAssignCuttingDialog}
                                        onOpenAssignProductionDialog={handleOpenAssignProductionDialog}
                                        onOpenIssueDialog={handleOpenIssueDialog}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"

                    count={rowCount}
                    page={paginationModel.page}
                    onPageChange={(_, newPage) => setPaginationModel((prev) => ({...prev, page: newPage}))}
                    rowsPerPage={paginationModel.pageSize}
                    onRowsPerPageChange={(e) => {
                        setPaginationModel({page: 0, pageSize: e.target.value})
                    }}

                    rowsPerPageOptions={[5, 10, 15]}

                    sx={{
                        backgroundColor: theme.palette.background.alt,
                        color: theme.palette.secondary[100],
                        borderTop: 'none',

                        /* Toolbar */
                        '& .MuiTablePagination-toolbar': {
                            minHeight: 52,
                        },

                        /* Rows-per-page select */
                        '& .MuiTablePagination-select': {
                            color: theme.palette.secondary[100],
                        },

                        /* Dropdown & pagination icons */
                        '& .MuiSvgIcon-root': {
                            color: theme.palette.secondary[200],
                        },

                        /* Prev / Next buttons */
                        '& .MuiIconButton-root': {
                            color: theme.palette.secondary[200],
                            '&.Mui-disabled': {
                                color: theme.palette.action.disabled,
                            },
                        },
                    }}
                />
            </Paper>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
            />

            {/* Add Order Dialog */}
            <OrderFormDialog
                open={addDialogOpen}
                onClose={() => {
                    setAddDialogOpen(false);
                    setOrderForm(initialOrderForm);
                }}
                isEdit={false}
                orderForm={orderForm}
                setOrderForm={setOrderForm}
                onSubmit={handleCreateCutOrder}
                selectedOrder={null}
            />

            {/* Edit Order Dialog */}
            <OrderFormDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedOrder(null);
                    setOrderForm(initialOrderForm);
                }}
                isEdit={true}
                orderForm={orderForm}
                setOrderForm={setOrderForm}
                onSubmit={handleEditCutOrder}
                selectedOrder={selectedOrder}
            />

            {/* View Order Dialog */}
            <ViewOrderDialog
                selectedOrder={selectedOrder}
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                openEditDialog={openEditDialog}
            />

            {/* Assign Cutting Dialog */}
            <AssignCuttingDialog
                open={assignCuttingDialogOpen}
                onClose={() => {
                    setAssignCuttingDialogOpen(false);
                    setSelectedOrder(null);
                }}
                selectedOrder={selectedOrder}
                onAssign={handleAssignCutting}
            />

            {/* Assign Production Dialog */}
            <AssignProductionDialog
                open={assignProductionDialogOpen}
                onClose={() => {
                    setAssignProductionDialogOpen(false);
                    setSelectedOrder(null);
                }}
                selectedOrder={selectedOrder}
                productionGroups={productionGroups}
                onAssign={handleAssignProduction}
            />

            {/* Issue Dialog */}
            <IssueDialog
                open={issueDialogOpen}
                onClose={() => {
                    setIssueDialogOpen(false);
                    setSelectedOrder(null);
                }}
                selectedOrder={selectedOrder}
                onReportIssue={handleReportIssue}
            />

            {/* Delete Confirm Dialog */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setSelectedOrder(null);
                }}
                selectedOrder={selectedOrder}
                onDelete={handleDeleteOrder}
            />

            {/* Action Menu */}
            <ActionMenu
                anchorEl={menuAnchorEl}
                order={selectedOrder}
                onClose={handleMenuClose}
                onAction={handleOrderAction}
                actions={ORDER_ACTIONS}
            />
        </Box>
    );
};

export default CutOrdersPage;