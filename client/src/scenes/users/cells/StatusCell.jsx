import React, {memo} from 'react';
import {Box, Switch, Typography} from '@mui/material';

const StatusCell = memo(({row, onToggle}) => (
    <Box
        sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75
        }}
    >
        <Switch
            checked={row.active}
            size="small"
            onChange={() => onToggle(row)}
            sx={{
                width: 38,
                height: 22,
                padding: 0,
                '& .MuiSwitch-switchBase': {
                    padding: '3px',
                    '&.Mui-checked': {
                        color: '#fff',
                        transform: 'translateX(16px)',
                        '& + .MuiSwitch-track': {bgcolor: '#10b981', opacity: 1},
                    },
                },
                '& .MuiSwitch-thumb': {width: 16, height: 16},
                '& .MuiSwitch-track': {borderRadius: 11, bgcolor: '#94a3b8', opacity: 1},
            }}
        />
        <Typography
            variant="caption"
            sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                color: row.active ? '#10b981' : '#94a3b8',
            }}
        >
            {row.active ? 'Active' : 'Inactive'}
        </Typography>
    </Box>
));

export default StatusCell;