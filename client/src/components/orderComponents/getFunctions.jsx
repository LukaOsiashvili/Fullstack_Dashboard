import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from "@mui/icons-material/Build";
import FactoryIcon from "@mui/icons-material/Factory";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MoneyIcon from '@mui/icons-material/Money';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from "@mui/icons-material/Pending";

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const getStatusColor = (status) => {
    const colors = {
        PENDING: 'warning',
        IN_PROGRESS: 'info',
        COMPLETED: 'success',
        CANCELLED: 'error',
        RETURNED: 'error',
    };
    return colors[status] || 'default';
};

export const getStatusIcon = (status) => {
    const icons = {
        PENDING: <HourglassEmptyIcon />,
        IN_PROGRESS: <PlayArrowIcon />,
        COMPLETED: <CheckCircleIcon />,
        CANCELLED: <CancelIcon />,
        RETURNED: <UndoIcon />,
    };
    return icons[status] || <InfoIcon />;
};

export const getOrderTypeColor = (type) => {
    const colors = {
        SALE: 'success',
        CUSTOM: 'secondary',
        PRODUCTION: 'info',
        RETURN: 'error',
    };
    return colors[type] || 'default';
};

export const getOrderTypeIcon = (type) => {
    const icons = {
        SALE: <ShoppingCartIcon />,
        CUSTOM: <BuildIcon />,
        PRODUCTION: <FactoryIcon />,
        RETURN: <AssignmentReturnIcon />,
    };
    return icons[type] || <ReceiptLongIcon />;
};

export const getPaymentMethodIcon = (method) => {
    const icons = {
        CASH: <MoneyIcon />,
        CARD: <CreditCardIcon />,
        TRANSFER: <AccountBalanceIcon />,
        CREDIT: <PaymentIcon />,
        PENDING: <PendingIcon />,
    };
    return icons[method] || <PaymentIcon />;
};