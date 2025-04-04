import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { 
  nominationService, 
  adminService
} from '../../lib/services';
import { NominationStatus, AdminAudit } from '../../types/database';
import { 
  BarChart, 
  Users, 
  FileText, 
  ClipboardCheck, 
  ClipboardX, 
  Clock, 
  Activity
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNominations: 0,
    pendingNominations: 0,
    approvedNominations: 0,
    rejectedNominations: 0,
    totalSupporters: 0,
    totalStudents: 0
  });
  const [recentActivity, setRecentActivity] = useState<AdminAudit[]>([]);
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all nominations to calculate stats
        const allNominations = await nominationService.getAll();
        
        // Count nominations by status
        const pendingNominations = allNominations.filter(
          n => n.status === NominationStatus.PENDING
        ).length;
        
        const approvedNominations = allNominations.filter(
          n => n.status === NominationStatus.APPROVED
        ).length;
        
        const rejectedNominations = allNominations.filter(
          n => n.status === NominationStatus.REJECTED
        ).length;
        
        // Count total supporters
        const totalSupporters = allNominations.reduce(
          (sum, nomination) => sum + nomination.supporters.length, 
          0
        );
        
        // Count unique students
        const uniqueStudentIds = new Set();
        
        // Add nominees
        allNominations.forEach(nomination => {
          uniqueStudentIds.add(nomination.nominee.id);
        });
        
        // Add supporters
        allNominations.forEach(nomination => {
          nomination.supporters.forEach(supporter => {
            uniqueStudentIds.add(supporter.supporter.id);
          });
        });
        
        // Get recent activity
        const auditLog = await adminService.getAuditLog();
        const recentAuditLog = auditLog.slice(0, 10); // Get latest 10 events
        
        // Set stats
        setStats({
          totalNominations: allNominations.length,
          pendingNominations,
          approvedNominations,
          rejectedNominations,
          totalSupporters,
          totalStudents: uniqueStudentIds.size
        });
        
        setRecentActivity(recentAuditLog);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Format date for activity log
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Nominations
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalNominations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total number of submitted nominations
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Review
                  </CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {stats.pendingNominations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nominations waiting for your review
                  </p>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Positions Status
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <div className="flex justify-between w-full">
                      <span className="text-xs">Approved</span>
                      <span className="text-xs font-bold text-green-600">
                        {stats.approvedNominations}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ 
                        width: `${stats.totalNominations > 0 
                          ? (stats.approvedNominations / stats.totalNominations * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center pt-1">
                    <div className="flex justify-between w-full">
                      <span className="text-xs">Rejected</span>
                      <span className="text-xs font-bold text-red-600">
                        {stats.rejectedNominations}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ 
                        width: `${stats.totalNominations > 0 
                          ? (stats.rejectedNominations / stats.totalNominations * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved Nominations
                  </CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {stats.approvedNominations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nominations that have been approved
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejected Nominations
                  </CardTitle>
                  <ClipboardX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {stats.rejectedNominations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nominations that have been rejected
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total number of unique students involved
                  </p>
                </CardContent>
              </Card>
              
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    The most recent actions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {recentActivity.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No recent activities yet
                      </p>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div 
                          key={activity.id || index}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1 rounded-full">
                              <Activity className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">
                              {activity.action} {activity.entityType.toLowerCase()} - {activity.details}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    Showing {recentActivity.length} of the most recent activities
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
