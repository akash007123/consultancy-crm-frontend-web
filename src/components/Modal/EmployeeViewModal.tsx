import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, Building, MapPin, Briefcase, CreditCard } from 'lucide-react';
import { BackendEmployee } from '@/lib/api';

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

// Old Employee type (for backwards compatibility)
interface Employee {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'manager' | 'hr' | 'employee';
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
  salary: number;
}

interface EmployeeViewModalProps {
  employee: BackendEmployee | Employee | Record<string, unknown> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeViewModal({ employee, open, onOpenChange }: EmployeeViewModalProps) {
  if (!employee) return null;

  // Handle both old and new employee types
  const isNewType = 'firstName' in employee;
  const emp = employee as BackendEmployee;
  const oldEmp = employee as Employee;
  const name = isNewType ? `${emp.firstName} ${emp.lastName}` : oldEmp.name;
  const mobile = isNewType ? emp.mobile1 : oldEmp.mobile;
  const joinDate = isNewType ? emp.joiningDate : oldEmp.joinDate;
  const employeeCode = isNewType ? emp.employeeCode : `EMP${String(oldEmp.id).padStart(3, '0')}`;
  const role = isNewType ? emp.role : oldEmp.role;
  const status = isNewType ? emp.status : oldEmp.status;
  const email = isNewType ? emp.email : oldEmp.email;
  const department = isNewType ? emp.department : oldEmp.department;
  const dateOfBirth = isNewType ? emp.dateOfBirth : '';
  const address = isNewType ? emp.address : '';
  const salary = isNewType ? 0 : oldEmp.salary;
  const profilePhoto = isNewType ? emp.profilePhoto : null;
  const profilePhotoUrl = getProfilePhotoUrl(profilePhoto);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Employee Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt={name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-xl font-bold text-primary-foreground">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-foreground">{name}</h2>
              <p className="text-muted-foreground capitalize">{role}</p>
              <Badge 
                variant={status === 'active' ? 'default' : 'secondary'} 
                className={status === 'active' ? 'bg-success/10 text-success border-success/20 mt-1' : 'mt-1'}
              >
                {status}
              </Badge>
            </div>
          </div>

          {/* Personal Information */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-sm font-medium">{mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">{dateOfBirth || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{address || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Work Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p className="text-sm font-medium">{joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium">{employeeCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="text-sm font-medium">{isNewType ? '-' : `₹${salary.toLocaleString()}`}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Banking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Bank Account Name</p>
                  <p className="text-sm font-medium">-</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bank Account Number</p>
                  <p className="text-sm font-medium">-</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="text-sm font-medium">-</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IFSC Code</p>
                  <p className="text-sm font-medium">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
