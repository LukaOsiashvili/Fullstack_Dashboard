import React from 'react'
import {Form, Formik} from "formik";
import {Box, Button, CircularProgress, MenuItem, TextField, Typography, useTheme} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Popup from "../components/Popup";

const UserFormPopup = ({open, onClose, mode, initialValues, onSubmit}) => {


    const theme = useTheme();

    const roles = [
        {
            value: 'admin',
            text: 'Administrador',
        },
        {
            value: 'sales',
            text: 'Sales',
        },
        {
            value: 'laser',
            text: 'Laser',
        },
        {
            value: 'production',
            text: 'Production',
        }
    ]

    return (
        <Popup title={mode === "add" ? "Add User" : "Edit User"} open={open} onClose={onClose}>
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
                        <Box display={"flex"} gap={"1rem"}>
                            <Box flex={1} minWidth={"250px"} height={"100%"}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="First Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.firstName}
                                    name="firstName"
                                    error={!!touched.firstName && !!errors.firstName}
                                    helperText={touched.firstName && errors.firstName}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="Last Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    name="lastName"
                                    error={!!touched.lastName && !!errors.lastName}
                                    helperText={touched.lastName && errors.lastName}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="Username"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.username}
                                    name="username"
                                    error={!!touched.username && !!errors.username}
                                    helperText={touched.username && errors.username}
                                    margin="normal"
                                />
                            </Box>
                            <Box flex={1} minWidth={"250px"} height={"100%"}>
                                <TextField
                                    select
                                    fullWidth
                                    variant="filled"
                                    label="Role"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.role}
                                    name="role"
                                    error={!!touched.role && !!errors.role}
                                    helperText={touched.role && errors.role}
                                    margin="normal"
                                >
                                    {roles.map((role) => (
                                        <MenuItem value={role.value} key={role.value}>
                                            {role.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={dayjs(values.dob)}
                                        disableFuture
                                        onChange={(newValue) => setFieldValue("dob", newValue ? newValue.toDate() : "null")}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: "filled",
                                                margin: "normal",
                                                label: "Date of Birth",
                                                error: !!errors.dob && touched.dob,
                                                helperText: touched.dob && errors.dob,
                                                onBlur: () => setFieldTouched("dob", true),
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
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
                        </Box>
                    </Form>
                )}
            </Formik>
        </Popup>
    )
}
export default UserFormPopup
