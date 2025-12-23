import React, {useMemo} from 'react';
import {Avatar, Box, Card, CardContent, Grid, Stack, styled, Typography, useTheme} from "@mui/material";
import dayjs from 'dayjs';
import {formatCurrency} from "./getFunctions"

// Icons
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);

const StatsCard = styled(Card)((
    // {theme, color = 'primary'}
) => ({
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
}));
// Stats Summary Cards
const OrderStats = ({orders}) => {

    const theme = useTheme();

    const stats = useMemo(() => {
        const today = dayjs().startOf('day');
        const todayOrders = orders.filter((o) => dayjs(o.orderDate).isAfter(today));
        const pendingOrders = orders.filter((o) => o.status === 'PENDING');
        const inProgressOrders = orders.filter((o) => o.status === 'IN_PROGRESS');

        const totalRevenue = orders
            .filter((o) => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const totalProfit = orders
            .filter((o) => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + o.grossProfit, 0);

        return {
            todayCount: todayOrders.length,
            todayRevenue: todayOrders.reduce((sum, o) => sum + Math.max(0, o.totalAmount), 0),
            pendingCount: pendingOrders.length,
            inProgressCount: inProgressOrders.length,
            totalRevenue,
            totalProfit,
        };
    }, [orders]);

    return (
        <Grid container spacing={2} sx={{mb: 3}}>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard color="primary">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Today's Orders
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700} sx={{mt: 1}}>
                                    {stats.todayCount}
                                </Typography>
                                <Typography variant="h6" sx={{mt: 0.5}}>
                                    {formatCurrency(stats.todayRevenue)} revenue
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                bgcolor: theme.palette.primary.light,
                                color: theme.palette.grey[300],
                            }}>
                                <ReceiptLongIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard color="warning">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Pending
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700} sx={{mt: 1}}>
                                    {stats.pendingCount}
                                </Typography>
                                <Typography variant="h6" sx={{mt: 0.5}}>
                                    Awaiting action
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                bgcolor: 'warning.main',
                                color: theme.palette.grey[300],
                            }}>
                                <HourglassEmptyIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard color="info">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    In Progress
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700} sx={{mt: 1}}>
                                    {stats.inProgressCount}
                                </Typography>
                                <Typography variant="h6" sx={{mt: 0.5}}>
                                    Being processed
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                bgcolor: 'info.main',
                                color: theme.palette.grey[300],
                            }}>
                                <PlayArrowIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard color="success">
                    <CardContent
                        sx={{
                            backgroundColor: theme.palette.background.alt
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Total Profit
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700} sx={{mt: 1}}>
                                    {formatCurrency(stats.totalProfit)}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{mt: 0.5}}>
                                    <TrendingUpIcon sx={{fontSize: 'h6', color: 'success.main'}}/>
                                    <Typography variant="h6" color="success.main">
                                        +12.5%
                                    </Typography>
                                </Stack>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                bgcolor: 'success.main',
                                color: theme.palette.grey[300],
                            }}>
                                <TrendingUpIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
        </Grid>
    );
};

export default OrderStats;