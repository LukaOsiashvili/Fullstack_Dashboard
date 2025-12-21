const fs = require("fs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken")

module.exports = {
    requireLogin: (req, res, next) => {
        jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err,decoded) => {
            if (err) {
                return res.status(401).send({message: "INVALID SESSION"})
            }
            req.user = decoded;
            next()
        })
    },

    checkRoles: (roles) => (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).send({message: "Forbidden"})
        }

        next();
    }
}