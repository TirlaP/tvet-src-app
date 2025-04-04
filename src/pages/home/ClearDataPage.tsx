import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { db } from '../../db/db';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ClearDataPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const clearAllData = async () => {
    try {
      setIsClearing(true);
      
      // Close the confirmation dialog
      setIsConfirmOpen(false);
      
      // Delete all data from each table
      await db.students.clear();
      await db.nominations.clear();
      await db.supporters.clear();
      await db.adminAudit.clear();
      
      // Clear localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAdmin');
      
      // Show success message
      toast({
        title: "Data Cleared",
        description: "All application data has been removed successfully",
      });
      
      setIsCleared(true);
    } catch (error) {
      console.error('Error clearing data:', error);
      
      toast({
        title: "Error",
        description: "Failed to clear application data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-10">
        <Card className={isCleared ? "border-green-500" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              {isCleared ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Data Cleared Successfully
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  Clear Application Data
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isCleared 
                ? "All application data has been removed from your browser"
                : "This will delete all application data stored in your browser"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCleared ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                <p className="text-green-800">
                  All data has been cleared from your browser. You can now start using the application with a fresh state.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                  <p className="font-medium text-red-800 mb-2">Warning: This action cannot be undone</p>
                  <p className="text-red-700">
                    Clearing the data will remove all nominations, user information, and application settings stored in your browser.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">The following data will be deleted:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>All user accounts and profiles</li>
                    <li>All nominations and their details</li>
                    <li>All supporter information</li>
                    <li>All administrative audit logs</li>
                    <li>Your login session</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            {isCleared ? (
              <div className="flex gap-4">
                <Link to="/">
                  <Button>
                    Go to Home
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isClearing}
                  className="flex items-center gap-1"
                >
                  {isClearing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all application data stored in your browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ClearDataPage;
