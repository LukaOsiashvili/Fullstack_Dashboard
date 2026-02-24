import React from 'react'
import {Box, Typography, useTheme} from "@mui/material";

const Header = ({title, subtitle}) => {

    const theme = useTheme();

    return (
        <Box>
            <Typography
                variant="h2"
                color={theme.palette.secondary[100]}
                fontWeight={"bold"}
                sx={{mb: "3px"}}
            >
                {title}
            </Typography>
            <Typography
                variant="subtitle1"
                color={theme.palette.secondary[300]}
            >
                {subtitle}
            </Typography>
        </Box>
    )
}
export default Header
