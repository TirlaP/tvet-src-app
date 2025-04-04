import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart, 
  User, 
  LogOut, 
  Home
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { cn } from '../../../lib/utils';

interface DashboardSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isOpen,
  isMobile,
  onClose 
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Student Navigation Items
  const studentNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'My Nominations',
      path: '/dashboard/nominations',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'My Profile',
      path: '/dashboard/profile',
      icon: <User className="h-5 w-5" />
    }
  ];

  // Admin Navigation Items
  const adminNavItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Nominations',
      path: '/admin/nominations',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: <BarChart className="h-5 w-5" />
    }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  // Handle nav item click (especially for mobile)
  const handleNavItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={cn(
      "h-full bg-white border-r flex flex-col",
      !isOpen && !isMobile && "w-[80px]",
      isOpen && !isMobile && "w-[250px]"
    )}>
      {/* Sidebar Header */}
      <div className="h-16 border-b flex items-center px-4">
        <div className={cn(
          "font-bold text-primary truncate",
          isOpen ? "text-xl" : "text-[0px]"
        )}>
          {isAdmin ? 'Admin Panel' : 'SRC Dashboard'}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                "hover:bg-gray-100",
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`) 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-gray-700",
                !isOpen && !isMobile && "justify-center px-2"
              )}
              onClick={handleNavItemClick}
            >
              {item.icon}
              <span className={cn(
                "ml-3 truncate",
                !isOpen && !isMobile && "hidden"
              )}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Links */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/"
          className={cn(
            "flex items-center py-2 px-3 rounded-md transition-colors text-gray-700 hover:bg-gray-100",
            !isOpen && !isMobile && "justify-center px-2"
          )}
          onClick={handleNavItemClick}
        >
          <Home className="h-5 w-5" />
          <span className={cn(
            "ml-3",
            !isOpen && !isMobile && "hidden"
          )}>
            Back to Main Site
          </span>
        </Link>
        
        <button
          className={cn(
            "w-full flex items-center py-2 px-3 rounded-md transition-colors text-red-600 hover:bg-red-50",
            !isOpen && !isMobile && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className={cn(
            "ml-3",
            !isOpen && !isMobile && "hidden"
          )}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
