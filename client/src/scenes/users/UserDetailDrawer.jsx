import React, {memo} from 'react';
import {
    Avatar,
    Box,
    Button,
    Badge,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,

    ListItemText,
    ListItemIcon,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    Close as CloseIcon,
    ContentCopy as CopyIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    Circle as CircleIcon,
    Shield as ShieldIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Cake as CakeIcon,
    Notes as NotesIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    FiberNew as NewIcon,
    AdminPanelSettings as AdminIcon,
    PointOfSale as SalesIcon,
    Engineering as ProductionIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import {getInitials, ROLE_CONFIG} from './constants';
import {
    formatDate,
    formatDob,
    getAge,
    getAccountAge,
    getSmartTime,
    isOnline,
    isRecentLogin,
    isNewUser,
} from 'utils/dateUtils';

const ROLE_ICONS = {
    admin: AdminIcon,
    sales: SalesIcon,
    laser: ProductionIcon,
    production: ProductionIcon,
};

const UserDetailDrawer = memo(({user, open, onClose, onEdit, onToggleActive}) => {
    const theme = useTheme();

    if (!user) return null;

    const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.production;
    const RoleIcon = ROLE_ICONS[user.role] || ProductionIcon;

    const apiUrl = process.env.REACT_APP_BASE_URL;

    const detailSections = [
        {
            title: 'Personal Information',
            items: [
                {icon: <PersonIcon/>, label: 'Full Name', value: `${user.firstName} ${user.lastName}`},
                {icon: <CakeIcon/>, label: 'Date of Birth', value: `${formatDob(user.dob)} (Age ${getAge(user.dob)})`},
                {icon: <EmailIcon/>, label: 'Email', value: user.email || 'Not set'},
                {icon: <PhoneIcon/>, label: 'Phone', value: user.phone || 'Not set'},
            ],
        },
        {
            title: 'Account Information',
            items: [
                {
                    icon: <ShieldIcon/>,
                    label: 'Role',
                    value: rc.label,
                    chipColor: rc.color
                },
                {
                    icon: <CircleIcon sx={{fontSize: 12}}/>,
                    label: 'Status',
                    value: user.active ? 'Active' : 'Inactive',
                    dotColor: user.active ? '#10b981' : '#ef4444',
                },
                {
                    icon: <CalendarIcon/>,
                    label: 'Account Created',
                    value: `${formatDate(user.createdAt)} (${getAccountAge(user.createdAt)})`
                },
                {
                    icon: <TimeIcon/>,
                    label: 'Last Updated',
                    value: getSmartTime(user.updatedAt)
                },
                {
                    icon: <ScheduleIcon/>,
                    label: 'Last Login',
                    value: user.lastLogin
                        ? `${getSmartTime(user.lastLogin)}${isOnline(user.lastLogin) ? ' (Online)' : ''}`
                        : 'Never logged in',
                    dotColor: user.lastLogin
                        ? isOnline(user.lastLogin) ? '#10b981' : isRecentLogin(user.lastLogin) ? '#f59e0b' : undefined
                        : '#94a3b8',
                },
            ],
        },
    ];

    if (user.notes) {
        detailSections.push({
            title: 'Admin Notes',
            items: [{icon: <NotesIcon/>, label: 'Notes', value: user.notes}],
        });
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: '100%', sm: 440 },
                    },
                },
            }}
        >
            <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.alt}}>
                {/* Header */}
                <Box
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    }}
                >
                    <Typography variant="h6" fontWeight={700} fontSize="1rem" color={theme.palette.secondary.light}>User Profile</Typography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            backgroundColor: alpha(theme.palette.text.primary, 0.05),
                            '&:hover': {backgroundColor: alpha(theme.palette.text.primary, 0.1)}
                        }}
                    >
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{flex: 1, overflow: 'auto', p: 2.5}}>
                    {/* Hero */}
                    <Box sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        mb: 3, p: 3, borderRadius: 4, position: 'relative', overflow: 'hidden',
                        background: `linear-gradient(160deg, ${alpha(rc.color, 0.08)} 0%, transparent 100%)`,
                        border: `1px solid ${alpha(rc.color, 0.1)}`,
                    }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            badgeContent={
                                <Box sx={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    backgroundColor: user.active ? '#10b981' : '#ef4444',
                                    border: `3px solid ${theme.palette.background.default}`,
                                }}/>
                            }
                        >
                            <Avatar
                                src={apiUrl + user.avatarPath}
                                sx={{
                                    width: 88, height: 88, fontSize: '1.75rem', fontWeight: 800,
                                    background: `linear-gradient(135deg, ${alpha(rc.color, 0.25)} 0%, ${alpha(rc.color, 0.1)} 100%)`,
                                    color: rc.color, border: `3px solid ${alpha(rc.color, 0.15)}`,
                                }}
                            >
                                {getInitials(user.firstName, user.lastName)}
                            </Avatar>
                        </Badge>

                        <Typography variant="h5" fontWeight={800} mt={2}>{user.firstName} {user.lastName}</Typography>

                        <Box sx={{display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center'}}>
                            <Chip
                                icon={<RoleIcon sx={{fontSize: 18}}/>}
                                label={rc.label}
                                size="small"
                                sx={{
                                    color: rc.color, backgroundColor: rc.bgColor, fontWeight: 700, fontSize: '0.7rem',
                                    border: `1px solid ${alpha(rc.color, 0.15)}`, '& .MuiChip-icon': {color: rc.color},
                                }}
                            />
                            <Chip
                                label={user.active ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                    color: user.active ? '#10b981' : '#ef4444',
                                    backgroundColor: user.active ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                    fontWeight: 700, fontSize: '0.7rem',
                                }}
                            />
                            {isNewUser(user.createdAt) && (
                                <Chip
                                    icon={<NewIcon sx={{fontSize: 16}}/>}
                                    label="New"
                                    size="small"
                                    sx={{
                                        color: '#6366f1', backgroundColor: alpha('#6366f1', 0.1),
                                        fontWeight: 700, fontSize: '0.7rem', '& .MuiChip-icon': {color: '#6366f1'},
                                    }}
                                />
                            )}
                        </Box>

                        <Typography variant="caption" sx={{
                            mt: 1.5,
                            color: alpha(theme.palette.text.secondary, 0.45),
                            fontSize: '0.65rem',
                            fontWeight: 600
                        }}>
                            Member for {getAccountAge(user.createdAt)} · Joined {formatDate(user.createdAt)}
                        </Typography>
                    </Box>

                    {/* Quick Actions */}
                    <Box sx={{display: 'flex', gap: 1, mb: 3}}>
                        <Button
                            fullWidth variant="outlined" startIcon={<EditIcon/>}
                            onClick={() => {
                                onClose();
                                onEdit(user);
                            }}
                            sx={{
                                py: 1,
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                color: theme.palette.info.main,
                                borderColor: alpha(theme.palette.divider, 0.2),
                                '&:hover': {borderColor: theme.palette.info.main, backgroundColor: alpha(theme.palette.info.main, 0.05), color: theme.palette.info.main},
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            fullWidth variant="outlined"
                            startIcon={user.active ? <BlockIcon/> : <CheckCircleIcon/>}
                            onClick={() => onToggleActive(user)}
                            sx={{
                                borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', py: 1,
                                borderColor: alpha(theme.palette.divider, 0.2),
                                color: user.active ? theme.palette.error.main : theme.palette.success.main,
                                '&:hover': {
                                    borderColor: user.active ? theme.palette.error.main : theme.palette.success.main,
                                    backgroundColor: user.active ? alpha(theme.palette.error.main, 0.05) : alpha(theme.palette.success.main, 0.05),
                                },
                            }}
                        >
                            {user.active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </Box>

                    {/* Sections */}
                    {detailSections.map((section, idx) => (
                        <Box mb={2.5} key={idx}>
                            <Typography variant="overline" sx={{
                                color: alpha(theme.palette.text.secondary, 0.5),
                                fontWeight: 700, letterSpacing: '1.2px', fontSize: '0.65rem', mb: 1, display: 'block',
                            }}>
                                {section.title}
                            </Typography>
                            <Box sx={{
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                            }}>
                                <List disablePadding>
                                    {section.items.map((item, i) => (
                                        <React.Fragment key={i}>
                                            <ListItem
                                                sx={{
                                                    py: 1.25,
                                                    px: 2,
                                                    '&:hover': {backgroundColor: alpha(theme.palette.primary.main, 0.03)}
                                                }}
                                                secondaryAction={
                                                    item.copyable ? (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.value);
                                                                toast.success('Copied!');
                                                            }}
                                                            sx={{opacity: 0.4, '&:hover': {opacity: 1}}}
                                                        >
                                                            <CopyIcon sx={{fontSize: 14}}/>
                                                        </IconButton>
                                                    ) : null
                                                }
                                            >
                                                <ListItemIcon sx={{
                                                    minWidth: 32,
                                                    color: item.dotColor || alpha(theme.palette.text.secondary, 0.4)
                                                }}>
                                                    {React.cloneElement(item.icon, {sx: {fontSize: 16, ...item.icon.props?.sx}})}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="caption" sx={{
                                                            color: alpha(theme.palette.text.secondary, 0.6),
                                                            fontSize: '0.65rem',
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                        }}>{item.label}</Typography>
                                                    }
                                                    secondary={
                                                        item.chipColor ? (
                                                            <Chip label={item.value} size="small" sx={{
                                                                mt: 0.25,
                                                                height: 22,
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                                color: item.chipColor,
                                                                backgroundColor: alpha(item.chipColor, 0.1),
                                                            }}/>
                                                        ) : (
                                                            <Typography variant="body2" sx={{
                                                                fontWeight: 600, fontSize: '0.825rem',
                                                                color: item.dotColor || theme.palette.text.primary,
                                                            }}>{item.value}</Typography>
                                                        )
                                                    }
                                                />
                                            </ListItem>
                                            {i < section.items.length - 1 &&
                                                <Divider variant="inset" component="li" sx={{opacity: 0.4}}/>}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Drawer>
    );
});

export default UserDetailDrawer;