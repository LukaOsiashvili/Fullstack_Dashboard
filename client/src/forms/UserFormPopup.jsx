import React, {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    Dialog,
    IconButton,

    CircularProgress,
    Divider,
    Avatar,
    Chip,
    alpha,
    useTheme,
    useMediaQuery, DialogActions, Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Shield as ShieldIcon,
    Save as SaveIcon,
    RestartAlt as ResetIcon,
} from '@mui/icons-material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'utils/dayjs';
import {ROLE_CONFIG, getInitials} from '../scenes/users/constants';

// ─── Validation Schema ───────────────────────────────────────────────
const userSchema = yup.object().shape({
    firstName: yup
        .string()
        .trim()
        .required('First name is required')
        .min(2, 'At least 2 characters'),
    lastName: yup
        .string()
        .trim()
        .required('Last name is required')
        .min(2, 'At least 2 characters'),
    username: yup
        .string()
        .trim()
        .required('Username is required')
        .min(3, 'At least 3 characters')
        .matches(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots, and underscores'),
    role: yup
        .string()
        .required('Role is required')
        .oneOf(['admin', 'sales', 'laser', 'production'], 'Invalid role'),
    dob: yup
        .date()
        .required('Date of birth is required')
        .max(new Date(), 'Cannot be in the future')
        .typeError('Invalid date'),
});

// ─── Role Options ────────────────────────────────────────────────────
const ROLE_OPTIONS = [
    {value: 'admin', label: 'Admin'},
    {value: 'sales', label: 'Sales'},
    {value: 'laser', label: 'Laser Operator'},
    {value: 'production', label: 'Production'},
];

// ─── Component ───────────────────────────────────────────────────────
const UserFormDialog = ({open, onClose, mode, initialValues, onSubmit}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isEdit = mode === 'edit';

    const apiUrl = process.env.REACT_APP_BASE_URL;

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: {errors, isSubmitting, isDirty},
    } = useForm({
        resolver: yupResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            role: '',
            dob: null,
        },
    });

    useEffect(() => {
        if (open && initialValues) {
            reset({
                firstName: initialValues.firstName || '',
                lastName: initialValues.lastName || '',
                username: initialValues.username || '',
                role: initialValues.role || '',
                dob: initialValues.dob ? dayjs(initialValues.dob) : null,
                ...(initialValues._id && {_id: initialValues._id}),
            });
        }
    }, [open, initialValues, reset]);

    const watchedValues = watch();
    const previewRole = ROLE_CONFIG[watchedValues.role] || null;

    const onFormSubmit = async (data) => {
        const payload = {
            ...data,
            dob: data.dob ? dayjs(data.dob).toDate() : null,
            ...(initialValues?._id && {_id: initialValues._id}),
        };

        if (isEdit) {
            await onSubmit(payload);
        } else {
            await onSubmit(payload, {
                setSubmitting: () => {
                },
                resetForm: () => reset(),
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Prevent closing on backdrop click while submitting
    const handleDialogClose = (event, reason) => {
        if (isSubmitting) return;
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        overflow: 'hidden',
                        backgroundColor: theme.palette.background.default,
                        maxHeight: isMobile ? '100%' : '90vh',
                    },
                },
            }}
        >
            {/* ── Header ──────────────────────────────────────────── */}
            <Box
                sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    backgroundColor: theme.palette.background.alt,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isEdit
                                ? alpha(theme.palette.info.main, 0.1)
                                : alpha(theme.palette.success.main, 0.1),
                            color: isEdit ? theme.palette.info.main : theme.palette.success.main,
                        }}
                    >
                        {isEdit ? <EditIcon/> : <PersonAddIcon/>}
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} fontSize="1rem">
                            {isEdit ? 'Edit User' : 'Add New User'}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{color: alpha(theme.palette.text.secondary, 0.6)}}
                        >
                            {isEdit ? 'Update user information' : 'Create a new user account'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    disabled={isSubmitting}
                    sx={{
                        backgroundColor: alpha(theme.palette.text.primary, 0.05),
                        '&:hover': {backgroundColor: alpha(theme.palette.text.primary, 0.1)},
                    }}
                >
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </Box>

            {/* ── Form Content ────────────────────────────────────── */}
            <Box
                component="form"
                onSubmit={handleSubmit(onFormSubmit)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.alt,
                }}
            >
                <Box sx={{flex: 1, overflow: 'auto', p: 2.5}}>
                    {/* Live Preview */}
                    <Paper
                        elevation={3}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <Avatar
                            src={apiUrl + initialValues?.avatarPath}
                            sx={{
                                width: 48,
                                height: 48,
                                fontSize: '1rem',
                                fontWeight: 800,
                                backgroundColor: previewRole
                                    ? alpha(previewRole.color, 0.15)
                                    : alpha(theme.palette.text.secondary, 0.1),
                                color: previewRole
                                    ? previewRole.color
                                    : theme.palette.text.secondary,
                            }}
                        >
                            {watchedValues.firstName || watchedValues.lastName
                                ? getInitials(watchedValues.firstName, watchedValues.lastName)
                                : <PersonIcon/>}
                        </Avatar>
                        <Box sx={{minWidth: 0, flex: 1}}>
                            <Typography
                                variant="body1"
                                fontWeight={700}
                                noWrap
                                sx={{
                                    color: (watchedValues.firstName || watchedValues.lastName)
                                        ? theme.palette.text.primary
                                        : alpha(theme.palette.text.secondary, 0.4),
                                }}
                            >
                                {watchedValues.firstName || watchedValues.lastName
                                    ? `${watchedValues.firstName} ${watchedValues.lastName}`.trim()
                                    : 'User Name'}
                            </Typography>
                            <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                    color: alpha(theme.palette.text.secondary, 0.5),
                                    fontFamily: 'monospace',
                                }}
                            >
                                @{watchedValues.username || 'username'}
                            </Typography>
                        </Box>
                        {previewRole && (
                            <Chip
                                label={previewRole.label}
                                size="small"
                                sx={{
                                    color: previewRole.color,
                                    backgroundColor: previewRole.bgColor,
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    border: `1px solid ${alpha(previewRole.color, 0.15)}`,
                                }}
                            />
                        )}
                    </Paper>

                    {/* Personal Information */}
                    <Typography
                        variant="overline"
                        sx={{
                            color: alpha(theme.palette.text.secondary, 0.5),
                            fontWeight: 700,
                            letterSpacing: '1.2px',
                            fontSize: '0.65rem',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                        }}
                    >
                        <PersonIcon sx={{fontSize: 14}}/>
                        Personal Information
                    </Typography>

                    <Box sx={{display: 'flex', gap: 2, mb: 2, flexDirection: isMobile ? 'column' : 'row'}}>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="First Name"
                                    placeholder="John"
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                    size="small"
                                />
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Last Name"
                                    placeholder="Doe"
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                    size="small"
                                    // sx={textFieldSx(theme)}
                                />
                            )}
                        />
                    </Box>

                    <Controller
                        name="username"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Username"
                                placeholder="john.doe"
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                size="small"
                            />
                        )}
                    />

                    <Divider sx={{my: 2.5, opacity: 0.3}}/>

                    {/* Role & Details */}
                    <Typography
                        variant="overline"
                        sx={{
                            color: alpha(theme.palette.text.secondary, 0.5),
                            fontWeight: 700,
                            letterSpacing: '1.2px',
                            fontSize: '0.65rem',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                        }}
                    >
                        <ShieldIcon sx={{fontSize: 14}}/>
                        Role & Details
                    </Typography>

                    <Box sx={{display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row'}}>
                        <Controller
                            name="role"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    label="Role"
                                    error={!!errors.role}
                                    helperText={errors.role?.message}
                                    size="small"
                                >
                                    {ROLE_OPTIONS.map((option) => {
                                        const rc = ROLE_CONFIG[option.value];
                                        return (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    py: 1.25,
                                                    '&.Mui-selected': {backgroundColor: alpha(rc.color, 0.08)},
                                                    '&:hover': {backgroundColor: alpha(rc.color, 0.05)},
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: rc.color,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography variant="body2" fontWeight={600}>
                                                    {option.label}
                                                </Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                            )}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="dob"
                                control={control}
                                render={({field}) => (
                                    <DatePicker
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(newValue) => field.onChange(newValue)}
                                        disableFuture
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: 'small',
                                                label: 'Date of Birth',
                                                error: !!errors.dob,
                                                helperText: errors.dob?.message,
                                                onBlur: field.onBlur,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>

                {/* ── Footer Actions ──────────────────────────────── */}
                <DialogActions
                    sx={{
                        p: 2.5,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        display: 'flex',
                        gap: 1.5,
                        backgroundColor: theme.palette.background.alt,
                    }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        startIcon={<ResetIcon/>}
                        onClick={() => reset()}
                        disabled={!isDirty || isSubmitting}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            py: 1.25,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                borderColor: alpha(theme.palette.divider, 0.4),
                                backgroundColor: alpha(theme.palette.text.primary, 0.03),
                            },
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        startIcon={
                            isSubmitting
                                ? <CircularProgress size={18} sx={{color: 'inherit'}}/>
                                : <SaveIcon/>
                        }
                        disabled={isSubmitting}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            py: 1.25,
                            background: isEdit
                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: isEdit
                                ? `0 4px 14px ${alpha('#3b82f6', 0.3)}`
                                : `0 4px 14px ${alpha('#10b981', 0.3)}`,
                            '&:hover': {
                                background: isEdit
                                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            },
                            '&.Mui-disabled': {
                                background: alpha(theme.palette.text.primary, 0.12),
                            },
                        }}
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : isEdit
                                ? 'Save Changes'
                                : 'Create User'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default UserFormDialog;