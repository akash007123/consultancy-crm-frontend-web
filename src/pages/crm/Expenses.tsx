import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { expenseApi, Expense } from '@/lib/api';
import { Plus, Receipt, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import DeleteModal from '@/components/Modal/DeleteModal';
import { useToast } from '@/hooks/use-toast';

export default function ExpensesPage() {
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: ''
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching expenses...');
      const response = await expenseApi.getAll();
      console.log('API Response:', response);
      
      if (response.success && response.data?.expenses) {
        setExpenses(response.data.expenses);
        const totalAmount = response.data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        setTotal(totalAmount);
        console.log('Expenses loaded:', response.data.expenses.length);
      } else {
        console.log('No expenses or error:', response);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setFormData({ category: '', amount: '', description: '' });
    setFormModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || ''
    });
    setFormModalOpen(true);
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid category and amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const expenseData = {
        category: formData.category.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || undefined
      };

      if (editingExpense) {
        const response = await expenseApi.update(editingExpense.id, expenseData);
        if (response.success) {
          await fetchExpenses();
          toast({ title: 'Success', description: 'Expense updated successfully' });
        }
      } else {
        const response = await expenseApi.create(expenseData);
        if (response.success) {
          await fetchExpenses();
          toast({ title: 'Success', description: 'Expense created successfully' });
        }
      }
      
      setFormModalOpen(false);
      setEditingExpense(null);
      setFormData({ category: '', amount: '', description: '' });
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    
    setIsDeleting(true);
    try {
      await expenseApi.delete(selectedExpense.id);
      await fetchExpenses();
      toast({ title: 'Success', description: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedExpense(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Total: ₹{total.toLocaleString()}</p>
        </div>
        <Button className="gradient-hero text-primary-foreground border-0" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" /> Submit Expense
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : expenses.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            No expenses found. Click "Submit Expense" to add one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map((e) => (
            <Card key={e.id} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{e.category}</p>
                  <p className="text-lg font-heading font-bold text-foreground">₹{e.amount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleView(e)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleEdit(e)}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(e)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="Enter category (e.g., Travel, Food, Petrol)"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-hero text-primary-foreground border-0" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingExpense ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <Receipt className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-foreground">₹{selectedExpense.amount.toLocaleString()}</p>
                <p className="text-lg font-medium text-foreground">{selectedExpense.category}</p>
              </div>
              {selectedExpense.description && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedExpense.description}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center">
                Created: {new Date(selectedExpense.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        itemName={selectedExpense ? `${selectedExpense.category} - ₹${selectedExpense.amount.toLocaleString()}` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
}
