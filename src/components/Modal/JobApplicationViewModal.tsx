import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { JobApplication } from '@/lib/api';
import { Calendar, Mail, Phone, MapPin, GraduationCap, FileText } from 'lucide-react';

interface JobApplicationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
}

export default function JobApplicationViewModal({ open, onOpenChange, application }: JobApplicationViewModalProps) {
  if (!application) return null;

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
      case 'Shortlisted':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'Interview Scheduled':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'Hired':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'Rejected':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'Applied':
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Job Title & Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{application.name}</h3>
              <p className="text-muted-foreground mt-1">{application.jobTitle}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{application.email || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{application.mobile || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{application.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="border-t" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Education
            </h4>
            <p className="text-sm">{application.education || 'N/A'}</p>
          </div>

          {/* Resume Link */}
          {application.resumeUrl && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume
                </h4>
                <a 
                  href={application.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Resume
                </a>
              </div>
            </>
          )}

          {/* Dates */}
          <div className="border-t" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Applied On:</span>
              <p className="font-medium">{formatDate(application.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <p className="font-medium">{formatDate(application.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
