import React, { useState } from 'react';
import LoginPage from "../components/banking/LoginPage"; // Corrected import path to relative
import Dashboard from "../components/banking/Dashboard"; // Corrected import path to relative
import { Button } from "@/components/ui/button";
import { LogOut, Home, PiggyBank, CreditCard, BarChart3, Shield, Zap, Lock, TrendingUp } from 'lucide-react'; // Added more icons

interface UserData {
  id: number;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
}

const IndexPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState('overview'); // Default dashboard tab after login
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // REINTRODUCED: State to control whether to show the LoginPage or a simple landing view
  const [showLoginPage, setShowLoginPage] = useState(false);
  // NEW STATE: Used to force re-mounting/resetting of LoginPage (still useful for login/logout)
  const [loginPageKey, setLoginPageKey] = useState(0);


  const handleLoginSuccess = (userData: UserData) => {
    setIsLoggedIn(true);
    setLoggedInUser(userData);
    setCurrentPage('overview'); // Go to dashboard 'overview' tab after login
    setIsSidebarOpen(true); // Ensure sidebar is open on dashboard
    setShowLoginPage(false); // Hide login page after successful login, go to dashboard
    setLoginPageKey(prev => prev + 1); // Reset login page key on successful login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setCurrentPage('overview'); // Reset to default overview (or login) state
    setIsSidebarOpen(false); // Close sidebar on logout
    setShowLoginPage(false); // Go back to the initial landing state
    setLoginPageKey(prev => prev + 1); // Increment key to reset LoginPage state
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar automatically on navigation click
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Function to be passed to LoginPage's onBack prop
  const handleBackToHome = () => {
    setIsLoggedIn(false); // Ensure we are in the logged-out state
    setShowLoginPage(false); // Go back to the welcome screen
    setLoginPageKey(prev => prev + 1); // Increment key to reset LoginPage state if it was shown
  };

  // Function to handle "Learn More" clicks
  const handleLearnMore = (feature: string) => {
    // You can replace alert with a custom modal component for a better UX
    switch (feature) {
      case 'instant-transfers':
        alert("Instant Transfers: Enjoy lightning-fast money transfers to any bank, 24/7, with minimal fees.");
        break;
      case 'robust-security':
        alert("Robust Security: Your financial data is protected with multi-layered encryption, fraud detection, and secure authentication methods.");
        break;
      case 'smart-analytics':
        alert("Smart Analytics: Get a clear picture of your finances with personalized spending insights, budgeting tools, and trend analysis.");
        break;
      default:
        alert("Learn more about our banking services!");
    }
  };

  // Conditional rendering based on login status and showLoginPage state
  if (!isLoggedIn) {
    if (showLoginPage) {
      // If not logged in and explicitly showing login page
      return (
        <LoginPage
          key={loginPageKey} // Apply the key here to force re-mount on key change
          onLogin={handleLoginSuccess}
          onBack={handleBackToHome} // Use the new handler to go back to welcome screen
        />
      );
    } else {
      // If not logged in and not showing login page (initial landing view / "beautiful UI")
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4 text-gray-800"> {/* Adjusted py-8 */}
          <div className="text-center mb-8"> {/* Adjusted mb-8 */}
            <Shield className="h-20 w-20 text-green-600 mx-auto mb-3" /> {/* Adjusted icon size and mb */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Aurora Bank</h1> {/* Adjusted text size and mb */}
            <p className="text-lg text-gray-600">Your trusted partner for modern banking.</p> {/* Adjusted text size */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10"> {/* Adjusted gap and mb */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center border-t-4 border-purple-500"> {/* Adjusted padding */}
              <Zap className="h-10 w-10 text-purple-600 mb-3" /> {/* Adjusted icon size and mb */}
              <h2 className="text-xl font-semibold mb-2">Instant Transfers</h2>
              <p className="text-gray-600 text-sm mb-3">Send and receive money in seconds, anytime, anywhere.</p> {/* Adjusted mb */}
              <Button 
                variant="outline" 
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
                onClick={() => handleLearnMore('instant-transfers')}
              >
                Learn More
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center border-t-4 border-teal-500"> {/* Adjusted padding */}
              <Lock className="h-10 w-10 text-teal-600 mb-3" /> {/* Adjusted icon size and mb */}
              <h2 className="text-xl font-semibold mb-2">Robust Security</h2>
              <p className="text-gray-600 text-sm mb-3">Your funds and data are protected with industry-leading encryption.</p> {/* Adjusted mb */}
              <Button 
                variant="outline" 
                className="text-teal-600 border-teal-300 hover:bg-teal-50"
                onClick={() => handleLearnMore('robust-security')}
              >
                Learn More
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center border-t-4 border-red-500"> {/* Adjusted padding */}
              <TrendingUp className="h-10 w-10 text-red-600 mb-3" /> {/* Adjusted icon size and mb */}
              <h2 className="text-xl font-semibold mb-2">Smart Analytics</h2>
              <p className="text-gray-600 text-sm mb-3">Gain insights into your spending with detailed reports.</p> {/* Adjusted mb */}
              <Button 
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleLearnMore('smart-analytics')}
              >
                Learn More
              </Button>
            </div>
          </div>

          <Button
            onClick={() => setShowLoginPage(true)} // Click to go to the login form
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300"
          >
            Get Started (Login)
          </Button>
        </div>
      );
    }
  }

  // If logged in, render the Dashboard and Sidebar
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md p-4 flex-shrink-0 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
      >
        <div className={isSidebarOpen ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Aurora Bank</h2>
          </div>
          <nav className="space-y-2">
            <Button
              variant={currentPage === 'overview' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigateTo('overview')}
            >
              <Home className="h-5 w-5 mr-3 text-blue-600" /> Dashboard
            </Button>
            <Button
              variant={currentPage === 'transfer' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigateTo('transfer')}
            >
              <CreditCard className="h-5 w-5 mr-3 text-purple-600" /> Transfer
            </Button>
            <Button
              variant={currentPage === 'loans' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigateTo('loans')}
            >
              <PiggyBank className="h-5 w-5 mr-3 text-green-600" /> Loans
            </Button>
            <Button
              variant={currentPage === 'history' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigateTo('history')}
            >
              <BarChart3 className="h-5 w-5 mr-3 text-orange-600" /> History
            </Button>
            <Button
              variant={currentPage === 'analytics' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigateTo('analytics')}
            >
              <BarChart3 className="h-5 w-5 mr-3 text-orange-600" /> Analytics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" /> Logout
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 p-6 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}
      >
        {loggedInUser && (
          <Dashboard
            user={loggedInUser}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            initialActiveTab={currentPage}
          />
        )}
      </main>
    </div>
  );
};

export default IndexPage;
