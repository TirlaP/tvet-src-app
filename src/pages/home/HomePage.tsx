import React from 'react';
import { Link } from 'react-router-dom';
import UpdatedLayout from '../../components/layout/UpdatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronRight, FileTextIcon, UsersIcon, VoteIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
  const { currentUser, isAdmin } = useAuth();

  const VoteIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  );

  return (
    <UpdatedLayout>
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <section className="text-center py-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              TVET SRC Elections
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Nominate, support, and be part of student leadership at your TVET college
            </p>
            {currentUser ? (
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/nominate">
                  <Button size="lg" className="gap-2">
                    <VoteIcon className="h-5 w-5" />
                    Nominate a Candidate
                  </Button>
                </Link>
                <Link to="/support">
                  <Button size="lg" variant="outline" className="gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Support a Nomination
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <Button size="lg">
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-6">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-primary" />
                  Nominate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Fill out a nomination form with your details and position of interest. Upload your student card and complete the requirement steps.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  Gather Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share your nomination with fellow students via QR code or direct link. Secure support from three students to complete your nomination.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VoteIcon className="h-5 w-5 text-primary" />
                  Get Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  After submission, your nomination will be reviewed by administrators. Once approved, you'll be eligible for the SRC elections.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary text-white rounded-xl p-8 text-center mt-4">
          <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Student leadership starts with putting yourself forward. Be part of shaping the future of your TVET college.
          </p>
          {currentUser ? (
            <Link to="/nominate">
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100 text-primary">
                Start Your Nomination
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100 text-primary">
                Login to Get Started
              </Button>
            </Link>
          )}
        </section>

        {/* FAQ Section */}
        <section className="py-6">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Who can nominate or be nominated?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Any registered student at the TVET college can nominate themselves or be nominated by others for SRC positions, provided they meet the eligibility criteria.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How many supporters do I need?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each nomination requires three supporters (one proposer and two seconders) to be considered valid.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How is my data protected?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All data is stored securely and in compliance with POPIA regulations. Your information is only used for the purpose of SRC elections.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </UpdatedLayout>
  );
};

export default HomePage;
