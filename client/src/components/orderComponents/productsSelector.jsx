import React, {useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Grid, IconButton,
    Paper,
    Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField,
    Typography, useTheme

} from '@mui/material';
import {formatCurrency} from "./getFunctions";

// Icons
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";


const ProductSelector = ({ selectedItems, onItemsChange, products }) => {

    const theme = useTheme();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) return;

        const newItem = {
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            category: selectedProduct.category,
            variantId: selectedVariant._id,
            variantName: selectedVariant.name,
            quantity,
            unitPrice: selectedVariant.price,
            discount,
            subtotal: (selectedVariant.price * quantity) - (discount / 100 * selectedVariant.price * quantity),
        };

        const existingIndex = selectedItems.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
        );

        if (existingIndex >= 0) {
            const updated = [...selectedItems];
            updated[existingIndex].quantity += quantity;
            updated[existingIndex].subtotal =
                (updated[existingIndex].unitPrice * updated[existingIndex].quantity) -
                (updated[existingIndex].discount / 100 * updated[existingIndex].unitPrice * updated[existingIndex].quantity);
            onItemsChange(updated);
        } else {
            onItemsChange([...selectedItems, newItem]);
        }

        setSelectedProduct(null);
        setSelectedVariant(null);
        setQuantity(1);
        setDiscount(0);
    };

    const handleRemoveItem = (index) => {
        const updated = selectedItems.filter((_, i) => i !== index);
        onItemsChange(updated);
    };

    const handleUpdateItemQuantity = (index, newQuantity) => {
        if (newQuantity < 1) return;
        const updated = [...selectedItems];
        updated[index].quantity = newQuantity;
        updated[index].subtotal =
            (updated[index].unitPrice * newQuantity) -
            (updated[index].discount / 100 * updated[index].unitPrice * newQuantity);
        onItemsChange(updated);
    };

    const handleUpdateItemDiscount = (index, newDiscount) => {
        if (newDiscount < 0 || newDiscount > 100) return;
        const updated = [...selectedItems];
        updated[index].discount = newDiscount;
        updated[index].subtotal =
            (updated[index].unitPrice * updated[index].quantity) -
            (newDiscount / 100 * updated[index].unitPrice * updated[index].quantity);
        onItemsChange(updated);
    };

    // const categories = [...new Set(products.map((p) => p.category))];

    return (
        <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Add Products
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: theme.palette.background.default}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 4 }}>
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
                                <TextField {...params} label="Select Product" size="small" />
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
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Autocomplete
                            value={selectedVariant}
                            onChange={(_, newValue) => setSelectedVariant(newValue)}
                            options={selectedProduct?.variants || []}
                            getOptionLabel={(option) => `${option.name} - ${formatCurrency(option.price)}`}
                            disabled={!selectedProduct}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Variant" size="small" />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Stack direction="row" justifyContent="space-between" width="100%">
                                        <Typography variant="body2">{option.name}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                size="small"
                                                label={`Stock: ${option.stock}`}
                                                color={option.stock > 5 ? 'success' : option.stock > 0 ? 'warning' : 'error'}
                                                variant="outlined"
                                            />
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatCurrency(option.price)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </li>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                        <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            fullWidth
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value)))}
                            slotProps={{ htmlInput: { min: 1 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                        <TextField
                            label="Discount %"
                            type="number"
                            size="small"
                            fullWidth
                            value={discount}
                            onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            slotProps={{ htmlInput: { min: 0, max: 100 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={handleAddItem}
                            disabled={!selectedProduct || !selectedVariant}
                            fullWidth
                        >
                            Add
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Selected Items Table */}
            {selectedItems.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{backgroundColor: theme.palette.background.default}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                                <TableCell>Product</TableCell>
                                <TableCell>Variant</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="center">Discount %</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedItems.map((item, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Stack>
                                            <Typography variant="body2" fontWeight={500}>
                                                {item.productName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.category}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{item.variantName}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <KeyboardArrowDownIcon fontSize="small" />
                                            </IconButton>
                                            <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                            >
                                                <KeyboardArrowUpIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={item.discount}
                                            onChange={(e) => handleUpdateItemDiscount(index, parseFloat(e.target.value) || 0)}
                                            sx={{ width: 70 }}
                                            slotProps={{ htmlInput: { min: 0, max: 100, style: { textAlign: 'center' } } }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency(item.subtotal)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: 'primary.50' }}>
                                <TableCell colSpan={5} align="right">
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Items Subtotal:
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                                        {formatCurrency(selectedItems.reduce((sum, item) => sum + item.subtotal, 0))}
                                    </Typography>
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {selectedItems.length === 0 && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        backgroundColor: theme.palette.background.default,
                        border: `2px dashed`,
                        borderColor: 'grey.300',
                    }}
                >
                    <ShoppingCartIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography color="text.secondary">
                        No products added yet. Select a product and variant above to add items to this order.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ProductSelector;