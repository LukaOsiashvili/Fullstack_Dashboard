import React, { useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack,
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Button,
    Paper,
    IconButton,
    Tooltip,
    LinearProgress,
    alpha,
    useTheme,
} from '@mui/material';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

// Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import FactoryIcon from '@mui/icons-material/Factory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlagIcon from '@mui/icons-material/Flag';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CategoryIcon from '@mui/icons-material/Category';

// Components
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import ChartCard from '../../components/ChartCard';

// RTK Query Hooks
import {
    useGetStatsQuery,
    useGetCutOrderStatsQuery,
    useGetAllOrdersQuery,
    useGetAllCutOrdersQuery,
    useGetAllBranchesQuery,
    useGetProductsQuery,
    useGetAllMaterialsQuery,
} from '../../state/apis/api';

// Utils
import { formatCurrency } from '../../components/orderComponents/getFunctions';
import OrderStats from "../../components/orderComponents/orderStats";
import CutStatsCards from "../../components/cutOrdersPageComponents/cutStatCards";

dayjs.extend(relativeTime);

// ============================================
// CUSTOM CHART COLORS
// ============================================
const CHART_COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
};

// ============================================
// RECENT ORDERS LIST COMPONENT
// ============================================
const RecentOrdersList = ({ orders = [], loading }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { color: 'warning', bg: CHART_COLORS.warning },
            IN_PROGRESS: { color: 'info', bg: CHART_COLORS.info },
            COMPLETED: { color: 'success', bg: CHART_COLORS.success },
            CANCELLED: { color: 'error', bg: CHART_COLORS.error },
            RETURNED: { color: 'error', bg: CHART_COLORS.error },
        };
        return configs[status] || { color: 'default', bg: theme.palette.grey[500] };
    };

    const getOrderTypeIcon = (type) => {
        const icons = {
            SALE: <ShoppingCartIcon sx={{ fontSize: 18 }} />,
            CUSTOM: <BuildIcon sx={{ fontSize: 18 }} />,
            PRODUCTION: <FactoryIcon sx={{ fontSize: 18 }} />,
            RETURN: <AssignmentReturnIcon sx={{ fontSize: 18 }} />,
        };
        return icons[type] || <ReceiptLongIcon sx={{ fontSize: 18 }} />;
    };

    if (loading) {
        return (
            <Box>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Box key={i} sx={{ py: 1.5 }}>
                        <LinearProgress sx={{ borderRadius: 1 }} />
                    </Box>
                ))}
            </Box>
        );
    }

    if (orders.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    color: 'text.secondary',
                }}
            >
                <ReceiptLongIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No recent orders</Typography>
            </Box>
        );
    }

    return (
        <List disablePadding sx={{ mx: -1 }}>
            {orders.slice(0, 5).map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                    <ListItem
                        key={order._id}
                        sx={{
                            px: 1.5,
                            py: 1.5,
                            borderRadius: 1.5,
                            mb: 0.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            },
                        }}
                        onClick={() => navigate('/orders')}
                    >
                        <ListItemAvatar>
                            <Avatar
                                sx={{
                                    width: 42,
                                    height: 42,
                                    backgroundColor: alpha(statusConfig.bg, 0.12),
                                    color: statusConfig.bg,
                                }}
                            >
                                {getOrderTypeIcon(order.orderType)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            maxWidth: 150,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {order.items?.[0]?._id.slice(-6).toUpperCase() || 'Order'}
                                    </Typography>
                                    {order.items?.length > 1 && (
                                        <Chip
                                            size="small"
                                            label={`+${order.items.length}`}
                                            sx={{
                                                height: 18,
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                </Stack>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    {order.branchInfo?.name} • {dayjs(order.orderDate).fromNow()}
                                </Typography>
                            }
                        />
                        <Stack alignItems="flex-end" spacing={0.5}>
                            <Typography variant="body2" fontWeight={700} color={theme.palette.secondary.light}>
                                {formatCurrency(order.totalAmount)}
                            </Typography>
                            <Chip
                                size="small"
                                label={order.status.replace('_', ' ')}
                                color={statusConfig.color}
                                sx={{
                                    height: 20,
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                }}
                            />
                        </Stack>
                    </ListItem>
                );
            })}
        </List>
    );
};

// ============================================
// PRODUCTION PIPELINE COMPONENT
// ============================================
const ProductionPipeline = ({ cutOrders = [], loading }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { color: 'warning', bg: CHART_COLORS.warning, label: 'Pending' },
            CUTTING: { color: 'info', bg: CHART_COLORS.info, label: 'Cutting' },
            IN_PRODUCTION: { color: 'primary', bg: CHART_COLORS.purple, label: 'Production' },
        };
        return configs[status] || { color: 'default', bg: theme.palette.grey[500], label: status };
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            LOW: { color: 'default' },
            NORMAL: { color: 'primary' },
            HIGH: { color: 'warning' },
            URGENT: { color: 'error' },
        };
        return configs[priority] || { color: 'default' };
    };

    if (loading) {
        return (
            <Box>
                {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ py: 1.5 }}>
                        <LinearProgress sx={{ borderRadius: 1 }} />
                    </Box>
                ))}
            </Box>
        );
    }

    const activeOrders = cutOrders.filter(
        (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    );

    if (activeOrders.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <ContentCutIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No active production orders</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1}>
            {activeOrders.slice(0, 4).map((order) => {
                const isOverdue =
                    order.dueDate &&
                    dayjs().isAfter(dayjs(order.dueDate)) &&
                    !['COMPLETED', 'CANCELLED'].includes(order.status);
                const statusConfig = getStatusConfig(order.status);
                const priorityConfig = getPriorityConfig(order.priority);

                return (
                    <Paper
                        key={order._id}
                        variant="outlined"
                        onClick={() => navigate('/cutOrders')}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderRadius: 2,
                            borderColor: isOverdue
                                ? alpha(CHART_COLORS.error, 0.5)
                                : alpha(theme.palette.divider, 0.15),
                            backgroundColor: isOverdue
                                ? alpha(CHART_COLORS.error, 0.03)
                                : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: statusConfig.bg,
                                backgroundColor: alpha(statusConfig.bg, 0.04),
                            },
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box flex={1} minWidth={0}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {order.productName}
                                    </Typography>
                                    {order.priority === 'URGENT' && (
                                        <FlagIcon sx={{ fontSize: 14, color: CHART_COLORS.error }} />
                                    )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    {order.variantName} • {order.quantity} units
                                </Typography>
                            </Box>
                            <Stack alignItems="flex-end" spacing={0.5}>
                                <Chip
                                    size="small"
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
                                />
                                {isOverdue && (
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        color="error.main"
                                    >
                                        Overdue
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
};

// ============================================
// ALERT ITEM COMPONENT
// ============================================
const AlertItem = ({ icon, title, subtitle, color, actionLabel, onAction }) => {
    const theme = useTheme();

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                borderColor: alpha(color, 0.3),
                backgroundColor: alpha(color, 0.04),
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: color,
                    backgroundColor: alpha(color, 0.08),
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        backgroundColor: alpha(color, 0.15),
                        color: color,
                    }}
                >
                    {icon}
                </Avatar>
                <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={onAction}
                    sx={{
                        borderColor: alpha(color, 0.5),
                        color: color,
                        '&:hover': {
                            borderColor: color,
                            backgroundColor: alpha(color, 0.1),
                        },
                    }}
                >
                    {actionLabel}
                </Button>
            </Stack>
        </Paper>
    );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Stats payload
    const statsPayload = useMemo(() => ({
        todayStartUTC: dayjs().startOf('day').toISOString(),
        monthStartUTC: dayjs().startOf('month').toISOString(),
    }), []);

    // RTK Query Hooks
    const { data: orderStats, isLoading: isOrderStatsLoading, refetch: refetchOrderStats } = useGetStatsQuery(
        statsPayload,
        { pollingInterval: 900_000 }
    );

    const { data: cutOrderStats, isLoading: isCutOrderStatsLoading, refetch: refetchCutStats } = useGetCutOrderStatsQuery(
        statsPayload,
        { pollingInterval: 900_000 }
    );

    const { data: ordersData, isLoading: isOrdersLoading, refetch: refetchOrders } = useGetAllOrdersQuery({
        page: 1,
        size: 10,
        filters: {},
    });

    const { data: cutOrdersData, isLoading: isCutOrdersLoading, refetch: refetchCutOrders } = useGetAllCutOrdersQuery({
        page: 1,
        size: 10,
        filters: {},
    });

    const { data: branches, isLoading: isBranchesLoading } = useGetAllBranchesQuery();
    const { data: products, isLoading: isProductsLoading } = useGetProductsQuery();
    const { data: materials, isLoading: isMaterialsLoading } = useGetAllMaterialsQuery();

    // Refresh all data
    const handleRefresh = () => {
        refetchOrderStats();
        refetchCutStats();
        refetchOrders();
        refetchCutOrders();
    };

    // Chart Data - Orders by Status (Donut)
    const orderStatusChartData = useMemo(() => {
        if (!ordersData?.stats) return [];
        const { pending = 0, inProgress = 0, completed = 0 } = ordersData.stats;
        return [
            { id: 0, value: pending, label: 'Pending', color: CHART_COLORS.warning },
            { id: 1, value: inProgress, label: 'In Progress', color: CHART_COLORS.info },
            { id: 2, value: completed, label: 'Completed', color: CHART_COLORS.success },
        ].filter((d) => d.value > 0);
    }, [ordersData]);

    // Chart Data - Production Pipeline (Donut)
    const productionChartData = useMemo(() => {
        if (!cutOrderStats) return [];
        const { pendingOrders = 0, cuttingOrders = 0, inProductionOrders = 0 } = cutOrderStats;
        return [
            { id: 0, value: pendingOrders, label: 'Pending', color: CHART_COLORS.warning },
            { id: 1, value: cuttingOrders, label: 'Cutting', color: CHART_COLORS.info },
            { id: 2, value: inProductionOrders, label: 'Production', color: CHART_COLORS.purple },
        ].filter((d) => d.value > 0);
    }, [cutOrderStats]);

    // Chart Data - Products by Category
    // const productCategoryData = useMemo(() => {
    //     if (!products || products.length === 0)
    //         return { categories: [], counts: []};
    //
    //     const categoryCount = products.reduce((acc, product) => {
    //         acc[product.category] = (acc[product.category] || 0) + 1;
    //         return acc;
    //     }, {});
    //
    //     const sortedCategories = Object.entries(categoryCount)
    //         .sort((a, b) => b[1] - a[1])
    //         .slice(0, 6);
    //
    //     console.log(
    //         {categories: sortedCategories.map(([cat]) => cat),
    //         counts: sortedCategories.map(([, count]) => count)}
    //     )
    //
    //     return {
    //         categories: sortedCategories.map(([cat]) => cat),
    //         counts: sortedCategories.map(([, count]) => count),
    //     };
    // }, [products]);


    // Helper function - place at component level or in a utils file
    const abbreviateCategory = (name) => {
        if (!name) return '';
        if (name.length <= 5) return name;

        // Split by common separators
        const words = name.split(/[\s&\-_]+/);

        if (words.length > 1) {
            // Multiple words: take first letter of each (max 4)
            return words
                .filter(w => w.length > 0)
                .map(w => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 4);
        }

        // Single word: take first 4 characters
        return name.substring(0, 4).toUpperCase();
    };

// Inside Dashboard component
    const productCategoryChartData = useMemo(() => {
        if (!products || products.length === 0) {
            return { dataset: [] };
        }

        // Count products per category
        const categoryCount = products.reduce((acc, product) => {
            const cat = product.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        // Sort by count (descending) and take top 6
        const sortedCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        // Color palette for bars
        const colorPalette = [
            CHART_COLORS.primary,   // #6366f1
            CHART_COLORS.success,   // #10b981
            CHART_COLORS.warning,   // #f59e0b
            CHART_COLORS.info,      // #3b82f6
            CHART_COLORS.purple,    // #8b5cf6
            CHART_COLORS.pink,      // #ec4899
        ];

        // Build dataset with all needed properties
        const dataset = sortedCategories.map(([category, count], index) => ({
            fullName: category,
            abbrev: abbreviateCategory(category),
            count,
            color: colorPalette[index % colorPalette.length],
        }));

        return { dataset };
    }, [products]);

    // Unresolved issues count
    const unresolvedIssuesCount = useMemo(() => {
        if (!cutOrdersData?.data) return 0;
        return cutOrdersData.data.reduce(
            (count, cutOrder) => count + (cutOrder.issues?.filter((i) => !i.resolved)?.length || 0),
            0
        );
    }, [cutOrdersData]);

    // Quick stats data
    const quickStats = useMemo(() => [
        {
            label: 'Branches',
            value: branches?.length ?? 0,
            icon: <StoreIcon />,
            color: CHART_COLORS.info,
        },
        {
            label: 'Products',
            value: products?.length ?? 0,
            icon: <InventoryIcon />,
            color: CHART_COLORS.success,
        },
        {
            label: 'Materials',
            value: materials?.length ?? 0,
            icon: <CategoryIcon />,
            color: CHART_COLORS.warning,
        },
    ], [branches, products, materials]);

    return (
        <Box m="1.5rem 2.5rem">
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                mb={4}
            >
                <Header title="Dashboard" subtitle={"Welcome Back!"}/>
                <Tooltip title="Refresh all data">
                    <IconButton
                        onClick={handleRefresh}
                        sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                            },
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Stack>


            <OrderStats variant={"gradient"} />

            <CutStatsCards variant={"gradient"}/>

            {/* Charts Row */}
            <Grid container spacing={2} sx={{mb: 3}}>
                {/* Orders Distribution */}
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                    <ChartCard
                        title="Orders Distribution"
                        subtitle="By current status"
                        loading={isOrdersLoading}
                    >
                        {orderStatusChartData.length > 0 ? (
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart
                                    series={[
                                        {
                                            data: orderStatusChartData,
                                            innerRadius: 60,
                                            outerRadius: 100,
                                            paddingAngle: 3,
                                            cornerRadius: 6,
                                            cx: 150,
                                            cy: 120,
                                            highlightScope: { faded: 'global', highlighted: 'item' },
                                            faded: { innerRadius: 55, additionalRadius: -5, color: 'gray' },
                                        },
                                    ]}
                                    width={300}
                                    height={280}
                                    slotProps={{
                                        legend: {
                                            direction: 'row',
                                            position: { vertical: 'bottom', horizontal: 'middle' },
                                            padding: { top: 20 },
                                            itemMarkWidth: 10,
                                            itemMarkHeight: 10,
                                            markGap: 5,
                                            itemGap: 15,
                                            labelStyle: {
                                                fontSize: 12,
                                                fill: theme.palette.text.secondary,
                                            },
                                        },
                                    }}
                                    sx={{
                                        [`& .${pieArcLabelClasses.root}`]: {
                                            fill: '#fff',
                                            fontWeight: 600,
                                            fontSize: 12,
                                        },
                                    }}
                                />
                            </Box>
                        ) : (
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No data available</Typography>
                            </Box>
                        )}
                    </ChartCard>
                </Grid>

                {/* Production Pipeline */}
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                    <ChartCard
                        title="Production Pipeline"
                        subtitle="Cut orders by stage"
                        loading={isCutOrderStatsLoading}
                    >
                        {productionChartData.length > 0 ? (
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart
                                    series={[
                                        {
                                            data: productionChartData,
                                            innerRadius: 60,
                                            outerRadius: 100,
                                            paddingAngle: 3,
                                            cornerRadius: 6,
                                            cx: 150,
                                            cy: 120,
                                            highlightScope: { faded: 'global', highlighted: 'item' },
                                            faded: { innerRadius: 55, additionalRadius: -5, color: 'gray' },
                                        },
                                    ]}
                                    width={300}
                                    height={280}
                                    slotProps={{
                                        legend: {
                                            direction: 'row',
                                            position: { vertical: 'bottom', horizontal: 'middle' },
                                            padding: { top: 20 },
                                            itemMarkWidth: 10,
                                            itemMarkHeight: 10,
                                            markGap: 5,
                                            itemGap: 15,
                                            labelStyle: {
                                                fontSize: 12,
                                                fill: theme.palette.text.secondary,
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        ) : (
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No data available</Typography>
                            </Box>
                        )}
                    </ChartCard>
                </Grid>

                {/* Products by Category */}
                {/*<Grid size={{xs: 12, sm: 6, md: 4}}>*/}
                {/*    <ChartCard*/}
                {/*        title="Products by Category"*/}
                {/*        subtitle="Inventory distribution"*/}
                {/*        loading={isProductsLoading}*/}
                {/*        noPadding={true}*/}
                {/*    >*/}
                {/*        {productCategoryData.categories.length > 0 ? (*/}
                {/*            // <Box sx={{ height: 280 }}>*/}
                {/*                <BarChart*/}
                {/*                    dataset={productCategoryData.categories.map((cat, i) => ({*/}
                {/*                        category: cat,*/}
                {/*                        count: productCategoryData.counts[i],*/}
                {/*                    }))}*/}
                {/*                    yAxis={[*/}
                {/*                        {*/}
                {/*                            scaleType: 'band',*/}
                {/*                            dataKey: 'category',*/}
                {/*                            tickLabelStyle: {*/}
                {/*                                fontSize: 10,*/}
                {/*                                fill: theme.palette.secondary.light,*/}
                {/*                                textAnchor: 'extremities',*/}
                {/*                            },*/}
                {/*                        },*/}
                {/*                    ]}*/}
                {/*                    xAxis={[*/}
                {/*                        {*/}
                {/*                            tickLabelStyle: {*/}
                {/*                                fontSize: 11,*/}
                {/*                                fill: theme.palette.text.secondary,*/}
                {/*                            },*/}
                {/*                        },*/}
                {/*                    ]}*/}
                {/*                    series={[*/}
                {/*                        {*/}
                {/*                            data: productCategoryData.counts,*/}
                {/*                            color: CHART_COLORS.primary,*/}
                {/*                            barLabel: 'value',*/}
                {/*                        },*/}
                {/*                    ]}*/}
                {/*                    layout="horizontal"*/}
                {/*                    height={280}*/}
                {/*                    margin={{ left: -10,}}*/}
                {/*                    borderRadius={6}*/}

                {/*                />*/}
                {/*            // </Box>*/}
                {/*        ) : (*/}
                {/*            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>*/}
                {/*                <Typography color="text.secondary">No data available</Typography>*/}
                {/*            </Box>*/}
                {/*        )}*/}
                {/*    </ChartCard>*/}
                {/*</Grid>*/}

                {/* Products by Category - With Custom Legend */}
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                    <ChartCard
                        title="Products by Category"
                        subtitle="Inventory distribution"
                        loading={isProductsLoading}
                    >
                        {productCategoryChartData.dataset.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Chart Container */}
                                {/*<Box*/}
                                {/*    sx={{*/}
                                {/*        width: '100%',*/}
                                {/*        height: 200,*/}
                                {/*        display: 'flex',*/}
                                {/*        alignItems: 'center',*/}
                                {/*        justifyContent: 'center',*/}
                                {/*    }}*/}
                                {/*>*/}
                                    <BarChart
                                        dataset={productCategoryChartData.dataset}
                                        xAxis={[
                                            {
                                                scaleType: 'band',
                                                dataKey: 'abbrev',
                                                tickLabelStyle: {
                                                    fontSize: 11,
                                                    fill: theme.palette.text.secondary,
                                                    fontWeight: 600,
                                                },
                                            },
                                        ]}
                                        yAxis={[
                                            {
                                                tickLabelStyle: {
                                                    fontSize: 10,
                                                    fill: theme.palette.text.secondary,
                                                },
                                                tickMinStep: 1,
                                            },
                                        ]}
                                        series={[
                                            {
                                                dataKey: 'count',
                                                colorMap: {
                                                    type: 'ordinal',
                                                    colors: productCategoryChartData.dataset.map(d => d.color),
                                                },
                                                barLabel: 'value',
                                            },
                                        ]}
                                        width={300}
                                        height={200}
                                        margin={{ left: -10, }}
                                        slotProps={{
                                            bar: {
                                                rx: 5,
                                                ry: 5,
                                            },
                                            barLabel: {
                                                style: {
                                                    fill: '#ffffff',
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                },
                                            },
                                            legend: {
                                                hidden: true,
                                            },
                                        }}
                                        sx={{
                                            '& .MuiBarElement-root': {
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                filter: 'brightness(1)',
                                                '&:hover': {
                                                    filter: 'brightness(1.1)',
                                                    transform: 'scaleY(1.02)',
                                                },
                                            },
                                        }}
                                    />
                                {/*</Box>*/}

                                {/* Divider */}
                                <Divider sx={{ my: 1.5, opacity: 0.6 }} />

                                {/* Custom Legend */}
                                <Box sx={{ px: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'block',
                                            mb: 1,
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            fontSize: '0.65rem',
                                        }}
                                    >
                                        Categories
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        gap={0.75}
                                    >
                                        {productCategoryChartData.dataset.map((item) => (
                                            <Tooltip
                                                key={item.fullName}
                                                title={`${item.fullName}: ${item.count} products`}
                                                arrow
                                                placement="top"
                                            >
                                                <Chip
                                                    size="small"
                                                    label={
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: item.color,
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontSize: '0.68rem',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                <strong>{item.abbrev}</strong>
                                                                <span style={{ opacity: 0.7 }}> = </span>
                                                                {item.fullName.length > 12
                                                                    ? item.fullName.substring(0, 11) + '…'
                                                                    : item.fullName
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                    sx={{
                                                        height: 24,
                                                        backgroundColor: alpha(item.color, 0.08),
                                                        borderColor: alpha(item.color, 0.25),
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: alpha(item.color, 0.15),
                                                            borderColor: item.color,
                                                            transform: 'translateY(-1px)',
                                                        },
                                                        '& .MuiChip-label': {
                                                            px: 1,
                                                        },
                                                    }}
                                                    variant="outlined"
                                                />
                                            </Tooltip>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    height: 280,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography color="text.secondary">No product data available</Typography>
                            </Box>
                        )}
                    </ChartCard>
                </Grid>
            </Grid>

            {/* Lists & Alerts Row */}
            <Grid container spacing={2} mb={3}>
                {/* Recent Orders */}
                <Grid size={{xs: 12, sm: 6, md: 6}}>
                    <ChartCard
                        title="Recent Orders"
                        subtitle="Latest transactions"
                        loading={isOrdersLoading}
                        action={
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                onClick={() => navigate('/orders')}
                                sx={{
                                    textTransform: 'none',
                                    color: theme.palette.secondary.light,
                                    fontWeight: 500,
                                }}
                            >
                                View All
                            </Button>
                        }
                    >
                        <RecentOrdersList orders={ordersData?.data} loading={isOrdersLoading} />
                    </ChartCard>
                </Grid>

                {/* Active Production */}
                <Grid size={{xs: 12, sm: 6, md: 6}}>
                    <ChartCard
                        title="Active Production"
                        subtitle="Cut orders in progress"
                        loading={isCutOrdersLoading}
                        action={
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                onClick={() => navigate('/cut-orders')}
                                sx={{
                                    textTransform: 'none',
                                    color: theme.palette.secondary.light,
                                    fontWeight: 500,
                                }}
                            >
                                View All
                            </Button>
                        }
                    >
                        <ProductionPipeline cutOrders={cutOrdersData?.data} loading={isCutOrdersLoading} />
                    </ChartCard>
                </Grid>
            </Grid>

            {/* Bottom Row - Quick Stats & Alerts */}
            <Grid container spacing={2}>
                {/* Quick Stats */}
                <Grid size={{xs: 12, sm: 6, md: 5}}>
                    <ChartCard
                        title="Quick Overview"
                        subtitle="System statistics"
                        loading={isBranchesLoading || isProductsLoading || isMaterialsLoading}
                    >
                        <Stack direction="row" spacing={2}>
                            {quickStats.map((stat) => (
                                <Paper
                                    key={stat.label}
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        p: 2.5,
                                        textAlign: 'center',
                                        borderRadius: 2,
                                        borderColor: alpha(stat.color, 0.2),
                                        backgroundColor: alpha(stat.color, 0.04),
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: stat.color,
                                            backgroundColor: alpha(stat.color, 0.08),
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: stat.color,
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </ChartCard>
                </Grid>

                {/* Alerts & Notifications */}
                <Grid size={{xs: 12, sm: 6, md: 7}}>
                    <ChartCard title="Alerts & Notifications" subtitle="Items requiring attention">
                        <Stack spacing={1.5}>
                            {(cutOrderStats?.overdueOrders ?? 0) > 0 && (
                                <AlertItem
                                    icon={<WarningAmberIcon />}
                                    title="Overdue Cut Orders"
                                    subtitle={`${cutOrderStats.overdueOrders} orders are past their due date`}
                                    color={CHART_COLORS.error}
                                    actionLabel="View"
                                    onAction={() => navigate('/cutOrders')}
                                />
                            )}

                            {unresolvedIssuesCount > 0 && (
                                <AlertItem
                                    icon={<ReportProblemIcon />}
                                    title="Unresolved Issues"
                                    subtitle={`${unresolvedIssuesCount} production issues need attention`}
                                    color={CHART_COLORS.warning}
                                    actionLabel="View"
                                    onAction={() => navigate('/cutOrders')}
                                />
                            )}

                            {(orderStats?.pendingOrders ?? 0) > 5 && (
                                <AlertItem
                                    icon={<HourglassEmptyIcon />}
                                    title="High Pending Orders"
                                    subtitle={`${orderStats.pendingOrders} orders awaiting processing`}
                                    color={CHART_COLORS.info}
                                    actionLabel="View"
                                    onAction={() => navigate('/orders')}
                                />
                            )}

                            {/* All Clear State */}
                            {(cutOrderStats?.overdueOrders ?? 0) === 0 &&
                                unresolvedIssuesCount === 0 &&
                                (orderStats?.pendingOrders ?? 0) <= 5 && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            borderColor: alpha(CHART_COLORS.success, 0.3),
                                            backgroundColor: alpha(CHART_COLORS.success, 0.04),
                                        }}
                                    >
                                        <CheckCircleIcon
                                            sx={{
                                                fontSize: 48,
                                                color: CHART_COLORS.success,
                                                mb: 1,
                                            }}
                                        />
                                        <Typography variant="h6" fontWeight={600} color={CHART_COLORS.success}>
                                            All Systems Operational
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            No urgent issues or critical alerts
                                        </Typography>
                                    </Paper>
                                )}
                        </Stack>
                    </ChartCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;