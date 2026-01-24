import React from 'react';
import {Avatar, Box, Card, CardContent, Grid, Stack, styled, Typography, useTheme} from "@mui/material";
import dayjs from 'dayjs';
import {formatCurrency} from "./getFunctions"

// Icons
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import relativeTime from "dayjs/plugin/relativeTime";

// RTK Query Endpoint
import {useGetStatsQuery} from "../../state/apis/api";

dayjs.extend(relativeTime);

const StatsCard = styled(Card)((
    // {theme, color = 'primary'}
) => ({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
}));

const OrderStats = () => {

    const theme = useTheme();

    const payload = {
        todayStartUTC: dayjs().startOf("day").toISOString(),
        monthStartUTC: dayjs().startOf("month").toISOString(),
    };

    const {
        data: stats,
        isLoading: isStatsLoading,
        isFetching: isStatsFetching
    } = useGetStatsQuery(payload, {pollingInterval: 900_000}) //Refetch after 15 min

    return (
        <Grid container spacing={2} sx={{mb: 3, alignItems: "stretch"}}>
            <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                <StatsCard color="primary">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Today's Orders
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700}
                                            sx={{mt: 1}}>
                                    {!isStatsLoading ? stats.todayOrders : "Loading..."}
                                </Typography>
                                <Typography variant="h6" color={theme.palette.grey[400]} sx={{mt: 0.5}}>
                                    Orders are issued
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.grey[300],
                            }}>
                                <ReceiptLongIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                <StatsCard color="warning">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Pending
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700}
                                            sx={{mt: 1}}>
                                    {!isStatsLoading ? stats.pendingOrders : "Loading..."}
                                </Typography>
                                <Typography variant="h6" color={theme.palette.grey[400]} sx={{mt: 0.5}}>
                                    Awaiting action
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                backgroundColor: 'warning.main',
                                color: theme.palette.grey[300],
                            }}>
                                <HourglassEmptyIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                <StatsCard color="info">
                    <CardContent sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    In Progress
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700}
                                            sx={{mt: 1}}>
                                    {!isStatsLoading ? stats.inProgressOrders : "Loading..."}
                                </Typography>
                                <Typography variant="h6" color={theme.palette.grey[400]} sx={{mt: 0.5}}>
                                    Being processed
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                width: "60px",
                                height: "60px",
                                backgroundColor: 'info.main',
                                color: theme.palette.grey[300],
                            }}>
                                <PlayArrowIcon sx={{fontSize: 35}}/>
                            </Avatar>
                        </Stack>
                    </CardContent>
                </StatsCard>
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                <StatsCard color="success">
                    <CardContent
                        sx={{
                            backgroundColor: theme.palette.background.alt,
                            flexGrow: 1
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    Month Revenue
                                </Typography>
                                <Typography variant="h2" color={theme.palette.secondary.light} fontWeight={700}
                                            sx={{mt: 1}}>
                                    {formatCurrency(stats?.revenue)}
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
                                backgroundColor: 'success.main',
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