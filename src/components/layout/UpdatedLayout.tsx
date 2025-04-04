import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, ChevronDown, Home, FileText, PenTool, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Card } from '../ui/card';
import { Toaster } from '../ui/toaster';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const UpdatedLayout: React.FC<LayoutProps> = ({ children }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Link to="/" className="text-primary font-bold text-xl flex items-center">
                TVET SRC Elections
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === '/' 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  Home
                </span>
              </Link>
              
              {!isAdmin && (
                <>
                  <Link
                    to="/nominate"
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname.includes('/nominate') 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <PenTool className="h-4 w-4" />
                      Nominate
                    </span>
                  </Link>
                  
                  <Link
                    to="/support"
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname.includes('/support') 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Support
                    </span>
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/admin')
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Admin Panel
                  </span>
                </Link>
              )}
            </nav>

            {/* User Profile Button */}
            <div className="hidden md:block relative">
              {currentUser || isAdmin ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={toggleUserMenu}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {isAdmin ? 'A' : currentUser?.fullName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-32 truncate text-sm">
                      {isAdmin
                        ? 'Admin'
                        : currentUser?.fullName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {userMenuOpen && (
                    <Card className="absolute right-0 mt-2 w-56 z-50 py-1 shadow-lg">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium">{isAdmin ? 'Admin Account' : currentUser?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Administrator' : currentUser?.email}</p>
                      </div>
                      
                      {!isAdmin && (
                        <Link
                          to="/dashboard"
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="border-b pb-4 pt-2">
                      {(currentUser || isAdmin) ? (
                        <div className="flex items-center gap-4 p-2">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {isAdmin ? 'A' : currentUser?.fullName.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{isAdmin ? 'Admin Account' : currentUser?.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {isAdmin ? 'Administrator' : currentUser?.studentNumber}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-2">
                          <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                              Log in
                            </Button>
                          </Link>
                          <Link to="/register" className="w-full">
                            <Button className="w-full">
                              Register
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <nav className="flex flex-col py-4 gap-1">
                      <Link
                        to="/"
                        className={cn(
                          "px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3",
                          location.pathname === '/' 
                            ? "bg-primary/10 text-primary" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Home className="h-5 w-5" />
                        Home
                      </Link>
                      
                      {!isAdmin && (
                        <>
                          <Link
                            to="/nominate"
                            className={cn(
                              "px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3",
                              location.pathname.includes('/nominate') 
                                ? "bg-primary/10 text-primary" 
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <PenTool className="h-5 w-5" />
                            Nominate
                          </Link>
                          
                          <Link
                            to="/support"
                            className={cn(
                              "px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3",
                              location.pathname.includes('/support') 
                                ? "bg-primary/10 text-primary" 
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <Users className="h-5 w-5" />
                            Support
                          </Link>
                          
                          {currentUser && (
                            <Link
                              to="/dashboard"
                              className={cn(
                                "px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3",
                                location.pathname.includes('/dashboard') 
                                  ? "bg-primary/10 text-primary" 
                                  : "text-gray-700 hover:bg-gray-100"
                              )}
                            >
                              <FileText className="h-5 w-5" />
                              Dashboard
                            </Link>
                          )}
                        </>
                      )}
                      
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className={cn(
                            "px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3",
                            location.pathname.includes('/admin')
                              ? "bg-primary/10 text-primary" 
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <FileText className="h-5 w-5" />
                          Admin Panel
                        </Link>
                      )}
                    </nav>
                    
                    {(currentUser || isAdmin) && (
                      <div className="mt-auto border-t pt-4">
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} TVET SRC Elections. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Terms of Use
              </Link>
              <Link to="/help" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default UpdatedLayout;
