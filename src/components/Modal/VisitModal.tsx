import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Building, FileText, Loader2 } from 'lucide-react';
import { visitsApi, VisitDetail, ClientItem, EmployeeListItem } from '@/lib/api';

interface VisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  visit?: VisitDetail | null;
}

export default function VisitModal({ open, onOpenChange, onSuccess, visit }: VisitModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    employeeId: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
    location: '',
    purpose: '',
    remarks: '',
    outcome: '',
    nextFollowup: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients and employees on mount
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchEmployees();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (visit) {
      setFormData({
        clientId: String(visit.clientId),
        employeeId: String(visit.employeeId),
        date: visit.date,
        checkInTime: visit.checkInTime,
        checkOutTime: visit.checkOutTime || '',
        location: visit.location,
        purpose: visit.purpose || '',
        remarks: visit.remarks || '',
        outcome: visit.outcome || '',
        nextFollowup: visit.nextFollowup || '',
      });
    } else {
      // Reset form for new visit
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        clientId: '',
        employeeId: '',
        date: today,
        checkInTime: '',
        checkOutTime: '',
        location: '',
        purpose: '',
        remarks: '',
        outcome: '',
        nextFollowup: '',
      });
    }
    setErrors({});
  }, [visit, open]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await visitsApi.getClients();
      if (response.success && response.data?.clients) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await visitsApi.getEmployees();
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.checkInTime) {
      newErrors.checkInTime = 'Check-in time is required';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      const data = {
        clientId: Number(formData.clientId),
        employeeId: Number(formData.employeeId),
        date: formData.date,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime || undefined,
        location: formData.location,
        purpose: formData.purpose || undefined,
        remarks: formData.remarks || undefined,
        outcome: formData.outcome || undefined,
        nextFollowup: formData.nextFollowup || undefined,
      };
      
      let response;
      if (visit) {
        response = await visitsApi.update(visit.id, data);
      } else {
        response = await visitsApi.create(data);
      }
      
      if (response.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving visit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {visit ? 'Edit Visit' : 'Log New Visit'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client & Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="flex items-center gap-2">
                <Building className="w-4 h-4" /> Client *
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleInputChange('clientId', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name} {client.companyName ? `(${client.companyName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-xs text-destructive">{errors.clientId}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Employee *
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => handleInputChange('employeeId', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.employeeId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.fullName} ({emp.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-xs text-destructive">{errors.employeeId}</p>
              )}
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkInTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Check-in Time *
              </Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                className={errors.checkInTime ? 'border-destructive' : ''}
              />
              {errors.checkInTime && (
                <p className="text-xs text-destructive">{errors.checkInTime}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkOutTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Check-out Time
              </Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
              />
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location *
            </Label>
            <Input
              id="location"
              placeholder="Enter visit location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={errors.location ? 'border-destructive' : ''}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location}</p>
            )}
          </div>
          
          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Visit</Label>
            <Input
              id="purpose"
              placeholder="Enter purpose of visit"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
            />
          </div>
          
          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Remarks
            </Label>
            <Textarea
              id="remarks"
              placeholder="Enter any remarks about the visit"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Outcome */}
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              placeholder="Enter visit outcome"
              value={formData.outcome}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Next Follow-up */}
          <div className="space-y-2">
            <Label htmlFor="nextFollowup">Next Follow-up Date</Label>
            <Input
              id="nextFollowup"
              type="date"
              value={formData.nextFollowup}
              onChange={(e) => handleInputChange('nextFollowup', e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-hero text-primary-foreground border-0"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {visit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                visit ? 'Update Visit' : 'Log Visit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
