import React, { useState } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    KeyboardArrowDown,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as DiscardIcon,
    ArrowBackRounded as BackIcon,
    AddCircleRounded as AddIcon,
    ColorLensRounded as VariantsIcon,
    CheckCircleRounded,
    CancelRounded,
    TrendingUpRounded as MarginIcon,
    Inventory2Rounded,
    AttachMoneyRounded,
    DescriptionRounded,
    CategoryRounded,
    ImageRounded,
    EditRounded,
    PowerSettingsNewRounded as ToggleStatusIcon,
    WarningAmberRounded as WarningIcon,
} from '@mui/icons-material';
import {
    useAddVariantMutation,
    useGetCategoriesQuery,
    useGetInventoryByVariantMutation,
    useGetProductByIdQuery,
    useGetProductPhotoQuery,
    useUpdateInventoryByVariantMutation,
    useUpdateProductMutation,
    useUploadProductPhotoMutation,
} from '../../state/apis/api';
import FlexBetween from '../../components/FlexBetween';
import Header from '../../components/Header';
import ProductFormPopup from '../../forms/ProductFormPopup';
import NewVariantFormPopup from '../../forms/NewVariantFormPopup';
import toast from 'react-hot-toast';

const variantsInitialValues = {
    color: '',
    price: '',
};

/* ─────────────────────────────────────
   Info Item Component
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
   Deactivation Confirmation Dialog
   ───────────────────────────────────── */
