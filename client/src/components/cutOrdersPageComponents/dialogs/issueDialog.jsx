import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    IconButton,
    TextField,
    Box,
    Alert,
    Stack,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    ReportProblem as ReportProblemIcon,
} from '@mui/icons-material';

const IssueDialog = ({
                         open,
                         onClose,
                         selectedOrder,
                         onReportIssue,
                     }) => {
    const theme = useTheme();
    const [issueDescription, setIssueDescription] = useState('');

    const handleSubmit = () => {
        if (!issueDescription.trim() || !selectedOrder) return;

        onReportIssue(selectedOrder._id, issueDescription);
        setIssueDescription('');
        onClose();
    };

    const handleClose = () => {
        setIssueDescription('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ReportProblemIcon color="warning"/>
                        <Typography variant="h6">Report Issue</Typography>
                    </Stack>
                    <IconButton onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                {selectedOrder && (
                    <Box mb={3}>
                        <Alert severity="warning">
                            Reporting issue
                            for: <strong>{selectedOrder.productName} - {selectedOrder.variantName}</strong>
                        </Alert>
                    </Box>
                )}
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Issue Description"
                    placeholder="Describe the issue in detail..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                <Button
                    onClick={handleClose}
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
                    color="warning"
                    startIcon={<ReportProblemIcon/>}
                    onClick={handleSubmit}
                    disabled={!issueDescription.trim()}
                >
                    <Typography textTransform="none">
                        Report Issue
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IssueDialog;