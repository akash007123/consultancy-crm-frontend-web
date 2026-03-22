import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ArrowUpDown, MapPin, Calendar, FileText } from 'lucide-react';
import { StockTransaction } from '@/lib/api';

interface StockTransactionViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: StockTransaction | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StockTransactionViewModal({ 
  open, 
  onOpenChange, 
  transaction, 
  onEdit, 
  onDelete 
}: StockTransactionViewModalProps) {
  if (!transaction) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-success/10 text-success border-success/20';
      case 'OUT':
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
            Stock Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stock Item and Type */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{transaction.stockItemName}</h2>
            </div>
            <Badge className={getTypeColor(transaction.type)}>
              {transaction.type === 'IN' ? 'Stock IN' : 'Stock OUT'}
            </Badge>
          </div>

          {/* Remarks */}
          {transaction.remarks && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Remarks</span>
              </div>
              <p className="text-sm">{transaction.remarks}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Quantity</span>
                </div>
                <p className="font-medium text-sm">{transaction.quantity}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {transaction.type === 'IN' ? 'Source' : 'Destination'}
                  </span>
                </div>
                <p className="font-medium text-sm">{transaction.sourceDest}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm col-span-2">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Date</span>
                </div>
                <p className="font-medium text-sm">{formatDate(transaction.date)}</p>
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
                Edit Transaction
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
