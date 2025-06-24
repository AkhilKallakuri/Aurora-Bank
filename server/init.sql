-- init.sql

-- Create the database if it doesn't exist
-- This command is for directly executing in a MySQL client or similar tool.
-- If your application manages DB creation, ensure it's handled.
-- For a simple init.sql, it's often run once manually or by a setup script.
-- CREATE DATABASE IF NOT EXISTS aurora_bank;
-- USE aurora_bank;

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- In a real app, store hashed passwords (e.g., using bcrypt)
    account_number VARCHAR(20) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'transactions' table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    type ENUM('Credit', 'Debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance DECIMAL(15, 2), -- Balance after this transaction
    status VARCHAR(50) DEFAULT 'Completed',
    recipient_name VARCHAR(255),
    recipient_account VARCHAR(20),
    ifsc_code VARCHAR(15),
    transfer_type VARCHAR(10), -- e.g., IMPS, NEFT, RTGS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NEW: Create the 'loans' table
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tenure INT NOT NULL, -- Loan tenure in years
    purpose TEXT,
    monthly_income DECIMAL(15, 2) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending Review', -- e.g., 'Pending Review', 'Approved', 'Rejected', 'Under Review'
    reference_id VARCHAR(50) UNIQUE NOT NULL, -- Unique ID for the application
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert some dummy user data (for testing login)
INSERT IGNORE INTO users (name, email, password, account_number, balance) VALUES
('John Doe', 'john@example.com', 'password123', '1234567890', 50000.00),
('Jane Smith', 'jane@example.com', 'securepass', '0987654321', 120000.00);

-- Insert some dummy transaction data for John Doe
INSERT IGNORE INTO transactions (user_id, date, description, type, amount, balance, status) VALUES
(1, '2025-05-20', 'Initial Deposit', 'Credit', 10000.00, 10000.00, 'Completed'),
(1, '2025-05-21', 'Online Purchase', 'Debit', 500.00, 9500.00, 'Completed'),
(1, '2025-05-22', 'Salary Credit', 'Credit', 40000.00, 49500.00, 'Completed'),
(1, '2025-05-23', 'ATM Withdrawal', 'Debit', 1000.00, 48500.00, 'Completed');