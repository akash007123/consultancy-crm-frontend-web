import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { invoiceApi, clientsApi, Invoice, InvoiceStatus, PaymentMethod, BackendClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSuccess: () => void;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceFormModal({ open, onOpenChange, invoice, onSuccess }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<BackendClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    tax: 0,
    notes: '',
    paymentMethod: '' as PaymentMethod | '',
    status: 'Pending' as InvoiceStatus,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', quantity: 1, rate: 0 }
  ]);

  // Fetch clients on mount or when modal opens
  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  // Set form data when invoice changes or modal opens
  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId,
        date: invoice.date,
        dueDate: invoice.dueDate || '',
        tax: invoice.tax,
        notes: invoice.notes || '',
        paymentMethod: invoice.paymentMethod || '',
        status: invoice.status,
      });
      
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map((item, idx) => ({
          id: idx + 1,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })));
      }
    } else {
      setFormData({
        clientId: 0,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        tax: 0,
        notes: '',
        paymentMethod: '',
        status: 'Pending',
      });
      setItems([{ id: 1, description: '', quantity: 1, rate: 0 }]);
    }
  }, [invoice, open]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await clientsApi.getAll();
      if (response.data?.clients) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'tax' || name === 'clientId' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, clientId: parseInt(value) }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as InvoiceStatus }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value as PaymentMethod }));
  };

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.clientId === 0) {
      toast.error('Please select a client');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }
    if (items.some(item => !item.description.trim())) {
      toast.error('All items must have a description');
      return;
    }
    if (items.some(item => item.quantity <= 0 || item.rate <= 0)) {
      toast.error('All items must have valid quantity and rate');
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        clientId: formData.clientId,
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        tax: formData.tax,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        status: formData.status,
      };

      if (invoice) {
        await invoiceApi.update(invoice.id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        await invoiceApi.create(invoiceData);
        toast.success('Invoice created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {invoice ? 'Edit Invoice' : 'Create Invoice'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select 
                value={formData.clientId.toString()} 
                onValueChange={handleClientChange}
                disabled={loadingClients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClients ? "Loading..." : "Select client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName} - {client.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>Items *</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                    min="1"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-28"
                    min="0"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          {/* Tax and Totals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Amount</Label>
              <Input
                id="tax"
                name="tax"
                type="number"
                min="0"
                value={formData.tax}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <div className="p-2 bg-muted rounded-md text-sm font-medium">
                ₹{calculateSubtotal().toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="p-2 bg-primary/10 rounded-md text-sm font-medium text-primary">
                ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any notes (optional)"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
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
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
