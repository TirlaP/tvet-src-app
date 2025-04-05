import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { nominationService, adminService } from '../../lib/services';
import { NominationStatus, NominationWithDetails, AdminAction, EntityType } from '../../types/database';
import { useToast } from '../../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  FileText,
  Filter,
  Download,
  MoreVertical,
  Eye
} from 'lucide-react';

// Array of SRC positions
const positions = [
  { id: 'all', name: 'All Positions' },
  { id: 'president', name: 'President' },
  { id: 'deputy_president', name: 'Deputy President' },
  { id: 'secretary', name: 'Secretary' },
  { id: 'deputy_secretary', name: 'Deputy Secretary' },
  { id: 'treasurer', name: 'Treasurer' },
  { id: 'academic_officer', name: 'Academic Officer' },
  { id: 'sports_officer', name: 'Sports Officer' },
  { id: 'cultural_officer', name: 'Cultural Officer' },
  { id: 'communications_officer', name: 'Communications Officer' },
  { id: 'residence_officer', name: 'Residence Officer' },
];

// Status options for filtering
const statusOptions = [
  { id: 'all', name: 'All Status' },
  { id: NominationStatus.PENDING, name: 'Pending' },
  { id: NominationStatus.APPROVED, name: 'Approved' },
  { id: NominationStatus.REJECTED, name: 'Rejected' },
  { id: NominationStatus.DRAFT, name: 'Draft' },
];

const AdminNominationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [nominations, setNominations] = useState<NominationWithDetails[]>([]);
  const [filteredNominations, setFilteredNominations] = useState<NominationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNomination, setSelectedNomination] = useState<NominationWithDetails | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Fetch nominations
  useEffect(() => {
    const fetchNominations = async () => {
      try {
        setIsLoading(true);
        const allNominations = await nominationService.getAll();
        setNominations(allNominations);
        setFilteredNominations(allNominations);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching nominations:', error);
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: "Failed to load nominations",
          variant: "destructive",
        });
      }
    };
    
    if (isAdmin) {
      fetchNominations();
    }
  }, [isAdmin, toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...nominations];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(nomination => 
        nomination.nominee.fullName.toLowerCase().includes(search) ||
        nomination.nominee.studentNumber.toLowerCase().includes(search) ||
        nomination.nominee.email.toLowerCase().includes(search)
      );
    }
    
    // Apply position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(nomination => 
        nomination.position === positionFilter
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(nomination => 
        nomination.status === statusFilter
      );
    }
    
    setFilteredNominations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, positionFilter, statusFilter, nominations]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNominations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNominations.length / itemsPerPage);

  // Handle approve nomination
  const approveNomination = async () => {
    if (!selectedNomination) return;
    
    try {
      await nominationService.updateStatus(
        selectedNomination.id!,
        NominationStatus.APPROVED,
        'admin'
      );
      
      // Update local state
      const updatedNominations = nominations.map(nomination => 
        nomination.id === selectedNomination.id 
          ? { ...nomination, status: NominationStatus.APPROVED }
          : nomination
      );
      
      setNominations(updatedNominations);
      setShowApproveDialog(false);
      
      toast({
        title: "Nomination Approved",
        description: `${selectedNomination.nominee.fullName}'s nomination has been approved`,
      });
    } catch (error) {
      console.error('Error approving nomination:', error);
      
      toast({
        title: "Error",
        description: "Failed to approve nomination",
        variant: "destructive",
      });
    }
  };

  // Handle reject nomination
  const rejectNomination = async () => {
    if (!selectedNomination) return;
    
    try {
      await nominationService.updateStatus(
        selectedNomination.id!,
        NominationStatus.REJECTED,
        'admin'
      );
      
      // Update local state
      const updatedNominations = nominations.map(nomination => 
        nomination.id === selectedNomination.id 
          ? { ...nomination, status: NominationStatus.REJECTED }
          : nomination
      );
      
      setNominations(updatedNominations);
      setShowRejectDialog(false);
      
      toast({
        title: "Nomination Rejected",
        description: `${selectedNomination.nominee.fullName}'s nomination has been rejected`,
      });
    } catch (error) {
      console.error('Error rejecting nomination:', error);
      
      toast({
        title: "Error",
        description: "Failed to reject nomination",
        variant: "destructive",
      });
    }
  };

  // Export nominations to CSV
  const exportToCSV = async () => {
    try {
      // Log the export action
      await adminService.exportNominations('admin', 'CSV');
      
      // Create CSV string
      const headers = [
        'ID',
        'Nominee Name',
        'Student Number',
        'Email',
        'Cell Number',
        'Position',
        'Status',
        'Supporters',
        'Created At'
      ].join(',');
      
      const rows = filteredNominations.map(nomination => [
        nomination.id,
        `"${nomination.nominee.fullName}"`,
        nomination.nominee.studentNumber,
        nomination.nominee.email,
        nomination.nominee.cellNumber,
        nomination.position,
        nomination.status,
        nomination.supporters.length,
        new Date(nomination.createdAt).toISOString()
      ].join(','));
      
      const csv = [headers, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nominations_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Nominations have been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting nominations:', error);
      
      toast({
        title: "Export Failed",
        description: "Failed to export nominations",
        variant: "destructive",
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.APPROVED:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case NominationStatus.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case NominationStatus.PENDING:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  // Render mobile card view for nominations
  const renderMobileCard = (nomination: NominationWithDetails) => {
    return (
      <Card key={nomination.id} className="mb-4">
        <CardContent className="pt-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {nomination.nominee.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {nomination.nominee.email}
                </div>
              </div>
            </div>
            <div>
              {getStatusBadge(nomination.status)}
            </div>
          </div>
          
          <div className="mt-3 border-t pt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Position:</span>
              <div className="font-medium">{nomination.position}</div>
            </div>
            <div>
              <span className="text-gray-500">Student Number:</span>
              <div className="font-medium">{nomination.nominee.studentNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Supporters:</span>
              <div className="font-medium">{nomination.supporters.length} / 3</div>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <div className="font-medium">{new Date(nomination.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t py-2 flex justify-end">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                setSelectedNomination(nomination);
                setShowDetailsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            
            {nomination.status === NominationStatus.PENDING && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-green-600"
                  onClick={() => {
                    setSelectedNomination(nomination);
                    setShowApproveDialog(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-600"
                  onClick={() => {
                    setSelectedNomination(nomination);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Nominations</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
          
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Filter Nominations
            </CardTitle>
            <CardDescription>
              Use the filters below to find specific nominations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search nominee name or ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={positionFilter}
                onValueChange={setPositionFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
            <div className="text-sm text-gray-500">
              {filteredNominations.length} nominations found
            </div>
            
            <Button 
              variant="ghost" 
              className="h-8 px-2 text-xs"
              onClick={() => {
                setSearchTerm('');
                setPositionFilter('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
        
        {/* Nominations List */}
        <Card>
          <CardHeader>
            <CardTitle>Nominations List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2 text-gray-500">No nominations found</p>
              </div>
            ) : (
              <>
                {/* Mobile View (Only visible on small screens) */}
                <div className="md:hidden space-y-4">
                  {currentItems.map(nomination => renderMobileCard(nomination))}
                </div>
                
                {/* Desktop Table View (Hidden on small screens) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nominee
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supporters
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((nomination) => (
                        <tr key={nomination.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                  {nomination.nominee.fullName}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {nomination.nominee.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {nomination.position}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {nomination.nominee.studentNumber}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {getStatusBadge(nomination.status)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {nomination.supporters.length} / 3
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(nomination.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 px-2"
                                onClick={() => {
                                  setSelectedNomination(nomination);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                Details
                              </Button>
                              
                              {nomination.status === NominationStatus.PENDING && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 px-2 text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedNomination(nomination);
                                      setShowApproveDialog(true);
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedNomination(nomination);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
          
          {/* Pagination */}
          {!isLoading && filteredNominations.length > 0 && (
            <CardFooter className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0 text-center sm:text-left">
                Showing {indexOfFirstItem + 1} to{' '}
                {indexOfLastItem > filteredNominations.length 
                  ? filteredNominations.length 
                  : indexOfLastItem}{' '}
                of {filteredNominations.length} nominations
              </div>
              
              <div className="flex flex-wrap justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-8 w-8 px-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    
      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Nomination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedNomination?.nominee.fullName}'s nomination for {selectedNomination?.position}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={approveNomination}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Nomination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedNomination?.nominee.fullName}'s nomination for {selectedNomination?.position}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={rejectNomination}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Details Dialog */}
      <AlertDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Nomination Details</AlertDialogTitle>
            <AlertDialogDescription>
              Details for {selectedNomination?.nominee.fullName}'s nomination
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedNomination && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nominee Information</h3>
                  <div className="mt-2 border rounded-md p-3 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Full Name:</span>
                      <p className="text-sm">{selectedNomination.nominee.fullName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Student Number:</span>
                      <p className="text-sm">{selectedNomination.nominee.studentNumber}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Email:</span>
                      <p className="text-sm">{selectedNomination.nominee.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Cell Number:</span>
                      <p className="text-sm">{selectedNomination.nominee.cellNumber}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Course:</span>
                      <p className="text-sm">{selectedNomination.nominee.course}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Year of Study:</span>
                      <p className="text-sm">{selectedNomination.nominee.yearOfStudy}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nomination Details</h3>
                  <div className="mt-2 border rounded-md p-3 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Position:</span>
                      <p className="text-sm">{selectedNomination.position}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Status:</span>
                      <p className="text-sm">{getStatusBadge(selectedNomination.status)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Created Date:</span>
                      <p className="text-sm">{new Date(selectedNomination.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Updated Date:</span>
                      <p className="text-sm">{new Date(selectedNomination.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Motivation</h3>
                <div className="mt-2 border rounded-md p-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedNomination.motivation}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Supporters ({selectedNomination.supporters.length}/3)</h3>
                <div className="mt-2 border rounded-md p-3">
                  {selectedNomination.supporters.length === 0 ? (
                    <p className="text-sm text-gray-500">No supporters yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedNomination.supporters.map((supporter, index) => (
                        <div key={index} className="pb-2 border-b last:border-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="ml-2">
                              <p className="text-sm font-medium">{supporter.supporter.fullName}</p>
                              <p className="text-xs text-gray-500">
                                {supporter.supporter.studentNumber} - {supporter.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedNomination.status === NominationStatus.PENDING && (
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminNominationsPage;