const express = require('express');
const router = express.Router();
const productsService = require("../services/productsService");
const APISecurity = require("../middleware/APISecurity");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../uploads/productPhotos"),
    filename: (req, file, cb) => cb(null, Date.now()+path.extname(file.originalname)),
});
const upload = multer({storage})

router.get("/getAllProducts", APISecurity.requireLogin, productsService.getAllProducts);
router.get("/getOneProductById/:id", APISecurity.requireLogin, productsService.getOneProductById);
router.get("/getCategories", APISecurity.requireLogin, productsService.getCategories);
router.get("/getProductsByCategory/:category", APISecurity.requireLogin, productsService.getProductsByCategory);
router.post("/getInventoryByVariant", APISecurity.requireLogin, productsService.getInventoryByVariant);
router.put("/updateInventoryByVariant", APISecurity.requireLogin, productsService.updateInventoryByVariant);
router.post("/addProduct", APISecurity.requireLogin, productsService.addProduct);
router.put("/addVariant/:id", APISecurity.requireLogin, productsService.addVariant);
router.put("/uploadProductPhoto", APISecurity.requireLogin, upload.single("productPhoto"), productsService.uploadProductPhoto);
router.get("/getProductPhoto/:id", APISecurity.requireLogin, productsService.getProductPhoto);
router.post("/insertMany", APISecurity.requireLogin, productsService.insertMany);
router.put("/updateProduct/:id", APISecurity.requireLogin, productsService.updateProduct);
router.delete("/deleteProduct/:id", APISecurity.requireLogin, productsService.deleteProduct);

module.exports = router;