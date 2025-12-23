import React, {useState, useEffect} from 'react';
import {
    Box, Button,
    Chip, Divider,
    Drawer,
    FormControl,
    IconButton, InputAdornment,
    MenuItem,
    Stack, TextField,
    Typography, useTheme

} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {getOrderTypeColor, getOrderTypeIcon, getPaymentMethodIcon, getStatusColor} from "./getFunctions";
// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


// Filter Drawer Component
const FilterDrawer = ({open, onClose, filters, onFilterChange, branches}) => {

    const theme = useTheme()

    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleApply = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            status: [],
            orderType: [],
            branchId: '',
            dateRange: {start: null, end: null},
            paymentMethod: [],
            minAmount: '',
            maxAmount: '',
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RETURNED'];
    const orderTypeOptions = ['SALE', 'CUSTOM', 'PRODUCTION', 'RETURN'];
    const paymentMethodOptions = ['CASH', 'CARD', 'TRANSFER', 'CREDIT', 'PENDING'];

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{width: 350, p: 3, backgroundColor: theme.palette.background.alt}}>
                {/* Header Section */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        <FilterListIcon sx={{mr: 1, verticalAlign: 'top', fontSize: 25}} />
                        Filters
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon sx={{fontSize: 25}}/>
                    </IconButton>
                </Stack>

                <Stack spacing={3}>
                    {/* Status Filter */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Status
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {statusOptions.map((status) => (
                                <Chip
                                    key={status}
                                    label={status.replace('_', ' ')}
                                    onClick={() => {
                                        const newStatus = localFilters.status.includes(status)
                                            ? localFilters.status.filter((s) => s !== status)
                                            : [...localFilters.status, status];
                                        setLocalFilters((prev) => ({...prev, status: newStatus}));
                                    }}
                                    color={localFilters.status.includes(status) ? getStatusColor(status) : 'default'}
                                    variant={localFilters.status.includes(status) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{p: "0 5px 0 5px"}}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Order Type Filter */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Order Type
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {orderTypeOptions.map((type) => (
                                <Chip
                                    key={type}
                                    label={type}
                                    icon={getOrderTypeIcon(type)}
                                    onClick={() => {
                                        const newTypes = localFilters.orderType.includes(type)
                                            ? localFilters.orderType.filter((t) => t !== type)
                                            : [...localFilters.orderType, type];
                                        setLocalFilters((prev) => ({...prev, orderType: newTypes}));
                                    }}
                                    color={localFilters.orderType.includes(type) ? getOrderTypeColor(type) : 'default'}
                                    variant={localFilters.orderType.includes(type) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{p: "0 5px 0 5px"}}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Branch Filter */}
                    <FormControl fullWidth size="small">
                        {/*<InputLabel>Branch</InputLabel>*/}
                        <TextField
                            select
                            value={localFilters.branchId}
                            label="Branch"
                            onChange={(e) => setLocalFilters((prev) => ({...prev, branchId: e.target.value}))}
                            variant="outlined"
                        >
                            <MenuItem value="">All Branches</MenuItem>
                            {branches.map((branch) => (
                                <MenuItem key={branch._id} value={branch._id}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>

                    {/* Date Range */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Date Range
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Stack spacing={2}>
                                <DatePicker
                                    label="From"
                                    value={localFilters.dateRange.start}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, start: value},
                                        }))
                                    }
                                    slotProps={{textField: {size: 'small', fullWidth: true}}}
                                />
                                <DatePicker
                                    label="To"
                                    value={localFilters.dateRange.end}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, end: value},
                                        }))
                                    }
                                    slotProps={{textField: {size: 'small', fullWidth: true}}}
                                />
                            </Stack>
                        </LocalizationProvider>
                    </Box>

                    {/* Payment Method Filter */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Payment Method
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {paymentMethodOptions.map((method) => (
                                <Chip
                                    key={method}
                                    label={method}
                                    icon={getPaymentMethodIcon(method)}
                                    onClick={() => {
                                        const newMethods = localFilters.paymentMethod.includes(method)
                                            ? localFilters.paymentMethod.filter((m) => m !== method)
                                            : [...localFilters.paymentMethod, method];
                                        setLocalFilters((prev) => ({...prev, paymentMethod: newMethods}));
                                    }}
                                    color={localFilters.paymentMethod.includes(method) ? 'primary' : 'default'}
                                    variant={localFilters.paymentMethod.includes(method) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{p: "0 5px 0 5px"}}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Amount Range */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom mb={"15px"}>
                            Amount Range
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                label="Min"
                                type="number"
                                value={localFilters.minAmount}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({...prev, minAmount: e.target.value}))
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    },
                                }}
                            />
                            <TextField
                                size="small"
                                label="Max"
                                type="number"
                                value={localFilters.maxAmount}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({...prev, maxAmount: e.target.value}))
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    },
                                }}
                            />
                        </Stack>
                    </Box>

                    <Divider/>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            startIcon={<ClearIcon sx={{color: theme.palette.secondary.light}}/>}
                            fullWidth
                            sx={{borderColor: theme.palette.primary[100]}}
                        >
                            <Typography
                                variant="h6"
                                color={theme.palette.secondary.light}
                            >
                                Reset
                            </Typography>
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            startIcon={<CheckCircleIcon sx={{color: theme.palette.background.alt}}/>}
                            fullWidth
                            sx={{backgroundColor: theme.palette.secondary.light}}
                        >
                            <Typography
                                variant="h6"
                                color={theme.palette.background.alt}
                                sx={{fontWeight: 600}}
                            >
                                Apply
                            </Typography>
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default FilterDrawer;