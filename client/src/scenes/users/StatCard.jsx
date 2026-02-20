import React, { memo } from 'react';
import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material';
import FlexBetween from 'components/FlexBetween';

const StatCard = memo(({ title, value, icon, color, subtitle }) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: alpha(theme.palette.background.alt, 1),
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                borderRadius: 1,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                willChange: 'transform',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 40px ${alpha(color, 0.18)}`,
                    '& .stat-icon-box': {
                        transform: 'scale(1.1)'
                    },
                },
            }}
        >
            <Box sx={{ height: 3, background: color}} />
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <FlexBetween>
                    <Box sx={{ zIndex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha(theme.palette.text.secondary, 0.7),
                                fontWeight: 600, fontSize: '0.7rem',
                                textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.75,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1, fontSize: '2rem' }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="caption"
                                sx={{ color: alpha(theme.palette.text.secondary, 0.6), mt: 0.75, display: 'block', fontSize: '0.7rem' }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        className="stat-icon-box"
                        sx={{
                            width: 52, height: 52, borderRadius: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
                            color, transition: 'transform 0.3s ease', willChange: 'transform', zIndex: 1,
                        }}
                    >
                        {icon}
                    </Box>
                </FlexBetween>
            </CardContent>
        </Card>
    );
});

export default StatCard;