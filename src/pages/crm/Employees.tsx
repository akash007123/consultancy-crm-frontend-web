import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { employeeApi, BackendEmployee } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import EmployeeViewModal from '@/components/Modal/EmployeeViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { useToast } from '@/hooks/use-toast';

// Helper to get profile photo URL
const getProfilePhotoUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  // If it's a data URL (base64 image), use it as is
  if (photo.startsWith('data:')) {
    return photo;
  }
  // If it's already a full URL, use it as is
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  // Otherwise, prepend the API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${photo}`;
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<BackendEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    // Don't try to fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await employeeApi.getAll({ search });
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, search, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (employee: BackendEmployee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleEdit = (employee: BackendEmployee) => {
    navigate(`/crm/employees/add?edit=${employee.id}`);
  };

  const handleDelete = (employee: BackendEmployee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    setIsDeleting(true);
    
    try {
      await employeeApi.delete(selectedEmployee.id);
      
      // Remove employee from list
      setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id));
      
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">{employees.length} total employees</p>
        </div>
        <Button 
          className="gradient-hero text-primary-foreground border-0"
          onClick={() => navigate('/crm/employees/add')}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Department</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(emp => (
                      <tr key={emp.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getProfilePhotoUrl(emp.profilePhoto) ? (
                              <img 
                                src={getProfilePhotoUrl(emp.profilePhoto)!} 
                                alt={`${emp.firstName} ${emp.lastName}`}
                                className="w-8 h-8 rounded-full object-cover border border-primary/20"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-xs font-bold text-primary-foreground">
                                {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{emp.email}</td>
                        <td className="p-4 capitalize text-foreground">{emp.role}</td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">{emp.department}</td>
                        <td className="p-4">
                          <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className={emp.status === 'active' ? 'bg-success/10 text-success border-success/20' : ''}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleView(emp)}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEdit(emp)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(emp)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <EmployeeViewModal 
        employee={selectedEmployee}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        itemName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
}
