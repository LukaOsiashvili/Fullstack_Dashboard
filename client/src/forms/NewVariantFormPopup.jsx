import React from 'react'
import {Form, Formik} from 'formik';
import {Box, Button, CircularProgress, MenuItem, TextField, Typography, ThemeProvider, useTheme} from '@mui/material';
import Popup from "../components/Popup"
const ProductFormPopup = ({open, onClose, mode, initialValues, onSubmit}) => {

    const theme = useTheme();

    return (
        <Popup title={mode === "add" ? "Add Variant" : "Edit Product"} onClose={onClose} open={open} mode={mode}>

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

                        <Box display="grid" gridTemplateColumns="minmax(250px, 1fr) minmax(250px, 1fr)" gap="1rem">
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Variant Name"
                                placeholder="Color, Name, etc."
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.name}
                                name="color"
                                error={!!touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Variant Price"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.basePrice}
                                name="variantPrice"
                                error={!!touched.basePrice && !!errors.basePrice}
                                helperText={touched.basePrice && errors.basePrice}
                            />
                        </Box>
                        <Box display={"flex"} justifyContent={"flex-end"}>
                            <Box mt={"1rem"} display={"flex"} gap={2}>
                                <Button type={"submit"} sx={{backgroundColor: theme.palette.secondary.light}}>
                                    {isSubmitting
                                        ? <CircularProgress size={24} sx={{color: "white"}}/>
                                        : <Typography variant="h6"
                                                      color={theme.palette.background.alt}>Submit</Typography>
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
