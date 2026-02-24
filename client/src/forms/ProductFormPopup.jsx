import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
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
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Inventory2Rounded as ProductIcon,
    AttachMoneyRounded as PricingIcon,
    DescriptionRounded as DetailsIcon,
    CheckCircleRounded as SubmitIcon,
    RestartAltRounded as ResetIcon,
    TrendingUpRounded as MarginIcon,
    WarningAmberRounded as WarningIcon,
    CloudUploadRounded as UploadIcon,
    ImageRounded as ImageIcon,
    DeleteRounded as RemoveIcon,
} from '@mui/icons-material';

/* ─────────────────────────────────────
   Validation Schema
   ───────────────────────────────────── */
const productValidationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Product name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters'),
    category: Yup.string().required('Category is required'),
    basePrice: Yup.number()
        .required('Base price is required')
        .positive('Price must be positive')
        .typeError('Must be a valid number'),
    cost: Yup.number()
        .required('Cost is required')
        .positive('Cost must be positive')
        .typeError('Must be a valid number'),
    description: Yup.string().max(
        500,
        'Description must be under 500 characters'
    ),
});

/* ─────────────────────────────────────
   Section Header
   ───────────────────────────────────── */
const SectionHeader = ({ icon, label, children }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
                mt: 0.5,
                flexWrap: 'wrap',
            }}
        >
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

            {children && (
                <Box sx={{ ml: 'auto' }}>
                    {children}
                </Box>
            )}
        </Box>
    );
};

/* ─────────────────────────────────────
   Margin Preview
   ───────────────────────────────────── */
const MarginPreview = ({ basePrice, cost }) => {
    const theme = useTheme();

    const margin = useMemo(() => {
        const p = parseFloat(basePrice);
        const c = parseFloat(cost);
        if (!p || !c || p <= 0) return null;
        return (((p - c) / p) * 100).toFixed(1);
    }, [basePrice, cost]);

    const profit = useMemo(() => {
        const p = parseFloat(basePrice);
        const c = parseFloat(cost);
        if (!p || !c) return null;
        return (p - c).toFixed(2);
    }, [basePrice, cost]);

    if (margin === null) return null;

    const isNegative = Number(margin) < 0;
    const isLow = Number(margin) > 0 && Number(margin) <= 15;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: '0.5rem',
                backgroundColor: isNegative
                    ? alpha('#ef5350', 0.08)
                    : isLow
                        ? alpha(theme.palette.secondary[500], 0.08)
                        : alpha('#4caf50', 0.08),
                border: `1px solid ${
                    isNegative
                        ? alpha('#ef5350', 0.15)
                        : isLow
                            ? alpha(theme.palette.secondary[500], 0.15)
                            : alpha('#4caf50', 0.15)
                }`,
                transition: 'all 0.3s ease',
            }}
        >
            {isNegative ? (
                <WarningIcon sx={{ fontSize: 18, color: '#ef5350' }} />
            ) : (
                <MarginIcon
                    sx={{
                        fontSize: 18,
                        color: isLow ? theme.palette.secondary[500] : '#66bb6a',
                    }}
                />
            )}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',
                            color: theme.palette.grey[400],
                            fontWeight: 500,
                            lineHeight: 1,
                            mb: 0.3,
                        }}
                    >
                        Margin
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: isNegative
                                ? '#ef5350'
                                : isLow
                                    ? theme.palette.secondary[500]
                                    : '#66bb6a',
                        }}
                    >
                        {margin}%
                    </Typography>
                </Box>
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: alpha(theme.palette.grey[500], 0.15) }}
                />
                <Box>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',
                            color: theme.palette.grey[400],
                            fontWeight: 500,
                            lineHeight: 1,
                            mb: 0.3,
                        }}
                    >
                        Profit
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: isNegative
                                ? '#ef5350'
                                : isLow
                                    ? theme.palette.secondary[500]
                                    : '#66bb6a',
                        }}
                    >
                        ₾{profit}
                    </Typography>
                </Box>
            </Box>
            {isNegative && (
                <Typography
                    sx={{ fontSize: '0.68rem', color: '#ef5350', fontWeight: 500, ml: 'auto' }}
                >
                    Selling below cost
                </Typography>
            )}
        </Box>
    );
};

