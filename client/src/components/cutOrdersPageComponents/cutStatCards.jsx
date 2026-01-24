import React, {useMemo} from "react";
import {Avatar, Box, Card, CardContent, Grid, Stack, Typography, useTheme} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FactoryIcon from "@mui/icons-material/Factory";
import WarningIcon from "@mui/icons-material/Warning";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import dayjs from "dayjs";
import {useGetCutOrderStatsQuery} from "../../state/apis/api";

const CutStatsCards = () => {
    const theme = useTheme();


    const payload = useMemo(() => {
        return {
            todayStartUTC: dayjs().startOf("day").toISOString(),
            monthStartUTC: dayjs().startOf("month").toISOString(),
        };
    }, []);

    const {data: cutStats, isLoading: isCutStatsLoading, isFetching: isCutStatsFetching} = useGetCutOrderStatsQuery(payload, {pollingInterval: 900_000}) //Refetch after 15 min

    return (
        <>
            <Grid container spacing={3} sx={{mb: 3, alignItems: "stretch"}}>
                <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        Pending
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="warning.main">
                                        {!isCutStatsLoading ? cutStats.pendingOrders : "Loading..."}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: 'warning.main',
                                    color: theme.palette.grey[300]
                                }}>
                                    <ScheduleIcon sx={{fontSize: 35}}/>
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        In Cutting
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="info.main">
                                        {!isCutStatsLoading ? cutStats.cuttingOrders : "Loading..."}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: 'info.main',
                                    color: theme.palette.grey[300]
                                }}>
                                    <ContentCutIcon sx={{fontSize: 35}}/>
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        In Production
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="primary.main">
                                        {!isCutStatsLoading ? cutStats.inProductionOrders : "Loading..."}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: 'primary.main',
                                    color: theme.palette.grey[300]
                                }}>
                                    <FactoryIcon sx={{fontSize: 35}}/>
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, md: 3}} display="flex">
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                        flexGrow: 1
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        Overdue
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="error.main">
                                        {!isCutStatsLoading ? cutStats.overdueOrders : "Loading..."}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: 'error.main',
                                    color: theme.palette.grey[300]
                                }}>
                                    <WarningIcon sx={{fontSize: 35}}/>
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
};

export default CutStatsCards;