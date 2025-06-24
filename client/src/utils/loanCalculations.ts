export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    // No interest scenario
    return parseFloat((principal / tenureMonths).toFixed(2));
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return parseFloat(emi.toFixed(2));
};

interface LoanReport {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  emi: number;
  totalPayment: number;
  totalInterest: number;
}

export const generateLoanReport = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): LoanReport => {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const totalPayment = parseFloat((emi * tenureMonths).toFixed(2));
  const totalInterest = parseFloat((totalPayment - principal).toFixed(2));

  return {
    principal,
    annualRate,
    tenureMonths,
    emi,
    totalPayment,
    totalInterest,
  };
};
