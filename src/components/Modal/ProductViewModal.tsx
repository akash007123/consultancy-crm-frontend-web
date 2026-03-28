import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product, productApi } from '@/lib/api';
import { toast } from 'sonner';
import { Package, DollarSign, Box, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ProductViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSuccess: () => void;
}

export default function ProductViewModal({ 
  product, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete, 
  onSuccess 
}: ProductViewModalProps) {
  const [toggling, setToggling] = useState(false);

  if (!product) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-success/10 text-success border-success/20';
      case 'Low Stock':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Out of Stock':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const response = await productApi.toggle(product.id);
      if (response.success) {
        toast.success(response.message);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to toggle product status');
      }
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle product status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {product.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {product.unit}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(product.status)} border px-3 py-1`}>
              {product.status}
            </Badge>
          </div>

          {/* Details Card */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold text-foreground">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    product.stock === 0 ? 'bg-destructive/10' : 
                    product.stock <= product.minQuantity ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    <Box className={`w-5 h-5 ${
                      product.stock === 0 ? 'text-destructive' : 
                      product.stock <= product.minQuantity ? 'text-warning' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-semibold text-foreground">{product.stock} {product.unit}s</p>
                  </div>
                </div>

                {/* Min Quantity Alert */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Stock Alert</p>
                    <p className="font-semibold text-foreground">{product.minQuantity} {product.unit}s</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold text-foreground">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </h3>
                <p className="text-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={onEdit}>
              Edit Product
            </Button>
            <Button 
              variant={product.status === 'Out of Stock' ? 'default' : 'outline'}
              onClick={handleToggleStatus}
              disabled={toggling}
            >
              {product.status === 'Out of Stock' ? 'Mark as In Stock' : 'Toggle Status'}
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Product
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
