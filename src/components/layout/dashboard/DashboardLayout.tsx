import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Toaster } from '../../ui/toaster';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get page title based on location
  const getPageTitle = () => {
    if (isAdmin) {
      if (location.pathname.includes('nominations')) {
        return 'Manage Nominations';
      } else if (location.pathname.includes('reports')) {
        return 'Reports & Analytics';
      } else {
        return 'Admin Dashboard';
      }
    } else {
      if (location.pathname.includes('nominations')) {
        return 'My Nominations';
      } else if (location.pathname.includes('profile')) {
        return 'My Profile';
      } else {
        return 'Student Dashboard';
      }
    }
  };

  // Animation variants
  const contentVariants = {
    open: { marginLeft: isMobile ? '0' : '250px', transition: { duration: 0.3 } },
    closed: { marginLeft: isMobile ? '0' : '80px', transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <div className="fixed inset-y-0 left-0 z-40">
          <DashboardSidebar 
            isOpen={sidebarOpen} 
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <motion.main 
        className="flex-1 flex flex-col"
        variants={contentVariants}
        animate={sidebarOpen && !isMobile ? 'open' : 'closed'}
        initial={false}
      >
        {/* Mobile Header */}
        <header className={`lg:hidden sticky top-0 z-20 bg-white border-b py-3 px-4`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-lg">
                {isAdmin ? 'Admin Panel' : 'SRC Dashboard'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {isAdmin ? 'A' : currentUser?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b py-4 px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <h1 className="text-xl font-bold">
                {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 text-right">
                <div className="font-medium">
                  {isAdmin ? 'Administrator' : currentUser?.fullName}
                </div>
                <div className="text-xs">
                  {isAdmin ? 'Admin Account' : currentUser?.studentNumber}
                </div>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {isAdmin ? 'A' : currentUser?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </div>
      </motion.main>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
