import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, ShoppingCart } from 'lucide-react';
import { orderApi, Order, OrderStatus } from '@/lib/api';
import { toast } from 'sonner';
import OrderFormModal from '@/components/Modal/OrderFormModal';
import OrderViewModal from '@/components/Modal/OrderViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { useAuthStore } from '@/store/authStore';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderApi.getAll();
      if (response.data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Handlers
  const handleAddNew = () => {
    setSelectedOrder(null);
    setFormModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedOrder) return;
    
    setIsDeleting(true);
    try {
      await orderApi.cancel(selectedOrder.id);
      toast.success('Order cancelled successfully');
      setDeleteModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
            <p className="text-sm text-muted-foreground">Loading orders...</p>
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground">{filteredOrders.length} orders</p>
        </div>
        <Button onClick={handleAddNew} className="gradient-hero text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" /> Create Order
        </Button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All
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
          variant={filterStatus === 'Approved' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Approved')}
          className={filterStatus === 'Approved' ? 'bg-blue-500 hover:bg-blue-500/90' : ''}
        >
          Approved
        </Button>
        <Button 
          variant={filterStatus === 'Dispatched' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Dispatched')}
          className={filterStatus === 'Dispatched' ? 'bg-purple-500 hover:bg-purple-500/90' : ''}
        >
          Dispatched
        </Button>
        <Button 
          variant={filterStatus === 'Delivered' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('Delivered')}
          className={filterStatus === 'Delivered' ? 'bg-success hover:bg-success/90' : ''}
        >
          Delivered
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

      {filteredOrders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No orders found</p>
            <Button onClick={handleAddNew} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Create First Order
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Order #</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.id} 
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleView(order)}
                    >
                      <td className="p-4 font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> {order.orderNumber}
                      </td>
                      <td className="p-4 text-foreground">
                        <div>{order.customerName}</div>
                        {order.customerCompany && (
                          <div className="text-xs text-muted-foreground">{order.customerCompany}</div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{formatDate(order.createdAt)}</td>
                      <td className="p-4 font-medium text-foreground">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
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
      <OrderFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />

      {/* View Modal */}
      <OrderViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        order={selectedOrder || null}
        onEdit={() => selectedOrder && handleEdit(selectedOrder)}
        onDelete={() => selectedOrder && handleDelete(selectedOrder)}
        onSuccess={fetchOrders}
        userRole={user?.role}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone and will restore the product stock."
        itemName={selectedOrder?.orderNumber}
        isDeleting={isDeleting}
      />
    </div>
  );
}
