import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/lib/api';
import { User, Phone, Mail, Building2, MessageSquare, Calendar } from 'lucide-react';

interface ContactViewModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export default function ContactViewModal({ contact, open, onOpenChange }: ContactViewModalProps) {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Contact Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {contact.firstName[0]}{contact.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {contact.firstName} {contact.lastName}
                </h2>
                {contact.companyName && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {contact.companyName}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge(contact.status)}
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{contact.phone}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{contact.email}</p>
                  </div>
                </div>

                {/* Company */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium text-foreground">{contact.companyName || 'Not provided'}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p className="font-medium text-foreground">
                      {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          {contact.message && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{contact.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Information */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Last Updated: {new Date(contact.updatedAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
