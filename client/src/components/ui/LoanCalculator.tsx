import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Assuming Input component can handle type="range"
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react'; // For the download button icon
import { Button } from '@/components/ui/button';

interface LoanCalculatorProps {
  // These props are now optional as the component will manage its own amount/tenure state with sliders
  // but keeping them for initial values if passed from parent (e.g., from LoanApplication form)
  initialAmount?: string;
  initialTenure?: string; // In years
  selectedLoanTypeDetails?: {
    name: string;
    rate: string; // e.g., "8.5% onwards"
  };
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ initialAmount, initialTenure, selectedLoanTypeDetails }) => {
  // Local state for sliders
  const [loanAmount, setLoanAmount] = useState<number>(parseFloat(initialAmount || '2500000')); // Default to 25 Lakh
  const [loanTenure, setLoanTenure] = useState<number>(parseInt(initialTenure || '20')); // Default to 20 years
  const [interestRate, setInterestRate] = useState<number>(selectedLoanTypeDetails ? parseFloat(selectedLoanTypeDetails.rate.replace('% onwards', '')) : 8.5); // Default to 8.5%

  const [monthlyEMI, setMonthlyEMI] = useState<number>(0);
  const [totalAmountPayable, setTotalAmountPayable] = useState<number>(0);
  const [totalInterestPayable, setTotalInterestPayable] = useState<number>(0);

  // Constants for sliders
  const MIN_LOAN_AMOUNT = 100000; // ₹1 Lakh
  const MAX_LOAN_AMOUNT = 50000000; // ₹5 Crore
  const STEP_LOAN_AMOUNT = 100000;

  const MIN_LOAN_TENURE = 1; // 1 Year
  const MAX_LOAN_TENURE = 30; // 30 Years
  const STEP_LOAN_TENURE = 1;

  const MIN_INTEREST_RATE = 6;
  const MAX_INTEREST_RATE = 15;
  const STEP_INTEREST_RATE = 0.5;

  useEffect(() => {
    // Recalculate EMI whenever loanAmount, loanTenure, or interestRate changes
    const calculateEMI = () => {
      const principal = loanAmount;
      const annualInterestRate = interestRate / 100; // Convert percentage to decimal
      const monthlyInterestRate = annualInterestRate / 12;
      const numberOfPayments = loanTenure * 12; // Convert years to months

      if (principal > 0 && numberOfPayments > 0 && monthlyInterestRate > 0) {
        const emi = principal * monthlyInterestRate * Math.pow((1 + monthlyInterestRate), numberOfPayments) / (Math.pow((1 + monthlyInterestRate), numberOfPayments) - 1);
        setMonthlyEMI(emi);
        setTotalAmountPayable(emi * numberOfPayments);
        setTotalInterestPayable((emi * numberOfPayments) - principal);
      } else if (principal > 0 && numberOfPayments > 0 && monthlyInterestRate === 0) {
        // Handle 0% interest case
        setMonthlyEMI(principal / numberOfPayments);
        setTotalAmountPayable(principal);
        setTotalInterestPayable(0);
      } else {
        setMonthlyEMI(0);
        setTotalAmountPayable(0);
        setTotalInterestPayable(0);
      }
    };

    calculateEMI();
  }, [loanAmount, loanTenure, interestRate]);

  // Update interest rate if selectedLoanTypeDetails changes
  useEffect(() => {
    if (selectedLoanTypeDetails && selectedLoanTypeDetails.rate) {
      const rateMatch = selectedLoanTypeDetails.rate.match(/(\d+(\.\d+)?)/);
      if (rateMatch && rateMatch[1]) {
        setInterestRate(parseFloat(rateMatch[1]));
      }
    }
  }, [selectedLoanTypeDetails]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const handleDownloadReport = () => {
    const reportContent = `
Loan Calculation Report
-----------------------
Loan Amount: ${formatCurrency(loanAmount)}
Loan Tenure: ${loanTenure} years
Interest Rate: ${interestRate.toFixed(1)}% p.a.

Monthly EMI: ${formatCurrency(monthlyEMI)}
Total Amount Payable: ${formatCurrency(totalAmountPayable)}
Total Interest Payable: ${formatCurrency(totalInterestPayable)}
-----------------------
Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loan_calculation_report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object

    console.log("Download Calculation Report button clicked! Report generated.");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-t-lg">
        <CardTitle className="text-xl">Loan Calculator</CardTitle>
        <CardDescription className="text-green-100">Estimate your monthly payments</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Loan Amount Slider */}
        <div className="space-y-2">
          <Label htmlFor="loanAmount" className="text-gray-700 font-medium flex justify-between">
            <span>Loan Amount:</span>
            <span className="text-blue-600">{formatCurrency(loanAmount)}</span>
          </Label>
          <Input
            id="loanAmount"
            type="range"
            min={MIN_LOAN_AMOUNT}
            max={MAX_LOAN_AMOUNT}
            step={STEP_LOAN_AMOUNT}
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(MIN_LOAN_AMOUNT)}</span>
            <span>{formatCurrency(MAX_LOAN_AMOUNT)}</span>
          </div>
        </div>

        {/* Loan Tenure Slider */}
        <div className="space-y-2">
          <Label htmlFor="loanTenure" className="text-gray-700 font-medium flex justify-between">
            <span>Loan Tenure:</span>
            <span className="text-blue-600">{loanTenure} years</span>
          </Label>
          <Input
            id="loanTenure"
            type="range"
            min={MIN_LOAN_TENURE}
            max={MAX_LOAN_TENURE}
            step={STEP_LOAN_TENURE}
            value={loanTenure}
            onChange={(e) => setLoanTenure(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{MIN_LOAN_TENURE} Year</span>
            <span>{MAX_LOAN_TENURE} Years</span>
          </div>
        </div>

        {/* Interest Rate Slider (can be dynamic based on loan type, or manual) */}
        <div className="space-y-2">
          <Label htmlFor="interestRate" className="text-gray-700 font-medium flex justify-between">
            <span>Interest Rate:</span>
            <span className="text-blue-600">{interestRate.toFixed(1)}% p.a.</span>
          </Label>
          <Input
            id="interestRate"
            type="range"
            min={MIN_INTEREST_RATE}
            max={MAX_INTEREST_RATE}
            step={STEP_INTEREST_RATE}
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{MIN_INTEREST_RATE}%</span>
            <span>{MAX_INTEREST_RATE}%</span>
          </div>
        </div>

        {/* EMI Calculation Results */}
        <div className="grid grid-cols-2 gap-4 text-center mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="text-sm text-gray-600">Monthly EMI</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(monthlyEMI)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalAmountPayable)}</p>
          </div>
          <div className="col-span-2 mt-2">
            <p className="text-sm text-gray-600">Total Interest</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalInterestPayable)}</p>
          </div>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
          onClick={handleDownloadReport} // Attach the handler here
        >
          <Download className="h-4 w-4 mr-2" /> Download Calculation Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;
