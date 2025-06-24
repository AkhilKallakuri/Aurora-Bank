import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CreditCard, PiggyBank, TrendingUp, Users, Globe } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const handleLearnMore = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">Aurora Bank</span>
          </div>
          <Button 
            onClick={onLoginClick}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
          >
            Online Banking
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Banking Made Simple
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
          Experience secure, fast, and reliable banking services with Aurora Bank. 
          Your trusted partner for all financial needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onLoginClick}
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
          >
            Access Your Account
          </Button>
          <Button 
            onClick={handleLearnMore}
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-section" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Why Choose Aurora Bank?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Shield className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>Secure Banking</CardTitle>
              <CardDescription className="text-blue-100">
                Advanced security measures to protect your funds and data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>Easy Transfers</CardTitle>
              <CardDescription className="text-blue-100">
                Send money instantly to any bank account across the country
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <PiggyBank className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>Smart Savings</CardTitle>
              <CardDescription className="text-blue-100">
                High-interest savings accounts with flexible terms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>Investment Options</CardTitle>
              <CardDescription className="text-blue-100">
                Grow your wealth with our investment and loan products
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>24/7 Support</CardTitle>
              <CardDescription className="text-blue-100">
                Round-the-clock customer service for all your banking needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Globe className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle>Global Access</CardTitle>
              <CardDescription className="text-blue-100">
                Access your account from anywhere in the world
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-white">
          <p>&copy; 2024 Aurora Bank. All rights reserved. | Security | Privacy | Terms</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
