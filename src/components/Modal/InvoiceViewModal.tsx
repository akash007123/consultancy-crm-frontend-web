import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, CreditCard, Printer, Edit, Trash2 } from 'lucide-react';
import { Invoice } from '@/lib/api';

interface InvoiceViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function InvoiceViewModal({ 
  open, 
  onOpenChange, 
  invoice, 
  onEdit, 
  onDelete 
}: InvoiceViewModalProps) {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-success/10 text-success border-success/20';
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Cancelled':
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoice');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-number { font-size: 24px; font-weight: bold; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; }
            .status-paid { background-color: #dcfce7; color: #166534; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-number">INVOICE</div>
              <div>${invoice.invoiceNumber}</div>
            </div>
            <div>
              <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span>
            </div>
          </div>
          
          <div class="details">
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Company:</strong> ${invoice.clientCompany}</p>
            <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
            ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.rate.toLocaleString()}</td>
                  <td>₹${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹${invoice.amount.toLocaleString()}</p>
            <p>Tax: ₹${invoice.tax.toLocaleString()}</p>
            <p class="total-row">Total: ₹${invoice.total.toLocaleString()}</p>
          </div>

          ${invoice.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
          ${invoice.paymentMethod ? `<div><strong>Payment Method:</strong> ${invoice.paymentMethod}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            Invoice Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{invoice.invoiceNumber}</h2>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>

          {/* Client & Date Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Client</span>
                </div>
                <p className="font-medium text-sm">{invoice.clientName}</p>
                <p className="text-xs text-muted-foreground">{invoice.clientCompany}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Date</span>
                </div>
                <p className="font-medium text-sm">{formatDate(invoice.date)}</p>
                {invoice.dueDate && (
                  <p className="text-xs text-muted-foreground">Due: {formatDate(invoice.dueDate)}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">₹{item.rate.toLocaleString()}</td>
                    <td className="p-3 text-right">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{invoice.tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">₹{invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes and Payment Info */}
          {(invoice.notes || invoice.paymentMethod) && (
            <div className="grid grid-cols-2 gap-4">
              {invoice.notes && (
                <Card className="shadow-sm">
                  <CardContent className="p-3">
                    <span className="text-xs text-muted-foreground">Notes</span>
                    <p className="text-sm">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}
              {invoice.paymentMethod && (
                <Card className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Payment Method</span>
                    </div>
                    <p className="font-medium text-sm">{invoice.paymentMethod}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
            </Button>
            {onEdit && (
              <Button className="gradient-hero" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
