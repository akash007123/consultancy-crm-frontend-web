import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tasksApi, Task, TaskPriority, TaskStatus, employeeApi, BackendEmployee } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSuccess: () => void;
}

export default function TaskFormModal({ open, onOpenChange, task, onSuccess }: TaskFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeId: 0,
    dueDate: '',
    status: 'pending' as TaskStatus,
  });

  // Fetch employees on mount or when modal opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Set form data when task changes or modal opens
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || 0,
        dueDate: task.dueDate || '',
        status: task.status || 'pending',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: 0,
        dueDate: '',
        status: 'pending',
      });
    }
  }, [task, open]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeApi.getAll({ status: 'active' });
      if (response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value as TaskPriority }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as TaskStatus }));
  };

  const handleAssigneeChange = (value: string) => {
    setFormData(prev => ({ ...prev, assigneeId: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (formData.assigneeId === 0) {
      toast.error('Please select an assignee');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }

    setLoading(true);
    try {
      if (task) {
        // Update existing task
        await tasksApi.update(task.id, {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          assigneeId: formData.assigneeId,
          dueDate: formData.dueDate,
          status: formData.status,
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await tasksApi.create({
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          assigneeId: formData.assigneeId,
          dueDate: formData.dueDate,
          status: formData.status,
        });
        toast.success('Task created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority *</Label>
            <Select value={formData.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee *</Label>
            <Select 
              value={formData.assigneeId.toString()} 
              onValueChange={handleAssigneeChange}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gradient-hero"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}