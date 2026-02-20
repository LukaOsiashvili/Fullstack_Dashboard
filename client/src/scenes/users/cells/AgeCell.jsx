import React, {memo} from 'react';
import {Box, Typography, Tooltip, alpha, useTheme} from '@mui/material';
import {getAge, formatDob} from 'utils/dateUtils';

const AgeCell = memo(({value}) => {
    const theme = useTheme();

    return (
        <Tooltip title={`Born ${formatDob(value)}`} arrow placement="top">
            <Box
                sx={{
                    height: '100%',

                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}
            >
                <Typography variant="body2" sx={{fontWeight: 700, fontSize: '0.85rem'}}>
                    {getAge(value)}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{color: alpha(theme.palette.text.secondary, 0.5), fontSize: '0.65rem'}}
                >
                    years old
                </Typography>
            </Box>
        </Tooltip>
    );
});

export default AgeCell;