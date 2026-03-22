import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { stockTransactionApi, StockTransaction, StockTransactionType } from '@/lib/api';
import { toast } from 'sonner';
import StockTransactionFormModal from '@/components/Modal/StockTransactionFormModal';
import StockTransactionViewModal from '@/components/Modal/StockTransactionViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';

export default function MasterStockPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<StockTransactionType | 'all'>('all');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<StockTransactionType>('IN');
  
  // Selected item states
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockTransactionApi.getAll();
      if (response.data?.transactions) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load stock transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions by type
  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  // Handlers
  const handleAddStockIn = () => {
    setSelectedTransaction(null);
    setDefaultType('IN');
    setFormModalOpen(true);
  };

  const handleAddStockOut = () => {
    setSelectedTransaction(null);
    setDefaultType('OUT');
    setFormModalOpen(true);
  };

  const handleEdit = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
  };

  const handleDelete = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    
    setIsDeleting(true);
    try {
      await stockTransactionApi.delete(selectedTransaction.id);
      toast.success('Stock transaction deleted successfully');
      setDeleteModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete stock transaction');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Master Distributor Stock</h1>
            <p className="text-sm text-muted-foreground">Stock IN & OUT management</p>
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Master Distributor Stock</h1>
          <p className="text-sm text-muted-foreground">Stock IN & OUT management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddStockIn} className="gradient-hero text-primary-foreground border-0">
            <Plus className="w-4 h-4 mr-2" /> Stock IN
          </Button>
          <Button onClick={handleAddStockOut} variant="outline">
            <ArrowUpDown className="w-4 h-4 mr-2" /> Stock OUT
          </Button>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        <Button 
          variant={filterType === 'IN' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('IN')}
          className={filterType === 'IN' ? 'bg-success hover:bg-success/90' : ''}
        >
          Stock IN
        </Button>
        <Button 
          variant={filterType === 'OUT' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('OUT')}
          className={filterType === 'OUT' ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          Stock OUT
        </Button>
      </div>

      {filteredTransactions.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No stock transactions found</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={handleAddStockIn} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Add Stock IN
              </Button>
              <Button onClick={handleAddStockOut} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Add Stock OUT
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Qty</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Source/Dest</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(e => (
                    <tr 
                      key={e.id} 
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleView(e)}
                    >
                      <td className="p-4 font-medium text-foreground flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" /> {e.stockItemName}
                      </td>
                      <td className="p-4">
                        <Badge className={e.type === 'IN' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                          {e.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{e.quantity}</td>
                      <td className="p-4 text-muted-foreground">{e.sourceDest}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(e.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      <StockTransactionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        transaction={selectedTransaction}
        defaultType={defaultType}
        onSuccess={fetchTransactions}
      />

      {/* View Modal */}
      <StockTransactionViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        transaction={selectedTransaction || null}
        onEdit={() => selectedTransaction && handleEdit(selectedTransaction)}
        onDelete={() => selectedTransaction && handleDelete(selectedTransaction)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Stock Transaction"
        description="Are you sure you want to delete this stock transaction? This will also reverse the stock quantity changes."
        itemName={`${selectedTransaction?.type} - ${selectedTransaction?.stockItemName}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
