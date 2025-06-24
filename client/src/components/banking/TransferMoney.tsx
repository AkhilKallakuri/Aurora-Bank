import axios from "axios";
import { useState, useEffect } from "react"; // Import useEffect
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send, ArrowRight, Wallet, Banknote, Loader2 } from "lucide-react"; // Added Loader2 icon

interface Transaction {
  id?: number;
  date: string;
  description: string;
  type: "Credit" | "Debit";
  amount: number;
  balance: number;
  status: string;
  recipientName?: string;
  recipientAccount?: string;
  ifscCode?: string;
  transferType?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
}

interface TransferMoneyProps {
  user: User;
  onUpdateBalance: (newBalance: number) => void;
  addTransaction: (newTransaction: Transaction) => void;
}

const API_URL = "http://localhost:3001";

const TransferMoney = ({
  user,
  onUpdateBalance,
  addTransaction,
}: TransferMoneyProps) => {
  const [transferData, setTransferData] = useState({
    recipientName: "",
    accountNumber: "",
    ifscCode: "",
    amount: "",
    transferType: "", // For external transfers (IMPS, NEFT, RTGS)
    remarks: "",
  });
  const [transactionMode, setTransactionMode] = useState<'external' | 'deposit'>('external');
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]); // State for recent transfers
  const [isLoadingRecentTransfers, setIsLoadingRecentTransfers] = useState(true); // Loading state for recent transfers
  const { toast } = useToast();

  const limits = {
    imps: 500000,
    neft: 5000000,
    rtgs: 20000000,
  };

  // Function to fetch recent transfers
  const fetchRecentTransfers = async () => {
    if (!user?.id) return;
    setIsLoadingRecentTransfers(true);
    try {
      // Fetch only Debit transactions for recent transfers display
      const response = await axios.get(`${API_URL}/api/transactions/transactions/${user.id}`, {
        params: { type: 'Debit' } // Filter for Debit transactions
      });
      // Take up to the last 5 debit transactions
      setRecentTransfers(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent transfers:", error);
    } finally {
      setIsLoadingRecentTransfers(false);
    }
  };

  useEffect(() => {
    fetchRecentTransfers(); // Fetch recent transfers on component mount and user change
  }, [user.id]); // Dependency array includes user.id

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const amountValue = parseFloat(transferData.amount);

    // Basic validation for amount
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      let response;
      let transactionType: 'Credit' | 'Debit';
      let description: string;
      let endpoint: string;
      let payload: any;

      if (transactionMode === 'external') {
        // External Transfer (Debit) logic
        if (
          !transferData.recipientName ||
          !transferData.accountNumber ||
          !transferData.ifscCode ||
          !transferData.transferType
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for external transfer.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (amountValue > (limits[transferData.transferType as keyof typeof limits] || Infinity)) {
          toast({
            title: "Limit Exceeded",
            description: `Amount exceeds the limit for ${transferData.transferType.toUpperCase()}.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        transactionType = 'Debit';
        description = transferData.remarks || `Transfer to ${transferData.recipientName} (${transferData.accountNumber})`;
        endpoint = `${API_URL}/api/transactions/transfer`; // Existing debit transfer endpoint
        payload = {
          userId: user.id,
          recipientName: transferData.recipientName,
          recipientAccount: transferData.accountNumber,
          ifscCode: transferData.ifscCode,
          transferType: transferData.transferType,
          amount: amountValue,
          remarks: transferData.remarks,
        };

        console.log("Frontend: Sending external transfer request with data:", payload);
        response = await axios.post(endpoint, payload);

      } else { // transactionMode === 'deposit'
        // Deposit/Credit logic
        transactionType = 'Credit';
        description = transferData.remarks || "Cash Deposit";
        endpoint = `${API_URL}/api/transactions/deposit`; // NEW: Backend endpoint for deposits/credits
        payload = {
          userId: user.id,
          amount: amountValue,
          remarks: transferData.remarks,
          description: description, // Pass description for deposit
        };

        console.log("Frontend: Sending deposit/credit request with data:", payload);
        response = await axios.post(endpoint, payload);
      }

      // Log the successful response from the backend
      console.log("Frontend: Transaction successful. Backend response:", response.data);

      // Update parent state (user balance and transaction history)
      onUpdateBalance(response.data.newBalance);
      addTransaction(response.data.transaction); // Backend should return the full new transaction object

      // If it's an external transfer (debit), add it to recentTransfers
      if (transactionMode === 'external') {
        setRecentTransfers(prev => [response.data.transaction, ...prev.slice(0, 4)]);
      }

      toast({
        title: `${transactionMode === 'external' ? 'Transfer' : 'Deposit'} Successful`,
        description: `${transactionMode === 'external' ? '₹' + amountValue.toLocaleString('en-IN') + ' ' + transactionType + 'ed to ' + transferData.recipientName : '₹' + amountValue.toLocaleString('en-IN') + ' ' + transactionType + 'ed to your account'}.`,
      });

      // Clear form fields
      setTransferData({
        recipientName: "",
        accountNumber: "",
        ifscCode: "",
        amount: "",
        transferType: "",
        remarks: "",
      });

    } catch (error: any) {
      // Log the error response from the backend
      console.error("Frontend: Transaction failed. Error details:", error.response);
      toast({
        title: `${transactionMode === 'external' ? 'Transfer' : 'Deposit'} Failed`,
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred during the transaction.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Transaction Form */}
      <Card className="lg:col-span-2 p-6 rounded-lg shadow-md">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {transactionMode === 'external' ? 'Transfer Money' : 'Deposit / Credit'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {transactionMode === 'external' ? 'Send money to any bank account instantly.' : 'Add funds to your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Transaction Mode Selector */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={transactionMode === 'external' ? 'default' : 'outline'}
              onClick={() => setTransactionMode('external')}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" /> External Transfer
            </Button>
            <Button
              variant={transactionMode === 'deposit' ? 'default' : 'outline'}
              onClick={() => setTransactionMode('deposit')}
              className="flex-1"
            >
              <Banknote className="h-4 w-4 mr-2" /> Deposit / Credit
            </Button>
          </div>

          <form onSubmit={handleTransaction} className="space-y-4">
            {transactionMode === 'external' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    placeholder="Enter recipient's name"
                    value={transferData.recipientName}
                    onChange={(e) => setTransferData((prev) => ({ ...prev, recipientName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={transferData.accountNumber}
                    onChange={(e) => setTransferData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="Enter IFSC code"
                    value={transferData.ifscCode}
                    onChange={(e) => setTransferData((prev) => ({ ...prev, ifscCode: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferType">Transfer Type</Label>
                  <Select value={transferData.transferType} onValueChange={(value) => setTransferData((prev) => ({ ...prev, transferType: value }))} required disabled={isLoading}>
                    <SelectTrigger id="transferType">
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imps">IMPS (Immediate)</SelectItem>
                      <SelectItem value="neft">NEFT (Next working day)</SelectItem>
                      <SelectItem value="rtgs">RTGS (Real Time - ₹2L+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Amount and Remarks are common to both modes */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={transferData.amount}
                onChange={(e) => setTransferData((prev) => ({ ...prev, amount: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder={transactionMode === 'external' ? "Enter transfer remarks" : "Enter deposit remarks (e.g., 'Cash Deposit', 'Salary Credit')"}
                value={transferData.remarks}
                onChange={(e) => setTransferData((prev) => ({ ...prev, remarks: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200" disabled={isLoading}>
              {isLoading ? "Processing..." : (transactionMode === 'external' ? 'Transfer Money' : 'Confirm Deposit')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right Column: Transfer Limits & Beneficiary Management & Recent Transfers */}
      <div className="lg:col-span-1 space-y-6">
        {transactionMode === 'external' && (
          <Card className="p-6 rounded-lg shadow-md">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Transfer Limits</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 text-sm space-y-2">
              <p className="flex justify-between"><span>IMPS (Per Transaction)</span> <span className="font-medium">₹5,00,000</span></p>
              <p className="flex justify-between"><span>NEFT (Per Transaction)</span> <span className="font-medium">₹50,00,000</span></p>
              <p className="flex justify-between"><span>RTGS (Per Transaction)</span> <span className="font-medium">₹2,00,00,000</span></p>
              <p className="flex justify-between"><span>Daily Limit</span> <span className="font-medium">₹10,00,000</span></p>
            </CardContent>
          </Card>
        )}

        {/* This card is always visible */}
        <Card className="p-6 rounded-lg shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Beneficiary Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-700 text-sm mb-3">Add frequently used beneficiaries for quick transfers.</p>
            <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">Manage Beneficiaries</Button>
          </CardContent>
        </Card>

        {/* NEW: Recent Transfers Card - moved to the right column */}
        <Card className="p-6 rounded-lg shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingRecentTransfers ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <p className="ml-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : recentTransfers.length === 0 ? (
              <p className="text-sm text-gray-500">No recent transfers to display.</p>
            ) : (
              <div className="space-y-3">
                {recentTransfers.map((txn) => (
                  <div key={txn.id} className="flex justify-between items-center p-2 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{txn.recipientName || txn.description}</p>
                      {txn.recipientAccount && (
                        <p className="text-xs text-gray-500">A/C: ****{txn.recipientAccount.slice(-4)}</p>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === 'Debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {txn.type === 'Debit' ? '-' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferMoney;
