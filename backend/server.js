const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const multer = require('multer');


const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

oracledb.initOracleClient({ libDir: 'C:\\Users\\fhmiz\\Desktop\\oracle\\instantclient_23_26\\instantclient_23_0' });

const dbConfig = {
    user: "testing",        
    password: "testing",   
    connectString: "127.0.0.1:1521/xe"
};

app.get('/api/products', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const sql =
            `
            SELECT 
                p.PRODUCT_ID, 
                p.TITLE, 
                p.PRICE, 
                p.DESCRIPTION,
                p.IMAGE_DATA,
                c.CAT_NAME,       
                u.USERNAME,       
                u.RATING,
                u.MAHALLAH,
                p.QUANTITY        
            FROM PRODUCTS p
            JOIN CATEGORIES c ON p.CAT_ID = c.CAT_ID
            JOIN USERS u ON p.SELLER_ID = u.USER_ID
        `;
            
                const result = await connection.execute(sql, [], {
                fetchInfo: { "IMAGE_DATA": { type: oracledb.BUFFER }} 
            });
        

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
        console.error(err);
        res.status(500).send("Database Error");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


/*
app.get('/api/data', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({ 
            user: "mydbproject",
            password: "mydbproject",
            connectString: "127.0.0.1:1521/xe"
        });

        const result = await connection.execute("SELECT * FROM BUYER");
        res.json(result.rows); // Send data to frontend
    } catch (err) {
    console.error("DEBUG - Oracle BUG:", err.message);
    // Kita hantar sebagai objek supaya JSON.parse() tidak gagal
    res.status(500).json({ 
        success: false, 
        message: err.message 
    });
}finally {
        if (connection) await connection.close();
    }
});

app.listen(3000,() => console.log('Server running on http://localhost:3000'));
*/




app.post('/api/add-product', upload.single('productImage'), async (req, res) => {
    console.log("--- Request Diterima ---");
    console.log("Body:", req.body); 

    let connection;
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error("Server tidak menerima data (req.body is empty).");
        }

        const { productName, productPrice, productDescription, categoryId, sellerId, condition, quantity } = req.body;
        const imageData = req.file ? req.file.buffer : null;

        connection = await oracledb.getConnection(dbConfig);

        const sql = `
            INSERT INTO PRODUCTS (PRODUCT_ID, TITLE, PRICE, DESCRIPTION, CAT_ID, SELLER_ID, CONDITION, IMAGE_DATA,QUANTITY)
            VALUES (prod_seq.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)
        `;

        const binds = [
            productName,                 // :1
            parseFloat(productPrice),    // :2
            productDescription,          // :3
            parseInt(categoryId),        // :4
            parseInt(sellerId),          // :5
            parseInt(condition),         // :6
            imageData,                   // :7
            parseInt(quantity)
        ];

        await connection.execute(sql, binds, { autoCommit: true });
        res.json({ success: true, message: "Saved to Oracle!" });

    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});
app.listen(3000,() => console.log('Server running on http://localhost:3000'));
