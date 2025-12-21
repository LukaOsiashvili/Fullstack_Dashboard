import React, {useState, useEffect, useRef, useMemo} from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    Grid,
    Skeleton,
    useTheme,
    useMediaQuery,
}
    from '@mui/material'
import {useNavigate} from "react-router-dom";
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Header from '../../components/Header'
import FlexBetween from "../../components/FlexBetween";
import {useAddBranchMutation, useGetBranchCitiesQuery, useLazyGetBranchesByCityQuery} from "../../state/apis/api";
import BranchFormPopup from "../../forms/BranchFormPopup";
import toast from "react-hot-toast";

const initialValues = {
    name: '',
    location: {
        city: '',
        address: '',
    }
}

const Branch = ({_id, name, city, address}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                backgroundImage: "none",
                backgroundColor: theme.palette.background.alt,
                borderRadius: "0.55rem"
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.palette.primary.light,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: theme.palette.secondary.main,
                        width: "100%",
                        height: "100%",
                        fontSize: "2rem",
                    }}
                    variant="square"
                />
            </Box>
            <CardContent>
                <FlexBetween>
                    <Box>
                        <Typography
                            sx={{fontSize: 14}}
                            color={theme.palette.secondary[700]}
                            gutterBottom
                        >
                            {city}
                        </Typography>
                        <Typography
                            variant="h5"
                            component="div"
                        >
                            {name}
                        </Typography>
                        <Typography
                            sx={{mb: "1.5rem"}}
                            color={theme.palette.secondary[400]}
                        >
                            {address}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => navigate(`/branches/details/${_id}`)}>
                        <ExpandCircleDownIcon sx={{fontSize: 50, transform: "rotate(-90deg)", color: theme.palette.secondary.main}} />
                    </IconButton>
                </FlexBetween>
            </CardContent>
        </Card>
    )
}

const Branches = () => {
    const theme = useTheme();
    const isNonMobile = useMediaQuery("(min-width: 1000px)");

    const [open, setOpen] = useState(false);

    const [addBranch] = useAddBranchMutation();
    const {data: cities, isLoading: isCitiesLoading} = useGetBranchCitiesQuery();
    const [trigger, {isFetching}] = useLazyGetBranchesByCityQuery();

    const [loadedBranches, setLoadedBranches] = useState({});
    const sectionRef = useRef({});

    const handleBranchFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try{
            await addBranch(values).unwrap();
            console.log("Refetching Branches City...")
            const result = await trigger(values.location.city, false).unwrap();
            console.log(result)
            setLoadedBranches(prev => ({
                ...prev,
                [values.location.city]: result
            }));
            resetForm();
            toast.success("New Branches Added Successfully.");
        } catch (error) {
            console.log(error);
            toast.error("New Branch Add Failed");
        } finally {
            setSubmitting(false);
        }
    }

    useMemo(() => {
        if (!cities) return;
        const refs = {};
        cities.forEach((city) => {
            refs[city] = React.createRef();
        });
        sectionRef.current = refs;
    }, [cities]);

    useEffect(() => {
        if (!cities) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const city = entry.target.dataset.city;
                        if (!loadedBranches[city]) {
                            const res = await trigger(city);
                            if (res.data) {
                                setLoadedBranches((prev) => ({...prev, [city]: res.data}));
                            }
                        }
                    }
                }
            }
        );

        Object.values(sectionRef.current).forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);

                //Manual Check for sections already in view
                const rect = ref.current.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const city = ref.current.dataset.city;
                    if (!loadedBranches[city]) {
                        trigger(city).then((res) => {
                            if (res.data) {
                                setLoadedBranches((prev) => ({...prev, [city]: res.data}));
                            }
                        })
                    }
                }
            }
        });

        return () => observer.disconnect();
    }, [cities, trigger, loadedBranches]);

    return (
        <Box m="1.5rem 2.5rem">
            <FlexBetween>
                <Header title={"Branches"} subtitle={"See Branch List"}/>
                <IconButton onClick={() => setOpen(true)}>
                    <AddCircleRoundedIcon sx={{fontSize: 40}}/>
                </IconButton>
            </FlexBetween>
            {isCitiesLoading ? (
                <Typography mt={3}>Loading Cities...</Typography>
            ) : (
                cities?.map((city) => (
                    <Box
                        key={city}
                        ref={sectionRef.current[city]}
                        data-city={city}
                        mt={4}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                                pb: 1,
                                mb: 2,
                            }}
                        >
                            {city}
                        </Typography>

                        <Box
                            mt={"20px"}
                            display={"grid"}
                            gridTemplateColumns={"repeat(4, minmax(0, 1fr))"}
                            justifyContent={"space-between"}
                            rowGap={"20px"}
                            columnGap={"1.33%"}
                            sx={{
                                "& > div": {gridColumn: isNonMobile ? undefined : "span 4"}
                            }}
                        >
                            {loadedBranches[city] ? (
                                loadedBranches[city].map((branch) => (
                                    <Branch
                                        key={branch._id}
                                        _id={branch._id}
                                        name={branch.name}
                                        city={branch.location.city}
                                        address={branch.location.address}
                                    />
                                ))
                            ) : (
                                Array.from({length: 4}).map((_, i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Skeleton variant="rectangular" height={250}/>
                                    </Grid>
                                ))
                            )}
                        </Box>
                    </Box>
                ))
            )}
            <BranchFormPopup
                open={open}
                onClose={() => setOpen(false)}
                mode={"add"}
                cities={cities}
                initialValues={initialValues}
                onSubmit={handleBranchFormSubmit}
            />
        </Box>
    )
}
export default Branches