/* ─────────────────────────────────────
   Image Upload Section (edit mode)
   ───────────────────────────────────── */
const ImageUploadSection = ({ currentPhotoUrl, imageFile, onFileSelect, onUpload }) => {
    const theme = useTheme();
    const fileInputRef = React.useRef(null);

    const previewUrl = useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return currentPhotoUrl || null;
    }, [imageFile, currentPhotoUrl]);

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (imageFile) URL.revokeObjectURL(previewUrl);
        };
    }, [imageFile, previewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    const handleRemove = () => {
        onFileSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Box sx={{pt: 2}}>
            <SectionHeader
                icon={<ImageIcon sx={{ fontSize: 16 }} />}
                label="Product Photo"
            />

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'stretch',
                    flexDirection: { xs: 'column', sm: 'row' },
                }}
            >
                {/* Preview */}
                <Box
                    sx={{
                        width: { xs: '100%', sm: 180 },
                        height: 140,
                        flexShrink: 0,
                        borderRadius: '0.6rem',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="Product preview"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <ImageIcon
                                sx={{
                                    fontSize: 36,
                                    color: alpha(theme.palette.grey[500], 0.25),
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    color: alpha(theme.palette.grey[500], 0.4),
                                    fontWeight: 500,
                                }}
                            >
                                No photo
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Upload Controls */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 1.5,
                    }}
                >
                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            px: 2,
                            py: 2,
                            borderRadius: '0.5rem',
                            border: `2px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                            backgroundColor: alpha(theme.palette.background.alt, 0.3),
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: alpha(theme.palette.secondary.main, 0.3),
                                backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                            },
                        }}
                    >
                        <UploadIcon
                            sx={{
                                fontSize: 22,
                                color: theme.palette.grey[400],
                                flexShrink: 0,
                            }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: theme.palette.grey[300],
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {imageFile ? imageFile.name : 'Click to select image'}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.68rem',
                                    color: theme.palette.grey[500],
                                }}
                            >
                                {imageFile
                                    ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                                    : 'JPG, PNG up to 5MB'}
                            </Typography>
                        </Box>
                    </Box>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={handleFileChange}
                    />

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            type="button"
                            onClick={onUpload}
                            disabled={!imageFile}
                            size="small"
                            variant="contained"
                            startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                flex: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderRadius: '0.4rem',
                                py: 0.7,
                                backgroundColor: theme.palette.secondary.main,
                                color: theme.palette.primary[600],
                                boxShadow: `0 2px 8px ${alpha(
                                    theme.palette.secondary.main,
                                    0.3
                                )}`,
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary[400],
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: alpha(theme.palette.grey[500], 0.15),
                                    color: alpha(theme.palette.grey[500], 0.4),
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Upload
                        </Button>

                        {imageFile && (
                            <Tooltip title="Remove selected file" arrow>
                                <IconButton
                                    onClick={handleRemove}
                                    size="small"
                                    sx={{
                                        borderRadius: '0.4rem',
                                        border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`,
                                        color: theme.palette.grey[400],
                                        '&:hover': {
                                            backgroundColor: alpha('#ef5350', 0.08),
                                            borderColor: alpha('#ef5350', 0.2),
                                            color: '#ef5350',
                                        },
                                    }}
                                >
                                    <RemoveIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

/* ─────────────────────────────────────
   Main Form Component
   ───────────────────────────────────── */
