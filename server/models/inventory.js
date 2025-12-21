const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branches",
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    reserved: {
        type: Number,
        default: 0
    },
    lastCost: {
        type: Number,
    }
}, {
    timestamps: true,
    collection: 'Inventory'
});

// Prevent same variant being stored twice for same branch
inventorySchema.index({ branchId: 1, variantId: 1 }, { unique: true });

const inventoryModel = mongoose.model("Inventory", inventorySchema);
module.exports = inventoryModel;