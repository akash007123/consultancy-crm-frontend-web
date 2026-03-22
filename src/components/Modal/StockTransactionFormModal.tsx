import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockTransactionApi, stockApi, StockTransaction, Stock, StockTransactionType } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StockTransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: StockTransaction | null;
  defaultType?: StockTransactionType;
  onSuccess: () => void;
}

export default function StockTransactionFormModal({ 
  open, 
  onOpenChange, 
  transaction, 
  defaultType = 'IN',
  onSuccess 
}: StockTransactionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  
  const [formData, setFormData] = useState({
    stockItemId: 0,
    type: defaultType as StockTransactionType,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    sourceDest: '',
    remarks: '',
  });

  // Fetch stock items on mount or when modal opens
  useEffect(() => {
    if (open) {
      fetchStockItems();
    }
  }, [open]);

  // Set form data when transaction changes or modal opens
  useEffect(() => {
    if (transaction) {
      setFormData({
        stockItemId: transaction.stockItemId,
        type: transaction.type,
        quantity: transaction.quantity,
        date: transaction.date,
        sourceDest: transaction.sourceDest,
        remarks: transaction.remarks || '',
      });
    } else {
      setFormData({
        stockItemId: 0,
        type: defaultType,
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
        sourceDest: '',
        remarks: '',
      });
    }
  }, [transaction, open, defaultType]);

  const fetchStockItems = async () => {
    setLoadingStock(true);
    try {
      const response = await stockApi.getAll();
      if (response.data?.stock) {
        setStockItems(response.data.stock);
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? parseInt(value) || 0 : value 
    }));
  };

  const handleStockChange = (value: string) => {
    setFormData(prev => ({ ...prev, stockItemId: parseInt(value) }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as StockTransactionType }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.stockItemId === 0) {
      toast.error('Please select a stock item');
      return;
    }
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }
    if (!formData.sourceDest.trim()) {
      toast.error('Source/Destination is required');
      return;
    }

    setLoading(true);
    try {
      if (transaction) {
        // Update existing transaction
        await stockTransactionApi.update(transaction.id, {
          stockItemId: formData.stockItemId,
          type: formData.type,
          quantity: formData.quantity,
          date: formData.date,
          sourceDest: formData.sourceDest,
          remarks: formData.remarks || undefined,
        });
        toast.success('Stock transaction updated successfully');
      } else {
        // Create new transaction
        await stockTransactionApi.create({
          stockItemId: formData.stockItemId,
          type: formData.type,
          quantity: formData.quantity,
          date: formData.date,
          sourceDest: formData.sourceDest,
          remarks: formData.remarks || undefined,
        });
        toast.success('Stock transaction created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving stock transaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save stock transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {transaction ? 'Edit Stock Transaction' : `Add Stock ${formData.type}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock Item */}
          <div className="space-y-2">
            <Label>Stock Item *</Label>
            <Select 
              value={formData.stockItemId.toString()} 
              onValueChange={handleStockChange}
              disabled={loadingStock}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingStock ? "Loading..." : "Select stock item"} />
              </SelectTrigger>
              <SelectContent>
                {stockItems.map(item => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name} ({item.quantity} {item.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Stock IN</SelectItem>
                <SelectItem value="OUT">Stock OUT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
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

          {/* Source/Destination */}
          <div className="space-y-2">
            <Label htmlFor="sourceDest">
              {formData.type === 'IN' ? 'Source *' : 'Destination *'}
            </Label>
            <Input
              id="sourceDest"
              name="sourceDest"
              placeholder={formData.type === 'IN' ? 'e.g., Head Office, Vendor' : 'e.g., North Distributor'}
              value={formData.sourceDest}
              onChange={handleChange}
              required
            />
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              name="remarks"
              placeholder="Add any notes (optional)"
              value={formData.remarks}
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
              {transaction ? 'Update Transaction' : `Add ${formData.type === 'IN' ? 'Stock IN' : 'Stock OUT'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
