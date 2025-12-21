const MaterialsModel = require('../models/materials');
const MaterialsInventoryModel = require('../models/materialsInventory');
const mongoose = require('mongoose');

module.exports = {
    getAllMaterials: async (req, res) => {
        MaterialsModel.find({discontinued: {$ne: true}})
            .then(data => res.status(200).json(data))
            .catch(error => {
                res.status(500).json({error})
                console.error(error);
            })
    },

    getNames: async (req, res) => {
        try {
            const names = await MaterialsModel.distinct('name');
            return res.status(200).json(names);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getMaterialsByName: async (req, res) => {
        try {

            const {materialId} = req.body;

            const result = await MaterialsInventoryModel.aggregate([
                {
                    $match: {
                        materialId: new mongoose.Types.ObjectId(materialId)
                    }
                },
                {
                    $lookup: {
                        from: "Materials",
                        localField: "materialId",
                        foreignField: "_id",
                        as: "material"
                    }
                },
                {
                    $unwind: "$material"
                },
                {
                    // Find the matching variant within the material's variants array
                    $addFields: {
                        variant: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$material.variants",
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
                    $group: {
                        _id: "$material.name", // Group by material name
                        materialId: {$first: "$materialId"},
                        category: {$first: "$material.category"},
                        cost: {$first: "$material.cost"},
                        discontinued: {$first: "$material.discontinued"},
                        variants: {
                            $push: {
                                variantId: "$variantId",
                                color: "$variant.color",
                                stock: "$stock",
                                numOfLists: "$numOfLists",
                                reserved: "$reserved",
                                available: "$available"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        materialId: 1,
                        category: 1,
                        cost: 1,
                        discontinued: 1,
                        variants: 1
                    }
                },
            ]);

            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No inventory found for this material'
                });
            }

            res.status(200).json({
                success: true,
                count: result.length,
                data: result[0]
            });
        } catch (error) {
            console.error('Error in getAllMaterialsInventory:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    addMaterial: async (req, res) => {
        try {
            const savedItem = await new MaterialsModel(req.body).save();
            res.status(200).json(savedItem);
        } catch (error) {
            res.status(500).json({error})
        }
    },

    updateMaterial: async (req, res) => {
        try {
            const updatedItem = await new MaterialsModel(req.params.id, {$set: req.body}, {$new: true});

            if (!updatedItem) {
                res.status(404).json({error: 'Item not found'});
            }

            return res.status(200).json(updatedItem);
        } catch (error) {
            res.status(500).json(error);
            console.log(error)
        }
    },

    updateInventoryByMaterialVariant: async (req, res) => {
        const data = req.body;

        console.log(data);

        if(!mongoose.isValidObjectId(data.materialId)){
            return res.status(400).json({error: 'Invalid Material ID'});
        }

        const operations = data.changes.map(material => ({
            updateOne: {
                filter: {
                    materialId: new mongoose.Types.ObjectId(data.materialId),
                    variantId: new mongoose.Types.ObjectId(material.variantId),
                },
                update: {
                    $set: {
                        stock: material.stock,
                        numOfLists: material.numOfLists,
                        reserved: material.reserved,
                    }
                }
            }
        }));

        try{
            const result = await MaterialsInventoryModel.bulkWrite(operations);

            if(!result){
                res.status(404).json({error: 'Material or Variant not found'});
            }

            console.log(result);
            res.status(200).json({message: "Changes Saved", success: true});
        } catch (error) {
            console.log(error)
            res.status(500).json({message: "Error Updating Materials Inventory"});
        }
    },

    deleteMaterial: async (req, res) => {
        try {
            await MaterialsModel.findByIdAndDelete({_id: req.params.id});
            res.status(200).json({message: "Material Deleted"});
        } catch (error) {
            res.status(500).json(error)
            console.log(error)
        }
    }
}