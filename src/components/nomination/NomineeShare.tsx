import React, { useState, useEffect, useRef } from 'react';
import { useFormWizard } from '../../contexts/FormWizardContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { nominationProcessService } from '../../lib/services';
import { useToast } from '../../hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clipboard, ChevronRight, Share2, CheckIcon, InfoIcon } from 'lucide-react';

const NomineeShare: React.FC = () => {
  const { formState, prevStep, setIsSubmitting, setIsComplete } = useFormWizard();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [nominationId, setNominationId] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if nomination has been created
  const hasCreatedNomination = useRef(false);

  // Create the nomination when component loads
  useEffect(() => {
    const createNomination = async () => {
      // Prevent multiple submissions with ref check
      if (hasCreatedNomination.current || !formState.data || formState.isComplete || nominationId) {
        return;
      }
      
      try {
        // Set the ref to true to prevent multiple submissions
        hasCreatedNomination.current = true;
        
        setIsLoading(true);
        setError(null);
        setIsSubmitting(true);
        
        // Extract the nominee data from the form state
        const nomineeData = {
          fullName: formState.data.fullName || '',
          studentNumber: formState.data.studentNumber || '',
          email: formState.data.email || '',
          cellNumber: formState.data.cellNumber || '',
          course: formState.data.course || '',
          yearOfStudy: formState.data.yearOfStudy || '',
          dataConsent: formState.data.dataConsent || false,
          studentCardImage: formState.data.studentCardImage || '',
          selfieImage: formState.data.selfieImage || '',
          signature: formState.data.signature || '',
        };
        
        // Extract the nomination data
        const nominationData = {
          position: formState.data.position || '',
          motivation: formState.data.motivation || '',
        };
        
        // Create the nomination
        const result = await nominationProcessService.createNomination(
          nomineeData,
          nominationData
        );
        
        // Get the nomination details to get the share link
        const nominationDetails = await nominationProcessService.getNominationDetails(
          result.nominationId
        );
        
        if (nominationDetails) {
          setNominationId(result.nominationId);
          setShareLink(nominationDetails.shareLink || null);
          
          // Generate QR code
          if (nominationDetails.qrCode) {
            // For simplicity, we'll create a data URL for a QR code
            // In a real implementation, you would use a QR code library
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/support/${nominationDetails.qrCode}`;
            setQrCode(qrCodeUrl);
          }
          
          setIsComplete(true);
          
          toast({
            title: "Nomination Created",
            description: "Your nomination has been created successfully",
          });
        }
      } catch (error) {
        console.error('Error creating nomination:', error);
        setError('Failed to create your nomination. Please try again.');
        
        toast({
          title: "Nomination Failed",
          description: "There was an error creating your nomination",
          variant: "destructive",
        });
        
        // If there was an error, allow them to try again
        hasCreatedNomination.current = false;
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    };
    
    createNomination();
    
    // Only include the necessary dependencies
    // Don't include formState.data which changes on every render
  }, [setIsSubmitting, setIsComplete, toast]);

  const copyLinkToClipboard = () => {
    if (!shareLink) return;
    
    const shareUrl = `${window.location.origin}/support/${shareLink}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Support link copied to clipboard",
        });
      })
      .catch((err) => {
        console.error('Error copying to clipboard:', err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        });
      });
  };

  const shareLinkToClipboard = () => {
    if (!shareLink) return;
    
    const shareUrl = `${window.location.origin}/support/${shareLink}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Support my SRC Nomination',
        text: 'Please support my nomination for SRC elections',
        url: shareUrl,
      })
        .catch((err) => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback to copying to clipboard
      copyLinkToClipboard();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Share Your Nomination</CardTitle>
          <CardDescription>
            Ask other students to support your nomination by sharing this link or QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-center text-sm text-gray-500">
                Creating your nomination...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  You need support from 3 students to complete your nomination
                </AlertDescription>
              </Alert>
              
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="border p-2 rounded-md bg-white">
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="h-48 w-48"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    Scan this QR code to support the nomination
                  </p>
                </div>
              )}
              
              {shareLink && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/support/${shareLink}`}
                      readOnly
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyLinkToClipboard}
                      className="flex gap-1 items-center"
                    >
                      <Clipboard className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      type="button"
                      onClick={shareLinkToClipboard}
                      className="flex gap-1 items-center"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4 bg-primary/5">
                <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Nomination Submitted
                </h3>
                <p className="text-sm text-gray-600">
                  Your nomination has been created. Share the link or QR code with your supporters to complete the nomination process.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={prevStep}
          disabled={isLoading}
        >
          Back
        </Button>
        <Link to="/">
          <Button>
            Go to Dashboard
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NomineeShare;
