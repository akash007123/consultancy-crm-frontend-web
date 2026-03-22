import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Edit, Trash2, FileSpreadsheet, File } from 'lucide-react';
import { SavedReport, ReportType, reportApi } from '@/lib/api';
import { toast } from 'sonner';

interface ReportViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: SavedReport | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const reportTypeLabels: Record<ReportType, string> = {
  employee: 'Employee Report',
  visit: 'Visit Report & DSR',
  attendance: 'Attendance Report',
  expense: 'Expense Report',
  stock: 'Stock Report',
  sales: 'Sales Report',
  invoice: 'Invoice Report',
};

export default function ReportViewModal({ 
  open, 
  onOpenChange, 
  report, 
  onEdit, 
  onDelete 
}: ReportViewModalProps) {
  if (!report) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportExcel = async () => {
    try {
      await reportApi.exportToExcel(report);
      toast.success('Report exported to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportApi.exportToPDF(report);
      toast.success('Report exported to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            Report Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{report.name}</h2>
            </div>
          </div>

          {/* Report Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block">Report Type</span>
                <p className="font-medium text-sm">{reportTypeLabels[report.reportType]}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Created</span>
                </div>
                <p className="font-medium text-sm">{formatDate(report.createdAt)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          {report.filters && Object.keys(report.filters).length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block mb-2">Filters</span>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(report.filters, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Export Report</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExcel} className="flex-1">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="flex-1">
                <File className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
            {onEdit && (
              <Button className="gradient-hero" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit Report
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
