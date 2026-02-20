import React, {memo} from 'react';
import {Box, Typography, Avatar, Badge, alpha, useTheme, Stack} from '@mui/material';
import {getInitials, ROLE_CONFIG} from '../constants';
import {isNewUser} from 'utils/dateUtils';
import {useGetUserAvatarQuery} from "../../../state/apis/api";

const UserCell = memo(({row, onView}) => {
    const theme = useTheme();
    const rc = ROLE_CONFIG[row.role] || ROLE_CONFIG.production;
    const isNew = isNewUser(row.createdAt, 7);



    const apiUrl = process.env.REACT_APP_BASE_URL;
    const {data: userAvatarURL, isLoading} = useGetUserAvatarQuery(row._id);

    return (
        <Box
            onClick={() => onView(row)}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 0.5,
                cursor: 'pointer',
                '&:hover .user-name': {color: rc.color},
            }}
        >
            <Avatar
                variant="square"
                src={apiUrl + userAvatarURL?.path || ''}
                sx={{
                    width: 42,
                    height: 42,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${alpha(rc.color, 0.2)} 0%, ${alpha(rc.color, 0.08)} 100%)`,
                    color: rc.color,
                    border: `2px solid ${alpha(rc.color, 0.12)}`,
                    borderRadius: 1,
                }}
            >
                {getInitials(row.firstName, row.lastName)}
            </Avatar>

            <Box sx={{minWidth: 0}} display="flex" flexDirection="column" >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography
                        className="user-name"
                        variant="body2"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary,
                            transition: 'color 0.2s',
                            lineHeight: 1.3,
                        }}
                    >
                        {row.firstName} {row.lastName}
                    </Typography>
                    {isNew && (
                        <Box
                            component="span"
                            sx={{
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                bgcolor: alpha(theme.palette.info.main, 1),
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                lineHeight: 1,
                            }}
                        >
                            NEW
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
});

export default UserCell;