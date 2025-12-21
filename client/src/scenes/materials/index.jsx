import React, {useState} from 'react'
import FlexBetween from "../../components/FlexBetween";
import {
    Box, Button, CircularProgress, Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {KeyboardArrowDown, KeyboardArrowUp, Edit, Save} from "@mui/icons-material";
import Header from "../../components/Header";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import {
    useAddMaterialMutation,
    useGetAllMaterialsQuery,
    useGetMaterialsByNameMutation,
    useUpdateMaterialInventoryMutation
} from "../../state/apis/api";
import MaterialFormPopup from "../../forms/MaterialFormPopup";
import toast from "react-hot-toast";

const initialValues = {
    name: '',
    category: '',
    cost: '',
}

const categories = ["Georgian Leather", "Crazy Horse", "Cihan", "Karaca"]

const materialss = [
    {
        name: "Georgian Leather",
        color: "Brown",
        quantity: 1500,
        reserved: 0,
        amountOfLists: 10
    },
    {
        name: "Georgian Leather",
        color: "Black",
        quantity: 1500,
        reserved: 0,
        amountOfLists: 10
    },
    {
        name: "Georgian Leather",
        color: "Red",
        quantity: 1500,
        reserved: 0,
        amountOfLists: 10
    },
    {
        name: "Georgian Leather",
        color: "Blue",
        quantity: 1500,
        reserved: 0,
        amountOfLists: 10
    },
    {
        name: "Georgian Leather",
        color: "Purple",
        quantity: 1500,
        reserved: 0,
        amountOfLists: 10
    },
    {
        name: "Crazy Horse",
        color: "Brown",
        quantity: 1000,
        reserved: 0,
        amountOfLists: 5
    },
    {
        name: "Crazy Horse",
        color: "Green",
        quantity: 1000,
        reserved: 0,
        amountOfLists: 5
    },
    {
        name: "Crazy Horse",
        color: "Blue",
        quantity: 1000,
        reserved: 0,
        amountOfLists: 5
    },
    {
        name: "Cihan",
        color: "Black",
        quantity: 500,
        reserved: 0,
        amountOfLists: 7
    },
    {
        name: "Cihan",
        color: "Grey",
        quantity: 500,
        reserved: 0,
        amountOfLists: 7
    },
    {
        name: "Karaca",
        color: "Black",
        quantity: 500,
        reserved: 0,
        amountOfLists: 7
    },
    {
        name: "Karaca",
        color: "Grey",
        quantity: 500,
        reserved: 0,
        amountOfLists: 7
    },
]

const Row = ({material}) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [editedMaterials, setEditedMaterials] = useState([]);
    const [inventoryData, setInventoryData] = useState(null);

    const [trigger] = useGetMaterialsByNameMutation();
    const [updateData] = useUpdateMaterialInventoryMutation();

    const handleToggle = async (materialId) => {
        setOpen(!open);

        if (!open && !inventoryData) {
            setIsLoadingData(true)

            try {
                const result = await trigger({materialId: materialId}).unwrap();
                console.log(result);
                setInventoryData(result.data);
                setEditedMaterials(result.data.variants || []);
            } catch (error) {
                console.log('Failed to load materials inventory', error);
            } finally {
                setIsLoadingData(false)
            }
        }
    }

    const handleQuantityChange = (idx, field, value) => {
        if (!/^\d*$/.test(value)) return;

        const num = Number(value);
        const updated = editedMaterials.map((variant, i) =>
            i === idx
                ? {
                    ...variant,
                    [field]: num,
                    available:
                        (field === "stock" ? num : editedMaterials.stock) -
                        (field === "reserved" ? num : editedMaterials.reserved)
                }
                : variant
        );
        updated[idx][field] = num;

        updated[idx].available = updated[idx].stock - updated[idx].reserved;

        setEditedMaterials(updated);
    }

    const handleSaveChanges = async () => {
        if (!inventoryData) return;

        setIsEditing(false);

        const changedVariants = editedMaterials.filter(
            (variant, i) =>
                variant.stock !== inventoryData.variants[i].stock ||
                variant.reserved !== inventoryData.variants[i].reserved ||
                variant.numOfLists !== inventoryData.variants[i].numOfLists
        ).map(variant => ({
            variantId: variant.variantId,
            stock: variant.stock,
            numOfLists: variant.numOfLists,
            reserved: variant.reserved,
        }))

        if (changedVariants.length > 0) {
            const data = {
                materialId: material._id,
                changes: changedVariants,
            }
            try {
                console.log(data);
                await updateData(data);
                const result = await trigger({materialId: material._id}).unwrap();
                setInventoryData(result.data);
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log("No Changes Made")
        }
    }

    const handleDiscardChanges = () => {
        if (!inventoryData) return;
        setEditedMaterials(inventoryData.variants || []);
        setIsEditing(false);
    };

    return (
        <>
            <TableRow hover>
                {/*Dropdown Menu Cell*/}
                <TableCell sx={{width: "5%"}}>
                    <IconButton size="small" onClick={() => handleToggle(material._id)}>
                        {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                {/*Name Cell*/}
                <TableCell>
                    <Typography variant="h4" sx={{fontWeight: 600, color: theme.palette.secondary.main}}>
                        {material.name}
                    </Typography>
                </TableCell>
                <TableCell align="right" sx={isEditing ? {width: "20%"} : {width: "10%"}}>
                    {!open ? (
                        //TODO: Add "Add New Material Variant" Button [Disabled Here]
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
                                    // onClick={() => console.log("Save Button Clicked")}
                                    onClick={handleSaveChanges}
                                    sx={{mr: 1}}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    startIcon={isEditing ? <Save/> : <Edit/>}
                                    // onClick={() => console.log("Discard Button Clicked")}
                                    onClick={handleDiscardChanges}
                                >
                                    Discard
                                </Button>
                            </>
                        ) : (
                            //TODO: Add "Add New Material Variant" Button [Active Here]
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={isEditing ? <Save/> : <Edit/>}
                                disabled={!inventoryData}
                                // onClick={() => console.log("Edit Button Clicked")}
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
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                    <CircularProgress size={24}/>
                                </Box>
                            ) : inventoryData ? (
                                <>
                                    <Table size="medium" sx={{mb: "1rem"}}>
                                        {/*Table Header*/}
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 600, fontSize: 18}}>
                                                    Type
                                                </TableCell>
                                                <TableCell align="right" sx={{fontWeight: 600, fontSize: 18}}>
                                                    Quantity
                                                </TableCell>
                                                <TableCell align="right" sx={{fontWeight: 600, fontSize: 18}}>
                                                    Lists
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
                                            {editedMaterials && editedMaterials.length > 0 ? (
                                                editedMaterials.map((material, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>
                                                            {material.color}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                material.stock
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={material.stock}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(idx, 'stock', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                material.numOfLists
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={material.numOfLists}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(idx, 'numOfLists', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!isEditing ? (
                                                                material.reserved
                                                            ) : (
                                                                <TextField
                                                                    type="text"
                                                                    value={material.reserved}
                                                                    size="small"
                                                                    sx={{width: "100px"}}
                                                                    onChange={(e) =>
                                                                        handleQuantityChange(idx, 'reserved', e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontWeight={500}>
                                                                {material.available}
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


const Materials = () => {
    const theme = useTheme();
    const isNonMobile = useMediaQuery("(min-width: 1000px)");

    const [open, setOpen] = useState(false);

    const [addMaterial] = useAddMaterialMutation();
    const {data: materials, isLoading} = useGetAllMaterialsQuery();
    console.log(materials);

    const handleMaterialsFormsSubmit = async (values, {setSubmitting, resetForm}) => {
        try{
            await addMaterial(values).unwrap();
            resetForm();
            toast.success("Materials added successfully.");
        } catch (error) {
            console.log(error);
            toast.error("Materials Add Failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Box m="1.5rem 2.5rem">
            <FlexBetween>
                <Header title={"Materials"} subtitle={"View Materials and Inventory"}/>
                <IconButton onClick={() => setOpen(true)}>
                    <AddCircleRoundedIcon sx={{fontSize: 40}}/>
                </IconButton>
            </FlexBetween>
            <TableContainer component={Paper} sx={{borderRadius: 3, mt: "1.5rem"}}>
                <Table sx={{backgroundColor: theme.palette.background.alt}}>
                    <TableBody>
                        {!isLoading && materials && materials.map((material, index) => (
                            <Row material={material} key={index}/>

                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <MaterialFormPopup
                open={open}
                onClose={() => setOpen(false)}
                mode={"add"}
                categories={categories}
                initialValues={initialValues}
                onSubmit={handleMaterialsFormsSubmit}
            />
        </Box>
    )
}
export default Materials
