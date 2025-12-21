import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BASE_URL,
        credentials: "include",
        prepareHeaders: (headers, {getState}) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set("Authorization", `${token}`);
            }
            return headers;
        }
    }),
    reducerPath: "api",
    tagTypes: ["User", "Inventory", "Products", "Product", "Branches", "Materials"],
    endpoints: (build) => ({
        getAllUsers: build.query({
            query: () => '/users/all',
            providesTags: ["AllUsers"]
        }),
        updateUserById: build.mutation({
            query: ({updatedData, id}) => ({
                url: `/users/updateUser/${id}`,
                method: "PUT",
                body: updatedData,

            }),
            invalidatesTags: ["AllUsers"]
        }),
        deleteUserById: build.mutation({
            query: (id) => ({
                url: `/users/deleteUser/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["AllUsers"]
        }),
        getUserInfo: build.query({
            query: () => `/users/getUser`,
            providesTags: ["User"]
        }),
        updateUserInfo: build.mutation({
            query: (userData) => ({
                url: `/users/updateUser`,
                method: "PUT",
                body: userData
            }),
            invalidatesTags: ["User"],
        }),
        getAvatar: build.query({
            query: () => ({
                url: `/users/getAvatar`,
                method: "GET"
            }),
            providesTags: ["UserAvatar"],
        }),
        uploadAvatar: build.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append("avatar", file);

                return {
                    url: "users/uploadAvatar",
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: ["UserAvatar"],
        }),
        // Product Endpoints
        addProduct: build.mutation({
            query: (productData) => ({
                url: `/products/addProduct`,
                method: "POST",
                body: productData
            }),
            invalidatesTags: (result, error, productData) => [
                {type: "Products", id: productData.category}
            ],
        }),
        addVariant: build.mutation({
            query: ({productId, variantData}) => ({
                url: `/products/addVariant/${productId}`,
                method: "PUT",
                body: variantData
            }),
            invalidatesTags: (result, error, arg) =>
                [{type: "Product", id: arg.productId}]
        }),
        uploadProductPhoto: build.mutation({
            query: ({file, productId}) => {
                const formData = new FormData();
                formData.append("productPhoto", file);
                formData.append("productId", productId);
                console.log(formData.get("productPhoto"));
                console.log(formData.get("productId"));

                return {
                    url: "products/uploadProductPhoto",
                    method: "PUT",
                    body: formData,
                };
            },
            // invalidatesTags: ["UserAvatar"],
        }),
        getProductPhoto: build.query({
            query: (productId) => ({
                url: `/products/getProductPhoto/${productId}`,
                method: "GET",
            })
        }),
        getProducts: build.query({
            query: () => ({
                url: `/products/getAllProducts`,
                method: "GET"
            }),
            providesTags: ["Products"]
        }),
        getProductsByCategory: build.query({
            query: (category) => ({
                url: `/products/getProductsByCategory/${category}`,
                method: "GET"
            }),
            providesTags: (result, error, category) => [{type: "Products", id: category}],
        }),
        getProductById: build.query({
            query: (productId) => ({
                url: `/products/getOneProductById/${productId}`,
                method: "GET"
            }),
            providesTags: (result, error, productId) =>
                [{type: "Product", id: productId}]
        }),
        getInventoryByVariant: build.mutation({
            query: (variantData) => ({
                url: `/products/getInventoryByVariant`,
                method: "POST",
                body: variantData
            }),
            transformResponse: (response, meta, arg) => ({
                ...response,
                variantId: arg.variantId // Store which variant this data belongs to
            }),
            providesTags: (result, error, arg) =>
                result ? [{type: "Inventory", id: arg.variantId}] : []
        }),
        updateInventoryByVariant: build.mutation({
            query: (data) => ({
                url: `/products/updateInventoryByVariant`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: (result, error, arg) =>
                [{type: "Inventory", id: arg.variantId}]
        }),
        updateProduct: build.mutation({
            query: ({productId, data}) => ({
                url: `/products/updateProduct/${productId}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: (result, error, {productId}) => [
                {type: "Product", id: productId}
            ],
        }),
        getCategories: build.query({
            query: () => ({
                url: `/products/getCategories`,
                method: "GET"
            }),
            providesTags: ["Products"],
        }),
        // Material Endpoints
        getAllMaterials: build.query({
            query: () => ({
                url: `/materials/getAllMaterials`,
                method: "GET"
            }),
            providesTags: ["Materials"],
        }),
        getMaterialNames: build.query({
            query: () => ({
                url: `/materials/getNames`,
                method: "GET"
            }),
        }),
        getMaterialsByName: build.mutation({
            query: (variantData) => ({
                url: `/materials/getMaterialsByName`,
                method: "POST",
                body: variantData
            }),
            transformResponse: (response, meta, arg) => ({
                ...response,
                materialId: arg.materialId // Store which variant this data belongs to
            }),
            providesTags: (result, error, arg) =>
                result ? [{type: "Materials", id: arg.materialId}] : []
        }),
        addMaterial: build.mutation({
            query: (materialData) => ({
                url: `/materials/addMaterial`,
                method: "POST",
                body: materialData
            }),
            invalidatesTags: ["Materials"],
        }),
        updateMaterialInventory: build.mutation({
            query: (data) => ({
                url: `/materials/updateMaterialInventory`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: (result, error, arg) =>
                [{type: "Materials", id: arg.materialId}]
        }),
        // Branch Endpoints
        getBranchCities: build.query({
            query: () => ({
                url: `/branches/getBranchCities`,
                method: "GET"
            }),
            providesTags: ["Branches"],
        }),
        getBranchesByCity: build.query({
            query: (city) => ({
                url: `/branches/getBranchesByCity/${city}`,
                method: "GET"
            }),
            providesTags: (result, error, city) => [{type: "Branches", id: city}],
        }),
        getBranchById: build.query({
            query: (branchId) => ({
                url: `/branches/getBranchById/${branchId}`,
                method: "GET"
            }),
            providesTags: ["Branch"]
        }),
        getProductInventoryAtBranch: build.mutation({
            query: ({productId, branchId}) => ({
                url: `/branches/getProductInventoryAtBranch`,
                method: "POST",
                body: {productId, branchId},
            }),
            providesTags: (result, error, arg) =>
                result ? [{type: "Inventory", id: arg.productId}] : []
        }),
        addBranch: build.mutation({
            query: (branchData) => ({
                url: `/branches/addBranch`,
                method: "POST",
                body: branchData
            }),
            invalidatesTags: (result, error, branchData) => [{type: "Branches", id: branchData.location.city}],

        }),
        updateProductInventoryAtBranch: build.mutation({
            query: (data) => ({
                url: `/branches/updateProductInventoryAtBranch`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: (result, error, arg) =>
                [{type: "Inventory", id: arg.productId}]
        }),
    })
})

export const {
    useGetAllUsersQuery,
    useUpdateUserByIdMutation,
    useDeleteUserByIdMutation,
    useGetUserInfoQuery,
    useUpdateUserInfoMutation,
    useGetAvatarQuery,
    useUploadAvatarMutation,
    useAddProductMutation,
    useAddVariantMutation,
    useUploadProductPhotoMutation,
    useGetProductPhotoQuery,
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetCategoriesQuery,
    useUpdateProductMutation,
    useLazyGetProductsByCategoryQuery,
    useGetInventoryByVariantMutation,
    useUpdateInventoryByVariantMutation,
    useGetAllMaterialsQuery,
    useGetMaterialNamesQuery,
    useGetMaterialsByNameMutation,
    useAddMaterialMutation,
    useUpdateMaterialInventoryMutation,
    useGetBranchCitiesQuery,
    useLazyGetBranchesByCityQuery,
    useGetBranchByIdQuery,
    useGetProductInventoryAtBranchMutation,
    useAddBranchMutation,
    useUpdateProductInventoryAtBranchMutation,
} = api