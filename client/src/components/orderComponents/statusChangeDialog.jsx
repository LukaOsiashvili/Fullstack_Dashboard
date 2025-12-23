import React, {useState, useEffect} from 'react';
import {
    Alert,
    Avatar, Button,
    Chip,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel, MenuItem,
    Paper, Select,
    Stack, TextField,
    Typography
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import {getStatusColor, getStatusIcon} from "./getFunctions";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";

// Status Change Dialog

const StatusChangeDialog = ({open, onClose, order, onStatusChange, users}) => {
    const [newStatus, setNewStatus] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        if (order) {
            setNewStatus(order.status);
            setCancellationReason(order.cancellationReason || '');
            setAssignedTo(order.assignedTo?.userId || '');
        }
    }, [order]);

    const handleSave = () => {
        const assignedUser = users.find((u) => u._id === assignedTo);
        onStatusChange(order._id, {
            status: newStatus,
            cancellationReason: newStatus === 'CANCELLED' ? cancellationReason : '',
            completedDate: newStatus === 'COMPLETED' ? new Date() : null,
            assignedTo: assignedUser
                ? {
                    userId: assignedUser._id,
                    firstName: assignedUser.firstName,
                    lastName: assignedUser.lastName,
                }
                : order.assignedTo,
        });
        onClose();
    };

    const handleClose = () => {
        setNewStatus('');
        setCancellationReason('');
        setAssignedTo('');
        onClose();
    };

    if (!order) return null;

    const statusTransitions = {
        PENDING: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'PENDING'],
        COMPLETED: ['RETURNED'],
        CANCELLED: ['PENDING'],
        RETURNED: [],
    };

    const allowedStatuses = statusTransitions[order.status] || [];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TimelineIcon color="primary"/>
                    <Typography variant="h6">Update Order Status</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{mt: 2}}>
                    {/* Current Status Display */}
                    <Paper variant="outlined" sx={{p: 2, bgcolor: 'grey.50'}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Current Status:
                            </Typography>
                            <Chip
                                label={order.status}
                                color={getStatusColor(order.status)}
                                icon={getStatusIcon(order.status)}
                            />
                        </Stack>
                    </Paper>

                    {/* New Status Selection */}
                    <FormControl fullWidth>
                        <InputLabel>New Status</InputLabel>
                        <Select
                            value={newStatus}
                            label="New Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                            variant="standard"
                        >
                            <MenuItem value={order.status} disabled>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {getStatusIcon(order.status)}
                                    <span>{order.status} (Current)</span>
                                </Stack>
                            </MenuItem>
                            {allowedStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {getStatusIcon(status)}
                                        <span>{status.replace('_', ' ')}</span>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Assignment for In Progress */}
                    {newStatus === 'IN_PROGRESS' && (order.orderType === 'CUSTOM' || order.orderType === 'PRODUCTION') && (
                        <FormControl fullWidth>
                            <InputLabel>Assign To</InputLabel>
                            <Select
                                value={assignedTo}
                                label="Assign To"
                                onChange={(e) => setAssignedTo(e.target.value)}
                                variant="standard"
                            >
                                <MenuItem value="">
                                    <em>No Assignment</em>
                                </MenuItem>
                                {users
                                    .filter((u) => u.role === 'Artisan')
                                    .map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{width: 24, height: 24, fontSize: 12}}>
                                                    {user.firstName[0]}
                                                    {user.lastName[0]}
                                                </Avatar>
                                                <span>
                                                    {user.firstName} {user.lastName}
                                                </span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Cancellation Reason */}
                    {newStatus === 'CANCELLED' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Cancellation Reason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation..."
                            required
                            error={newStatus === 'CANCELLED' && !cancellationReason}
                            helperText={
                                newStatus === 'CANCELLED' && !cancellationReason
                                    ? 'Cancellation reason is required'
                                    : ''
                            }
                        />
                    )}

                    {/* Status Change Warning */}
                    {newStatus && newStatus !== order.status && (
                        <Alert
                            severity={
                                newStatus === 'CANCELLED'
                                    ? 'error'
                                    : newStatus === 'COMPLETED'
                                        ? 'success'
                                        : 'info'
                            }
                            icon={
                                newStatus === 'CANCELLED' ? (
                                    <WarningIcon/>
                                ) : newStatus === 'COMPLETED' ? (
                                    <CheckCircleIcon/>
                                ) : (
                                    <InfoIcon/>
                                )
                            }
                        >
                            {newStatus === 'CANCELLED' && 'This action cannot be easily undone. The order will be marked as cancelled.'}
                            {newStatus === 'COMPLETED' && 'This will mark the order as fulfilled and record the completion time.'}
                            {newStatus === 'IN_PROGRESS' && 'The order will be marked as actively being worked on.'}
                            {newStatus === 'RETURNED' && 'This will process the order as a return.'}
                            {newStatus === 'PENDING' && 'The order will be reset to pending status.'}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{px: 3, py: 2}}>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color={getStatusColor(newStatus) || 'primary'}
                    disabled={
                        newStatus === order.status ||
                        (newStatus === 'CANCELLED' && !cancellationReason)
                    }
                    startIcon={getStatusIcon(newStatus)}
                >
                    Update Status
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StatusChangeDialog;