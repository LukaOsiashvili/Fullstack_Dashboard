// import React, {useState} from 'react'
// import Header from "components/Header"
// import FlexBetween from "components/FlexBetween";
// import Popup from "components/Popup";
// import CustomToolbar from "components/CustomToolbar";
// import UserFormPopup from "forms/UserFormPopup";
// import toast from "react-hot-toast";
// import {
//     Box,
//     Button,
//     Typography,
//     useTheme
// } from '@mui/material'
// import {
//     DataGrid,
//     GridActionsCellItem,
// } from "@mui/x-data-grid"
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import WarningIcon from '@mui/icons-material/Warning';
// import {useDeleteUserByIdMutation, useGetAllUsersQuery, useUpdateUserByIdMutation} from "state/apis/api";
// import {useRegisterMutation} from "state/apis/authApi";
//
// const AllUsers = () => {
//
//     // Define Theme
//     const theme = useTheme();
//
//     // Define State Vars
//     const [open, setOpen] = useState(false);
//     const [selectedUser, setSelectedUser] = useState(null);
//
//     // Define State Vars for User Deletion Feature
//     const [confirmationTabOpen, setConfirmationTabOpen] = useState(false);
//     const [deleteId, setDeleteId] = useState(null);
//
//     // Define RTK Query and Mutation Functions
//     const {data, isLoading} = useGetAllUsersQuery();
//     const [register] = useRegisterMutation();
//     const [updateUserById] = useUpdateUserByIdMutation();
//     const [deleteUserById] = useDeleteUserByIdMutation();
//
//     // Define Initial Values for Formik Form
//     const initialValues = {
//         firstName: '',
//         lastName: '',
//         username: '',
//         role: '',
//         dob: ''
//     }
//
//     // Render Action Icons in Grid
//     const handleEditClick = (id) => () => {
//         setSelectedUser(data.find((user) => user._id === id));
//         setOpen(true);
//     }
//
//     const handleDeleteClick = (id) => () => {
//         setConfirmationTabOpen(true);
//         setDeleteId(id);
//     }
//
//     // Define Functions for Data Manipulation and Make API Requests
//     const handleFormSubmit = async (values, {setSubmitting, resetForm}) => {
//         try {
//             await register(values);
//             toast.success("New User Created Successfully!");
//         } catch (error) {
//             console.log(error)
//             toast.error("User Creation Failed!")
//         } finally {
//             setSubmitting(false);
//             resetForm();
//         }
//     }
//
//     const processRowUpdate = async (newRow) => {
//         const updatedRow = {...newRow};
//         const id = updatedRow._id;
//         try {
//             await updateUserById({updatedData: updatedRow, id}).unwrap();
//             toast.success("User Updated Successfully");
//         } catch (error) {
//             console.log(error);
//             toast.error("User Update Failed");
//         } finally {
//             setOpen(false);
//         }
//     }
//
//     const deleteItem = async () => {
//         try {
//             await deleteUserById(deleteId);
//             toast.success("User Deleted");
//         } catch (error) {
//             console.log(error);
//             toast.error("User Deleted");
//         } finally {
//             setConfirmationTabOpen(false);
//             setDeleteId(null);
//         }
//     }
//
//     // Define Popup Window Close Function
//     const handleCancelDelete = () => {
//         setConfirmationTabOpen(false);
//         setDeleteId(null);
//     };
//
//
//     // Define Columns for DataGrid
//     const columns = [
//         {
//             field: 'firstName',
//             headerName: "First Name",
//             flex: 0.75,
//         },
//         {
//             field: 'lastName',
//             headerName: "Last Name",
//             flex: 0.75,
//         },
//         {
//             field: 'dob',
//             headerName: "Date of Birth",
//             flex: 0.75,
//         },
//         {
//             field: 'role',
//             headerName: "Role",
//             flex: 0.75,
//             valueOptions: ['admin', 'sales', 'laser', 'production'],
//             renderCell: (params) => {
//                 const colors = {
//                     admin: 'rgba(0,255,0,0.75)',
//                     sales: 'rgba(0,149,255,0.91)',
//                     laser: '#fcba03',
//                     production: '#00ff9d',
//                 };
//
//                 const labels = {
//                     admin: 'Admin',
//                     sales: 'Sales',
//                     laser: 'Laser Operator',
//                     production: 'Production',
//                 };
//
//                 return (
//                     <span
//                         style={{
//                             border: `2px solid ${colors[params.value]}`,
//                             borderRadius: '50px',
//                             padding: '2px 10px',
//                             fontSize: '0.875rem',
//                             fontWeight: 500,
//                             color: colors[params.value]
//                         }}
//                     >
//                         {labels[params.value]}
//                     </span>
//                 );
//             },
//         },
//         {
//             field: 'active',
//             headerName: "Active Status",
//             flex: 0.5,
//             type: 'boolean',
//
//         },
//         {
//             field: 'actions',
//             headerName: "Actions",
//             flex: 1,
//             type: 'actions',
//             cellClassName: 'actions',
//             getActions: ({id}) => {
//                 return [
//                     <GridActionsCellItem
//                         icon={<EditIcon/>}
//                         label={"Edit"}
//                         className={"textPrimary"}
//                         onClick={handleEditClick(id)}
//                         color={"inherit"}
//                     />,
//                     <GridActionsCellItem
//                         icon={<DeleteIcon/>}
//                         label={"Delete"}
//                         onClick={handleDeleteClick(id)}
//                         color={"inherit"}
//                     />
//                 ]
//             }
//         },
//     ]
//
//     return (
//         <Box m={"1.5rem 2.5rem"}>
//             <Header title={"All Users"} subtitle={"View or Update All Users' Information"}/>
//             <Box
//                 mt={"1rem"}
//                 height={"70vh"}
//                 sx={{
//                     "& .MuiDataGrid-root": {
//                         border: "none",
//                     },
//                     "& .MuiDataGrid-cell": {
//                         borderBottom: "none",
//                     },
//                     "& .MuiDataGrid-columnHeader ": {
//                         backgroundColor: `${theme.palette.background.alt} !important`,
//                         color: theme.palette.secondary[200],
//                         borderBottom: "none",
//                     },
//                     "& .MuiDataGrid-columnHeaders": {
//                         backgroundColor: `${theme.palette.background.alt} !important`,
//                         color: theme.palette.secondary[100],
//                         borderBottom: "none",
//                     },
//
//                     "& .MuiDataGrid-columnSeparator": {
//                         backgroundColor: `${theme.palette.background.alt} !important`,
//                     },
//                     "& .MuiDataGrid-scrollbarFiller--header": {
//                         backgroundColor: `${theme.palette.background.alt} !important`,
//                     },
//                     "& .MuiDataGrid-virtualScroller": {
//                         backgroundColor: theme.palette.primary.light,
//                     },
//                     "& .MuiDataGrid-footerContainer": {
//                         backgroundColor: theme.palette.background.alt,
//                         color: theme.palette.secondary[100],
//                         borderTop: "none",
//                     },
//                     "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
//                         color: `${theme.palette.secondary[200]} !important`,
//                     },
//                 }}
//             >
//                 <DataGrid
//                     loading={isLoading || !data}
//                     getRowId={(row) => row._id}
//                     rows={data || []}
//                     columns={columns}
//                     editMode={"row"}
//                     slots={{
//                         toolbar: () => (
//                             <CustomToolbar
//                                 onAddClick={() => {
//                                     setSelectedUser(null);
//                                     setOpen(true);
//                                 }}
//                             />
//                         )
//                     }}
//                     showToolbar
//                     disableColumnResize
//                     disableRowSelectionOnClick
//                 />
//                 <UserFormPopup
//                     open={open}
//                     onClose={() => {
//                         setOpen(false)
//                     }}
//                     mode={selectedUser ? "edit" : "add"}
//                     initialValues={selectedUser || initialValues}
//                     onSubmit={selectedUser ? processRowUpdate : handleFormSubmit}
//                 />
//                 <Popup title="Confirm Delete" open={confirmationTabOpen} onClose={handleCancelDelete}>
//                     <Box p={2}>
//                         <FlexBetween flexDirection="column" alignItems={"center"}>
//                             <WarningIcon sx={{color: "red", fontSize: "10rem"}}/>
//                             <Typography variant="h4">Wait!</Typography>
//                             <Typography variant="h6">Are you sure you want to delete this user? </Typography>
//                             <Typography variant="h6">This action can not be reversed!</Typography>
//
//                         </FlexBetween>
//                         <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
//                             <Button onClick={handleCancelDelete} color="secondary">
//                                 Cancel
//                             </Button>
//                             <Button onClick={deleteItem} sx={{backgroundColor: theme.palette.secondary.light}}>
//                                 Delete
//                             </Button>
//                         </Box>
//                     </Box>
//                 </Popup>
//             </Box>
//         </Box>
//     )
// }
// export default AllUsers

