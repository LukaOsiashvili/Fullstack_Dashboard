import React, { useState, useEffect } from 'react';
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
    StorefrontRounded as BranchIcon,
    LocationOnRounded as LocationIcon,
    CheckCircleRounded as SubmitIcon,
    RestartAltRounded as ResetIcon,
    CloudUploadRounded as UploadIcon,
    ImageRounded as ImageIcon,
    DeleteRounded as RemoveIcon,
} from '@mui/icons-material';

/* ─────────────────────────────────────
   Validation Schema
   ───────────────────────────────────── */
const branchValidationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Branch name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters'),
    location: Yup.object().shape({
        city: Yup.string().required('City is required'),
        address: Yup.string()
            .required('Address is required')
            .min(5, 'Address must be at least 5 characters'),
    }),
});

/* ─────────────────────────────────────
   Section Header
   ───────────────────────────────────── */
const SectionHeader = ({ icon, label }) => {
    const theme = useTheme();
    return (
        <Box sx={{pt: 2, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5,}}>
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
   Image Upload Section
   ───────────────────────────────────── */
const ImageUploadSection = ({ currentPhotoUrl, imageFile, onFileSelect, onUpload }) => {
    const theme = useTheme();
    const fileInputRef = React.useRef(null);

    const previewUrl = React.useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return currentPhotoUrl || null;
    }, [imageFile, currentPhotoUrl]);

    useEffect(() => {
        return () => {
            if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl);
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
        <Box>
            <SectionHeader icon={<ImageIcon sx={{ fontSize: 16 }} />} label="Branch Photo" />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexDirection: { xs: 'column', sm: 'row' } }}>
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
                        <Box component="img" src={previewUrl} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <ImageIcon sx={{ fontSize: 36, color: alpha(theme.palette.grey[500], 0.25) }} />
                            <Typography sx={{ fontSize: '0.7rem', color: alpha(theme.palette.grey[500], 0.4), fontWeight: 500 }}>
                                No photo
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
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
                            minWidth: 0,
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
                        <UploadIcon sx={{ fontSize: 22, color: theme.palette.grey[400], flexShrink: 0 }} />
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
                            <Typography sx={{ fontSize: '0.68rem', color: theme.palette.grey[500] }}>
                                {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG up to 5MB'}
                            </Typography>
                        </Box>
                    </Box>

                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileChange} />

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
                                boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`,
                                '&:hover': { backgroundColor: theme.palette.secondary[400] },
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
                                        '&:hover': { backgroundColor: alpha('#ef5350', 0.08), borderColor: alpha('#ef5350', 0.2), color: '#ef5350' },
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
   Main Form
   ───────────────────────────────────── */
const BranchFormPopup = ({ open, onClose, mode, cities, initialValues, onSubmit, onImgSubmit, currentPhotoPath }) => {
    const theme = useTheme();
    const [imageFile, setImageFile] = useState(null);
    const apiUrl = process.env.REACT_APP_BASE_URL;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(branchValidationSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        reset(initialValues);
        setImageFile(null);
    }, [initialValues, reset]);

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
                    <Box sx={{ width: 4, height: 22, borderRadius: 2, backgroundColor: theme.palette.secondary.main }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.grey[100] }}>
                        {mode === 'add' ? 'Add Branch' : 'Edit Branch'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: theme.palette.grey[400],
                        transition: 'all 0.2s ease',
                        '&:hover': { color: theme.palette.grey[200], backgroundColor: alpha(theme.palette.grey[500], 0.1) },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {mode === 'edit' && (
                    <ImageUploadSection
                        currentPhotoUrl={currentPhotoPath ? `${apiUrl}${currentPhotoPath}` : null}
                        imageFile={imageFile}
                        onFileSelect={setImageFile}
                        onUpload={handleImgUpload}
                    />
                )}

                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Box sx={{py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Branch Info */}
                        <Box>
                            <SectionHeader icon={<BranchIcon sx={{ fontSize: 16 }} />} label="Branch Info" />
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="filled"
                                        label="Branch Name"
                                        placeholder="e.g. Downtown Store"
                                        required
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                        sx={{ '& .MuiFilledInput-root': { borderRadius: '0.5rem', '&::before, &::after': { borderRadius: '0 0 0.5rem 0.5rem' } } }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Location */}
                        <Box>
                            <SectionHeader icon={<LocationIcon sx={{ fontSize: 16 }} />} label="Location" />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Controller
                                    name="location.city"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            variant="filled"
                                            label="City"
                                            required
                                            error={!!errors.location?.city}
                                            helperText={errors.location?.city?.message}
                                            sx={{ '& .MuiFilledInput-root': { borderRadius: '0.5rem', '&::before, &::after': { borderRadius: '0 0 0.5rem 0.5rem' } } }}
                                        >
                                            {cities && cities.length > 0 ? (
                                                cities.map((city) => (
                                                    <MenuItem key={city} value={city}>{city}</MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>
                                                    <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                                                        No cities available
                                                    </Typography>
                                                </MenuItem>
                                            )}
                                        </TextField>
                                    )}
                                />

                                <Controller
                                    name="location.address"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            variant="filled"
                                            label="Address"
                                            placeholder="e.g. 123 Main Street"
                                            required
                                            error={!!errors.location?.address}
                                            helperText={errors.location?.address?.message}
                                            sx={{ '& .MuiFilledInput-root': { borderRadius: '0.5rem', '&::before, &::after': { borderRadius: '0 0 0.5rem 0.5rem' } } }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Divider sx={{ borderColor: alpha(theme.palette.grey[500], 0.1), mt: 3, mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
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
                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                }}
                            />
                        )}

                        <Button
                            type="button"
                            onClick={() => { reset(initialValues); setImageFile(null); }}
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
                                '&:hover': { backgroundColor: alpha(theme.palette.grey[500], 0.08) },
                                '&.Mui-disabled': { color: alpha(theme.palette.grey[500], 0.3) },
                            }}
                        >
                            Reset
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="contained"
                            startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <SubmitIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                px: 3,
                                py: 0.9,
                                borderRadius: '0.5rem',
                                backgroundColor: theme.palette.secondary.main,
                                color: theme.palette.primary[600],
                                boxShadow: `0 3px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary[400],
                                    boxShadow: `0 5px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': { backgroundColor: alpha(theme.palette.grey[500], 0.2), color: theme.palette.grey[500], boxShadow: 'none' },
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : mode === 'add' ? 'Add Branch' : 'Save Changes'}
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BranchFormPopup;