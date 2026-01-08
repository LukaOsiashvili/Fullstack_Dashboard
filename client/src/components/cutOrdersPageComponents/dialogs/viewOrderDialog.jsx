import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Stack,
    Chip,
    IconButton,
    Grid,
    Paper,
    Box,
    Avatar,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Alert,
    Button,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CutIcon from '@mui/icons-material/ContentCut';
import GroupIcon from '@mui/icons-material/Group';
import FactoryIcon from '@mui/icons-material/Factory';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from "@mui/icons-material/Edit";

import {
    formatCurrency,
    formatDate,
    isOverdue,
} from "../utilityFunctions";
import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
} from "../dummyData";

const ViewOrderDialog = ({ selectedOrder, open, onClose, openEditDialog }) => {
    const theme = useTheme();

    if (!selectedOrder) return null;

    const statusConfig = STATUS_CONFIG[selectedOrder.status];
    const priorityConfig = PRIORITY_CONFIG[selectedOrder.priority];
    const overdue = isOverdue(selectedOrder);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack spacing={0.5}>
                        <Typography variant="h6">{selectedOrder.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedOrder.variantName}</Typography>
                        <Typography variant="caption" color="text.disabled">ID: {selectedOrder._id}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            color={statusConfig.color}
                        />
                        <Chip
                            label={priorityConfig.label}
                            color={priorityConfig.color}
                            variant="outlined"
                        />
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                <Grid container spacing={3}>
                    {/* Order Summary */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt}}>
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>Order Details</Typography>
                            <Divider sx={{mb: 1}} />
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Category:</Typography>
                                    <Typography variant="body2">{selectedOrder.category}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Quantity:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{selectedOrder.quantity} units</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Created By:</Typography>
                                    <Typography variant="body2">
                                        {selectedOrder.createdBy.firstName} {selectedOrder.createdBy.lastName}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Created On:</Typography>
                                    <Typography variant="body2">{formatDate(selectedOrder.addedDate)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                                    <Typography
                                        variant="body2"
                                        color={overdue ? 'error.main' : 'inherit'}
                                        fontWeight={overdue ? 600 : 400}
                                    >
                                        {formatDate(selectedOrder.dueDate)}
                                        {overdue && ' (Overdue)'}
                                    </Typography>
                                </Stack>
                                {selectedOrder.relatedOrderId && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Linked Order:</Typography>
                                        <Chip size="small" label={selectedOrder.relatedOrderId} variant="outlined" />
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Assignments */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{display: "flex"}}>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt, flexGrow: 1 }}>
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>Assignments</Typography>
                            <Divider sx={{mb: 1}}/>
                            <Stack spacing={2}>
                                {/* Cutting Assignment */}
                                <Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36 }}>
                                            <CutIcon fontSize="small" />
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="caption" color="text.secondary">
                                                Cutting Specialist
                                            </Typography>
                                            {selectedOrder.assignedToCutting ? (
                                                <>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {selectedOrder.assignedToCutting.firstName} {selectedOrder.assignedToCutting.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Assigned: {formatDate(selectedOrder.assignedToCutting.assignedDate)}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                                    Not yet assigned
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Box>

                                <Divider />

                                {/* Production Assignment */}
                                <Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                            <GroupIcon fontSize="small" />
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="caption" color="text.secondary">
                                                Production Group
                                            </Typography>
                                            {selectedOrder.assignedToProduction ? (
                                                <>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {selectedOrder.assignedToProduction.group}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Assigned: {formatDate(selectedOrder.assignedToProduction.assignedDate)}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                                    Not yet assigned
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Timeline */}
                    <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt }}>
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>Timeline</Typography>
                            <Divider sx={{mb: 2}}/>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Created', date: selectedOrder.addedDate, icon: CalendarIcon, color: 'success.main' },
                                    { label: 'Cutting Started', date: selectedOrder.cuttingStartedDate, icon: CutIcon, color: 'info.main' },
                                    { label: 'Cutting Done', date: selectedOrder.cuttingCompletedDate, icon: CheckCircleIcon, color: 'info.main' },
                                    { label: 'Production Started', date: selectedOrder.productionStartedDate, icon: FactoryIcon, color: 'primary.main' },
                                    { label: 'Completed', date: selectedOrder.completedDate, icon: CheckCircleIcon, color: 'success.main' },
                                ].map((step, idx) => {
                                    const Icon = step.icon;
                                    return (
                                        <Grid size={{ xs: 6, md: 2.4 }} key={idx}>
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Avatar sx={{
                                                    bgcolor: step.date ? step.color : 'grey.300',
                                                    width: 32,
                                                    height: 32
                                                }}>
                                                    <Icon fontSize="small" />
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary">
                                                    {step.label}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {formatDate(step.date)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Cost Summary */}
                    <Grid size={12}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, backgroundColor: theme.palette.background.alt }}
                        >
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>Cost Summary</Typography>
                            <Divider sx={{mb: 2}}/>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Stack alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Estimated Cost
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                            {formatCurrency(selectedOrder.estimatedMaterialCost)}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Stack alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Actual Cost
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                            {formatCurrency(selectedOrder.actualMaterialCost)}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Stack alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Cost per Unit
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                            {formatCurrency(selectedOrder.estimatedMaterialCost / selectedOrder.quantity)}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Stack alignItems="center">
                                        <Typography variant="caption" color="text.secondary">Variance</Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            color={selectedOrder.actualMaterialCost > selectedOrder.estimatedMaterialCost ? 'error.main' : 'success.main'}
                                        >
                                            {selectedOrder.actualMaterialCost
                                                ? formatCurrency(selectedOrder.actualMaterialCost - selectedOrder.estimatedMaterialCost)
                                                : '-'}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Materials */}
                    <Grid size={12}>
                        <Accordion defaultExpanded sx={{backgroundColor: theme.palette.background.alt}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" color={theme.palette.secondary.light}>
                                    Materials Required ({selectedOrder.materialsRequired.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Material</TableCell>
                                                <TableCell>Variant</TableCell>
                                                <TableCell align="right">Qty Needed</TableCell>
                                                <TableCell align="right">Lists</TableCell>
                                                <TableCell align="center">Reserved</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.materialsRequired.map((mat, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{mat.materialName}</TableCell>
                                                    <TableCell>{mat.variantName}</TableCell>
                                                    <TableCell align="right">{mat.quantityNeeded}</TableCell>
                                                    <TableCell align="right">{mat.listsNeeded || '-'}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            size="small"
                                                            label={mat.reserved ? 'Reserved' : 'Not Reserved'}
                                                            color={mat.reserved ? 'success' : 'default'}
                                                            variant={mat.reserved ? 'filled' : 'outlined'}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* Notes */}
                    {(selectedOrder.instructions || selectedOrder.notes) && (
                        <Grid size={12}>
                            <Grid container spacing={2}>
                                {selectedOrder.instructions && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt }}>
                                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                                Instructions
                                            </Typography>
                                            <Divider sx={{mb: 2}}/>
                                            <Typography variant="body2">{selectedOrder.instructions}</Typography>
                                        </Paper>
                                    </Grid>
                                )}
                                {selectedOrder.notes && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt}}>
                                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                                Notes
                                            </Typography>
                                            <Divider sx={{mb: 2}}/>
                                            <Typography variant="body2">{selectedOrder.notes}</Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    )}

                    {/* Issues */}
                    {selectedOrder.issues.length > 0 && (
                        <Grid size={12}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.background.alt}}>
                                <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                    Issues ({selectedOrder.issues.filter(i => !i.resolved).length} unresolved)
                                </Typography>
                                <Divider sx={{mb: 2}}/>
                                <Stack spacing={1}>
                                    {selectedOrder.issues.map((issue, idx) => (
                                        <Alert key={idx} severity={issue.resolved ? 'success' : 'warning'}>
                                            <Stack>
                                                <Typography variant="body2">{issue.description}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Reported by {issue.reportedBy.name} on {formatDate(issue.reportedDate)}
                                                </Typography>
                                            </Stack>
                                        </Alert>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                        onClose();
                        openEditDialog(selectedOrder);
                    }}
                    disabled={selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'CANCELLED'}
                >
                    Edit Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewOrderDialog;