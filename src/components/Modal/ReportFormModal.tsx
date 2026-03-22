import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportApi, SavedReport, ReportType } from '@/lib/api';
import { toast } from 'sonner';

interface ReportFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: SavedReport | null;
  onSuccess: () => void;
}

const reportTypes: { value: ReportType; label: string }[] = [
  { value: 'employee', label: 'Employee Report' },
  { value: 'visit', label: 'Visit Report & DSR' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'expense', label: 'Expense Report' },
  { value: 'stock', label: 'Stock Report' },
  { value: 'sales', label: 'Sales Report' },
  { value: 'invoice', label: 'Invoice Report' },
];

export default function ReportFormModal({ open, onOpenChange, report, onSuccess }: ReportFormModalProps) {
  const [name, setName] = useState('');
  const [reportType, setReportType] = useState<ReportType>('employee');
  const [filters, setFilters] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setName(report.name);
      setReportType(report.reportType);
      setFilters(report.filters ? JSON.stringify(report.filters, null, 2) : '');
    } else {
      setName('');
      setReportType('employee');
      setFilters('');
    }
  }, [report, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Report name is required');
      return;
    }

    setSaving(true);
    try {
      let parsedFilters = undefined;
      if (filters.trim()) {
        try {
          parsedFilters = JSON.parse(filters);
        } catch {
          toast.error('Invalid JSON format for filters');
          setSaving(false);
          return;
        }
      }

      if (report) {
        await reportApi.update(report.id, {
          name,
          reportType,
          filters: parsedFilters,
        });
        toast.success('Report updated successfully');
      } else {
        await reportApi.create({
          name,
          reportType,
          filters: parsedFilters,
        });
        toast.success('Report created successfully');
      }
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{report ? 'Edit Report' : 'Create New Report'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Sales Report"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filters">Filters (JSON - Optional)</Label>
            <textarea
              id="filters"
              value={filters}
              onChange={(e) => setFilters(e.target.value)}
              placeholder='{"month": "2026-03", "status": "active"}'
              className="mt-1 w-full min-h-[80px] p-2 border rounded-md text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter filter criteria as JSON object
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gradient-hero">
              {saving ? 'Saving...' : report ? 'Update Report' : 'Create Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
