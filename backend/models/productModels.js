// Purpose: SQL queries + database operations

const { getPool } = require('../config/database');
const oracledb = require('oracledb');

// All SQL queries in one place
const queries = {
    getAllProducts: `
        SELECT p.PRODUCT_ID, p.TITLE, p.PRICE, p.DESCRIPTION, p.IMAGE_DATA,
               c.CAT_NAME, u.USERNAME, u.RATING, u.MAHALLAH, p.QUANTITY
        FROM PRODUCTS p
        JOIN CATEGORIES c ON p.CAT_ID = c.CAT_ID
        JOIN USERS u ON p.SELLER_ID = u.USER_ID
    `,
    
    insertProduct: `
        INSERT INTO PRODUCTS (PRODUCT_ID, TITLE, PRICE, DESCRIPTION, CAT_ID, 
                              SELLER_ID, CONDITION, IMAGE_DATA, QUANTITY)
        VALUES (prod_seq.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)
    `,

    updateProductsFields: `
        UPDATE PRODUCTS 
        SET TITLE = :title,
            PRICE = :price,
            QUANTITY = :quantity
            WHERE PRODUCT_ID = :id

    `,

    deleteProduct:`
        DELETE FROM PRODUCTS
        WHERE PRODUCT_ID = :id

    `
};



// Function to get all products
async function getAllProducts() {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        const result = await connection.execute(
            queries.getAllProducts,
            [],
            { fetchInfo: { IMAGE_DATA: { type: oracledb.BUFFER }}}
        );
        
        return result.rows.map(row => ({
            id: row[0],
            title: row[1],
            price: row[2],
            description: row[3],
            image: row[4] ? `data:image/jpeg;base64,${row[4].toString('base64')}` : null,
            category: row[5],
            seller: row[6],
            rating: row[7],
            mahallah: row[8],
            quantity: row[9]
        }));
    } finally {
        await connection.close();
    }
}

// Function to create a product
async function createProduct(productData) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        const binds = [
            productData.productName,
            parseFloat(productData.productPrice),
            productData.productDescription,
            parseInt(productData.categoryId),
            parseInt(productData.sellerId),
            parseInt(productData.condition),
            productData.imageBuffer || null,
            parseInt(productData.quantity)
        ];
        
        await connection.execute(queries.insertProduct, binds, { autoCommit: true });
    } finally {
        await connection.close();
    }
}

async function updateProducts(productId,updateData){
    const pool = getPool();
    const connection = await pool.getConnection();

    try{
        const bindData = {
            id: productId,
            title: updateData.title,
            price: parseFloat(updateData.price),
            quantity: parseInt(updateData.quantity)
        }

        const result = await connection.execute(queries.updateProductsFields, bindData,{autoCommit : true });

        return result;
    }catch {
        console.error('Error updating database:',err);
        throw err;
    } finally {
        await connection.close();
    }
}

async function deleteProducts(productId){
    const pool = getPool();
    const connection = await pool.getConnection();

    try{
        const selectBind = {
            id: productId
        }
        const result = await connection.execute(queries.deleteProduct,selectBind,{autoCommit: true});
        return result;
    } catch {
        console.error('error deleting from database',err);
        throw err;
    } finally {
        await connection.close();
    }
}
module.exports = { getAllProducts, createProduct, updateProducts,deleteProducts};
