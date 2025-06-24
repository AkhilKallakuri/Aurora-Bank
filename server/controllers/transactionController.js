const db = require("../models/db");

exports.transferMoney = (req, res) => {
  const {
    userId,
    recipientName,
    recipientAccount,
    ifscCode,
    transferType,
    amount,
    remarks,
  } = req.body;

  const amt = parseFloat(amount);

  // First, check user balance
  db.query(
    "SELECT balance FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      const currentBalance = results[0]?.balance || 0;

      if (amt > currentBalance) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for the transaction." });
      }

      const newBalance = currentBalance - amt;

      // Deduct and log transaction
      db.query(
        "UPDATE users SET balance = ? WHERE id = ?",
        [newBalance, userId],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Failed to update user balance" });

          const transaction = {
            user_id: userId,
            date: new Date(),
            description: remarks || "Online Transfer",
            type: "Debit",
            amount: amt,
            balance: newBalance,
            status: "Success",
            recipient_name: recipientName,
            recipient_account: recipientAccount,
            ifsc_code: ifscCode,
            transfer_type: transferType,
          };

          db.query("INSERT INTO transactions SET ?", transaction, (err) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Transaction logging failed" });

            res.status(200).json({
              message: "Transfer successful",
              newBalance,
              transaction: {
                ...transaction,
                id: this?.insertId || Math.floor(Math.random() * 10000),
              },
            });
          });
        }
      );
    }
  );
};
