import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    IconButton,
    Box,
    Avatar,
    Alert,
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    ContentCut as CutIcon,
} from '@mui/icons-material';
import {useGetUsersByRolesQuery} from "../../../state/apis/api";

const AssignCuttingDialog = ({
                                 open,
                                 onClose,
                                 selectedOrder,
                                 onAssign,
                             }) => {
    const theme = useTheme();

    const {data: laserWorkers, isLoading: isLaserWorkersLoading, fetching: isLaserWorkersFetching} = useGetUsersByRolesQuery(["laser"]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Assign Cutting Operator</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                {selectedOrder && (
                    <Box mb={3}>
                        <Alert severity="info" icon={<CutIcon />}>
                            Assigning cutting for: <strong>{selectedOrder.productName}- {selectedOrder.variantName} ({selectedOrder.quantity} units)</strong>
                        </Alert>
                    </Box>
                )}
                <Typography variant="subtitle2" gutterBottom>Select Cutting Specialist</Typography>
                <List>

                    {!isLaserWorkersLoading && !isLaserWorkersFetching ? (
                        laserWorkers.map(user => (
                            <ListItem
                                key={user._id}
                                component={Paper}
                                variant="outlined"
                                sx={{
                                    mb: 1,
                                    cursor: 'pointer',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                                onClick={() => onAssign(user)}
                            >
                                <ListItemIcon>
                                    <Avatar sx={{ backgroundColor: 'info.main' }}>
                                        {user.firstName[0]}{user.lastName[0]}
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${user.firstName} ${user.lastName}`}
                                    secondary={user.role}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography>
                            Loading...
                        </Typography>
                    )}
                </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, backgroundColor: theme.palette.primary[600] }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{borderColor: theme.palette.primary[300]}}
                >
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                        textTransform="none"
                    >
                        Cancel
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignCuttingDialog;