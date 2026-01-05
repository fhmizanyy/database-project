// Purpose: Handle request/response logic (business logic)

const productModel = require('../models/productModel');

// Controller for GET /api/products
async function getProducts(req, res) {
    try {
        const products = await productModel.getAllProducts();
        res.json(products);
    } catch (err) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// Controller for POST /api/add-product
async function addProduct(req, res) {
    try {
        const productData = {
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            productDescription: req.body.productDescription,
            categoryId: req.body.categoryId,
            sellerId: req.body.sellerId,
            condition: req.body.condition,
            quantity: req.body.quantity,
            imageBuffer: req.file?.buffer
        };
        
        await productModel.createProduct(productData);
        res.json({ success: true, message: 'Product added successfully!' });
    } catch (err) {
        console.error('Error in addProduct:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { getProducts, addProduct };

