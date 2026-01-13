// Purpose : Handle database connection Pool
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');


// Define routes
router.put('/products/:id', productController.updateProduct); //update
router.get('/products', productController.getProducts); //getData
router.post('/add-product', upload.single('productImage'), productController.addProduct); //addproduct
router.delete('/products/:id',productController.deleteProduct); //delete
router.post('/checkout', productController.handleCheckout); //total_price
router.get('/receipt/:orderId', productController.getOrderReceipt); //receipt 3 table

module.exports = router;