import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Loader2 } from 'lucide-react';
import { stockApi, Stock } from '@/lib/api';
import { toast } from 'sonner';
import StockFormModal from '@/components/Modal/StockFormModal';
import StockViewModal from '@/components/Modal/StockViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';

export default function StockPage() {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockApi.getAll();
      if (response.data?.stock) {
        setStockItems(response.data.stock);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to load stock items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  // Handlers
  const handleAddNew = () => {
    setSelectedStock(null);
    setFormModalOpen(true);
  };

  const handleEdit = (stock: Stock) => {
    setSelectedStock(stock);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (stock: Stock) => {
    setSelectedStock(stock);
    setViewModalOpen(true);
  };

  const handleDelete = (stock: Stock) => {
    setSelectedStock(stock);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedStock) return;
    
    setIsDeleting(true);
    try {
      await stockApi.delete(selectedStock.id);
      toast.success('Stock item deleted successfully');
      setDeleteModalOpen(false);
      fetchStock();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete stock item');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'text-success';
      case 'Low Stock':
        return 'text-warning';
      case 'Out of Stock':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Stock Management</h1>
          <p className="text-sm text-muted-foreground">Distributor and master stock overview</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Stock Management</h1>
          <p className="text-sm text-muted-foreground">Distributor and master stock overview</p>
        </div>
        <Button onClick={handleAddNew} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {stockItems.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No stock items found</p>
            <Button onClick={handleAddNew} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Stock Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {stockItems.map((s) => (
            <Card 
              key={s.id} 
              className="shadow-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleView(s)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.quantity} {s.unit}</p>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(s.status)}`}>
                  {s.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <StockFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        stock={selectedStock}
        onSuccess={fetchStock}
      />

      {/* View Modal */}
      <StockViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        stock={selectedStock || null}
        onEdit={() => selectedStock && handleEdit(selectedStock)}
        onDelete={() => selectedStock && handleDelete(selectedStock)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Stock Item"
        description="Are you sure you want to delete this stock item? This action cannot be undone."
        itemName={selectedStock?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
