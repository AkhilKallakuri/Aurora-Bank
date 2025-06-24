import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
    
    // Validate form
    if (!formData.loanAmount || !formData.tenure || !formData.monthlyIncome || !formData.employmentType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate application submission
    toast({
      title: "Application Submitted!",
      description: "Your loan application has been submitted successfully. You will receive a confirmation email shortly.",
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
          <div className="space-y-2">
            <Label htmlFor="loanAmount" className="text-sm font-medium">
              Loan Amount (₹) *
            </Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="Enter loan amount"
              value={formData.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">Maximum: ₹5 Crore</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenure" className="text-sm font-medium">
              Loan Tenure *
            </Label>
            <Select onValueChange={(value) => handleInputChange('tenure', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="15">15 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
                <SelectItem value="25">25 Years</SelectItem>
                <SelectItem value="30">30 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncome" className="text-sm font-medium">
              Monthly Income (₹) *
            </Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="Enter monthly income"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType" className="text-sm font-medium">
              Employment Type *
            </Label>
            <Select onValueChange={(value) => handleInputChange('employmentType', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              Purpose of Loan
            </Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of the loan"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="min-h-[100px]"
            />
          </div>

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