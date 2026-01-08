import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
    IconButton,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Divider,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
    Inventory,
} from '@mui/icons-material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {PRIORITY_CONFIG} from '../dummyData';
import {dummyProducts, dummyMaterials} from '../dummyData';
import {Checkbox, FormControlLabel} from '@mui/material';

const OrderFormDialog = ({open, onClose, isEdit, orderForm, setOrderForm, onSubmit, selectedOrder}) => {
    const theme = useTheme();
    const selectedProduct = dummyProducts.find(p => p._id === orderForm.productId);

    const addMaterialToOrder = () => {
        setOrderForm(prev => ({
            ...prev,
            materialsRequired: [
                ...prev.materialsRequired,
                {
                    materialId: '',
                    variantId: '',
                    materialName: '',
                    variantName: '',
                    quantityNeeded: 0,
                    listsNeeded: null,
                    reserved: false,
                },
            ],
        }));
    };

    const updateMaterial = (index, field, value) => {
        setOrderForm(prev => {
            const updated = [...prev.materialsRequired];
            updated[index] = {...updated[index], [field]: value};

            if (field === 'materialId') {
                const mat = dummyMaterials.find(m => m._id === value);
                updated[index].materialName = mat?.name || '';
                updated[index].variantId = '';
                updated[index].variantName = '';
            }
            if (field === 'variantId') {
                const mat = dummyMaterials.find(m => m._id === updated[index].materialId);
                const variant = mat?.variants.find(v => v._id === value);
                updated[index].variantName = variant?.name || '';
            }

            return {...prev, materialsRequired: updated};
        });
    };

    const removeMaterial = (index) => {
        setOrderForm(prev => ({
            ...prev,
            materialsRequired: prev.materialsRequired.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        const selectedProduct = dummyProducts.find(p => p._id === orderForm.productId);
        const selectedVariant = selectedProduct?.variants.find(v => v._id === orderForm.variantId);

        if (isEdit) {
            const updates = {
                productId: orderForm.productId,
                productName: selectedProduct?.name || selectedOrder.productName,
                category: selectedProduct?.category || selectedOrder.category,
                variantId: orderForm.variantId,
                variantName: selectedVariant?.name || selectedOrder.variantName,
                quantity: orderForm.quantity,
                priority: orderForm.priority,
                dueDate: orderForm.dueDate ? orderForm.dueDate.toDate() : selectedOrder.dueDate,
                instructions: orderForm.instructions,
                notes: orderForm.notes,
                materialsRequired: orderForm.materialsRequired,
                estimatedMaterialCost: orderForm.materialsRequired.reduce((sum, m) => {
                    const mat = dummyMaterials.find(dm => dm._id === m.materialId);
                    return sum + (mat?.cost || 0) * m.quantityNeeded;
                }, 0),
            };
            onSubmit(updates);
        } else {
            const newOrder = {
                _id: `co${Date.now()}`,
                productId: orderForm.productId,
                productName: selectedProduct?.name || '',
                category: selectedProduct?.category || '',
                variantId: orderForm.variantId,
                variantName: selectedVariant?.name || '',
                quantity: orderForm.quantity,
                relatedOrderId: null,
                materialsRequired: orderForm.materialsRequired,
                materialsUsed: [],
                estimatedMaterialCost: orderForm.materialsRequired.reduce((sum, m) => {
                    const mat = dummyMaterials.find(dm => dm._id === m.materialId);
                    return sum + (mat?.cost || 0) * m.quantityNeeded;
                }, 0),
                actualMaterialCost: 0,
                createdBy: {userId: 'user1', firstName: 'John', lastName: 'Smith'},
                assignedToCutting: null,
                assignedToProduction: null,
                status: 'PENDING',
                priority: orderForm.priority,
                addedDate: new Date(),
                dueDate: orderForm.dueDate ? orderForm.dueDate.toDate() : null,
                cuttingStartedDate: null,
                cuttingCompletedDate: null,
                productionStartedDate: null,
                completedDate: null,
                instructions: orderForm.instructions,
                notes: orderForm.notes,
                issues: [],
            };
            onSubmit(newOrder);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {isEdit ? 'Edit Cut Order' : 'Create New Cut Order'}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack spacing={3}>
                    {/* Product Information */}
                    <Typography variant="subtitle2" color={theme.palette.secondary.light}>
                        Product Information
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>Product</InputLabel>
                                <Select
                                    value={orderForm.productId}
                                    label="Product"
                                    variant="outlined"
                                    onChange={(e) =>
                                        setOrderForm(prev => ({
                                            ...prev,
                                            productId: e.target.value,
                                            variantId: '',
                                        }))
                                    }
                                >
                                    {dummyProducts.map(product => (
                                        <MenuItem key={product._id} value={product._id}>
                                            <Stack>
                                                <Typography>{product.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {product.category}
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth disabled={!orderForm.productId}>
                                <InputLabel>Variant</InputLabel>
                                <Select
                                    value={orderForm.variantId}
                                    label="Variant"
                                    variant="outlined"
                                    onChange={(e) =>
                                        setOrderForm(prev => ({
                                            ...prev,
                                            variantId: e.target.value,
                                        }))
                                    }
                                >
                                    {selectedProduct?.variants.map(variant => (
                                        <MenuItem key={variant._id} value={variant._id}>
                                            {variant.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={orderForm.quantity}
                                onChange={(e) =>
                                    setOrderForm(prev => ({
                                        ...prev,
                                        quantity: parseInt(e.target.value) || 1,
                                    }))
                                }
                                slotProps={{input: {inputProps: {min: 1}}}}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 4}}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={orderForm.priority}
                                    label="Priority"
                                    variant="outlined"
                                    onChange={(e) =>
                                        setOrderForm(prev => ({
                                            ...prev,
                                            priority: e.target.value,
                                        }))
                                    }
                                >
                                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                        <MenuItem key={key} value={key}>
                                            {config.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, md: 4}}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Due Date"
                                    value={orderForm.dueDate}
                                    onChange={(date) =>
                                        setOrderForm(prev => ({
                                            ...prev,
                                            dueDate: date,
                                        }))
                                    }
                                    slotProps={{textField: {fullWidth: true}}}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>

                    {/* Materials Required */}
                    <Divider/>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" color={theme.palette.secondary.light}>
                            Materials Required
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<AddIcon sx={{color: theme.palette.secondary.light}}/>}
                            onClick={addMaterialToOrder}
                        >
                            <Typography sx={{color: theme.palette.secondary.light, fontSize: 12.5, textTransform: "none"}}>
                                Add Material
                            </Typography>
                        </Button>
                    </Stack>

                    {orderForm.materialsRequired.length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                bgcolor: alpha(theme.palette.info.main, 0.02),
                            }}
                        >
                            <Inventory color="disabled" sx={{fontSize: 40, mb: 1}}/>
                            <Typography color="text.secondary">
                                No materials added yet. Click "Add Material" to specify required materials.
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {orderForm.materialsRequired.map((mat, index) => {
                                const selectedMaterial = dummyMaterials.find(
                                    m => m._id === mat.materialId
                                );

                                return (
                                    <Paper key={index} variant="outlined" sx={{p: 2, backgroundColor: theme.palette.background.alt}}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid size={{xs: 12, sm: 3}}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Material</InputLabel>
                                                    <Select
                                                        value={mat.materialId}
                                                        label="Material"
                                                        variant="outlined"
                                                        onChange={(e) =>
                                                            updateMaterial(index, 'materialId', e.target.value)
                                                        }
                                                    >
                                                        {dummyMaterials.map(m => (
                                                            <MenuItem key={m._id} value={m._id}>
                                                                {m.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid size={{xs: 12, sm: 3}}>
                                                <FormControl
                                                    fullWidth
                                                    size="small"
                                                    disabled={!mat.materialId}
                                                >
                                                    <InputLabel>Variant</InputLabel>
                                                    <Select
                                                        value={mat.variantId}
                                                        label="Variant"
                                                        variant="outlined"
                                                        onChange={(e) =>
                                                            updateMaterial(index, 'variantId', e.target.value)
                                                        }
                                                    >
                                                        {selectedMaterial?.variants.map(v => (
                                                            <MenuItem key={v._id} value={v._id}>
                                                                {v.name} (Stock: {v.stock})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid size={{xs: 6, sm: 2}}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="number"
                                                    label="Qty Needed"
                                                    value={mat.quantityNeeded}
                                                    onChange={(e) =>
                                                        updateMaterial(
                                                            index,
                                                            'quantityNeeded',
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                />
                                            </Grid>

                                            <Grid size={{xs: 6, sm: 2}}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="number"
                                                    label="Lists"
                                                    value={mat.listsNeeded || ''}
                                                    onChange={(e) =>
                                                        updateMaterial(
                                                            index,
                                                            'listsNeeded',
                                                            parseInt(e.target.value) || null
                                                        )
                                                    }
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, sm: 2}}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    justifyContent="flex-end"
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                size="small"
                                                                checked={mat.reserved}
                                                                onChange={(e) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'reserved',
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label="Reserve"
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => removeMaterial(index)}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}

                    {/* Additional Information */}
                    <Divider/>

                    <Typography variant="subtitle2" color={theme.palette.secondary.light}>
                        Additional Information
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Instructions"
                        placeholder="Special cutting instructions, pattern versions, etc."
                        value={orderForm.instructions}
                        onChange={(e) =>
                            setOrderForm(prev => ({...prev, instructions: e.target.value}))
                        }
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        placeholder="Any additional notes..."
                        value={orderForm.notes}
                        onChange={(e) =>
                            setOrderForm(prev => ({...prev, notes: e.target.value}))
                        }
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{borderColor: theme.palette.primary[100]}}
                >
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                    >
                        Cancel
                    </Typography>
                </Button>
                <Button
                    variant="contained"
                    startIcon={isEdit ? <SaveIcon/> : <AddIcon/>}
                    color="success"
                    onClick={handleSubmit}
                    disabled={!orderForm.productId || !orderForm.variantId || orderForm.quantity < 1}
                >
                    <Typography sx={{fontWeight: 600}}>
                        {isEdit ? 'Save Changes' : 'Create Cut Order'}
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default OrderFormDialog;