import React from 'react';
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
    Grid,
    Divider,
    Collapse,
    Avatar,
    Tooltip,
    Badge,
    Alert,
    Stack,
    Stepper,
    Step,
    StepLabel,
    useTheme,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    ContentCut as CutIcon,
    Factory as FactoryIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    MoreVert as MoreVertIcon,
    PlayArrow as PlayArrowIcon,
    Flag as FlagIcon,
    ReportProblem as ReportProblemIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Category as CategoryIcon,
    Group,
} from '@mui/icons-material';

import {
    formatCurrency,
    formatDate,
    isOverdue,
    formatDateTime,
    getDaysUntilDue,
} from './utilityFunctions';
import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    STATUS_STEPS,
} from './dummyData';

const OrderRow = ({
                      orderData,
                      isExpanded,
                      onExpandRow,
                      onViewOrder,
                      onMenuOpen,
                      onStatusChange,
                      onOpenEditDialog,
                      onOpenAssignCuttingDialog,
                      onOpenAssignProductionDialog,
                      onOpenIssueDialog,
                  }) => {
    const theme = useTheme();

    const overdue = isOverdue(orderData);
    const daysUntilDue = getDaysUntilDue(orderData.dueDate);
    const statusConfig = STATUS_CONFIG[orderData.status];
    const priorityConfig = PRIORITY_CONFIG[orderData.priority];
    const currentStep = STATUS_STEPS.indexOf(orderData.status);
    const hasUnresolvedIssues = orderData.issues.some(i => !i.resolved);

    return (
        <>
            <TableRow
                sx={{
                    /* ---------------- BASE ROW BACKGROUND ---------------- */
                    backgroundColor: theme.palette.primary[400], // #4D547D

                    /* ---------------- OVERDUE OVERLAY ---------------- */
                    ...(overdue && {
                        backgroundImage: `linear-gradient(
                        ${alpha(theme.palette.error.main, 0.035)},
                        ${alpha(theme.palette.error.main, 0.035)}
                    )`,
                    }),

                    /* ---------------- HOVER ---------------- */
                    '&:hover': {
                        backgroundImage: overdue
                            ? `linear-gradient(
                                ${alpha(theme.palette.error.main, 0.065)},
                                ${alpha(theme.palette.error.main, 0.065)}
                            )`
                            : 'none',
                        backgroundColor: alpha(theme.palette.primary[400], 0.95),
                    },

                    /* ---------------- CELLS ---------------- */
                    '& > *': {
                        borderBottom: 'none',
                        py: 1,
                        backgroundColor: 'transparent', // important
                    },

                    /* ---------------- REMOVE FOCUS OUTLINE ---------------- */
                    '& td:focus-visible': {
                        outline: 'none',
                    },

                }}
            >
                {/*DROPDOWN OPEN*/}
                <TableCell>
                    <IconButton size="small" onClick={() => onExpandRow(orderData._id)}>
                        {isExpanded ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>

                {/*PRODUCT NAME*/}
                <TableCell>
                    <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                            {orderData.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {orderData.variantName}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" color="text.disabled">
                                ID: {orderData._id}
                            </Typography>
                            {orderData.relatedOrderId && (
                                <Chip
                                    size="small"
                                    label="Linked Order"
                                    variant="outlined"
                                    sx={{height: 18, fontSize: '0.65rem'}}
                                />
                            )}
                        </Stack>
                    </Stack>
                </TableCell>

                {/*CATEGORY CHIP*/}
                <TableCell>
                    <Chip
                        size="small"
                        label={orderData.category}
                        color="info"
                        variant="outlined"
                        icon={<CategoryIcon sx={{fontSize: 14}}/>}
                        sx={{px: 0.5}}
                    />
                </TableCell>

                {/*QUANTITY*/}
                <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                        {orderData.quantity}
                    </Typography>
                </TableCell>

                {/*STATUS CHIP*/}
                <TableCell>
                    <Chip
                        size="small"
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        variant="filled"
                        sx={{px: 0.5}}
                    />
                </TableCell>

                {/*PRIORITY CHIP*/}
                <TableCell>
                    <Chip
                        size="small"
                        label={priorityConfig.label}
                        color={priorityConfig.color}
                        variant={orderData.priority === 'URGENT' ? 'filled' : 'outlined'}
                        icon={orderData.priority === 'URGENT' ? <FlagIcon/> : undefined}
                    />
                </TableCell>

                {/*DUE DATE*/}
                <TableCell>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">
                            {formatDate(orderData.dueDate)}
                        </Typography>
                        {orderData.dueDate && orderData.status !== 'COMPLETED' && orderData.status !== 'CANCELLED' && (
                            <Typography
                                variant="caption"
                                color={overdue ? 'error.main' : daysUntilDue <= 3 ? 'warning.main' : 'text.secondary'}
                                fontWeight={overdue || daysUntilDue <= 3 ? 600 : 400}
                            >
                                {overdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                            </Typography>
                        )}
                    </Stack>
                </TableCell>

                {/*CUTTING BY*/}
                <TableCell>
                    {orderData.assignedToCutting ? (
                        <Tooltip title={`Assigned: ${formatDate(orderData.assignedToCutting.assignedDate)}`}>
                            <Chip
                                size="small"
                                avatar={
                                    <Avatar sx={{width: 20, height: 20, backgroundColor: "info.dark"}}>
                                        {orderData.assignedToCutting.firstName[0]}
                                    </Avatar>
                                }
                                color="info"
                                label={`${orderData.assignedToCutting.firstName} ${orderData.assignedToCutting.lastName[0]}.`}
                                variant="outlined"
                            />
                        </Tooltip>
                    ) : (
                        <Typography variant="caption" color="text.disabled">Unassigned</Typography>
                    )}
                </TableCell>

                {/*PRODUCTION GROUP*/}
                <TableCell>
                    {orderData.assignedToProduction ? (
                        <Tooltip title={`Assigned: ${formatDate(orderData.assignedToProduction.assignedDate)}`}>
                            <Chip
                                size="small"
                                icon={<Group sx={{fontSize: 14}}/>}
                                label={orderData.assignedToProduction.group}
                                variant="outlined"
                                color="info"
                                sx={{px: 0.5}}
                            />
                        </Tooltip>
                    ) : (
                        <Typography variant="caption" color="text.disabled.">Unassigned</Typography>
                    )}
                </TableCell>

                {/*REVENUE*/}
                <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(orderData.estimatedMaterialCost)}
                    </Typography>
                </TableCell>

                {/*QUICK ACTION BUTTONS*/}
                <TableCell>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                        {hasUnresolvedIssues && (
                            <Tooltip title="Has unresolved issues">
                                <IconButton size="small" color="error">
                                    <Badge badgeContent={orderData.issues.filter(i => !i.resolved).length}
                                           color="error">
                                        <ReportProblemIcon fontSize="small"/>
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="View Details">
                            <IconButton
                                size="small"
                                onClick={() => onViewOrder(orderData)}
                            >
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            size="small"
                            onClick={(e) => onMenuOpen(e, orderData)}
                        >
                            <MoreVertIcon fontSize="small"/>
                        </IconButton>
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Expanded Row Content */}
            <TableRow>
                <TableCell
                    sx={{paddingBottom: 0, paddingTop: 0, backgroundColor: alpha(theme.palette.primary[600], 0.8)}}
                    colSpan={12}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{py: 3, px: 2}}>
                            <Grid container spacing={3}>
                                {/* Progress Stepper */}
                                <Grid size={12}>
                                    <Typography variant="h5" gutterBottom sx={{color: theme.palette.secondary.light}}>
                                        Production Progress
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                    <Stepper activeStep={currentStep} alternativeLabel>
                                        {STATUS_STEPS.map((step, index) => (
                                            <Step key={step}
                                                  completed={currentStep > index || orderData.status === 'COMPLETED'}>
                                                <StepLabel
                                                    slotProps={{
                                                        stepIcon: {
                                                            sx: orderData.status === 'CANCELLED' ? {color: 'error.main'} : {}
                                                        }
                                                    }}
                                                >
                                                    {STATUS_CONFIG[step].label}
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                    {orderData.status === 'CANCELLED' && (
                                        <Alert severity="error" sx={{mt: 2}}>
                                            This order has been cancelled
                                        </Alert>
                                    )}
                                </Grid>

                                {/* Assignments Summary */}
                                <Grid size={12}>
                                    <Paper variant="outlined"
                                           sx={{p: 2, bgcolor: alpha(theme.palette.info.main, 0.02)}}>
                                        <Typography variant="subtitle1" gutterBottom
                                                    color={theme.palette.secondary[200]}>
                                            Assignments
                                        </Typography>
                                        <Divider sx={{mb: 2}}/>
                                        <Grid container spacing={2}>
                                            <Grid size={{xs: 12, md: 6}}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{bgcolor: 'info.main'}}>
                                                        <CutIcon/>
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Cutting Assigned To
                                                        </Typography>
                                                        {orderData.assignedToCutting ? (
                                                            <>
                                                                <Typography variant="body2" fontWeight={600}
                                                                            fontSize={14}
                                                                            color={theme.palette.secondary[200]}>
                                                                    {orderData.assignedToCutting.firstName} {orderData.assignedToCutting.lastName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Assigned
                                                                    on {formatDate(orderData.assignedToCutting.assignedDate)}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Typography variant="body2" color="text.disabled">
                                                                Not yet assigned
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid size={{xs: 12, md: 6}}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{bgcolor: 'primary.main'}}>
                                                        <Group/>
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Production Group
                                                        </Typography>
                                                        {orderData.assignedToProduction ? (
                                                            <>
                                                                <Typography variant="body2" fontWeight={600}
                                                                            fontSize={14}
                                                                            color={theme.palette.secondary[200]}>
                                                                    {orderData.assignedToProduction.group}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Assigned
                                                                    on {formatDate(orderData.assignedToProduction.assignedDate)}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Typography variant="body2" color="text.disabled">
                                                                Not yet assigned
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Materials Required */}
                                <Grid size={{xs: 12, md: 6}}>
                                    <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary[200]}>
                                        Materials Required
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined"
                                                    sx={{backgroundColor: theme.palette.background.alt}}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{
                                                        color: theme.palette.secondary[200],
                                                        fontWeight: 600
                                                    }}>Material</TableCell>
                                                    <TableCell sx={{
                                                        color: theme.palette.secondary[200],
                                                        fontWeight: 600
                                                    }}>Variant</TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: theme.palette.secondary[200],
                                                        fontWeight: 600
                                                    }}>Qty Needed</TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: theme.palette.secondary[200],
                                                        fontWeight: 600
                                                    }}>Lists</TableCell>
                                                    <TableCell align="center" sx={{
                                                        color: theme.palette.secondary[200],
                                                        fontWeight: 600
                                                    }}>Reserved</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {orderData.materialsRequired.map((mat, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{mat.materialName}</TableCell>
                                                        <TableCell>{mat.variantName}</TableCell>
                                                        <TableCell align="right">{mat.quantityNeeded}</TableCell>
                                                        <TableCell align="right">{mat.listsNeeded || '-'}</TableCell>
                                                        <TableCell align="center">
                                                            {mat.reserved ? (
                                                                <CheckCircleIcon color="success" fontSize="small"/>
                                                            ) : (
                                                                <CancelIcon color="disabled" fontSize="small"/>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                                {/* Materials Used */}
                                <Grid size={{xs: 12, md: 6}}>
                                    <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary[200]}>
                                        Materials Used
                                    </Typography>
                                    {orderData.materialsUsed.length > 0 ? (
                                        <TableContainer component={Paper} variant="outlined"
                                                        sx={{backgroundColor: theme.palette.background.alt}}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell
                                                            sx={{color: theme.palette.secondary[200], fontWeight: 600}}>Material
                                                            ID</TableCell>
                                                        <TableCell align="right" sx={{
                                                            color: theme.palette.secondary[200],
                                                            fontWeight: 600
                                                        }}>Qty Used</TableCell>
                                                        <TableCell align="right" sx={{
                                                            color: theme.palette.secondary[200],
                                                            fontWeight: 600
                                                        }}>Lists</TableCell>
                                                        <TableCell align="right" sx={{
                                                            color: theme.palette.secondary[200],
                                                            fontWeight: 600
                                                        }}>Wastage</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {orderData.materialsUsed.map((mat, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{mat.materialId}</TableCell>
                                                            <TableCell align="right">{mat.quantityUsed}</TableCell>
                                                            <TableCell align="right">{mat.listsUsed || '-'}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography
                                                                    variant="body2"
                                                                    color={mat.wastage > 0 ? 'error.main' : 'success.main'}
                                                                >
                                                                    {mat.wastage}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Paper variant="outlined" sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            backgroundColor: theme.palette.background.alt
                                        }}>
                                            <Typography color="text.secondary" variant="body2">
                                                No materials used yet
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>

                                {/* Timeline & Dates */}
                                <Grid size={{xs: 12, md: 6}}>
                                    <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary[200]}>
                                        Timeline
                                    </Typography>
                                    <Paper variant="outlined"
                                           sx={{p: 2, backgroundColor: theme.palette.background.alt}}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Created:</Typography>
                                                <Typography
                                                    variant="body2">{formatDateTime(orderData.addedDate)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Due
                                                    Date:</Typography>
                                                <Typography variant="body2" color={overdue ? 'error.main' : 'inherit'}>
                                                    {formatDate(orderData.dueDate)}
                                                </Typography>
                                            </Stack>
                                            <Divider/>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Cutting
                                                    Started:</Typography>
                                                <Typography
                                                    variant="body2">{formatDateTime(orderData.cuttingStartedDate)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Cutting
                                                    Completed:</Typography>
                                                <Typography
                                                    variant="body2">{formatDateTime(orderData.cuttingCompletedDate)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Production
                                                    Started:</Typography>
                                                <Typography
                                                    variant="body2">{formatDateTime(orderData.productionStartedDate)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2"
                                                            color="text.secondary">Completed:</Typography>
                                                <Typography variant="body2" color="success.main">
                                                    {formatDateTime(orderData.completedDate)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Cost Summary */}
                                <Grid size={{xs: 12, md: 6}}>
                                    <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary[200]}>
                                        Cost Summary
                                    </Typography>
                                    <Paper variant="outlined"
                                           sx={{p: 2, backgroundColor: theme.palette.background.alt}}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Estimated
                                                    Cost:</Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {formatCurrency(orderData.estimatedMaterialCost)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Actual
                                                    Cost:</Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {formatCurrency(orderData.actualMaterialCost)}
                                                </Typography>
                                            </Stack>
                                            {orderData.actualMaterialCost > 0 && (
                                                <>
                                                    <Divider/>
                                                    <Stack direction="row" justifyContent="space-between"
                                                           alignItems="center">
                                                        <Typography variant="body2"
                                                                    color="text.secondary">Variance:</Typography>
                                                        <Chip
                                                            size="small"
                                                            label={formatCurrency(orderData.actualMaterialCost - orderData.estimatedMaterialCost)}
                                                            color={orderData.actualMaterialCost > orderData.estimatedMaterialCost ? 'error' : 'success'}
                                                            icon={orderData.actualMaterialCost > orderData.estimatedMaterialCost ?
                                                                <TrendingUpIcon/> : <TrendingDownIcon/>}
                                                        />
                                                    </Stack>
                                                </>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Notes & Instructions */}
                                {(orderData.instructions || orderData.notes) && (
                                    <Grid size={12}>
                                        <Grid container spacing={2}>
                                            {orderData.instructions && (
                                                <Grid size={{xs: 12, md: 6}}>
                                                    <Typography variant="subtitle2" gutterBottom
                                                                color={theme.palette.secondary[200]}>
                                                        Instructions
                                                    </Typography>
                                                    <Paper variant="outlined"
                                                           sx={{p: 2, bgcolor: alpha(theme.palette.info.main, 0.05)}}>
                                                        <Typography
                                                            variant="body2">{orderData.instructions}</Typography>
                                                    </Paper>
                                                </Grid>
                                            )}
                                            {orderData.notes && (
                                                <Grid size={{xs: 12, md: 6}}>
                                                    <Typography variant="subtitle2" gutterBottom
                                                                color={theme.palette.secondary[200]}>
                                                        Notes
                                                    </Typography>
                                                    <Paper variant="outlined" sx={{
                                                        p: 2,
                                                        bgcolor: alpha(theme.palette.warning.main, 0.05)
                                                    }}>
                                                        <Typography variant="body2">{orderData.notes}</Typography>
                                                    </Paper>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Issues */}
                                {orderData.issues.length > 0 && (
                                    <Grid size={12}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    color={theme.palette.secondary[200]}>
                                            Issues ({orderData.issues.filter(i => !i.resolved).length} unresolved)
                                        </Typography>
                                        <Stack spacing={1}>
                                            {orderData.issues.map((issue, idx) => (
                                                <Alert
                                                    key={idx}
                                                    severity={issue.resolved ? 'success' : 'warning'}
                                                    action={
                                                        !issue.resolved && (
                                                            <Button color="inherit" size="small">
                                                                Resolve
                                                            </Button>
                                                        )
                                                    }
                                                >
                                                    <Stack>
                                                        <Typography variant="body2">{issue.description}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Reported
                                                            by {issue.reportedBy.name} on {formatDate(issue.reportedDate)}
                                                        </Typography>
                                                    </Stack>
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Grid>
                                )}

                                {/* Quick Actions */}
                                <Grid size={12}>
                                    <Divider sx={{my: 1}}/>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditIcon sx={{color: theme.palette.secondary.light}}/>}
                                            onClick={() => onOpenEditDialog(orderData)}
                                            sx={{borderColor: theme.palette.primary[300]}}
                                            disabled={orderData.status === 'COMPLETED' || orderData.status === 'CANCELLED'}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                color={theme.palette.secondary.light}
                                                textTransform="none"
                                            >
                                                Edit Order
                                            </Typography>
                                        </Button>
                                        {(orderData.status === 'PENDING'
                                            // || orderData.status === 'CUTTING'
                                        )
                                            && (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PersonIcon sx={{color: theme.palette.secondary.light}}/>}
                                                    onClick={() => onOpenAssignCuttingDialog(orderData)}
                                                    sx={{borderColor: theme.palette.primary[300]}}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        color={theme.palette.secondary.light}
                                                        textTransform="none"
                                                    >
                                                        Assign Cutting
                                                    </Typography>
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<PlayArrowIcon/>}
                                                    onClick={() => onStatusChange(orderData._id, 'CUTTING')}
                                                >
                                                    <Typography textTransform="none">
                                                        Start Cutting
                                                    </Typography>
                                                </Button>
                                            </>
                                        )}
                                        {orderData.status === 'CUTTING' && (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Group sx={{color: theme.palette.secondary.light}}/>}
                                                    sx={{borderColor: theme.palette.primary[300]}}
                                                    onClick={() => onOpenAssignProductionDialog(orderData)}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        color={theme.palette.secondary.light}
                                                        textTransform="none"
                                                    >
                                                        Assign Production
                                                    </Typography>
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<FactoryIcon/>}
                                                    onClick={() => onStatusChange(orderData._id, 'IN_PRODUCTION')}
                                                >
                                                    Move to Production
                                                </Button>
                                            </>
                                        )}
                                        {orderData.status === 'IN_PRODUCTION' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleIcon/>}
                                                onClick={() => onStatusChange(orderData._id, 'COMPLETED')}
                                            >
                                                <Typography textTransform="none">
                                                    Mark Completed
                                                </Typography>
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="warning"
                                            startIcon={<ReportProblemIcon/>}
                                            onClick={() => onOpenIssueDialog(orderData)}
                                        >
                                            <Typography textTransform="none">
                                                Report Issue
                                            </Typography>
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default OrderRow;