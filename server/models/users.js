const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({

        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        dob: {type: Date, required: true},
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, required: true},
        avatarPath: {type: String,},
        active: {type: Boolean, default: true},
    }
    , {
        collection: "Users",
        timestamps: true,
        read: "nearest",
        writeConcern: {
            w: "majority",
            j: true,
            wtimeout: 30000
        }
    });

const usersModel = mongoose.model("Users", usersSchema);
module.exports = usersModel;