const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false
    },
    connectionLimit: 10,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    queueLimit: 0,
    reconnect: true,
    idleTimeout: 900000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the pool connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

// Handle pool errors
pool.on('connection', (connection) => {
    console.log('New connection established as id ' + connection.threadId);
});

pool.on('error', (err) => {
    console.error('Database pool error:', err);
});

module.exports = pool;