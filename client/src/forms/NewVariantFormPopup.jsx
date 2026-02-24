import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    useTheme,
    alpha,
    InputAdornment,
    Divider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from '@mui/material';
import {
    Close as CloseIcon,
    ColorLensRounded as VariantIcon,
    AttachMoneyRounded as PricingIcon,
    CheckCircleRounded as SubmitIcon,
    RestartAltRounded as ResetIcon,
} from '@mui/icons-material';

/* ─────────────────────────────────────
   Validation Schema
   ───────────────────────────────────── */
const variantValidationSchema = Yup.object().shape({
    color: Yup.string()
        .required('Variant name is required')
        .min(2, 'Must be at least 2 characters')
        .max(50, 'Must be under 50 characters'),
    price: Yup.number()
        .positive('Price must be positive')
        .typeError('Must be a valid number')
        .nullable()
        .transform((value, original) => (original === '' ? null : value)),
});

/* ─────────────────────────────────────
   Section Header
   ───────────────────────────────────── */
const SectionHeader = ({ icon, label }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '0.4rem',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                }}
            >
                {icon}
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: theme.palette.grey[200],
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};

/* ─────────────────────────────────────
   New Variant Form Popup
   ───────────────────────────────────── */
const NewVariantFormPopup = ({ open, onClose, mode, initialValues, onSubmit }) => {
    const theme = useTheme();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(variantValidationSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const handleDialogClose = (event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        onClose?.();
    };

    const handleFormSubmit = async (data) => {
        const helpers = {
            setSubmitting: () => {},
            resetForm: () => reset(initialValues),
        };
        await onSubmit(data, helpers);
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: theme.palette.primary[600],
                    backgroundImage: 'none',
                    borderRadius: '0.75rem',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                },
            }}
        >
            {/* Title */}
            <DialogTitle
                sx={{
                    m: 0,
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 22,
                            borderRadius: 2,
                            backgroundColor: theme.palette.secondary.main,
                        }}
                    />
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: theme.palette.grey[100] }}
                    >
                        {mode === 'add' ? 'Add Variant' : 'Edit Variant'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: theme.palette.grey[400],
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            color: theme.palette.grey[200],
                            backgroundColor: alpha(theme.palette.grey[500], 0.1),
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Variant Info */}
                        <Box sx={{ py: 2 }}>
                            <SectionHeader
                                icon={<VariantIcon sx={{ fontSize: 16 }} />}
                                label="Variant Info"
                            />
                            <Controller
                                name="color"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Variant Name"
                                        placeholder="e.g. Red, Blue, Large"
                                        required
                                        error={!!errors.color}
                                        helperText={errors.color?.message}
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                borderRadius: '0.5rem',
                                                '&::before, &::after': {
                                                    borderRadius: '0 0 0.5rem 0.5rem',
                                                },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Pricing */}
                        <Box>
                            <SectionHeader
                                icon={<PricingIcon sx={{ fontSize: 16 }} />}
                                label="Pricing (optional)"
                            />
                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Variant Price"
                                        placeholder="Leave empty to use base price"
                                        type="number"
                                        error={!!errors.price}
                                        helperText={
                                            errors.price?.message ||
                                            'If left empty, the product base price will be used'
                                        }
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: theme.palette.grey[400],
                                                                fontSize: '1rem',
                                                            }}
                                                        >
                                                            ₾
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                            htmlInput: {
                                                min: 0,
                                                step: '0.01',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                borderRadius: '0.5rem',
                                                '&::before, &::after': {
                                                    borderRadius: '0 0 0.5rem 0.5rem',
                                                },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Divider
                        sx={{
                            borderColor: alpha(theme.palette.grey[500], 0.1),
                            mt: 3,
                            mb: 2,
                        }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        {isDirty && (
                            <Chip
                                label="Unsaved changes"
                                size="small"
                                sx={{
                                    mr: 'auto',
                                    height: 24,
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    border: `1px solid ${alpha(
                                        theme.palette.secondary.main,
                                        0.2
                                    )}`,
                                }}
                            />
                        )}

                        <Button
                            type="button"
                            onClick={() => reset(initialValues)}
                            disabled={!isDirty || isSubmitting}
                            startIcon={<ResetIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                color: theme.palette.grey[300],
                                px: 2.5,
                                py: 0.9,
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                },
                                '&.Mui-disabled': {
                                    color: alpha(theme.palette.grey[500], 0.3),
                                },
                            }}
                        >
                            Reset
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="contained"
                            startIcon={
                                isSubmitting ? (
                                    <CircularProgress size={18} sx={{ color: 'inherit' }} />
                                ) : (
                                    <SubmitIcon sx={{ fontSize: 18 }} />
                                )
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                px: 3,
                                py: 0.9,
                                borderRadius: '0.5rem',
                                backgroundColor: theme.palette.secondary.main,
                                color: theme.palette.primary[600],
                                boxShadow: `0 3px 12px ${alpha(
                                    theme.palette.secondary.main,
                                    0.3
                                )}`,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary[400],
                                    boxShadow: `0 5px 16px ${alpha(
                                        theme.palette.secondary.main,
                                        0.4
                                    )}`,
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': {
                                    backgroundColor: alpha(theme.palette.grey[500], 0.2),
                                    color: theme.palette.grey[500],
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {isSubmitting
                                ? 'Adding...'
                                : mode === 'add'
                                    ? 'Add Variant'
                                    : 'Save Changes'}
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NewVariantFormPopup;