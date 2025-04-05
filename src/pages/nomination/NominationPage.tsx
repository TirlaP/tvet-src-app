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
  { title: "Documents", description: "Student number & uploads" },
  { title: "Position", description: "Select position" },
  { title: "Share", description: "Get supporters" },
];

const STORAGE_KEY = 'nomination_form_data';
const STEP_LOCK_KEY = 'nomination_step_lock';

const NominationFormContent: React.FC = () => {
  const { formState, goToStep } = useFormWizard();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // This effect handles component mount (initialize state) and cleanup
  useEffect(() => {
    // Check if we're coming from a completed submission with a fresh page load
    const stepLock = localStorage.getItem(STEP_LOCK_KEY);
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    // If we have a lock but we're freshly navigating to the page (not from step 3->4)
    // then we should clear it to ensure a fresh start
    if (stepLock === 'step_4_locked' && document.referrer !== window.location.href) {
      localStorage.removeItem(STEP_LOCK_KEY);
      
      // Also remove form data if we completed the submission (has nominationId)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.isComplete && parsedData.nominationId) {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    } else if (formState.step === 4) {
      // Only set the lock if we've naturally progressed to step 4 within the app flow
      localStorage.setItem(STEP_LOCK_KEY, 'step_4_locked');
    }
    
    // Cleanup
    return () => {
      // No cleanup needed here, we handle it in the "Go to Dashboard" action
    };
  }, [formState.step]);
  
  // Handle completed nominations logic
  useEffect(() => {
    const checkCompletedNomination = () => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return;
      
      try {
        const parsedData = JSON.parse(savedData);
        
        // If we have a completed nomination with an ID
        if (parsedData.isComplete && parsedData.nominationId) {
          const stepLock = localStorage.getItem(STEP_LOCK_KEY);
          
          // If there's a step lock, it means we're in the middle of the flow
          // or just completed it - stay on step 4
          if (stepLock === 'step_4_locked') {
            goToStep(4);
          } else {
            // Otherwise, we've navigated away and come back - start fresh
            localStorage.removeItem(STORAGE_KEY);
            goToStep(1);
          }
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    };
    
    checkCompletedNomination();
  }, [goToStep]);
  
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
      <div className="mb-6 relative z-[5]">
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
  // This check ensures we don't load a completed form when the page is first loaded
  // It acts as a safeguard in case the form context doesn't reset properly
  React.useEffect(() => {
    const checkAndClearCompletedForm = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.isComplete === true && parsedData.nominationId) {
            // Clear both keys if coming from outside (not from within the form flow)
            const isDirectNavigation = !document.referrer.includes('/nominate');
            if (isDirectNavigation) {
              console.log('NominationPage: Clearing completed form on direct navigation');
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem('nomination_step_lock');
            }
          }
        }
      } catch (error) {
        console.error('Error checking form completion status:', error);
      }
    };
    
    checkAndClearCompletedForm();
  }, []);
  
  return (
    <FormWizardProvider>
      <NominationFormWrapper />
    </FormWizardProvider>
  );
};

// This wrapper component exists within the FormWizardProvider context
const NominationFormWrapper: React.FC = () => {
  const { formState, saveProgress } = useFormWizard();
  
  return (
    <NominationLayout
      title="SRC Nomination Form"
      subtitle={`Step ${formState.step} of ${steps.length}`}
      showSaveButton={formState.step < 4}
      onSave={saveProgress}
    >
      <NominationFormContent />
    </NominationLayout>
  );
};

export default NominationPage;