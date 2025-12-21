import React, {useState} from 'react'
import {useParams} from "react-router-dom"
import {
    Box,
    Divider,
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
    useMediaQuery,
    useTheme, TextField, CircularProgress
} from "@mui/material";
import {KeyboardArrowDown, KeyboardArrowUp, Edit, Save} from "@mui/icons-material";
import {
    useAddVariantMutation,
    useGetCategoriesQuery,
    useGetInventoryByVariantMutation,
    useGetProductByIdQuery, useGetProductPhotoQuery,
    useUpdateInventoryByVariantMutation, useUpdateProductMutation, useUploadProductPhotoMutation
} from "../../state/apis/api";
import FlexBetween from "../../components/FlexBetween";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import ProductFormPopup from "../../forms/ProductFormPopup";
import toast from "react-hot-toast";
import NewVariantFormPopup from "../../forms/NewVariantFormPopup";

const variantsInitialValues = {
    color: '',
    price: ''
}

const Row = ({variation}) => {
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

        // Only fetch if opening AND no data yet
        if (!open && !inventoryData) {
            setIsLoadingData(true);
            try {
                const result = await trigger({variantId: variantId}).unwrap();
                console.log(result);
                setInventoryData(result);
                setEditedBranches(result.branches || []);
            } catch (error) {
                console.error('Failed to load inventory:', error);
            } finally {
                setIsLoadingData(false);
            }
        }
    };

    const handleQuantityChange = (idx, field, value) => {
        if (!/^\d*$/.test(value)) return;

        const num = Number(value);
        const updated = editedBranches.map((branch, i) =>
            i === idx
                ? {
                    ...branch,
                    [field]: num,
                    available:
                        (field === "stock" ? num : branch.stock) -
                        (field === "reserved" ? num : branch.reserved)
                }
                : branch
        );
        updated[idx][field] = num;

        // Recalculate available
        updated[idx].available = updated[idx].stock - updated[idx].reserved;

        setEditedBranches(updated);
        console.log(editedBranches)
    };

    const handleSaveChanges = async () => {
        if (!inventoryData) return;

        setIsEditing(false);

        const changedBranches = editedBranches.filter(
            (branch, i) =>
                branch.stock !== inventoryData.branches[i].stock ||
                branch.reserved !== inventoryData.branches[i].reserved
        ).map(branch => ({
            branchId: branch.branchId,
            stock: branch.stock,
            reserved: branch.reserved
        }));

        if (changedBranches.length > 0) {
            const data = {
                variantId: variation._id,
                changes: changedBranches
            }
            try {
                await updateData(data);
                const result = await trigger({variantId: variation._id}).unwrap();
                setInventoryData(result);
            } catch (error) {
                // console.error(error);
            }

        } else {
            console.log("No Changes Made")

        }
    };

    const handleDiscardChanges = () => {
        if (!inventoryData) return;
        setEditedBranches(inventoryData.branches || []);
        setIsEditing(false);
    };

    return (
        <>
            <TableRow hover>
                {/*Dropdown Menu Cell*/}
                <TableCell sx={{width: "5%"}}>
                    <IconButton size="small" onClick={() => handleToggle(variation._id)}>
                        {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                {/*Variation or Color Name Cell*/}
                <TableCell>
                    <Typography variant="h4" sx={{fontWeight: 600, color: theme.palette.secondary.main}}>
                        {variation.color}
                    </Typography>
                </TableCell>
                {/*Total Inventory Number Cell*/}
                {/*<TableCell variant="h4" align="right" sx={{width: "10%"}}>*/}
                {/*    <Typography sx={{fontWeight: 500}}>*/}
                {/*        {inventoryData?.totals?.totalStock || "N/A"}*/}
                {/*    </Typography>*/}
                {/*</TableCell>*/}
                {/*Edit Button Cell*/}
                <TableCell align="right" sx={isEditing ? {width: "20%"} : {width: "10%"}}>
                    {!open ? (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={isEditing ? <Save/> : <Edit/>}
                            disabled
                        >
                            {isEditing ? "Save" : "Edit"}
                        </Button>
                    ) : (
                        isEditing ? (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={isEditing ? <Save/> : <Edit/>}
                                    disabled={!inventoryData}
                                    onClick={handleSaveChanges}
                                    sx={{mr: 1}}
                                >

                                    Save
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={handleDiscardChanges}
                                >
                                    Discard
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={isEditing ? <Save/> : <Edit/>}
                                disabled={!inventoryData}
                                onClick={() => {
                                    if (isEditing) handleSaveChanges();
                                    setIsEditing(!isEditing);
                                }}
                            >

                                Edit
                            </Button>
                        )
                    )}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell colSpan={4} sx={{p: "1rem 2rem 0 2rem"}}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box>
                            {isLoadingData ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                    <CircularProgress size={24}/>
                                </Box>
                            ) : inventoryData ? (
                                <>
                                    {/* Totals Summary Above Table Field */}
                                    {inventoryData.totals && (
                                        <Box sx={{mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1}}>
                                            <Typography variant="h5" fontWeight={600}>
                                                Total Stock: {inventoryData.totals.totalStock} |
                                                Reserved: {inventoryData.totals.totalReserved} |
                                                Available: {inventoryData.totals.totalAvailable}
                                            </Typography>
                                        </Box>
                                    )}
                                    {/*Inner Table*/}
                                    <Table size="medium" sx={{mb: "1rem"}}>
                                        {/*Table Header*/}
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 600, fontSize: 18}}>
                                                    Branch
                                                </TableCell>
                                                <TableCell align="right" sx={{fontWeight: 600, fontSize: 18}}>
                                                    Stock
                                                </TableCell>
                                                <TableCell align="right" sx={{fontWeight: 600, fontSize: 18}}>
                                                    Reserved
                                                </TableCell>
                                                <TableCell align="right" sx={{fontWeight: 600, fontSize: 18}}>
                                                    Available
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        {/*Table Rows*/}
                                        <TableBody>
                                            {editedBranches && editedBranches.length > 0 ? (
                                                editedBranches.map((branch, idx) => (
                                                    <TableRow key={branch.branchId || idx}>
                                                        {/*Branch Name Cell*/}
                                                        <TableCell>
                                                            {branch.branchName}
                                                        </TableCell>
                                                        {/*Variant Stock Quantity Cell*/}
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                branch.stock
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={branch.stock}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(idx, 'stock', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        {/*Reserved Units Value Cell*/}
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                branch.reserved
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={branch.reserved}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(idx, 'reserved', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        {/*Available Units Value Cell*/}
                                                        <TableCell align="right">
                                                            <Typography fontWeight={500}>
                                                                {branch.available}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        No inventory data available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </>
                            ) : (
                                <Box sx={{p: 2, textAlign: 'center'}}>
                                    <Typography color="text.secondary">
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

const InventoryTable = ({product}) => {
    const theme = useTheme();
    return (
        <TableContainer component={Paper} sx={{borderRadius: 3, mt: "1.5rem"}}>
            <Table sx={{backgroundColor: theme.palette.background.alt}}>
                <TableBody>
                    {product.variants.map((variation, idx) => (
                        <Row key={idx} variation={variation}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const Details = () => {

    const theme = useTheme();

    const apiUrl = process.env.REACT_APP_BASE_URL;

    const [isUpdatingProduct, setIsUpdatingProduct] = useState();
    const [isUpdatingVariant, setIsUpdatingVariant] = useState();

    const {id} = useParams();
    const isNonMobile = useMediaQuery("(min-width: 1000px)");

    const {data: product, isLoading} = useGetProductByIdQuery(id);
    const {data: categories, isLoading: isCategoriesLoading} = useGetCategoriesQuery();
    const {data: photo, isLoading: isPhotoLoading} = useGetProductPhotoQuery(id);
    const [updateProduct] = useUpdateProductMutation();
    const [addVariant] = useAddVariantMutation();
    const [uploadProductPhoto] = useUploadProductPhotoMutation();

    // console.log(apiUrl+photo.photoPath)

    const handleUpdateProductFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try{
            await updateProduct({productId: id, data: values}).unwrap();
            toast.success("Product updated successfully.");
            resetForm();
            setIsUpdatingProduct(false)
        } catch (error) {
            console.log(error);
            toast.error("Product update failed.");
        } finally {
            setSubmitting(false);
        }
    }

    const handleImgSubmit = async (imageFile) => {
        if (!imageFile) return;
        console.log("Uploading From Details Page: ", imageFile);

        try{
            await uploadProductPhoto({file: imageFile, productId: id}).unwrap();
            toast.success("Product photo upload successfully.");
        } catch (error) {
            console.log(error);
            toast.error("Product photo upload failed.");
        }
    }

    const handleVariantFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try{
            await addVariant({productId: id, variantData: values}).unwrap();
            toast.success("Variant Added Successfully.");
            resetForm();
            setIsUpdatingVariant(false)
        } catch (error) {
            console.log(error);
            toast.error("Variant Added Failed.");
        } finally {
            setSubmitting(false);
        }
    }

    const labelValue = (label, value) => (
        <Box sx={{mb: 1}}>
            <FlexBetween sx={{mb: 1}}>
                <Typography variant="h5" sx={{fontWeight: 600, color: theme.palette.secondary.main}}>
                    {label}:
                </Typography>
                    <Typography variant="h5" sx={{fontWeight: 400}}>
                        {value}
                    </Typography>
            </FlexBetween>
            <Divider sx={{mt: 0.5, mb: 5}}/>
        </Box>
    );

    return (
        <Box m="1.5rem 2.5rem">
            <Header title={"Details"} subtitle={"See Product Details"}/>
            <Box padding={"2rem"} display="flex" justifyContent="space-between" alignItems="center" mt={"1.5rem"}
                 sx={{border: `1px solid ${theme.palette.secondary[300]}`, borderRadius: "10px"}}>
                <Box
                    component="img"
                    src={apiUrl+photo?.photoPath || undefined}
                    alt={"product photo"}
                    sx={{
                        width: "50vh",
                        height: "50vh",
                        borderRadius: 3,
                        objectFit: "cover",
                        boxShadow: 3,
                    }}
                />
                <Box width={"60%"}>
                    <FlexBetween sx={{mb: 3}}>
                        <Typography variant="h1" sx={{fontWeight: 700}}>
                            {isLoading ? "Loading..." : product.name}
                        </Typography>
                        <Button
                            onClick={() => {
                                setIsUpdatingProduct(!isUpdatingProduct)
                            }}
                            sx={{
                                backgroundColor: theme.palette.secondary.light,
                                color: theme.palette.background.alt,
                                fontWeight: "bold",
                                fontSize: "14px",
                                padding: "10px 20px",
                            }}
                            type="button"
                        >
                            <>
                                <EditIcon sx={{mr: "10[x"}}/>
                                Update Information
                            </>
                        </Button>
                    </FlexBetween>

                    {labelValue("Category", isLoading ? "Loading..." : product.category || "-")}
                    {labelValue("Price", isLoading ? "Loading..." : product.basePrice || "-")}
                    {labelValue("Cost of Make", isLoading ? "Loading..." : product.cost || "-")}
                    {labelValue("Description", isLoading ? "Loading..." : product.description || "-")}
                    {labelValue("Status", isLoading ? "Loading..." : product.discontinued ? "Inactive" : "Active")}

                </Box>
            </Box>
            <FlexBetween sx={{ mt: 4}}>
                <Typography variant="h2" sx={{fontWeight: 700}}>
                    Product Variations
                </Typography>
                <Button
                    onClick={() => {
                        setIsUpdatingVariant(!isUpdatingVariant)
                    }}
                    sx={{
                        backgroundColor: theme.palette.secondary.light,
                        color: theme.palette.background.alt,
                        fontWeight: "bold",
                        fontSize: "14px",
                        padding: "10px 20px",
                    }}
                    type="button"
                >
                    <>
                        <EditIcon sx={{mr: "10[x"}}/>
                        Add New Variant
                    </>
                </Button>
            </FlexBetween>
            {!isLoading && product && <InventoryTable product={product}/>}
            <ProductFormPopup
                open={isUpdatingProduct}
                onClose={() => setIsUpdatingProduct(false)}
                mode={"edit"}
                categories={!isCategoriesLoading ? categories : null}
                initialValues={!isLoading ? product : null}
                onSubmit={handleUpdateProductFormSubmit}
                onImgSubmit={handleImgSubmit}
            />
            <NewVariantFormPopup
                open={isUpdatingVariant}
                onClose={() => setIsUpdatingVariant(false)}
                mode={"add"}
                initialValues={variantsInitialValues}
                onSubmit={handleVariantFormSubmit}
            />
        </Box>
    )
}
export default Details
