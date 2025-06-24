// routes/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db/index.js exports the MySQL pool

// Get User Transactions with Filters
router.get('/transactions/:userId', (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate, type, search } = req.query;

    console.log('Backend: Received request for transactions for userId:', userId, 'with filters:', { startDate, endDate, type, search });

    let query = 'SELECT id, date, description, type, amount, balance, status, recipient_name, recipient_account FROM transactions WHERE user_id = ?';
    const queryParams = [userId];

    if (startDate) {
        query += ' AND date >= ?';
        queryParams.push(startDate);
    }
    if (endDate) {
        query += ' AND date <= ?';
        queryParams.push(endDate);
    }
    if (type && (type === 'Credit' || type === 'Debit')) {
        query += ' AND type = ?';
        queryParams.push(type);
    }
    if (search) {
        query += ' AND (description LIKE ? OR recipient_name LIKE ? OR recipient_account LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY date DESC, id DESC';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Backend: Error fetching filtered transactions:', err);
            return res.status(500).json({ message: 'Server error fetching transactions.', error: err.message });
        }
        console.log('Backend: Fetched filtered transactions. Count:', results.length);
        res.status(200).json(results);
    });
});

// Perform Money Transfer (Debit)
router.post('/transfer', (req, res) => {
    const { userId, recipientName, recipientAccount, ifscCode, transferType, amount, remarks } = req.body;

    console.log('Backend: Received transfer request with data:', { userId, recipientName, recipientAccount, ifscCode, transferType, amount, remarks });

    if (!userId || !recipientName || !recipientAccount || !amount || amount <= 0) {
        console.log('Backend: Transfer validation failed: Missing required details or invalid amount.');
        return res.status(400).json({ message: 'Missing required transfer details or invalid amount.' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Backend: Database connection error for transfer:', err);
            return res.status(500).json({ message: 'Database connection error.' });
        }

        connection.beginTransaction(transactionErr => {
            if (transactionErr) {
                connection.release();
                console.error('Backend: Failed to start transaction for transfer:', transactionErr);
                return res.status(500).json({ message: 'Failed to start transaction.' });
            }

            connection.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId], (err, userResults) => {
                if (err || userResults.length === 0) {
                    console.error('Backend: User not found or balance fetch error for transfer:', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ message: 'User not found or balance fetch error.' });
                    });
                }

                const currentBalance = userResults[0].balance;
                console.log('Backend: User current balance:', currentBalance);
                if (currentBalance < amount) {
                    console.log('Backend: Insufficient balance for transfer. Current:', currentBalance, 'Amount:', amount);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(400).json({ message: 'Insufficient balance.' });
                    });
                }

                const newBalance = currentBalance - amount;
                console.log('Backend: New balance after transfer:', newBalance);

                connection.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], (err) => {
                    if (err) {
                        console.error('Backend: Failed to update user balance for transfer:', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: 'Failed to update balance.' });
                        });
                    }
                    console.log('Backend: User balance updated successfully.');

                    const transaction = {
                        user_id: userId,
                        date: new Date().toISOString().split('T')[0],
                        description: remarks || `Transfer to ${recipientName} (${recipientAccount})`,
                        type: 'Debit',
                        amount: amount,
                        balance: newBalance,
                        status: 'Completed',
                        recipient_name: recipientName,
                        recipient_account: recipientAccount,
                        ifsc_code: ifscCode,
                        transfer_type: transferType
                    };
                    connection.query('INSERT INTO transactions SET ?', transaction, (err, insertResult) => {
                        if (err) {
                            console.error('Backend: Failed to record transaction:', err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: 'Failed to record transaction.' });
                            });
                        }
                        console.log('Backend: Transaction recorded successfully. Insert ID:', insertResult.insertId);

                        connection.commit(commitErr => {
                            if (commitErr) {
                                console.error('Backend: Transaction commit failed:', commitErr);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: 'Transaction commit failed.' });
                                });
                            }
                            connection.release();
                            console.log('Backend: Transfer transaction committed successfully.');
                            res.status(200).json({
                                message: 'Transfer successful',
                                newBalance: newBalance,
                                transaction: {
                                    id: insertResult.insertId,
                                    date: transaction.date,
                                    description: transaction.description,
                                    type: transaction.type,
                                    amount: transaction.amount,
                                    balance: transaction.balance,
                                    status: transaction.status,
                                    recipientName: transaction.recipient_name,
                                    recipientAccount: transaction.recipient_account,
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

// NEW ROUTE: Handle Deposit/Credit (Self Transfer/Add Funds)
router.post('/deposit', (req, res) => {
    const { userId, amount, remarks, description } = req.body;

    console.log('Backend: Received deposit/credit request with data:', { userId, amount, remarks, description });

    if (!userId || !amount || amount <= 0) {
        console.log('Backend: Deposit validation failed: Missing required details or invalid amount.');
        return res.status(400).json({ message: 'Missing required deposit details or invalid amount.' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Backend: Database connection error for deposit:', err);
            return res.status(500).json({ message: 'Database connection error.' });
        }

        connection.beginTransaction(transactionErr => {
            if (transactionErr) {
                connection.release();
                console.error('Backend: Failed to start transaction for deposit:', transactionErr);
                return res.status(500).json({ message: 'Failed to start transaction.' });
            }

            connection.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId], (err, userResults) => {
                if (err || userResults.length === 0) {
                    console.error('Backend: User not found or balance fetch error for deposit:', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ message: 'User not found or balance fetch error.' });
                    });
                }

                const currentBalance = userResults[0].balance;
                const newBalance = currentBalance + amount; // Add amount for deposit/credit
                console.log('Backend: New balance after deposit:', newBalance);

                connection.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], (err) => {
                    if (err) {
                        console.error('Backend: Failed to update user balance for deposit:', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: 'Failed to update balance.' });
                        });
                    }
                    console.log('Backend: User balance updated successfully for deposit.');

                    const transaction = {
                        user_id: userId,
                        date: new Date().toISOString().split('T')[0],
                        description: description || remarks || 'Cash Deposit', // Use passed description or remarks
                        type: 'Credit', // This is a credit transaction
                        amount: amount,
                        balance: newBalance,
                        status: 'Completed',
                        // Recipient details are not applicable for self-deposit/credit
                        recipient_name: null,
                        recipient_account: null,
                        ifsc_code: null,
                        transfer_type: null
                    };
                    connection.query('INSERT INTO transactions SET ?', transaction, (err, insertResult) => {
                        if (err) {
                            console.error('Backend: Failed to record deposit transaction:', err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: 'Failed to record transaction.' });
                            });
                        }
                        console.log('Backend: Deposit transaction recorded successfully. Insert ID:', insertResult.insertId);

                        connection.commit(commitErr => {
                            if (commitErr) {
                                console.error('Backend: Deposit transaction commit failed:', commitErr);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: 'Transaction commit failed.' });
                                });
                            }
                            connection.release();
                            console.log('Backend: Deposit transaction committed successfully.');
                            res.status(200).json({
                                message: 'Deposit successful',
                                newBalance: newBalance,
                                transaction: {
                                    id: insertResult.insertId,
                                    date: transaction.date,
                                    description: transaction.description,
                                    type: transaction.type,
                                    amount: transaction.amount,
                                    balance: transaction.balance,
                                    status: transaction.status,
                                    recipientName: null, // Explicitly null for deposit
                                    recipientAccount: null, // Explicitly null for deposit
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
