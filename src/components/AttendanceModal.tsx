import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AttendanceRecord } from '@/lib/api';
import { Clock, Calendar, User, FileText } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord | null;
  employeeName: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present':
      return 'bg-green-500';
    case 'Half Day':
      return 'bg-orange-500';
    case 'Absent':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function AttendanceModal({
  isOpen,
  onClose,
  attendance,
  employeeName,
}: AttendanceModalProps) {
  if (!attendance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee and Date Info */}
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Employee:</span>
              <span>{employeeName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{formatDate(attendance.date)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Time Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Check In
              </div>
              <div className="font-medium">
                {attendance.checkIn || 'N/A'}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Check Out
              </div>
              <div className="font-medium">
                {attendance.checkOut || 'N/A'}
              </div>
            </div>
          </div>

          {/* Total Time */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Total Working Time
              </div>
              <div className="font-semibold">
                {attendance.totalTime}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge className={`${getStatusColor(attendance.status)} text-white`}>
              {attendance.status}
            </Badge>
          </div>

          {/* Report */}
          {attendance.report && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                Report
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{attendance.report}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
