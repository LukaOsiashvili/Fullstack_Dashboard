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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Close as CloseIcon,
    ContentCut as CutIcon,
} from '@mui/icons-material';

const AssignCuttingDialog = ({
                                 open,
                                 onClose,
                                 selectedOrder,
                                 users,
                                 onAssign,
                             }) => {
    const theme = useTheme();

    const cuttingSpecialists = users.filter(u => u.role === 'Cutting Specialist');

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
                    {cuttingSpecialists.map(user => (
                        <ListItem
                            key={user._id}
                            component={Paper}
                            variant="outlined"
                            sx={{
                                mb: 1,
                                cursor: 'pointer',
                                backgroundColor: alpha(theme.palette.primary.main, 0.5),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                            }}
                            onClick={() => onAssign(user._id)}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                    {user.firstName[0]}{user.lastName[0]}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={`${user.firstName} ${user.lastName}`}
                                secondary={user.role}
                            />
                        </ListItem>
                    ))}
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