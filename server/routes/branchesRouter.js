const express = require("express");
const router = express.Router();

const branchesService = require("../services/branchesService")
const APISecurity = require("../middleware/APISecurity");

router.get("/getBranchCities", APISecurity.requireLogin, branchesService.getBranchCities);
router.get("/getBranchesByCity/:city", APISecurity.requireLogin, branchesService.getBranchesByCity);
router.get("/getBranchById/:id", APISecurity.requireLogin, branchesService.getBranchById);
router.post("/getProductInventoryAtBranch", APISecurity.requireLogin, branchesService.getProductInventoryAtBranch);
router.post("/addBranch", APISecurity.requireLogin, branchesService.addBranch);
router.put("/updateProductInventoryAtBranch", APISecurity.requireLogin, branchesService.updateProductInventoryAtBranch);

module.exports = router;