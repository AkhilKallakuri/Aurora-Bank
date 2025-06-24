// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import your route files
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const loanRoutes = require('./routes/loans'); // Assuming you have a loanRoutes file
const analyticsRoutes = require('./routes/analytics'); // NEW: Import analytics routes

const app = express();
const port = 3001; // The port your backend server will run on.

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Connection Pool
const db = require('./db'); // Assuming db/index.js exports the MySQL pool

// Test DB connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
    connection.release();
});

// --- Use the imported route files ---
app.use('/api/auth', authRoutes); // All routes defined in auth.js will be prefixed with /api/auth
app.use('/api/transactions', transactionRoutes); // All routes defined in transactions.js will be prefixed with /api/transactions
app.use('/api/loans', loanRoutes); // All routes defined in loans.js will be prefixed with /api/loans
app.use('/api/analytics', analyticsRoutes);  // NEW: All routes defined in analytics.js will be prefixed with /api/analytics


// Basic root route
app.get('/', (req, res) => {
    res.send('Aurora Bank Backend is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
