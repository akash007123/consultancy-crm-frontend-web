import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BackendClient } from '@/lib/api';
import { Building2, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';

interface ClientViewModalProps {
  client: BackendClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to get profile photo URL
const getProfilePhotoUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  // If it's a data URL (base64 image), use it as is
  if (photo.startsWith('data:')) {
    return photo;
  }
  // If it's already a full URL, use it as is
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  // Otherwise, prepend the API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${photo}`;
};

export default function ClientViewModal({ client, open, onOpenChange }: ClientViewModalProps) {
  if (!client) return null;

  const profilePhotoUrl = getProfilePhotoUrl(client.profilePhoto);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Client Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt={client.clientName} 
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">
                {client.clientName}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {client.companyName}
              </p>
              {client.industry && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {client.industry}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium text-foreground">{client.mobile}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {client.email || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          {client.address && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-foreground">Address</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground whitespace-pre-wrap">{client.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Information */}
          <div className="text-sm text-muted-foreground">
            <p>Created: {new Date(client.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p>Last Updated: {new Date(client.updatedAt).toLocaleDateString('en-IN', {
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
