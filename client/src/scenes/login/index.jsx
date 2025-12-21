import {useState} from "react";
import {useLoginMutation} from "../../state/apis/authApi";
import {useDispatch} from "react-redux";
import {setCredentials} from "state/authSlice";
import {useNavigate} from "react-router-dom";
import {Box, Button, FilledInput, FormControl, InputLabel, InputAdornment, IconButton, TextField, Typography, CircularProgress, useTheme} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import toast from "react-hot-toast"
import React from 'react'
import Navbar from "../../components/Navbar";

const initialValues = {
    username: '',
    password: '',
}

const Login = () => {
    const theme = useTheme();
    const [login] = useLoginMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const handleFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try{
            const response = await login(values).unwrap();
            console.log(response)
            dispatch(setCredentials({user: values.username, accessToken: response.accessToken}));
            navigate("/dashboard");
            toast.success("Login Successful");
        }catch(err){
            console.log(err);
            // alert("login failed")
            toast.error("Login Failed")
        }finally{
            setSubmitting(false);
            resetForm(true)
        }
    }

    const checkoutSchema = yup.object().shape({
        username: yup.string().required('Username is Required'),
        password: yup.string()
            .required('Password is Required')
            // .min(8, "The Password Must Be at Least 8 Characters Long")
            // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password Must Contain At Least: 1 Uppercase Letter, 1 Lowercase Letter, 1 Number")
    })


    return (
        // <Box height="100vh">
            //{/*<Navbar isLogIn={true}/>*/}
            <Box height="80vh" display="flex" justifyContent="center" alignItems="center">
                <Formik initialValues={initialValues} onSubmit={handleFormSubmit} validationSchema={checkoutSchema}>
                    {({
                          values,
                          errors,
                          touched,
                          handleBlur,
                          handleChange,
                          handleSubmit,
                          isSubmitting,
                      }) => (
                        <Form onSubmit={handleSubmit}>
                            <Box width={"40vh"} p={"1rem 0"} display={"flex"} flexDirection={"column"} alignItems={"center"} borderRadius={"10px"} sx={{backgroundColor: theme.palette.background.alt}}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Username"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.username}
                                    name="username"
                                    error={!!touched.username && !!errors.username}
                                    helperText={touched.username && errors.username}
                                    margin="normal"
                                    sx={{ m: "1rem 1.5rem 1rem 1.5rem", width: '90%' }}
                                />
                                <FormControl sx={{ m: "0 1.5rem 1rem 1.5rem", width: '90%' }} variant="filled">
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.password}
                                        name="password"
                                        error={!!touched.password && !!errors.password}
                                        helperText={touched.password && errors.password}
                                        margin="normal"
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <Button type={"submit"} sx={{ m: "0 1.5rem 1rem 1.5rem", width: '90%', backgroundColor: theme.palette.secondary.light }}>
                                    {isSubmitting
                                        ? <CircularProgress size={24} sx={{ color: "white" }} />
                                        : <Typography variant="h6" color={theme.palette.background.alt}>Submit</Typography>
                                    }
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        // </Box>
    )
}
export default Login