import React, {useEffect, useState} from 'react'
import Header from "components/Header"
import FlexBetween from "components/FlexBetween";
import Popup from "components/Popup";
import CustomToolbar from "components/CustomToolbar";
import UserFormPopup from "forms/UserFormPopup";
import toast from "react-hot-toast";
import {
    Box,
    Button,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material'
import {
    DataGrid,
    GridActionsCellItem,
} from "@mui/x-data-grid"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import {useDeleteUserByIdMutation, useGetAllUsersQuery, useUpdateUserByIdMutation} from "state/apis/api";
import {useRegisterMutation} from "state/apis/authApi";
import {grid} from "@mui/system";

const AllUsers = () => {

    // Define Theme
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Define State Vars
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Define State Vars for User Deletion Feature
    const [confirmationTabOpen, setConfirmationTabOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Define RTK Query and Mutation Functions
    const {data, isLoading} = useGetAllUsersQuery();
    const [register] = useRegisterMutation();
    const [updateUserById] = useUpdateUserByIdMutation();
    const [deleteUserById] = useDeleteUserByIdMutation();

    // Define Initial Values for Formik Form
    const initialValues = {
        firstName: '',
        lastName: '',
        username: '',
        role: '',
        dob: ''
    }

    // Render Action Icons in Grid
    const handleEditClick = (id) => () => {
        setSelectedUser(data.find((user) => user._id === id));
        setOpen(true);
    }

    const handleDeleteClick = (id) => () => {
        setConfirmationTabOpen(true);
        setDeleteId(id);
    }

    // Define Functions for Data Manipulation and Make API Requests
    const handleFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try {
            await register(values);
            toast.success("New User Created Successfully!");
        } catch (error) {
            console.log(error)
            toast.error("User Creation Failed!")
        } finally {
            setSubmitting(false);
            resetForm();
        }
    }

    const processRowUpdate = async (newRow) => {
        const updatedRow = {...newRow};
        const id = updatedRow._id;
        try {
            await updateUserById({updatedData: updatedRow, id}).unwrap();
            toast.success("User Updated Successfully");
        } catch (error) {
            console.log(error);
            toast.error("User Update Failed");
        } finally {
            setOpen(false);
        }
    }

    const deleteItem = async () => {
        try {
            await deleteUserById(deleteId);
            toast.success("User Deleted");
        } catch (error) {
            console.log(error);
            toast.error("User Delete Failed");
        } finally {
            setConfirmationTabOpen(false);
            setDeleteId(null);
        }
    }

    // Define Popup Window Close Function
    const handleCancelDelete = () => {
        setConfirmationTabOpen(false);
        setDeleteId(null);
    };


    // Define Columns for DataGrid
    // const columns = [
    //     {
    //         field: 'firstName',
    //         headerName: "First Name",
    //         flex: isMobile ? 0 : 0.75,
    //         minWidth: 120,
    //     },
    //     {
    //         field: 'lastName',
    //         headerName: "Last Name",
    //         flex: isMobile ? 0 : 0.75,
    //         minWidth: 120,
    //     },
    //     {
    //         field: 'dob',
    //         headerName: "Date of Birth",
    //         flex: isMobile ? 0 : 0.75,
    //         minWidth: 130,
    //     },
    //     {
    //         field: 'role',
    //         headerName: "Role",
    //         flex: isMobile ? 0 : 0.75,
    //         minWidth: 150,
    //         valueOptions: ['admin', 'sales', 'laser', 'production'],
    //         renderCell: (params) => {
    //             const colors = {
    //                 admin: 'rgba(0,255,0,0.75)',
    //                 sales: 'rgba(0,149,255,0.91)',
    //                 laser: '#fcba03',
    //                 production: '#00ff9d',
    //             };
    //
    //             const labels = {
    //                 admin: 'Admin',
    //                 sales: 'Sales',
    //                 laser: 'Laser Operator',
    //                 production: 'Production',
    //             };
    //
    //             return (
    //                 <span
    //                     style={{
    //                         border: `2px solid ${colors[params.value]}`,
    //                         borderRadius: '50px',
    //                         padding: '2px 10px',
    //                         fontSize: '0.875rem',
    //                         fontWeight: 500,
    //                         color: colors[params.value]
    //                     }}
    //                 >
    //                     {labels[params.value]}
    //                 </span>
    //             );
    //         },
    //     },
    //     {
    //         field: 'active',
    //         headerName: "Active Status",
    //         flex: isMobile ? 0 : 0.5,
    //         minWidth: 100,
    //         type: 'boolean',
    //
    //     },
    //     {
    //         field: 'actions',
    //         headerName: "Actions",
    //         flex: isMobile ? 0 : 1,
    //         minWidth: 100,
    //         type: 'actions',
    //         cellClassName: 'actions',
    //         getActions: ({id}) => {
    //             return [
    //                 <GridActionsCellItem
    //                     icon={<EditIcon/>}
    //                     label={"Edit"}
    //                     className={"textPrimary"}
    //                     onClick={handleEditClick(id)}
    //                     color={"inherit"}
    //                 />,
    //                 <GridActionsCellItem
    //                     icon={<DeleteIcon/>}
    //                     label={"Delete"}
    //                     onClick={handleDeleteClick(id)}
    //                     color={"inherit"}
    //                 />
    //             ]
    //         }
    //     },
    // ]

    const columns = [
        {
            field: 'firstName',
            headerName: "First Name",
            flex: 0.75,
            minWidth: isMobile ? 120 : undefined,
        },
        {
            field: 'lastName',
            headerName: "Last Name",
            flex: 0.75,
            minWidth: isMobile ? 120 : undefined,
        },
        {
            field: 'dob',
            headerName: "Date of Birth",
            flex: 0.75,
            minWidth: isMobile ? 130 : undefined,
        },
        {
            field: 'role',
            headerName: "Role",
            flex: 0.75,
            minWidth: isMobile ? 150 : undefined,
            valueOptions: ['admin', 'sales', 'laser', 'production'],
            renderCell: (params) => {
                const colors = {
                    admin: 'rgba(0,255,0,0.75)',
                    sales: 'rgba(0,149,255,0.91)',
                    laser: '#fcba03',
                    production: '#00ff9d',
                };

                const labels = {
                    admin: 'Admin',
                    sales: 'Sales',
                    laser: 'Laser Operator',
                    production: 'Production',
                };

                return (
                    <span
                        style={{
                            border: `2px solid ${colors[params.value]}`,
                            borderRadius: '50px',
                            padding: '2px 10px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: colors[params.value]
                        }}
                    >
                        {labels[params.value]}
                    </span>
                );
            },
        },
        {
            field: 'active',
            headerName: "Active Status",
            flex: 0.5,
            minWidth: isMobile ? 100 : undefined,
            type: 'boolean',

        },
        {
            field: 'actions',
            headerName: "Actions",
            flex: 1,
            minWidth: isMobile ? 100 : undefined,
            type: 'actions',
            cellClassName: 'actions',
            getActions: ({id}) => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label={"Edit"}
                        className={"textPrimary"}
                        onClick={handleEditClick(id)}
                        color={"inherit"}
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label={"Delete"}
                        onClick={handleDeleteClick(id)}
                        color={"inherit"}
                    />
                ]
            }
        },
    ]
    return (
        <Box m={isMobile ? "1rem" : isTablet ? "1.5rem" : "1.5rem 2.5rem"}>
            <Header title={"All Users"} subtitle={"View or Update All Users' Information"}/>
            <Box
                mt={"1rem"}
                height={isMobile ? "calc(100vh - 200px)" : "70vh"}
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-columnHeader ": {
                        backgroundColor: `${theme.palette.background.alt} !important`,
                        color: theme.palette.secondary[200],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: `${theme.palette.background.alt} !important`,
                        color: theme.palette.secondary[100],
                        borderBottom: "none",
                    },

                    "& .MuiDataGrid-columnSeparator": {
                        backgroundColor: `${theme.palette.background.alt} !important`,
                    },
                    "& .MuiDataGrid-scrollbarFiller--header": {
                        backgroundColor: `${theme.palette.background.alt} !important`,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: theme.palette.primary.light,
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: theme.palette.background.alt,
                        color: theme.palette.secondary[100],
                        borderTop: "none",
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${theme.palette.secondary[200]} !important`,
                    },
                }}
            >
                <DataGrid
                    loading={isLoading || !data}
                    getRowId={(row) => row._id}
                    rows={data || []}
                    columns={columns}
                    editMode={"row"}
                    slots={{
                        toolbar: () => (
                            <CustomToolbar
                                onAddClick={() => {
                                    setSelectedUser(null);
                                    setOpen(true);
                                }}
                            />
                        )
                    }}
                    showToolbar
                    disableColumnResize
                    disableRowSelectionOnClick
                    columnBuffer={2}
                    columnThreshold={2}
                />
                <UserFormPopup
                    open={open}
                    onClose={() => {
                        setOpen(false)
                    }}
                    mode={selectedUser ? "edit" : "add"}
                    initialValues={selectedUser || initialValues}
                    onSubmit={selectedUser ? processRowUpdate : handleFormSubmit}
                />
                <Popup title="Confirm Delete" open={confirmationTabOpen} onClose={handleCancelDelete}>
                    <Box p={2}>
                        <FlexBetween flexDirection="column" alignItems={"center"}>
                            <WarningIcon sx={{color: "red", fontSize: "10rem"}}/>
                            <Typography variant="h4">Wait!</Typography>
                            <Typography variant="h6">Are you sure you want to delete this user? </Typography>
                            <Typography variant="h6">This action can not be reversed!</Typography>

                        </FlexBetween>
                        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                            <Button onClick={handleCancelDelete} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={deleteItem} sx={{backgroundColor: theme.palette.secondary.light}}>
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </Popup>
            </Box>
        </Box>
    )
}
export default AllUsers