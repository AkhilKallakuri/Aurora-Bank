const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController'); // Adjust path to your controller

// Route to submit a new loan application
router.post('/apply', loanController.applyLoan);

// Route to get all loan applications for a specific user
router.get('/user/:userId', loanController.getUserLoans);

module.exports = router;