import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import dayjs from 'dayjs';

// Icons
import ScheduleIcon from '@mui/icons-material/Schedule';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import FactoryIcon from '@mui/icons-material/Factory';
import WarningIcon from '@mui/icons-material/Warning';

// Components
import StatsCard from '../StatsCard';

// RTK Query
import { useGetCutOrderStatsQuery } from '../../state/apis/api';

const CutStatsCards = ({ variant = 'default' }) => {
    const payload = useMemo(() => ({
        todayStartUTC: dayjs().startOf('day').toISOString(),
        monthStartUTC: dayjs().startOf('month').toISOString(),
    }), []);

    const { data: cutOrderStats, isLoading: isCutOrderStatsLoading } = useGetCutOrderStatsQuery(payload, {
        pollingInterval: 900_000,
    });

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="Pending"
                    value={cutOrderStats?.pendingOrders ?? 0}
                    subtitle="Waiting to start"
                    icon={<ScheduleIcon sx={{ fontSize: 26 }} />}
                    color="#f59e0b"
                    loading={isCutOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="In Cutting"
                    value={cutOrderStats?.cuttingOrders ?? 0}
                    subtitle="Currently cutting"
                    icon={<ContentCutIcon sx={{ fontSize: 26 }} />}
                    color="#3b82f6"
                    loading={isCutOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="In Production"
                    value={cutOrderStats?.inProductionOrders ?? 0}
                    subtitle="Being assembled"
                    icon={<FactoryIcon sx={{ fontSize: 26 }} />}
                    color="#8b5cf6"
                    loading={isCutOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatsCard
                    title="Overdue"
                    value={cutOrderStats?.overdueOrders ?? 0}
                    subtitle="Past due date"
                    icon={<WarningIcon sx={{ fontSize: 26 }} />}
                    color="#ef4444"
                    loading={isCutOrderStatsLoading}
                    variant={variant}
                />
            </Grid>
        </Grid>
    );
};

export default CutStatsCards;