import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { JobPost } from '@/lib/api';
import { Calendar, MapPin, Briefcase, UserPlus, FileText } from 'lucide-react';

interface JobPostViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPost: JobPost | null;
}

export default function JobPostViewModal({ open, onOpenChange, jobPost }: JobPostViewModalProps) {
  if (!jobPost) return null;

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
      case 'Active':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'Closed':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Job Post Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{jobPost.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {jobPost.type}
                </Badge>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(jobPost.status)}`}>
                  {jobPost.status}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Job Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Job Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Posted Date</span>
                  <p className="text-sm font-medium">{formatDate(jobPost.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Positions</span>
                  <p className="text-sm font-medium">{jobPost.position}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Location</span>
                  <p className="text-sm font-medium">{jobPost.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Experience</span>
                  <p className="text-sm font-medium">{jobPost.experience}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Description
            </h4>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{jobPost.description}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{formatDate(jobPost.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <p className="font-medium">{formatDate(jobPost.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
