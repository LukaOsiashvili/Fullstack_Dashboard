const ProductsModel = require("../models/products");
const InventoryModel = require("../models/inventory");
const mongoose = require("mongoose");
const path = require("path");
const fs =require("fs")

module.exports = {
    getAllProducts: async (req, res) => {
        ProductsModel.find({discontinued: {$ne: true}})
            .then(data => res.status(200).json(data))
            .catch(error => {
                res.status(500).json(error)
                console.log(error);
            });
    },

    getProductsByCategory: async (req, res) => {
        try {
            const item = await ProductsModel.find({category: req.params.category});
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getOneProductById: async (req, res) => {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({message: "Invalid product ID format"});
            }
            const item = await ProductsModel.findById(req.params.id, {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                photoPath: 0
            }).lean();
            if (!item) {
                return res.status(404).json({message: "Product not found"});
            }
            res.status(200).json(item);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    getInventoryByVariant: async (req, res) => {
        try {
            const {variantId} = req.body;

            const result = await InventoryModel.aggregate([
                {
                    $match: {
                        // productId: new mongoose.Types.ObjectId(productId),
                        variantId: new mongoose.Types.ObjectId(variantId)
                    }
                },
                {
                    $addFields: {
                        available: {$subtract: ["$stock", "$reserved"]}
                    }
                },
                {
                    $facet: {
                        // Get branch-level details
                        branches: [
                            {
                                $lookup: {
                                    from: "Branches",
                                    localField: "branchId",
                                    foreignField: "_id",
                                    as: "branch"
                                }
                            },
                            {
                                $unwind: "$branch"
                            },
                            {
                                $project: {
                                    branchId: 1,
                                    branchName: "$branch.name",
                                    stock: 1,
                                    reserved: 1,
                                    available: 1,
                                }
                            }
                        ],
                        // Calculate totals
                        totals: [
                            {
                                $group: {
                                    _id: null,
                                    totalStock: {$sum: "$stock"},
                                    totalReserved: {$sum: "$reserved"},
                                    totalAvailable: {$sum: "$available"},
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        branches: 1,
                        totals: {$arrayElemAt: ["$totals", 0]}
                    }
                }
            ]);

            if (!result) {
                res.status(404).json({message: "Product not found"});
                return;
            }

            const data = {totals: result[0].totals, branches: result[0].branches}
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updateInventoryByVariant: async (req, res) => {

        const data = req.body;

        if (!mongoose.isValidObjectId(data.variantId)) {
            return res.status(400).json({message: "Invalid variant ID"});
        }

        const operations = data.changes.map(branch => ({
            updateOne: {
                filter: {
                    variantId: new mongoose.Types.ObjectId(data.variantId),
                    branchId: new mongoose.Types.ObjectId(branch.branchId),
                },
                update: {
                    $set: {
                        stock: branch.stock,
                        reserved: branch.reserved,
                    }
                }
            }
        }));

        try {
            const result = await InventoryModel.bulkWrite(operations);

            if(!result){
                res.status(404).json({message: "Product not found"});
            }

            res.status(200).json({message: "Changes Saved", success: true});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Error updating variant ID"});
        }
    },

    getCategories: async (req, res) => {
        try {
            const categories = await ProductsModel.distinct('category');
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    addProduct: async (req, res) => {
        try {
            const savedItem = await new ProductsModel(req.body).save();
            res.status(200).json(savedItem);
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    },

    addVariant: async (req, res) => {
        try{
            const updatedProduct = await ProductsModel.findByIdAndUpdate(req.params.id, {$push: {variants: req.body}}, { new: true });

            if(!updatedProduct){
                return res.status(404).json({message: "Product Not Found"});
            }

            //TODO: Add the ACID Compliant steps for populating the Inventory Collection for new variants

            res.status(200).json(updatedProduct);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    uploadProductPhoto: async (req, res) => {

        console.log(req.body);
        console.log(req.file)
        try{
            if(!req.file) {
                return res.status(400).json({message: "File Not Found"});
            }

            const imagePath = `/uploads/productPhotos/${req.file.filename}`;

            const updateProduct = await ProductsModel.findByIdAndUpdate(
                req.body.productId,
                {photoPath: imagePath},
                {new: true}
            );

            if(!updateProduct){
                throw new Error("Product Not Found");
            }

            res.status(200).json({message: "Product Photo Uploaded Successfully"});
        } catch (error) {
            console.log(error);
            if(req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({message: "Error Uploading Product Photo"});
        }
    },

    getProductPhoto: async (req, res) => {

        try{
            const product = await ProductsModel.findById(req.params.id);

            if(!product || !product.photoPath){
                return res.status(404).json({message: "Product or Product Photo Not Found"});
            }

            const filePath = path.join(__dirname, "../..", product.photoPath);
            if(!fs.existsSync(filePath)){
                return res.status(404).json({message: "Product Photo Not Found on Server"});
            }

            console.log(product.photoPath)

            res.status(200).json({photoPath: product.photoPath});
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }

    },

    insertMany: async (req, res) => {
        try {
            const productsArray = req.body; // Expecting an array of products
            if (!Array.isArray(productsArray)) {
                return res.status(400).json({message: "Body must be an array of products"});
            }

            const insertedProducts = await ProductsModel.insertMany(productsArray, {ordered: true});
            // 'ordered: true' stops on first error; 'false' will continue inserting others

            res.status(200).json({
                message: `${insertedProducts.length} products inserted successfully`,
                data: insertedProducts
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to insert products", error});
        }
    },
    updateProduct: async (req, res) => {
        try {
            const updatedItem = await ProductsModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {$new: true});

            if (!updatedItem) {
                return res.status(404).send({message: "Product Not Found"})
            }

            return res.status(200).json(updatedItem);
        } catch (error) {
            res.status(500).json(error);
            console.log(error);
        }
    },

    deleteProduct: async (req, res) => {
        try {
            await ProductsModel.findByIdAndDelete({_id: req.params.id});
            res.status(200).json({message: "Product Deleted"});
        } catch (error) {
            res.status(500).json(error);
            console.log(error);
        }
    }
}