import React from 'react'
import FlexBetween from "components/FlexBetween";
import {
    InputAdornment,
    TextField,
    Tooltip,
} from '@mui/material'
import {
    Toolbar,
    ToolbarButton,
    QuickFilter,
    QuickFilterControl,
    QuickFilterClear,
    FilterPanelTrigger,
    ExportCsv,
    ExportPrint
} from "@mui/x-data-grid"
import CancelIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';


const CustomToolbar = ({onAddClick}) => {

    return (
        <>
            <Toolbar>
                <FlexBetween width="100%">
                    <FlexBetween>
                        <Tooltip title={"Filter Data"}>
                            <FilterPanelTrigger render={<ToolbarButton/>}>
                                <FilterAltIcon fontSize="large"/>
                            </FilterPanelTrigger>
                        </Tooltip>
                        <Tooltip title="Download as CSV">
                            <ExportCsv render={<ToolbarButton/>}>
                                <FileDownloadIcon fontSize="large"/>
                            </ExportCsv>
                        </Tooltip>
                        <Tooltip title="Print">
                            <ExportPrint
                                render={<ToolbarButton/>}
                                options={{
                                    hideToolbar: true,
                                    hideFooter: true,
                                    fields: ["firstName", "lastName", "dob", "role", "active"],
                                }}
                            >
                                <PrintIcon fontSize="large"/>
                            </ExportPrint>
                        </Tooltip>
                        <QuickFilter expanded>
                            <QuickFilterControl
                                render={({ref, ...other}) => (
                                    <TextField
                                        {...other}
                                        sx={{width: 200}}
                                        inputRef={ref}
                                        aria-label="Search"
                                        placeholder="Search..."
                                        size="small"
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon fontSize="small"/>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: other.value ? (
                                                    <InputAdornment position="end">
                                                        <QuickFilterClear
                                                            edge="end"
                                                            size="small"
                                                            aria-label="Clear search"
                                                            material={{sx: {marginRight: -0.75}}}
                                                        >
                                                            <CancelIcon fontSize="small"/>
                                                        </QuickFilterClear>
                                                    </InputAdornment>
                                                ) : null,
                                                ...other.slotProps?.input,
                                            },
                                            ...other.slotProps,
                                        }}
                                    />
                                )}
                            />
                        </QuickFilter>
                    </FlexBetween>
                    <Tooltip title="Add record">
                        <ToolbarButton onClick={onAddClick}>
                            <AddCircleRoundedIcon fontSize="large"/>
                        </ToolbarButton>
                    </Tooltip>
                </FlexBetween>
            </Toolbar>
        </>

    )
}
export default CustomToolbar
