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
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import {
    AddCircleRounded as AddCircleRoundedIcon,
    Inventory2Rounded as InventoryIcon,
    CategoryRounded as CategoryRoundedIcon,
    ExpandCircleDownRounded as ExpandCircleDownIcon,
    FiberNewRounded as NewIcon,
    ColorLensRounded as VariantsIcon,
    CheckCircleRounded as ActiveIcon,
    CancelRounded as DiscontinuedIcon,
    AllInclusiveRounded as AllIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import FlexBetween from '../../components/FlexBetween';
import ProductFormPopup from '../../forms/ProductFormPopup';
import {
    useAddProductMutation,
    useLazyGetProductsByCategoryQuery,
    useGetCategoriesQuery,
    useGetProductPhotoQuery,
} from '../../state/apis/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const initialValues = {
    name: '',
    category: '',
    description: '',
    basePrice: '',
    cost: '',
};

const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
};

/* ─────────────────────────────────────
   Product Card Component
   ───────────────────────────────────── */
const ProductCard = ({
                         _id,
                         name,
                         price,
                         cost,
                         category,
                         description,
                         variants,
                         createdAt,
                         discontinued,
                     }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const apiUrl = process.env.REACT_APP_BASE_URL;
    const { data: photo, isLoading: isPhotoLoading } = useGetProductPhotoQuery(_id);

    const hasValidPhoto = photo?.photoPath && !imgError;
    const isNew = isNewProduct(createdAt);
    const variantCount = variants?.length || 0;

    const margin =
        cost && price && price > 0
            ? (((price - cost) / price) * 100).toFixed(0)
            : null;

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

                    // Dim discontinued products
                    ...(discontinued && {
                        opacity: 0.6,
                        filter: 'grayscale(40%)',
                    }),

                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0%',
                        height: '2px',
                        backgroundColor: discontinued
                            ? theme.palette.grey[500]
                            : theme.palette.secondary.main,
                        borderRadius: '2px 2px 0 0',
                        transition: 'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    },

                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 12px 36px ${alpha(theme.palette.common.black, 0.2)}`,
                        borderColor: alpha(
                            discontinued
                                ? theme.palette.grey[500]
                                : theme.palette.secondary.main,
                            0.2
                        ),
                        '&::after': {
                            width: '85%',
                        },
                    },
                }}
            >
                {/* Status Badges */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                    }}
                >
                    {isNew && !discontinued && (
                        <Chip
                            icon={<NewIcon sx={{ fontSize: 14 }} />}
                            label="New"
                            size="small"
                            sx={{
                                height: 24,
                                backgroundColor: alpha(theme.palette.secondary.main, 0.92),
                                color: theme.palette.primary[700],
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                letterSpacing: '0.3px',
                                '& .MuiChip-icon': { color: theme.palette.primary[700] },
                                '& .MuiChip-label': { px: 0.6 },
                            }}
                        />
                    )}
                    {discontinued && (
                        <Chip
                            icon={<DiscontinuedIcon sx={{ fontSize: 14 }} />}
                            label="Discontinued"
                            size="small"
                            sx={{
                                height: 24,
                                backgroundColor: alpha('#ef5350', 0.88),
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                letterSpacing: '0.3px',
                                '& .MuiChip-icon': { color: '#fff' },
                                '& .MuiChip-label': { px: 0.6 },
                            }}
                        />
                    )}
                </Box>

                {/* Image Section */}
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
                                transition:
                                    'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
                                    border: `2px solid ${alpha(
                                        theme.palette.secondary.main,
                                        0.2
                                    )}`,
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
                        {category}
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

                    {description && (
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
                            {description}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.5 }}>
                        {variantCount > 0 && (
                            <Chip
                                icon={<VariantsIcon sx={{ fontSize: 13 }} />}
                                label={`${variantCount} variant${variantCount > 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    height: 22,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                    color: theme.palette.grey[300],
                                    fontSize: '0.68rem',
                                    fontWeight: 500,
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                    '& .MuiChip-icon': { color: theme.palette.grey[400] },
                                    '& .MuiChip-label': { px: 0.6 },
                                }}
                            />
                        )}

                        {margin !== null && (
                            <Tooltip title="Profit margin" arrow placement="top">
                                <Chip
                                    label={`${margin}%`}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontWeight: 700,
                                        fontSize: '0.68rem',
                                        cursor: 'default',
                                        backgroundColor:
                                            Number(margin) > 30
                                                ? alpha('#4caf50', 0.12)
                                                : Number(margin) > 15
                                                    ? alpha(theme.palette.secondary[500], 0.12)
                                                    : alpha('#ef5350', 0.12),
                                        color:
                                            Number(margin) > 30
                                                ? '#66bb6a'
                                                : Number(margin) > 15
                                                    ? theme.palette.secondary[500]
                                                    : '#ef5350',
                                        border: `1px solid ${
                                            Number(margin) > 30
                                                ? alpha('#4caf50', 0.2)
                                                : Number(margin) > 15
                                                    ? alpha(theme.palette.secondary[500], 0.2)
                                                    : alpha('#ef5350', 0.2)
                                        }`,
                                        '& .MuiChip-label': { px: 0.6 },
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                </CardContent>

                {/* Card Actions */}
                <CardActions
                    sx={{
                        px: 2,
                        pb: 1.5,
                        pt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: discontinued
                                    ? theme.palette.grey[400]
                                    : theme.palette.secondary.main,
                                letterSpacing: '-0.3px',
                                ...(discontinued && {
                                    textDecoration: 'line-through',
                                }),
                            }}
                        >
                            ₾{Number(price).toFixed(2)}
                        </Typography>
                        {cost > 0 && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.grey[500],
                                    fontSize: '0.7rem',
                                }}
                            >
                                Cost: ₾{Number(cost).toFixed(2)}
                            </Typography>
                        )}
                    </Box>

                    <IconButton
                        onClick={() => navigate(`/products/details/${_id}`)}
                        sx={{
                            transition:
                                'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
                                color: discontinued
                                    ? theme.palette.grey[500]
                                    : theme.palette.secondary.main,
                            }}
                        />
                    </IconButton>
                </CardActions>
            </Card>
        </Fade>
    );
};

