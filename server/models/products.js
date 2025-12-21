const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    color: {type: String, required: true},
    size: {type: String},
    price: {type: Number},
    // sku: {type: String, unique: true},
}, {_id: true});

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    category: {type: String, required: true},
    description: {type: String},
    basePrice: {type: Number, required: true},
    cost: {type: Number, required: true},
    variants: [variantSchema],
    discontinued: {type: Boolean, default: false},
    photoPath: {type: String},
}, {
    collection: "Products",
    timestamps: true,
    read: "nearest",
    writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 30000
    }
})

const productsModel = mongoose.model("Products", productSchema);
module.exports = productsModel;