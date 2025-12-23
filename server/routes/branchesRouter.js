const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const branchesService = require("../services/branchesService")
const APISecurity = require("../middleware/APISecurity");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../uploads/branchPhotos"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
})

const upload = multer({ storage });

router.get("/getBranchCities", APISecurity.requireLogin, branchesService.getBranchCities);
router.get("/getBranchesByCity/:city", APISecurity.requireLogin, branchesService.getBranchesByCity);
router.get("/getBranchById/:id", APISecurity.requireLogin, branchesService.getBranchById);
router.post("/getProductInventoryAtBranch", APISecurity.requireLogin, branchesService.getProductInventoryAtBranch);
router.post("/addBranch", APISecurity.requireLogin, branchesService.addBranch);
router.put("/uploadBranchPhoto", APISecurity.requireLogin, upload.single("branchPhoto"), branchesService.uploadBranchPhoto);
router.get("/getBranchPhoto/:id", APISecurity.requireLogin, branchesService.getBranchPhoto);
router.put("/updateProductInventoryAtBranch", APISecurity.requireLogin, branchesService.updateProductInventoryAtBranch);
router.put("/updateBranch/:id", APISecurity.requireLogin, branchesService.updateBranch);
router.delete("/deleteBranch/:id", APISecurity.requireLogin, branchesService.deleteBranch);

module.exports = router;