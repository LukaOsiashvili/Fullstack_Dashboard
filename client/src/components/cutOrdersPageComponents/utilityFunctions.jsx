import dayjs from "dayjs";

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDate = (date) => {
    if (!date) return '-';
    return dayjs(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return dayjs(date).format('MMM DD, YYYY HH:mm');
};

export const isOverdue = (order) => {
    if (!order.dueDate || order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        return false;
    }
    return dayjs().isAfter(dayjs(order.dueDate));
};

export const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    return dayjs(dueDate).diff(dayjs(), 'day');
};

export const getPriorityColor = (priority) => {
    const colors = {
        LOW: 'default',
        NORMAL: 'primary',
        HIGH: 'warning',
        URGENT: 'error',
    };
    return colors[priority] || 'default';
};

export const getStatusColor = (status) => {
    const colors = {
        PENDING: 'warning',
        CUTTING: 'info',
        IN_PRODUCTION: 'primary',
        COMPLETED: 'success',
        CANCELLED: 'error',
    };
    return colors[status] || 'default';
};
