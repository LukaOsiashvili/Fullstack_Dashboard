import React, {useState, useMemo} from 'react';
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
    OutlinedInput,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
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
import FilterDrawer from "../../components/cutOrdersPageComponents/filterDrawer";
import {isOverdue} from "../../components/cutOrdersPageComponents/utilityFunctions";
import {
    dummyUsers,
    dummyCutOrders,
    productionGroups,
} from "../../components/cutOrdersPageComponents/dummyData";
import CutStatsCards from "../../components/cutOrdersPageComponents/cutStatCards";
import OrderFormDialog from "../../components/cutOrdersPageComponents/dialogs/orderFormDialog";
import ActionMenu from "../../components/cutOrdersPageComponents/actionMenu";
import ViewOrderDialog from "../../components/cutOrdersPageComponents/dialogs/viewOrderDialog";
import OrderRow from "../../components/cutOrdersPageComponents/orderRow";
import AssignCuttingDialog from "../../components/cutOrdersPageComponents/dialogs/assignCuttingDialog";
import AssignProductionDialog from "../../components/cutOrdersPageComponents/dialogs/assignProductionDialog";
import IssueDialog from "../../components/cutOrdersPageComponents/dialogs/issueDialog";
import DeleteConfirmDialog from "../../components/cutOrdersPageComponents/dialogs/deleteConfirmDialog";

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
    const [cutOrders, setCutOrders] = useState(dummyCutOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusTab, setStatusTab] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('addedDate');
    const [order, setOrder] = useState('desc');
    const [expandedRows, setExpandedRows] = useState({});

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

    // ============================================
    // COMPUTED VALUES
    // ============================================

    const stats = useMemo(() => {
        const pending = cutOrders.filter(o => o.status === 'PENDING').length;
        const cutting = cutOrders.filter(o => o.status === 'CUTTING').length;
        const inProduction = cutOrders.filter(o => o.status === 'IN_PRODUCTION').length;
        const completed = cutOrders.filter(o => o.status === 'COMPLETED').length;
        const cancelled = cutOrders.filter(o => o.status === 'CANCELLED').length;
        const overdue = cutOrders.filter(o => isOverdue(o)).length;
        const urgent = cutOrders.filter(o => o.priority === 'URGENT' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        const total = cutOrders.length;

        return {pending, cutting, inProduction, completed, cancelled, overdue, urgent, total};
    }, [cutOrders]);

    const categories = useMemo(() => {
        return [...new Set(cutOrders.map(o => o.category))];
    }, [cutOrders]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.priority.length > 0) count++;
        if (filters.category.length > 0) count++;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.minQuantity || filters.maxQuantity) count++;
        if (filters.hasIssues !== null) count++;
        if (filters.isOverdue !== null) count++;
        return count;
    }, [filters]);

    const filteredOrders = useMemo(() => {
        return cutOrders.filter(order => {
            // Search filter
            const matchesSearch =
                order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order._id.toLowerCase().includes(searchTerm.toLowerCase());

            // Status tab filter
            const matchesStatus = statusTab === 'ALL' || order.status === statusTab;

            // Priority filter
            const matchesPriority = filters.priority.length === 0 || filters.priority.includes(order.priority);

            // Category filter
            const matchesCategory = filters.category.length === 0 || filters.category.includes(order.category);

            // Date range filter
            let matchesDateRange = true;
            if (filters.dateRange.start && order.dueDate) {
                matchesDateRange = dayjs(order.dueDate).isAfter(filters.dateRange.start) || dayjs(order.dueDate).isSame(filters.dateRange.start, 'day');
            }
            if (matchesDateRange && filters.dateRange.end && order.dueDate) {
                matchesDateRange = dayjs(order.dueDate).isBefore(filters.dateRange.end) || dayjs(order.dueDate).isSame(filters.dateRange.end, 'day');
            }

            // Quantity filter
            let matchesQuantity = true;
            if (filters.minQuantity) {
                matchesQuantity = order.quantity >= parseInt(filters.minQuantity);
            }
            if (matchesQuantity && filters.maxQuantity) {
                matchesQuantity = order.quantity <= parseInt(filters.maxQuantity);
            }

            // Has issues filter
            let matchesIssues = true;
            if (filters.hasIssues === true) {
                matchesIssues = order.issues.some(i => !i.resolved);
            }

            // Overdue filter
            let matchesOverdue = true;
            if (filters.isOverdue === true) {
                matchesOverdue = isOverdue(order);
            }

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDateRange && matchesQuantity && matchesIssues && matchesOverdue;
        }).sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (orderBy === 'addedDate' || orderBy === 'dueDate') {
                const aDate = aValue ? dayjs(aValue) : dayjs(0);
                const bDate = bValue ? dayjs(bValue) : dayjs(0);
                return order === 'asc' ? aDate.diff(bDate) : bDate.diff(aDate);
            }

            if (typeof aValue === 'string') {
                return order === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return order === 'asc' ? aValue - bValue : bValue - aValue;
        });
    }, [cutOrders, searchTerm, statusTab, filters, orderBy, order]);

    // ============================================
    // HANDLERS
    // ============================================

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

    const handleMenuOpen = (event, orderData) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedOrder(orderData);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleStatusChange = (orderId, newStatus) => {
        setCutOrders(prev => prev.map(order => {
            if (order._id === orderId) {
                const updates = {status: newStatus};

                if (newStatus === 'CUTTING' && !order.cuttingStartedDate) {
                    updates.cuttingStartedDate = new Date();
                } else if (newStatus === 'IN_PRODUCTION') {
                    if (!order.cuttingCompletedDate) updates.cuttingCompletedDate = new Date();
                    if (!order.productionStartedDate) updates.productionStartedDate = new Date();
                } else if (newStatus === 'COMPLETED') {
                    updates.completedDate = new Date();
                }

                return {...order, ...updates};
            }
            return order;
        }));
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

    const handleAssignCutting = (userId) => {
        const user = dummyUsers.find(u => u._id === userId);
        setCutOrders(prev => prev.map(order => {
            if (order._id === selectedOrder?._id) {
                return {
                    ...order,
                    assignedToCutting: {
                        userId: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        assignedDate: new Date(),
                    },
                };
            }
            return order;
        }));
        setAssignCuttingDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleAssignProduction = (group) => {
        setCutOrders(prev => prev.map(order => {
            if (order._id === selectedOrder?._id) {
                return {
                    ...order,
                    assignedToProduction: {
                        group,
                        assignedDate: new Date(),
                    },
                };
            }
            return order;
        }));
        setAssignProductionDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleReportIssue = (orderId, description) => {
        setCutOrders(prev => prev.map(order => {
            if (order._id === orderId) {
                return {
                    ...order,
                    issues: [
                        ...order.issues,
                        {
                            description,
                            reportedBy: {userId: 'user1', name: 'John Smith'},
                            reportedDate: new Date(),
                            resolved: false,
                        },
                    ],
                };
            }
            return order;
        }));
        setSelectedOrder(null);
    };

    const handleDeleteOrder = () => {
        setCutOrders(prev => prev.filter(o => o._id !== selectedOrder?._id));
        setDeleteConfirmOpen(false);
        setSelectedOrder(null);
        handleMenuClose();
    };

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
    // MAIN RETURN
    // ============================================

    return (
        <Box sx={{p: 3}}>
            {/* Page Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Cut Orders Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage cutting orders, track production progress, and monitor materials
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => setAddDialogOpen(true)}
                    >
                        New Cut Order
                    </Button>
                </Stack>
            </Stack>

            {/* Stats Cards */}
            <CutStatsCards cutOrders={cutOrders}/>

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
                            setPage(0);
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
                        <Tab
                            value="ALL"
                            label={
                                <Badge badgeContent={stats.total} color="primary">
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
                        <Tab
                            value="PENDING"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ScheduleIcon fontSize="small" color="warning"/>
                                    <Badge badgeContent={stats.pending} color="warning">
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
                        <Tab
                            value="CUTTING"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CutIcon fontSize="small" color="info"/>
                                    <Badge badgeContent={stats.cutting} color="info">
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
                        <Tab
                            value="IN_PRODUCTION"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <FactoryIcon fontSize="small" color="primary"/>
                                    <Badge badgeContent={stats.inProduction} color="primary">
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
                        <Tab
                            value="COMPLETED"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CheckCircleIcon fontSize="small" color="success"/>
                                    <Badge badgeContent={stats.completed} color="success">
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
                        <Tab
                            value="CANCELLED"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CancelIcon fontSize="small" color="error"/>
                                    <Badge badgeContent={stats.cancelled} color="error">
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
                                Filters
                            </Button>
                        </Badge>

                        <Box sx={{flex: 1}}/>

                        <ButtonGroup variant="outlined" size="small">
                            <Tooltip title="Refresh">
                                <Button
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
                    {activeFiltersCount > 0 && (
                        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                            <Typography variant="h5" sx={{alignSelf: 'center'}}>
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

                            {(filters.dateRange.start || filters.dateRange.end) && (
                                <Chip
                                    size="small"
                                    label="Date Range"
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
                                color="secondary"
                                onClick={clearAllFilters}
                            >
                                Clear All
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Paper>

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
                        {/*<TableHead*/}
                        {/*    sx={{*/}
                        {/*        backgroundColor: `${theme.palette.background.alt} !important`,*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <TableRow>*/}
                        {/*        <TableCell sx={{width: 50}}/>*/}
                        {/*        <TableCell>*/}
                        {/*            <TableSortLabel*/}
                        {/*                active={orderBy === 'productName'}*/}
                        {/*                direction={orderBy === 'productName' ? order : 'asc'}*/}
                        {/*                onClick={() => handleSort('productName')}*/}
                        {/*            >*/}
                        {/*                Product*/}
                        {/*            </TableSortLabel>*/}
                        {/*        </TableCell>*/}
                        {/*        <TableCell>Category</TableCell>*/}
                        {/*        <TableCell align="center">Qty</TableCell>*/}
                        {/*        <TableCell>Status</TableCell>*/}
                        {/*        <TableCell>*/}
                        {/*            <TableSortLabel*/}
                        {/*                active={orderBy === 'priority'}*/}
                        {/*                direction={orderBy === 'priority' ? order : 'asc'}*/}
                        {/*                onClick={() => handleSort('priority')}*/}
                        {/*            >*/}
                        {/*                Priority*/}
                        {/*            </TableSortLabel>*/}
                        {/*        </TableCell>*/}
                        {/*        <TableCell>*/}
                        {/*            <TableSortLabel*/}
                        {/*                active={orderBy === 'dueDate'}*/}
                        {/*                direction={orderBy === 'dueDate' ? order : 'asc'}*/}
                        {/*                onClick={() => handleSort('dueDate')}*/}
                        {/*            >*/}
                        {/*                Due Date*/}
                        {/*            </TableSortLabel>*/}
                        {/*        </TableCell>*/}
                        {/*        <TableCell>Cutting By</TableCell>*/}
                        {/*        <TableCell>Production</TableCell>*/}
                        {/*        <TableCell align="right">Est. Cost</TableCell>*/}
                        {/*        <TableCell align="center">Actions</TableCell>*/}
                        {/*    </TableRow>*/}
                        {/*</TableHead>*/}
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
                                    { label: 'Product', key: 'productName', sortable: true },
                                    { label: 'Category' },
                                    { label: 'Qty', align: 'center' },
                                    { label: 'Status' },
                                    { label: 'Priority', key: 'priority', sortable: true },
                                    { label: 'Due Date', key: 'dueDate', sortable: true },
                                    { label: 'Cutting By' },
                                    { label: 'Production' },
                                    { label: 'Est. Cost', align: 'right' },
                                    { label: 'Actions', align: 'center' },
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
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center" sx={{py: 8, borderBottom: 'none'}}>
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
                                filteredOrders
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((orderData) => (
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
                    count={filteredOrders.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
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
                onSubmit={(newOrder) => {
                    setCutOrders(prev => [newOrder, ...prev]);
                    setAddDialogOpen(false);
                    setOrderForm(initialOrderForm);
                }}
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
                onSubmit={(updatedOrder) => {
                    setCutOrders(prev =>
                        prev.map(order =>
                            order._id === selectedOrder._id
                                ? {...order, ...updatedOrder}
                                : order
                        )
                    );
                    setEditDialogOpen(false);
                    setSelectedOrder(null);
                    setOrderForm(initialOrderForm);
                }}
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
                users={dummyUsers}
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