import React, {memo} from 'react';
import {Box, Typography, Button, Avatar, Chip, Dialog, DialogActions, alpha, useTheme} from '@mui/material';
import {Warning as WarningIcon} from '@mui/icons-material';
import {getInitials} from './constants';
import {formatDate, getAccountAge} from 'utils/dateUtils';

const DeleteConfirmDialog = memo(({open, user, onCancel, onConfirm}) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{sx: {borderRadius: 2, overflow: 'hidden'}}}
        >
            <Box
                sx={{
                    p: 4,
                    backgroundColor: theme.palette.background.default,
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: alpha(theme.palette.error.main, 0.08),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2.5,
                    }}
                >
                    <WarningIcon sx={{color: '#ef4444', fontSize: '2rem'}}/>
                </Box>
                <Typography variant="h5" fontWeight={800} mb={1}>Delete User?</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    You're about to permanently remove the user:
                </Typography>
                {user && (
                    <Box mb={2}>
                        <Chip
                            avatar={
                                <Avatar sx={{
                                    backgroundColor: alpha(theme.palette.error.main, 0.15),
                                    color: '#ef4444',
                                    fontWeight: 700,
                                    fontSize: '0.7rem'
                                }}>
                                    {getInitials(user.firstName, user.lastName)}
                                </Avatar>
                            }
                            label={`${user.firstName} ${user.lastName}`}
                            variant="outlined"
                            sx={{fontWeight: 600, borderColor: alpha('#ef4444', 0.2), backgroundColor: alpha('#ef4444', 0.05)}}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                mt: 1,
                                color: alpha(theme.palette.text.secondary, 0.5),
                                fontSize: '0.7rem'
                            }}
                        >
                            Member since {formatDate(user.createdAt)} · {getAccountAge(user.createdAt)} on platform
                        </Typography>
                    </Box>
                )}
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block', color: '#ef4444', fontWeight: 600,
                        backgroundColor: alpha('#ef4444', 0.08), borderRadius: 2,
                        py: 0.75, px: 2, mx: 'auto', width: 'fit-content',
                    }}
                >
                    ⚠ This action cannot be undone
                </Typography>
            </Box>
            <DialogActions
                sx={{
                    p: 2.5,
                    gap: 1.5,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    fullWidth
                    sx={{
                        borderRadius: 2.5, textTransform: 'none', fontWeight: 700, py: 1.25,
                        borderColor: alpha(theme.palette.divider, 0.3), color: theme.palette.text.primary,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    fullWidth
                    sx={{
                        py: 1.25,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        '&:hover': {background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'},
                    }}
                >
                    Yes, Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default DeleteConfirmDialog;