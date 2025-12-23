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
    Alert,
    Snackbar,
    Stack,
    Badge,
    Tooltip,
    alpha,
    useTheme,
    LinearProgress,
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

dayjs.extend(relativeTime);

// ============================================
// DUMMY DATA
// ============================================

const DUMMY_PRODUCTS = [
    {
        _id: 'prod_001',
        name: 'Gold Ring Classic',
        category: 'Rings',
        cost: 150,
        variants: [
            {_id: 'var_001', name: 'Size 6 - Yellow Gold', price: 299.99, stock: 15},
            {_id: 'var_002', name: 'Size 7 - Yellow Gold', price: 299.99, stock: 20},
            {_id: 'var_003', name: 'Size 8 - Yellow Gold', price: 319.99, stock: 12},
            {_id: 'var_004', name: 'Size 6 - White Gold', price: 349.99, stock: 8},
            {_id: 'var_005', name: 'Size 7 - White Gold', price: 349.99, stock: 10},
        ],
    },
    {
        _id: 'prod_002',
        name: 'Diamond Pendant',
        category: 'Necklaces',
        cost: 450,
        variants: [
            {_id: 'var_006', name: '0.25ct - Silver Chain', price: 899.99, stock: 5},
            {_id: 'var_007', name: '0.50ct - Silver Chain', price: 1499.99, stock: 3},
            {_id: 'var_008', name: '0.25ct - Gold Chain', price: 1199.99, stock: 7},
            {_id: 'var_009', name: '0.50ct - Gold Chain', price: 1899.99, stock: 2},
        ],
    },
    {
        _id: 'prod_003',
        name: 'Silver Bracelet',
        category: 'Bracelets',
        cost: 45,
        variants: [
            {_id: 'var_010', name: '7 inch - Thin', price: 89.99, stock: 25},
            {_id: 'var_011', name: '8 inch - Thin', price: 94.99, stock: 18},
            {_id: 'var_012', name: '7 inch - Wide', price: 129.99, stock: 12},
            {_id: 'var_013', name: '8 inch - Wide', price: 139.99, stock: 9},
        ],
    },
    {
        _id: 'prod_004',
        name: 'Pearl Earrings',
        category: 'Earrings',
        cost: 80,
        variants: [
            {_id: 'var_014', name: 'Small - White', price: 159.99, stock: 30},
            {_id: 'var_015', name: 'Medium - White', price: 199.99, stock: 22},
            {_id: 'var_016', name: 'Small - Black', price: 179.99, stock: 15},
            {_id: 'var_017', name: 'Medium - Black', price: 229.99, stock: 10},
        ],
    },
    {
        _id: 'prod_005',
        name: 'Engagement Ring Solitaire',
        category: 'Rings',
        cost: 1200,
        variants: [
            {_id: 'var_018', name: 'Size 5 - 1ct Diamond', price: 4999.99, stock: 2},
            {_id: 'var_019', name: 'Size 6 - 1ct Diamond', price: 4999.99, stock: 3},
            {_id: 'var_020', name: 'Size 7 - 1ct Diamond', price: 4999.99, stock: 4},
            {_id: 'var_021', name: 'Size 6 - 1.5ct Diamond', price: 7499.99, stock: 1},
        ],
    },
    {
        _id: 'prod_006',
        name: 'Custom Engraved Watch',
        category: 'Watches',
        cost: 350,
        variants: [
            {_id: 'var_022', name: 'Mens - Silver', price: 799.99, stock: 8},
            {_id: 'var_023', name: 'Mens - Gold', price: 999.99, stock: 5},
            {_id: 'var_024', name: 'Ladies - Silver', price: 699.99, stock: 10},
            {_id: 'var_025', name: 'Ladies - Gold', price: 899.99, stock: 6},
        ],
    },
];

const DUMMY_BRANCHES = [
    {
        _id: 'branch_001',
        name: 'Downtown Flagship',
        city: 'New York',
        address: '123 Fifth Avenue, NY 10001',
    },
    {
        _id: 'branch_002',
        name: 'Mall of America',
        city: 'Minneapolis',
        address: '456 Mall Boulevard, MN 55425',
    },
    {
        _id: 'branch_003',
        name: 'Beverly Hills',
        city: 'Los Angeles',
        address: '789 Rodeo Drive, CA 90210',
    },
    {
        _id: 'branch_004',
        name: 'Chicago Loop',
        city: 'Chicago',
        address: '321 Michigan Avenue, IL 60601',
    },
];

