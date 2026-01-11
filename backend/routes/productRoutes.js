// Purpose : Handle database connection Pool
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');


// Define routes

router.put('/products/:id', productController.updateProduct);
router.get('/products', productController.getProducts);
router.post('/add-product', upload.single('productImage'), productController.addProduct);
router.delete('/products/:id',productController.deleteProduct);

module.exports = router;