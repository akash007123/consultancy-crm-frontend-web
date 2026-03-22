import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Candidate } from '@/lib/api';

interface CandidateViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
}

export default function CandidateViewModal({ open, onOpenChange, candidate }: CandidateViewModalProps) {
  if (!candidate) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer Sent':
        return 'text-success';
      case 'Accepted Offer':
        return 'text-success';
      case 'Interview Scheduled':
        return 'text-primary';
      case 'Shortlisted':
        return 'text-warning';
      case 'Pending':
        return 'text-muted-foreground';
      case 'Applied':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Position */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{candidate.name}</h3>
              <p className="text-muted-foreground">{candidate.position}</p>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(candidate.status)}`}>
              {candidate.status}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{candidate.email || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone:</span>
                <span>{candidate.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {candidate.notes && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{candidate.notes}</p>
              </div>
            </>
          )}

          {/* Dates */}
          <div className="border-t" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{formatDate(candidate.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <p className="font-medium">{formatDate(candidate.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
