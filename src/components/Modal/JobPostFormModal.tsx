import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobPostApi, JobPost, JobType, JobStatus } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface JobPostFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPost: JobPost | null;
  onSuccess: () => void;
}

const JOB_TYPE_OPTIONS: JobType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
];

const JOB_STATUS_OPTIONS: JobStatus[] = [
  'Active',
  'Closed'
];

const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0-1 Years',
  '1-2 Years',
  '2-3 Years',
  '3-5 Years',
  '5-7 Years',
  '7-10 Years',
  '10+ Years'
];

export default function JobPostFormModal({ open, onOpenChange, jobPost, onSuccess }: JobPostFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Full-time' as JobType,
    location: '',
    experience: 'Fresher',
    description: '',
    position: 1,
    status: 'Active' as JobStatus
  });

  // Set form data when jobPost changes or modal opens
  useEffect(() => {
    if (jobPost) {
      setFormData({
        title: jobPost.title || '',
        date: jobPost.date || new Date().toISOString().split('T')[0],
        type: jobPost.type || 'Full-time',
        location: jobPost.location || '',
        experience: jobPost.experience || 'Fresher',
        description: jobPost.description || '',
        position: jobPost.position || 1,
        status: jobPost.status || 'Active'
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Full-time',
        location: '',
        experience: 'Fresher',
        description: '',
        position: 1,
        status: 'Active'
      });
    }
  }, [jobPost, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'position' ? parseInt(value) || 0 : value 
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as JobType }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as JobStatus }));
  };

  const handleExperienceChange = (value: string) => {
    setFormData(prev => ({ ...prev, experience: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.position < 1) {
      toast.error('Position must be at least 1');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      console.log('Saving job post, data:', formData);
      
      if (jobPost) {
        // Update existing job post
        response = await jobPostApi.update(jobPost.id, formData);
        toast.success('Job post updated successfully');
      } else {
        // Create new job post
        response = await jobPostApi.create(formData);
        console.log('Create response:', response);
        toast.success('Job post created successfully');
      }
      
      if (response.success) {
        console.log('Calling onSuccess callback');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving job post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save job post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{jobPost ? 'Edit Job Post' : 'Add New Job Post'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>

          {/* Date and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location and Experience Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, India or Remote"
                required
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience *</Label>
              <Select value={formData.experience} onValueChange={handleExperienceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map(exp => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Number of Positions *</Label>
            <Input
              id="position"
              name="position"
              type="number"
              min="1"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g. 3"
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
                {JOB_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter job description, responsibilities, requirements, etc."
              rows={5}
              required
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
              {jobPost ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
