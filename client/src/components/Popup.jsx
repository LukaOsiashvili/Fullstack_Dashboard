import React from 'react'
import {Dialog, DialogTitle, DialogContent, IconButton, useTheme} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";

const Popup = ({title, children, open, onClose}) => {

    const theme = useTheme();

    const handleDialogClose = (event, reason) => {
        if (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) {
            return;
        }

        onClose?.();
    };

    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth={"md"}>
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: theme.palette.primary[600]
                }}
            >
                {title}
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{backgroundColor: theme.palette.primary[600]}}>
                {children}
            </DialogContent>
        </Dialog>
    )
}
export default Popup
