import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus, orderApi, invoiceApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Package, User, Calendar, Clock, FileText, Truck, CheckCircle, XCircle, Receipt } from 'lucide-react';
import { useState } from 'react';

interface OrderViewModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSuccess: () => void;
  userRole?: string;
}

// Get status badge color
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'Pending':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Approved':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Dispatched':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Delivered':
      return 'bg-success/10 text-success border-success/20';
    case 'Cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Get next available status transitions
const getNextStatus = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case 'Pending':
      return ['Approved', 'Cancelled'];
    case 'Approved':
      return ['Dispatched', 'Cancelled'];
    case 'Dispatched':
      return ['Delivered', 'Cancelled'];
    default:
      return [];
  }
};

export default function OrderViewModal({ 
  order, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete, 
  onSuccess,
  userRole 
}: OrderViewModalProps) {
  const [updating, setUpdating] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  if (!order) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const response = await orderApi.updateStatus(order.id, newStatus);
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setUpdating(true);
    try {
      const response = await orderApi.cancel(order.id);
      if (response.success) {
        toast.success('Order cancelled successfully');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await invoiceApi.generateFromOrder(order.id);
      if (response.success) {
        toast.success(`Invoice ${response.data?.invoice?.invoiceNumber} generated successfully!`);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const nextStatusOptions = getNextStatus(order.status);
  const canEdit = order.status === 'Pending';
  const isAdminOrManager = ['admin', 'manager', 'sub-admin'].includes(userRole || '');
  const canGenerateInvoice = order.status === 'Approved';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {order.orderNumber.slice(-4)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {order.orderNumber}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} border px-3 py-1`}>
              {order.status}
            </Badge>
          </div>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                </div>
                {order.customerCompany && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium text-foreground">{order.customerCompany}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((product, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3 text-foreground">{product.productName}</td>
                        <td className="p-3 text-right text-foreground">₹{product.price.toLocaleString()}</td>
                        <td className="p-3 text-right text-foreground">{product.quantity}</td>
                        <td className="p-3 text-right font-medium text-foreground">
                          ₹{product.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-semibold">Total Amount</td>
                      <td className="p-3 text-right font-bold text-xl text-primary">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status History
                </h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        {history.status === 'Pending' && <Clock className="w-4 h-4 text-warning" />}
                        {history.status === 'Approved' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        {history.status === 'Dispatched' && <Truck className="w-4 h-4 text-purple-500" />}
                        {history.status === 'Delivered' && <CheckCircle className="w-4 h-4 text-success" />}
                        {history.status === 'Cancelled' && <XCircle className="w-4 h-4 text-destructive" />}
                        <span className="font-medium">{history.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(history.changedAt)}
                        </p>
                        {history.changedByName && (
                          <p className="text-xs text-muted-foreground">
                            by {history.changedByName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h3>
                <p className="text-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            {canEdit && (
              <Button onClick={onEdit}>
                Edit Order
              </Button>
            )}

            {/* Generate Invoice Button - Show for Approved orders */}
            {canGenerateInvoice && (
              <Button 
                variant="outline" 
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
                className="border-primary text-primary hover:bg-primary/10"
              >
                {generatingInvoice && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Receipt className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            )}
            
            {/* Status Update Buttons */}
            {nextStatusOptions.length > 0 && isAdminOrManager && nextStatusOptions.map(status => (
              <Button
                key={status}
                variant={status === 'Cancelled' ? 'destructive' : 'default'}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
              >
                {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {status === 'Approved' && 'Approve Order'}
                {status === 'Dispatched' && 'Mark as Dispatched'}
                {status === 'Delivered' && 'Mark as Delivered'}
                {status === 'Cancelled' && 'Cancel Order'}
              </Button>
            ))}

            {canEdit && (
              <Button variant="destructive" onClick={handleCancel} disabled={updating}>
                {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Cancel Order
              </Button>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
