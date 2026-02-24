import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    useTheme,
    IconButton,
    Skeleton,
    Chip,
    Fade,
    alpha,
    Divider,
    Button,
} from '@mui/material';
import {
    AddCircleRounded as AddCircleRoundedIcon,
    LocationCityRounded as CityIcon,
    ExpandCircleDownRounded as ExpandCircleDownIcon,
    StorefrontRounded as BranchIcon,
    LocationOnRounded as LocationIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import FlexBetween from '../../components/FlexBetween';
import BranchFormPopup from '../../forms/BranchFormPopup';
import {
    useAddBranchMutation,
    useGetBranchCitiesQuery,
    useGetBranchPhotoQuery,
    useLazyGetBranchesByCityQuery,
} from '../../state/apis/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const initialValues = {
    name: '',
    location: {
        city: '',
        address: '',
    },
};

/* ─────────────────────────────────────
   Branch Card Component
   ───────────────────────────────────── */
const BranchCard = ({ _id, name, city, address }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const apiUrl = process.env.REACT_APP_BASE_URL;
    const { data: photo, isLoading: isPhotoLoading } = useGetBranchPhotoQuery(_id);

    const hasValidPhoto = photo?.photoPath && !imgError;

    const initials = name
        ? name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    return (
        <Fade in timeout={600}>
            <Card
                sx={{
                    backgroundImage: 'none',
                    backgroundColor: theme.palette.background.alt,
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    transition:
                        'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important',

                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.secondary.main,
                        borderRadius: '2px 2px 0 0',
                        transition: 'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    },

                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 12px 36px ${alpha(theme.palette.common.black, 0.2)}`,
                        borderColor: alpha(theme.palette.secondary.main, 0.2),
                        '&::after': {
                            width: '85%',
                        },
                    },
                }}
            >
                {/* Image */}
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: 220,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                >
                    {isPhotoLoading ? (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                            sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.06) }}
                        />
                    ) : hasValidPhoto ? (
                        <Box
                            component="img"
                            src={`${apiUrl}${photo.photoPath}`}
                            alt={name}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.primary.main,
                                    0.15
                                )}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '1.7rem',
                                        fontWeight: 700,
                                        color: theme.palette.secondary.main,
                                        letterSpacing: '1px',
                                    }}
                                >
                                    {initials}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* City Chip */}
                    <Chip
                        icon={<LocationIcon sx={{ fontSize: 14 }} />}
                        label={city}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            backgroundColor: alpha(theme.palette.background.alt, 0.88),
                            backdropFilter: 'blur(8px)',
                            color: theme.palette.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            letterSpacing: '0.4px',
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                            '& .MuiChip-icon': { color: theme.palette.secondary.main },
                            '& .MuiChip-label': { px: 0.6 },
                        }}
                    />
                </Box>

                {/* Content */}
                <CardContent sx={{ p: 2, pb: 0.5, flexGrow: 1 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: theme.palette.secondary[700],
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            letterSpacing: '0.8px',
                            lineHeight: 1.5,
                        }}
                    >
                        {city}
                    </Typography>

                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.palette.grey[100],
                            mt: 0.2,
                            mb: 0.5,
                        }}
                    >
                        {name}
                    </Typography>

                    {address && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.grey[400],
                                fontSize: '0.78rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1,
                            }}
                        >
                            {address}
                        </Typography>
                    )}
                </CardContent>

                {/* Actions */}
                <CardActions
                    sx={{
                        px: 2,
                        pb: 1.5,
                        pt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <IconButton
                        onClick={() => navigate(`/branches/details/${_id}`)}
                        sx={{
                            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        <ExpandCircleDownIcon
                            sx={{
                                fontSize: 46,
                                transform: 'rotate(-90deg)',
                                color: theme.palette.secondary.main,
                            }}
                        />
                    </IconButton>
                </CardActions>
            </Card>
        </Fade>
    );
};

/* ─────────────────────────────────────
   Branch Skeleton
   ───────────────────────────────────── */
const BranchSkeleton = () => {
    const theme = useTheme();
    const bg = alpha(theme.palette.grey[500], 0.06);

    return (
        <Card
            sx={{
                backgroundImage: 'none',
                backgroundColor: theme.palette.background.alt,
                borderRadius: '0.75rem',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
        >
            <Skeleton variant="rectangular" height={220} animation="wave" sx={{ backgroundColor: bg }} />
            <CardContent sx={{ p: 2, pb: 0.5 }}>
                <Skeleton variant="text" width="28%" height={12} animation="wave" sx={{ backgroundColor: bg, mb: 0.8 }} />
                <Skeleton variant="text" width="70%" height={22} animation="wave" sx={{ backgroundColor: bg, mb: 0.5 }} />
                <Skeleton variant="text" width="90%" height={14} animation="wave" sx={{ backgroundColor: bg }} />
            </CardContent>
            <CardActions sx={{ px: 2, pb: 1.5, pt: 1, justifyContent: 'flex-end' }}>
                <Skeleton variant="circular" width={46} height={46} animation="wave" sx={{ backgroundColor: bg }} />
            </CardActions>
        </Card>
    );
};

/* ─────────────────────────────────────
   City Section
   ───────────────────────────────────── */
const CitySection = React.forwardRef(({ city, branches }, ref) => {
    const theme = useTheme();
    const branchCount = branches?.length || 0;

    return (
        <Box ref={ref} data-city={city} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 4,
                        height: 26,
                        borderRadius: 2,
                        backgroundColor: theme.palette.secondary.main,
                        flexShrink: 0,
                    }}
                />
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: theme.palette.grey[100], letterSpacing: '0.2px' }}
                >
                    {city}
                </Typography>
                {branchCount > 0 && (
                    <Chip
                        label={branchCount}
                        size="small"
                        sx={{
                            height: 22,
                            minWidth: 28,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                            color: theme.palette.secondary.main,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            '& .MuiChip-label': { px: 0.8 },
                        }}
                    />
                )}
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 2.5,
                }}
            >
                {branches ? (
                    branches.map((branch, index) => (
                        <Box
                            key={branch._id}
                            sx={{
                                animation: `fadeSlideIn 0.45s ease ${index * 0.06}s both`,
                                '@keyframes fadeSlideIn': {
                                    '0%': { opacity: 0, transform: 'translateY(16px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' },
                                },
                            }}
                        >
                            <BranchCard
                                _id={branch._id}
                                name={branch.name}
                                city={branch.location.city}
                                address={branch.location.address}
                            />
                        </Box>
                    ))
                ) : (
                    Array.from({ length: 4 }).map((_, i) => <BranchSkeleton key={i} />)
                )}
            </Box>

            {branches && branches.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 5,
                        px: 2,
                        borderRadius: '0.75rem',
                        backgroundColor: alpha(theme.palette.background.alt, 0.4),
                        border: `1px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                    }}
                >
                    <BranchIcon sx={{ fontSize: 40, color: alpha(theme.palette.grey[500], 0.25), mb: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.grey[500], fontWeight: 500 }}>
                        No branches in this city yet
                    </Typography>
                </Box>
            )}
        </Box>
    );
});

