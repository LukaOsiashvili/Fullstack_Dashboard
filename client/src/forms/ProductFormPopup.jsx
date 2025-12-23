import React, {useState} from 'react'
import {Form, Formik} from 'formik';
import {Box, Button, CircularProgress, MenuItem, TextField, Typography, useTheme} from '@mui/material';
import Popup from "../components/Popup"
import ImageUploadBox from "../components/ImageUploadBox";

const ProductFormPopup = ({open, onClose, mode, categories, initialValues, onSubmit, onImgSubmit}) => {

    const theme = useTheme();

    const [imageFile, setImageFile] = useState(null);

    const handleImgSubmit = () => {
        if (!imageFile) return;

        onImgSubmit(imageFile);

        console.log("Uploading From Popup: ", imageFile);
    }

    return (
        <Popup title={mode === "add" ? "Add Product" : "Edit Product"} onClose={onClose} open={open} mode={mode}>

            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {({
                      values,
                      errors,
                      touched,
                      handleBlur,
                      handleChange,
                      handleSubmit,
                      setFieldValue,
                      setFieldTouched,
                      isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>

                        <Box display="grid"
                             gridTemplateColumns={mode === "edit" ? "minmax(250px, 1fr) minmax(250px, 1fr) minmax(250px, 1fr)" : "minmax(250px, 1fr) minmax(250px, 1fr)"}
                             gap="1rem">

                            {mode === "edit" && (
                                <Box
                                    sx={{
                                        gridColumn: "1",
                                        gridRow: "1 / 4",
                                        alignSelf: "stretched",
                                        position: 'relative',
                                    }}
                                >
                                    <ImageUploadBox
                                        initialImage={null}
                                        onFileSelect={setImageFile}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleImgSubmit}
                                        size="small"
                                        variant="contained"
                                        sx={{
                                            position: "absolute",
                                            bottom: 8,
                                            right: 8,
                                            minWidth: "unset",
                                            px: 1.5,
                                            py: 0.5,
                                            fontSize: "0.75rem",
                                            borderRadius: 1,
                                            zIndex: 2,
                                        }}
                                    >
                                        Upload
                                    </Button>

                                </Box>
                            )}

                            <TextField
                                fullWidth
                                variant="filled"
                                label="Product Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.name}
                                name="name"
                                error={!!touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                                sx={{
                                    gridColumn: mode === "edit" ? "2" : "1",
                                    gridRow: "1"
                                }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Base Price"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.basePrice}
                                name="basePrice"
                                error={!!touched.basePrice && !!errors.basePrice}
                                helperText={touched.basePrice && errors.basePrice}
                                sx={{
                                    gridColumn: mode === "edit" ? "2" : "1",
                                    gridRow: "2"
                                }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Cost"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.cost}
                                name="cost"
                                error={!!touched.cost && !!errors.cost}
                                helperText={touched.cost && errors.cost}
                                sx={{
                                    gridColumn: mode === "edit" ? "2" : "1",
                                    gridRow: "3"
                                }}

                            />
                            <TextField
                                select
                                fullWidth
                                variant="filled"
                                label="Category"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.category}
                                name="category"
                                error={!!touched.category && !!errors.category}
                                helperText={touched.category && errors.category}
                                sx={{
                                    gridColumn: mode === "edit" ? "3" : "2",
                                    gridRow: "1"
                                }}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                variant="filled"
                                multiline
                                label="Description"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.description}
                                name="description"
                                error={!!touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                sx={{
                                    gridColumn: mode === "edit" ? "3" : "2",
                                    gridRow: "2 / span 2",  // span both rows in the grid
                                    height: "100%",         // wrapper takes full grid height
                                    "& .MuiInputBase-root": {
                                        height: "100%",       // ensures the filled variant root stretches
                                    },
                                    "& .MuiInputBase-input": {
                                        height: "100%",       // textarea fills the root
                                        boxSizing: "border-box", // important to avoid overflow
                                    },
                                }}
                            />
                        </Box>
                        <Box display={"flex"} justifyContent={"flex-end"}>
                            <Box mt={"1rem"} display={"flex"} gap={2}>
                                <Button type={"submit"} sx={{backgroundColor: theme.palette.secondary.light}}>
                                    {isSubmitting
                                        ? <CircularProgress size={24} sx={{color: "white"}}/>
                                        : <Typography
                                            variant="h6"
                                            color={theme.palette.background.alt}
                                            sx={{fontWeight: 600}}
                                        >
                                            Submit
                                        </Typography>
                                    }
                                </Button>
                                <Button type={"reset"}>
                                    <Typography variant="h6"
                                                color={theme.palette.secondary.light}>Reset</Typography>
                                </Button>
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Popup>
    )
}
export default ProductFormPopup
