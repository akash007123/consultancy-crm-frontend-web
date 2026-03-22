import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, FileText, Clock } from 'lucide-react';
import { Task } from '@/lib/api';

interface TaskViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskViewModal({ open, onOpenChange, task, onEdit, onDelete }: TaskViewModalProps) {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status === 'in-progress' ? 'In Progress' : task.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Description</span>
              </div>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Assigned To</span>
                </div>
                <p className="font-medium text-sm">{task.assigneeName}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Assign Date</span>
                </div>
                <p className="font-medium text-sm">{formatDate(task.assignDate)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm col-span-2">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Due Date</span>
                </div>
                <p className="font-medium text-sm">{formatDate(task.dueDate)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onDelete && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button 
                className="gradient-hero"
                onClick={onEdit}
              >
                Edit Task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}