/* ─────────────────────────────────────
   Main Branches Page
   ───────────────────────────────────── */
const Branches = () => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);

    const [addBranch] = useAddBranchMutation();
    const { data: cities, isLoading: isCitiesLoading } = useGetBranchCitiesQuery();
    const [trigger] = useLazyGetBranchesByCityQuery();

    const [loadedBranches, setLoadedBranches] = useState({});
    const sectionRef = useRef({});

    const handleBranchFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await addBranch(values).unwrap();
            const result = await trigger(values.location.city, false).unwrap();
            setLoadedBranches((prev) => ({
                ...prev,
                [values.location.city]: result,
            }));
            resetForm();
            toast.success('Branch added successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add branch');
        } finally {
            setSubmitting(false);
        }
    };

    useMemo(() => {
        if (!cities) return;
        const refs = {};
        cities.forEach((city) => {
            refs[city] = React.createRef();
        });
        sectionRef.current = refs;
    }, [cities]);

    useEffect(() => {
        if (!cities) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const city = entry.target.dataset.city;
                        if (!loadedBranches[city]) {
                            const res = await trigger(city);
                            if (res.data) {
                                setLoadedBranches((prev) => ({ ...prev, [city]: res.data }));
                            }
                        }
                    }
                }
            },
            { rootMargin: '200px' }
        );

        Object.values(sectionRef.current).forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);
                const rect = ref.current.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const city = ref.current.dataset.city;
                    if (!loadedBranches[city]) {
                        trigger(city).then((res) => {
                            if (res.data) {
                                setLoadedBranches((prev) => ({ ...prev, [city]: res.data }));
                            }
                        });
                    }
                }
            }
        });

        return () => observer.disconnect();
    }, [cities, trigger, loadedBranches]);

    const totalBranches = useMemo(() => {
        return Object.values(loadedBranches).reduce(
            (acc, branches) => acc + (branches?.length || 0),
            0
        );
    }, [loadedBranches]);

    return (
        <Box m="1.5rem 2.5rem" pb={4}>
            <FlexBetween sx={{ mb: 0.5 }}>
                <Header title="Branches" subtitle="Manage your branch locations" />
                <Button
                    variant="contained"
                    startIcon={<AddCircleRoundedIcon />}
                    onClick={() => setOpen(true)}
                    sx={{
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.primary[600],
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textTransform: 'none',
                        borderRadius: '0.65rem',
                        px: { xs: 2, sm: 3 },
                        py: 1.2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.35)}`,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            backgroundColor: theme.palette.secondary[400],
                            boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.45)}`,
                            transform: 'translateY(-1px)',
                        },
                        '&:active': { transform: 'translateY(0)' },
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Add Branch
                    </Box>
                </Button>
            </FlexBetween>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                    icon={<BranchIcon sx={{ fontSize: 15 }} />}
                    label={`${totalBranches} Branches`}
                    size="small"
                    sx={{
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.18)}`,
                        '& .MuiChip-icon': { color: theme.palette.secondary.main },
                    }}
                />
                <Chip
                    icon={<CityIcon sx={{ fontSize: 15 }} />}
                    label={`${cities?.length || 0} Cities`}
                    size="small"
                    sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.grey[200],
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        '& .MuiChip-icon': { color: theme.palette.grey[300] },
                    }}
                />
            </Box>

            <Divider sx={{ borderColor: alpha(theme.palette.grey[500], 0.1), mb: 4 }} />

            {isCitiesLoading ? (
                <Box>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Box key={i} sx={{ mb: 5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Skeleton variant="rounded" width={4} height={26} animation="wave" sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.08) }} />
                                <Skeleton variant="text" width={140} height={28} animation="wave" sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.08) }} />
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                                {Array.from({ length: 4 }).map((_, j) => <BranchSkeleton key={j} />)}
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <>
                    {cities?.map((city) => (
                        <CitySection
                            key={city}
                            ref={sectionRef.current[city]}
                            city={city}
                            branches={loadedBranches[city]}
                        />
                    ))}

                    {cities?.length === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                            <BranchIcon sx={{ fontSize: 72, mb: 2, color: alpha(theme.palette.grey[500], 0.2) }} />
                            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: theme.palette.grey[300] }}>
                                No branches yet
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.grey[500], mb: 3 }}>
                                Get started by adding your first branch
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleRoundedIcon />}
                                onClick={() => setOpen(true)}
                                sx={{
                                    backgroundColor: theme.palette.secondary.main,
                                    color: theme.palette.primary[600],
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: '0.65rem',
                                    px: 4,
                                    py: 1.2,
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.35)}`,
                                    '&:hover': {
                                        backgroundColor: theme.palette.secondary[400],
                                        boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.45)}`,
                                    },
                                }}
                            >
                                Add Branch
                            </Button>
                        </Box>
                    )}
                </>
            )}

            <BranchFormPopup
                open={open}
                onClose={() => setOpen(false)}
                mode="add"
                cities={cities}
                initialValues={initialValues}
                onSubmit={handleBranchFormSubmit}
            />
        </Box>
    );
};

export default Branches;