const ProductFormPopup = ({
                              open,
                              onClose,
                              mode,
                              categories,
                              initialValues,
                              onSubmit,
                              onImgSubmit,
                              currentPhotoUrl,
                          }) => {
    const theme = useTheme();
    const [imageFile, setImageFile] = useState(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(productValidationSchema),
        mode: 'onBlur',
    });

    // Reset form when initialValues change (edit mode switching products)
    useEffect(() => {
        reset(initialValues);
        setImageFile(null);
    }, [initialValues, reset]);

    const watchBasePrice = watch('basePrice');
    const watchCost = watch('cost');
    const watchDescription = watch('description');
    const descriptionMaxLength = 500;

    const handleDialogClose = (event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        onClose?.();
    };

    const handleFormSubmit = async (data) => {
        const helpers = {
            setSubmitting: () => {},
            resetForm: () => {
                reset(initialValues);
                setImageFile(null);
            },
        };
        await onSubmit(data, helpers);
    };

    const handleImgUpload = () => {
        if (!imageFile) return;
        onImgSubmit(imageFile);
        setImageFile(null);
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="sm"
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
                        {mode === 'add' ? 'Add Product' : 'Edit Product'}
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
                {/* Image Upload — edit mode, top section */}
                {mode === 'edit' && (
                    <ImageUploadSection
                        currentPhotoUrl={currentPhotoUrl}
                        imageFile={imageFile}
                        onFileSelect={setImageFile}
                        onUpload={handleImgUpload}
                    />
                )}

                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Box
                        sx={{
                            py: 2,
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2.5,
                        }}
                    >
                        {/* ── Product Info ── */}
                        <Box
                            sx={{
                                gridColumn: { xs: '1', sm: '1' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <SectionHeader
                                icon={<ProductIcon sx={{ fontSize: 16 }} />}
                                label="Product Info"
                            />

                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Product Name"
                                        placeholder="e.g. Classic Leather Jacket"
                                        required
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
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

                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        variant="filled"
                                        label="Category"
                                        required
                                        error={!!errors.category}
                                        helperText={errors.category?.message}
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                borderRadius: '0.5rem',
                                                '&::before, &::after': {
                                                    borderRadius: '0 0 0.5rem 0.5rem',
                                                },
                                            },
                                        }}
                                    >
                                        {categories && categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <MenuItem key={cat} value={cat}>
                                                    {cat}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: theme.palette.grey[500] }}
                                                >
                                                    No categories available
                                                </Typography>
                                            </MenuItem>
                                        )}
                                    </TextField>
                                )}
                            />
                        </Box>

                        {/* ── Pricing ── */}
                        <Box
                            sx={{
                                gridColumn: { xs: '1', sm: '2' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <SectionHeader
                                icon={<PricingIcon sx={{ fontSize: 16 }} />}
                                label="Pricing"
                            />

                            <Controller
                                name="basePrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Base Price"
                                        placeholder="0.00"
                                        type="number"
                                        required
                                        error={!!errors.basePrice}
                                        helperText={errors.basePrice?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: theme.palette.secondary.main,
                                                                fontSize: '1rem',
                                                            }}
                                                        >
                                                            ₾
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                            htmlInput: { min: 0, step: '0.01' },
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

                            <Controller
                                name="cost"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Cost"
                                        placeholder="0.00"
                                        type="number"
                                        required
                                        error={!!errors.cost}
                                        helperText={errors.cost?.message}
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
                                            htmlInput: { min: 0, step: '0.01' },
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

                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / 3' }}}>
                            <MarginPreview basePrice={watchBasePrice} cost={watchCost} />
                        </Box>

                        {/* ── Description ── */}
                        <Box
                            sx={{
                                gridColumn: { xs: '1', sm: '1 / 3' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            <SectionHeader
                                icon={<DetailsIcon sx={{ fontSize: 16 }} />}
                                label="Description"
                            />

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        multiline
                                        minRows={3}
                                        maxRows={6}
                                        label="Product Description"
                                        placeholder="Describe your product..."
                                        error={!!errors.description}
                                        helperText={errors.description?.message || ' '}
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

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1.5 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color:
                                            (watchDescription?.length || 0) > descriptionMaxLength * 0.9
                                                ? '#ef5350'
                                                : theme.palette.grey[500],
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        transition: 'color 0.2s ease',
                                    }}
                                >
                                    {watchDescription?.length || 0}/{descriptionMaxLength}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* ── Actions ── */}
                    <Divider
                        sx={{
                            borderColor: alpha(theme.palette.grey[500], 0.1),
                            mt: 2,
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
                            onClick={() => {
                                reset(initialValues);
                                setImageFile(null);
                            }}
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
                                ? 'Submitting...'
                                : mode === 'add'
                                    ? 'Add Product'
                                    : 'Save Changes'}
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductFormPopup;