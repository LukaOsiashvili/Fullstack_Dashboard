import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    useTheme,
    styled,
    Paper,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Fade,
    Chip,
    Badge,
    Alert,
    Collapse,
    InputAdornment,
    Skeleton, alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Edit as EditIcon,
    CloudDone as CloudDoneRoundedIcon,
    Person as PersonIcon,
    CalendarMonth as CalendarIcon,
    AlternateEmail as UsernameIcon,
    Badge as BadgeIcon,
    PhotoCamera as PhotoCameraIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Lock as LockIcon,
    Email as EmailIcon,
    Verified as VerifiedIcon,
    History as HistoryIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
    useGetAvatarQuery,
    useGetUserInfoQuery,
    useUpdateUserInfoMutation,
    useUploadAvatarMutation,
} from '../../state/apis/api';
import Header from '../../components/Header';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════
   VALIDATION SCHEMA
   ═══════════════════════════════════════════════ */

const profileSchema = yup.object().shape({
    firstName: yup
        .string()
        .trim()
        .min(2, 'At least 2 characters')
        .required('First name is required'),
    lastName: yup
        .string()
        .trim()
        .min(2, 'At least 2 characters')
        .required('Last name is required'),
    username: yup
        .string()
        .trim()
        .min(3, 'At least 3 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores')
        .required('Username is required'),
    dob: yup
        .date()
        .nullable()
        .typeError('Please select a valid date')
        .required('Date of birth is required'),
});

const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup
        .string()
        .min(8, 'At least 8 characters')
        .matches(/[A-Z]/, 'Must contain an uppercase letter')
        .matches(/[0-9]/, 'Must contain a number')
        .required('New password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

/* ═══════════════════════════════════════════════
   STYLED COMPONENTS
   ═══════════════════════════════════════════════ */

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const OnlineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': { transform: 'scale(.8)', opacity: 1 },
        '100%': { transform: 'scale(2.4)', opacity: 0 },
    },
}));

/* ═══════════════════════════════════════════════
   HELPER — lightweight alpha replacement
   ═══════════════════════════════════════════════ */

