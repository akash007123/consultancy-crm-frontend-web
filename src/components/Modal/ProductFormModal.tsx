import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productApi, Product } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductFormModal({ open, onOpenChange, product, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: 'piece',
    description: '',
    minQuantity: '10',
  });

  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name,
          price: product.price.toString(),
          stock: product.stock.toString(),
          unit: product.unit,
          description: product.description || '',
          minQuantity: product.minQuantity.toString(),
        });
      } else {
        setFormData({
          name: '',
          price: '',
          stock: '',
          unit: 'piece',
          description: '',
          minQuantity: '10',
        });
      }
    }
  }, [open, product]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('Valid stock quantity is required');
      return;
    }
    if (!formData.unit.trim()) {
      toast.error('Unit is required');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit.trim(),
        description: formData.description.trim(),
        minQuantity: parseInt(formData.minQuantity) || 10,
      };

      let response;
      if (isEdit) {
        response = await productApi.update(product.id, productData);
      } else {
        response = await productApi.create(productData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Qty *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              />
            </div>
          </div>

          {/* Unit and Min Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                placeholder="piece, kg, liter..."
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="minQuantity">Min Stock Alert</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="10"
                min="0"
                value={formData.minQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: e.target.value }))}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Product description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
