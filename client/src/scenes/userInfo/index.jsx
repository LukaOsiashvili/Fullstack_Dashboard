import React, {useState, useRef, useEffect} from 'react'
import {Avatar, Box, Button, CircularProgress, TextField, Typography, useTheme, styled} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {Form, Formik} from "formik";
import FlexBetween from "../../components/FlexBetween";
import {
    useGetAvatarQuery,
    useGetUserInfoQuery,
    useUpdateUserInfoMutation,
    useUploadAvatarMutation
} from "../../state/apis/api"
import Header from "../../components/Header";
import * as yup from "yup";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const UserInfo = () => {

    const theme = useTheme()
    const [updating, setUpdating] = useState(false);
    const [submitting, setSubmittingState] = useState(false);

    const {data, isLoading} = useGetUserInfoQuery()
    const [updateUser] = useUpdateUserInfoMutation()

    const {data: avatarData, isLoading: avatarIsLoading} = useGetAvatarQuery();
    const avatar = avatarData?.image || "";
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadAvatar] = useUploadAvatarMutation();

    useEffect(() => {
        return () => {
            if (selectedFile) {
                URL.revokeObjectURL(selectedFile);
            }
        };
    }, [selectedFile]);

    const fileInputRef = useRef(null);

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }else{
            setSelectedFile(file);
        }
    }

    const formikRef = useRef();

    const handleFormSubmit = async (values, {setSubmitting}) => {
        try {
            const response = updateUser(values).unwrap();

            if (selectedFile) {
                await uploadAvatar(selectedFile).unwrap();
                toast.success("Avatar uploaded successfully!");
            }

            toast.success("User Information Updated Successfully");
        } catch (error) {
            console.log(error);
            toast.error("User Information Update Failed");
        } finally {
            setSubmitting(false);
            setSubmittingState(false);
            setUpdating(false);
            setSelectedFile(null);
        }
    }

    const checkoutSchema = yup.object().shape({
        firstName: yup.string().required("First Name is Required"),
        lastName: yup.string().required("Last Name is Required"),
        username: yup.string().required("Username is Required"),
        dob: yup.date().required("DOB is Required")
    })

    return (
        <Box m={"1.5rem 2.5rem"} display="flex" flexDirection="column">

            <Header title={"Personal Information"} subtitle={"View or Update Your Personal Information"}/>


            {!data
                ? <Typography>Loading...</Typography>
                : (
                    <Formik
                        innerRef={formikRef}
                        enableReinitialize={!!data}
                        initialValues={
                            {
                                firstName: data.firstName,
                                lastName: data.lastName,
                                username: data.username,
                                dob: data.dob.split("T")[0],
                            }}
                        onSubmit={handleFormSubmit}
                        validationSchema={checkoutSchema}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleBlur,
                              handleChange,
                              handleSubmit,
                              isSubmitting,
                              setFieldValue,
                              setFieldTouched
                          }) => (
                            <>

                                <FlexBetween mt={"2rem"}>
                                    <FlexBetween gap={2}>
                                        <Avatar src={selectedFile ? URL.createObjectURL(selectedFile) : avatarIsLoading ? "" : avatar} sx={{backgroundColor: theme.palette.primary.main, width: "100px", height: "100px"}} variant={"rounded"}/>
                                        <Button
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            tabIndex={-1}
                                            startIcon={<CloudUploadIcon />}
                                            disabled={!updating}
                                        >
                                            Upload files
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                    </FlexBetween>
                                    <Box>
                                        <Button
                                            onClick={() => {
                                                if (updating) {
                                                    setSubmittingState(true);
                                                    formikRef.current.submitForm();
                                                }
                                                setUpdating(true);
                                            }}
                                            sx={{
                                                backgroundColor: theme.palette.secondary.light,
                                                color: theme.palette.background.alt,
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                                padding: "10px 20px",
                                            }}
                                            type={updating ? 'submit' : 'button'}
                                        >
                                            {!updating
                                                ? <>
                                                    <EditIcon sx={{mr: "10px"}}/>
                                                    Update Information
                                                </>
                                                :
                                                submitting
                                                    ? <CircularProgress size={24}
                                                                        sx={{color: theme.palette.primary.light}}/>
                                                    : <>
                                                        <CloudDoneRoundedIcon sx={{mr: "10px"}}/>
                                                        Save Information
                                                    </>
                                            }

                                        </Button>
                                    </Box>
                                </FlexBetween>
                                <Form onSubmit={handleSubmit}>
                                    <Box mt={"1rem"}>
                                        <FlexBetween gap={2}>
                                            <Box flex={1}>
                                                <Typography>
                                                    First Name
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    disabled={!updating}
                                                    variant={"filled"}
                                                    type="text"
                                                    margin={"dense"}
                                                    name={"firstName"}
                                                    value={values.firstName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={!!touched.firstName && !!errors.firstName}
                                                    helperText={touched.firstName && errors.firstName}
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Typography>
                                                    Last Name
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    disabled={!updating}
                                                    variant={"filled"}
                                                    type="text"
                                                    margin={"dense"}
                                                    name={"lastName"}
                                                    value={values.lastName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={!!touched.lastName && !!errors.lastName}
                                                    helperText={touched.lastName && errors.lastName}
                                                />
                                            </Box>
                                        </FlexBetween>
                                        <FlexBetween gap={2}>
                                            <Box flex={1}>
                                                <Typography>
                                                    Username
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    disabled={!updating}
                                                    variant={"filled"}
                                                    type="text"
                                                    margin={"dense"}
                                                    name={"username"}
                                                    value={values.username}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={!!touched.username && !!errors.username}
                                                    helperText={touched.username && errors.username}
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Typography>
                                                    Date of Birth
                                                </Typography>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        disabled={!updating}
                                                        value={dayjs(values.dob)}
                                                        disableFuture
                                                        onChange={(newValue) => setFieldValue("dob", newValue ? newValue.toDate() : "null")}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                variant: "filled",
                                                                margin: "dense",
                                                                error: !!errors.dob && touched.dob,
                                                                helperText: touched.dob && errors.dob,
                                                                onBlur: () => setFieldTouched("dob", true),
                                                                sx: {
                                                                    "& .MuiInputBase-input.Mui-disabled": {
                                                                        color: "rgba(0, 0, 255, 1)"  // typical gray for disabled text
                                                                    }
                                                                }
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </Box>
                                        </FlexBetween>
                                    </Box>
                                </Form>
                            </>
                        )}
                    </Formik>
                )
            }

        </Box>
    )
}
export default UserInfo
