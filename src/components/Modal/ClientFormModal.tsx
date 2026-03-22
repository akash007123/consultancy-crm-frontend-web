import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clientsApi, BackendClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: BackendClient | null;
  onSuccess: () => void;
}

export default function ClientFormModal({ open, onOpenChange, client, onSuccess }: ClientFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    mobile: '',
    email: '',
    industry: '',
    address: '',
    profilePhoto: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        clientName: client.clientName || '',
        companyName: client.companyName || '',
        mobile: client.mobile || '',
        email: client.email || '',
        industry: client.industry || '',
        address: client.address || '',
        profilePhoto: client.profilePhoto || '',
      });
      setProfilePreview(client.profilePhoto);
    } else {
      setFormData({
        clientName: '',
        companyName: '',
        mobile: '',
        email: '',
        industry: '',
        address: '',
        profilePhoto: '',
      });
      setProfilePreview(null);
    }
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePreview(base64);
        setFormData(prev => ({ ...prev, profilePhoto: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePhoto = () => {
    setProfilePreview(null);
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName.trim()) {
      toast.error('Client name is required');
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }

    setLoading(true);
    try {
      if (client) {
        // Update existing client
        await clientsApi.update(client.id, {
          clientName: formData.clientName,
          companyName: formData.companyName,
          mobile: formData.mobile,
          email: formData.email || undefined,
          industry: formData.industry || undefined,
          address: formData.address || undefined,
          profilePhoto: formData.profilePhoto || undefined,
        });
        toast.success('Client updated successfully');
      } else {
        // Create new client
        await clientsApi.create({
          clientName: formData.clientName,
          companyName: formData.companyName,
          mobile: formData.mobile,
          email: formData.email || undefined,
          industry: formData.industry || undefined,
          address: formData.address || undefined,
          profilePhoto: formData.profilePhoto || undefined,
        });
        toast.success('Client created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {profilePreview ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                  <img 
                    src={profilePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-photo"
            />
            <Label 
              htmlFor="profile-photo" 
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              {profilePreview ? 'Change Photo' : 'Upload Photo (Optional)'}
            </Label>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="Enter industry"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gradient-hero"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {client ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
