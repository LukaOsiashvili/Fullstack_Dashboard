import React, {memo} from 'react';
import {Box, Typography, Tooltip, alpha, useTheme} from '@mui/material';
import {getRelativeTime, formatDate, formatVerbose, isRecentLogin, isOnline} from 'utils/dateUtils';

const LastSeenCell = memo(({value}) => {
    const theme = useTheme();
    const recent = isRecentLogin(value);
    const online = isOnline(value);

    return (
        <Tooltip title={value ? formatVerbose(value) : 'Never logged in'} arrow placement="top">
            <Box
                sx={{
                    height: "100%",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75
                }}
            >
                {(online || recent) && (
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: online ? '#10b981' : '#f59e0b',
                            flexShrink: 0,
                        }}
                    />
                )}
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '0.8rem',
                            fontWeight: online ? 800 : recent ? 600 : 500,
                            color: online
                                ? '#10b981'
                                : recent
                                    ? '#f59e0b'
                                    : value
                                        ? alpha(theme.palette.text.secondary, 0.7)
                                        : alpha(theme.palette.text.secondary, 0.35),
                            fontStyle: value ? 'normal' : 'italic',
                        }}
                    >
                        {online ? 'Online' : getRelativeTime(value)}
                    </Typography>
                    {value && !online && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: alpha(theme.palette.text.secondary, 0.35),
                                fontSize: '0.6rem',
                                display: 'block',
                            }}
                        >
                            {formatDate(value)}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Tooltip>
    );
});

export default LastSeenCell;