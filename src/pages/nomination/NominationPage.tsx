import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NominationLayout from '../../components/layout/nomination/NominationLayout';
import { useAuth } from '../../contexts/AuthContext';
import { FormWizardProvider, useFormWizard } from '../../contexts/FormWizardContext';
import { Stepper } from '../../components/ui/stepper';
import NomineePersonalInfo from '../../components/nomination/NomineePersonalInfo';
import NomineeDocuments from '../../components/nomination/NomineeDocuments';
import NomineePosition from '../../components/nomination/NomineePosition';
import NomineeShare from '../../components/nomination/NomineeShare';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Card, CardContent } from '../../components/ui/card';
import { InfoIcon } from 'lucide-react';

// The steps for the nomination process
const steps = [
  { title: "Personal Info", description: "Basic details" },
  { title: "Documents", description: "Upload documents" },
  { title: "Position", description: "Select position" },
  { title: "Share", description: "Get supporters" },
];

const NominationFormContent: React.FC = () => {
  const { formState, goToStep } = useFormWizard();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/nominate' } });
    }
  }, [currentUser, navigate]);
  
  // If not logged in, don't render the form
  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            All fields are required. You can save and continue later - your progress will be saved automatically.
          </AlertDescription>
        </Alert>
        
        <Stepper 
          steps={steps} 
          currentStep={formState.step}
          onStepClick={goToStep}
          allowClickable={true}
          className="mt-8"
        />
      </div>
      
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            {formState.step === 1 && <NomineePersonalInfo />}
            {formState.step === 2 && <NomineeDocuments />}
            {formState.step === 3 && <NomineePosition />}
            {formState.step === 4 && <NomineeShare />}
            
            {formState.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{formState.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const NominationPage: React.FC = () => {
  return (
    <FormWizardProvider>
      <NominationFormWrapper />
    </FormWizardProvider>
  );
};

// This wrapper component exists within the FormWizardProvider context
const NominationFormWrapper: React.FC = () => {
  const { formState } = useFormWizard();
  
  return (
    <NominationLayout
      title="SRC Nomination Form"
      subtitle={`Step ${formState.step} of ${steps.length}`}
      showSaveButton={formState.step < 4}
      onSave={() => {/* Handle save logic */}}
    >
      <NominationFormContent />
    </NominationLayout>
  );
};

export default NominationPage;
