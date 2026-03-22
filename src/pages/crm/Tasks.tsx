import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tasksApi, Task } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Calendar, Eye, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import TaskFormModal from '@/components/Modal/TaskFormModal';
import TaskViewModal from '@/components/Modal/TaskViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { Input } from '@/components/ui/input';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected task
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tasksApi.getAll();
      // Handle both response formats: response.data.tasks or response.data as array
      const tasksData = response.data?.tasks || response.data;
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setViewModalOpen(false);
    setFormModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setViewModalOpen(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask) return;
    
    try {
      await tasksApi.delete(selectedTask.id);
      toast.success('Task deleted successfully');
      setDeleteModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Button 
          className="gradient-hero text-primary-foreground border-0"
          onClick={handleCreateTask}
        >
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleCreateTask}
          >
            <Plus className="w-4 h-4 mr-2" /> Create your first task
          </Button>
        </div>
      ) : (
        /* Tasks List */
        <div className="grid gap-4">
          {filteredTasks.map(t => (
            <Card key={t.id} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleViewTask(t)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-foreground hover:text-primary transition-colors">
                        {t.title}
                      </h3>
                      <Badge className={getPriorityColor(t.priority)}>
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {formatDate(t.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(t.status)}>
                      {t.status === 'in-progress' ? 'In Progress' : t.status}
                    </Badge>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewTask(t)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditTask(t)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTask(t)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      <TaskFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />

      {/* View Modal */}
      <TaskViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        task={selectedTask}
        onEdit={() => handleEditTask(selectedTask!)}
        onDelete={() => handleDeleteTask(selectedTask!)}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        itemName={selectedTask?.title}
      />
    </div>
  );
}
