import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderApi, Order, Product, BackendClient, clientsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Search, Package } from 'lucide-react';

interface OrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSuccess: () => void;
}

// Client API is imported from api.ts

export default function OrderFormModal({ open, onOpenChange, order, onSuccess }: OrderFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clients, setClients] = useState<BackendClient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    notes: '',
    items: [] as { productId: number; productName: string; quantity: number; price: number; stock: number }[],
  });

  const isEdit = !!order;

  // Fetch clients
  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const response = await clientsApi.getAll();
      if (response.success && response.data?.clients) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (search?: string) => {
    setProductsLoading(true);
    try {
      const response = await orderApi.getProducts(search);
      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchProducts();
      
      if (order) {
        setFormData({
          customerId: order.customerId.toString(),
          notes: order.notes || '',
          items: order.products.map(p => ({
            productId: p.productId,
            productName: p.productName,
            quantity: p.quantity,
            price: p.price,
            stock: 0,
          })),
        });
      } else {
        setFormData({
          customerId: '',
          notes: '',
          items: [],
        });
      }
    }
  }, [open, order, fetchClients, fetchProducts]);

  // Calculate total
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add product to order
  const addProduct = (product: Product) => {
    const existing = formData.items.find(item => item.productId === product.id);
    if (existing) {
      toast.warning('Product already added');
      return;
    }
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        stock: product.stock,
      }],
    }));
    setShowProductDropdown(false);
    setProductSearch('');
  };

  // Remove product from order
  const removeProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId),
    }));
  };

  // Update item quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const item = formData.items.find(i => i.productId === productId);
    if (item && quantity > item.stock) {
      toast.error(`Maximum available stock is ${item.stock}`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: parseInt(formData.customerId),
        products: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: formData.notes,
      };

      let response;
      if (isEdit) {
        response = await orderApi.update(order.id, orderData);
      } else {
        response = await orderApi.create(orderData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Order updated successfully' : 'Order created successfully');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {isEdit ? 'Edit Order' : 'Create New Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
              disabled={clientsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={clientsLoading ? "Loading customers..." : "Select a customer"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.clientName} {client.companyName && `(${client.companyName})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div>
            <Label>Products</Label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Product Dropdown */}
              {showProductDropdown && productSearch && (
                <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                  <CardContent className="p-2">
                    {productsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="ml-2">Loading products...</span>
                      </div>
                    ) : products.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">No products found</p>
                    ) : (
                      products.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{product.price.toLocaleString()} • Stock: {product.stock}
                              </p>
                            </div>
                          </div>
                          <Badge className={product.stock === 0 ? 'bg-destructive text-white' : product.stock <= product.minQuantity ? 'bg-warning text-black' : 'bg-success text-white'}>
                            {product.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Order Items */}
          {formData.items.length > 0 && (
            <div>
              <Label>Order Items</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {formData.items.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price.toLocaleString()} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min={1}
                              max={item.stock}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(item.productId)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
