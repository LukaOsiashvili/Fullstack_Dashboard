import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupIcon from '@mui/icons-material/Group';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const ActionMenu = ({anchorEl, order, onClose, onAction, actions}) => (
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
    >
        <MenuItem onClick={() => {
            onAction(actions.VIEW, order);
            onClose();
        }}
        >
            <ListItemIcon>
                <VisibilityIcon fontSize="small"/>
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
            onClick={() => {
                onAction(actions.EDIT, order);
                onClose();
            }}
            disabled={order?.status !== 'PENDING'}
        >
            <ListItemIcon>
                <EditIcon fontSize="small"/>
            </ListItemIcon>
            <ListItemText>Edit Order</ListItemText>
        </MenuItem>

        <Divider/>

        {order?.status === 'PENDING' && (
            <MenuItem onClick={() => {
                onAction(actions.ASSIGN_CUTTING, order);
                onClose();
            }}
            >
                <ListItemIcon>
                    <PersonIcon fontSize="small"/>
                </ListItemIcon>
                <ListItemText>Assign Cutting</ListItemText>
            </MenuItem>
        )}

        {order?.status === 'PENDING' && order?.assignedToCutting && (
            <MenuItem onClick={() => {
                onAction(actions.START_CUTTING, order);
                onClose();
            }}
            >
                <ListItemIcon>
                    <PlayArrowIcon fontSize="small"/>
                </ListItemIcon>
                <ListItemText>Start Cutting</ListItemText>
            </MenuItem>
        )}

        {order?.status === 'CUTTING' && (
            <MenuItem onClick={() => {
                onAction(actions.ASSIGN_PRODUCTION, order);
                onClose();
            }}
            >
                <ListItemIcon>
                    <GroupIcon fontSize="small"/>
                </ListItemIcon>
                <ListItemText>Assign Production</ListItemText>
            </MenuItem>
        )}

        {order?.status === 'CUTTING' && order?.assignedToProduction && (
            <MenuItem onClick={() => {
                onAction(actions.MOVE_TO_PRODUCTION, order);
                onClose();
            }}
            >
                <ListItemIcon>
                    <FactoryIcon fontSize="small"/>
                </ListItemIcon>
                <ListItemText>Move to Production</ListItemText>
            </MenuItem>
        )}

        {order?.status === 'IN_PRODUCTION' && (
            <MenuItem onClick={() => {
                onAction(actions.COMPLETE, order);
                onClose();
            }}
            >
                <ListItemIcon>
                    <CheckCircleIcon fontSize="small" color="success"/>
                </ListItemIcon>
                <ListItemText>Mark Completed</ListItemText>
            </MenuItem>
        )}

        {order?.status !== 'COMPLETED' && order?.status !== 'CANCELLED' && (

            <>
                <Divider/>

                <MenuItem onClick={() => {
                    onAction(actions.REPORT_ISSUE, order);
                    onClose();
                }}
                >
                    <ListItemIcon>
                        <ReportProblemIcon fontSize="small" color="warning"/>
                    </ListItemIcon>
                    <ListItemText>Report Issue</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => {
                    onAction(actions.CANCEL, order);
                    onClose();
                }}
                >
                    <ListItemIcon>
                        <CancelIcon fontSize="small" color="error"/>
                    </ListItemIcon>
                    <ListItemText>Cancel Order</ListItemText>
                </MenuItem>
            </>
        )}

        {/*IDEA: This should be only available in only some of the statuses, e.g: CANCELLED*/}
        <MenuItem
            onClick={() => {
                onAction(actions.DELETE, order);
                onClose();
            }}
            sx={{color: 'error.main'}}
            disabled={true} //Disabled until further notice
        >
            <ListItemIcon>
                <DeleteIcon fontSize="small" color="error"/>
            </ListItemIcon>
            <ListItemText>Delete Order</ListItemText>
        </MenuItem>
    </Menu>
);


export default ActionMenu;
