import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Toaster } from '../../ui/toaster';
import { ArrowLeft, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';

interface SupportLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  shareLink?: string;
  onBack?: () => void;
}

const SupportLayout: React.FC<SupportLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  shareLink,
  onBack 
}) => {
  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(`${window.location.origin}/support/${shareLink}`);
      alert('Support link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {onBack ? (
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <Link to="/">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
            </div>
            
            {shareLink && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share this nomination</DialogTitle>
                    <DialogDescription>
                      Share the link below to get supporters for your nomination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between gap-2 border rounded-md p-2">
                      <span className="text-sm truncate">
                        {`${window.location.origin}/support/${shareLink}`}
                      </span>
                      <Button size="sm" onClick={handleCopyLink}>
                        Copy
                      </Button>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-2">You need 3 supporters to complete your nomination</p>
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2" onClick={handleCopyLink}>
                          <Share className="h-4 w-4" />
                          Copy Link
                        </Button>
                        {/* Future: Add social sharing buttons */}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

export default SupportLayout;
