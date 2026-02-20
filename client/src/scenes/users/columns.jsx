import React from 'react';
import { Tooltip, alpha } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    DeleteOutlined as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import UserCell from './cells/UserCell';
import RoleCell from './cells/RoleCell';
import StatusCell from './cells/StatusCell';
import AgeCell from './cells/AgeCell';
import JoinedCell from './cells/JoinedCell';
import LastSeenCell from './cells/LastSeenCell';

export const buildColumns = ({ theme, handleViewUser, handleEditClick, handleDeleteClick, handleToggleActive }) => [
    {
        field: 'user',
        headerName: 'User',
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => <UserCell row={row} onView={handleViewUser} />,
        valueGetter: (value, row) => `${row.firstName} ${row.lastName} ${row.username}`,
    },
    {
        field: 'role',
        headerName: 'Role',
        flex: 0.65,
        minWidth: 155,
        renderCell: ({ value }) => <RoleCell value={value} />,
    },
    {
        field: 'active',
        headerName: 'Status',
        flex: 0.45,
        minWidth: 135,
        renderCell: ({ row }) => <StatusCell row={row} onToggle={handleToggleActive} />,
    },
    {
        field: 'dob',
        headerName: 'Age',
        flex: 0.35,
        minWidth: 70,
        renderCell: ({ value }) => <AgeCell value={value} />,
    },
    {
        field: 'createdAt',
        headerName: 'Joined',
        flex: 0.4,
        minWidth: 110,
        renderCell: ({ value }) => <JoinedCell value={value} />,
    },
    {
        field: 'lastLogin',
        headerName: 'Last Seen',
        flex: 0.4,
        minWidth: 115,
        renderCell: ({ value }) => <LastSeenCell value={value} />,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        minWidth: 120,
        type: 'actions',
        getActions: ({ id, row }) => {
            const baseSx = (hoverColor) => ({
                '&:hover': { color: hoverColor, bgcolor: alpha(hoverColor, 0.08) },
            });

            return [
                <GridActionsCellItem
                    key="view"
                    icon={<Tooltip title="View" arrow><ViewIcon sx={{fontSize: 19}} /></Tooltip>}
                    label="View"
                    onClick={() => handleViewUser(row)}
                    sx={baseSx('#6366f1')}
                />,
                <GridActionsCellItem
                    key="edit"
                    icon={<Tooltip title="Edit" arrow><EditIcon sx={{fontSize: 19}} /></Tooltip>}
                    label="Edit"
                    onClick={handleEditClick(id)}
                    sx={baseSx('#3b82f6')}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<Tooltip title="Delete" arrow><DeleteIcon sx={{fontSize: 19}} /></Tooltip>}
                    label="Delete"
                    onClick={handleDeleteClick(id)}
                    sx={baseSx('#ef4444')}
                />,
            ];
        },
    },
];

export const getMobileColumns = (columns) =>
    columns.filter((c) => ['user', 'role', 'actions'].includes(c.field));