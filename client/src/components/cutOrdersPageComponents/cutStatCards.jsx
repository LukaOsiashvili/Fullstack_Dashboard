import React, {useMemo} from "react";
import {Avatar, Box, Card, CardContent, Grid, Stack, Typography, useTheme} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FactoryIcon from "@mui/icons-material/Factory";
import WarningIcon from "@mui/icons-material/Warning";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import {isOverdue} from "./utilityFunctions";

const CutStatsCards = ({cutOrders}) => {
    const theme = useTheme();

    const stats = useMemo(() => {
        const pending = cutOrders.filter(o => o.status === 'PENDING').length;
        const cutting = cutOrders.filter(o => o.status === 'CUTTING').length;
        const inProduction = cutOrders.filter(o => o.status === 'IN_PRODUCTION').length;
        const completed = cutOrders.filter(o => o.status === 'COMPLETED').length;
        const cancelled = cutOrders.filter(o => o.status === 'CANCELLED').length;
        const overdue = cutOrders.filter(o => isOverdue(o)).length;
        const urgent = cutOrders.filter(o => o.priority === 'URGENT' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        const total = cutOrders.length;

        return { pending, cutting, inProduction, completed, cancelled, overdue, urgent, total };
    }, [cutOrders]);


    return (
        <>
            <Grid container spacing={3} sx={{mb: 3}}>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        Pending
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="warning.main">
                                        {stats.pending}
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

                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        In Cutting
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="info.main">
                                        {stats.cutting}
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

                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        In Production
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="primary.main">
                                        {stats.inProduction}
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

                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme.palette.background.alt,
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={500}>
                                        Overdue
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} color="error.main">
                                        {stats.overdue}
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