// Purpose: Handle request/response logic (business logic)

const productModel = require('../models/productModels');

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

// controller for PUT PRODUCT 
async function updateProduct(req,res){
    const productId = req.params.id;
    const {title,price,quantity} = req.body;
    try{
        const result = await productModel.updateProducts(productId, {title,price,quantity});
        if(result.rowsAffected > 0){
            res.status(200).json({success: true, message: 'Product updated successfully'});
        }else {
            res.status(404).json({ success: false, message: 'No products found.' });
        }
    } catch (err) {
        console.error('Database error');
        res.json({success:false , message: err.message});
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
//controller for DELETE
async function deleteProduct(req,res){
    try{
        const productId = req.params.id;

        const result =  await productModel.deleteProducts(productId);
        if (result.rowsAffected > 0) {
            res.json({ success: true, message: 'Product Deleted! ✨' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found.' });
        }
    } catch(err){
        console.error('Error in Deleting Product:',err);
        res.status(500).json({ success: false, message: err.message });
    }
}


async function handleCheckout(req, res) {
    try {
        const { userId, items } = req.body;
        const orderId = await productModel.placeOrder(userId, items);
        res.json({ success: true, orderId: orderId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

async function getOrderReceipt(req, res) {
    const orderId = req.params.orderId;

    try {
        const rows = await productModel.getReceipt(orderId);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }

        const receipt = {
            orderId: rows[0][0],
            buyer: rows[0][1],
            grandTotal: rows[0][2],
            items: rows.map(row => ({
                productName: row[3],
                qty: row[4],
                price: row[5]
            }))
        };

        res.json({ success: true, data: receipt });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { getProducts, addProduct, updateProduct,deleteProduct,handleCheckout,getOrderReceipt};

