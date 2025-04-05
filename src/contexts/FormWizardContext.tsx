import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormState } from '../types/database';
import { useToast } from '../hooks/use-toast';

interface FormWizardContextType {
  formState: FormState;
  setFormData: (data: Record<string, any>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  setError: (error: string | undefined) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsComplete: (isComplete: boolean) => void;
  saveProgress: () => void;
}

const FormWizardContext = createContext<FormWizardContextType | undefined>(undefined);

export const useFormWizard = (): FormWizardContextType => {
  const context = useContext(FormWizardContext);
  if (!context) {
    throw new Error('useFormWizard must be used within a FormWizardProvider');
  }
  return context;
};

const STORAGE_KEY = 'nomination_form_data';

export const FormWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    step: 1,
    data: {},
    isSubmitting: false,
    isComplete: false,
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load form data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded saved form data:', parsedData);
        
        console.log('parsedData.isComplete', parsedData.isComplete)
        // If the nomination is already complete with an ID, reset the form instead of loading it
        if (parsedData.isComplete === true) {
          console.log('Detected completed nomination - resetting form');
          // Clear localStorage immediately
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('nomination_step_lock');
          
          // Reset form state to initial values
          setFormState({
            step: 1,
            data: {},
            isSubmitting: false,
            isComplete: false,
            nominationId: undefined
          });
          
          // Show toast notification that we're starting fresh
          toast({
            title: "Starting Fresh",
            description: "Your previous nomination was completed. Starting a new one.",
            duration: 3000,
          });
        } else {
          // Normal load for in-progress nominations
          setFormState(prevState => ({
            ...prevState,
            data: parsedData.data || {},
            step: parsedData.step || 1,
            isComplete: parsedData.isComplete || false,
            nominationId: parsedData.nominationId
          }));
        }
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
  }, [toast]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (Object.keys(formState.data).length > 0) {
      saveProgress();
    }
  }, [formState.data, formState.step]);

  // Keep track of last shown toast time to avoid spam
  const [lastToastTime, setLastToastTime] = useState<Date | null>(null);
  
  const saveProgress = () => {
    try {
      const dataToSave = {
        data: formState.data,
        step: formState.step,
        isComplete: formState.isComplete,
        nominationId: formState.nominationId, // Preserve nomination ID
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      
      // Only show toast when manually saving AND not on the last step
      // Also prevent showing too many toasts in a short time period (3 seconds minimum spacing)
      const now = new Date();
      const shouldShowToast = lastSaved && formState.step < 4 && 
        (!lastToastTime || now.getTime() - lastToastTime.getTime() > 3000);
      
      if (shouldShowToast) {
        toast({
          title: "Progress Saved",
          description: "Your nomination form progress has been saved",
          duration: 3000,
        });
        setLastToastTime(now);
      }
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
      
      toast({
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setFormData = (data: Record<string, any>) => {
    setFormState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        ...data
      },
      error: undefined // Clear error when data is updated
    }));
  };

  const nextStep = () => {
    setFormState(prevState => ({
      ...prevState,
      step: prevState.step + 1,
      error: undefined // Clear error when moving to next step
    }));
    // Scroll to top after step change
    window.scrollTo(0, 0);
    
    // Save the updated data
    setTimeout(() => saveProgress(), 50);
  };

  const prevStep = () => {
    if (formState.step > 1) {
      setFormState(prevState => ({
        ...prevState,
        step: prevState.step - 1
      }));
      // Scroll to top after step change
      window.scrollTo(0, 0);
      
      // Save the updated data
      setTimeout(() => saveProgress(), 50);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1) {
      setFormState(prevState => ({
        ...prevState,
        step
      }));
      // Scroll to top after step change
      window.scrollTo(0, 0);
      
      // Save the updated data
      setTimeout(() => saveProgress(), 50);
    }
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormState({
      step: 1,
      data: {},
      isSubmitting: false,
      isComplete: false
    });
    toast({
      title: "Form Reset",
      description: "All form data has been cleared",
    });
  };

  const setError = (error: string | undefined) => {
    setFormState(prevState => ({
      ...prevState,
      error
    }));
  };

  const setIsSubmitting = (isSubmitting: boolean) => {
    setFormState(prevState => ({
      ...prevState,
      isSubmitting
    }));
  };

  const setIsComplete = (isComplete: boolean) => {
    setFormState(prevState => ({
      ...prevState,
      isComplete
    }));
  };

  const value = {
    formState,
    setFormData,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    setError,
    setIsSubmitting,
    setIsComplete,
    saveProgress
  };

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
};