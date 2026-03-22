import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Plus, X, User, Loader2 } from 'lucide-react';
import { employeeApi, BackendEmployee } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Document {
  name: string;
  file: File | null;
}

interface EmployeeFormData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  joiningDate: string;
  department: string;
  role: string;
  status: string;
  mobile1: string;
  mobile2: string;
  address: string;
  // Banking Information
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  bankAddress: string;
  // Social Media
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  otherSocial: string;
  // Password
  password: string;
}

const initialFormData: EmployeeFormData = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  joiningDate: new Date().toISOString().split('T')[0],
  department: 'Sales',
  role: 'employee',
  status: 'active',
  mobile1: '',
  mobile2: '',
  address: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  ifscCode: '',
  bankAddress: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  otherSocial: '',
  password: '',
};

export default function AddEmployeeForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([{ name: '', file: null }]);
  const [existingEmployee, setExistingEmployee] = useState<BackendEmployee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      const fetchEmployee = async () => {
        try {
          setIsLoading(true);
          const response = await employeeApi.getById(parseInt(editId));
          if (response.success && response.data?.employee) {
            const emp = response.data.employee;
            setExistingEmployee(emp);
            // Set existing profile photo if available
            if (emp.profilePhoto) {
              setProfilePhoto(emp.profilePhoto);
            }
            setFormData({
              employeeCode: emp.employeeCode || '',
              firstName: emp.firstName || '',
              lastName: emp.lastName || '',
              email: emp.email || '',
              gender: emp.gender || '',
              dateOfBirth: emp.dateOfBirth || '',
              joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
              department: emp.department || 'Sales',
              role: emp.role || 'employee',
              status: emp.status || 'active',
              mobile1: emp.mobile1 || '',
              mobile2: emp.mobile2 || '',
              address: emp.address || '',
              bankAccountName: emp.bankAccountName || '',
              bankAccountNumber: emp.bankAccountNumber || '',
              bankName: emp.bankName || '',
              ifscCode: emp.ifscCode || '',
              bankAddress: emp.bankAddress || '',
              facebook: emp.facebook || '',
              twitter: emp.twitter || '',
              linkedin: emp.linkedin || '',
              instagram: emp.instagram || '',
              otherSocial: emp.otherSocial || '',
              password: '',
            });
          }
        } catch (error) {
          console.error('Error fetching employee:', error);
          toast({
            title: 'Error',
            description: 'Failed to load employee data',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [editId, isEditMode, toast]);

  // Fetch new employee code when not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      const fetchNewCode = async () => {
        try {
          const response = await employeeApi.generateCode();
          if (response.success && response.data?.employeeCode) {
            setFormData(prev => ({ ...prev, employeeCode: response.data!.employeeCode! }));
          }
        } catch (error) {
          console.error('Error generating code:', error);
        }
      };
      fetchNewCode();
    }
  }, [isEditMode]);

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentNameChange = (index: number, value: string) => {
    const newDocs = [...documents];
    newDocs[index].name = value;
    setDocuments(newDocs);
  };

  const handleDocumentFileChange = (index: number, file: File | null) => {
    const newDocs = [...documents];
    newDocs[index].file = file;
    setDocuments(newDocs);
  };

  const addDocumentField = () => {
    setDocuments([...documents, { name: '', file: null }]);
  };

  const removeDocumentField = (index: number) => {
    if (documents.length > 1) {
      const newDocs = documents.filter((_, i) => i !== index);
      setDocuments(newDocs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate password length if provided
    if (formData.password && formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const employeeData = {
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        gender: formData.gender as 'male' | 'female' | 'other',
        dateOfBirth: formData.dateOfBirth,
        joiningDate: formData.joiningDate,
        department: formData.department,
        role: formData.role as 'admin' | 'manager' | 'hr' | 'employee',
        status: formData.status as 'active' | 'inactive',
        mobile1: formData.mobile1,
        mobile2: formData.mobile2,
        address: formData.address,
        bankAccountName: formData.bankAccountName,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        bankAddress: formData.bankAddress,
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        otherSocial: formData.otherSocial,
        password: formData.password,
        profilePhoto: profilePhoto,
      };

      if (isEditMode && existingEmployee) {
        // Update existing employee
        const updateData: Record<string, unknown> = {
          employeeCode: formData.employeeCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          joiningDate: formData.joiningDate,
          department: formData.department,
          role: formData.role,
          status: formData.status,
          mobile1: formData.mobile1,
          mobile2: formData.mobile2,
          address: formData.address,
          bankAccountName: formData.bankAccountName,
          bankAccountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscCode: formData.ifscCode,
          bankAddress: formData.bankAddress,
          facebook: formData.facebook,
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          otherSocial: formData.otherSocial,
          profilePhoto: profilePhoto,
        };
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await employeeApi.update(existingEmployee.id, updateData);
        
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        // Create new employee
        await employeeApi.create(employeeData);
        
        toast({
          title: 'Success',
          description: 'Employee created successfully. They can now login with their credentials.',
        });
      }

      setIsSubmitting(false);
      
      // Redirect to employees page after successful submission
      navigate('/crm/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save employee',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/crm/employees')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h1>
          <p className="text-sm text-muted-foreground">{isEditMode ? 'Update the employee details below' : 'Fill in the employee details below'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCode">Employee Code</Label>
                <Input
                  id="employeeCode"
                  value={formData.employeeCode}
                  onChange={(e) => handleChange('employeeCode', e.target.value)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile1">Mobile 1 *</Label>
                <Input
                  id="mobile1"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile1}
                  onChange={(e) => handleChange('mobile1', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile2">Mobile 2</Label>
                <Input
                  id="mobile2"
                  type="tel"
                  placeholder="Enter alternate mobile"
                  value={formData.mobile2}
                  onChange={(e) => handleChange('mobile2', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password {isEditMode ? '' : '*'}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required={!isEditMode}
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Photo */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center overflow-hidden bg-muted">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={profilePhotoRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profilePhotoRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Bank Account Name</Label>
                <Input
                  id="bankAccountName"
                  placeholder="Enter account holder name"
                  value={formData.bankAccountName}
                  onChange={(e) => handleChange('bankAccountName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="Enter account number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  placeholder="Enter IFSC code"
                  value={formData.ifscCode}
                  onChange={(e) => handleChange('ifscCode', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Input
                  id="bankAddress"
                  placeholder="Enter bank address"
                  value={formData.bankAddress}
                  onChange={(e) => handleChange('bankAddress', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="Facebook profile URL"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="Twitter profile URL"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="LinkedIn profile URL"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="Instagram profile URL"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="otherSocial">Other Social Links</Label>
                <Input
                  id="otherSocial"
                  placeholder="Other social media links"
                  value={formData.otherSocial}
                  onChange={(e) => handleChange('otherSocial', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Document Name</Label>
                    <Input
                      placeholder="Enter document name"
                      value={doc.name}
                      onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>File</Label>
                    <Input
                      type="file"
                      onChange={(e) => handleDocumentFileChange(index, e.target.files?.[0] || null)}
                    />
                  </div>
                  {documents.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocumentField(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addDocumentField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/crm/employees')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gradient-hero text-primary-foreground border-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Employee' : 'Create Employee'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
