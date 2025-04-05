import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import OtpViewer from './components/debug/OtpViewer';
import { useEffect, useState } from 'react';
import { db } from './db/db';
import firebaseService from './firebase/firebaseService';
import { Alert, AlertDescription } from './components/ui/alert';
import { Toaster } from './components/ui/toaster';
import { WifiOff } from 'lucide-react';

function App() {
  const isDevOrTesting = import.meta.env.DEV || window.location.hostname.includes('localhost');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData(); // Attempt to sync when we come back online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial sync check
    if (navigator.onLine) {
      syncData();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Sync data from IndexedDB to Firebase when online
  const syncData = async () => {
    if (!navigator.onLine) return;
    
    try {
      setIsSyncing(true);
      
      // Sync students - handle errors individually for each student
      const students = await db.students.toArray();
      for (const student of students) {
        if (student.id) {
          try {
            await firebaseService.student.add(student);
          } catch (error) {
            console.warn(`Skipping sync for student ${student.id}: ${error.message}`);
            // Continue with other students even if one fails
          }
        }
      }
      
      // Sync nominations - handle errors individually for each nomination
      const nominations = await db.nominations.toArray();
      for (const nomination of nominations) {
        if (nomination.id) {
          try {
            await firebaseService.nomination.add(nomination);
          } catch (error) {
            console.warn(`Skipping sync for nomination ${nomination.id}: ${error.message}`);
            // Continue with other nominations even if one fails
          }
        }
      }
      
      console.log('Data sync complete');
    } catch (error) {
      console.error('Error in sync process:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <AuthProvider>
      <Router>
        {!isOnline && (
          <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're offline. The app will continue to work, and data will sync when you're back online.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {isSyncing && (
          <div className="fixed bottom-4 left-4 z-50 max-w-md">
            <Alert>
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              <AlertDescription>
                Syncing data...
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <AppRoutes />
        {isDevOrTesting && <OtpViewer />}
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;