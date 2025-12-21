import React, {useRef, useState} from "react";
import {Box, Typography} from "@mui/material";

const ImageUploadBox = ({initialImage, onFileSelect}) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(initialImage || null);

    const handleClick = () => {
        inputRef.current.click();
    }

    const handleFileChange = (e) => {

        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        onFileSelect(file);
    }

    return (
        <Box
            onClick={handleClick}
            sx={{
                width: "100%",
                height: "200px",
                // aspectRatio: "1 / 1",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "divider",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                "&:hover .overlay": {opacity: 1}
            }}
        >
            {preview ? (
                <Box
                    component="img"
                    src={preview}
                    alt={"preview"}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            ) : (
                <Typography color={"text.secondary"}>
                    Click to upload image
                </Typography>
            )}

            <Box
                className={"overlay"}
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                }}
            >
                <Typography color={"white"} fontWeight={"bold"}>
                    Change Image
                </Typography>
            </Box>

            <input
                ref={inputRef}
                type={"file"}
                accept={"image/*"}
                hidden
                onChange={handleFileChange}
            />
        </Box>
    )
};

export default ImageUploadBox;