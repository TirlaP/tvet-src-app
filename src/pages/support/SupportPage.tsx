import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SupportLayout from '../../components/layout/support/SupportLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { FileUpload } from '../../components/ui/file-upload';
import { SignaturePad } from '../../components/ui/signature-pad';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { 
  nominationService, 
  studentService, 
  nominationProcessService,
  supporterService
} from '../../lib/services';
import { supporterSchema } from '../../lib/validations';
import { z } from 'zod';
import { SupporterType, NominationStatus } from '../../types/database';
import { CheckIcon, InfoIcon, XIcon, UserIcon } from 'lucide-react';

type SupporterData = z.infer<typeof supporterSchema>;

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { shareId } = useParams<{ shareId: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomination, setNomination] = useState<any | null>(null);
  const [nominee, setNominee] = useState<any | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [studentCardImage, setStudentCardImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  
  // Pre-fill form with current user data if available, but ALWAYS set dataConsent to false
  const defaultValues: Partial<SupporterData> = {
    fullName: currentUser?.fullName || '',
    studentNumber: currentUser?.studentNumber || '',
    email: currentUser?.email || '',
    cellNumber: currentUser?.cellNumber || '',
    course: currentUser?.course || '',
    yearOfStudy: currentUser?.yearOfStudy || '',
    dataConsent: false, // Always default to unchecked
  };

  const form = useForm<SupporterData>({
    resolver: zodResolver(supporterSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form with user data when it changes, but always keep dataConsent unchecked
  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.fullName || '',
        studentNumber: currentUser.studentNumber || '',
        email: currentUser.email || '',
        cellNumber: currentUser.cellNumber || '',
        course: currentUser.course || '',
        yearOfStudy: currentUser.yearOfStudy || '',
        dataConsent: false, // Always reset to unchecked
      });
    }
  }, [currentUser, form]);

  // Fetch nomination details
  useEffect(() => {
    const fetchNomination = async () => {
      if (!shareId) {
        setError('Invalid nomination link');
        setIsLoading(false);
        return;
      }
      
      console.log(`Attempting to fetch nomination with shareId: ${shareId}`);
      
      try {
        // Get the nomination by share link
        const nomination = await nominationService.getByShareLink(shareId);
        
        console.log('getByShareLink result:', nomination);
        
        if (!nomination) {
          console.log('Nomination not found for shareId:', shareId);
          setError('Nomination not found');
          setIsLoading(false);
          return;
        }
        
        setNomination(nomination);
        console.log('Nomination found:', nomination);
        
        // Get the nominee details
        const nominationDetails = await nominationProcessService.getNominationDetails(nomination.id!);
        
        if (!nominationDetails) {
          setError('Nomination details not found');
          setIsLoading(false);
          return;
        }
        
        setNominee(nominationDetails.nominee);
        console.log('Nominee details:', nominationDetails.nominee);
        
        // Get supporter count
        const supporters = await supporterService.getByNominationId(nomination.id!);
        setSupportCount(supporters.length);
        console.log('Supporter count:', supporters.length);
        
        // Check if current user has already supported this nomination
        if (currentUser) {
          const hasSupported = await supporterService.hasStudentSupported(
            nomination.id!,
            currentUser.id!
          );
          
          setIsSupported(hasSupported);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching nomination:', error);
        setError('Failed to load nomination details');
        setIsLoading(false);
      }
    };
    
    fetchNomination();
  }, [shareId, currentUser]);

  const onSubmit = async (data: SupporterData) => {
    if (!nomination) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add signature and student card image to the data
      const supporterData = {
        ...data,
        signature,
        studentCardImage,
      };
      
      // Determine supporter type based on current count
      const supporterType = supportCount === 0 
        ? SupporterType.PROPOSER 
        : SupporterType.SECONDER;
      
      // Add the supporter
      await nominationProcessService.addSupporter(
        nomination.id!,
        supporterData,
        supporterType
      );
      
      // Update the supporter count
      setSupportCount(prev => prev + 1);
      setIsSupported(true);
      
      toast({
        title: "Support Submitted",
        description: "Thank you for supporting this nomination",
      });
      
      // Refresh the page to update the nomination status
      setTimeout(() => {
        navigate(0); // Refresh the current page
      }, 2000);
      
    } catch (error: any) {
      console.error('Error supporting nomination:', error);
      setError(error.message || 'Failed to submit your support');
      
      toast({
        title: "Support Failed",
        description: error.message || "There was an error submitting your support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle login redirection
  const handleLogin = () => {
    navigate('/login', { state: { from: `/support/${shareId}` } });
  };

  return (
    <SupportLayout
      title="Support SRC Nomination"
      subtitle={nominee ? `Supporting ${nominee.fullName} for ${nomination?.position}` : undefined}
    >
      <div className="container max-w-3xl mx-auto">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-center text-sm text-gray-500">
              Loading nomination details...
            </p>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <XIcon className="h-5 w-5 mr-2" />
                Error Loading Nomination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support SRC Nomination</CardTitle>
                <CardDescription>
                  You are supporting the nomination of {nominee?.fullName} for the position of {nomination.position}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <UserIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{nominee?.fullName}</h3>
                        <p className="text-sm text-gray-600">Nomination for: {nomination.position}</p>
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-medium">Supporters:</span> {supportCount}/3
                          </p>
                          <div className="mt-1 flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <div 
                                key={i}
                                className={`h-2 w-8 rounded-full ${
                                  i < supportCount ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nomination Status */}
                  {isSupported ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        You have already supported this nomination. Thank you!
                      </AlertDescription>
                    </Alert>
                  ) : nomination.status !== NominationStatus.DRAFT ? (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        This nomination has already received all required supporters. It is currently {nomination.status.toLowerCase()}.
                      </AlertDescription>
                    </Alert>
                  ) : supportCount >= 3 ? (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        This nomination has already received all required supporters.
                      </AlertDescription>
                    </Alert>
                  ) : !currentUser ? (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="flex justify-between items-center">
                        <span>You need to login to support this nomination</span>
                        <Button size="sm" onClick={handleLogin}>Login</Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="studentNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Student Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your student number" 
                                    {...field} 
                                    disabled={!!currentUser?.studentNumber}
                                    defaultValue={currentUser?.studentNumber || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="Enter your email" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cellNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cell Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your cell number" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Format: 0XXXXXXXXX
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="course"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Course</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your course name" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="yearOfStudy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year of Study</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your year of study" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <FormLabel>Student Card Upload</FormLabel>
                              <FileUpload
                                onFileChange={setStudentCardImage}
                                accept="image/*"
                                maxSize={3}
                                description="Upload a clear image of your student card"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <FormLabel>Signature</FormLabel>
                              <FormDescription>
                                Sign using your mouse or finger in the box below
                              </FormDescription>
                              <SignaturePad
                                onSignatureCapture={setSignature}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="dataConsent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-4 bg-gray-50">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Data Consent</FormLabel>
                                  <FormDescription>
                                    I consent to the collection and processing of my personal information for the purpose of SRC elections in accordance with POPIA regulations.
                                  </FormDescription>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                          {isSubmitting ? "Submitting..." : "Submit Support"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </SupportLayout>
  );
};

export default SupportPage;