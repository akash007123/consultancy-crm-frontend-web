import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { contactApi, Contact } from '@/lib/api';
import { Search, Phone, Mail, Building2, MessageSquare, Eye, Trash2, Loader2, User } from 'lucide-react';
import ContactViewModal from '@/components/Modal/ContactViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { toast } from 'sonner';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected contact
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Loading states
  const [deleting, setDeleting] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await contactApi.getAll({ 
        search: search || undefined,
        status: statusFilter || undefined 
      });
      setContacts(response.data?.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // Handlers
  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setViewModalOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;
    
    setDeleting(true);
    try {
      await contactApi.delete(selectedContact.id);
      toast.success('Contact deleted successfully');
      setDeleteModalOpen(false);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'contacted':
        return <Badge variant="default" className="bg-yellow-500">Contacted</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-orange-500">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="default" className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Contact Submissions</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} total contacts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No contacts found</h3>
          <p className="text-muted-foreground">
            {search || statusFilter ? 'Try a different search term' : 'No contact form submissions yet'}
          </p>
        </div>
      ) : (
        /* Contacts Table */
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {contact.firstName} {contact.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-2 text-foreground">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {contact.email}
                      </p>
                      <p className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {contact.companyName ? (
                      <p className="text-sm flex items-center gap-2 text-foreground">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {contact.companyName}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(contact)}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <ContactViewModal 
        contact={selectedContact}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        itemName={selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : undefined}
        isDeleting={deleting}
      />
    </div>
  );
}
