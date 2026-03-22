import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { petrolAllowanceApi, PetrolAllowance, PetrolAllowanceStatus, employeeApi, BackendEmployee } from '@/lib/api';
import { Plus, Fuel, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import DeleteModal from '@/components/Modal/DeleteModal';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_RATE = 12;

export default function PetrolAllowancePage() {
  const { toast } = useToast();
  
  const [petrolAllowances, setPetrolAllowances] = useState<PetrolAllowance[]>([]);
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPetrolAllowance, setEditingPetrolAllowance] = useState<PetrolAllowance | null>(null);
  const [selectedPetrolAllowance, setSelectedPetrolAllowance] = useState<PetrolAllowance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    distance: '',
    rate: DEFAULT_RATE.toString(),
    date: new Date().toISOString().split('T')[0],
    status: 'Pending' as PetrolAllowanceStatus
  });

  // Fetch employees for dropdown
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeApi.getAll({});
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  // Fetch petrol allowances
  const fetchPetrolAllowances = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching petrol allowances...');
      const response = await petrolAllowanceApi.getAll();
      console.log('API Response:', response);
      
      if (response.success && response.data?.petrolAllowances) {
        setPetrolAllowances(response.data.petrolAllowances);
        console.log('Petrol allowances loaded:', response.data.petrolAllowances.length);
      } else {
        console.log('No petrol allowances or error:', response);
      }
    } catch (error) {
      console.error('Error fetching petrol allowances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load petrol allowances',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
    fetchPetrolAllowances();
  }, [fetchEmployees, fetchPetrolAllowances]);

  // Calculate total when distance or rate changes
  const calculateTotal = (distance: number, rate: number) => {
    return distance * rate;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'distance' || name === 'rate') {
      // Only allow numbers and decimal point
      const regex = /^\d*\.?\d*$/;
      if (value === '' || regex.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEmployeeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, employeeId: value }));
  };

  const handleStatusSelect = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as PetrolAllowanceStatus }));
  };

  const handleAddNew = () => {
    setEditingPetrolAllowance(null);
    setFormData({
      employeeId: '',
      distance: '',
      rate: DEFAULT_RATE.toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setFormModalOpen(true);
  };

  const handleEdit = (petrolAllowance: PetrolAllowance) => {
    setEditingPetrolAllowance(petrolAllowance);
    setFormData({
      employeeId: petrolAllowance.employeeId.toString(),
      distance: petrolAllowance.distance.toString(),
      rate: petrolAllowance.rate.toString(),
      date: petrolAllowance.date,
      status: petrolAllowance.status
    });
    setFormModalOpen(true);
  };

  const handleView = (petrolAllowance: PetrolAllowance) => {
    setSelectedPetrolAllowance(petrolAllowance);
    setViewModalOpen(true);
  };

  const handleDelete = (petrolAllowance: PetrolAllowance) => {
    setSelectedPetrolAllowance(petrolAllowance);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const distance = parseFloat(formData.distance);
    const rate = parseFloat(formData.rate);
    
    if (!formData.employeeId || isNaN(distance) || distance <= 0 || isNaN(rate) || rate <= 0 || !formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const petrolAllowanceData = {
        employeeId: parseInt(formData.employeeId),
        distance,
        rate,
        date: formData.date,
        status: formData.status
      };

      if (editingPetrolAllowance) {
        const response = await petrolAllowanceApi.update(editingPetrolAllowance.id, petrolAllowanceData);
        if (response.success) {
          await fetchPetrolAllowances();
          toast({ title: 'Success', description: 'Petrol allowance updated successfully' });
        }
      } else {
        const response = await petrolAllowanceApi.create(petrolAllowanceData);
        if (response.success) {
          await fetchPetrolAllowances();
          toast({ title: 'Success', description: 'Petrol allowance created successfully' });
        }
      }
      
      setFormModalOpen(false);
      setEditingPetrolAllowance(null);
      setFormData({
        employeeId: '',
        distance: '',
        rate: DEFAULT_RATE.toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      });
    } catch (error) {
      console.error('Error saving petrol allowance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save petrol allowance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPetrolAllowance) return;
    
    setIsDeleting(true);
    try {
      await petrolAllowanceApi.delete(selectedPetrolAllowance.id);
      await fetchPetrolAllowances();
      toast({ title: 'Success', description: 'Petrol allowance deleted successfully' });
    } catch (error) {
      console.error('Error deleting petrol allowance:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete petrol allowance',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedPetrolAllowance(null);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  // Calculate totals
  const totalAmount = petrolAllowances.reduce((sum, pa) => sum + (pa.total || 0), 0);
  const totalDistance = petrolAllowances.reduce((sum, pa) => sum + (pa.distance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Petrol Allowance</h1>
          <p className="text-sm text-muted-foreground">
            Rate: ₹{DEFAULT_RATE}/km | Total Distance: {totalDistance} km | Total: ₹{totalAmount.toLocaleString()}
          </p>
        </div>
        <Button className="gradient-hero text-primary-foreground border-0" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : petrolAllowances.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            No petrol allowances found. Click "Add Entry" to add one.
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Distance (km)</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rate</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {petrolAllowances.map(pa => (
                    <tr key={pa.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{pa.employeeName}</td>
                      <td className="p-4 text-muted-foreground">{pa.distance} km</td>
                      <td className="p-4 text-muted-foreground">₹{pa.rate}/km</td>
                      <td className="p-4 font-medium text-foreground">₹{pa.total?.toLocaleString() || 0}</td>
                      <td className="p-4 text-muted-foreground">{new Date(pa.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          pa.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pa.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleView(pa)}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(pa)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(pa)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPetrolAllowance ? 'Edit Petrol Allowance' : 'Add Petrol Allowance'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select 
                value={formData.employeeId} 
                onValueChange={handleEmployeeSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="text"
                placeholder="Enter distance in km"
                value={formData.distance}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹/km)</Label>
              <Input
                id="rate"
                name="rate"
                type="text"
                placeholder="Enter rate per km"
                value={formData.rate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total (₹)</Label>
              <Input
                id="total"
                value={formData.distance && formData.rate 
                  ? `₹${(parseFloat(formData.distance) * parseFloat(formData.rate)).toLocaleString()}` 
                  : '₹0'}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={handleStatusSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-hero text-primary-foreground border-0" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingPetrolAllowance ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Petrol Allowance Details</DialogTitle>
          </DialogHeader>
          {selectedPetrolAllowance && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <Fuel className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-foreground">
                  ₹{selectedPetrolAllowance.total?.toLocaleString() || 0}
                </p>
                <p className="text-lg font-medium text-foreground">
                  {selectedPetrolAllowance.employeeName}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{selectedPetrolAllowance.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">₹{selectedPetrolAllowance.rate}/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(selectedPetrolAllowance.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    selectedPetrolAllowance.status === 'Approved' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {selectedPetrolAllowance.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Created: {new Date(selectedPetrolAllowance.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Petrol Allowance"
        description="Are you sure you want to delete this petrol allowance? This action cannot be undone."
        itemName={selectedPetrolAllowance ? `${selectedPetrolAllowance.employeeName} - ₹${selectedPetrolAllowance.total?.toLocaleString()}` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
}
