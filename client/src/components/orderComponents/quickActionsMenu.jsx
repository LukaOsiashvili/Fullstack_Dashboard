import React from 'react';
import {Divider, ListItemIcon, ListItemText, MenuItem, Menu} from "@mui/material";
// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import TimelineIcon from "@mui/icons-material/Timeline";
import CancelIcon from "@mui/icons-material/Close";


// Quick Actions Menu Component
const QuickActionsMenu = ({ anchorEl, open, onClose, order, onAction }) => {
    if (!order) return null;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={() => { onAction('view', order); onClose(); }}>
                <ListItemIcon>
                    <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onAction('edit', order); onClose(); }}>
                <ListItemIcon>
                    <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Order</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onAction('status', order); onClose(); }}>
                <ListItemIcon>
                    <TimelineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Change Status</ListItemText>
            </MenuItem>
            <Divider />
            {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                <MenuItem
                    onClick={() => { onAction('cancel', order); onClose(); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <CancelIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Cancel Order</ListItemText>
                </MenuItem>
            )}
        </Menu>
    );
};

export default QuickActionsMenu;
