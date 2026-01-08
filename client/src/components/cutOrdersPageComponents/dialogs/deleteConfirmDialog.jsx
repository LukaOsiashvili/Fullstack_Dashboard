import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Paper,
    Alert,
    Stack,
    useTheme,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {Delete as DeleteIcon} from '@mui/icons-material';

const DeleteConfirmDialog = ({
                                 open,
                                 onClose,
                                 selectedOrder,
                                 onDelete,
                             }) => {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <DeleteIcon color="error"/>
                    <Typography variant="h6">Delete Cut Order</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                <Typography>
                    Are you sure you want to delete this cut order?
                </Typography>
                {selectedOrder && (
                    <Paper variant="outlined" sx={{p: 2, mt: 2, bgcolor: alpha(theme.palette.error.main, 0.05)}}>
                        <Typography variant="subtitle2">{selectedOrder.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedOrder.variantName} - {selectedOrder.quantity} units
                        </Typography>
                    </Paper>
                )}
                <Alert severity="error" sx={{mt: 2}}>
                    This action cannot be undone.
                </Alert>
            </DialogContent>
            <DialogActions sx={{px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                {/*<Button onClick={onClose}>Cancel</Button>*/}
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
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon/>}
                    onClick={onDelete}
                >
                    <Typography textTransform="none">
                        Delete
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;