const DUMMY_USERS = [
    {_id: 'user_001', firstName: 'John', lastName: 'Smith', role: 'Sales Rep'},
    {_id: 'user_002', firstName: 'Sarah', lastName: 'Johnson', role: 'Sales Rep'},
    {_id: 'user_003', firstName: 'Michael', lastName: 'Brown', role: 'Manager'},
    {_id: 'user_004', firstName: 'Emily', lastName: 'Davis', role: 'Artisan'},
    {_id: 'user_005', firstName: 'David', lastName: 'Wilson', role: 'Artisan'},
    {_id: 'user_006', firstName: 'Jessica', lastName: 'Taylor', role: 'Admin'},
];

const DUMMY_ORDERS = [
    {
        _id: 'ord_001',
        items: [
            {
                productId: 'prod_001',
                productName: 'Gold Ring Classic',
                category: 'Rings',
                variantId: 'var_002',
                variantName: 'Size 7 - Yellow Gold',
                quantity: 1,
                unitPrice: 299.99,
                discount: 10,
                subtotal: 269.99,
            },
            {
                productId: 'prod_004',
                productName: 'Pearl Earrings',
                category: 'Earrings',
                variantId: 'var_014',
                variantName: 'Small - White',
                quantity: 2,
                unitPrice: 159.99,
                discount: 0,
                subtotal: 319.98,
            },
        ],
        orderType: 'SALE',
        branchId: 'branch_001',
        branchInfo: {
            name: 'Downtown Flagship',
            city: 'New York',
            address: '123 Fifth Avenue, NY 10001',
        },
        issuedBy: {
            userId: 'user_001',
            firstName: 'John',
            lastName: 'Smith',
        },
        customer: {
            name: 'Alice Williams',
            phone: '+1 (555) 123-4567',
            email: 'alice.williams@email.com',
        },
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        subtotal: 589.97,
        tax: 52.10,
        totalAmount: 642.07,
        totalCost: 310,
        grossProfit: 332.07,
        paymentMethod: 'CARD',
        orderDate: dayjs().subtract(2, 'hours').toDate(),
        dueDate: null,
        completedDate: dayjs().subtract(1, 'hour').toDate(),
        status: 'COMPLETED',
        notes: 'Gift wrapped upon request',
        cancellationReason: '',
        createdAt: dayjs().subtract(2, 'hours').toDate(),
        updatedAt: dayjs().subtract(1, 'hour').toDate(),
    },
    {
        _id: 'ord_002',
        items: [
            {
                productId: 'prod_005',
                productName: 'Engagement Ring Solitaire',
                category: 'Rings',
                variantId: 'var_019',
                variantName: 'Size 6 - 1ct Diamond',
                quantity: 1,
                unitPrice: 4999.99,
                discount: 5,
                subtotal: 4749.99,
            },
        ],
        orderType: 'CUSTOM',
        branchId: 'branch_003',
        branchInfo: {
            name: 'Beverly Hills',
            city: 'Los Angeles',
            address: '789 Rodeo Drive, CA 90210',
        },
        issuedBy: {
            userId: 'user_002',
            firstName: 'Sarah',
            lastName: 'Johnson',
        },
        customer: {
            name: 'Robert Martinez',
            phone: '+1 (555) 987-6543',
            email: 'rob.martinez@email.com',
        },
        requiresEngraving: true,
        engravedOnsite: false,
        customInstructions: 'Engrave "Forever Yours - R&M 2024" inside the band',
        assignedTo: {
            userId: 'user_004',
            firstName: 'Emily',
            lastName: 'Davis',
        },
        subtotal: 4749.99,
        tax: 427.50,
        totalAmount: 5177.49,
        totalCost: 1200,
        grossProfit: 3977.49,
        paymentMethod: 'CARD',
        orderDate: dayjs().subtract(3, 'days').toDate(),
        dueDate: dayjs().add(4, 'days').toDate(),
        completedDate: null,
        status: 'IN_PROGRESS',
        notes: 'Customer will pick up personally',
        cancellationReason: '',
        createdAt: dayjs().subtract(3, 'days').toDate(),
        updatedAt: dayjs().subtract(1, 'day').toDate(),
    },
    {
        _id: 'ord_003',
        items: [
            {
                productId: 'prod_002',
                productName: 'Diamond Pendant',
                category: 'Necklaces',
                variantId: 'var_009',
                variantName: '0.50ct - Gold Chain',
                quantity: 1,
                unitPrice: 1899.99,
                discount: 0,
                subtotal: 1899.99,
            },
            {
                productId: 'prod_003',
                productName: 'Silver Bracelet',
                category: 'Bracelets',
                variantId: 'var_012',
                variantName: '7 inch - Wide',
                quantity: 1,
                unitPrice: 129.99,
                discount: 15,
                subtotal: 110.49,
            },
        ],
        orderType: 'SALE',
        branchId: 'branch_002',
        branchInfo: {
            name: 'Mall of America',
            city: 'Minneapolis',
            address: '456 Mall Boulevard, MN 55425',
        },
        issuedBy: {
            userId: 'user_003',
            firstName: 'Michael',
            lastName: 'Brown',
        },
        customer: {
            name: 'Jennifer Lee',
            phone: '+1 (555) 456-7890',
            email: 'jen.lee@email.com',
        },
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        subtotal: 2010.48,
        tax: 140.73,
        totalAmount: 2151.21,
        totalCost: 495,
        grossProfit: 1656.21,
        paymentMethod: 'TRANSFER',
        orderDate: dayjs().subtract(1, 'day').toDate(),
        dueDate: null,
        completedDate: null,
        status: 'PENDING',
        notes: 'Waiting for payment confirmation',
        cancellationReason: '',
        createdAt: dayjs().subtract(1, 'day').toDate(),
        updatedAt: dayjs().subtract(1, 'day').toDate(),
    },
    {
        _id: 'ord_004',
        items: [
            {
                productId: 'prod_006',
                productName: 'Custom Engraved Watch',
                category: 'Watches',
                variantId: 'var_023',
                variantName: 'Mens - Gold',
                quantity: 1,
                unitPrice: 999.99,
                discount: 0,
                subtotal: 999.99,
            },
        ],
        orderType: 'CUSTOM',
        branchId: 'branch_001',
        branchInfo: {
            name: 'Downtown Flagship',
            city: 'New York',
            address: '123 Fifth Avenue, NY 10001',
        },
        issuedBy: {
            userId: 'user_001',
            firstName: 'John',
            lastName: 'Smith',
        },
        customer: {
            name: 'William Chen',
            phone: '+1 (555) 234-5678',
            email: 'w.chen@email.com',
        },
        requiresEngraving: true,
        engravedOnsite: true,
        customInstructions: 'Engrave company logo on back case',
        assignedTo: {
            userId: 'user_005',
            firstName: 'David',
            lastName: 'Wilson',
        },
        subtotal: 999.99,
        tax: 88.75,
        totalAmount: 1088.74,
        totalCost: 350,
        grossProfit: 738.74,
        paymentMethod: 'CASH',
        orderDate: dayjs().subtract(5, 'days').toDate(),
        dueDate: dayjs().subtract(2, 'days').toDate(),
        completedDate: dayjs().subtract(2, 'days').toDate(),
        status: 'COMPLETED',
        notes: '',
        cancellationReason: '',
        createdAt: dayjs().subtract(5, 'days').toDate(),
        updatedAt: dayjs().subtract(2, 'days').toDate(),
    },
    {
        _id: 'ord_005',
        items: [
            {
                productId: 'prod_001',
                productName: 'Gold Ring Classic',
                category: 'Rings',
                variantId: 'var_005',
                variantName: 'Size 7 - White Gold',
                quantity: 2,
                unitPrice: 349.99,
                discount: 20,
                subtotal: 559.98,
            },
        ],
        orderType: 'PRODUCTION',
        branchId: 'branch_004',
        branchInfo: {
            name: 'Chicago Loop',
            city: 'Chicago',
            address: '321 Michigan Avenue, IL 60601',
        },
        issuedBy: {
            userId: 'user_006',
            firstName: 'Jessica',
            lastName: 'Taylor',
        },
        customer: null,
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: 'Bulk order for inventory replenishment',
        assignedTo: {
            userId: 'user_004',
            firstName: 'Emily',
            lastName: 'Davis',
        },
        subtotal: 559.98,
        tax: 0,
        totalAmount: 559.98,
        totalCost: 300,
        grossProfit: 259.98,
        paymentMethod: 'PENDING',
        orderDate: dayjs().subtract(7, 'days').toDate(),
        dueDate: dayjs().add(7, 'days').toDate(),
        completedDate: null,
        status: 'IN_PROGRESS',
        notes: 'Priority production order',
        cancellationReason: '',
        createdAt: dayjs().subtract(7, 'days').toDate(),
        updatedAt: dayjs().subtract(3, 'days').toDate(),
    },
    {
        _id: 'ord_006',
        items: [
            {
                productId: 'prod_004',
                productName: 'Pearl Earrings',
                category: 'Earrings',
                variantId: 'var_016',
                variantName: 'Small - Black',
                quantity: 1,
                unitPrice: 179.99,
                discount: 0,
                subtotal: 179.99,
            },
        ],
        orderType: 'RETURN',
        branchId: 'branch_002',
        branchInfo: {
            name: 'Mall of America',
            city: 'Minneapolis',
            address: '456 Mall Boulevard, MN 55425',
        },
        issuedBy: {
            userId: 'user_002',
            firstName: 'Sarah',
            lastName: 'Johnson',
        },
        customer: {
            name: 'Patricia Brown',
            phone: '+1 (555) 345-6789',
            email: 'p.brown@email.com',
        },
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        subtotal: -179.99,
        tax: -15.93,
        totalAmount: -195.92,
        totalCost: -80,
        grossProfit: -115.92,
        paymentMethod: 'CARD',
        orderDate: dayjs().subtract(4, 'hours').toDate(),
        dueDate: null,
        completedDate: dayjs().subtract(3, 'hours').toDate(),
        status: 'RETURNED',
        notes: 'Customer reported allergic reaction',
        cancellationReason: '',
        createdAt: dayjs().subtract(4, 'hours').toDate(),
        updatedAt: dayjs().subtract(3, 'hours').toDate(),
    },
    {
        _id: 'ord_007',
        items: [
            {
                productId: 'prod_002',
                productName: 'Diamond Pendant',
                category: 'Necklaces',
                variantId: 'var_006',
                variantName: '0.25ct - Silver Chain',
                quantity: 1,
                unitPrice: 899.99,
                discount: 0,
                subtotal: 899.99,
            },
        ],
        orderType: 'SALE',
        branchId: 'branch_003',
        branchInfo: {
            name: 'Beverly Hills',
            city: 'Los Angeles',
            address: '789 Rodeo Drive, CA 90210',
        },
        issuedBy: {
            userId: 'user_003',
            firstName: 'Michael',
            lastName: 'Brown',
        },
        customer: {
            name: 'Thomas Anderson',
            phone: '+1 (555) 678-9012',
            email: 'neo@matrix.com',
        },
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        subtotal: 899.99,
        tax: 81.00,
        totalAmount: 980.99,
        totalCost: 450,
        grossProfit: 530.99,
        paymentMethod: 'CREDIT',
        orderDate: dayjs().subtract(6, 'hours').toDate(),
        dueDate: null,
        completedDate: null,
        status: 'CANCELLED',
        notes: '',
        cancellationReason: 'Customer changed their mind',
        createdAt: dayjs().subtract(6, 'hours').toDate(),
        updatedAt: dayjs().subtract(5, 'hours').toDate(),
    },
    {
        _id: 'ord_008',
        items: [
            {
                productId: 'prod_003',
                productName: 'Silver Bracelet',
                category: 'Bracelets',
                variantId: 'var_011',
                variantName: '8 inch - Thin',
                quantity: 3,
                unitPrice: 94.99,
                discount: 10,
                subtotal: 256.47,
            },
            {
                productId: 'prod_004',
                productName: 'Pearl Earrings',
                category: 'Earrings',
                variantId: 'var_015',
                variantName: 'Medium - White',
                quantity: 2,
                unitPrice: 199.99,
                discount: 10,
                subtotal: 359.98,
            },
        ],
        orderType: 'SALE',
        branchId: 'branch_001',
        branchInfo: {
            name: 'Downtown Flagship',
            city: 'New York',
            address: '123 Fifth Avenue, NY 10001',
        },
        issuedBy: {
            userId: 'user_001',
            firstName: 'John',
            lastName: 'Smith',
        },
        customer: {
            name: 'Mary Johnson',
            phone: '+1 (555) 890-1234',
            email: 'mary.j@email.com',
        },
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        subtotal: 616.45,
        tax: 54.71,
        totalAmount: 671.16,
        totalCost: 295,
        grossProfit: 376.16,
        paymentMethod: 'CARD',
        orderDate: dayjs().subtract(30, 'minutes').toDate(),
        dueDate: null,
        completedDate: null,
        status: 'PENDING',
        notes: 'Bulk purchase for wedding party',
        cancellationReason: '',
        createdAt: dayjs().subtract(30, 'minutes').toDate(),
        updatedAt: dayjs().subtract(30, 'minutes').toDate(),
    },
];

// ============================================
// STYLED COMPONENTS
// ============================================

// const StyledBadge = styled(Badge)(({theme}) => ({
//     '& .MuiBadge-badge': {
//         right: -3,
//         top: 13,
//         border: `2px solid ${theme.palette.background.paper}`,
//         padding: '0 4px',
//     },
// }));

const SearchInput = styled(OutlinedInput)(({theme}) => ({
    borderRadius: theme.shape.borderRadius * 2,
    '& fieldset': {
        borderColor: alpha(theme.palette.divider, 0.3),
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
}));

//
// // DataGrid Columns
// const columns = [
//
// ];


// ============================================
// MAIN ORDERS PAGE COMPONENT
// ============================================

const OrdersPage = () => {
    const theme = useTheme();

    // State
    const [orders, setOrders] = useState(DUMMY_ORDERS);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [tabValue, setTabValue] = useState(0);

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

    // Snackbar State
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchQuery(searchInput);
            console.log("Set: ", searchInput);
        }, 400); // 300–500ms sweet spot

        return () => clearTimeout(timeout);
    }, [searchInput]);


    // Filter orders based on search, tab, and filters
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Tab filter
        if (tabValue === 1) result = result.filter((order) => order.status === 'PENDING');
        if (tabValue === 2) result = result.filter((order) => order.status === 'IN_PROGRESS');
        if (tabValue === 3) result = result.filter((order) => order.status === 'COMPLETED');
        if (tabValue === 4) result = result.filter((order) => order.orderType === 'CUSTOM');

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (o) =>
                    o._id.toLowerCase().includes(query) ||
                    o.customer?.name?.toLowerCase().includes(query) ||
                    o.branchInfo.name.toLowerCase().includes(query) ||
                    o.items.some((item) => item.productName.toLowerCase().includes(query))
            );
        }

        // Status filter
        if (filters.status.length > 0) {
            result = result.filter((o) => filters.status.includes(o.status));
        }

        // Order type filter
        if (filters.orderType.length > 0) {
            result = result.filter((o) => filters.orderType.includes(o.orderType));
        }

        // Branch filter
        if (filters.branchId) {
            result = result.filter((o) => o.branchId === filters.branchId);
        }

        // Date range filter
        if (filters.dateRange.start) {
            result = result.filter((o) => dayjs(o.orderDate).isAfter(filters.dateRange.start));
        }
        if (filters.dateRange.end) {
            result = result.filter((o) => dayjs(o.orderDate).isBefore(filters.dateRange.end));
        }

        // Payment method filter
        if (filters.paymentMethod.length > 0) {
            result = result.filter((o) => filters.paymentMethod.includes(o.paymentMethod));
        }

        // Amount filter
        if (filters.minAmount) {
            result = result.filter((o) => o.totalAmount >= parseFloat(filters.minAmount));
        }
        if (filters.maxAmount) {
            result = result.filter((o) => o.totalAmount <= parseFloat(filters.maxAmount));
        }

        return result;
    }, [orders, searchQuery, tabValue, filters]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status.length > 0) count++;
        if (filters.orderType.length > 0) count++;
        if (filters.branchId) count++;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.paymentMethod.length > 0) count++;
        if (filters.minAmount || filters.maxAmount) count++;
        return count;
    }, [filters]);

    // Handlers
    const handleCreateOrder = (orderData) => {
        const newOrder = {
            ...orderData,
            _id: `ord_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setOrders((prev) => [newOrder, ...prev]);
        setSnackbar({open: true, message: 'Order created successfully!', severity: 'success'});
    };

    const handleUpdateOrder = (orderData) => {
        setOrders((prev) =>
            prev.map((o) =>
                o._id === editingOrder._id ? {...o, ...orderData, updatedAt: new Date()} : o
            )
        );
        setEditingOrder(null);
        setSnackbar({open: true, message: 'Order updated successfully!', severity: 'success'});
    };

    const handleStatusChange = (orderId, updates) => {
        setOrders((prev) =>
            prev.map((o) =>
                o._id === orderId ? {...o, ...updates, updatedAt: new Date()} : o
            )
        );
        setSnackbar({open: true, message: 'Order status updated!', severity: 'success'});
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
                setStatusDialogOpen(true);
                break;
            default:
                break;
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSnackbar({open: true, message: 'Orders refreshed!', severity: 'success'});
        }, 1000);
    };

    const handleExport = () => {
        setSnackbar({open: true, message: 'Export functionality coming soon!', severity: 'info'});
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

                {/* Stats Cards */}
                <OrderStats orders={orders}/>

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
                                    <Badge badgeContent={orders.length} color="primary" max={999}>
                                        All Orders
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
                                        badgeContent={orders.filter((o) => o.status === 'PENDING').length}
                                        color="warning"
                                    >
                                        Pending
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
                                        badgeContent={orders.filter((o) => o.status === 'IN_PROGRESS').length}
                                        color="info"
                                    >
                                        In Progress
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
                                        badgeContent={orders.filter((o) => o.status === 'COMPLETED').length}
                                        color="success"
                                    >
                                        Completed
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
                                        badgeContent={orders.filter((o) => o.orderType === 'CUSTOM').length}
                                        color="secondary"
                                    >
                                        Custom Orders
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

                            <Badge badgeContent={activeFilterCount}>
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
                                <Typography variant="h5" sx={{alignSelf: 'center'}}>
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
                                        label={`Branch: ${DUMMY_BRANCHES.find((b) => b._id === filters.branchId)?.name}`}
                                        onDelete={() => setFilters((prev) => ({...prev, branchId: ''}))}
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
                                <Button
                                    size="small"
                                    color={theme.palette.secondary.light}
                                    onClick={() =>
                                        setFilters({
                                            status: [],
                                            orderType: [],
                                            branchId: '',
                                            dateRange: {start: null, end: null},
                                            paymentMethod: [],
                                            minAmount: '',
                                            maxAmount: '',
                                        })
                                    }
                                >
                                    Clear All
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    {/* Loading indicator */}
                    {loading && <LinearProgress/>}

                </Paper>
                {/* DataGrid */}
                <Box sx={{height: 600, midWidth: 0}}>
                    <DataGrid
                        rows={filteredOrders}
                        columns={columns(handleQuickAction, setMenuAnchorEl, setMenuOrder)}
                        getRowId={(row) => row._id}
                        disableColumnResize={true}
                        disableColumnSorting={true}
                        disableColumnFilter={true}
                        disableColumnSelector={true}
                        disableColumnMenu={true}
                        pageSizeOptions={[10, 25, 50, 100]}
                        initialState={{
                            pagination: {paginationModel: {pageSize: 10}},
                            // sorting: { sortModel: [{ field: 'orderDate', sort: 'desc' }] },
                        }}
                        disableRowSelectionOnClick
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
                    products={DUMMY_PRODUCTS}
                    branches={DUMMY_BRANCHES}
                    users={DUMMY_USERS}
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
                        setSelectedOrder(null);
                    }}
                    order={selectedOrder}
                    onStatusChange={handleStatusChange}
                    users={DUMMY_USERS}
                />

                {/* Filter Drawer */}
                <FilterDrawer
                    open={filterDrawerOpen}
                    onClose={() => setFilterDrawerOpen(false)}
                    filters={filters}
                    onFilterChange={setFilters}
                    branches={DUMMY_BRANCHES}
                    users={DUMMY_USERS}
                />

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                >
                    <Alert
                        onClose={() => setSnackbar({...snackbar, open: false})}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{width: '100%'}}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default OrdersPage;
