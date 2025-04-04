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

  // Load form data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormState(prevState => ({
          ...prevState,
          data: parsedData
        }));
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState.data));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [formState.data]);

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
  };

  const prevStep = () => {
    if (formState.step > 1) {
      setFormState(prevState => ({
        ...prevState,
        step: prevState.step - 1
      }));
      // Scroll to top after step change
      window.scrollTo(0, 0);
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
    setIsComplete
  };

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
};
