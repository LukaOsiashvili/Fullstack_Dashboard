const express = require('express');
const router = express.Router();

const materialsService = require("../services/materialsService");
const APISecurity = require("../middleware/APISecurity");

router.get("/getAllMaterials", APISecurity.requireLogin, materialsService.getAllMaterials);
router.get("/getNames", APISecurity.requireLogin, materialsService.getNames);
router.post("/getMaterialsByName/", APISecurity.requireLogin, materialsService.getMaterialsByName);
router.post("/addMaterial", APISecurity.requireLogin, materialsService.addMaterial);
router.put("/updateMaterial/:id", APISecurity.requireLogin, materialsService.updateMaterial);
router.put("/updateMaterialInventory", APISecurity.requireLogin, materialsService.updateInventoryByMaterialVariant);
router.delete("/deleteMaterial/:id", APISecurity.requireLogin, materialsService.deleteMaterial);

module.exports = router;