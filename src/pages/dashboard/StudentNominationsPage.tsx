import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { nominationService } from '../../lib/services';
import { formatPositionName } from '../../lib/utils';
import { NominationStatus } from '../../types/database';
import { 
  FileText, 
  Share, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PenLine,
  Info,
  UserCheck
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';

const StudentNominationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [myNominations, setMyNominations] = useState<any[]>([]);
  const [supportedNominations, setSupportedNominations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNomination, setSelectedNomination] = useState<any | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Load nominations
  useEffect(() => {
    const fetchNominations = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
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
        console.error('Error fetching nominations:', error);
        setIsLoading(false);
      }
    };
    
    fetchNominations();
  }, [currentUser, navigate]);

  // Handle share link copying
  const handleCopyLink = () => {
    if (!selectedNomination?.shareLink) return;
    
    const shareLink = `${window.location.origin}/support/${selectedNomination.shareLink}`;
    navigator.clipboard.writeText(shareLink);
    alert('Support link copied to clipboard!');
  };

  // Get status badge
  const getStatusBadge = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.APPROVED:
        return (
          <div className="flex items-center text-green-600 gap-1 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Approved</span>
          </div>
        );
      case NominationStatus.REJECTED:
        return (
          <div className="flex items-center text-red-600 gap-1 text-sm">
            <XCircle className="h-4 w-4" />
            <span>Rejected</span>
          </div>
        );
      case NominationStatus.PENDING:
        return (
          <div className="flex items-center text-amber-600 gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>Pending Review</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 gap-1 text-sm">
            <PenLine className="h-4 w-4" />
            <span>Draft</span>
          </div>
        );
    }
  };

  // Format date
  const formatDate = (date: string | Date) => {
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
      <div className="space-y-8">
        {/* My Nominations Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Nominations</h2>
            <Button onClick={() => navigate('/nominate')}>
              Create New Nomination
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myNominations.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium mb-2">No Nominations Found</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't created any nominations yet
                  </p>
                  <Button onClick={() => navigate('/nominate')}>
                    Create Nomination
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myNominations.map((nomination) => (
                <Card key={nomination.id}>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          {formatPositionName(nomination.position)}
                        </h3>
                        <div className="text-sm text-gray-500 mb-2">
                          Submitted on {formatDate(nomination.createdAt)}
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(nomination.status)}
                          <div className="flex items-center text-gray-600 gap-1 text-sm">
                            <UserCheck className="h-4 w-4" />
                            <span>{nomination.supporters.length}/3 Supporters</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {nomination.status === NominationStatus.DRAFT && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setSelectedNomination(nomination);
                              setShowShareDialog(true);
                            }}
                          >
                            <Share className="h-4 w-4" />
                            Share
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSelectedNomination(nomination);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Nominations I Support Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Nominations I Support</h2>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : supportedNominations.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    You haven't supported any nominations yet
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {supportedNominations.map((nomination) => (
                <Card key={nomination.id}>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          {nomination.nominee.fullName}
                        </h3>
                        <div className="text-sm text-gray-500 mb-2">
                          Position: {formatPositionName(nomination.position)}
                        </div>
                        {getStatusBadge(nomination.status)}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelectedNomination(nomination);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
        <DialogContent className="sm:max-w-3xl">
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
                      <div>{getStatusBadge(selectedNomination.status)}</div>
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

export default StudentNominationsPage;
