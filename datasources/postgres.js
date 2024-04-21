const { Pool } = require('pg');

const CONFIG = require('../settings');

let pool;

const connectPostgres = async () => {
    pool = await new Pool({
        ...CONFIG.POSTGRES_CONFIG,
    });
    console.log('Connected to postgres successfully');
};

const beginTransaction = async () => {
    const client = await pool.connect();

    await client.query('BEGIN;');
    return client;
};

const commitTransaction = async (client) => {
    await client.query('COMMIT;');
    client.release();
}

const rollbackTransaction = async (client) => {
    await client.query('ROLLBACK;');
    client.release();
}

const executeQuery = async (query, parameters, client) => {
    let result;

    if (client) {
        result = await client.query(query, parameters);
    } else {
        result = await pool.query(query, parameters);   
    }

    if (result) {
        return result.rows;
    }

    return [];
}

module.exports = {
    connectPostgres,
    executeQuery,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
};
