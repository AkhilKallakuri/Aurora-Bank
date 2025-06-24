import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react'; // Added FileText and XCircle

// Define the props interface for ApplicationStatus
interface ApplicationStatusProps {
  status: string; // e.g., 'Not Applied', 'Submitting...', 'Pending Review', 'Approved', 'Failed'
  referenceId: string | null; // The unique ID for the application
}

const ApplicationStatus = ({ status, referenceId }: ApplicationStatusProps) => {

  const getStatusDisplay = (currentStatus: string) => {
    let icon;
    let badgeColorClass;
    let message;

    switch (currentStatus) {
      case 'Not Applied':
        icon = <FileText className="h-6 w-6 text-gray-500" />;
        badgeColorClass = 'bg-gray-100 text-gray-700';
        message = 'Fill out the form to apply for a loan.';
        break;
      case 'Submitting...':
        icon = <Clock className="h-6 w-6 text-blue-500 animate-spin" />;
        badgeColorClass = 'bg-blue-100 text-blue-700';
        message = 'Your application is being submitted.';
        break;
      case 'Pending Review':
        icon = <Clock className="h-6 w-6 text-orange-500" />;
        badgeColorClass = 'bg-orange-100 text-orange-700';
        message = 'Your application is under review.';
        break;
      case 'Approved':
        icon = <CheckCircle className="h-6 w-6 text-green-500" />;
        badgeColorClass = 'bg-green-100 text-green-700';
        message = 'Congratulations! Your loan has been approved.';
        break;
      case 'Failed':
      case 'Rejected': // Added 'Rejected' as a possible status from backend
        icon = <XCircle className="h-6 w-6 text-red-500" />;
        badgeColorClass = 'bg-red-100 text-red-700';
        message = 'Your application could not be submitted or was rejected.';
        break;
      default:
        icon = <AlertCircle className="h-6 w-6 text-gray-500" />;
        badgeColorClass = 'bg-gray-100 text-gray-700';
        message = 'Unknown application status.';
        break;
    }

    return { icon, badgeColorClass, message };
  };

  const { icon, badgeColorClass, message } = getStatusDisplay(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-lg font-semibold text-gray-800">Current Status:</span>
          </div>
          <Badge className={badgeColorClass}>{status}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-2">{message}</p>
        {referenceId && (
          <p className="text-sm text-gray-700 font-medium">Reference ID: <span className="text-blue-600">{referenceId}</span></p>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationStatus;