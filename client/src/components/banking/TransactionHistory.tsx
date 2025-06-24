import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, Download } from 'lucide-react'; // Added Filter and Download icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Import Label for filter inputs
import axios from 'axios';

interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  balance?: number; // Balance after this transaction
  status: string;
  recipientName?: string;
  recipientAccount?: string;
  ifscCode?: string;
  transferType?: string;
}

interface UserData {
  id: number;
}

interface TransactionHistoryProps {
  user: UserData; // Added user prop to get userId
}

const API_URL = "http://localhost:3001"; // Your backend API URL

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'All', // 'All', 'Credit', 'Debit'
    search: ''
  });

  const fetchFilteredTransactions = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.type === 'All' ? '' : filters.type, // Send empty string if 'All'
        search: filters.search
      };
      // Endpoint to fetch transactions for a specific user, with optional filters
      const response = await axios.get(`${API_URL}/api/transactions/transactions/${user.id}`, { params });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch filtered transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredTransactions(); // Fetch on initial load and when filters change
  }, [user.id, filters]); // Re-fetch when user.id or filters change

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'All',
      search: ''
    });
  };

  const handleDownloadStatement = () => {
    if (transactions.length === 0) {
      alert("No transactions to download."); // Use alert temporarily, consider custom modal
      return;
    }

    let statementContent = `Transaction Statement for User ID: ${user.id}\n`;
    statementContent += `Filters: From ${filters.startDate || 'N/A'} to ${filters.endDate || 'N/A'}, Type: ${filters.type}, Search: "${filters.search || 'N/A'}"\n\n`;
    statementContent += `Date       | Transaction ID | Description                 | Type   | Amount (₹) | Balance (₹) | Status\n`;
    statementContent += `---------------------------------------------------------------------------------------------------\n`;

    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
      const transactionId = tx.id.toString().padEnd(14).substring(0, 14); // Pad Transaction ID
      const description = tx.description.padEnd(25).substring(0, 25);
      const type = tx.type.padEnd(6);
      const amount = (tx.type === 'Credit' ? '+' : '-') + tx.amount.toLocaleString('en-IN').padStart(10);
      const balance = (tx.balance || 0).toLocaleString('en-IN').padStart(11);
      const status = tx.status.padEnd(8);
      statementContent += `${date} | ${transactionId} | ${description} | ${type} | ${amount} | ${balance} | ${status}\n`;
    });

    const blob = new Blob([statementContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement_${user.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Statement downloaded.");
  };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Transaction History</CardTitle>
        <CardDescription className="text-gray-600">Detailed record of all your account activities.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters Section */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" /> Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="startDate" className="text-sm">From Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm">To Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="transactionType" className="text-sm">Transaction Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger id="transactionType" className="mt-1">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search" className="text-sm">Search</Label>
              <Input
                id="search"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
            <Button onClick={fetchFilteredTransactions}>Apply Filters</Button>
            <Button onClick={handleDownloadStatement} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-4 w-4 mr-2" /> Download Statement
            </Button>
          </div>
        </div>

        {/* Transaction Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No transactions found for the selected filters.</p>
            <p className="text-sm mt-1">Adjust your filters or make a transfer to see activity here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Transaction ID</TableHead> {/* Added Transaction ID column */}
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right">Balance (₹)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.id}</TableCell> {/* Display Transaction ID */}
                    <TableCell>
                      {tx.description}
                      {tx.recipientName && (
                        <p className="text-xs text-gray-500">To: {tx.recipientName} ({tx.recipientAccount?.slice(-4)})</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${tx.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'Credit' ? '+' : '-'} {tx.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.balance ? tx.balance.toLocaleString('en-IN') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
