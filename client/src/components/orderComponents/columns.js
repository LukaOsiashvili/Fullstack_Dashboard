import React from "react";
import {Stack, Typography, Chip, Box, Tooltip} from '@mui/material';
import {GridActionsCellItem} from "@mui/x-data-grid";

import { formatCurrency } from './getFunctions';
import dayjs from 'dayjs';
import { getOrderTypeColor, getOrderTypeIcon, getPaymentMethodIcon, getStatusColor, getStatusIcon } from './getFunctions';

import StoreIcon from '@mui/icons-material/Store';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';


export const columns = (handleQuickAction, setMenuAnchorEl, setMenuOrder) => [
    {
        field: 'orderId',
        headerName: 'Order ID',
        width: 120,
        renderCell: (params) => (
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Typography variant="body2" fontWeight={500}>
                    #{params.row._id.slice(-6).toUpperCase()}
                </Typography>
            </Box>
        ),
    },
    {
        field: 'orderType',
        headerName: 'Type',
        width: 130,
        renderCell: (params) => (
            <Chip
                size="small"
                label={params.value}
                color={getOrderTypeColor(params.value)}
                icon={getOrderTypeIcon(params.value)}
                variant="outlined"
            />
        ),
    },
    {
        field: 'customer',
        headerName: 'Customer',
        width: 180,
        renderCell: (params) => (
            <Stack height="100%" justifyContent="center">
                <Typography variant="body2" fontWeight={500}>
                    {params.value?.name || 'N/A'}
                </Typography>
                {params.value?.phone && (
                    <Typography variant="caption" color="text.secondary">
                        {params.value.phone}
                    </Typography>
                )}
            </Stack>
        ),
    },
    {
        field: 'items',
        headerName: 'Items',
        width: 200,
        renderCell: (params) => (
            <Tooltip
                title={
                    <Stack spacing={0.5}>
                        {params.value.map((item, i) => (
                            <Typography key={i} variant="caption">
                                {item.quantity}x {item.productName}
                            </Typography>
                        ))}
                    </Stack>
                }
            >
                <Stack height="100%" justifyContent="center">
                    <Typography variant="body2">
                        {params.value.length} item{params.value.length > 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {params.value.map((item) => item.productName).join(', ')}
                    </Typography>
                </Stack>
            </Tooltip>
        ),
    },
    {
        field: 'branchInfo',
        headerName: 'Branch',
        width: 170,
        renderCell: (params) => (
            <Stack direction="row" spacing={1} alignItems="center" height="100%">
                <StoreIcon fontSize="small" color="action"/>
                <Typography variant="body2">{params.value?.name}</Typography>
            </Stack>
        ),
    },
    {
        field: 'totalAmount',
        headerName: 'Total',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',      // vertical center
                    justifyContent: 'flex-end' // right align
                }}
            >
                <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(params.value)}
                </Typography>
            </Box>
        ),
    },
    {
        field: 'paymentMethod',
        headerName: 'Payment',
        width: 120,
        renderCell: (params) => (
            <Chip
                size="small"
                label={params.value}
                icon={getPaymentMethodIcon(params.value)}
                variant="outlined"
            />
        ),
    },
    {
        field: 'orderDate',
        headerName: 'Date',
        width: 150,
        renderCell: (params) => (
            <Stack height="100%" justifyContent="center">
                <Typography variant="body2">
                    {dayjs(params.value).format('MMM DD, YYYY')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {dayjs(params.value).fromNow()}
                </Typography>
            </Stack>
        ),
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params) => (
            <Chip
                size="small"
                label={params.value.replace('_', ' ')}
                color={getStatusColor(params.value)}
                icon={getStatusIcon(params.value)}
            />
        ),
    },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 100,
        getActions: (params) => [
            <GridActionsCellItem
                icon={<VisibilityIcon/>}
                label="View"
                onClick={() => handleQuickAction('view', params.row)}
            />,
            <GridActionsCellItem
                icon={<MoreVertIcon/>}
                label="More"
                onClick={(e) => {
                    setMenuAnchorEl(e.currentTarget);
                    setMenuOrder(params.row);
                }}
            />,
        ],
    },
];