const StatusConfirmDialog = ({ open, onClose, onConfirm, isDiscontinued, productName, isLoading }) => {
    const theme = useTheme();
    const action = isDiscontinued ? 'reactivate' : 'discontinue';

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    pt: 3,
                    pb: 1,
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDiscontinued
                            ? alpha('#66bb6a', 0.12)
                            : alpha('#ef5350', 0.12),
                    }}
                >
                    {isDiscontinued ? (
                        <CheckCircleRounded sx={{ color: '#66bb6a', fontSize: 24 }} />
                    ) : (
                        <WarningIcon sx={{ color: '#ef5350', fontSize: 24 }} />
                    )}
                </Box>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: theme.palette.grey[100] }}
                    >
                        {isDiscontinued ? 'Reactivate Product' : 'Discontinue Product'}
                    </Typography>
                    <Typography
                        sx={{ fontSize: '0.8rem', color: theme.palette.grey[400], mt: 0.2 }}
                    >
                        This action can be reversed later
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2 }}>
                <Typography sx={{ color: theme.palette.grey[300], fontSize: '0.88rem', lineHeight: 1.6 }}>
                    Are you sure you want to {action}{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: theme.palette.grey[100] }}>
                        {productName}
                    </Box>
                    ?
                    {!isDiscontinued && (
                        <Box component="span" sx={{ display: 'block', mt: 1, color: theme.palette.grey[400], fontSize: '0.82rem' }}>
                            Discontinued products won't appear in active product listings.
                        </Box>
                    )}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: theme.palette.grey[300],
                        borderRadius: '0.5rem',
                        px: 2.5,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.grey[500], 0.08),
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    variant="contained"
                    startIcon={
                        isLoading ? (
                            <CircularProgress size={16} sx={{ color: 'inherit' }} />
                        ) : isDiscontinued ? (
                            <CheckCircleRounded sx={{ fontSize: 16 }} />
                        ) : (
                            <CancelRounded sx={{ fontSize: 16 }} />
                        )
                    }
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                        px: 2.5,
                        backgroundColor: isDiscontinued ? '#66bb6a' : '#ef5350',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: isDiscontinued ? '#4caf50' : '#d32f2f',
                        },
                    }}
                >
                    {isLoading
                        ? 'Processing...'
                        : isDiscontinued
                            ? 'Reactivate'
                            : 'Discontinue'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ─────────────────────────────────────
   Inventory Row Component
   ───────────────────────────────────── */
const InventoryRow = ({ variation }) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [editedBranches, setEditedBranches] = useState([]);
    const [inventoryData, setInventoryData] = useState(null);

    const [trigger] = useGetInventoryByVariantMutation();
    const [updateData] = useUpdateInventoryByVariantMutation();

    const handleToggle = async (variantId) => {
        setOpen(!open);
        if (!open && !inventoryData) {
            setIsLoadingData(true);
            try {
                const result = await trigger({ variantId }).unwrap();
                setInventoryData(result);
                setEditedBranches(result.branches || []);
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
        const updated = [...editedBranches];
        updated[idx] = {
            ...updated[idx],
            [field]: num,
            available:
                (field === 'stock' ? num : updated[idx].stock) -
                (field === 'reserved' ? num : updated[idx].reserved),
        };
        setEditedBranches(updated);
    };

    // Check if any changes were made
    const hasChanges = inventoryData
        ? editedBranches.some(
            (branch, i) =>
                branch.stock !== inventoryData.branches[i]?.stock ||
                branch.reserved !== inventoryData.branches[i]?.reserved
        )
        : false;

    const handleSaveChanges = async () => {
        if (!inventoryData || !hasChanges) return;
        setIsEditing(false);

        const changedBranches = editedBranches
            .filter(
                (branch, i) =>
                    branch.stock !== inventoryData.branches[i].stock ||
                    branch.reserved !== inventoryData.branches[i].reserved
            )
            .map((branch) => ({
                branchId: branch.branchId,
                stock: branch.stock,
                reserved: branch.reserved,
            }));

        try {
            await updateData({
                variantId: variation._id,
                changes: changedBranches,
            });
            const result = await trigger({ variantId: variation._id }).unwrap();
            setInventoryData(result);
            setEditedBranches(result.branches || []);
            toast.success('Inventory updated');
        } catch (error) {
            toast.error('Failed to update inventory');
        }
    };

    const handleDiscardChanges = () => {
        if (!inventoryData) return;
        setEditedBranches(inventoryData.branches || []);
        setIsEditing(false);
    };

    return (
        <>
            {/* Variant Header Row */}
            <TableRow
                hover
                sx={{
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: `${alpha(theme.palette.primary.main, 0.06)} !important`,
                    },
                }}
                onClick={() => handleToggle(variation._id)}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor:
                                    variation.color?.toLowerCase() || theme.palette.grey[400],
                                border: `2px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                                flexShrink: 0,
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.background.alt, 0.8)}`,
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: theme.palette.grey[100] }}
                        >
                            {variation.color}
                        </Typography>
                        {variation.size && (
                            <Chip
                                label={variation.size}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                    color: theme.palette.grey[300],
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                }}
                            />
                        )}
                    </Box>
                </TableCell>

                <TableCell align="right">
                    {variation.price ? (
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.secondary.main,
                                fontSize: '0.9rem',
                            }}
                        >
                            ₾{Number(variation.price).toFixed(2)}
                        </Typography>
                    ) : (
                        <Typography
                            sx={{ fontSize: '0.82rem', color: theme.palette.grey[500] }}
                        >
                            Base price
                        </Typography>
                    )}
                </TableCell>

                <TableCell
                    align="right"
                    sx={{ width: 200 }}
                    onClick={(e) => e.stopPropagation()}
                >
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
                                    '&:hover': {
                                        backgroundColor: theme.palette.secondary[400],
                                    },
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
                                        '&:hover': {
                                            backgroundColor: alpha('#ef5350', 0.08),
                                        },
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

            {/* Collapsible Inventory Content */}
            <TableRow>
                <TableCell
                    colSpan={4}
                    sx={{ p: 0, borderBottom: open ? undefined : 'none' }}
                >
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
                                    <CircularProgress
                                        size={28}
                                        sx={{ color: theme.palette.secondary.main }}
                                    />
                                </Box>
                            ) : inventoryData ? (
                                <>
                                    {/* Totals Summary */}
                                    {inventoryData.totals && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: { xs: 3, sm: 5 },
                                                mb: 3,
                                                pb: 2.5,
                                                borderBottom: `1px solid ${alpha(
                                                    theme.palette.grey[500],
                                                    0.08
                                                )}`,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {[
                                                {
                                                    label: 'Total Stock',
                                                    value: inventoryData.totals.totalStock,
                                                    color: theme.palette.grey[100],
                                                },
                                                {
                                                    label: 'Reserved',
                                                    value: inventoryData.totals.totalReserved,
                                                    color: theme.palette.secondary[500],
                                                },
                                                {
                                                    label: 'Available',
                                                    value: inventoryData.totals.totalAvailable,
                                                    color:
                                                        inventoryData.totals.totalAvailable > 0
                                                            ? '#66bb6a'
                                                            : '#ef5350',
                                                },
                                            ].map((stat) => (
                                                <Box key={stat.label}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.68rem',
                                                            fontWeight: 600,
                                                            color: theme.palette.grey[400],
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        {stat.label}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '1.4rem',
                                                            fontWeight: 700,
                                                            color: stat.color,
                                                        }}
                                                    >
                                                        {stat.value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Branch Inventory Table */}
                                    <Table size="medium">
                                        <TableHead>
                                            <TableRow>
                                                {['Branch', 'Stock', 'Reserved', 'Available'].map(
                                                    (header) => (
                                                        <TableCell
                                                            key={header}
                                                            align={header === 'Branch' ? 'left' : 'right'}
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                color: theme.palette.grey[400],
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                borderBottomColor: alpha(
                                                                    theme.palette.grey[500],
                                                                    0.1
                                                                ),
                                                                py: 1.5,
                                                            }}
                                                        >
                                                            {header}
                                                        </TableCell>
                                                    )
                                                )}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {editedBranches && editedBranches.length > 0 ? (
                                                editedBranches.map((branch, idx) => {
                                                    const stockChanged =
                                                        inventoryData?.branches[idx]?.stock !== branch.stock;
                                                    const reservedChanged =
                                                        inventoryData?.branches[idx]?.reserved !==
                                                        branch.reserved;

                                                    return (
                                                        <TableRow
                                                            key={branch.branchId || idx}
                                                            sx={{
                                                                '&:last-child td': { borderBottom: 'none' },
                                                                '& td': {
                                                                    borderBottomColor: alpha(
                                                                        theme.palette.grey[500],
                                                                        0.06
                                                                    ),
                                                                    py: 2,
                                                                },
                                                                transition: 'background-color 0.2s ease',
                                                                ...(isEditing &&
                                                                    (stockChanged || reservedChanged) && {
                                                                        backgroundColor: alpha(
                                                                            theme.palette.secondary.main,
                                                                            0.04
                                                                        ),
                                                                    }),
                                                            }}
                                                        >
                                                            {/* Branch Name */}
                                                            <TableCell>
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        color: theme.palette.grey[100],
                                                                        fontSize: '0.9rem',
                                                                    }}
                                                                >
                                                                    {branch.branchName}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* Stock */}
                                                            <TableCell align="right">
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="text"
                                                                        value={branch.stock}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onChange={(e) =>
                                                                            handleQuantityChange(
                                                                                idx,
                                                                                'stock',
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        sx={{
                                                                            width: 90,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: '0.4rem',
                                                                                borderColor: stockChanged
                                                                                    ? alpha(
                                                                                        theme.palette.secondary.main,
                                                                                        0.4
                                                                                    )
                                                                                    : undefined,
                                                                                '& input': {
                                                                                    textAlign: 'right',
                                                                                    py: 1,
                                                                                    px: 1.5,
                                                                                    fontSize: '0.9rem',
                                                                                    fontWeight: 600,
                                                                                },
                                                                                '&.Mui-focused fieldset': {
                                                                                    borderColor:
                                                                                    theme.palette.secondary.main,
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: 500,
                                                                            color: theme.palette.grey[200],
                                                                        }}
                                                                    >
                                                                        {branch.stock}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>

                                                            {/* Reserved */}
                                                            <TableCell align="right">
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="text"
                                                                        value={branch.reserved}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onChange={(e) =>
                                                                            handleQuantityChange(
                                                                                idx,
                                                                                'reserved',
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        sx={{
                                                                            width: 90,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: '0.4rem',
                                                                                borderColor: reservedChanged
                                                                                    ? alpha(
                                                                                        theme.palette.secondary.main,
                                                                                        0.4
                                                                                    )
                                                                                    : undefined,
                                                                                '& input': {
                                                                                    textAlign: 'right',
                                                                                    py: 1,
                                                                                    px: 1.5,
                                                                                    fontSize: '0.9rem',
                                                                                    fontWeight: 600,
                                                                                },
                                                                                '&.Mui-focused fieldset': {
                                                                                    borderColor:
                                                                                    theme.palette.secondary.main,
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: 500,
                                                                            color: theme.palette.grey[200],
                                                                        }}
                                                                    >
                                                                        {branch.reserved}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>

                                                            {/* Available */}
                                                            <TableCell align="right">
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.95rem',
                                                                        fontWeight: 700,
                                                                        color:
                                                                            branch.available > 0
                                                                                ? '#66bb6a'
                                                                                : branch.available === 0
                                                                                    ? theme.palette.grey[400]
                                                                                    : '#ef5350',
                                                                    }}
                                                                >
                                                                    {branch.available}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                        <Typography
                                                            sx={{
                                                                color: theme.palette.grey[500],
                                                                fontSize: '0.85rem',
                                                            }}
                                                        >
                                                            No inventory data available
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Changes indicator */}
                                    {isEditing && hasChanges && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                pt: 2,
                                                borderTop: `1px solid ${alpha(
                                                    theme.palette.grey[500],
                                                    0.08
                                                )}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <Chip
                                                label="Unsaved changes"
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    backgroundColor: alpha(
                                                        theme.palette.secondary.main,
                                                        0.1
                                                    ),
                                                    color: theme.palette.secondary.main,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    border: `1px solid ${alpha(
                                                        theme.palette.secondary.main,
                                                        0.2
                                                    )}`,
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: '0.72rem',
                                                    color: theme.palette.grey[500],
                                                }}
                                            >
                                                Modified rows are highlighted
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography sx={{ color: theme.palette.grey[500] }}>
                                        Click to load inventory data
                                    </Typography>
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
   Product Details Page
   ───────────────────────────────────── */
const Details = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isNonMobile = useMediaQuery('(min-width: 1000px)');
    const apiUrl = process.env.REACT_APP_BASE_URL;

    const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
    const [isUpdatingVariant, setIsUpdatingVariant] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const { id } = useParams();

    const { data: product, isLoading } = useGetProductByIdQuery(id);
    const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
    const { data: photo, isLoading: isPhotoLoading } = useGetProductPhotoQuery(id);
    const [updateProduct] = useUpdateProductMutation();
    const [addVariant] = useAddVariantMutation();
    const [uploadProductPhoto] = useUploadProductPhotoMutation();

    const margin =
        product?.cost && product?.basePrice && product.basePrice > 0
            ? (((product.basePrice - product.cost) / product.basePrice) * 100).toFixed(1)
            : null;

    const handleToggleStatus = async () => {
        setIsTogglingStatus(true);
        try {
            await updateProduct({
                productId: id,
                data: { discontinued: !product.discontinued },
            }).unwrap();
            toast.success(
                product.discontinued
                    ? 'Product reactivated successfully'
                    : 'Product discontinued successfully'
            );
            setStatusDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update product status');
        } finally {
            setIsTogglingStatus(false);
        }
    };

    const handleUpdateProductFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await updateProduct({ productId: id, data: values }).unwrap();
            toast.success('Product updated successfully.');
            resetForm();
            setIsUpdatingProduct(false);
        } catch (error) {
            console.error(error);
            toast.error('Product update failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImgSubmit = async (imageFile) => {
        if (!imageFile) return;
        try {
            await uploadProductPhoto({ file: imageFile, productId: id }).unwrap();
            toast.success('Product photo uploaded successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Product photo upload failed.');
        }
    };

    const handleVariantFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await addVariant({ productId: id, variantData: values }).unwrap();
            toast.success('Variant added successfully.');
            resetForm();
            setIsUpdatingVariant(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add variant.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box m="1.5rem 2.5rem" pb={4}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Tooltip title="Back to products" arrow>
                    <IconButton
                        onClick={() => navigate('/products')}
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
                <Header title="Product Details" subtitle="View and manage product information" />
            </Box>

            {/* ── Product Info Card ── */}
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
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isNonMobile ? 'row' : 'column',
                        }}
                    >
                        {/* Product Image */}
                        <Box
                            sx={{
                                width: isNonMobile ? '40%' : '100%',
                                minHeight: isNonMobile ? 500 : 300,
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
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        backgroundColor: alpha(theme.palette.grey[500], 0.1),
                                    }}
                                />
                            )}

                            {photo?.photoPath ? (
                                <Box
                                    component="img"
                                    src={apiUrl + photo.photoPath}
                                    alt={product?.name}
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
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ImageRounded
                                            sx={{
                                                fontSize: 80,
                                                color: alpha(theme.palette.grey[500], 0.3),
                                                mb: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ color: theme.palette.grey[500] }}
                                        >
                                            No image available
                                        </Typography>
                                    </Box>
                                )
                            )}

                            {/* Status Badge */}
                            {!isLoading && product && (
                                <Chip
                                    icon={
                                        product.discontinued ? (
                                            <CancelRounded sx={{ fontSize: 16 }} />
                                        ) : (
                                            <CheckCircleRounded sx={{ fontSize: 16 }} />
                                        )
                                    }
                                    label={product.discontinued ? 'Discontinued' : 'Active'}
                                    sx={{
                                        position: 'absolute',
                                        top: 20,
                                        left: 20,
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        backgroundColor: product.discontinued
                                            ? alpha('#ef5350', 0.9)
                                            : alpha('#66bb6a', 0.9),
                                        color: '#fff',
                                        '& .MuiChip-icon': { color: '#fff' },
                                    }}
                                />
                            )}
                        </Box>

                        {/* Product Info */}
                        <Box
                            sx={{
                                flex: 1,
                                p: { xs: 3, md: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
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
                                                sx={{
                                                    fontWeight: 700,
                                                    color: theme.palette.grey[100],
                                                    fontSize: { xs: 28, md: 36 },
                                                }}
                                            >
                                                {product?.name}
                                            </Typography>
                                            <Chip
                                                icon={<CategoryRounded sx={{ fontSize: 14 }} />}
                                                label={product?.category}
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                    color: theme.palette.secondary.main,
                                                    fontWeight: 600,
                                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                                                    '& .MuiChip-icon': {
                                                        color: theme.palette.secondary.main,
                                                    },
                                                }}
                                            />
                                        </>
                                    )}
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip
                                        title={
                                            product?.discontinued
                                                ? 'Reactivate product'
                                                : 'Discontinue product'
                                        }
                                        arrow
                                    >
                                        <IconButton
                                            onClick={() => setStatusDialogOpen(true)}
                                            disabled={isLoading}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '0.6rem',
                                                border: `1px solid ${alpha(
                                                    product?.discontinued ? '#66bb6a' : '#ef5350',
                                                    0.3
                                                )}`,
                                                color: product?.discontinued ? '#66bb6a' : '#ef5350',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: alpha(
                                                        product?.discontinued ? '#66bb6a' : '#ef5350',
                                                        0.08
                                                    ),
                                                    borderColor: product?.discontinued
                                                        ? '#66bb6a'
                                                        : '#ef5350',
                                                },
                                            }}
                                        >
                                            <ToggleStatusIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edit Product" arrow>
                                        <IconButton
                                            onClick={() => setIsUpdatingProduct(true)}
                                            disabled={isLoading}
                                            sx={{
                                                backgroundColor: theme.palette.secondary.main,
                                                color: theme.palette.primary[600],
                                                width: 48,
                                                height: 48,
                                                borderRadius: '0.6rem',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.secondary[400],
                                                    transform: 'scale(1.05)',
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <EditRounded />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </FlexBetween>

                            {/* Price Display */}
                            {!isLoading && (
                                <Box
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: '16px',
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.secondary.main,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                            }}
                                        >
                                            Base Price
                                        </Typography>
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                fontWeight: 700,
                                                color: theme.palette.secondary.main,
                                                mt: 0.5,
                                            }}
                                        >
                                            ₾{Number(product?.basePrice || 0).toFixed(2)}
                                        </Typography>
                                    </Box>

                                    {margin && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                borderRadius: '0.5rem',
                                                backgroundColor: alpha(
                                                    Number(margin) > 30
                                                        ? '#4caf50'
                                                        : Number(margin) > 15
                                                            ? theme.palette.secondary[500]
                                                            : '#ef5350',
                                                    0.1
                                                ),
                                                border: `1px solid ${alpha(
                                                    Number(margin) > 30
                                                        ? '#4caf50'
                                                        : Number(margin) > 15
                                                            ? theme.palette.secondary[500]
                                                            : '#ef5350',
                                                    0.15
                                                )}`,
                                            }}
                                        >
                                            <MarginIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color:
                                                        Number(margin) > 30
                                                            ? '#66bb6a'
                                                            : Number(margin) > 15
                                                                ? theme.palette.secondary[500]
                                                                : '#ef5350',
                                                }}
                                            />
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        color: theme.palette.grey[400],
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.3px',
                                                    }}
                                                >
                                                    Margin
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.92rem',
                                                        fontWeight: 700,
                                                        color:
                                                            Number(margin) > 30
                                                                ? '#66bb6a'
                                                                : Number(margin) > 15
                                                                    ? theme.palette.secondary[500]
                                                                    : '#ef5350',
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {margin}% · ₾{(product.basePrice - product.cost).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Info Items */}
                            <Box sx={{ flex: 1 }}>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                            <Skeleton
                                                variant="rounded"
                                                width={42}
                                                height={42}
                                                sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.06) }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width={80} height={14} sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.06) }} />
                                                <Skeleton width={150} height={20} sx={{ mt: 0.5, backgroundColor: alpha(theme.palette.grey[500], 0.06) }} />
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <>
                                        <InfoItem
                                            icon={AttachMoneyRounded}
                                            label="Cost of Production"
                                            value={
                                                product?.cost
                                                    ? `₾${Number(product.cost).toFixed(2)}`
                                                    : null
                                            }
                                        />
                                        <InfoItem
                                            icon={DescriptionRounded}
                                            label="Description"
                                            value={product?.description}
                                        />
                                        <InfoItem icon={Inventory2Rounded} label="Total Variants">
                                            <Chip
                                                icon={<VariantsIcon sx={{ fontSize: 14 }} />}
                                                label={`${product?.variants?.length || 0} variant${
                                                    product?.variants?.length !== 1 ? 's' : ''
                                                }`}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                                    color: theme.palette.grey[300],
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                                    '& .MuiChip-icon': { color: theme.palette.grey[400] },
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

            {/* ── Variants Section ── */}
            <Box sx={{ mt: 4 }}>
                <FlexBetween sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                            variant="h3"
                            sx={{ fontWeight: 700, color: theme.palette.grey[100] }}
                        >
                            Variants & Inventory
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setIsUpdatingVariant(true)}
                        sx={{
                            backgroundColor: theme.palette.secondary.main,
                            color: theme.palette.primary[600],
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            px: 2.5,
                            py: 0.9,
                            boxShadow: `0 3px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                backgroundColor: theme.palette.secondary[400],
                                boxShadow: `0 5px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                                transform: 'translateY(-1px)',
                            },
                            '&:active': { transform: 'translateY(0)' },
                        }}
                    >
                        Add Variant
                    </Button>
                </FlexBetween>

                {isLoading ? (
                    <Skeleton
                        variant="rounded"
                        height={200}
                        animation="wave"
                        sx={{
                            backgroundColor: alpha(theme.palette.grey[500], 0.06),
                            borderRadius: '0.75rem',
                        }}
                    />
                ) : product?.variants?.length > 0 ? (
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
                                    {['Variant', 'Price', 'Actions'].map((header) => (
                                        <TableCell
                                            key={header}
                                            align={header === 'Variant' ? 'left' : 'right'}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.78rem',
                                                color: theme.palette.grey[300],
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                ...(header === 'Actions' && { width: 200 }),
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {product.variants.map((variation) => (
                                    <InventoryRow key={variation._id} variation={variation} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
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
                        <VariantsIcon
                            sx={{
                                fontSize: 48,
                                color: alpha(theme.palette.grey[500], 0.25),
                                mb: 1,
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{ color: theme.palette.grey[400], fontWeight: 500, mb: 0.5 }}
                        >
                            No variants yet
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: theme.palette.grey[500], mb: 2 }}
                        >
                            Add color and size variants to track inventory
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setIsUpdatingVariant(true)}
                            size="small"
                            sx={{
                                backgroundColor: theme.palette.secondary.main,
                                color: theme.palette.primary[600],
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary[400],
                                },
                            }}
                        >
                            Add First Variant
                        </Button>
                    </Box>
                )}
            </Box>

            {/* ── Dialogs ── */}
            <StatusConfirmDialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                onConfirm={handleToggleStatus}
                isDiscontinued={product?.discontinued}
                productName={product?.name}
                isLoading={isTogglingStatus}
            />

            <ProductFormPopup
                open={isUpdatingProduct}
                onClose={() => setIsUpdatingProduct(false)}
                mode="edit"
                categories={!isCategoriesLoading ? categories : []}
                initialValues={!isLoading && product ? product : {}}
                onSubmit={handleUpdateProductFormSubmit}
                onImgSubmit={handleImgSubmit}
                currentPhotoPath={photo?.photoPath}
            />

            <NewVariantFormPopup
                open={isUpdatingVariant}
                onClose={() => setIsUpdatingVariant(false)}
                mode="add"
                initialValues={variantsInitialValues}
                onSubmit={handleVariantFormSubmit}
            />
        </Box>
    );
};

export default Details;