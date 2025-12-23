const BranchesModel = require("../models/branches");
const InventoryModel = require("../models/inventory");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

module.exports = {
    getBranchCities: async (req, res) => {
        try{
            const cities = await BranchesModel.distinct('location.city');
            res.status(200).json(cities);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    getBranchesByCity: async (req, res) => {
        try{
            const item = await BranchesModel.find({"location.city": req.params.city});
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    //TODO: 1.Find All distinct products available at the branch +
    //      2.Find all the variants +
    //      3.Return the table of inventory

    getBranchById: async (req, res) => {
        try{

            const branchId = req.params.id;

            if(!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({message: "Invalid Product Id Format"});
            }

            const item = await BranchesModel.findById(branchId, {updatedAt: 0}).lean();
            if(!item){
                return res.status(404).json({message: "Branch Not Found"});
            }

            const availableProducts = await InventoryModel.aggregate([
                {
                    $match: {
                        branchId: new mongoose.Types.ObjectId(branchId),
                    }
                },
                {
                    $group: {
                        _id: "$productId",
                    }
                },
                {
                    $lookup: {
                        from: "Products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    }
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        _id: 0,
                        productId: "$_id",
                        productName: "$product.name",
                        category: "$product.category",
                    }
                },
                // {
                //     $sort: {
                //         productName: 1
                //     }
                // }

            ]);

            const data = {
                branch: item,
                products: availableProducts,
            }

            res.status(200).json(data);

        } catch(error) {
            res.status(500).json(error);
        }
    },

    getProductInventoryAtBranch: async (req, res) => {
        try{
            const {branchId, productId} = req.body;
             const result = await InventoryModel.aggregate([
                 {
                     $match: {
                         productId: new mongoose.Types.ObjectId(productId),
                         branchId: new mongoose.Types.ObjectId(branchId)
                     }
                 },
                 {
                     $lookup: {
                         from: "Products",
                         localField: "productId",
                         foreignField: "_id",
                         as: "product",
                     }
                 },
                 {
                     $unwind: "$product",
                 },
                 {
                     $addFields: {
                         variant: {
                             $arrayElemAt: [
                                 {
                                     $filter: {
                                         input: "$product.variants",
                                         as: "v",
                                         cond: {$eq: ["$$v._id", "$variantId"]}
                                     }
                                 },
                                 0
                             ]
                         }
                     }
                 },
                 {
                     $addFields: {
                         available: {$subtract: ["$stock", "$reserved"]}
                     }
                 },
                 {
                     $project: {
                         variantId: 1,
                         color: "$variant.color",
                         size: "$variant.size",
                         price: "$variant.price",
                         stock: 1,
                         reserved: 1,
                         available: 1,
                         lastCost: 1
                     }
                 },
                 {
                     $facet: {
                         variants: [
                             { $sort: { color: 1 } }
                         ],
                         totals: [
                             {
                                 $group: {
                                     _id: null,
                                     totalStock: { $sum: "$stock" },
                                     totalReserved: { $sum: "$reserved" },
                                     totalAvailable: { $sum: "$available" }
                                 }
                             }
                         ]
                     }
                 },
                 {
                     $replaceRoot: {
                         newRoot: {
                             variants: "$variants",
                             totals: { $arrayElemAt: ["$totals", 0] }
                         }
                     }
                 }
             ]);

             if(!result || result.length === 0){
                 return res.status(404).json({message: "No Inventory Found for this product at branch"});
             }

             const data = {
                 totals: result[0].totals,
                 variants: result[0].variants,
             }

             res.status(200).json(data);
        } catch (error){
            console.error("Error in getProductInventoryAtBranch", error);
            res.status(500).json(error);
        }
    },

    addBranch: async (req, res) => {
        try{
            const savedItem = await new BranchesModel(req.body).save();
            res.status(200).json(savedItem);
        } catch(error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    uploadBranchPhoto: async (req, res) => {
        try{
            if(!req.file){
                return res.status(400).json({message: "File Not Found"});
            }

            const imagePath = `/uploads/branchPhotos/${req.file.filename}`;

            const updateBranch = await BranchesModel.findByIdAndUpdate(
                req.body.branchId,
                {photoPath: imagePath},
                {new: true}
            );

            if(!updateBranch){
                throw new Error("Branch Not Found");
            }

            res.status(200).json({message: "Branch Photo Uploaded Successfully"});
        } catch(error) {
            console.log(error);
            if(req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({message: "Branch Photo Upload Failed"});
        }
    },

    getBranchPhoto: async (req, res) => {
        try{
            const branch = await BranchesModel.findById(req.params.id)

            if(!branch || !branch.photoPath){
                return res.status(404).json({message: "Branch Not Found"});
            }

            const filePath = path.join(__dirname, "../..", branch.photoPath);
            if(!fs.existsSync(filePath)){
                return res.status(404).json({message: "Product Photo Not Found on Server"});
            }

            res.status(200).json({photoPath: branch.photoPath});
        } catch(error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    updateProductInventoryAtBranch: async (req, res) => {
        const data = req.body;

        if(!mongoose.isValidObjectId(data.branchId) && !mongoose.isValidObjectId(data.productId)) {
            return res.status(400).json({message: "Invalid Product or Branch Id Format"});
        }

        const operations = data.changes.map(variant => ({
            updateOne: {
                filter: {
                    branchId: new mongoose.Types.ObjectId(data.branchId),
                    productId: new mongoose.Types.ObjectId(data.productId),
                    variantId: new mongoose.Types.ObjectId(variant.variantId),
                },
                update: {
                    $set: {
                        stock: variant.stock,
                        reserved: variant.reserved,
                    }
                }
            }
        }));

        try{
            const result = await InventoryModel.bulkWrite(operations);

            if(!result){
                res.status(404).json({message: "No Variant Found for this product in this branch"});
            }

            res.status(200).json({message: "Changes Saved", success: true});
        } catch (error){
            console.log(error);
            res.status(500).json({message: "Error in updateProductInventoryAtBranch", error});
        }
    },

    updateBranch: async (req, res) => {
        try{
            const updatedItem = await BranchesModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});

            if(!updatedItem){
                res.status(404).json({message: "Branch Not Found"});
            }

            return res.status(200).json({message: "Branch Updated Successfully"});
        } catch(error){
            console.log(error);
            res.status(500).json(error);
        }
    },

    deleteBranch: async (req, res) => {
        try{
            await BranchesModel.findByIdAndDelete({_id: req.params.id});
            res.status(200).json({message: "Branch Deleted Successfully"});
        } catch(error) {
            res.status(500).json(error);
            console.log(error);
        }
    }
}