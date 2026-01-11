
require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const multer = require('multer');

const { initPool, closePool, getPool } = require('./config/database');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Oracle Client
/*oracledb.initOracleClient({ 
    libDir: 'C:\\Users\\fhmiz\\Desktop\\oracle\\instantclient_23_26\\instantclient_23_0' 
});
*/
try {
    oracledb.initOracleClient({ thin: true });
} catch (e) { }

// Create connection pool
/*
let pool;
async function initPool() {
    pool = await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT || "localhost/xe",
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2
    });
    console.log('Connection pool created');
}
*/
// GET all products
app.get('/api/products', async (req, res) => {
    let connection;
    try {
        const pool = getPool();
        connection = await pool.getConnection();
        
        const result = await connection.execute(
            `SELECT p.PRODUCT_ID, p.TITLE, p.PRICE, p.DESCRIPTION, p.IMAGE_DATA,
                    c.CAT_NAME, u.USERNAME, u.RATING, u.MAHALLAH, p.QUANTITY
             FROM PRODUCTS p
             JOIN CATEGORIES c ON p.CAT_ID = c.CAT_ID
             JOIN USERS u ON p.SELLER_ID = u.USER_ID`,
            [],
            { fetchInfo: { IMAGE_DATA: { type: oracledb.BUFFER }}}
        );

        const products = result.rows.map(row => ({
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

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST new product
app.post('/api/add-product', upload.single('productImage'), async (req, res) => {
    let connection;
    try {
        const { productName, productPrice, productDescription, categoryId, 
                sellerId, condition, quantity } = req.body;
        const pool = getPool();
        connection = await pool.getConnection();

        await connection.execute(
            `INSERT INTO PRODUCTS (PRODUCT_ID, TITLE, PRICE, DESCRIPTION, CAT_ID, 
                                   SELLER_ID, CONDITION, IMAGE_DATA, QUANTITY)
             VALUES (prod_seq.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)`,
            [
                productName,
                parseFloat(productPrice),
                productDescription,
                parseInt(categoryId),
                parseInt(sellerId),
                parseInt(condition),
                req.file?.buffer || null,
                parseInt(quantity)
            ],
            { autoCommit: true }
        );

        res.json({ success: true, message: 'Product added successfully!' });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


app.use('/api',productRoutes);

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error',
        error: err.message 
    });
});

// Start server
async function startServer() {
    try {
        await initPool();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    } 
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing connection pool...');
    await closePool();
    process.exit(0);
});

startServer();