import React from 'react'
import {Form, Formik} from 'formik';
import {Box, Button, CircularProgress, MenuItem, TextField, Typography, ThemeProvider, useTheme} from '@mui/material';
import Popup from "../components/Popup"
const ProductFormPopup = ({open, onClose, mode, cities, initialValues, onSubmit}) => {

    const theme = useTheme();

    return (
        <Popup title={mode === "add" ? "Add Branch" : "Edit Branch"} onClose={onClose} open={open} mode={mode}>

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
                                label="Branch Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.name}
                                name="name"
                                error={!!touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                            />
                            <TextField
                                select
                                fullWidth
                                variant="filled"
                                label="City"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.location.city}
                                name="location.city"
                                error={!!touched.location?.city && !!errors.location?.city}
                                helperText={touched.location?.city && errors.location?.city}
                            >
                                {cities.map((city) => (
                                    <MenuItem key={city} value={city}>
                                        {city}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                variant="filled"
                                label="Address"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.location.address}
                                name="location.address"
                                error={!!touched.location?.address && !!errors.location?.address}
                                helperText={touched.location?.address && errors.location?.address}

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
