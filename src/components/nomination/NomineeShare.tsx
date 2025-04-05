import React, { useState, useEffect, useRef } from 'react';
import { useFormWizard } from '../../contexts/FormWizardContext';

// Define the same storage key that's used in FormWizardContext
const STORAGE_KEY = 'nomination_form_data';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { nominationProcessService } from '../../lib/services';
import { useToast } from '../../hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clipboard, ChevronRight, Share2, CheckIcon, InfoIcon } from 'lucide-react';
import console from 'console';
import db from '../../db/db';

const NomineeShare: React.FC = () => {
  const { formState, prevStep, setIsSubmitting, setIsComplete, resetForm, setFormData } = useFormWizard();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [nominationId, setNominationId] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if nomination has been created
  const hasCreatedNomination = useRef(false);

  // Fix for handling both existing nominations and creating new ones when needed
  useEffect(() => {
    // Don't set this flag here anymore - we need to allow creation if needed
    // hasCreatedNomination.current = true;
    
    const loadExistingNomination = async () => {
      setIsLoading(true);
      
      try {
        // Check if we have a nomination ID in form state
        if (formState.nominationId) {
          // Removed console.log for Vite compatibility
          
          // Get nomination details from the stored ID
          const nominationDetails = await nominationProcessService.getNominationDetails(
            formState.nominationId
          );
          
          if (nominationDetails) {
            setNominationId(formState.nominationId);
            setShareLink(nominationDetails.shareLink || null);
            
            // Generate QR code - use simpler QR code generation
            const linkValue = nominationDetails.qrCode || nominationDetails.shareLink;
            
            if (linkValue) {
              // Use direct QRServer API for better compatibility
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/support/${linkValue}`)}`;
              setQrCode(qrCodeUrl);
              
              // Force image update by adding timestamp to prevent caching issues
              setTimeout(() => {
                setQrCode(`${qrCodeUrl}&t=${Date.now()}`);
              }, 100);
            } else {
              setError("No link value found for QR code generation");
            }
            
            setIsComplete(true);
            return; // Exit early - we've loaded the existing nomination
          }
        }
        
        // If we reach here, we either:
        // 1. Don't have a nomination ID yet, or
        // 2. Couldn't load the nomination with the ID we had
        
        // In either case, we should create a new nomination if we have form data
        if (Object.keys(formState.data).length > 0 && !hasCreatedNomination.current) {
          // Start creating a new nomination
          await createNewNomination();
        }
      } catch (error) {
        // Don't use console.error - use setError instead
        setError('There was a problem with your nomination. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingNomination();
  }, [formState.nominationId]);
  
  // Function to create a new nomination - only called once in the component's lifecycle
  const createNewNomination = async () => {
    // Removed console.log for Vite compatibility
    
    // Triple-check to make sure we don't create duplicates
    if (hasCreatedNomination.current || !formState.data || formState.nominationId || nominationId) {
      return;
    }
    
    try {
      hasCreatedNomination.current = true; // Prevent multiple creations
      
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
        
        // Generate QR code - use shareLink if qrCode isn't available
        const linkValue = nominationDetails.qrCode || nominationDetails.shareLink;
        
        if (linkValue) {
          // Use direct QRServer API for better compatibility
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/support/${linkValue}`)}`;
          setQrCode(qrCodeUrl);
          
          // Force image update by adding timestamp to prevent caching issues
          setTimeout(() => {
            setQrCode(`${qrCodeUrl}&t=${Date.now()}`);
          }, 100);
        } else {
          setError("No link value found for QR code generation");
        }
        
        // Update UI state
        setIsComplete(true);
        
        // Update form context to include nomination ID
        setFormData({ nominationId: result.nominationId });
        
        // Save nomination ID along with form data to prevent creating again on refresh
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nominationId: result.nominationId,
          isComplete: true, // Mark as complete
          data: formState.data,
          step: 4, // Force step 4
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "Nomination Created",
          description: "Your nomination has been created successfully",
        });
      }
    } catch (error) {
      // Check if this is a constraint error - meaning the nomination already exists
      if (error.name === 'ConstraintError' && error.message.includes('already exists')) {
        try {
          // Try to find the existing nomination by nominee ID
          const existingNominations = await db.nominations.where({ 
            nomineeId: formState.data.nomineeId || 0
          }).toArray();
          
          if (existingNominations.length > 0) {
            const existingNomination = existingNominations[0];
            
            if (existingNomination.id) {
              // Get nomination details for the existing nomination
              const nominationDetails = await nominationProcessService.getNominationDetails(
                existingNomination.id
              );
              
              if (nominationDetails) {
                setNominationId(existingNomination.id);
                setShareLink(nominationDetails.shareLink || null);
                
                // Generate QR code for the existing nomination
                const linkValue = nominationDetails.qrCode || nominationDetails.shareLink;
                if (linkValue) {
                  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(`${window.location.origin}/support/${linkValue}`)}&chs=200x200&choe=UTF-8`;
                  setQrCode(qrCodeUrl);
                }
                
                setIsComplete(true);
                setFormData({ nominationId: existingNomination.id });
                
                toast({
                  title: "Nomination Retrieved",
                  description: "Found your existing nomination",
                });
                
                return; // Exit the function - we've handled the constraint error
              }
            }
          }
        } catch (retrieveError) {
          // Avoid console.error
          setError('Error retrieving existing nomination');
        }
      }
      
      // If we get here, the error wasn't handled above
      setError('Failed to create your nomination. Please try again.');
      
      toast({
        title: "Nomination Failed",
        description: "There was an error creating your nomination",
        variant: "destructive",
      });
      
      // Allow trying again after a constraint error
      hasCreatedNomination.current = false;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

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

  // Reset form and remove step lock when navigating away
  const handleGoToDashboard = () => {
    // Clear both the step lock and the form data
    localStorage.removeItem('nomination_step_lock');
    localStorage.removeItem(STORAGE_KEY);
    // Reset the form state
    resetForm();
  };
  
  // This useEffect is no longer needed as we're handling the lock in NominationPage
  // Removed to avoid duplicate/conflicting logic

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
        <Link to="/dashboard" onClick={handleGoToDashboard}>
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