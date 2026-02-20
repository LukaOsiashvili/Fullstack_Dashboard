import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Skeleton,
    Divider,
    alpha,
    useTheme,
} from '@mui/material';

const ChartCard = ({
                       title,
                       subtitle,
                       children,
                       action,
                       loading = false,
                       height = 'auto',
                       noPadding = false,
                   }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.alt,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                },
            }}
        >
            {/* Header */}
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            color={theme.palette.secondary.light}
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {action}
                </Stack>
            </Box>

            <Divider sx={{ opacity: 0.6 }} />

            {/* Content */}
            <Box
                sx={{
                    flex: 1,
                    p: noPadding ? 0 : 2,
                    minHeight: height !== 'auto' ? height : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {loading ? (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
                    </Box>
                ) : (
                    children
                )}
            </Box>
        </Paper>
    );
};

export default ChartCard;