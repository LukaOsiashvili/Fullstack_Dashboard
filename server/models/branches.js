const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const branchSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {
        address: {type: String, required: true},
        city: {type: String, required: true},
    },
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'Users',},
}, {
    collection: "Branches",
    timestamps: true,
    read: "nearest",
    writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 30000
    }
})

const branchesModel = mongoose.model("Branches", branchSchema);
module.exports = branchesModel;