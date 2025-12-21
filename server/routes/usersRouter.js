const express = require("express");
const router = express.Router();
const usersService = require("../services/usersService");
const APISecurity = require("../middleware/APISecurity");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../uploads/avatars"),
    filename: (req, file, cb) => cb(null, Date.now()+path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post("/register", usersService.register);
router.post("/login", usersService.login);
router.post("/logout", usersService.logout);
router.get("/all", APISecurity.requireLogin, usersService.getAll);
router.put("/updateUser/:id", APISecurity.requireLogin, usersService.updateUserById);
router.delete("/deleteUser/:id", APISecurity.requireLogin, usersService.deleteUserById);
router.get("/getUser", APISecurity.requireLogin, usersService.getUser);
router.put("/updateUser/", APISecurity.requireLogin, usersService.updateUser);
router.get("/getAvatar", APISecurity.requireLogin, usersService.getAvatar);
router.put("/uploadAvatar", APISecurity.requireLogin, upload.single("avatar"), usersService.uploadAvatar);

module.exports = router;