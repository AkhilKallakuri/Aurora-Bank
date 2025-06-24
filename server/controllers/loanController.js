// ONLINE-BANKING-BACKEND/controllers/loanController.js
const connection = require('../config/db'); // Adjust path to your db.js based on your structure

// Helper function to generate a simple unique reference ID
const generateReferenceId = () => {
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const random = Math.random().toString(36).substring(2, 6); // Random string
    return `LN-${timestamp}-${random}`.toUpperCase();
};

// @desc    Submit a new loan application
// @route   POST /api/loans/apply
// @access  Public (or Private if you add authentication middleware)
exports.applyLoan = (req, res) => {
    const { userId, loanType, amount, tenure, purpose, monthlyIncome, employmentType } = req.body;

    console.log("Received loan application data:", { userId, loanType, amount, tenure, purpose, monthlyIncome, employmentType }); // <-- Add this log

    // Basic validation
    if (!userId || !loanType || !amount || !tenure || !monthlyIncome || !employmentType) {
        console.error("Missing required loan application fields:", { userId, loanType, amount, tenure, monthlyIncome, employmentType }); // <-- Log missing fields
        return res.status(400).json({ message: "Missing required loan application fields." });
    }

    // --- CRITICAL: Ensure userId is a valid integer and exists in users table ---
    // (This check needs to be robust if not handled by middleware)
    // For now, the FOREIGN KEY constraint will catch non-existent users.
    // If userId is not an integer, it will cause a SQL error.
    if (typeof userId !== 'number' && !Number.isInteger(Number(userId))) {
        console.error("Invalid userId received:", userId);
        return res.status(400).json({ message: "Invalid user ID provided." });
    }

    // Ensure numeric fields are actually numbers (though bodyParser.json() usually handles this for JSON)
    // Double-checking can help debug if frontend sends strings and DB expects numbers.
    const numericAmount = parseFloat(amount);
    const numericTenure = parseInt(tenure);
    const numericMonthlyIncome = parseFloat(monthlyIncome);

    if (isNaN(numericAmount) || isNaN(numericTenure) || isNaN(numericMonthlyIncome)) {
        console.error("Non-numeric value received for amount, tenure, or monthlyIncome.");
        return res.status(400).json({ message: "Amount, tenure, and monthly income must be valid numbers." });
    }

    const referenceId = generateReferenceId();
    const status = 'Pending Review'; // Initial status

    // Ensure your table column names match exactly: user_id, loan_type, amount, tenure, purpose, monthly_income, employment_type, status, reference_id
    const insertSql = `INSERT INTO loans (user_id, loan_type, amount, tenure, purpose, monthly_income, employment_type, status, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
        insertSql,
        [userId, loanType, numericAmount, numericTenure, purpose, numericMonthlyIncome, employmentType, status, referenceId], // Use numeric values
        (err, results) => {
            if (err) {
                console.error("❌ Error submitting loan application to database:", err); // <-- CRITICAL: Look for this detailed error in your backend terminal!
                // Check for duplicate reference_id if needed, though generateReferenceId tries to be unique
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: "A similar application already exists or reference ID clash. Please try again." });
                }
                // Specifically check for foreign key constraint violation
                if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
                    return res.status(400).json({ message: "User ID provided does not exist. Please log in again." });
                }
                return res.status(500).json({ message: "Failed to submit loan application.", error: err.message });
            }
            res.status(201).json({
                message: "Loan application submitted successfully!",
                loanId: results.insertId, // MySQL specific way to get last inserted ID
                status: status,
                referenceId: referenceId
            });
        }
    );
};

// @desc    Get all loan applications for a specific user
// @route   GET /api/loans/user/:userId
// @access  Public (or Private)
exports.getUserLoans = (req, res) => {
    const { userId } = req.params;

    connection.query(
        `SELECT * FROM loans WHERE user_id = ? ORDER BY application_date DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Error fetching user loans:", err);
                return res.status(500).json({ message: "Failed to fetch user loans.", error: err.message });
            }
            res.status(200).json(rows);
        }
    );
};