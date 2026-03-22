import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackendEmployee, employeeApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export type ViewType = 'events' | 'attendance';

interface AttendanceFilterProps {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  selectedEmployeeId: string;
  onEmployeeChange: (employeeId: string) => void;
  onRefresh: () => void;
}

export default function AttendanceFilter({
  viewType,
  onViewTypeChange,
  selectedEmployeeId,
  onEmployeeChange,
  onRefresh,
}: AttendanceFilterProps) {
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch employees when switching to attendance view
  useEffect(() => {
    if (viewType === 'attendance' && employees.length === 0) {
      fetchEmployees();
    }
  }, [viewType]);

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await employeeApi.getAll({ status: 'active' });
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleViewTypeChange = (value: string) => {
    const newViewType = value as ViewType;
    onViewTypeChange(newViewType);
    
    // Reset employee selection when switching to events
    if (newViewType === 'events') {
      onEmployeeChange('');
    }
  };

  const handleEmployeeChange = (value: string) => {
    onEmployeeChange(value);
    // Trigger refresh when employee changes
    onRefresh();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* View Type Dropdown */}
      <div className="w-full sm:w-48">
        <label className="text-sm font-medium mb-1 block text-muted-foreground">
          Select View
        </label>
        <Select value={viewType} onValueChange={handleViewTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="attendance">Employee Attendance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Dropdown - Only show when attendance is selected */}
      {viewType === 'attendance' && (
        <div className="w-full sm:w-64">
          <label className="text-sm font-medium mb-1 block text-muted-foreground">
            Select Employee
          </label>
          {isLoadingEmployees ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading employees...</span>
            </div>
          ) : (
            <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
