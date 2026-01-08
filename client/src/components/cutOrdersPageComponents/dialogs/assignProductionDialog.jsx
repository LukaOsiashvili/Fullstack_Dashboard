import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    IconButton,
    Grid,
    Box,
    Avatar,
    Alert,
    Stack,
    Paper,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Close as CloseIcon,
    Factory as FactoryIcon,
    Group as GroupIcon,
} from '@mui/icons-material';

const AssignProductionDialog = ({
                                    open,
                                    onClose,
                                    selectedOrder,
                                    productionGroups,
                                    onAssign,
                                }) => {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Assign to Production Group</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                {selectedOrder && (
                    <Box mb={3}>
                        <Alert severity="info" icon={<FactoryIcon />}>
                            Assigning production for: <strong>{selectedOrder.productName} - {selectedOrder.variantName} ({selectedOrder.quantity} units)</strong>
                        </Alert>
                    </Box>
                )}
                <Typography mb={1.5} variant="subtitle2" gutterBottom>Select Production Group</Typography>
                <Grid container spacing={2}>
                    {productionGroups.map(group => (
                        <Grid size={{ xs: 6 }} key={group}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderColor: 'primary.main',
                                    },
                                }}
                                onClick={() => onAssign(group)}
                            >
                                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 48, height: 48 }}>
                                    <GroupIcon />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={600}>{group}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
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

export default AssignProductionDialog;