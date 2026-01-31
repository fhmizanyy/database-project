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
                              SELLER_ID, PRODCONDITION, IMAGE_DATA, QUANTITY)
        VALUES (product_id_sq.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)
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

    `,
    insertOrder: `INSERT INTO ORDERS (ORDER_ID, USER_ID, TOTAL_PRICE) 
                  VALUES (order_seq.NEXTVAL, :userId, 0) 
                  RETURNING ORDER_ID INTO :newId`,
    insertOrderItem: `INSERT INTO ORDER_ITEMS (ORDER_ITEM_ID, ORDER_ID, PRODUCT_ID, QUANTITY, UNIT_PRICE) 
                      VALUES (order_item_seq.NEXTVAL, :orderId, :prodId, :qty, :price)`,
    updateStock: `UPDATE PRODUCTS SET QUANTITY = QUANTITY - :qty WHERE PRODUCT_ID = :id`,
    getProdPrice: `SELECT PRICE, QUANTITY FROM PRODUCTS WHERE PRODUCT_ID = :id`,
    callCalcProc: `BEGIN calculate_order_total(:oid); END;`,

    getReceiptDetails: `
        SELECT 
            o.ORDER_ID, 
            u.USERNAME, 
            o.TOTAL_PRICE, 
            p.TITLE, 
            oi.QUANTITY, 
            oi.UNIT_PRICE
        FROM ORDERS o
        JOIN USERS u ON o.USER_ID = u.USER_ID
        JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID
        JOIN PRODUCTS p ON oi.PRODUCT_ID = p.PRODUCT_ID
        WHERE o.ORDER_ID = :oid
    `
};

async function getReceipt(orderId) {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        const result = await connection.execute(queries.getReceiptDetails, { oid: orderId });
        return result.rows;
    } finally {
        await connection.close();
    }
}



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
    }catch(err){
        console.error('Error updating database:' ,err);
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
    } catch(err){
        console.error('error deleting from database',err);
        throw err;
    } finally {
        await connection.close();
    }
}

async function placeOrder(userId, cartItems) {
    const connection = await getPool().getConnection();
    try {
        
        const orderRes = await connection.execute(queries.insertOrder, {
            userId: userId,
            newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        });
        const orderId = orderRes.outBinds.newId[0];

        
        for (const item of cartItems) {
            const prod = await connection.execute(queries.getProdPrice, [item.id]);
            const price = prod.rows[0][0];
            const stock = prod.rows[0][1];

            if (stock < item.quantity) throw new Error(`No stock sufficient for ${item.id}`);

            await connection.execute(queries.insertOrderItem, {
                orderId: orderId, prodId: item.id, qty: item.quantity, price: price
            });

            await connection.execute(queries.updateStock, { qty: item.quantity, id: item.id });
        }

        
        await connection.execute(queries.callCalcProc, { oid: orderId });

        await connection.commit();
        return orderId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        await connection.close();
    }
}

module.exports = { getAllProducts, createProduct, updateProducts,deleteProducts,placeOrder,getReceipt};


