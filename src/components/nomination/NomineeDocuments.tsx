import React, { useState } from 'react';
import { useFormWizard } from '../../contexts/FormWizardContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileUpload } from '../ui/file-upload';
import { CameraComponent } from '../ui/camera';
import { SignaturePad } from '../ui/signature-pad';
import { Alert, AlertDescription } from '../ui/alert';
import { InfoIcon } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidStudentNumber } from '../../lib/utils';

// Create a schema for the student number validation
const studentNumberSchema = z.object({
  studentNumber: z.string().refine(isValidStudentNumber, {
    message: 'Please enter a valid student number'
  })
});

type StudentNumberData = z.infer<typeof studentNumberSchema>;

const NomineeDocuments: React.FC = () => {
  const { formState, setFormData, prevStep, nextStep } = useFormWizard();
  const { currentUser } = useAuth();
  
  const [studentCardImage, setStudentCardImage] = useState<string>(
    formState.data.studentCardImage || ''
  );
  const [selfieImage, setSelfieImage] = useState<string>(
    formState.data.selfieImage || ''
  );
  const [signature, setSignature] = useState<string>(
    formState.data.signature || ''
  );
  
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StudentNumberData>({
    resolver: zodResolver(studentNumberSchema),
    defaultValues: {
      studentNumber: formState.data.studentNumber || '',
    },
    mode: 'onChange',
  });

  const handleContinue = (studentNumberData: StudentNumberData) => {
    // Validate that all required files are uploaded
    if (!studentCardImage) {
      setError('Please upload your student card image');
      return;
    }
    
    if (!selfieImage) {
      setError('Please take a selfie or upload a photo of yourself');
      return;
    }
    
    if (!signature) {
      setError('Please provide your signature');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Update form data with the documents and student number
    setFormData({
      ...studentNumberData,
      studentCardImage,
      selfieImage,
      signature
    });
    
    // Move to the next step
    nextStep();
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
          <CardTitle className="text-lg">Student Information</CardTitle>
          <CardDescription>
            Enter your student number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form>
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
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your student number as it appears on your student card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Card Upload</CardTitle>
          <CardDescription>
            Upload a clear photo of your student card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileChange={setStudentCardImage}
            initialPreview={studentCardImage}
            accept="image/*"
            maxSize={3}
            description="Upload a clear image of your student card (max 3MB)"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Take a Selfie</CardTitle>
          <CardDescription>
            Take a clear photo of yourself using your camera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Alert className="bg-primary/5 border-primary/10">
              <InfoIcon className="h-4 w-4 text-primary" />
              <AlertDescription>
                Please take a clear photo of your face against a plain background
              </AlertDescription>
            </Alert>
          </div>
          <CameraComponent
            onCapture={setSelfieImage}
            initialImage={selfieImage}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signature</CardTitle>
          <CardDescription>
            Provide your signature using the pad below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignaturePad
            onSignatureCapture={setSignature}
            initialSignature={signature}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={prevStep}
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={form.handleSubmit(handleContinue)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default NomineeDocuments;