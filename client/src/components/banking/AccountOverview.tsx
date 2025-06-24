import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CreditCard, PiggyBank } from "lucide-react";

interface AccountOverviewProps {
  user: any;
}

const AccountOverview = ({ user }: AccountOverviewProps) => {
  const recentTransactions = [
    { id: 1, type: 'credit', amount: 5000, description: 'Salary Credit', date: '2024-01-15' },
    { id: 2, type: 'debit', amount: 1200, description: 'Online Shopping', date: '2024-01-14' },
    { id: 3, type: 'debit', amount: 800, description: 'Utility Bill', date: '2024-01-13' },
    { id: 4, type: 'credit', amount: 2000, description: 'Freelance Payment', date: '2024-01-12' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Account Summary */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Your financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-2xl font-bold text-green-600">₹7,000</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Debits</p>
                    <p className="text-2xl font-bold text-red-600">₹2,000</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'} mr-3`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Monthly Spending</span>
                <span className="text-sm font-medium">₹2,000 / ₹10,000</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Savings Goal</span>
                <span className="text-sm font-medium">₹45,000 / ₹50,000</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Savings Account</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <PiggyBank className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Fixed Deposit</p>
                <p className="text-sm text-gray-600">₹1,00,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountOverview;
