export const ROLE_CONFIG = {
    admin: { label: 'Admin', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.10)' },
    sales: { label: 'Sales', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.10)' },
    laser: { label: 'Laser Operator', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.10)' },
    production: { label: 'Production', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.10)' },
};

export const getInitials = (first, last) =>
    `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

export const INITIAL_FORM_VALUES = {
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    dob: '',
    email: '',
    phone: '',
    notes: '',
};