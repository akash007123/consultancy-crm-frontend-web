import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { invoiceApi, Invoice, InvoiceStatus } from '@/lib/api';
import { toast } from 'sonner';
import InvoiceFormModal from '@/components/Modal/InvoiceFormModal';
import InvoiceViewModal from '@/components/Modal/InvoiceViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await invoiceApi.getAll();
      if (response.data?.invoices) {
        setInvoices(response.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Filter invoices by status
  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filterStatus);

  // Handlers
  const handleAddNew = () => {
    setSelectedInvoice(null);
    setFormModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    
    setIsDeleting(true);
    try {
      await invoiceApi.delete(selectedInvoice.id);
      toast.success('Invoice deleted successfully');
      setDeleteModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete invoice');
    } finally {
      setIsDeleting(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">{filteredInvoices.length} invoices</p>
        </div>
        <Button onClick={handleAddNew} className="gradient-hero text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All
        </Button>
        <Button 
          variant={filterStatus === 'Paid' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Paid')}
          className={filterStatus === 'Paid' ? 'bg-success hover:bg-success/90' : ''}
        >
          Paid
        </Button>
        <Button 
          variant={filterStatus === 'Pending' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Pending')}
          className={filterStatus === 'Pending' ? 'bg-warning hover:bg-warning/90' : ''}
        >
          Pending
        </Button>
        <Button 
          variant={filterStatus === 'Cancelled' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Cancelled')}
          className={filterStatus === 'Cancelled' ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          Cancelled
        </Button>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No invoices found</p>
            <Button onClick={handleAddNew} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Create First Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Invoice #</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">GST</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => (
                    <tr 
                      key={inv.id} 
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleView(inv)}
                    >
                      <td className="p-4 font-medium text-foreground">{inv.invoiceNumber}</td>
                      <td className="p-4 text-foreground">{inv.clientName}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{formatDate(inv.date)}</td>
                      <td className="p-4 text-muted-foreground">₹{inv.amount.toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">₹{inv.tax.toLocaleString()}</td>
                      <td className="p-4 font-medium text-foreground">₹{inv.total.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(inv.status)}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(inv);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      <InvoiceFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />

      {/* View Modal */}
      <InvoiceViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        invoice={selectedInvoice || null}
        onEdit={() => selectedInvoice && handleEdit(selectedInvoice)}
        onDelete={() => selectedInvoice && handleDelete(selectedInvoice)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        itemName={selectedInvoice?.invoiceNumber}
        isDeleting={isDeleting}
      />
    </div>
  );
}
