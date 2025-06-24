// routes/analytics.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db/index.js exports the MySQL pool

// @desc    Get summary analytics data for a user
// @route   GET /api/analytics/summary/:userId
// @access  Public (or Private if you add authentication middleware)
router.get('/summary/:userId', (req, res) => {
    const { userId } = req.params;
    console.log('Backend: Received request for analytics summary for userId:', userId);

    if (!userId) {
        console.log('Backend: Analytics summary validation failed: Missing userId.');
        return res.status(400).json({ message: 'User ID is required for analytics.' });
    }

    // Query to calculate total credit, total debit, and net flow for the user
    const query = `
        SELECT
            SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) AS totalCredit,
            SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END) AS totalDebit,
            SUM(CASE WHEN type = 'Credit' THEN amount ELSE -amount END) AS netFlow
        FROM transactions
        WHERE user_id = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Backend: Error fetching analytics summary:', err);
            return res.status(500).json({ message: 'Server error fetching analytics summary from database.', error: err.message });
        }

        const summary = results[0];
        console.log('Backend: Analytics summary fetched:', summary);

        // Handle cases where no transactions exist for the user (SUM returns null for no rows)
        const totalCredit = summary.totalCredit || 0;
        const totalDebit = summary.totalDebit || 0;
        const netFlow = summary.netFlow || 0;

        res.status(200).json({
            totalCredit: totalCredit,
            totalDebit: totalDebit,
            netFlow: netFlow
        });
    });
});

// NEW ROUTE: Get monthly trends data for a user
// @desc    Get monthly aggregated credit and debit for a user
// @route   GET /api/analytics/monthly-trends/:userId
// @access  Public (or Private if you add authentication middleware)
router.get('/monthly-trends/:userId', (req, res) => {
    const { userId } = req.params;
    console.log('Backend: Received request for monthly trends for userId:', userId);

    if (!userId) {
        console.log('Backend: Monthly trends validation failed: Missing userId.');
        return res.status(400).json({ message: 'User ID is required for monthly trends.' });
    }

    // Query to get monthly aggregated credit and debit amounts
    // This query extracts the month and year, groups by them, and sums amounts for credit/debit.
    const query = `
        SELECT
            DATE_FORMAT(date, '%Y-%m') AS yearMonth,
            SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) AS credit,
            SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END) AS debit
        FROM transactions
        WHERE user_id = ?
        GROUP BY yearMonth
        ORDER BY yearMonth ASC;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Backend: Error fetching monthly trends:', err);
            return res.status(500).json({ message: 'Server error fetching monthly trends from database.', error: err.message });
        }

        console.log('Backend: Monthly trends fetched. Count:', results.length);

        // Format the month names for the frontend (e.g., "Jan", "Feb")
        const formattedResults = results.map(row => {
            const [year, monthNum] = row.yearMonth.split('-');
            const date = new Date(parseInt(year), parseInt(monthNum) - 1); // Month is 0-indexed
            const monthName = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Jan"
            return {
                month: `${monthName} ${year.slice(2)}`, // e.g., "Jan 25"
                credit: row.credit,
                debit: row.debit
            };
        });

        res.status(200).json(formattedResults);
    });
});

module.exports = router;
