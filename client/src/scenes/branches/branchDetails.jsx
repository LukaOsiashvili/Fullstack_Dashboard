import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    Typography,
    Button,
    useTheme,
    useMediaQuery,
    TextField,
    CircularProgress,
    Chip,
    Tooltip,
    Skeleton,
    alpha,
    Grow,
    Tab,
    Tabs,
} from '@mui/material';
import {
    KeyboardArrowDown,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as DiscardIcon,
    ArrowBackRounded as BackIcon,
    LocationOnRounded as LocationIcon,
    ImageRounded,
    EditRounded,
    PersonRounded as ManagerIcon,
    CheckCircleRounded as ActiveIcon,
    Inventory2Rounded,
} from '@mui/icons-material';
import {
    useGetBranchByIdQuery,
    useGetBranchCitiesQuery,
    useGetBranchPhotoQuery,
    useGetProductInventoryAtBranchMutation,
    useUpdateBranchMutation,
    useUpdateProductInventoryAtBranchMutation,
    useUploadBranchPhotoMutation,
} from '../../state/apis/api';
import FlexBetween from '../../components/FlexBetween';
import Header from '../../components/Header';
import BranchFormPopup from '../../forms/BranchFormPopup';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────
   Info Item
   ───────────────────────────────────── */
const InfoItem = ({ icon: Icon, label, value, children }) => {
    const theme = useTheme();
    if (!value && value !== 0 && !children) return null;

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    sx={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: theme.palette.grey[400],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.3,
                    }}
                >
                    {label}
                </Typography>
                {children || (
                    <Typography
                        sx={{
                            fontSize: '0.92rem',
                            fontWeight: 500,
                            color: theme.palette.grey[100],
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        {value}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

/* ─────────────────────────────────────
   Product Inventory Row
   ───────────────────────────────────── */
const ProductRow = ({ product, branchId }) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [editedVariants, setEditedVariants] = useState([]);
    const [inventoryData, setInventoryData] = useState(null);

    const [trigger] = useGetProductInventoryAtBranchMutation();
    const [updateData] = useUpdateProductInventoryAtBranchMutation();

    const handleToggle = async () => {
        setOpen(!open);
        if (!open && !inventoryData) {
            setIsLoadingData(true);
            try {
                const result = await trigger({ productId: product.productId, branchId }).unwrap();
                setInventoryData(result);
                setEditedVariants(result.variants || []);
            } catch (error) {
                console.error('Failed to load inventory:', error);
                toast.error('Failed to load inventory');
            } finally {
                setIsLoadingData(false);
            }
        }
    };

    const handleQuantityChange = (idx, field, value) => {
        if (!/^\d*$/.test(value)) return;
        const num = Number(value);
        const updated = [...editedVariants];
        updated[idx] = {
            ...updated[idx],
            [field]: num,
            available:
                (field === 'stock' ? num : updated[idx].stock) -
                (field === 'reserved' ? num : updated[idx].reserved),
        };
        setEditedVariants(updated);
    };

    const hasChanges = inventoryData
        ? editedVariants.some(
            (variant, i) =>
                variant.stock !== inventoryData.variants[i]?.stock ||
                variant.reserved !== inventoryData.variants[i]?.reserved
        )
        : false;

    const handleSaveChanges = async () => {
        if (!inventoryData || !hasChanges) return;
        setIsEditing(false);

        const changedVariants = editedVariants
            .filter(
                (variant, i) =>
                    variant.stock !== inventoryData.variants[i].stock ||
                    variant.reserved !== inventoryData.variants[i].reserved
            )
            .map((variant) => ({
                variantId: variant.variantId,
                stock: variant.stock,
                reserved: variant.reserved,
            }));

        try {
            await updateData({
                branchId,
                productId: product.productId,
                changes: changedVariants,
            });
            const result = await trigger({ productId: product.productId, branchId }).unwrap();
            setInventoryData(result);
            setEditedVariants(result.variants || []);
            toast.success('Inventory updated');
        } catch (error) {
            toast.error('Failed to update inventory');
        }
    };

    const handleDiscardChanges = () => {
        if (!inventoryData) return;
        setEditedVariants(inventoryData.variants || []);
        setIsEditing(false);
    };

    return (
        <>
            <TableRow
                hover
                sx={{
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: `${alpha(theme.palette.primary.main, 0.06)} !important`,
                    },
                }}
                onClick={handleToggle}
            >
                <TableCell sx={{ width: 50 }}>
                    <IconButton
                        size="small"
                        sx={{
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: theme.palette.secondary.main,
                        }}
                    >
                        <KeyboardArrowDown />
                    </IconButton>
                </TableCell>

                <TableCell>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[100] }}>
                        {product.productName}
                    </Typography>
                </TableCell>

                <TableCell align="right" sx={{ width: 200 }} onClick={(e) => e.stopPropagation()}>
                    {!open ? (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                            disabled
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderRadius: '0.4rem',
                                borderColor: alpha(theme.palette.grey[500], 0.15),
                                color: theme.palette.grey[500],
                            }}
                        >
                            Edit
                        </Button>
                    ) : isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
                                disabled={!hasChanges}
                                onClick={handleSaveChanges}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    borderRadius: '0.4rem',
                                    backgroundColor: theme.palette.secondary.main,
                                    color: theme.palette.primary[600],
                                    '&:hover': { backgroundColor: theme.palette.secondary[400] },
                                    '&.Mui-disabled': {
                                        backgroundColor: alpha(theme.palette.grey[500], 0.15),
                                        color: alpha(theme.palette.grey[500], 0.4),
                                    },
                                }}
                            >
                                Save
                            </Button>
                            <Tooltip title="Discard changes" arrow>
                                <IconButton
                                    size="small"
                                    onClick={handleDiscardChanges}
                                    sx={{
                                        borderRadius: '0.4rem',
                                        border: `1px solid ${alpha('#ef5350', 0.3)}`,
                                        color: '#ef5350',
                                        '&:hover': { backgroundColor: alpha('#ef5350', 0.08) },
                                    }}
                                >
                                    <DiscardIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                            disabled={!inventoryData}
                            onClick={() => setIsEditing(true)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderRadius: '0.4rem',
                                borderColor: alpha(theme.palette.secondary.main, 0.3),
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                    borderColor: theme.palette.secondary.main,
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                                },
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </TableCell>
            </TableRow>

            {/* Collapsible */}
            <TableRow>
                <TableCell colSpan={3} sx={{ p: 0, borderBottom: open ? undefined : 'none' }}>
                    <Collapse in={open} timeout={300}>
                        <Box
                            sx={{
                                mx: 2,
                                my: 2,
                                p: 3,
                                borderRadius: '0.75rem',
                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                border: `1px solid ${alpha(theme.palette.grey[500], 0.06)}`,
                            }}
                        >
                            {isLoadingData ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress size={28} sx={{ color: theme.palette.secondary.main }} />
                                </Box>
                            ) : inventoryData ? (
                                <>
                                    {inventoryData.totals && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: { xs: 3, sm: 5 },
                                                mb: 3,
                                                pb: 2.5,
                                                borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {[
                                                { label: 'Total Stock', value: inventoryData.totals.totalStock, color: theme.palette.grey[100] },
                                                { label: 'Reserved', value: inventoryData.totals.totalReserved, color: theme.palette.secondary[500] },
                                                { label: 'Available', value: inventoryData.totals.totalAvailable, color: inventoryData.totals.totalAvailable > 0 ? '#66bb6a' : '#ef5350' },
                                            ].map((stat) => (
                                                <Box key={stat.label}>
                                                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: theme.palette.grey[400], textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                                                        {stat.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>
                                                        {stat.value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    <Table size="medium">
                                        <TableHead>
                                            <TableRow>
                                                {['Variant', 'Stock', 'Reserved', 'Available'].map((header) => (
                                                    <TableCell
                                                        key={header}
                                                        align={header === 'Variant' ? 'left' : 'right'}
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            color: theme.palette.grey[400],
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            borderBottomColor: alpha(theme.palette.grey[500], 0.1),
                                                            py: 1.5,
                                                        }}
                                                    >
                                                        {header}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {editedVariants && editedVariants.length > 0 ? (
                                                editedVariants.map((variant, idx) => {
                                                    const stockChanged = inventoryData?.variants[idx]?.stock !== variant.stock;
                                                    const reservedChanged = inventoryData?.variants[idx]?.reserved !== variant.reserved;

                                                    return (
                                                        <TableRow
                                                            key={variant.variantId || idx}
                                                            sx={{
                                                                '&:last-child td': { borderBottom: 'none' },
                                                                '& td': { borderBottomColor: alpha(theme.palette.grey[500], 0.06), py: 2 },
                                                                transition: 'background-color 0.2s ease',
                                                                ...(isEditing && (stockChanged || reservedChanged) && {
                                                                    backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                                                                }),
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 14,
                                                                            height: 14,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: variant.color?.toLowerCase() || theme.palette.grey[400],
                                                                            border: `2px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                                                                            flexShrink: 0,
                                                                        }}
                                                                    />
                                                                    <Typography sx={{ fontWeight: 600, color: theme.palette.grey[100], fontSize: '0.9rem' }}>
                                                                        {variant.color}
                                                                    </Typography>
                                                                    {variant.size && (
                                                                        <Chip label={variant.size} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.grey[300] }} />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="text"
                                                                        value={variant.stock}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onChange={(e) => handleQuantityChange(idx, 'stock', e.target.value)}
                                                                        sx={{
                                                                            width: 90,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: '0.4rem',
                                                                                '& input': { textAlign: 'right', py: 1, px: 1.5, fontSize: '0.9rem', fontWeight: 600 },
                                                                                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
                                                                            },
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: theme.palette.grey[200] }}>
                                                                        {variant.stock}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="text"
                                                                        value={variant.reserved}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onChange={(e) => handleQuantityChange(idx, 'reserved', e.target.value)}
                                                                        sx={{
                                                                            width: 90,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: '0.4rem',
                                                                                '& input': { textAlign: 'right', py: 1, px: 1.5, fontSize: '0.9rem', fontWeight: 600 },
                                                                                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
                                                                            },
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: theme.palette.grey[200] }}>
                                                                        {variant.reserved}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.95rem',
                                                                        fontWeight: 700,
                                                                        color: variant.available > 0 ? '#66bb6a' : variant.available === 0 ? theme.palette.grey[400] : '#ef5350',
                                                                    }}
                                                                >
                                                                    {variant.available}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                        <Typography sx={{ color: theme.palette.grey[500], fontSize: '0.85rem' }}>
                                                            No inventory data available
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {isEditing && hasChanges && (
                                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip label="Unsaved changes" size="small" sx={{ height: 22, backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }} />
                                            <Typography sx={{ fontSize: '0.72rem', color: theme.palette.grey[500] }}>
                                                Modified rows are highlighted
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography sx={{ color: theme.palette.grey[500] }}>Click to load inventory data</Typography>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

/* ─────────────────────────────────────
   Branch Details Page
   ───────────────────────────────────── */
const BranchDetails = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isNonMobile = useMediaQuery('(min-width: 1000px)');
    const apiUrl = process.env.REACT_APP_BASE_URL;

    const [isUpdatingBranch, setIsUpdatingBranch] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { id } = useParams();

    const { data: branchData, isLoading } = useGetBranchByIdQuery(id);
    const { data: cities, isLoading: isCitiesLoading } = useGetBranchCitiesQuery();
    const { data: photo, isLoading: isPhotoLoading } = useGetBranchPhotoQuery(id);
    const [updateBranch] = useUpdateBranchMutation();
    const [uploadBranchPhoto] = useUploadBranchPhotoMutation();

    const categories = useMemo(() => {
        if (!branchData?.products) return [];
        return [...new Set(branchData.products.map((p) => p.category))].sort();
    }, [branchData]);

    const handleUpdateBranchFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await updateBranch({ branchId: id, data: values }).unwrap();
            toast.success('Branch updated successfully!');
            resetForm();
            setIsUpdatingBranch(false);
        } catch (error) {
            console.error(error);
            toast.error('Branch update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImgSubmit = async (imageFile) => {
        if (!imageFile) return;
        try {
            await uploadBranchPhoto({ file: imageFile, branchId: id }).unwrap();
            toast.success('Branch photo uploaded successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Branch photo upload failed');
        }
    };

    return (
        <Box m="1.5rem 2.5rem" pb={4}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Tooltip title="Back to branches" arrow>
                    <IconButton
                        onClick={() => navigate('/branches')}
                        sx={{
                            color: theme.palette.grey[300],
                            border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`,
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                borderColor: alpha(theme.palette.grey[500], 0.3),
                            },
                        }}
                    >
                        <BackIcon />
                    </IconButton>
                </Tooltip>
                <Header title="Branch Details" subtitle="View and manage branch information" />
            </Box>

            {/* Branch Info Card */}
            <Grow in timeout={400}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                        backgroundColor: theme.palette.background.alt,
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: isNonMobile ? 'row' : 'column' }}>
                        {/* Image */}
                        <Box
                            sx={{
                                width: isNonMobile ? '40%' : '100%',
                                minHeight: isNonMobile ? 400 : 260,
                                position: 'relative',
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                overflow: 'hidden',
                            }}
                        >
                            {(isPhotoLoading || (!imageLoaded && photo?.photoPath)) && (
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height="100%"
                                    animation="wave"
                                    sx={{ position: 'absolute', top: 0, left: 0, backgroundColor: alpha(theme.palette.grey[500], 0.1) }}
                                />
                            )}

                            {photo?.photoPath ? (
                                <Box
                                    component="img"
                                    src={apiUrl + photo.photoPath}
                                    alt={branchData?.branch?.name}
                                    onLoad={() => setImageLoaded(true)}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: imageLoaded ? 1 : 0,
                                        transition: 'opacity 0.3s ease',
                                    }}
                                />
                            ) : (
                                !isPhotoLoading && (
                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageRounded sx={{ fontSize: 80, color: alpha(theme.palette.grey[500], 0.3), mb: 2 }} />
                                        <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>No image available</Typography>
                                    </Box>
                                )
                            )}

                            {/* Status Badge */}
                            <Chip
                                icon={<ActiveIcon sx={{ fontSize: 16 }} />}
                                label="Active"
                                sx={{
                                    position: 'absolute',
                                    top: 20,
                                    left: 20,
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    backgroundColor: alpha('#66bb6a', 0.9),
                                    color: '#fff',
                                    '& .MuiChip-icon': { color: '#fff' },
                                }}
                            />
                        </Box>

                        {/* Info */}
                        <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column' }}>
                            <FlexBetween sx={{ mb: 3 }}>
                                <Box>
                                    {isLoading ? (
                                        <>
                                            <Skeleton width={200} height={40} />
                                            <Skeleton width={100} height={24} sx={{ mt: 1 }} />
                                        </>
                                    ) : (
                                        <>
                                            <Typography
                                                variant="h1"
                                                sx={{ fontWeight: 700, color: theme.palette.grey[100], fontSize: { xs: 28, md: 36 } }}
                                            >
                                                {branchData?.branch?.name}
                                            </Typography>
                                            <Chip
                                                icon={<LocationIcon sx={{ fontSize: 14 }} />}
                                                label={branchData?.branch?.location?.city}
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                    color: theme.palette.secondary.main,
                                                    fontWeight: 600,
                                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                                                    '& .MuiChip-icon': { color: theme.palette.secondary.main },
                                                }}
                                            />
                                        </>
                                    )}
                                </Box>

                                <Tooltip title="Edit Branch" arrow>
                                    <IconButton
                                        onClick={() => setIsUpdatingBranch(true)}
                                        disabled={isLoading}
                                        sx={{
                                            backgroundColor: theme.palette.secondary.main,
                                            color: theme.palette.primary[600],
                                            width: 48,
                                            height: 48,
                                            borderRadius: '0.6rem',
                                            '&:hover': { backgroundColor: theme.palette.secondary[400], transform: 'scale(1.05)' },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <EditRounded />
                                    </IconButton>
                                </Tooltip>
                            </FlexBetween>

                            <Box sx={{ flex: 1 }}>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                            <Skeleton variant="rounded" width={42} height={42} sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.06) }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width={80} height={14} sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.06) }} />
                                                <Skeleton width={150} height={20} sx={{ mt: 0.5, backgroundColor: alpha(theme.palette.grey[500], 0.06) }} />
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <>
                                        <InfoItem icon={LocationIcon} label="Address" value={branchData?.branch?.location?.address} />
                                        <InfoItem icon={ManagerIcon} label="Manager" value={branchData?.branch?.manager || 'Not assigned'} />
                                        <InfoItem icon={Inventory2Rounded} label="Products Available">
                                            <Chip
                                                label={`${branchData?.products?.length || 0} products`}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                                    color: theme.palette.grey[300],
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                                }}
                                            />
                                        </InfoItem>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Grow>

            {/* Product Inventory Section */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 4, height: 26, borderRadius: 2, backgroundColor: theme.palette.secondary.main, flexShrink: 0 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.grey[100] }}>
                        Product Inventory
                    </Typography>
                </Box>

                {!isLoading && branchData && categories.length > 0 && (
                    <>
                        {/* Category Tabs */}
                        <Box
                            sx={{
                                borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                mb: 2,
                            }}
                        >
                            <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: theme.palette.secondary.main,
                                        height: 3,
                                        borderRadius: '3px 3px 0 0',
                                    },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        color: theme.palette.grey[400],
                                        minHeight: 48,
                                        px: 2.5,
                                        transition: 'all 0.2s ease',
                                        '&.Mui-selected': {
                                            color: theme.palette.secondary.main,
                                        },
                                        '&:hover': {
                                            color: theme.palette.grey[200],
                                            backgroundColor: alpha(theme.palette.grey[500], 0.05),
                                        },
                                    },
                                }}
                            >
                                {categories.map((cat) => (
                                    <Tab key={cat} label={cat} />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        {categories.map((category, index) => {
                            if (activeTab !== index) return null;

                            const filteredProducts = branchData.products.filter(
                                (p) => p.category === category
                            );

                            return (
                                <Box key={category}>
                                    {filteredProducts.length > 0 ? (
                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                borderRadius: '0.75rem',
                                                backgroundImage: 'none',
                                                backgroundColor: theme.palette.background.alt,
                                                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                                '& .MuiTableCell-root': {
                                                    borderBottomColor: alpha(theme.palette.grey[500], 0.08),
                                                },
                                            }}
                                        >
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ width: 50 }} />
                                                        <TableCell
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.78rem',
                                                                color: theme.palette.grey[300],
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                            }}
                                                        >
                                                            Product
                                                        </TableCell>
                                                        <TableCell
                                                            align="right"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.78rem',
                                                                color: theme.palette.grey[300],
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                width: 200,
                                                            }}
                                                        >
                                                            Actions
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredProducts.map((product) => (
                                                        <ProductRow
                                                            key={product.productId}
                                                            product={product}
                                                            branchId={branchData.branch._id}
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                py: 5,
                                                borderRadius: '0.75rem',
                                                backgroundColor: alpha(theme.palette.background.alt, 0.4),
                                                border: `1px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                                            }}
                                        >
                                            <Typography sx={{ color: theme.palette.grey[500] }}>
                                                No products in this category
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </>
                )}

                {!isLoading && branchData && categories.length === 0 && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            px: 2,
                            borderRadius: '0.75rem',
                            backgroundColor: alpha(theme.palette.background.alt, 0.4),
                            border: `1px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                        }}
                    >
                        <Inventory2Rounded sx={{ fontSize: 48, color: alpha(theme.palette.grey[500], 0.25), mb: 1 }} />
                        <Typography variant="h5" sx={{ color: theme.palette.grey[400], fontWeight: 500, mb: 0.5 }}>
                            No product inventory
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                            Products will appear here once inventory is assigned to this branch
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Edit Popup */}
            <BranchFormPopup
                open={isUpdatingBranch}
                onClose={() => setIsUpdatingBranch(false)}
                mode="edit"
                cities={!isCitiesLoading ? cities : []}
                initialValues={!isLoading && branchData ? branchData.branch : {}}
                onSubmit={handleUpdateBranchFormSubmit}
                onImgSubmit={handleImgSubmit}
                currentPhotoPath={photo?.photoPath}
            />
        </Box>
    );
};

export default BranchDetails;