const a = (color, opacity) =>
    color?.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`) ?? `rgba(0,0,0,${opacity})`;

/* ═══════════════════════════════════════════════
   SMALL REUSABLE PIECES
   ═══════════════════════════════════════════════ */

const StatCard = ({ icon, label, value, color = 'primary' }) => {
    const theme = useTheme();
    const background = theme.palette[color]?.main ?? theme.palette.primary.main;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(background, 0.8),
                border: `1px solid ${alpha(background, 0.2)}`,
            }}
        >
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette[color].light, 1), color: theme.palette.grey[50]}}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};

const FieldWrapper = ({ icon, label, required = false, children }) => (
    <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Avatar
                sx={{
                    width: 24,
                    height: 24,
                    bgcolor: 'action.hover',
                    color: 'secondary.main',
                }}
            >
                {icon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                {label}
                {required && (
                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                        *
                    </Box>
                )}
            </Typography>
        </Stack>
        {children}
    </Box>
);

const QuickInfoItem = ({ icon, label, value }) => {
    const theme = useTheme();

    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.35),
                }}
            >
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                    {value || '—'}
                </Typography>
            </Box>
        </Stack>
    );
};

/* ═══════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════ */

const ProfileSkeleton = () => {
    const theme = useTheme();
    const card = {
        p: 3,
        borderRadius: 3,
        bgcolor: theme.palette.background.alt,
        border: `1px solid ${theme.palette.divider}`,
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={card}>
                        <Stack alignItems="center" spacing={2}>
                            <Skeleton variant="circular" width={140} height={140} />
                            <Skeleton variant="text" width={150} height={32} />
                            <Skeleton variant="text" width={100} height={24} />
                            <Skeleton variant="rounded" width="100%" height={44} />
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={card}>
                        <Stack spacing={3}>
                            <Skeleton variant="text" width={200} height={32} />
                            <Grid container spacing={2}>
                                {[...Array(4)].map((_, i) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                        <Skeleton variant="rounded" height={56} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const ChangePasswordDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        resolver: yupResolver(passwordSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (values) => {
        console.log('Password Change Payload:', {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Password changed successfully! (test)');
        handleClose();
    };

    const handleClose = () => {
        reset();
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        onClose();
    };

    const PasswordField = ({ name, label, show, setShow }) => (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    fullWidth
                    type={show ? 'text' : 'password'}
                    variant="outlined"
                    label={label}
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                        input: {
                            sx: { borderRadius: 2 },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShow((p) => !p)}
                                        edge="end"
                                        size="small"
                                    >
                                        {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            )}
        />
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            // sx: {{ borderRadius: 3, bgcolor: theme.palette.background.default }}
        >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: theme.palette.warning.main,}}>
                            <LockIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Change Password</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enter your current password and choose a new one
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{backgroundColor: theme.palette.primary[600]}}>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <PasswordField name="currentPassword" label="Current Password" show={showCurrent} setShow={setShowCurrent} />
                        <Divider><Chip label="New Password" size="small" /></Divider>
                        <PasswordField name="newPassword" label="New Password" show={showNew} setShow={setShowNew} />
                        <PasswordField name="confirmPassword" label="Confirm New Password" show={showConfirm} setShow={setShowConfirm} />
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Password must be at least 8 characters with one uppercase letter and one number.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1, backgroundColor: theme.palette.primary[600] }}>
                    <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSubmitting}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="warning" disabled={isSubmitting}
                            startIcon={isSubmitting ? null : <LockIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const UserInfo = () => {
    const theme = useTheme();

    /* ── API hooks ── */
    const { data, isLoading } = useGetUserInfoQuery();
    const [updateUser] = useUpdateUserInfoMutation();
    const { data: avatarData, isLoading: avatarLoading } = useGetAvatarQuery();
    const [uploadAvatar] = useUploadAvatarMutation();
    const avatar = avatarData?.image || '';

    /* ── Local state ── */
    const [editing, setEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    /* ── React Hook Form ── */
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            dob: null,
        },
        resolver: yupResolver(profileSchema),
        mode: 'onBlur', // validate when user leaves a field
    });

    // Watch values for live preview in sidebar
    const watchedValues = watch();

    /* ── Populate form when API data arrives ── */
    useEffect(() => {
        if (data) {
            reset({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                username: data.username || '',
                dob: data.dob ? dayjs(data.dob.split('T')[0]).toDate() : null,
            });
        }
    }, [data, reset]);

    /* ── Cleanup blob URLs ── */
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    /* ── File handlers ── */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5 MB');
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleCancel = () => {
        setEditing(false);
        clearFile();
        reset(); // revert to last saved values
    };

    /* ── Submit ── */
    const onSubmit = async (values) => {
        try {
            await updateUser(values).unwrap();

            if (selectedFile) {
                await uploadAvatar(selectedFile).unwrap();
                toast.success('Profile updated with new avatar!');
            } else {
                toast.success('Profile updated successfully!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile');
        } finally {
            setEditing(false);
            clearFile();
        }
    };

    /* ── Helpers ── */
    const getAccountAge = () => {
        if (!data?.createdAt) return 'N/A';
        const created = dayjs(data.createdAt);
        const now = dayjs();
        const days = now.diff(created, 'day');
        if (days < 30) return `${days} days`;
        const months = now.diff(created, 'month');
        if (months < 12) return `${months} months`;
        const years = now.diff(created, 'year');
        return `${years} year${years > 1 ? 's' : ''}`;
    };

    const canSave = isDirty || !!selectedFile;

    /* ── Shared styles ── */
    const cardSx = {
        p: 3,
        borderRadius: 3,
        bgcolor: theme.palette.background.alt,
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
    };

    /* ═══════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════ */

    if (isLoading) return <ProfileSkeleton />;

    return (
        <Box m="1.5rem 2.5rem">
            <Header
                title="Profile Settings"
                subtitle="Manage your personal information and preferences"
            />

            {data && (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Collapse in={editing}>
                        <Alert
                            severity="info"
                            icon={<InfoIcon />}
                            sx={{
                                my: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.info.main, 0.15),
                                border: `1px solid ${a(theme.palette.info.main, 0.3)}`,
                            }}
                        >
                            You are in edit mode. Make your changes and click{' '}
                            <strong>Save Changes</strong> to update your profile.
                        </Alert>
                    </Collapse>
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            mt: editing ? 0 : 2,
                            alignItems: 'stretch', // ← equal height
                        }}
                    >
                        {/* ─────────── LEFT COLUMN — PROFILE CARD ─────────── */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    ...cardSx,
                                    // position: { md: 'sticky' },
                                    // top: { md: 24 },
                                }}
                            >
                                <Stack alignItems="center" spacing={2} sx={{ height: '100%' }}>
                                    {/* Avatar */}
                                    <Box sx={{ position: 'relative' }}>
                                        {/*<OnlineBadge*/}
                                        {/*    overlap="circular"*/}
                                        {/*    anchorOrigin={{*/}
                                        {/*        vertical: 'bottom',*/}
                                        {/*        horizontal: 'right',*/}
                                        {/*    }}*/}
                                        {/*    variant="dot"*/}
                                        {/*>*/}
                                            <Avatar
                                                src={preview || (avatarLoading ? '' : avatar)}
                                                sx={{
                                                    width: 140,
                                                    height: 140,
                                                    bgcolor: theme.palette.primary.main,
                                                    fontSize: '3rem',
                                                    border: `4px solid ${theme.palette.background.paper}`,
                                                    boxShadow: `0 0 0 4px ${a(theme.palette.primary.main, 0.2)}`,
                                                }}
                                            >
                                                {!avatar && !preview && (
                                                    <Typography variant="h2" fontWeight={600}>
                                                        {data.firstName?.charAt(0)}
                                                        {data.lastName?.charAt(0)}
                                                    </Typography>
                                                )}
                                            </Avatar>
                                        {/*</OnlineBadge>*/}

                                        {/* Camera overlay — only in edit mode */}
                                        <Fade in={editing}>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    transform: 'translate(10%, 10%)',
                                                }}
                                            >
                                                <Tooltip title="Change photo" arrow>
                                                    <IconButton
                                                        component="label"
                                                        sx={{
                                                            bgcolor: theme.palette.secondary.main,
                                                            color: theme.palette.background.alt,
                                                            boxShadow: 2,
                                                            '&:hover': {
                                                                bgcolor: theme.palette.secondary.dark,
                                                            },
                                                        }}
                                                    >
                                                        <PhotoCameraIcon fontSize="small" />
                                                        <VisuallyHiddenInput
                                                            type="file"
                                                            accept="image/*"
                                                            ref={fileRef}
                                                            onChange={handleFileChange}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Fade>
                                    </Box>

                                    {/* Selected file chip */}
                                    <Collapse in={!!selectedFile}>
                                        <Chip
                                            label={selectedFile?.name}
                                            size="small"
                                            color="secondary"
                                            onDelete={clearFile}
                                            icon={<CheckCircleIcon />}
                                            sx={{ maxWidth: 200 }}
                                        />
                                    </Collapse>

                                    {/* Name + username (live preview) */}
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" fontWeight={700}>
                                            {watchedValues.firstName || data.firstName}{' '}
                                            {watchedValues.lastName || data.lastName}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="center"
                                            spacing={0.5}
                                            sx={{ mt: 0.5 }}
                                        >
                                            {/*<Typography variant="body2" color="text.primary">*/}
                                            {/*    @{watchedValues.username || data.username}*/}
                                            {/*</Typography>*/}
                                            {/*<VerifiedIcon*/}
                                            {/*    sx={{ fontSize: 16, color: theme.palette.secondary.main }}*/}
                                            {/*/>*/}
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ width: '100%', my: 1 }} />

                                    {/* Quick info */}
                                    <Box sx={{ width: '100%' }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.primary"
                                            sx={{ mb: 1.5, fontWeight: 600 }}
                                        >
                                            Account Information
                                        </Typography>

                                        <Stack spacing={0.5}>
                                            <QuickInfoItem
                                                icon={<EmailIcon fontSize="small" />}
                                                label="Email"
                                                value={data.email || 'Not set'}
                                            />
                                            <QuickInfoItem
                                                icon={<CalendarIcon fontSize="small" />}
                                                label="Date of Birth"
                                                value={
                                                    watchedValues.dob
                                                        ? dayjs(watchedValues.dob).format('MMM D, YYYY')
                                                        : 'Not set'
                                                }
                                            />
                                            <QuickInfoItem
                                                icon={<HistoryIcon fontSize="small" />}
                                                label="Member For"
                                                value={getAccountAge()}
                                            />
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ width: '100%', my: 1 }} />

                                    <Box sx={{ flexGrow: 1 }} />

                                    {/* Action buttons */}
                                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                                        {!editing ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                onClick={() => setEditing(true)}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    background: theme.palette.primary.main,
                                                }}
                                            >
                                                Edit Profile
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    fullWidth
                                                    type="submit"
                                                    variant="contained"
                                                    color="success"
                                                    disabled={isSubmitting || !canSave}
                                                    startIcon={
                                                        isSubmitting ? null : <CloudDoneRoundedIcon />
                                                    }
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    {isSubmitting ? (
                                                        <CircularProgress size={24} color="inherit" />
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="inherit"
                                                    startIcon={<CancelIcon />}
                                                    onClick={handleCancel}
                                                    disabled={isSubmitting}
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* ─────────── RIGHT COLUMN — FORM ─────────── */}
                        <Grid size={{ xs: 12, md: 9 }}>
                            <Stack spacing={3}>
                                {/* ── Personal Information ── */}
                                <Paper elevation={0} sx={cardSx}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.5}
                                        sx={{ mb: 3 }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: a(theme.palette.secondary.main, 0.15),
                                                // color: 'secondary.main',
                                            }}
                                        >
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700}>
                                                Personal Information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Update your personal details here
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Grid container spacing={2}>
                                        {/* First Name */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FieldWrapper
                                                icon={<BadgeIcon sx={{ fontSize: 14 }} />}
                                                label="First Name"
                                                required
                                            >
                                                <Controller
                                                    name="firstName"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            disabled={!editing}
                                                            variant="outlined"
                                                            placeholder="Enter your first name"
                                                            error={!!error}
                                                            helperText={error?.message}
                                                            slotProps={{
                                                                input: { sx: { borderRadius: 2 } },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FieldWrapper>
                                        </Grid>

                                        {/* Last Name */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FieldWrapper
                                                icon={<BadgeIcon sx={{ fontSize: 14 }} />}
                                                label="Last Name"
                                                required
                                            >
                                                <Controller
                                                    name="lastName"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            disabled={!editing}
                                                            variant="outlined"
                                                            placeholder="Enter your last name"
                                                            error={!!error}
                                                            helperText={error?.message}
                                                            slotProps={{
                                                                input: { sx: { borderRadius: 2 } },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FieldWrapper>
                                        </Grid>

                                        {/* Username */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FieldWrapper
                                                icon={<UsernameIcon sx={{ fontSize: 14 }} />}
                                                label="Username"
                                                required
                                            >
                                                <Controller
                                                    name="username"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            disabled={!editing}
                                                            variant="outlined"
                                                            placeholder="Choose a username"
                                                            error={!!error}
                                                            helperText={error?.message}
                                                            slotProps={{
                                                                input: {
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Typography color="text.secondary">
                                                                                @
                                                                            </Typography>
                                                                        </InputAdornment>
                                                                    ),
                                                                    sx: { borderRadius: 2 },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FieldWrapper>
                                        </Grid>

                                        {/* Date of Birth */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FieldWrapper
                                                icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                                                label="Date of Birth"
                                                required
                                            >
                                                <Controller
                                                    name="dob"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                disabled={!editing}
                                                                value={
                                                                    field.value
                                                                        ? dayjs(field.value)
                                                                        : null
                                                                }
                                                                disableFuture
                                                                onChange={(v) =>
                                                                    field.onChange(
                                                                        v?.toDate() || null
                                                                    )
                                                                }
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        variant: 'outlined',
                                                                        placeholder:
                                                                            'Select your birth date',
                                                                        error: !!error,
                                                                        helperText: error?.message,
                                                                        onBlur: field.onBlur,
                                                                        slotProps: {
                                                                            input: {
                                                                                sx: { borderRadius: 2 },
                                                                            },
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    )}
                                                />
                                            </FieldWrapper>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* ── Account Security ── */}
                                <Paper elevation={0} sx={cardSx}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.5}
                                        sx={{ mb: 3 }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: a(theme.palette.warning.main, 0.15),
                                                // color: 'warning.main',
                                            }}
                                        >
                                            <LockIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700}>
                                                Account Security
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Manage your password and security settings
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={2}
                                        alignItems={{ sm: 'center' }}
                                        justifyContent="space-between"
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            border: `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Password
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Last changed: Never
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<LockIcon />}
                                            onClick={() => setPasswordDialogOpen(true)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Change Password
                                        </Button>
                                    </Stack>
                                </Paper>

                                {/* ── Account Overview ── */}
                                <Paper elevation={0} sx={cardSx}>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                                        Account Overview
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <StatCard
                                                icon={<HistoryIcon sx={{fontSize: 25}} />}
                                                label="Member For"
                                                value={getAccountAge()}
                                                color="primary"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <StatCard
                                                icon={<VerifiedIcon sx={{fontSize: 25}} />}
                                                label="Status"
                                                value="Verified"
                                                color="success"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <StatCard
                                                icon={<PersonIcon sx={{fontSize: 25}} />}
                                                label="Role"
                                                value={data.role || 'User'}
                                                color="info"
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            )}

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
            />
        </Box>
    );
};

export default UserInfo;