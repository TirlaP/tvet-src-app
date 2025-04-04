import React, { useState } from 'react';
import { useFormWizard } from '../../contexts/FormWizardContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileUpload } from '../ui/file-upload';
import { CameraComponent } from '../ui/camera';
import { SignaturePad } from '../ui/signature-pad';
import { Alert, AlertDescription } from '../ui/alert';
import { InfoIcon } from 'lucide-react';

const NomineeDocuments: React.FC = () => {
  const { formState, setFormData, prevStep, nextStep } = useFormWizard();
  
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

  const handleContinue = () => {
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
    
    // Update form data with the documents
    setFormData({
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
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default NomineeDocuments;
