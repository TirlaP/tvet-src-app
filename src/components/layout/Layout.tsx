import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Toaster } from '../ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Link to="/" className="text-white font-bold text-xl flex items-center">
                TVET SRC Elections
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`text-white hover:text-blue-100 transition duration-150 ${
                  location.pathname === '/' ? 'font-bold' : ''
                }`}
              >
                Home
              </Link>
              {!isAdmin && (
                <>
                  <Link
                    to="/nominate"
                    className={`text-white hover:text-blue-100 transition duration-150 ${
                      location.pathname.includes('/nominate') ? 'font-bold' : ''
                    }`}
                  >
                    Nominate
                  </Link>
                  <Link
                    to="/support"
                    className={`text-white hover:text-blue-100 transition duration-150 ${
                      location.pathname.includes('/support') ? 'font-bold' : ''
                    }`}
                  >
                    Support
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`text-white hover:text-blue-100 transition duration-150 ${
                      location.pathname.includes('/admin/dashboard') ? 'font-bold' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/nominations"
                    className={`text-white hover:text-blue-100 transition duration-150 ${
                      location.pathname.includes('/admin/nominations') ? 'font-bold' : ''
                    }`}
                  >
                    Nominations
                  </Link>
                  <Link
                    to="/admin/reports"
                    className={`text-white hover:text-blue-100 transition duration-150 ${
                      location.pathname.includes('/admin/reports') ? 'font-bold' : ''
                    }`}
                  >
                    Reports
                  </Link>
                </>
              )}
            </nav>

            {/* User Profile Button */}
            <div className="hidden md:block relative">
              {currentUser || isAdmin ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center text-white"
                    onClick={toggleUserMenu}
                  >
                    <UserCircle className="h-5 w-5 mr-1" />
                    <span className="max-w-32 truncate">
                      {isAdmin
                        ? 'Admin'
                        : currentUser?.fullName}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                  
                  {userMenuOpen && (
                    <Card className="absolute right-0 mt-2 w-48 z-50 py-2">
                      {!isAdmin && (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      )}
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </Card>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="bg-white">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-blue-100/20">
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/"
                    className="block text-white hover:text-blue-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                {!isAdmin && (
                  <>
                    <li>
                      <Link
                        to="/nominate"
                        className="block text-white hover:text-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Nominate
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/support"
                        className="block text-white hover:text-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Support
                      </Link>
                    </li>
                  </>
                )}
                {isAdmin && (
                  <>
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="block text-white hover:text-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/nominations"
                        className="block text-white hover:text-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Nominations
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/reports"
                        className="block text-white hover:text-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reports
                      </Link>
                    </li>
                  </>
                )}
                {(currentUser || isAdmin) && (
                  <>
                    {!isAdmin && (
                      <li>
                        <Link
                          to="/profile"
                          className="block text-white hover:text-blue-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        className="flex items-center text-white hover:text-blue-100"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </li>
                  </>
                )}
                {!currentUser && !isAdmin && (
                  <li>
                    <Link
                      to="/login"
                      className="block text-white hover:text-blue-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} TVET SRC Elections. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
              <Link to="/privacy" className="text-sm hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm hover:underline">
                Terms of Use
              </Link>
              <Link to="/help" className="text-sm hover:underline">
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

export default Layout;
