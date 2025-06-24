import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Shield,
  LogOut,
  Eye,
  EyeOff,
  Send,
  PiggyBank,
  CreditCard,
  BarChart3,
  Menu, // Import Menu icon for sidebar toggle
  X // Import X icon for closing sidebar
} from "lucide-react";

// Local components
import AccountOverview from "@/components/banking/AccountOverview";
import TransferMoney from "@/components/banking/TransferMoney";
import LoanApplication from "@/components/banking/LoanApplication";
import TransactionHistory from "@/components/banking/TransactionHistory";
import AnalyticsDashboard from "@/components/banking/AnalyticsDashboard"; // Import AnalyticsDashboard

interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  balance?: number;
  status: string;
  recipientName?: string;
  recipientAccount?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
}

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  initialActiveTab: string;
}

const API_URL = "http://localhost:3001";

const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout, onToggleSidebar, isSidebarOpen, initialActiveTab }) => {
  const [currentUser, setCurrentUser] = useState<UserData>(initialUser);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const handleUpdateBalance = (newBalance: number) => {
    setCurrentUser(prevUser => ({ ...prevUser, balance: newBalance }));
  };

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser?.id) return;
      setIsLoadingTransactions(true);
      try {
        const response = await axios.get(`${API_URL}/api/transactions/transactions/${currentUser.id}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="mr-2 text-blue-600 hover:bg-blue-50"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Aurora Bank</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {currentUser.name}</span>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardDescription className="text-blue-100 text-sm">
                  Account Balance
                </CardDescription>
                <CardTitle className="text-4xl font-extrabold mt-1">
                  {showBalance ? `₹${currentUser.balance.toLocaleString('en-IN')}` : '₹ ****'}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20 focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full"
              >
                {showBalance ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-2">Account: {currentUser.accountNumber}</p>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => setActiveTab("transfer")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Send className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Transfer Money</h3>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => setActiveTab("loans")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <PiggyBank className="h-10 w-10 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Apply for Loan</h3>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => setActiveTab("history")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <CreditCard className="h-10 w-10 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">View Statements</h3>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => setActiveTab("analytics")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <BarChart3 className="h-10 w-10 text-orange-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* UPDATED: grid-cols-5 to correctly lay out all 5 tabs */}
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AccountOverview user={currentUser} transactions={transactions} />
          </TabsContent>

          <TabsContent value="transfer">
            <TransferMoney
              user={currentUser}
              onUpdateBalance={handleUpdateBalance}
              addTransaction={addTransaction}
            />
          </TabsContent>

          <TabsContent value="loans">
            <LoanApplication user={currentUser} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory
              user={currentUser}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
