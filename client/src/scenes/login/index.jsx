import {useState} from "react";
import {useLoginMutation} from "../../state/apis/authApi";
import {useDispatch} from "react-redux";
import {setCredentials} from "state/authSlice";
import {useNavigate} from "react-router-dom";
import {
    Alert,
    alpha,
    Box,
    Button,
    CircularProgress,
    Collapse,
    Fade,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import {Form, Formik} from 'formik';
import * as yup from 'yup';
import toast from "react-hot-toast";

const validationSchema = yup.object().shape({
    username: yup.string()
        .required('Username is required'),
    password: yup.string()
        .required('Password is required'),
});

const initialValues = {
    username: '',
    password: '',
};

const Login = () => {
    const theme = useTheme();

    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isDark = theme.palette.mode === 'dark';

    const [login] = useLoginMutation();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleFormSubmit = async (values, {setSubmitting}) => {
        setLoginError(null);

        try {
            const response = await login(values).unwrap();
            dispatch(setCredentials({
                user: values.username,
                accessToken: response.accessToken,
            }));
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            const errorMessage = err?.data?.message || "Invalid credentials. Please try again.";
            setLoginError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const paperStyleDarkElevated = {
        backgroundColor: isDark ? theme.palette.primary[600] : theme.palette.grey[50],
        border: `1px solid ${alpha(isDark ? theme.palette.primary[300] : theme.palette.grey[200], 0.3)}`,
        boxShadow: isDark
            ? `0 0 60px ${alpha(theme.palette.secondary[500], 0.15)}`
            : `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
    };

    return (
        <Box
            sx={{
                height: "90vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: isDark
                    ? `radial-gradient(circle at 50% 50%, 
                          ${theme.palette.primary[500]} 0%, 
                          ${theme.palette.primary[600]} 40%,
                          ${theme.palette.primary[700]} 100%)`
                    : `radial-gradient(circle at 50% 50%, 
                          ${theme.palette.grey[50]} 0%, 
                          ${theme.palette.grey[100]} 40%,
                          ${theme.palette.grey[200]} 100%)`,
                p: 2,
            }}
        >
            <Fade in timeout={500}>
                <Paper
                    elevation={0}
                    sx={{
                        width: "100%",
                        maxWidth: 420,
                        p: {xs: 3, sm: 4},
                        borderRadius: 3,
                        ...(paperStyleDarkElevated),
                    }}
                >
                    {/* Header */}
                    <Stack alignItems="center" spacing={1} sx={{mb: 3}}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: `radial-gradient(circle at 30% 30%, 
                                              ${theme.palette.secondary[400]}, 
                                              ${theme.palette.secondary[600]})`,
                                boxShadow: `0 4px 20px ${alpha(theme.palette.secondary[500], 0.4)}`,
                                mb: 1,
                            }}
                        >
                            <LockOutlinedIcon sx={{fontSize: 30, color: theme.palette.primary[700]}}/>
                        </Box>

                        <Typography
                            variant="h3"
                            fontWeight={700}
                            color={isDark ? theme.palette.grey[100] : theme.palette.primary[700]}
                        >
                            Welcome Back
                        </Typography>

                        <Typography
                            variant="body1"
                            color={isDark ? theme.palette.grey[300] : theme.palette.grey[600]}
                            textAlign="center"
                        >
                            Sign in to your dashboard
                        </Typography>
                    </Stack>

                    {/* Error Alert */}
                    <Collapse in={Boolean(loginError)}>
                        <Alert
                            severity="error"
                            onClose={() => setLoginError(null)}
                            sx={{mb: 2, borderRadius: 2}}
                        >
                            {loginError}
                        </Alert>
                    </Collapse>

                    <Formik
                        initialValues={initialValues}
                        onSubmit={handleFormSubmit}
                        validationSchema={validationSchema}
                    >
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
                                <Stack spacing={2.5}>
                                    {/* Username Field */}
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        label="Username"
                                        name="username"
                                        autoComplete="off"
                                        autoFocus
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.username && Boolean(errors.username)}
                                        helperText={touched.username && errors.username}
                                        disabled={isSubmitting}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutlineIcon
                                                            sx={{
                                                                color: touched.username && errors.username
                                                                    ? 'error.main'
                                                                    : theme.palette.grey[400]
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: alpha(
                                                    isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                    isDark ? 0.5 : 0.8
                                                ),
                                                '&:hover': {
                                                    backgroundColor: alpha(
                                                        isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                        isDark ? 0.7 : 1
                                                    ),
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: alpha(
                                                        isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                        isDark ? 0.7 : 1
                                                    ),
                                                },
                                            },
                                        }}
                                    />

                                    {/* Password Field */}
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password}
                                        disabled={isSubmitting}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlinedIcon
                                                            sx={{
                                                                color: touched.password && errors.password
                                                                    ? 'error.main'
                                                                    : theme.palette.grey[400]
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}
                                                            edge="end"
                                                            disabled={isSubmitting}
                                                            size="small"
                                                        >
                                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: alpha(
                                                    isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                    isDark ? 0.5 : 0.8
                                                ),
                                                '&:hover': {
                                                    backgroundColor: alpha(
                                                        isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                        isDark ? 0.7 : 1
                                                    ),
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: alpha(
                                                        isDark ? theme.palette.primary[700] : theme.palette.grey[100],
                                                        isDark ? 0.7 : 1
                                                    ),
                                                },
                                            },
                                        }}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={isSubmitting}
                                        sx={{
                                            py: 1.5,
                                            mt: 1,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            borderRadius: 2,
                                            color: theme.palette.primary[700],
                                            background: `radial-gradient(circle at 30% 30%, 
                                                            ${theme.palette.secondary[400]}, 
                                                            ${theme.palette.secondary[500]})`,
                                            boxShadow: `0 4px 16px ${alpha(theme.palette.secondary[500], 0.4)}`,
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 24px ${alpha(theme.palette.secondary[500], 0.5)}`,
                                                background: `radial-gradient(circle at 30% 30%, 
                                                                ${theme.palette.secondary[300]}, 
                                                                ${theme.palette.secondary[400]})`,
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                            },
                                            '&.Mui-disabled': {
                                                background: theme.palette.grey[400],
                                                color: theme.palette.grey[600],
                                            },
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <CircularProgress size={24} sx={{color: theme.palette.primary[700]}}/>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </Stack>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Fade>
        </Box>
    );
};

export default Login;
