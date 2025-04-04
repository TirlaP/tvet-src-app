import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Toaster } from '../../ui/toaster';
import { ArrowLeft, Save } from 'lucide-react';

interface NominationLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSaveButton?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  onBack?: () => void;
}

const NominationLayout: React.FC<NominationLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showSaveButton = false,
  onSave,
  isSaving = false,
  onBack 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
            </div>
            
            {showSaveButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Progress"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <footer className="py-4 border-t">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TVET SRC Elections. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default NominationLayout;
