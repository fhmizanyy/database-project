// Purpose: Handle database connection pool

const oracledb = require('oracledb');

oracledb.initOracleClient({ 
    libDir: 'C:\\Users\\fhmiz\\Desktop\\oracle\\instantclient_23_26\\instantclient_23_0' 
});

const dbConfig = {
    user: "testing",
    password: "testing",
    connectString: "127.0.0.1:1521/xe",
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2
};

let pool;

async function createPool() {
    try {
        pool = await oracledb.createPool(dbConfig);
        console.log('✓ Database pool created');
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

module.exports = { createPool, getPool, closePool };