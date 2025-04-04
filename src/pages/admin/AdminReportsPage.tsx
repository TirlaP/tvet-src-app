import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { nominationService, adminService } from '../../lib/services';
import { NominationStatus, AdminAction } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import html2pdf from 'html2pdf.js';
import { useToast } from '../../hooks/use-toast';
import {
  FileText,
  FileSpreadsheet,
  PieChart,
  BarChart,
  Activity,
  Calendar,
  User,
  FileIcon
} from 'lucide-react';

const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({
    nominationsByPosition: {},
    nominationsByStatus: {},
    activityTimeline: [],
    totalNominations: 0,
    totalStudents: 0,
    totalSupporters: 0
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Fetch reports data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all nominations to generate reports
        const allNominations = await nominationService.getAll();
        
        // Get nominations by position
        const positionCounts: Record<string, number> = {};
        allNominations.forEach(nomination => {
          positionCounts[nomination.position] = (positionCounts[nomination.position] || 0) + 1;
        });
        
        // Get nominations by status
        const statusCounts: Record<string, number> = {
          [NominationStatus.PENDING]: 0,
          [NominationStatus.APPROVED]: 0,
          [NominationStatus.REJECTED]: 0,
          [NominationStatus.DRAFT]: 0
        };
        
        allNominations.forEach(nomination => {
          statusCounts[nomination.status] = (statusCounts[nomination.status] || 0) + 1;
        });
        
        // Get activity timeline
        const auditLog = await adminService.getAuditLog();
        
        // Count total unique students (nominees + supporters)
        const uniqueStudentIds = new Set();
        
        // Add nominees
        allNominations.forEach(nomination => {
          uniqueStudentIds.add(nomination.nominee.id);
        });
        
        // Add supporters
        let totalSupporters = 0;
        allNominations.forEach(nomination => {
          totalSupporters += nomination.supporters.length;
          nomination.supporters.forEach(supporter => {
            uniqueStudentIds.add(supporter.supporter.id);
          });
        });
        
        setReportData({
          nominationsByPosition: positionCounts,
          nominationsByStatus: statusCounts,
          activityTimeline: auditLog.slice(0, 20), // Get latest 20 events
          totalNominations: allNominations.length,
          totalStudents: uniqueStudentIds.size,
          totalSupporters
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        });
      }
    };
    
    if (isAdmin) {
      fetchReportData();
    }
  }, [isAdmin, toast]);

  // Export reports to PDF
  const exportToPDF = async () => {
    try {
      // Log the export action
      await adminService.exportNominations('admin', 'PDF');
      
      // Create a clone of the reports section to export
      const reportsSection = document.getElementById('reports-section');
      
      if (!reportsSection) {
        throw new Error('Reports section not found');
      }
      
      const clone = reportsSection.cloneNode(true) as HTMLElement;
      
      // Add a title to the PDF
      const title = document.createElement('h1');
      title.textContent = 'SRC Nominations Report';
      title.style.textAlign = 'center';
      title.style.margin = '20px 0';
      title.style.fontFamily = 'sans-serif';
      title.style.fontSize = '24px';
      
      // Add the date
      const date = document.createElement('p');
      date.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
      date.style.textAlign = 'center';
      date.style.marginBottom = '30px';
      date.style.fontFamily = 'sans-serif';
      
      // Create a container for the PDF content
      const pdfContent = document.createElement('div');
      pdfContent.appendChild(title);
      pdfContent.appendChild(date);
      pdfContent.appendChild(clone);
      
      // Style the container
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = 'white';
      
      // Configure html2pdf options
      const opt = {
        margin: 10,
        filename: `src_nominations_report_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate PDF
      html2pdf().set(opt).from(pdfContent).save();
      
      toast({
        title: "Export Successful",
        description: "Report has been exported to PDF",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      toast({
        title: "Export Failed",
        description: "Failed to export report to PDF",
        variant: "destructive",
      });
    }
  };

  // Export reports to CSV
  const exportToCSV = async () => {
    try {
      // Log the export action
      await adminService.exportNominations('admin', 'CSV');
      
      // Create CSV string for nominations by position
      const positionHeaders = ['Position', 'Count'];
      const positionRows = Object.entries(reportData.nominationsByPosition).map(
        ([position, count]) => [position, count].join(',')
      );
      const positionCSV = [positionHeaders, ...positionRows].join('\n');
      
      // Create CSV string for nominations by status
      const statusHeaders = ['Status', 'Count'];
      const statusRows = Object.entries(reportData.nominationsByStatus).map(
        ([status, count]) => [status, count].join(',')
      );
      const statusCSV = [statusHeaders, ...statusRows].join('\n');
      
      // Combine the CSVs
      const combinedCSV = 
        'NOMINATIONS BY POSITION\n' +
        positionCSV +
        '\n\n' +
        'NOMINATIONS BY STATUS\n' +
        statusCSV +
        '\n\n' +
        'SUMMARY\n' +
        'Total Nominations,' + reportData.totalNominations + '\n' +
        'Total Students,' + reportData.totalStudents + '\n' +
        'Total Supporters,' + reportData.totalSupporters;
      
      // Create download link
      const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `src_nominations_report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Report has been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      
      toast({
        title: "Export Failed",
        description: "Failed to export report to CSV",
        variant: "destructive",
      });
    }
  };

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

  // Get status color
  const getStatusColor = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.APPROVED:
        return 'bg-green-500';
      case NominationStatus.REJECTED:
        return 'bg-red-500';
      case NominationStatus.PENDING:
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">Reports</h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={exportToPDF}
              >
                <FileIcon className="h-4 w-4" />
                Export PDF
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={exportToCSV}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div id="reports-section" className="space-y-6">
              {/* Summary Cards */}
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
                      {reportData.totalNominations}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total number of submitted nominations
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.totalStudents}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unique students participating
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Supporters
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.totalSupporters}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total number of nomination supporters
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Status Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Nomination Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Current status of all nominations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.nominationsByStatus).map(([status, count]) => (
                      <div key={status} className="flex flex-col items-center">
                        <div className="w-full h-24 flex flex-col justify-center items-center">
                          <div 
                            className={`w-24 h-24 rounded-full flex items-center justify-center ${getStatusColor(status as NominationStatus)}`}
                          >
                            <span className="text-2xl font-bold text-white">
                              {count as number}
                            </span>
                          </div>
                        </div>
                        <span className="mt-2 text-sm font-medium">
                          {status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {reportData.totalNominations > 0 
                            ? Math.round(((count as number) / reportData.totalNominations) * 100) 
                            : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Position Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Nominations by Position
                  </CardTitle>
                  <CardDescription>
                    Number of nominations for each position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.nominationsByPosition)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .map(([position, count]) => (
                        <div key={position} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{position}</span>
                            <span className="text-sm">{count as number}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ 
                                width: `${Math.max(
                                  (count as number) / Math.max(...Object.values(reportData.nominationsByPosition)) * 100, 
                                  5
                                )}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
              
              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest actions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.activityTimeline.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No recent activities yet
                      </p>
                    ) : (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200" />
                        
                        <div className="space-y-6">
                          {reportData.activityTimeline.map((activity: any, index: number) => (
                            <div key={index} className="relative pl-8">
                              {/* Timeline dot */}
                              <div className="absolute left-[18px] -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-4 border-primary/30" />
                              
                              <div className="bg-gray-50 p-3 rounded-md border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">
                                      {activity.action} {activity.entityType.toLowerCase()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {activity.details}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-400">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(activity.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    Showing {reportData.activityTimeline.length} of the most recent activities
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
