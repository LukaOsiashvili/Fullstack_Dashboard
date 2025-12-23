import React, {useMemo, useState} from 'react'
import {
    Box, Button, CircularProgress, Collapse,
    Divider, IconButton,
    Paper,
    Table,
    TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    Typography,
    Tab,
    Tabs,
    useMediaQuery,

    useTheme
} from "@mui/material";
import {KeyboardArrowDown, KeyboardArrowUp, Edit, Save} from "@mui/icons-material";
import {useParams} from "react-router-dom";
import {
    useGetBranchByIdQuery, useGetBranchCitiesQuery, useGetBranchPhotoQuery,
    useGetProductInventoryAtBranchMutation, useUpdateBranchMutation,
    useUpdateInventoryByVariantMutation, useUpdateProductInventoryAtBranchMutation, useUploadBranchPhotoMutation
} from "../../state/apis/api";
import FlexBetween from "../../components/FlexBetween";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import BranchFormPopup from "../../forms/BranchFormPopup";
import toast from "react-hot-toast";

function TabPanel({children, value, index}) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
}


const Row = ({product, branchId}) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [editedVariants, setEditedVariants] = useState([]);
    const [inventoryData, setInventoryData] = useState(null);

    const [trigger] = useGetProductInventoryAtBranchMutation();
    const [updateData] = useUpdateProductInventoryAtBranchMutation();

    const handleToggle = async (productId, branchId) => {
        setOpen(!open);

        if (!open && !inventoryData) {
            setIsLoadingData(true);
            try {
                const result = await trigger({productId, branchId}).unwrap();
                console.log("Result: ", result);
                setInventoryData(result);
                setEditedVariants(result.variants || []);
            } catch (error) {
                console.error("Failed to load inventory: ", error);
            } finally {
                setIsLoadingData(false);
            }
        }
    }

    const handleQuantityChange = (idx, field, value) => {
        if (!/^\d*$/.test(value)) return;

        const num = Number(value);
        const updated = editedVariants.map((variant, i) =>
            i === idx
                ? {
                    ...variant,
                    [field]: num,
                    available:
                        (field === "stock" ? num : variant.stock) -
                        (field === "reserved" ? num : variant.reserved)
                }
                : variant,
        );

        updated[idx][field] = num;

        updated[idx].available = updated[idx].stock - updated[idx].reserved;

        setEditedVariants(updated);
        console.log(editedVariants)
    }

    const handleSaveChanges = async (productId) => {
        if (!inventoryData) return;

        setIsEditing(false);

        const changedVariants = editedVariants.filter(
            (variant, i) =>
                variant.stock !== inventoryData.variants[i].stock ||
                variant.reserved !== inventoryData.variants[i].reserved
        ).map(variant => ({
            variantId: variant.variantId,
            stock: variant.stock,
            reserved: variant.reserved
        }));

        if (changedVariants.length > 0) {
            const data = {
                branchId: branchId,
                productId: product.productId,
                changes: changedVariants,
            }
            try {
                await updateData(data);
                const productId = product.productId;
                const result = await trigger({productId, branchId}).unwrap();
                setInventoryData(result);
                console.log(data)
            } catch (error) {
                // console.error(error);
            }

        } else {
            console.log("No Changes Made")

        }
    };

    const handleDiscardChanges = () => {
        if (!inventoryData) return;
        setEditedVariants(inventoryData.variants || []);
        setIsEditing(false);
    };

    return (
        <>
            <TableRow hover>
                <TableCell sx={{width: '5%'}}>
                    <IconButton size="small" onClick={() => handleToggle(product.productId, branchId)}>
                        {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography variant="h4" sx={{fontWeight: 600, color: theme.palette.secondary.main}}>
                        {product.productName}
                    </Typography>
                </TableCell>
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
                    <Collapse in={open} timeut={"auto"} unmountOnExit>
                        <Box>
                            {isLoadingData ? (
                                <Box sx={{display: "flex", justifyContent: "center", p: 3}}>
                                    <CircularProgress size={24}/>
                                </Box>
                            ) : inventoryData ? (
                                <>
                                    <Box sx={{mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1}}>
                                        <Typography variant="h5" fontWeight={600}>
                                            Total Stock: {inventoryData.totals.totalStock} |
                                            Reserved: {inventoryData.totals.totalReserved} |
                                            Available: {inventoryData.totals.totalAvailable}
                                        </Typography>
                                    </Box>
                                    {/*    Inner Table*/}
                                    <Table size="medium" sx={{mb: "1rem"}}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 600, fontSize: 18}}>
                                                    Variant
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
                                        <TableBody>
                                            {editedVariants && editedVariants.length > 0 ? (
                                                editedVariants.map((variant, index) => (
                                                    <TableRow key={variant.variantId || index}>
                                                        <TableCell>
                                                            {variant.color}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                variant.stock
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={variant.stock}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) => handleQuantityChange(index, 'stock', e.target.value)}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                variant.reserved
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={variant.reserved}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(index, 'reserved', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontWeight={500}>
                                                                {variant.available}
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
    )
}

const ProductInventoryTable = ({branchData, categories}) => {
    const theme = useTheme()
    const isNonMobile = useMediaQuery("(min-width: 100px)");

    const [value, setValue] = useState(0);

    const handleValueChange = (event, newValue) => {
        setValue(newValue);
    };
    return (

        <Box width="100%" sx={{mt: "1.5rem"}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs
                    value={value}
                    onChange={handleValueChange}
                    variant={"scrollable"}
                    scrollButtons={true}
                    allowScrollButtonsMobile
                    indicatorColor={theme.palette.secondary.main}
                    centered
                    aria-label="basic tabs example"
                    sx={{width: isNonMobile ? '82%' : "110%"}}
                >
                    {categories.map((category, index) => (
                        <Tab
                            key={index}
                            label={category}
                            wrapped
                            sx={{
                                textTransform: 'none',
                                fontWeight: value === index ? 700 : 500,
                                fontSize: '1rem',
                                bgcolor: value === index ? `${theme.palette.secondary.main}` : 'transparent',
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                mx: 0.5,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}/>
                    ))}
                </Tabs>
            </Box>

            {categories.map((category, index) => {
                const filteredProducts = branchData.products.filter(
                    (product) => product.category === category
                );

                return (
                    <TabPanel key={index} value={value} index={index}>
                        {filteredProducts.length > 0 ? (
                            <TableContainer component={Paper} sx={{borderRadius: 3, mt: "1.5rem"}}>
                                <Table sx={{backgroundColor: theme.palette.background.alt}}>
                                    <TableBody>
                                        {filteredProducts.map((product, idx) => (
                                            <Row key={idx} product={product} branchId={branchData.branch._id}/>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography sx={{mt: 2}}>No Data</Typography>
                        )}
                    </TabPanel>
                );
            })}
        </Box>

        // <TableContainer component={Paper} sx={{borderRadius: 3, mt: "1.5rem"}}>
        //     <Table sx={{backgroundColor: theme.palette.background.alt}}>
        //         <TableBody>
        //             {branchData.products.map((product, idx) => (
        //                 <Row key={idx} product={product} branchId={branchData.branch._id}/>
        //             ))}
        //         </TableBody>
        //     </Table>
        // </TableContainer>
    );
}

const BranchDetails = () => {
    const theme = useTheme();

    const apiUrl = process.env.REACT_APP_BASE_URL;

    const {id} = useParams();
    const isNonMobile = useMediaQuery("(min-width: 100px)");

    const [isUpdatingBranch, setIsUpdatingBranch] = useState();

    const {data: branchData, isLoading} = useGetBranchByIdQuery(id);
    const {data: cities, isLoading: isCitiesLoading} = useGetBranchCitiesQuery();
    const {data: photo, isLoading: isPhotoLoading} = useGetBranchPhotoQuery(id);

    const [updateBranch] = useUpdateBranchMutation();
    const [uploadBranchPhoto] = useUploadBranchPhotoMutation();

    const categories = useMemo(() => {
        if (!branchData?.products) return [];
        return [...new Set(branchData.products.map(product => product.category))];
    }, [branchData]).sort();

    console.log(categories);

    console.log(branchData)

    const handleUpdateBranchFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try{
            await updateBranch({branchId: id, data: values}).unwrap();
            toast.success("Branch Updated Successfully!");
            resetForm();
            setIsUpdatingBranch(false)
        } catch (error) {
            console.log(error);
            toast.error("Branch Update Failed!");
        } finally {
            setSubmitting(false);
        }
    }

    const handleImgSubmit = async (imageFile) => {
        if (!imageFile) return;

        try{
            await uploadBranchPhoto({file: imageFile, branchId: id}).unwrap();
            toast.success("Branch Photo Uploaded Successfully.");
        } catch (error) {
            console.log(error);
            toast.error("Branch Photo Upload Failed");
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
    )

    return (
        <Box m="1.5rem 2.5rem">
            <Header title={"Branch Details"} subtitle={"See Branch Details"}/>
            <Box padding={"2rem"} display="flex" justifyContent="space-between" alignItems="center" mt={"1.5rem"}
                 sx={{border: `1px solid ${theme.palette.secondary[300]}`, borderRadius: "10px"}}>
                <Box
                    component="img"
                    src={apiUrl + photo?.photoPath || undefined}
                    alt={"product photo"}
                    sx={{
                        width: "50vh",
                        height: "50vh",
                        borderRadius: 3,
                        objectFit: "cover",
                        boxShadow: 3,
                    }}/>
                <Box width={"60%"}>
                    <FlexBetween sx={{ mb: 4}}>
                        <Typography variant="h1" sx={{fontWeight: 700}}>
                            {isLoading ? "Loading..." : branchData.branch.name}
                        </Typography>
                        <Button
                            onClick={() => {
                                setIsUpdatingBranch(!isUpdatingBranch)
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
                                <EditIcon/>
                                Update Information
                            </>
                        </Button>
                    </FlexBetween>

                    {labelValue("City", isLoading ? "Loading..." : branchData.branch.location.city || "-")}
                    {labelValue("Address", isLoading ? "Loading..." : branchData.branch.location.address || "-")}
                    {labelValue("Manager", isLoading ? "Loading..." : branchData.branch.manager || "-")}
                    {labelValue("Status", "Active")}

                </Box>
            </Box>
            <Typography variant="h2" sx={{fontWeight: 700, mt: 4}}>
                Product Inventory
            </Typography>
            {!isLoading && branchData && <ProductInventoryTable branchData={branchData} categories={categories}/>}
            <BranchFormPopup
                open={isUpdatingBranch}
                onClose={() => setIsUpdatingBranch(false)}
                mode={"edit"}
                cities={!isCitiesLoading ? cities : null}
                initialValues={!isLoading ? branchData.branch : null}
                onSubmit={handleUpdateBranchFormSubmit}
                onImgSubmit={handleImgSubmit}
            />
        </Box>
    )
}
export default BranchDetails
