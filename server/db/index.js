// db/index.js (or db.js if you prefer)
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',   // Your MySQL host
    user: 'root',        // Your MySQL username
    password: 'testpass123', // !!! IMPORTANT: CHANGE THIS TO YOUR ACTUAL MySQL PASSWORD !!!
    database: 'aurora_bank' // The database name you created with init.sql
});

// Export the pool so other files can use it
module.exports = pool;
