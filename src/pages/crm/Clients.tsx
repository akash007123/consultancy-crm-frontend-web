import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientsApi, BackendClient } from '@/lib/api';
import { Plus, Search, Building2, Phone, Mail, MapPin, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import ClientFormModal from '@/components/Modal/ClientFormModal';
import ClientViewModal from '@/components/Modal/ClientViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [clients, setClients] = useState<BackendClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected client
  const [selectedClient, setSelectedClient] = useState<BackendClient | null>(null);
  
  // Loading states
  const [deleting, setDeleting] = useState(false);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientsApi.getAll({ search: search || undefined });
      setClients(response.data?.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClients();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handlers
  const handleAddNew = () => {
    setSelectedClient(null);
    setFormModalOpen(true);
  };

  const handleEdit = (client: BackendClient) => {
    setSelectedClient(client);
    setFormModalOpen(true);
  };

  const handleView = (client: BackendClient) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };

  const handleDelete = (client: BackendClient) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;
    
    setDeleting(true);
    try {
      await clientsApi.delete(selectedClient.id);
      toast.success('Client deleted successfully');
      setDeleteModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchClients();
  };

  // Helper to get profile photo URL
  const getProfilePhotoUrl = (photo: string | null | undefined): string | null => {
    if (!photo) return null;
    if (photo.startsWith('data:')) {
      return photo;
    }
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photo}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} total clients</p>
        </div>
        <Button 
          className="gradient-hero text-primary-foreground border-0"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search clients..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-10" 
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No clients found</h3>
          <p className="text-muted-foreground">
            {search ? 'Try a different search term' : 'Get started by adding your first client'}
          </p>
        </div>
      ) : (
        /* Clients Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => {
            const profilePhotoUrl = getProfilePhotoUrl(c.profilePhoto);
            
            return (
              <Card 
                key={c.id} 
                className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Profile Photo or Icon */}
                    {profilePhotoUrl ? (
                      <img 
                        src={profilePhotoUrl} 
                        alt={c.clientName}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    
                    {/* Client Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-foreground truncate">
                        {c.clientName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {c.companyName}
                      </p>
                      {c.industry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.industry}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {c.mobile}
                    </p>
                    {c.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {c.email}
                      </p>
                    )}
                    {c.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {c.address}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(c);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(c);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <ClientFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        client={selectedClient}
        onSuccess={handleFormSuccess}
      />

      {/* View Modal */}
      <ClientViewModal
        client={selectedClient}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Client"
        itemName={selectedClient?.clientName}
        description="Are you sure you want to delete this client? This action cannot be undone and all related data may be affected."
        isDeleting={deleting}
      />
    </div>
  );
}
