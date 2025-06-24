import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '@/components/DocumentUpload';

const LoanApplicationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    loanAmount: '',
    tenure: '',
    monthlyIncome: '',
    employmentType: '',
    purpose: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { loanAmount, tenure, monthlyIncome, employmentType } = formData;

    if (!loanAmount || !tenure || !monthlyIncome || !employmentType) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Application Submitted!',
      description:
        'Your loan application has been submitted successfully. You will receive a confirmation email shortly.'
    });

    console.log('Loan application submitted:', formData);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl">Loan Application</CardTitle>
        <p className="text-blue-100">Fill in your details for Home Loan</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Amount */}
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
            <Input
              id="loanAmount"
              type="number"
              min="0"
              placeholder="Enter loan amount"
              value={formData.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
            />
            <p className="text-xs text-gray-500">Maximum: ₹5 Crore</p>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <Label htmlFor="tenure">Loan Tenure *</Label>
            <Select
              value={formData.tenure}
              onValueChange={(value) => handleInputChange('tenure', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year} Years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monthly Income */}
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
            <Input
              id="monthlyIncome"
              type="number"
              min="0"
              placeholder="Enter monthly income"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            />
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type *</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => handleInputChange('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salaried">Salaried</SelectItem>
                <SelectItem value="self-employed">Self Employed</SelectItem>
                <SelectItem value="business">Business Owner</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Loan</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of the loan"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* File Upload Section */}
          <DocumentUpload />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanApplicationForm;
