import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, FileText, AlertTriangle, Boxes } from 'lucide-react';
import { Stock } from '@/lib/api';

interface StockViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StockViewModal({ open, onOpenChange, stock, onEdit, onDelete }: StockViewModalProps) {
  if (!stock) return null;

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            Stock Item Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name and Status */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold">{stock.name}</h2>
            <Badge className={getStatusColor(stock.status)}>
              {stock.status}
            </Badge>
          </div>

          {/* Description */}
          {stock.description && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Description</span>
              </div>
              <p className="text-sm">{stock.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Current Quantity</span>
                </div>
                <p className="font-medium text-sm">{stock.quantity} {stock.unit}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Unit</span>
                </div>
                <p className="font-medium text-sm">{stock.unit}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Minimum Quantity</span>
                </div>
                <p className="font-medium text-sm">{stock.minQuantity} {stock.unit}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Created</span>
                </div>
                <p className="font-medium text-sm">{formatDate(stock.createdAt)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onDelete && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button 
                className="gradient-hero"
                onClick={onEdit}
              >
                Edit Stock
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
