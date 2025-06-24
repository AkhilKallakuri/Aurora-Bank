// CLIENT/src/components/banking/LoanApplication.tsx
import { useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Import the new UI components
import LoanCalculator from "@/components/ui/LoanCalculator";
import ApplicationStatus from "@/components/ApplicationStatus";

import { PiggyBank, Home, Car, GraduationCap, Building } from "lucide-react";

interface LoanApplicationProps {
  user: { id: number; name: string; email: string; accountNumber: string; balance: number; }; // Ensure 'user' prop has 'id' and other details
}

const API_URL = "http://localhost:3001"; // Consistent API URL

const LoanApplication = ({ user }: LoanApplicationProps) => {
  const [loanData, setLoanData] = useState({
    loanType: "",
    amount: "",
    tenure: "", // In years
    purpose: "",
    monthlyIncome: "",
    employmentType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('Not Applied');
  const [applicationReferenceId, setApplicationReferenceId] = useState<string | null>(null);
  const { toast } = useToast();

  const loanTypes = [
    { id: "home", name: "Home Loan", icon: Home, rate: "8.5% onwards", maxAmount: "₹5 Crore" },
    { id: "car", name: "Car Loan", icon: Car, rate: "9.5% onwards", maxAmount: "₹1 Crore" },
    { id: "personal", name: "Personal Loan", icon: PiggyBank, rate: "11% onwards", maxAmount: "₹50 Lakh" },
    { id: "education", name: "Education Loan", icon: GraduationCap, rate: "7.5% onwards", maxAmount: "₹1.5 Crore" },
    { id: "business", name: "Business Loan", icon: Building, rate: "10% onwards", maxAmount: "₹10 Crore" }
  ];

  const handleLoanTypeSelect = (loanTypeId: string) => {
    setLoanData(prev => ({ ...prev, loanType: loanTypeId }));
    const selectedLoan = loanTypes.find(loan => loan.id === loanTypeId);
    if (selectedLoan) {
      toast({
        title: "Loan Type Selected",
        description: `${selectedLoan.name} selected. Rate: ${selectedLoan.rate}`,
      });
    }
  };

  const handleApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApplicationStatus('Submitting...');
    setApplicationReferenceId(null);

    // --- CRITICAL: Frontend Validation for User ID ---
    if (!user || typeof user.id === 'undefined' || user.id === null) {
      toast({
        title: "Authentication Error",
        description: "User not logged in or user ID is missing. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setApplicationStatus('Failed');
      console.error("Loan Application: User ID missing or invalid.", user);
      return;
    }

    // Basic frontend validation for form fields
    if (!loanData.loanType || !loanData.amount || !loanData.tenure || !loanData.monthlyIncome || !loanData.employmentType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required loan application fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      setApplicationStatus('Failed');
      return;
    }

    // --- Ensure numerical types are parsed correctly before sending ---
    const parsedAmount = parseFloat(loanData.amount);
    const parsedTenure = parseInt(loanData.tenure);
    const parsedMonthlyIncome = parseFloat(loanData.monthlyIncome);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Loan Amount must be a positive number.');
      setIsLoading(false);
      setApplicationStatus('Failed');
      return;
    }
    if (isNaN(parsedTenure) || parsedTenure <= 0) {
      setErrorMessage('Loan Tenure must be a positive number of years.');
      setIsLoading(false);
      setApplicationStatus('Failed');
      return;
    }
    if (isNaN(parsedMonthlyIncome) || parsedMonthlyIncome <= 0) {
      setErrorMessage('Monthly Income must be a positive number.');
      setIsLoading(false);
      setApplicationStatus('Failed');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/loans/apply`, {
        userId: user.id, // Make sure 'user.id' is populated here!
        loanType: loanData.loanType,
        amount: parsedAmount, // Send as number
        tenure: parsedTenure, // Send as number
        purpose: loanData.purpose,
        monthlyIncome: parsedMonthlyIncome, // Send as number
        employmentType: loanData.employmentType
      });

      if (response.status === 201) {
        const { message, status, referenceId } = response.data;
        toast({
          title: "Application Submitted",
          description: `${message} Reference ID: ${referenceId}`,
          duration: 5000,
        });
        setApplicationStatus(status);
        setApplicationReferenceId(referenceId);
        // Optionally reset form fields after successful submission
        setLoanData({
          loanType: "",
          amount: "",
          tenure: "",
          purpose: "",
          monthlyIncome: "",
          employmentType: ""
        });
      }
    } catch (error: any) {
      console.error("Loan application error:", error); // <-- Check your browser's console for this!
      const errorMessageFromServer = error.response?.data?.message || "Failed to submit loan application. Please try again.";
      toast({
        title: "Submission Error",
        description: errorMessageFromServer,
        variant: "destructive",
      });
      setApplicationStatus('Failed');
      // If error.response exists, log its data for more details
      if (error.response) {
        console.error("Backend response data:", error.response.data);
        console.error("Backend response status:", error.response.status);
        console.error("Backend response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something else happened in setting up the request
        console.error("Error setting up request:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedLoanDetails = () => {
    return loanTypes.find(loan => loan.id === loanData.loanType);
  };

  return (
    <div className="space-y-6">
      {/* Loan Types Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanTypes.map((loan) => {
          const IconComponent = loan.icon;
          const isSelected = loanData.loanType === loan.id;
          return (
            <Card
              key={loan.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                  : 'hover:border-blue-200'
              }`}
              onClick={() => handleLoanTypeSelect(loan.id)}
            >
              <CardContent className="p-6 text-center">
                <IconComponent className={`h-8 w-8 mx-auto mb-3 ${
                  isSelected ? 'text-blue-700' : 'text-blue-600'
                }`} />
                <h3 className={`font-semibold mb-1 ${
                  isSelected ? 'text-blue-800' : 'text-gray-800'
                }`}>{loan.name}</h3>
                <p className="text-sm text-green-600 font-medium">{loan.rate}</p>
                <p className="text-xs text-gray-500">Up to {loan.maxAmount}</p>
                {isSelected && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Selected
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Loan Info Card */}
      {loanData.loanType && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">
                  {getSelectedLoanDetails()?.name} Selected
                </h4>
                <p className="text-sm text-blue-600">
                  Interest Rate: {getSelectedLoanDetails()?.rate} |
                  Max Amount: {getSelectedLoanDetails()?.maxAmount}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoanData(prev => ({ ...prev, loanType: "" }))}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Application</CardTitle>
            <CardDescription>
              {loanData.loanType
                ? `Fill in your details for ${getSelectedLoanDetails()?.name}`
                : "Select a loan type above and fill in your details"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter loan amount"
                  value={loanData.amount}
                  onChange={(e) => setLoanData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
                {loanData.loanType && (
                  <p className="text-xs text-gray-500">
                    Maximum: {getSelectedLoanDetails()?.maxAmount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Loan Tenure</Label>
                <Select value={loanData.tenure} onValueChange={(value) => setLoanData(prev => ({ ...prev, tenure: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  value={loanData.monthlyIncome}
                  onChange={(e) => setLoanData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={loanData.employmentType} onValueChange={(value) => setLoanData(prev => ({ ...prev, employmentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self Employed</SelectItem>
                    <SelectItem value="business">Business Owner</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of the loan"
                  value={loanData.purpose}
                  onChange={(e) => setLoanData(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !loanData.loanType}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loan Calculator & Application Status */}
        <div className="space-y-6">
          {/* Loan Calculator Component */}
          <LoanCalculator
            amount={loanData.amount}
            tenure={loanData.tenure}
            selectedLoanTypeDetails={getSelectedLoanDetails()}
          />

          {/* Application Status Component */}
          <ApplicationStatus
            status={applicationStatus}
            referenceId={applicationReferenceId}
          />

          {/* Required Documents Card (remains static) */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• PAN Card</li>
                <li>• Aadhaar Card</li>
                <li>• Income Proof (Salary Slips/ITR)</li>
                <li>• Bank Statements (3 months)</li>
                <li>• Property Documents (for secured loans)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;