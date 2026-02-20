import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Avatar,
    Skeleton,
    alpha,
    useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatsCard = ({
                       title,
                       value,
                       subtitle,
                       icon,
                       color,
                       trend,
                       trendValue,
                       loading = false,
                       variant = 'default', // 'default' | 'gradient' | 'outlined'
                   }) => {
    const theme = useTheme();
    const cardColor = color || theme.palette.primary.main;

    const getCardStyles = () => {
        switch (variant) {
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${alpha(cardColor, 0.9)} 0%, ${alpha(cardColor, 0.7)} 100%)`,
                    color: '#fff',
                    border: 'none',
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    border: `2px solid ${alpha(cardColor, 0.3)}`,
                    '&:hover': {
                        borderColor: cardColor,
                    },
                };
            default:
                return {
                    backgroundColor: theme.palette.background.alt,
                    borderLeft: `4px solid ${cardColor}`,
                };
        }
    };

    const isGradient = variant === 'gradient';

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(cardColor, 0.25)}`,
                },
                ...getCardStyles(),
            }}
        >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flex={1}>
                    <Box flex={1}>
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                                color: isGradient ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                fontSize: '0.75rem',
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>

                        {loading ? (
                            <Skeleton
                                variant="text"
                                width={100}
                                height={48}
                                sx={{
                                    bgcolor: isGradient
                                        ? 'rgba(255,255,255,0.2)'
                                        : undefined,
                                }}
                            />
                        ) : (
                            <Typography
                                variant="h3"
                                fontWeight={700}
                                sx={{
                                    color: isGradient ? '#fff' : cardColor,
                                    lineHeight: 1.2,
                                }}
                            >
                                {value}
                            </Typography>
                        )}

                        <Box sx={{ mt: 'auto', pt: 1 }}>
                            {trend && trendValue && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    {trend === 'up' ? (
                                        <TrendingUpIcon
                                            sx={{
                                                fontSize: 16,
                                                color: isGradient ? '#90EE90' : 'success.main',
                                            }}
                                        />
                                    ) : (
                                        <TrendingDownIcon
                                            sx={{
                                                fontSize: 16,
                                                color: isGradient ? '#FFB6C1' : 'error.main',
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        sx={{
                                            color: isGradient
                                                ? trend === 'up' ? '#90EE90' : '#FFB6C1'
                                                : trend === 'up' ? 'success.main' : 'error.main',
                                        }}
                                    >
                                        {trendValue}
                                    </Typography>
                                    {subtitle && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: isGradient ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                            }}
                                        >
                                            {subtitle}
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                            {!trend && subtitle && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: isGradient ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                    }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Avatar
                        sx={{
                            width: 52,
                            height: 52,
                            backgroundColor: isGradient
                                ? 'rgba(255,255,255,0.2)'
                                : alpha(cardColor, 0.1),
                            color: isGradient ? '#fff' : cardColor,
                            backdropFilter: isGradient ? 'blur(10px)' : 'none',
                        }}
                    >
                        {icon}
                    </Avatar>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default StatsCard;