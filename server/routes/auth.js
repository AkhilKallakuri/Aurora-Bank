    // routes/auth.js
    const express = require('express');
    const router = express.Router();
    const db = require('../db'); // Assuming db/index.js exports the MySQL pool

    // Login route
    router.post('/login', (req, res) => {
        const { email, password } = req.body;

        console.log('Backend received login request for:', { email, password }); // NEW LOG

        if (!email || !password) {
            console.log('Login validation failed: Missing email or password.'); // NEW LOG
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const query = 'SELECT id, name, email, account_number, balance FROM users WHERE email = ? AND password = ?';
        db.query(query, [email, password], (err, results) => {
            if (err) {
                console.error('Database query error during login:', err); // Existing error log
                return res.status(500).json({ message: 'Server error during login.' });
            }

            console.log('MySQL query executed. Results:', results); // NEW LOG: See what MySQL returned

            if (results.length > 0) {
                const user = results[0];
                console.log('Login successful for user:', user.email); // NEW LOG
                res.status(200).json({
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        accountNumber: user.account_number,
                        balance: user.balance
                    }
                });
            } else {
                console.log('Login failed: No user found with provided credentials.'); // NEW LOG
                res.status(401).json({ message: 'Invalid email or password.' });
            }
        });
    });

    module.exports = router;
    