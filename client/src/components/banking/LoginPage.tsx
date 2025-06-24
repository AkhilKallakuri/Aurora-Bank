import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Corrected import path for useToast
import axios from "axios"; // Import axios

interface LoginPageProps {
  onLogin: (userData: any) => void; // userData will now come from the backend
  onBack: () => void;
}

const LoginPage = ({ onLogin, onBack }: LoginPageProps) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State for frontend validation errors
  const { toast } = useToast();

  const MIN_PASSWORD_LENGTH = 6; // Define minimum password length

  const API_URL = "http://localhost:3001";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error message

    // --- Frontend Validation ---
    if (!credentials.email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (!credentials.password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    // --- End Frontend Validation ---

    setIsLoading(true); // Start loading state

    try {
      // --- ACTUAL API CALL TO BACKEND ---
      // This sends the email and password to your Node.js backend's /api/login endpoint
      const response = await axios.post(`${API_URL}/api/auth/login`, { // Corrected endpoint to /api/auth/login
        email: credentials.email,
        password: credentials.password,
      });

      // If the request is successful (status 2xx), axios puts the response data in `response.data`
      const userData = response.data.user;

      // Call the onLogin prop with the actual user data received from the backend
      if (typeof onLogin === 'function') {
        onLogin(userData); // Pass the user object (id, name, email, accountNumber, balance)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`, // Use actual name from backend response
        });
      }

    } catch (error: any) {
      // Handle errors from the backend or network issues
      // `error.response` exists if the server responded with a status code outside of 2xx
      const message = error.response?.data?.message || "An unexpected error occurred. Please check your network and backend server.";
      setErrorMessage(message); // Display error message from backend or a generic one
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Always end loading state, regardless of success or failure
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"> {/* Changed background to light gray */}
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          // Changed text color
          className="text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white rounded-lg shadow-xl border border-gray-200"> {/* Changed card background and border */}
          <CardHeader className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600" /> {/* Changed icon color to green */}
            </div>
            <CardTitle className="text-2xl text-gray-800 font-semibold">Aurora Bank</CardTitle> {/* Changed text color */}
            <CardDescription className="text-gray-600">
              Secure Online Banking Login
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm"> {/* Changed text color */}
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  // Changed input styling
                  className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm"> {/* Changed text color */}
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    // Changed input styling
                    className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    // Changed icon button color
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {errorMessage && ( // Display frontend validation errors here
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                  <span className="block sm:inline">{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                // Changed button color to blue
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium rounded-md transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" 
              // Changed link color
              className="text-blue-600 hover:underline text-sm">
                Forgot Password?
              </Button>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm"> {/* Changed demo box styling */}
              <p className="text-xs text-gray-600 text-center">
                Use credentials from your MySQL `users` table to log in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
