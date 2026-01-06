// Purpose : Handle database connection Pool
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

// Define routes
router.get('/products', productController.getProducts);
router.post('/add-product', upload.single('productImage'), productController.addProduct);

module.exports = router;