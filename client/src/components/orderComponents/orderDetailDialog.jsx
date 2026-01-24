import React from 'react'
import {
    Box, Button,
    Chip,
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,

    Typography, useTheme,
} from "@mui/material"

// Icons
import CloseIcon from "@mui/icons-material/Close";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PrintIcon from "@mui/icons-material/Print";

// Utility Functions
import {
    formatCurrency,
    getOrderTypeColor,
    getOrderTypeIcon,
    getPaymentMethodIcon,
    getStatusColor,
    getStatusIcon
} from "./getFunctions";
import dayjs from "dayjs";

const OrderDetailDialog = ({open, onClose, order}) => {

    const theme = useTheme();

    if (!order) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6">Order Details</Typography>
                        <Chip
                            label={order.orderType}
                            color={getOrderTypeColor(order.orderType)}
                            size="small"
                            icon={getOrderTypeIcon(order.orderType)}
                        />
                        <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            icon={getStatusIcon(order.status)}
                        />
                    </Stack>
                    <IconButton onClick={onClose}>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                <Grid container spacing={3}>
                    {/* Order Info */}
                    <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
                        <Paper variant="outlined"
                               sx={{p: 2, backgroundColor: theme.palette.background.alt, flexGrow: 1}}>
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                Order Information
                            </Typography>
                            <Divider sx={{mb: 1}}/>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                                    <Typography variant="body2" fontWeight={500}>{order._id}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                                    <Typography variant="body2">
                                        {dayjs(order.orderDate).format('MMM DD, YYYY HH:mm')}
                                    </Typography>
                                </Stack>
                                {order.dueDate && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                                        <Typography variant="body2">
                                            {dayjs(order.dueDate).format('MMM DD, YYYY')}
                                        </Typography>
                                    </Stack>
                                )}
                                {order.completedDate && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Completed:</Typography>
                                        <Typography variant="body2">
                                            {dayjs(order.completedDate).format('MMM DD, YYYY HH:mm')}
                                        </Typography>
                                    </Stack>
                                )}
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Payment:</Typography>
                                    <Chip
                                        size="small"
                                        label={order.paymentMethod}
                                        icon={getPaymentMethodIcon(order.paymentMethod)}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Branch & Staff Info */}
                    <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
                        <Paper variant="outlined"
                               sx={{p: 2, backgroundColor: theme.palette.background.alt, flexGrow: 1}}>
                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                Branch & Staff
                            </Typography>
                            <Divider sx={{mb: 1}}/>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <StoreIcon fontSize="small" color="action"/>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {order.branchInfo.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.branchInfo.city} - {order.branchInfo.address}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Divider/>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PersonIcon fontSize="small" color="action"/>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            Issued by: {order.issuedBy.firstName} {order.issuedBy.lastName}
                                        </Typography>
                                    </Box>
                                </Stack>
                                {order.assignedTo && (
                                    <>
                                        <Divider/>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AssignmentIndIcon fontSize="small" color="action"/>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Assigned
                                                    to: {order.assignedTo.firstName} {order.assignedTo.lastName}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Customer Info */}
                    {order.customer && order.customer.name && (
                        <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
                            <Paper variant="outlined"
                                   sx={{p: 2, backgroundColor: theme.palette.background.alt, flexGrow: 1}}>
                                <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                    Customer Information
                                </Typography>
                                <Divider sx={{mb: 1}}/>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PersonIcon fontSize="small" color="action"/>
                                        <Typography variant="body2">{order.customer.name}</Typography>
                                    </Stack>
                                    {order.customer.phone && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneIcon fontSize="small" color="action"/>
                                            <Typography variant="body2">{order.customer.phone}</Typography>
                                        </Stack>
                                    )}
                                    {order.customer.email && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmailIcon fontSize="small" color="action"/>
                                            <Typography variant="body2">{order.customer.email}</Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>
                    )}

                    {/* Custom Work Info */}
                    {(order.requiresEngraving || order.customInstructions) && (
                        <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
                            <Paper variant="outlined"
                                   sx={{p: 2, backgroundColor: theme.palette.background.alt, flexGrow: 1}}>
                                <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                    Custom Work Details
                                </Typography>
                                <Divider sx={{mb: 1}}/>
                                <Stack spacing={1}>
                                    {order.requiresEngraving && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ContentCutIcon fontSize="small" color="warning"/>
                                            <Typography variant="body2">
                                                Engraving Required {order.engravedOnsite ? '(On-site)' : '(External)'}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {order.customInstructions && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="caption" color="text.secondary">
                                                Instructions:
                                            </Typography>
                                            <Typography variant="body2" sx={{fontStyle: 'italic'}}>
                                                "{order.customInstructions}"
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>
                    )}

                    {/* Order Items */}
                    <Grid size={12}>
                        <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                            Order Items
                        </Typography>
                        <TableContainer component={Paper} variant="outlined"
                                        sx={{backgroundColor: theme.palette.background.alt}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Product
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Variant
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Qty
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Unit Price
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Discount
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle2" gutterBottom color={theme.palette.secondary.light} fontWeight={600}>
                                                Subtotal
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Stack>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.category}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{item.variantName}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell align="center">
                                                {item.discount > 0 ? (
                                                    <Chip size="small" label={`${item.discount}%`} color="success"/>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{fontWeight: 600}}>
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Financial Summary */}
                    <Grid size={12}>
                        <Paper variant="outlined" sx={{p: 2, backgroundColor: theme.palette.background.alt}}>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, md: 8}}>
                                    {order.notes && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom color={theme.palette.secondary.light}>
                                                Notes
                                            </Typography>
                                            <Divider sx={{mb: 1}}/>
                                            <Typography variant="body2">{order.notes}</Typography>
                                        </Box>
                                    )}
                                    {order.cancellationReason && (
                                        <Box sx={{mt: order.notes ? 2 : 0}}>
                                            <Typography variant="subtitle2" color="error" gutterBottom>
                                                Cancellation Reason
                                            </Typography>
                                            <Typography variant="body2">{order.cancellationReason}</Typography>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid size={{xs: 12, md: 4}}>
                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                                            <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Tax:</Typography>
                                            <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
                                        </Stack>
                                        <Divider/>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="subtitle1" fontWeight={600}>Total:</Typography>
                                            <Typography variant="subtitle1" fontWeight={700} color={theme.palette.secondary.light}>
                                                {formatCurrency(order.totalAmount)}
                                            </Typography>
                                        </Stack>
                                        <Divider/>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Cost:</Typography>
                                            <Typography variant="body2">{formatCurrency(order.totalCost)}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Gross
                                                Profit:</Typography>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color={order.grossProfit >= 0 ? 'success.main' : 'error.main'}
                                            >
                                                {formatCurrency(order.grossProfit)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{backgroundColor: theme.palette.primary[600]}}>
                <Button
                    startIcon={<PrintIcon sx={{color: theme.palette.secondary.light}} />}
                    variant="outlined"
                    sx={{borderColor: theme.palette.primary[100]}}
                >
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                        textTransform="none"
                    >
                        Print
                    </Typography>
                </Button>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{borderColor: theme.palette.primary[100]}}
                >
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                        textTransform="none"
                    >
                        Close
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailDialog;