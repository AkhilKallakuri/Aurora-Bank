import React, { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  balance: number;
  status: string;
}

const Statements: React.FC = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: '2024-01-15',
      description: 'Salary Credit',
      type: 'Credit',
      amount: 50000,
      balance: 45000,
      status: 'Completed',
    },
    {
      id: 'TXN002',
      date: '2024-01-14',
      description: 'Online Transfer to Raj Kumar',
      type: 'Debit',
      amount: 5000,
      balance: 40000,
      status: 'Completed',
    },
    // Add more sample data here
  ]);

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionType, setTransactionType] = useState('All Types');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let filtered = [...transactions];

    if (fromDate) {
      filtered = filtered.filter(txn => new Date(txn.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(txn => new Date(txn.date) <= new Date(toDate));
    }
    if (transactionType !== 'All Types') {
      filtered = filtered.filter(txn => txn.type === transactionType);
    }
    if (searchText) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [fromDate, toDate, transactionType, searchText, transactions]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setTransactionType('All Types');
    setSearchText('');
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Description', 'Type', 'Amount', 'Balance', 'Status'];
    const rows = filteredTransactions.map(txn => [
      txn.date,
      txn.id,
      txn.description,
      txn.type,
      txn.amount,
      txn.balance,
      txn.status,
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_statement.csv');
    link.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="flex gap-4 flex-wrap mb-4">
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-2" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-2" />
        <select value={transactionType} onChange={e => setTransactionType(e.target.value)} className="border p-2">
          <option>All Types</option>
          <option>Credit</option>
          <option>Debit</option>
        </select>
        <input type="text" placeholder="Search transactions..." value={searchText} onChange={e => setSearchText(e.target.value)} className="border p-2" />
        <button onClick={clearFilters} className="px-4 py-2 bg-gray-300 rounded">Clear Filters</button>
        <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 text-white rounded">Download Statement</button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Transaction ID</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Balance</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((txn, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{txn.date}</td>
              <td className="border p-2">{txn.id}</td>
              <td className="border p-2">{txn.description}</td>
              <td className="border p-2">{txn.type}</td>
              <td className="border p-2">{txn.type === 'Credit' ? `+₹${txn.amount}` : `-₹${txn.amount}`}</td>
              <td className="border p-2">₹{txn.balance}</td>
              <td className="border p-2">{txn.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Statements;
