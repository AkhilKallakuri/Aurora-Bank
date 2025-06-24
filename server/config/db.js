const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'testpass123', // change to your DB password
  database: 'aurora_bank'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ MySQL connected');
});

module.exports = connection;