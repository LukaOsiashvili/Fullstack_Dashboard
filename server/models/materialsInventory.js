const mongoose = require('mongoose')

const materialsInventorySchema = new mongoose.Schema({
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materials',
        required: true
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    stock: {
        type: Number,
        default: 0
    },
    numOfLists: {
        type: Number,
        default: 0
    },
    reserved: {
        type: Number,
        default: 0
    }
}, {
    collection: 'Materials_Inventory'
});

materialsInventorySchema.index({variantId: 1}, {unique: true});

const materialsInventoryModel = mongoose.model('Materials_Inventory', materialsInventorySchema);
module.exports = materialsInventoryModel;