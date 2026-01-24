const express = require('express');
const router = express.Router();
const cutOrdersService = require("../services/cutOrdersService");
const APISecurity = require("../middleware/APISecurity");

router.get("/getAllCutOrders", APISecurity.requireLogin, cutOrdersService.getAllCutOrders);
router.post("/getCutOrderStats", APISecurity.requireLogin, cutOrdersService.getStats)
router.post("/addCutOrder", APISecurity.requireLogin, cutOrdersService.addCutOrder);
router.post("/addNewIssue/:id", APISecurity.requireLogin, cutOrdersService.addNewIssue);
router.put("/resolveIssue/:id/:issueId", APISecurity.requireLogin, cutOrdersService.resolveIssue);
router.put("/updateCutOrder/:id", APISecurity.requireLogin, cutOrdersService.updateCutOrder);

module.exports = router;