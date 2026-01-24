import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
    useTheme, Autocomplete,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
    Inventory,
} from '@mui/icons-material';
import {DateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {PRIORITY_CONFIG} from '../dummyData';
import {Checkbox, FormControlLabel} from '@mui/material';
import {
    useGetProductByIdQuery,
    useGetProductsQuery,
    useLazyGetAllMaterialsQuery
} from "../../../state/apis/api";
import dayjs from "dayjs";

//Memoized Material Row Component

const MaterialRow = React.memo(({
    mat,
    index,
    materials,
    isMaterialsFetching,
    isMaterialsUninitialized,
    onUpdate,
    onRemove,
    fetchMaterials,
    theme
}) => {
    const selectedMaterial = useMemo(
        () => materials.find(m => m._id === mat.materialId),
        [materials, [mat.materialId]]
    );

    return (
        <Paper
            key={index}
            variant="outlined"
            sx={{
                p: 2,
                backgroundColor: theme.palette.background.alt
            }}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid size={{xs: 12, sm: 3}}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Material</InputLabel>
                        <Select
                            value={mat.materialId}
                            label="Material"
                            variant="outlined"
                            onOpen={() => {
                                if (isMaterialsUninitialized) {
                                    fetchMaterials();
                                }
                            }}
                            onChange={(e) => {
                                onUpdate(index, 'materialId', e.target.value);
                                onUpdate(index, 'variantId', '');
                            }}
                        >
                            {isMaterialsFetching && materials.length === 0 && (
                                <MenuItem disabled><i>Loading materials...</i></MenuItem>
                            )}
                            {materials.map(m => (
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
                                onUpdate(index, 'variantId', e.target.value)
                            }
                        >
                            {selectedMaterial?.variants.map(v => (
                                <MenuItem key={v._id} value={v._id}>
                                    {v.color}
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
                            onUpdate(
                                index,
                                'quantityNeeded',
                                Math.max(0, parseInt(e.target.value)) || 0
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
                            onUpdate(
                                index,
                                'listsNeeded',
                                Math.max(0, parseInt(e.target.value)) || null
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
                                        onUpdate(
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
                            onClick={() => onRemove(index)}
                        >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    )
})

MaterialRow.displayName = 'MaterialRow';

const OrderFormDialog = ({open, onClose, isEdit, orderForm, onSubmit }) => {
    const theme = useTheme();

    // console.log("Order Form: ", orderForm)
    // console.log("Selected Order", selectedOrder)

    const [localForm, setLocalForm] = useState({
        productId: '',
        variantId: '',
        quantity: 1,
        priority: 'NORMAL',
        dueDate: null,
        instructions: '',
        notes: '',
        materialsRequired: [],
        ...orderForm,
    })

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);


    const {data: products = [], isLoading: isProductsLoading} = useGetProductsQuery()
    const {
        data: singleProduct,
        isLoading: isSingleProductLoading
    } = useGetProductByIdQuery(orderForm?.productId, {skip: !isEdit || !orderForm?.productId})
    const [fetchAllMaterials, {data: materials = [], isFetching: isMaterialsFetching, isUninitialized: isMaterialsUninitialized}] = useLazyGetAllMaterialsQuery();

    useEffect(() => {
        if(open) {
            setLocalForm({
                productId: '',
                variantId: '',
                quantity: 1,
                priority: 'NORMAL',
                dueDate: null,
                instructions: '',
                notes: '',
                materialsRequired: [],
                ...orderForm,
            });
        }
    }, [open, orderForm]);

    useEffect(() => {
        if(isEdit && singleProduct && open) {
            setSelectedProduct(singleProduct);
            const variant = singleProduct.variants.find(v => v._id === localForm?.variantId);
            if(variant) {
                setSelectedVariant(variant);
            }
        }
    }, [isEdit, singleProduct, open, localForm?.variantId]);

    const addMaterialToOrder = useCallback(() => {
        setLocalForm(prev => ({
            ...prev,
            materialsRequired: [
                ...prev.materialsRequired,
                {
                    materialId: '',
                    variantId: '',
                    materialName: '',
                    variantName: '',
                    quantityNeeded: 0,
                    listNeeded: null,
                    reserved: false,
                },
            ],
        }));
    }, [])

    const updateMaterial = useCallback((index, field, value) => {
        setLocalForm(prev => {
            const updated = [...prev.materialsRequired];
            updated[index] = {...updated[index], [field]: value};

                if (field === 'materialId') {
                    const mat = materials.find(m => m._id === value);
                    updated[index].materialName = mat?.name || '';
                    updated[index].variantId = '';
                    updated[index].variantName = '';
                }
                if (field === 'variantId') {
                    const mat = materials.find(m => m._id === updated[index].materialId);
                    const variant = mat?.variants.find(v => v._id === value);
                    updated[index].variantName = variant?.color || '';
                }

                return {...prev, materialsRequired: updated};
        });
    }, [materials])

    const removeMaterial = useCallback((index) => {
        setLocalForm(prev => ({
            ...prev,
            materialsRequired: prev.materialsRequired.filter((_, i) => i !== index),
        }));
    }, []);

    const handleSubmit = useCallback(() => {
        if(isEdit) {
            const updates = {
                productId: selectedProduct._id,
                productName: selectedProduct.name,
                category: selectedProduct.category,
                variantId: selectedVariant._id,
                variantName: selectedVariant.color,
                quantity: localForm.quantity,
                priority: localForm.priority,
                dueDate: localForm.dueDate.toDate(),
                instructions: localForm.instructions,
                notes: localForm.notes,
                materialsRequired: localForm.materialsRequired,
                estimatedMaterialCost: localForm.materialsRequired.reduce((sum, m) =>{
                    const mat = materials.find(dm => dm._id === m.materialId);
                    return sum + (mat?.cost || 0) * m.quantityNeeded;
                }, 0),
            };
            onSubmit(updates);
            console.log("Updates: ", updates);
        } else {
            const newOrder = {
                productId: selectedProduct._id,
                productName: selectedProduct.name || '',
                category: selectedProduct.category || '',
                variantId: selectedVariant._id,
                variantName: selectedVariant.color || '',
                quantity: localForm.quantity,
                relatedOrderId: null,
                materialsRequired: localForm.materialsRequired,
                materialsUsed: [],
                estimatedMaterialCost: localForm.materialsRequired.reduce((sum, m) =>{
                    const mat = materials.find(dm => dm._id === m.materialId);
                    return sum + (mat?.cost || 0) * m.quantityNeeded;
                }, 0),
                actualMaterialCost: 0,
                createdBy: {userId: '68acdee03f62212a72502f36', firstName: 'Luka', lastName: 'Osiashvili'},
                assignedToCutting: null,
                assignedToProduction: null,
                status: 'PENDING',
                priority: localForm.priority,
                dueDate: localForm.dueDate ? localForm.dueDate.toDate() : null,
                cuttingStartedDate: null,
                cuttingCompletedDate: null,
                productionStartedDate: null,
                completedDate: null,
                instructions: localForm.instructions,
                notes: localForm.notes,
                issues: [],
            };
            console.log("New Order: ",newOrder);
            onSubmit(newOrder);
        }
        handleClose();
    }, [isEdit, selectedProduct, selectedVariant, localForm, materials, onSubmit]);

    const handleClose = useCallback(() => {
        setSelectedProduct(null);
        setSelectedVariant(null);
        onClose();
    }, [onClose]);

    const isFormValid = useMemo(() => {
        return selectedProduct && selectedVariant && localForm.quantity >= 1;
    }, [selectedProduct, selectedVariant, localForm.quantity]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{backgroundColor: theme.palette.primary[600]}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {isEdit ? 'Edit Cut Order' : 'Create New Cut Order'}
                    </Typography>
                    <IconButton onClick={handleClose}>
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
                                <Autocomplete
                                    value={selectedProduct}
                                    onChange={(_, newValue) => {
                                        setSelectedProduct(newValue);
                                        setSelectedVariant(null);
                                    }}
                                    options={products}
                                    groupBy={(option) => option.category}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Product" size="medium"/>
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Stack>
                                                <Typography variant="body2">{option.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.variants.length} variants available
                                                </Typography>
                                            </Stack>
                                        </li>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    value={selectedVariant}
                                    onChange={(_, newValue) => {
                                        setSelectedVariant(newValue);
                                    }}
                                    options={selectedProduct?.variants || []}
                                    getOptionLabel={(option) => `${option.color}`}
                                    disabled={!selectedProduct}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Variant" size="medium"/>
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Stack>
                                                <Typography>{option.color}</Typography>
                                            </Stack>
                                        </li>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={localForm.quantity}
                                onChange={(e) =>
                                    setLocalForm(prev => ({
                                        ...prev,
                                        quantity: Math.max(0, parseInt(e.target.value)),
                                    }))
                                }
                                slotProps={{htmlInput: {min: 1}}}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 4}}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={localForm.priority}
                                    label="Priority"
                                    variant="outlined"
                                    onChange={(e) =>
                                        setLocalForm(prev => ({
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
                                <DateTimePicker
                                    label="Due Date & Time"
                                    value={localForm.dueDate}
                                    onChange={(date) =>
                                        setLocalForm((prev) => ({
                                            ...prev,
                                            dueDate: date,
                                        }))
                                    }
                                    ampm={false}
                                    views={["year", "month", "day", "hours", "minutes"]}
                                    minDateTime={dayjs()}
                                    closeOnSelect
                                    slotProps={{
                                        textField: { fullWidth: true },
                                        field: {
                                            clearable: Boolean(localForm.dueDate),
                                        },

                                    }}
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
                            <Typography
                                sx={{color: theme.palette.secondary.light, fontSize: 12.5, textTransform: "none"}}>
                                Add Material
                            </Typography>
                        </Button>
                    </Stack>

                    {localForm.materialsRequired.length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: alpha(theme.palette.info.main, 0.02),
                            }}
                        >
                            <Inventory color="disabled" sx={{fontSize: 40, mb: 1}}/>
                            <Typography color="text.secondary">
                                No materials added yet. Click "Add Material" to specify required materials.
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {localForm.materialsRequired.map((mat, index) => (
                                <MaterialRow
                                    key={index}
                                    mat={mat}
                                    index={index}
                                    materials={materials}
                                    isMaterialsFetching={isMaterialsFetching}
                                    isMaterialsUninitialized={isMaterialsUninitialized}
                                    onUpdate={updateMaterial}
                                    onRemove={removeMaterial}
                                    fetchMaterials={fetchAllMaterials}
                                    theme={theme}
                                />
                            ))}
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
                        placeholder="Enter any special cutting instructions, pattern versions, etc."
                        value={localForm.instructions}
                        onChange={(e) =>
                            setLocalForm(prev => ({...prev, instructions: e.target.value}))
                        }
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        placeholder="Any additional notes..."
                        value={localForm.notes}
                        onChange={(e) =>
                            setLocalForm(prev => ({...prev, notes: e.target.value}))
                        }
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{px: 3, py: 2, backgroundColor: theme.palette.primary[600]}}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{borderColor: theme.palette.primary[100]}}
                >
                    <Typography
                        variant="h6"
                        color={theme.palette.secondary.light}
                        textTransform="none"
                    >
                        Cancel
                    </Typography>
                </Button>
                <Button
                    variant="contained"
                    startIcon={isEdit ? <SaveIcon/> : <AddIcon/>}
                    color="success"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                >
                    <Typography
                        textTransform="none"
                        sx={{fontWeight: 600}}
                    >
                        {isEdit ? 'Save Changes' : 'Create Cut Order'}
                    </Typography>
                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default OrderFormDialog;