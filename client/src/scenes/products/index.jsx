import React, {useState, useEffect, useRef, useMemo} from 'react'
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Button,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    IconButton,

    Grid,
    Skeleton,
} from '@mui/material'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Header from '../../components/Header'
import FlexBetween from "../../components/FlexBetween";
import ProductFormPopup from "../../forms/ProductFormPopup";
import {
    useAddProductMutation,
    useLazyGetProductsByCategoryQuery,
    useGetCategoriesQuery,
    useGetProductPhotoQuery
} from "../../state/apis/api";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

const initialValues = {
    name: '',
    category: '',
    description: '',
    basePrice: '',
    cost: '',
}

const Product = ({_id, name, price, category,}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_BASE_URL;
    const {data: photo, isLoading: isPhotoLoading} = useGetProductPhotoQuery(_id);


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
                    src={apiUrl+photo?.photoPath || undefined}
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
                            {category}
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
                            ₾{Number(price).toFixed(2)}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => navigate(`/products/details/${_id}`)}>
                        <ExpandCircleDownIcon sx={{fontSize: 50, transform: "rotate(-90deg)", color: theme.palette.secondary.main}} />
                    </IconButton>
                </FlexBetween>
            </CardContent>
        </Card>
    )
}

const Products = () => {
    const theme = useTheme();
    const isNonMobile = useMediaQuery("(min-width: 1000px)")

    const [open, setOpen] = useState(false);

    const [addProduct] = useAddProductMutation();
    const {data: categories, isLoading: isCategoriesLoading} = useGetCategoriesQuery();
    const [trigger, {isFetching}] = useLazyGetProductsByCategoryQuery();

    const [loadedProducts, setLoadedProducts] = useState({});
    const sectionRef = useRef({});

    const handleProductFormSubmit = async (values, {setSubmitting, resetForm}) => {
        try {
            await addProduct(values).unwrap();
            console.log("Refetching...")
            const result = await trigger(values.category, false).unwrap();
            setLoadedProducts(prev => ({
                ...prev,
                [values.category]: result
            }));
            toast.success("Product Added Successfully");
        } catch (error) {
            console.log(error);
            toast.error("Product Add Failure");
        } finally {
            setSubmitting(false);
            resetForm();
        }
    }

    useMemo(() => {
        if (!categories) return;
        const refs = {};
        categories.forEach(cat => {
            refs[cat] = React.createRef();
        });
        sectionRef.current = refs;
    }, [categories]);

    useEffect(() => {
        if (!categories) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const cat = entry.target.dataset.category;
                        if (!loadedProducts[cat]) {
                            const res = await trigger(cat);
                            if (res.data) {
                                setLoadedProducts((prev) => ({...prev, [cat]: res.data}));
                            }
                        }
                    }
                }
            }
        );

        Object.values(sectionRef.current).forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);

                // Manual check for sections already in view
                const rect = ref.current.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const cat = ref.current.dataset.category;
                    if (!loadedProducts[cat]) {
                        trigger(cat).then((res) => {
                            if (res.data) {
                                setLoadedProducts((prev) => ({...prev, [cat]: res.data}));
                            }
                        });
                    }
                }
            }
        });

        return () => observer.disconnect();
    }, [categories, trigger, loadedProducts]);

    return (
        <Box m="1.5rem 2.5rem">
            <FlexBetween>
                <Header title={"Products"} subtitle={"See Products List"}/>
                <IconButton onClick={() => setOpen(true)}>
                    <AddCircleRoundedIcon sx={{fontSize: 40}}/>
                </IconButton>
            </FlexBetween>
            {isCategoriesLoading ? (
                <Typography mt={3}>Loading categories...</Typography>
            ) : (
                categories?.map((cat) => (
                    <Box
                        key={cat}
                        ref={sectionRef.current[cat]}
                        data-category={cat}
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
                            {cat}
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
                            {loadedProducts[cat] ? (
                                loadedProducts[cat].map((product) => (
                                    <Product
                                        key={product._id}
                                        _id={product._id}
                                        name={product.name}
                                        description={product.description}
                                        price={product.basePrice}
                                        rating={product.rating}
                                        category={product.category}
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
            <ProductFormPopup
                open={open}
                onClose={() => setOpen(false)}
                mode={"add"}
                categories={categories}
                initialValues={initialValues}
                onSubmit={handleProductFormSubmit}
            />
        </Box>
    )
}
export default Products
