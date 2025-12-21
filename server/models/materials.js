const mongoose = require("mongoose");

const materialVariantsSchema = new mongoose.Schema({
    color: {type: String, required: true},
})

const materialsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    category: {type: String, required: true},
    cost: {type: Number, required: true},
    variants: [materialVariantsSchema],
    discontinued: {type: Boolean, default: false},
}, {
    collection: "Materials",
    timestamps: false,
    read: "nearest",
    writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 30000,
    }
})

const materialsModel = mongoose.model('Materials', materialsSchema);
module.exports = materialsModel;