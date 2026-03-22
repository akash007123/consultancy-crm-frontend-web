import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { stockApi, Stock } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StockFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock | null;
  onSuccess: () => void;
}

export default function StockFormModal({ open, onOpenChange, stock, onSuccess }: StockFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'pcs',
    description: '',
    minQuantity: 10,
  });

  // Set form data when stock changes or modal opens
  useEffect(() => {
    if (stock) {
      setFormData({
        name: stock.name || '',
        quantity: stock.quantity || 0,
        unit: stock.unit || 'pcs',
        description: stock.description || '',
        minQuantity: stock.minQuantity || 10,
      });
    } else {
      setFormData({
        name: '',
        quantity: 0,
        unit: 'pcs',
        description: '',
        minQuantity: 10,
      });
    }
  }, [stock, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'minQuantity' ? parseInt(value) || 0 : value 
    }));
  };

  const handleUnitChange = (value: string) => {
    setFormData(prev => ({ ...prev, unit: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.quantity < 0) {
      toast.error('Quantity must be a non-negative number');
      return;
    }
    if (!formData.unit.trim()) {
      toast.error('Unit is required');
      return;
    }

    setLoading(true);
    try {
      if (stock) {
        // Update existing stock
        await stockApi.update(stock.id, {
          name: formData.name,
          quantity: formData.quantity,
          unit: formData.unit,
          description: formData.description || undefined,
          minQuantity: formData.minQuantity,
        });
        toast.success('Stock item updated successfully');
      } else {
        // Create new stock
        await stockApi.create({
          name: formData.name,
          quantity: formData.quantity,
          unit: formData.unit,
          description: formData.description || undefined,
          minQuantity: formData.minQuantity,
        });
        toast.success('Stock item created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save stock item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {stock ? 'Edit Stock Item' : 'Add New Stock Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter stock item name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="e.g., pcs, kits"
                value={formData.unit}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Minimum Quantity */}
          <div className="space-y-2">
            <Label htmlFor="minQuantity">Minimum Quantity (for low stock alert)</Label>
            <Input
              id="minQuantity"
              name="minQuantity"
              type="number"
              min="0"
              placeholder="10"
              value={formData.minQuantity}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
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
              {stock ? 'Update Stock' : 'Create Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