/* ─────────────────────────────────────
   Product Skeleton
   ───────────────────────────────────── */
const ProductSkeleton = () => {
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
            <Skeleton
                variant="rectangular"
                height={220}
                animation="wave"
                sx={{ backgroundColor: bg }}
            />
            <CardContent sx={{ p: 2, pb: 0.5 }}>
                <Skeleton
                    variant="text"
                    width="28%"
                    height={12}
                    animation="wave"
                    sx={{ backgroundColor: bg, mb: 0.8 }}
                />
                <Skeleton
                    variant="text"
                    width="70%"
                    height={22}
                    animation="wave"
                    sx={{ backgroundColor: bg, mb: 0.5 }}
                />
                <Skeleton
                    variant="text"
                    width="95%"
                    height={14}
                    animation="wave"
                    sx={{ backgroundColor: bg }}
                />
                <Skeleton
                    variant="text"
                    width="60%"
                    height={14}
                    animation="wave"
                    sx={{ backgroundColor: bg, mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                    <Skeleton
                        variant="rounded"
                        width={80}
                        height={22}
                        animation="wave"
                        sx={{ backgroundColor: bg, borderRadius: '11px' }}
                    />
                    <Skeleton
                        variant="rounded"
                        width={40}
                        height={22}
                        animation="wave"
                        sx={{ backgroundColor: bg, borderRadius: '11px' }}
                    />
                </Box>
            </CardContent>
            <CardActions
                sx={{ px: 2, pb: 1.5, pt: 1, justifyContent: 'space-between' }}
            >
                <Box>
                    <Skeleton
                        variant="text"
                        width={65}
                        height={28}
                        animation="wave"
                        sx={{ backgroundColor: bg }}
                    />
                    <Skeleton
                        variant="text"
                        width={50}
                        height={14}
                        animation="wave"
                        sx={{ backgroundColor: bg }}
                    />
                </Box>
                <Skeleton
                    variant="circular"
                    width={46}
                    height={46}
                    animation="wave"
                    sx={{ backgroundColor: bg }}
                />
            </CardActions>
        </Card>
    );
};

/* ─────────────────────────────────────
   Category Section
   ───────────────────────────────────── */
const CategorySection = React.forwardRef(({ category, products }, ref) => {
    const theme = useTheme();
    const productCount = products?.length || 0;

    return (
        <Box ref={ref} data-category={category} sx={{ mb: 5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
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
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.grey[100],
                        letterSpacing: '0.2px',
                    }}
                >
                    {category}
                </Typography>
                {productCount > 0 && (
                    <Chip
                        label={productCount}
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
                {products ? (
                    products.map((product, index) => (
                        <Box
                            key={product._id}
                            sx={{
                                animation: `fadeSlideIn 0.45s ease ${index * 0.06}s both`,
                                '@keyframes fadeSlideIn': {
                                    '0%': { opacity: 0, transform: 'translateY(16px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' },
                                },
                            }}
                        >
                            <ProductCard
                                _id={product._id}
                                name={product.name}
                                description={product.description}
                                price={product.basePrice}
                                cost={product.cost}
                                category={product.category}
                                variants={product.variants}
                                createdAt={product.createdAt}
                                discontinued={product.discontinued}
                            />
                        </Box>
                    ))
                ) : (
                    Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                )}
            </Box>

            {products && products.length === 0 && (
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
                    <InventoryIcon
                        sx={{
                            fontSize: 40,
                            color: alpha(theme.palette.grey[500], 0.25),
                            mb: 1,
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{ color: theme.palette.grey[500], fontWeight: 500 }}
                    >
                        No products in this category yet
                    </Typography>
                </Box>
            )}
        </Box>
    );
});

/* ─────────────────────────────────────
   Status Filter Options
   ───────────────────────────────────── */
const STATUS_OPTIONS = [
    {
        value: 'active',
        label: 'Active',
        icon: <ActiveIcon sx={{ fontSize: 18 }} />,
    },
    {
        value: 'discontinued',
        label: 'Discontinued',
        icon: <DiscontinuedIcon sx={{ fontSize: 18 }} />,
    },
    {
        value: 'all',
        label: 'All',
        icon: <AllIcon sx={{ fontSize: 18 }} />,
    },
];

/* ─────────────────────────────────────
   Main Products Page
   ───────────────────────────────────── */
const Products = () => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('active');

    const [addProduct] = useAddProductMutation();
    const {
        data: categories,
        isLoading: isCategoriesLoading,
        isFetching: isCategoriesFetching,
    } = useGetCategoriesQuery(statusFilter);
    const [trigger] = useLazyGetProductsByCategoryQuery();

    const [loadedProducts, setLoadedProducts] = useState({});
    const sectionRef = useRef({});

    // Reset loaded products when status filter changes
    useEffect(() => {
        setLoadedProducts({});
    }, [statusFilter]);

    const handleStatusChange = (event, newStatus) => {
        if (newStatus !== null) {
            setStatusFilter(newStatus);
        }
    };

    const handleProductFormSubmit = async (
        values,
        { setSubmitting, resetForm }
    ) => {
        try {
            await addProduct(values).unwrap();
            const result = await trigger(
                { category: values.category, status: statusFilter },
                false
            ).unwrap();
            setLoadedProducts((prev) => ({
                ...prev,
                [values.category]: result,
            }));
            toast.success('Product added successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add product');
        } finally {
            setSubmitting(false);
            resetForm();
        }
    };

    useMemo(() => {
        if (!categories) return;
        const refs = {};
        categories.forEach((cat) => {
            refs[cat] = React.createRef();
        });
        sectionRef.current = refs;
    }, [categories]);

    useEffect(() => {
        if (!categories) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const cat = entry.target.dataset.category;
                        if (!loadedProducts[cat]) {
                            const res = await trigger({
                                category: cat,
                                status: statusFilter,
                            });
                            if (res.data) {
                                setLoadedProducts((prev) => ({
                                    ...prev,
                                    [cat]: res.data,
                                }));
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
                    const cat = ref.current.dataset.category;
                    if (!loadedProducts[cat]) {
                        trigger({ category: cat, status: statusFilter }).then(
                            (res) => {
                                if (res.data) {
                                    setLoadedProducts((prev) => ({
                                        ...prev,
                                        [cat]: res.data,
                                    }));
                                }
                            }
                        );
                    }
                }
            }
        });

        return () => observer.disconnect();
    }, [categories, trigger, loadedProducts, statusFilter]);

    const totalProducts = useMemo(() => {
        return Object.values(loadedProducts).reduce(
            (acc, products) => acc + (products?.length || 0),
            0
        );
    }, [loadedProducts]);

    return (
        <Box m="1.5rem 2.5rem" pb={4}>
            {/* Header */}
            <FlexBetween sx={{ mb: 0.5 }}>
                <Header title="Products" subtitle="Manage your product catalog" />

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
                        boxShadow: `0 4px 14px ${alpha(
                            theme.palette.secondary.main,
                            0.35
                        )}`,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            backgroundColor: theme.palette.secondary[400],
                            boxShadow: `0 6px 20px ${alpha(
                                theme.palette.secondary.main,
                                0.45
                            )}`,
                            transform: 'translateY(-1px)',
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                        },
                    }}
                >
                    <Box
                        component="span"
                        sx={{ display: { xs: 'none', sm: 'inline' } }}
                    >
                        Add Product
                    </Box>
                </Button>
            </FlexBetween>

            {/* Stats + Status Filter Row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 3,
                    mt: 2,
                }}
            >
                {/* Stats Chips */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                    }}
                >
                    <Chip
                        icon={<InventoryIcon sx={{ fontSize: 15 }} />}
                        label={`${totalProducts} Products`}
                        size="small"
                        sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            border: `1px solid ${alpha(
                                theme.palette.secondary.main,
                                0.18
                            )}`,
                            '& .MuiChip-icon': { color: theme.palette.secondary.main },
                        }}
                    />
                    <Chip
                        icon={<CategoryRoundedIcon sx={{ fontSize: 15 }} />}
                        label={`${categories?.length || 0} Categories`}
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

                {/* Status Toggle */}
                <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={handleStatusChange}
                    size="small"
                    sx={{
                        backgroundColor: alpha(theme.palette.background.alt, 0.6),
                        borderRadius: '0.6rem',
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                        '& .MuiToggleButtonGroup-grouped': {
                            border: 'none',
                            borderRadius: '0.5rem !important',
                            mx: 0.3,
                            my: 0.3,
                            px: 2,
                            py: 0.6,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: theme.palette.grey[400],
                            gap: 0.7,
                            transition: 'all 0.25s ease',

                            '&.Mui-selected': {
                                backgroundColor: alpha(
                                    theme.palette.secondary.main,
                                    0.15
                                ),
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                    backgroundColor: alpha(
                                        theme.palette.secondary.main,
                                        0.2
                                    ),
                                },
                            },

                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[500], 0.08),
                            },
                        },
                    }}
                >
                    {STATUS_OPTIONS.map((option) => (
                        <ToggleButton
                            key={option.value}
                            value={option.value}
                            disableRipple
                        >
                            {option.icon}
                            <Box
                                component="span"
                                sx={{ display: { xs: 'none', sm: 'inline' } }}
                            >
                                {option.label}
                            </Box>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Divider
                sx={{ borderColor: alpha(theme.palette.grey[500], 0.1), mb: 4 }}
            />

            {/* Content */}
            {isCategoriesLoading || isCategoriesFetching ? (
                <Box>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Box key={i} sx={{ mb: 5 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2.5,
                                }}
                            >
                                <Skeleton
                                    variant="rounded"
                                    width={4}
                                    height={26}
                                    animation="wave"
                                    sx={{
                                        backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                    }}
                                />
                                <Skeleton
                                    variant="text"
                                    width={140}
                                    height={28}
                                    animation="wave"
                                    sx={{
                                        backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                    }}
                                />
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
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <ProductSkeleton key={j} />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <>
                    {categories?.map((cat) => (
                        <CategorySection
                            key={cat}
                            ref={sectionRef.current[cat]}
                            category={cat}
                            products={loadedProducts[cat]}
                        />
                    ))}

                    {categories?.length === 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 10,
                            }}
                        >
                            <InventoryIcon
                                sx={{
                                    fontSize: 72,
                                    mb: 2,
                                    color: alpha(theme.palette.grey[500], 0.2),
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 600,
                                    mb: 1,
                                    color: theme.palette.grey[300],
                                }}
                            >
                                {statusFilter === 'discontinued'
                                    ? 'No discontinued products'
                                    : statusFilter === 'active'
                                        ? 'No active products yet'
                                        : 'No products yet'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: theme.palette.grey[500], mb: 3 }}
                            >
                                {statusFilter === 'active'
                                    ? 'Get started by adding your first product'
                                    : 'Try switching the filter above'}
                            </Typography>
                            {statusFilter === 'active' && (
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
                                        boxShadow: `0 4px 14px ${alpha(
                                            theme.palette.secondary.main,
                                            0.35
                                        )}`,
                                        '&:hover': {
                                            backgroundColor: theme.palette.secondary[400],
                                            boxShadow: `0 6px 20px ${alpha(
                                                theme.palette.secondary.main,
                                                0.45
                                            )}`,
                                        },
                                    }}
                                >
                                    Add Product
                                </Button>
                            )}
                        </Box>
                    )}
                </>
            )}

            <ProductFormPopup
                open={open}
                onClose={() => setOpen(false)}
                mode="add"
                categories={categories}
                initialValues={initialValues}
                onSubmit={handleProductFormSubmit}
            />
        </Box>
    );
};

export default Products;