import React, {memo} from 'react';
import {Box, Typography, Tooltip, alpha, useTheme} from '@mui/material';
import {getSmartTime, getAccountAge, formatVerbose} from 'utils/dateUtils';

const JoinedCell = memo(({value}) => {
    const theme = useTheme();

    return (
        <Tooltip title={formatVerbose(value)} arrow placement="top">
            <Box
                sx={{
                    height: '100%',

                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha(theme.palette.text.secondary, 0.7),
                            fontSize: '0.8rem',
                            fontWeight: 500,
                        }}
                    >
                        {getSmartTime(value)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: alpha(theme.palette.text.secondary, 0.4),
                            fontSize: '0.6rem',
                            display: 'block',
                        }}
                    >
                        {getAccountAge(value)}
                    </Typography>
                </Box>
            </Box>
        </Tooltip>
    );
});

export default JoinedCell;