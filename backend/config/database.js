// Purpose: Handle database connection pool

const oracledb = require('oracledb');
require('dotenv').config();

try {
    oracledb.initOracleClient({ thin: true });
} catch (err) { }

/*oracledb.initOracleClient({ 
    libDir: 'C:\\Users\\fhmiz\\Desktop\\oracle\\instantclient_23_26\\instantclient_23_0' 
});
*/

const dbConfig = {
<<<<<<< HEAD
    user: "DBORACLE",
    password: "DBORACLE",
    connectString: "127.0.0.1:1521/xe",
=======
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT || "localhost/xe",
>>>>>>> 0a5c5471581e5a3b5281f7fd6dc1159f3614ae49
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2
};

let pool;

async function initPool() {
    try {
        if (!pool) {
        pool = await oracledb.createPool(dbConfig);
        console.log('✓ Database pool created');
    }
    } catch (err) {
        console.error('Failed to create pool:', err);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Pool not initialized');
    }
    return pool;
}

async function closePool() {
    if (pool) {
        await pool.close();
        console.log('✓ Pool closed');
    }
}

module.exports = { initPool, getPool, closePool };