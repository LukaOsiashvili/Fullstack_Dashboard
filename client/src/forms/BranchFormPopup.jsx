import React, {useState} from 'react'
import {Form, Formik} from 'formik';
import {Box, Button, CircularProgress, MenuItem, TextField, Typography, ThemeProvider, useTheme} from '@mui/material';
import Popup from "../components/Popup"
import ImageUploadBox from "../components/ImageUploadBox";

const BranchFormPopup = ({open, onClose, mode, cities, initialValues, onSubmit, onImgSubmit}) => {

    const theme = useTheme();

    const [imageFile, setImageFile] = useState(null);

    const handleImgSubmit = () => {
        if (!imageFile) return;

        onImgSubmit(imageFile);

        console.log("Uploading From Popup: ", imageFile);
    }

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

                        <Box display="grid"
                             gridTemplateColumns={mode==="edit" ? "minmax(250px, 1fr) minmax(250px, 1fr)" : "minmax(250px, 1fr)"}
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
                                label="Branch Name"
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
                                sx={{
                                    gridColumn: mode === "edit" ? "2" : "1",
                                    gridRow: "2"
                                }}
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
                                sx={{
                                    gridColumn: mode === "edit" ? "2" : "1",
                                    gridRow: "3"
                                }}

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
export default BranchFormPopup
