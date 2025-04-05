import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { nominationService } from '../../lib/services';
import { formatPositionName } from '../../lib/utils';
import { NominationStatus } from '../../types/database';
import { PenLine, Clock, CheckCircle, XCircle, User, CalendarDays, Award, Share, Eye, Info } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';

const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [myNominations, setMyNominations] = useState<any[]>([]);
  const [supportedNominations, setSupportedNominations] = useState<any[]>([]);
  const [selectedNomination, setSelectedNomination] = useState<any | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
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
  
  // Handle share link copying
  const handleCopyLink = () => {
    if (!selectedNomination?.shareLink) return;
    
    const shareLink = `${window.location.origin}/support/${selectedNomination.shareLink}`;
    navigator.clipboard.writeText(shareLink);
    alert('Support link copied to clipboard!');
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
                            <h3 className="font-medium">{formatPositionName(nomination.position)}</h3>
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
                              onClick={() => {
                                setSelectedNomination(nomination);
                                setShowShareDialog(true);
                              }}
                            >
                              Share
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedNomination(nomination);
                              setShowDetailsDialog(true);
                            }}
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
                              Position: {formatPositionName(nomination.position)}
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
                          onClick={() => {
                            setSelectedNomination(nomination);
                            setShowDetailsDialog(true);
                          }}
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Nomination</DialogTitle>
            <DialogDescription>
              Share this link to get supporters for your nomination
            </DialogDescription>
          </DialogHeader>
          
          {selectedNomination && (
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium mb-1">Position: {formatPositionName(selectedNomination.position)}</div>
                <div className="text-sm text-gray-500">Supporters: {selectedNomination.supporters.length}/3</div>
              </div>
              
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need 3 supporters to complete your nomination
                </AlertDescription>
              </Alert>
              
              {/* QR Code */}
              {selectedNomination.shareLink && (
                <div className="flex flex-col items-center my-4">
                  <div className="border p-2 rounded-md bg-white">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/support/${selectedNomination.shareLink}`)}`} 
                      alt="QR Code" 
                      className="h-48 w-48"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500 mt-2">
                    Scan this QR code to support the nomination
                  </p>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between gap-2 border rounded-md p-2">
                  <span className="text-sm truncate">
                    {`${window.location.origin}/support/${selectedNomination.shareLink}`}
                  </span>
                  <Button size="sm" onClick={handleCopyLink}>
                    Copy
                  </Button>
                </div>
                
                <Button className="w-full gap-2" onClick={handleCopyLink}>
                  <Share className="h-4 w-4" />
                  Copy Support Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nomination Details</DialogTitle>
            <DialogDescription>
              {selectedNomination ? (
                `Details for ${formatPositionName(selectedNomination.position)} position`
              ) : 'Nomination details'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNomination && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Nominee Information</h3>
                  <div className="border rounded-md p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Full Name</div>
                      <div className="font-medium">{selectedNomination.nominee.fullName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Student Number</div>
                      <div>{selectedNomination.nominee.studentNumber}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div>{selectedNomination.nominee.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Course</div>
                      <div>{selectedNomination.nominee.course}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Year of Study</div>
                      <div>{selectedNomination.nominee.yearOfStudy}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Nomination Details</h3>
                  <div className="border rounded-md p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Position</div>
                      <div className="font-medium">{formatPositionName(selectedNomination.position)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedNomination.status)}
                        <span>
                          {selectedNomination.status === NominationStatus.DRAFT
                            ? 'Draft'
                            : selectedNomination.status === NominationStatus.PENDING
                            ? 'Pending Review'
                            : selectedNomination.status === NominationStatus.APPROVED
                            ? 'Approved'
                            : 'Rejected'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Supporters</div>
                      <div>{selectedNomination.supporters.length}/3</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created Date</div>
                      <div>{formatDate(selectedNomination.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Last Updated</div>
                      <div>{formatDate(selectedNomination.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Motivation</h3>
                <div className="border rounded-md p-4">
                  <p className="whitespace-pre-wrap">{selectedNomination.motivation}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Supporters ({selectedNomination.supporters.length}/3)
                </h3>
                <div className="border rounded-md p-4">
                  {selectedNomination.supporters.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">No supporters yet</p>
                  ) : (
                    <div className="divide-y">
                      {selectedNomination.supporters.map((supporterInfo: any, index: number) => (
                        <div key={index} className="py-3 first:pt-1 last:pb-1">
                          <div className="font-medium">
                            {supporterInfo.supporter.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center justify-between">
                            <span>{supporterInfo.supporter.studentNumber}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                              {supporterInfo.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedNomination.status === NominationStatus.DRAFT && (
                <div className="flex justify-center">
                  <Button 
                    className="gap-2"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setSelectedNomination(selectedNomination);
                      setShowShareDialog(true);
                    }}
                  >
                    <Share className="h-4 w-4" />
                    Share for Support
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
