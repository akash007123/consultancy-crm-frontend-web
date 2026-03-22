import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { tadaApi, TADA, EmployeeListItem, ApprovalStatus } from '@/lib/api';
import { Plus, Wallet, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import DeleteModal from '@/components/Modal/DeleteModal';
import { useToast } from '@/hooks/use-toast';

export default function TADAPage() {
  const { toast } = useToast();
  
  const [tadaEntries, setTadaEntries] = useState<TADA[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TADA | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TADA | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    ta: '',
    da: '',
    date: new Date().toISOString().split('T')[0],
    approval: 'Pending (Manager)' as ApprovalStatus
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching TADA entries...');
      
      const tadaResponse = await tadaApi.getAll();
      console.log('TADA API Response:', tadaResponse);
      if (tadaResponse.success && tadaResponse.data?.tadaEntries) {
        setTadaEntries(tadaResponse.data.tadaEntries);
        console.log('TADA entries loaded:', tadaResponse.data.tadaEntries.length);
      }
      
      const empResponse = await tadaApi.getEmployees();
      console.log('Employees API Response:', empResponse);
      if (empResponse.success && empResponse.data?.employees) {
        setEmployees(empResponse.data.employees);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalClaims = tadaEntries.reduce((sum, e) => sum + e.ta + e.da, 0);
  const approvedClaims = tadaEntries
    .filter(e => e.approval === 'Approved')
    .reduce((sum, e) => sum + e.ta + e.da, 0);
  const pendingClaims = tadaEntries
    .filter(e => e.approval !== 'Approved')
    .reduce((sum, e) => sum + e.ta + e.da, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setFormData({
      employeeId: '',
      ta: '',
      da: '',
      date: new Date().toISOString().split('T')[0],
      approval: 'Pending (Manager)'
    });
    setFormModalOpen(true);
  };

  const handleEdit = (entry: TADA) => {
    setEditingEntry(entry);
    setFormData({
      employeeId: entry.employeeId.toString(),
      ta: entry.ta.toString(),
      da: entry.da.toString(),
      date: entry.date,
      approval: entry.approval
    });
    setFormModalOpen(true);
  };

  const handleView = (entry: TADA) => {
    setSelectedEntry(entry);
    setViewModalOpen(true);
  };

  const handleDelete = (entry: TADA) => {
    setSelectedEntry(entry);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tadaData = {
        employeeId: parseInt(formData.employeeId),
        ta: parseFloat(formData.ta) || 0,
        da: parseFloat(formData.da) || 0,
        date: formData.date,
        approval: formData.approval
      };

      if (editingEntry) {
        const response = await tadaApi.update(editingEntry.id, tadaData);
        if (response.success) {
          await fetchData();
          toast({ title: 'Success', description: 'TA/DA entry updated successfully' });
        }
      } else {
        const response = await tadaApi.create(tadaData);
        if (response.success) {
          await fetchData();
          toast({ title: 'Success', description: 'TA/DA entry created successfully' });
        }
      }
      
      setFormModalOpen(false);
      setEditingEntry(null);
      setFormData({
        employeeId: '',
        ta: '',
        da: '',
        date: new Date().toISOString().split('T')[0],
        approval: 'Pending (Manager)'
      });
    } catch (error) {
      console.error('Error saving TA/DA entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save TA/DA entry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    try {
      await tadaApi.delete(selectedEntry.id);
      await fetchData();
      toast({ title: 'Success', description: 'TA/DA entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting TA/DA entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete TA/DA entry',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedEntry(null);
    }
  };

  const getApprovalBadgeClass = (approval: string) => {
    if (approval === 'Approved') {
      return 'bg-success/10 text-success border-success/20';
    }
    return 'bg-warning/10 text-warning border-warning/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">TA / DA Management</h1>
          <p className="text-sm text-muted-foreground">Travel & Daily Allowance claims</p>
        </div>
        <Button className="gradient-hero text-primary-foreground border-0" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" /> Submit Claim
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-heading font-bold text-primary">₹{totalClaims.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Claims</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-heading font-bold text-success">₹{approvedClaims.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-heading font-bold text-warning">₹{pendingClaims.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>

          {tadaEntries.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                No TA/DA entries found. Click "Submit Claim" to add one.
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
                        <th className="text-left p-4 font-medium text-muted-foreground">TA</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">DA</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Approval</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tadaEntries.map(entry => (
                        <tr key={entry.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium text-foreground">{entry.employeeName}</td>
                          <td className="p-4 text-muted-foreground">₹{entry.ta.toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">₹{entry.da.toLocaleString()}</td>
                          <td className="p-4 font-medium text-foreground">₹{(entry.ta + entry.da).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="p-4">
                            <Badge className={getApprovalBadgeClass(entry.approval)}>
                              {entry.approval}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleView(entry)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleEdit(entry)}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(entry)}
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
        </>
      )}

      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit TA/DA Claim' : 'Submit TA/DA Claim'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => handleSelectChange('employeeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ta">TA (₹)</Label>
                <Input
                  id="ta"
                  name="ta"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Travel Allowance"
                  value={formData.ta}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="da">DA (₹)</Label>
                <Input
                  id="da"
                  name="da"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Daily Allowance"
                  value={formData.da}
                  onChange={handleInputChange}
                />
              </div>
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
              <Label htmlFor="approval">Approval Status</Label>
              <Select
                value={formData.approval}
                onValueChange={(value) => handleSelectChange('approval', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending (Manager)">Pending (Manager)</SelectItem>
                  <SelectItem value="Pending (Admin)">Pending (Admin)</SelectItem>
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
                {editingEntry ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>TA/DA Claim Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">{selectedEntry.employeeName}</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedEntry.date).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-lg font-bold text-foreground">₹{selectedEntry.ta.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">TA</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-lg font-bold text-foreground">₹{selectedEntry.da.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">DA</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-lg font-bold text-primary">₹{(selectedEntry.ta + selectedEntry.da).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="text-center">
                <Badge className={getApprovalBadgeClass(selectedEntry.approval)}>
                  {selectedEntry.approval}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete TA/DA Entry"
        description="Are you sure you want to delete this TA/DA entry? This action cannot be undone."
        itemName={selectedEntry ? `${selectedEntry.employeeName} - ₹${(selectedEntry.ta + selectedEntry.da).toLocaleString()}` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
}
