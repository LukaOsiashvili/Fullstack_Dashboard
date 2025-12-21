const UsersModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

module.exports = {
    register: async (req, res) => {
        try{
            if(!req.body.password){

                req.body.password = req.body.username;
            }

            if(!req.body.username || !req.body.password || !req.body.role){
                return res.status(400).send({message: "Required Fields Missing"})
            }

            const exists = await UsersModel.findOne({username: req.body.username});

            if (exists) {
                return res.status(409).send({message: "User Already Exists"});
            }

            req.body.password = bcrypt.hashSync(req.body.password + process.env.SALT, 10);

            const savedUser = await new UsersModel(req.body).save();

            return res.status(200).json({message: "User Registered Successfully"});

        } catch (err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    },

    login: async (req, res) => {

        try{
            const user = await UsersModel.findOne({
                username: req.body.username,
            })

            if(!user){
                return res.status(404).send({message: "User Not Found"})
            }

            if(bcrypt.compareSync(req.body.password + process.env.SALT, user.password)){
                const accessToken = jwt.sign({
                    id: user._id,
                    username: user.username,
                }, process.env.JWT_SECRET, {expiresIn: "1h"});

                const refreshToken = jwt.sign({
                    role: user.role,
                }, process.env.JWT_SECRET, {expiresIn: "24h"});

                res.status(200).cookie("refreshToken", refreshToken, {httpOnly: true, sameSite: "none", secure: false, maxAge: 24*60*60*1000}).json({accessToken: accessToken});
            }else{
                return res.status(401).send({message: "Invalid Credentials"})
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({message: err.message});
        }

    },

    logout: async (req, res) => {
        res.clearCookie("refreshToken", {httpOnly: true, sameSite: "none", secure: false}).status(200).json({message: "Logged out"});
    },

    getAll: async (req, res) => {
        UsersModel.find({}, {password: 0})
            .lean()
            .then(data => {
                const transformed = data.map(user => ({
                    ...user,
                    dob: user.dob ? user.dob.toISOString().split("T")[0] : null,
                }));
                res.status(200).json(transformed);
            })
            .catch(error => {
                res.status(500).json({message: error.message});
                console.log("Could Not Fetch All Users")
            })
    },

    updateUserById: async (req, res) => {
        console.log(req.body)
      try{
          const updatedItem = await UsersModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});

          if(!updatedItem){
              res.status(404).send({message: "User Not Found"})
          }

          return res.status(200).json({message: "User Updated Successfully"});

      }catch (error) {
          res.status(500).send({message: error.message});
          console.log("Could Not Update User")
      }
    },

    deleteUserById: async (req, res) => {
        try{
            const deletedUser = await UsersModel.findByIdAndDelete(req.params.id);

            if(!deletedUser){
                res.status(404).send({message: "User Not Found"})
            }

            return res.status(200).json({message: "User Deleted Successfully"});
        } catch(err){
            res.status(500).send({message: err.message});
            console.log("Could Not Delete User")
        }
    },

    getUser: async (req, res) => {

        try{
            let userId;
            jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err,decoded) => {
                if (err) {
                    return res.status(401).send({message: "INVALID SESSION"})
                }
                userId = decoded.id;
            })
            const item = await UsersModel.findById(userId, {password: 0});
            res.status(200).json(item);
        }catch(err){
            res.status(500).send({message: err.message});
        }

    },

    updateUser: async (req, res) => {
      try{
          let userId;
          jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err,decoded) => {
              if (err) {
                  return res.status(401).send({message: "INVALID SESSION"})
              }
              userId = decoded.id;
          })
          const updatedItem = await UsersModel.findByIdAndUpdate(userId, {$set: req.body}, {new: true})
          if (!updatedItem) {
              res.status(404).send({message: "User Not Found"})
          }

          return res.status(200).json({message: "User Updated Successfully"});
      } catch (err) {
          console.error("Error Updating User Info: ", err);
          return res.status(500).send("Error Updating User Info");
      }
    },

    getAvatar: async (req, res) => {
        try{
            let userId;
            jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err,decoded) => {
                if (err) {
                    return res.status(401).send({message: "INVALID SESSION"})
                }
                userId = decoded.id;
            });

            const user = await UsersModel.findById(userId);

            if (!user || !user.avatarPath) {
                return res.status(404).json({message: "User or Avatar Not Found"})
            }

            const filePath = path.join(__dirname, "../..", user.avatarPath);
            if(!fs.existsSync(filePath)){
                return res.status(404).json({message: "File Not Found on Server"})
            }

            const fileBuffer = fs.readFileSync(filePath);
            const base64Image = fileBuffer.toString("base64");


            res.status(200).json({
                image: `data:image/png;base64,${base64Image}`,
            });
        } catch (error) {
            console.log("Error Getting Avatar: ", error);
            res.status(500).send("Error Getting Avatar");
        }
    },

    uploadAvatar: async (req, res) => {

        let userId;
        jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err,decoded) => {
            if (err) {
                return res.status(401).send({message: "INVALID SESSION"})
            }
            userId = decoded.id;
        });

        try {
            if (!req.file) {
                return res.status(400).json({ message: "File Not Found" });
            }

            const imagePath = `/uploads/avatars/${req.file.filename}`;

            const updateUser = await UsersModel.findByIdAndUpdate(
                userId,
                { avatarPath: imagePath },
                { new: true }
            );

            if (!updateUser) throw new Error("User Not Found");

            res.status(200).json({ message: "Avatar uploaded successfully!" });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            // Delete the uploaded file if DB update failed
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: "Error updating avatar" });
        }
    }
}