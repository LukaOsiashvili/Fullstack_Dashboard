import React, {useState, useEffect} from "react";
import {
    Alert,
    Box,
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Grid,
    IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select,
    Stack,
    Step,
    StepLabel,
    Stepper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Typography, useTheme
} from "@mui/material";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker, DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";

import ProductSelector from "./productsSelector";
import {formatCurrency, getOrderTypeColor, getOrderTypeIcon} from "./getFunctions";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Icons
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BuildIcon from "@mui/icons-material/Build";
import FactoryIcon from "@mui/icons-material/Factory";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import MoneyIcon from "@mui/icons-material/Money";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from "@mui/icons-material/Pending";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

dayjs.extend(relativeTime);

// Add/Edit Order Dialog
const OrderFormDialog = ({
                             open,
                             onClose,
                             onSave,
                             order,
                             products,
                             branches,
                             users,
                         }) => {

    const theme = useTheme();

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        items: [],
        orderType: 'SALE',
        branchId: '',
        branchInfo: null,
        issuedBy: null,
        customer: {name: '', phone: '', email: ''},
        requiresEngraving: false,
        engravedOnsite: false,
        customInstructions: '',
        assignedTo: null,
        tax: 0,
        paymentMethod: 'CASH',
        orderDate: dayjs(),
        dueDate: null,
        notes: '',
    });
    const [errors, setErrors] = useState({});

    const steps = ['Products', 'Order Details', 'Customer & Payment', 'Review'];

    useEffect(() => {
        if (order) {
            setFormData({
                items: order.items || [],
                orderType: order.orderType || 'SALE',
                branchId: order.branchId || '',
                branchInfo: order.branchInfo || null,
                issuedBy: order.issuedBy || null,
                customer: order.customer || {name: '', phone: '', email: ''},
                requiresEngraving: order.requiresEngraving || false,
                engravedOnsite: order.engravedOnsite || false,
                customInstructions: order.customInstructions || '',
                assignedTo: order.assignedTo || null,
                tax: order.tax || 0,
                paymentMethod: order.paymentMethod || 'CASH',
                orderDate: dayjs(order.orderDate) || dayjs(),
                dueDate: order.dueDate ? dayjs(order.dueDate) : null,
                notes: order.notes || '',
            });
        } else {
            // Set default issued by user (first user in list)
            const defaultUser = users[0];
            setFormData((prev) => ({
                ...prev,
                issuedBy: defaultUser
                    ? {userId: defaultUser._id, firstName: defaultUser.firstName, lastName: defaultUser.lastName}
                    : null,
            }));
        }
    }, [order, users]);

    const handleBranchChange = (branchId) => {
        const branch = branches.find((b) => b._id === branchId);
        setFormData((prev) => ({
            ...prev,
            branchId,
            branchInfo: branch
                ? {name: branch.name, city: branch.city, address: branch.address}
                : null,
        }));
    };

    const handleUserChange = (field, userId) => {
        const user = users.find((u) => u._id === userId);
        setFormData((prev) => ({
            ...prev,
            [field]: user
                ? {userId: user._id, firstName: user.firstName, lastName: user.lastName}
                : null,
        }));
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = (subtotal * formData.tax) / 100;
        const totalAmount = subtotal + taxAmount;
        const totalCost = formData.items.reduce((sum, item) => {
            const product = products.find((p) => p._id === item.productId);
            return sum + (product?.cost || 0) * item.quantity;
        }, 0);
        const grossProfit = totalAmount - totalCost;

        return {subtotal, taxAmount, totalAmount, totalCost, grossProfit};
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 0:
                if (formData.items.length === 0) {
                    newErrors.items = 'Please add at least one product';
                }
                break;
            case 1:
                if (!formData.branchId) {
                    newErrors.branchId = 'Please select a branch';
                }
                if (!formData.issuedBy) {
                    newErrors.issuedBy = 'Please select who issued this order';
                }
                if (formData.orderType === 'CUSTOM' && !formData.dueDate) {
                    newErrors.dueDate = 'Due date is required for custom orders';
                }
                break;
            case 2:
                if (['PRODUCTION', 'CUSTOM'].includes(formData.orderType)) {
                    if (!formData.customer.name) {
                        newErrors.customerName = 'Customer name is required';
                    }
                    if (!formData.customer.phone) {
                        newErrors.customerPhone = 'Customer phone is required';
                    }
                }
                if (!formData.paymentMethod) {
                    newErrors.paymentMethod = 'Please select a payment method';
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSave = () => {
        if (validateStep(activeStep)) {
            const totals = calculateTotals();
            const orderData = {
                ...formData,
                orderDate: formData.orderDate.toDate(),
                dueDate: formData.dueDate?.toDate() || null,
                subtotal: totals.subtotal,
                tax: totals.taxAmount,
                totalAmount: totals.totalAmount,
                totalCost: totals.totalCost,
                grossProfit: totals.grossProfit,
                status: 'PENDING',
            };
            onSave(orderData);
            handleClose();
        }
    };

    const handleClose = () => {
        setActiveStep(0);
        setFormData({
            items: [],
            orderType: 'SALE',
            branchId: '',
            branchInfo: null,
            issuedBy: null,
            customer: {name: '', phone: '', email: ''},
            requiresEngraving: false,
            engravedOnsite: false,
            customInstructions: '',
            assignedTo: null,
            tax: 0,
            paymentMethod: 'CASH',
            orderDate: dayjs(),
            dueDate: null,
            notes: '',
        });
        setErrors({});
        onClose();
    };

    const totals = calculateTotals();

    const renderStepContent = (step) => {
        switch (step) {
            case 0: //Product Select Page
                return (
                    <Box>
                        <ProductSelector
                            selectedItems={formData.items}
                            onItemsChange={(items) => setFormData((prev) => ({...prev, items}))}
                            products={products}
                        />
                        {errors.items && (
                            <Alert severity="error" sx={{mt: 2}}>
                                {errors.items}
                            </Alert>
                        )}
                    </Box>
                );

            case 1: //Order Details Page
                return (
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth error={!!errors.orderType}>
                                {/*<InputLabel>Order Type</InputLabel>*/}
                                <TextField
                                    select
                                    value={formData.orderType}
                                    label="Order Type"
                                    onChange={(e) => setFormData((prev) => ({...prev, orderType: e.target.value}))}
                                    variant="outlined"
                                >
                                    <MenuItem value="SALE">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ShoppingCartIcon fontSize="small" color="success"/>
                                            <span>Sale</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="CUSTOM">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <BuildIcon fontSize="small" color="primary"/>
                                            <span>Custom Order</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="PRODUCTION">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <FactoryIcon fontSize="small" color="info"/>
                                            <span>Production</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="RETURN">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AssignmentReturnIcon fontSize="small" color="error"/>
                                            <span>Return</span>
                                        </Stack>
                                    </MenuItem>
                                </TextField>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth error={!!errors.branchId}>
                                {/*<InputLabel>Branch</InputLabel>*/}
                                <TextField
                                    select
                                    value={formData.branchId}
                                    label="Branch"
                                    onChange={(e) => handleBranchChange(e.target.value)}
                                    variant="outlined"
                                >
                                    {branches.map((branch) => (
                                        <MenuItem key={branch._id} value={branch._id}>
                                            <Stack>
                                                <Typography variant="body2">{branch.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {branch.city}
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {errors.branchId && <FormHelperText>{errors.branchId}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth error={!!errors.issuedBy}>
                                {/*<InputLabel>Issued By</InputLabel>*/}
                                <TextField
                                    select
                                    value={formData.issuedBy?.userId || ''}
                                    label="Issued By"
                                    onChange={(e) => handleUserChange('issuedBy', e.target.value)}
                                    variant="outlined"
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {errors.issuedBy && <FormHelperText>{errors.issuedBy}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Order Date & Time"
                                    value={formData.orderDate}
                                    onChange={(value) => setFormData((prev) => ({...prev, orderDate: value}))}
                                    slotProps={{
                                        textField: {fullWidth: true},
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Custom Order Fields */}
                        {(formData.orderType === 'CUSTOM' || formData.orderType === 'PRODUCTION') && (
                            <>
                                <Grid size={12}>
                                    <Divider>
                                        <Chip label="Custom Work Details"/>
                                    </Divider>
                                </Grid>
                                <Grid size={{xs: 12, md: 6}}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Due Date"
                                            value={formData.dueDate}
                                            onChange={(value) => setFormData((prev) => ({...prev, dueDate: value}))}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.dueDate,
                                                    helperText: errors.dueDate,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid size={{xs: 12, md: 6}}>
                                    <FormControl fullWidth>
                                        {/*<InputLabel>Assign To</InputLabel>*/}
                                        <TextField
                                            select
                                            value={formData.assignedTo?.userId || ''}
                                            label="Assign To"
                                            disabled={formData.engravedOnsite || !formData.requiresEngraving}
                                            onChange={(e) => handleUserChange('assignedTo', e.target.value)}
                                            variant="outlined"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {users
                                                .filter((u) => u.role === 'Artisan')
                                                .map((user) => (
                                                    <MenuItem key={user._id} value={user._id}>
                                                        {user.firstName} {user.lastName}
                                                    </MenuItem>
                                                ))}
                                        </TextField>
                                    </FormControl>
                                </Grid>
                                <Grid size={{xs: 12, md: 6}}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.requiresEngraving}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        requiresEngraving: e.target.checked
                                                    }))
                                                }
                                            />
                                        }
                                        label="Requires Engraving"
                                    />
                                    {formData.requiresEngraving && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.engravedOnsite}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            engravedOnsite: e.target.checked
                                                        }))
                                                    }
                                                />
                                            }
                                            label="Engraved On-site"
                                        />
                                    )}
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Custom Instructions"
                                        value={formData.customInstructions}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, customInstructions: e.target.value}))
                                        }
                                        placeholder="Enter any special instructions for this order..."
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                );

            case 2: //Customer and Payment Information
                return (
                    <Grid container spacing={3}>
                        {/* Customer Info */}
                        <Grid size={12}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Customer Information
                            </Typography>
                        </Grid>
                        <Grid size={{xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                label="Customer Name"
                                value={formData.customer.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        customer: {...prev.customer, name: e.target.value},
                                    }))
                                }
                                error={!!errors.customerName}
                                helperText={errors.customerName}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.customer.phone}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        customer: {...prev.customer, phone: e.target.value},
                                    }))
                                }
                                error={!!errors.customerPhone}
                                helperText={errors.customerPhone}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.customer.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        customer: {...prev.customer, email: e.target.value},
                                    }))
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        {/* Payment */}
                        <Grid size={12}>
                            <Divider sx={{my: 2}}/>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Payment Details
                            </Typography>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth error={!!errors.paymentMethod}>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={formData.paymentMethod}
                                    label="Payment Method"
                                    onChange={(e) =>
                                        setFormData((prev) => ({...prev, paymentMethod: e.target.value}))
                                    }
                                    variant="standard"
                                >
                                    <MenuItem value="CASH">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <MoneyIcon/>
                                            <span>Cash</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="CARD">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CreditCardIcon/>
                                            <span>Card</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="TRANSFER">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccountBalanceIcon/>
                                            <span>Bank Transfer</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="CREDIT">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PaymentIcon/>
                                            <span>Credit</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="PENDING">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PendingIcon/>
                                            <span>Pending</span>
                                        </Stack>
                                    </MenuItem>
                                </Select>
                                {errors.paymentMethod && <FormHelperText>{errors.paymentMethod}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                label="Tax Rate (%)"
                                type="number"
                                value={formData.tax}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        tax: Math.max(0, parseFloat(e.target.value) || 0),
                                    }))
                                }
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    },
                                    htmlInput: {min: 0, max: 100},
                                }}
                            />
                        </Grid>

                        {/* Notes */}
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Order Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({...prev, notes: e.target.value}))}
                                placeholder="Add any additional notes about this order..."
                            />
                        </Grid>
                    </Grid>
                );

            case 3: //Review
                return (
                    <Grid container spacing={3} alignItems="stretch">
                        {/* Order Summary */}
                        <Grid size={{xs: 12, md: 8}}>
                            <Paper variant="outlined" sx={{p: 2, backgroundColor: theme.palette.background.alt}}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Order Items ({formData.items.length})
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="center">Qty</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography variant="body2">{item.productName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.variantName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">{item.quantity}</TableCell>
                                                    <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>

                            {/* Order Details Summary */}
                            <Paper variant="outlined" sx={{p: 2, mt: 2, backgroundColor: theme.palette.background.alt}}>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Box height={"50%"}>
                                            <Typography variant="body2" color="text.secondary" mb={"5px"}>
                                                Order Type
                                            </Typography>
                                        </Box>
                                        <Box height={"50%"} display="flex" alignItems="center">
                                            <Chip
                                                size="small"
                                                label={formData.orderType}
                                                color={getOrderTypeColor(formData.orderType)}
                                                icon={getOrderTypeIcon(formData.orderType)}
                                            />

                                        </Box>
                                    </Grid>
                                    <Grid size={6}>
                                        <Box height={"50%"}>
                                            <Typography variant="body2" color="text.secondary">
                                                Branch
                                            </Typography>
                                        </Box>
                                        <Box height={"50%"} display="flex" alignItems="center">
                                            <Typography variant="body2" fontWeight={500}>
                                                {formData.branchInfo?.name || '-'}
                                            </Typography>

                                        </Box>
                                    </Grid>
                                    {formData.customer.name && (
                                        <Grid size={6}>
                                            <Box height={"50%"}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Customer
                                                </Typography>
                                            </Box>
                                            <Box height={"50%"} display="flex" alignItems="center">
                                                <Typography variant="body2" fontWeight={500}>
                                                    {formData.customer.name}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                    <Grid size={6}>
                                        <Box height={"50%"}>
                                            <Typography variant="body2" color="text.secondary">
                                                Payment Method
                                            </Typography>
                                        </Box>
                                        <Box height={"50%"} display="flex" alignItems="center" mb={"5px"}>
                                            <Chip size="small" label={formData.paymentMethod} variant="outlined"/>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Totals */}
                        <Grid size={{xs: 12, md: 4}} sx={{display: 'flex'}}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    backgroundColor: theme.palette.background.alt,
                                    position: 'sticky',
                                    top: 16,
                                    flexGrow: 1
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Order Total
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Subtotal:
                                        </Typography>
                                        <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Tax ({formData.tax}%):
                                        </Typography>
                                        <Typography variant="body2">{formatCurrency(totals.taxAmount)}</Typography>
                                    </Stack>
                                    <Divider/>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Total:
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} color="secondary">
                                            {formatCurrency(totals.totalAmount)}
                                        </Typography>
                                    </Stack>
                                    <Divider/>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Est. Cost:
                                        </Typography>
                                        <Typography variant="body2">{formatCurrency(totals.totalCost)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Est. Profit:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            color={totals.grossProfit >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            {formatCurrency(totals.grossProfit)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{order ? 'Edit Order' : 'Create New Order'}</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stepper activeStep={activeStep} sx={{mb: 4}}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {renderStepContent(activeStep)}
            </DialogContent>
            <DialogActions sx={{px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                <Button onClick={handleClose} variant="outlined" sx={{borderColor: theme.palette.primary[100]}}>
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                    >
                        Cancel
                    </Typography>
                </Button>
                <Box sx={{flex: 1}}/>
                {activeStep > 0 && (
                    <Button onClick={handleBack} variant="outlined" sx={{borderColor: theme.palette.primary[100]}}>
                        <Typography
                            variant="h6"
                            color={theme.palette.secondary.light}
                        >
                            Back
                        </Typography>
                    </Button>
                )}
                {activeStep < steps.length - 1 ? (
                    <Button onClick={handleNext} variant="outlined"
                            sx={{backgroundColor: theme.palette.secondary.light}}>
                        <Typography variant="h6" color={theme.palette.background.alt}
                                    sx={{fontWeight: 600}}>Next</Typography>
                    </Button>
                ) : (
                    <Button onClick={handleSave} variant="contained" color="success" startIcon={<SaveIcon/>}>
                        <Typography sx={{fontWeight: 600}}>
                            {order ? 'Update Order' : 'Create Order'}
                        </Typography>
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OrderFormDialog;