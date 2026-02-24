import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import dayjs from 'dayjs';

// Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Components
import StatsCard from '../StatsCard';

// RTK Query
import { useGetStatsQuery } from '../../state/apis/api';

// Utils
import { formatCurrency } from './getFunctions';

const OrderStats = ({ variant = 'default' }) => {
    const payload = useMemo(() => ({
        todayStartUTC: dayjs().startOf('day').toISOString(),
        monthStartUTC: dayjs().startOf('month').toISOString(),
    }), []);

    const { data: orderStats, isLoading: isOrderStatsLoading } = useGetStatsQuery(payload, {
        pollingInterval: 900_000,
    });

    return (
        <Grid container spacing={2} sx={{mb: 3}}>
             <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="Today's Orders"
                    value={orderStats?.todayOrders ?? 0}
                    subtitle="Orders placed today"
                    icon={<ReceiptLongIcon sx={{ fontSize: 26 }} />}
                    color="#6366f1"
                    loading={isOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="Pending"
                    value={orderStats?.pendingOrders ?? 0}
                    subtitle="Awaiting action"
                    icon={<HourglassEmptyIcon sx={{ fontSize: 26 }} />}
                    color="#f59e0b"
                    loading={isOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="In Progress"
                    value={orderStats?.inProgressOrders ?? 0}
                    subtitle="Being processed"
                    icon={<PlayArrowIcon sx={{ fontSize: 26 }} />}
                    color="#3b82f6"
                    loading={isOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(orderStats?.revenue ?? 0)}
                    trend="up"
                    trendValue="+12.5%"
                    subtitle="vs last month"
                    icon={<AttachMoneyIcon sx={{ fontSize: 26 }} />}
                    color="#10b981"
                    loading={isOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
        </Grid>
    );
};

export default OrderStats;