import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Package, Loader2, Search } from 'lucide-react';
import { productApi, Product } from '@/lib/api';
import { toast } from 'sonner';
import ProductFormModal from '@/components/Modal/ProductFormModal';
import ProductViewModal from '@/components/Modal/ProductViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productApi.getAll({
        search: search || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      if (response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleAddNew = () => {
    setSelectedProduct(null);
    setFormModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    try {
      await productApi.delete(selectedProduct.id);
      toast.success('Product deleted successfully');
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">Loading products...</p>
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Button onClick={handleAddNew} className="gradient-hero text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'In Stock' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('In Stock')}
            className={filterStatus === 'In Stock' ? 'bg-success hover:bg-success/90' : ''}
          >
            In Stock
          </Button>
          <Button 
            variant={filterStatus === 'Low Stock' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('Low Stock')}
            className={filterStatus === 'Low Stock' ? 'bg-warning hover:bg-warning/90' : ''}
          >
            Low Stock
          </Button>
          <Button 
            variant={filterStatus === 'Out of Stock' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('Out of Stock')}
            className={filterStatus === 'Out of Stock' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            Out of Stock
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No products found</p>
            <Button onClick={handleAddNew} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Add First Product
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Unit</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr 
                      key={product.id} 
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleView(product)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{product.unit}</td>
                      <td className="p-4 text-right font-medium text-foreground">₹{product.price.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-foreground">{product.stock}</span>
                        <span className="text-muted-foreground text-xs ml-1">{product.unit}s</span>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
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
      <ProductFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />

      {/* View Modal */}
      <ProductViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        product={selectedProduct || null}
        onEdit={() => selectedProduct && handleEdit(selectedProduct)}
        onDelete={() => selectedProduct && handleDelete(selectedProduct)}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        itemName={selectedProduct?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
