import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { candidateApi, Candidate, CandidateStatus } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CandidateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS: CandidateStatus[] = [
  'Shortlisted',
  'Pending',
  'Interview Scheduled',
  'Applied',
  'Offer Sent',
  'Accepted Offer'
];

export default function CandidateFormModal({ open, onOpenChange, candidate, onSuccess }: CandidateFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    status: 'Pending' as CandidateStatus,
    email: '',
    phone: '',
    notes: '',
  });

  // Set form data when candidate changes or modal opens
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        position: candidate.position || '',
        status: candidate.status || 'Pending',
        email: candidate.email || '',
        phone: candidate.phone || '',
        notes: candidate.notes || '',
      });
    } else {
      setFormData({
        name: '',
        position: '',
        status: 'Pending',
        email: '',
        phone: '',
        notes: '',
      });
    }
  }, [candidate, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as CandidateStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.position.trim()) {
      toast.error('Position is required');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      console.log('Saving candidate, data:', formData);
      
      if (candidate) {
        // Update existing candidate
        response = await candidateApi.update(candidate.id, formData);
        toast.success('Candidate updated successfully');
      } else {
        // Create new candidate
        response = await candidateApi.create(formData);
        console.log('Create response:', response);
        toast.success('Candidate created successfully');
      }
      
      if (response.success) {
        console.log('Calling onSuccess callback');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidate ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter candidate name"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter position applied for"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gradient-hero">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {candidate ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
