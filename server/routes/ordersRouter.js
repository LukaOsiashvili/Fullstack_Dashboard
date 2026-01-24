const express = require('express');
const router = express.Router();
const ordersService = require("../services/ordersService");
const APISecurity = require("../middleware/APISecurity");

router.get('/getAllOrders', APISecurity.requireLogin, ordersService.getAllOrders);
router.post("/getStats", APISecurity.requireLogin, ordersService.getStats);
router.post("/addOrder", APISecurity.requireLogin, ordersService.addOrder);
router.put("/updateOrder/:id", APISecurity.requireLogin, ordersService.updateOrder);
router.put("/updateOrder/:id/status", APISecurity.requireLogin, ordersService.updateOrderStatus);

module.exports = router;