import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { nominationService } from '../../lib/services';
import { NominationStatus } from '../../types/database';
import { PenLine, Clock, CheckCircle, XCircle, User, CalendarDays, Award } from 'lucide-react';

const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [myNominations, setMyNominations] = useState<any[]>([]);
  const [supportedNominations, setSupportedNominations] = useState<any[]>([]);
  
  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all nominations
        const allNominations = await nominationService.getAll();
        
        // Filter my nominations (where I am the nominee)
        const myNoms = allNominations.filter(
          nomination => nomination.nominee.id === currentUser.id
        );
        
        // Filter nominations I've supported
        const supportedNoms = allNominations.filter(
          nomination => nomination.supporters.some(
            supporter => supporter.supporter.id === currentUser.id
          )
        );
        
        setMyNominations(myNoms);
        setSupportedNominations(supportedNoms);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Get status icon based on nomination status
  const getStatusIcon = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.DRAFT:
        return <PenLine className="h-5 w-5 text-gray-500" />;
      case NominationStatus.PENDING:
        return <Clock className="h-5 w-5 text-amber-500" />;
      case NominationStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NominationStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Student Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Welcome, {currentUser.fullName}</CardTitle>
                <CardDescription>
                  Student Number: {currentUser.studentNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium">{currentUser.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year of Study</p>
                      <p className="font-medium">{currentUser.yearOfStudy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nominations</p>
                      <p className="font-medium">{myNominations.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Nominations */}
            <Card>
              <CardHeader>
                <CardTitle>My Nominations</CardTitle>
                <CardDescription>
                  Positions you have been nominated for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myNominations.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-gray-500">You haven't submitted any nominations yet</p>
                    <Button 
                      onClick={() => navigate('/nominate')}
                      className="mt-4"
                    >
                      Create a Nomination
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {myNominations.map((nomination) => (
                      <div 
                        key={nomination.id} 
                        className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(nomination.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{nomination.position}</h3>
                            <p className="text-sm text-gray-500">
                              Submitted on {formatDate(nomination.createdAt)}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                nomination.status === NominationStatus.DRAFT
                                  ? 'bg-gray-100 text-gray-800'
                                  : nomination.status === NominationStatus.PENDING
                                  ? 'bg-amber-100 text-amber-800'
                                  : nomination.status === NominationStatus.APPROVED
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {nomination.status === NominationStatus.DRAFT
                                  ? 'Draft'
                                  : nomination.status === NominationStatus.PENDING
                                  ? 'Pending Review'
                                  : nomination.status === NominationStatus.APPROVED
                                  ? 'Approved'
                                  : 'Rejected'}
                              </span>
                              
                              <span className="text-xs ml-2">
                                {nomination.supporters.length}/3 Supporters
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {nomination.status === NominationStatus.DRAFT && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/support/${nomination.shareLink}`)}
                            >
                              Share
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/nomination/${nomination.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Nominations */}
            <Card>
              <CardHeader>
                <CardTitle>Nominations I Support</CardTitle>
                <CardDescription>
                  Nominations you have supported
                </CardDescription>
              </CardHeader>
              <CardContent>
                {supportedNominations.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-gray-500">You haven't supported any nominations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {supportedNominations.map((nomination) => (
                      <div 
                        key={nomination.id} 
                        className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(nomination.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{nomination.nominee.fullName}</h3>
                            <p className="text-sm text-gray-500">
                              Position: {nomination.position}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                nomination.status === NominationStatus.DRAFT
                                  ? 'bg-gray-100 text-gray-800'
                                  : nomination.status === NominationStatus.PENDING
                                  ? 'bg-amber-100 text-amber-800'
                                  : nomination.status === NominationStatus.APPROVED
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {nomination.status === NominationStatus.DRAFT
                                  ? 'Draft'
                                  : nomination.status === NominationStatus.PENDING
                                  ? 'Pending Review'
                                  : nomination.status === NominationStatus.APPROVED
                                  ? 'Approved'
                                  : 'Rejected'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/nomination/${nomination.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
