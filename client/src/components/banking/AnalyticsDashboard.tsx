import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as BarChartIcon, LineChart, DollarSign, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'; // Import Recharts components

interface UserData {
  id: number;
  name: string;
}

interface AnalyticsData {
  totalCredit: number;
  totalDebit: number;
  netFlow: number;
}

interface MonthlyTrendData {
  month: string; // e.g., "Jan", "Feb"
  credit: number;
  debit: number;
}

interface AnalyticsDashboardProps {
  user: UserData;
}

const API_URL = "http://localhost:3001";

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setError("User ID is missing for analytics.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch summary data
        const summaryResponse = await axios.get(`${API_URL}/api/analytics/summary/${user.id}`);
        setAnalyticsData(summaryResponse.data);

        // Fetch monthly trends data
        // This new endpoint will need to be created in your backend
        const trendsResponse = await axios.get(`${API_URL}/api/analytics/monthly-trends/${user.id}`);
        setMonthlyTrends(trendsResponse.data);

      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(err.response?.data?.message || "Failed to load analytics data. Please check your backend server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-400 bg-red-50 text-red-700">
        <CardHeader>
          <CardTitle>Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="text-sm mt-2">Please ensure your backend server is running and the analytics endpoint is correctly configured.</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analytics Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No analytics data available for your account yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-t-lg">
          <CardTitle className="text-xl flex items-center">
            <BarChartIcon className="h-6 w-6 mr-2" /> Financial Analytics
          </CardTitle>
          <CardDescription className="text-orange-100">Overview of your spending and income patterns</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
            <ArrowUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Total Credit</p>
            <p className="text-xl font-bold text-green-700">₹{analyticsData.totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <ArrowDown className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-sm text-gray-600">Total Debit</p>
            <p className="text-xl font-bold text-red-700">₹{analyticsData.totalDebit.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Net Flow</p>
            <p className={`text-xl font-bold ${analyticsData.netFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              ₹{analyticsData.netFlow.toLocaleString('en-IN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Visualizing your income and expenses over time.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyTrends}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="credit" fill="#22C55E" name="Credit" /> {/* Green for Credit */}
                <Bar dataKey="debit" fill="#EF4444" name="Debit" />   {/* Red for Debit */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="bg-gray-100 h-48 flex items-center justify-center rounded-lg text-gray-500">
              <p>No monthly trend data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
