import React, {useState, useEffect} from 'react';
import {Box, Button, Chip, Divider, Drawer, IconButton, Stack, TextField, Typography, useTheme} from "@mui/material";
import {getPriorityColor} from "./utilityFunctions";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import FlagIcon from "@mui/icons-material/Flag"
import CategoryIcon from "@mui/icons-material/Category"

const FilterDrawer = ({open, onClose, filters, onFilterChange, categories}) => {
    const theme = useTheme();
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
            priority: [],
            category: [],
            dateRange: {start: null, end: null},
            minQuantity: '',
            maxQuantity: '',
            hasIssues: null,
            isOverdue: null,
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const priorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{width: 350, height: "100%", p: 3, bgcolor: theme.palette.background.alt}}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        <FilterListIcon sx={{mr: 1, verticalAlign: 'top', fontSize: 25}}/>
                        Filters
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon sx={{fontSize: 25}}/>
                    </IconButton>
                </Stack>

                <Stack spacing={3}>
                    {/* Priority Filter */}
                    <Box>
                        <Typography variant="subtitle2" color={theme.palette.secondary.light} gutterBottom>
                            Priority
                        </Typography>
                        <Divider sx={{mb: 1}}/>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {priorityOptions.map((priority) => (
                                <Chip
                                    key={priority}
                                    label={<Typography variant="subtitle2" sx={{textTransform: "capitalize"}}>{priority.toLowerCase()}</Typography>}
                                    icon={priority === 'URGENT' ? <FlagIcon sx={{fontSize: 16}}/> : undefined}
                                    onClick={() => {
                                        const newPriority = localFilters.priority.includes(priority)
                                            ? localFilters.priority.filter((p) => p !== priority)
                                            : [...localFilters.priority, priority];
                                        setLocalFilters((prev) => ({...prev, priority: newPriority}));
                                    }}
                                    color={localFilters.priority.includes(priority) ? getPriorityColor(priority) : 'default'}
                                    variant={localFilters.priority.includes(priority) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{p: "0 5px"}}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Category Filter */}
                    <Box>
                        <Typography variant="subtitle2" color={theme.palette.secondary.light} gutterBottom>
                            Category
                        </Typography>
                        <Divider sx={{mb: 1}}/>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {categories.map((category) => (
                                <Chip
                                    key={category}
                                    label={<Typography variant="subtitle2" sx={{textTransform: "capitalize"}}>{category.toLowerCase()}</Typography>}
                                    icon={<CategoryIcon sx={{fontSize: 16}}/>}
                                    onClick={() => {
                                        const newCategories = localFilters.category.includes(category)
                                            ? localFilters.category.filter((c) => c !== category)
                                            : [...localFilters.category, category];
                                        setLocalFilters((prev) => ({...prev, category: newCategories}));
                                    }}
                                    color={localFilters.category.includes(category) ? 'primary' : 'default'}
                                    variant={localFilters.category.includes(category) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{p: "0 5px"}}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Date Range */}
                    <Box>
                        <Typography variant="subtitle2" color={theme.palette.secondary.light} gutterBottom>
                            Due Date Range
                        </Typography>
                        <Divider sx={{mb: 1}}/>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Stack spacing={2}>
                                <DateTimePicker
                                    label="From"
                                    value={localFilters.dateRange.start}
                                    ampm={false}
                                    views={["year", "month", "day", "hours", "minutes"]}
                                    closeOnSelect
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, start: value},
                                        }))
                                    }
                                    slotProps={{
                                        textField: {size: 'small', fullWidth: true},
                                        field: {
                                            clearable: Boolean(localFilters.dateRange.start),
                                        },
                                    }}
                                />
                                <DateTimePicker
                                    label="To"
                                    value={localFilters.dateRange.end}
                                    ampm={false}
                                    views={["year", "month", "day", "hours", "minutes"]}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            dateRange: {...prev.dateRange, end: value},
                                        }))
                                    }
                                    slotProps={{
                                        textField: {size: 'small', fullWidth: true},
                                        field: {
                                            clearable: Boolean(localFilters.dateRange.end),
                                        },
                                    }}
                                />
                            </Stack>
                        </LocalizationProvider>
                    </Box>

                    {/* Quantity Range */}
                    <Box>
                        <Typography variant="subtitle2" color={theme.palette.secondary.light} gutterBottom>
                            Quantity Range
                        </Typography>
                        <Divider sx={{mb: 1}}/>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                label="Min"
                                type="number"
                                value={localFilters.minQuantity}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({...prev, minQuantity: e.target.value}))
                                }
                            />
                            <TextField
                                size="small"
                                label="Max"
                                type="number"
                                value={localFilters.maxQuantity}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({...prev, maxQuantity: e.target.value}))
                                }
                            />
                        </Stack>
                    </Box>

                    {/* Special Filters */}
                    <Box>
                        <Typography variant="subtitle2" color={theme.palette.secondary.light} gutterBottom>
                            Special Filters
                        </Typography>
                        <Divider sx={{mb: 1}}/>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            <Chip
                                label="Has Issues"
                                icon={<ReportProblemIcon sx={{fontSize: 16}}/>}
                                onClick={() => {
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        hasIssues: prev.hasIssues === true ? null : true,
                                    }));
                                }}
                                color={localFilters.hasIssues === true ? 'warning' : 'default'}
                                variant={localFilters.hasIssues === true ? 'filled' : 'outlined'}
                                size="small"
                                sx={{p: "0 5px"}}
                            />
                            <Chip
                                label="Overdue"
                                icon={<WarningIcon sx={{fontSize: 16}}/>}
                                onClick={() => {
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        isOverdue: prev.isOverdue === true ? null : true,
                                    }));
                                }}
                                color={localFilters.isOverdue === true ? 'error' : 'default'}
                                variant={localFilters.isOverdue === true ? 'filled' : 'outlined'}
                                size="small"
                                sx={{p: "0 5px"}}
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
                                variant="h5"
                                color={theme.palette.secondary.light}
                                textTransform="none"
                            >
                                Reset
                            </Typography>
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            startIcon={<CheckCircleIcon  sx={{color: theme.palette.background.alt}}/>}
                            fullWidth
                            sx={{backgroundColor: theme.palette.secondary.light}}
                        >
                            <Typography
                                variant="h5"
                                color={theme.palette.background.alt}
                                textTransform="none"
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