import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { NominationStatus } from '../../types/database';
import { CheckCircle, XCircle, User } from 'lucide-react';
import { formatPositionName } from '../../lib/utils';

interface NominationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nomination: any | null;
  onApprove?: () => void;
  onReject?: () => void;
  getStatusBadge: (status: NominationStatus) => React.ReactNode;
}

const NominationDetailsDialog: React.FC<NominationDetailsDialogProps> = ({
  open,
  onOpenChange,
  nomination,
  onApprove,
  onReject,
  getStatusBadge
}) => {
  if (!nomination) return null;

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nomination Details</DialogTitle>
          <DialogDescription>
            Details for {nomination.nominee.fullName}'s nomination
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nominee Information</h3>
              <div className="border rounded-md p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Full Name</div>
                  <div className="font-medium">{nomination.nominee.fullName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Student Number</div>
                  <div>{nomination.nominee.studentNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div>{nomination.nominee.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cell Number</div>
                  <div>{nomination.nominee.cellNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Course</div>
                  <div>{nomination.nominee.course}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Year of Study</div>
                  <div>{nomination.nominee.yearOfStudy}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nomination Details</h3>
              <div className="border rounded-md p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Position</div>
                  <div className="font-medium">{formatPositionName(nomination.position)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div>{getStatusBadge(nomination.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Created Date</div>
                  <div>{formatDate(nomination.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Updated Date</div>
                  <div>{formatDate(nomination.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Motivation</h3>
            <div className="border rounded-md p-4">
              <p className="text-sm whitespace-pre-wrap">{nomination.motivation}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Supporters ({nomination.supporters.length}/3)
            </h3>
            <div className="border rounded-md p-4">
              {nomination.supporters.length === 0 ? (
                <p className="text-sm text-gray-500">No supporters yet</p>
              ) : (
                <div className="divide-y">
                  {nomination.supporters.map((supporter: any, index: number) => (
                    <div key={index} className="py-3 first:pt-1 last:pb-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{supporter.supporter.fullName}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {supporter.supporter.studentNumber}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full ml-2">
                              {supporter.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {nomination.status === NominationStatus.PENDING && onApprove && onReject && (
            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 gap-2"
                onClick={onApprove}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 gap-2"
                onClick={onReject}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NominationDetailsDialog;
