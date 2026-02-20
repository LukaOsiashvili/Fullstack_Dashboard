import React, { memo } from 'react';
import { Box, alpha } from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    PointOfSale as SalesIcon,
    Engineering as ProductionIcon,
} from '@mui/icons-material';
import { ROLE_CONFIG } from '../constants';

const ROLE_ICONS = {
    admin: AdminIcon,
    sales: SalesIcon,
    laser: ProductionIcon,
    production: ProductionIcon,
};

const RoleCell = memo(({ value }) => {
    const config = ROLE_CONFIG[value] || ROLE_CONFIG.production;
    const Icon = ROLE_ICONS[value] || ProductionIcon;

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: config.color,
                backgroundColor: config.bgColor,
                border: `1px solid ${alpha(config.color, 0.12)}`,
                borderRadius: '14px',
                px: 1.25,
                py: 0.25,
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1.8,
            }}
        >
            <Icon sx={{ fontSize: 16 }} />
            {config.label}
        </Box>
    );
});

export default RoleCell;