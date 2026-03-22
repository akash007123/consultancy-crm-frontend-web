import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, BarChart3, Users, MapPin, Clock, Receipt, Package, ShoppingCart } from 'lucide-react';
import { reportApi, SavedReport, ReportType, reportApi as exportApi } from '@/lib/api';
import { toast } from 'sonner';
import ReportFormModal from '@/components/Modal/ReportFormModal';
import ReportViewModal from '@/components/Modal/ReportViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';

// Report type icons and labels
const reportTypes = [
  { type: 'employee' as ReportType, title: 'Employee Report', icon: Users, description: 'Complete employee data with roles and departments' },
  { type: 'visit' as ReportType, title: 'Visit Report & DSR', icon: MapPin, description: 'Daily sales report with visit details and geo data' },
  { type: 'attendance' as ReportType, title: 'Attendance Report', icon: Clock, description: 'Daily/monthly attendance with late entries' },
  { type: 'expense' as ReportType, title: 'Expense Report', icon: Receipt, description: 'Expense breakdown with approval status' },
  { type: 'stock' as ReportType, title: 'Stock Report', icon: Package, description: 'Distributor and master stock levels' },
  { type: 'sales' as ReportType, title: 'Sales Report', icon: ShoppingCart, description: 'Order and invoice analytics' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportApi.getAll(filterType === 'all' ? undefined : filterType);
      if (response.data?.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter reports by type
  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.reportType === filterType);

  // Handlers
  const handleAddNew = () => {
    setSelectedReport(null);
    setFormModalOpen(true);
  };

  const handleEdit = (report: SavedReport) => {
    setSelectedReport(report);
    setFormModalOpen(true);
    setViewModalOpen(false);
  };

  const handleView = (report: SavedReport) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const handleDelete = (report: SavedReport) => {
    setSelectedReport(report);
    setDeleteModalOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;
    
    setIsDeleting(true);
    try {
      await reportApi.delete(selectedReport.id);
      toast.success('Report deleted successfully');
      setDeleteModalOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = async (report: SavedReport) => {
    try {
      await exportApi.exportToExcel(report);
      toast.success('Report exported to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async (report: SavedReport) => {
    try {
      await exportApi.exportToPDF(report);
      toast.success('Report exported to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getReportTypeInfo = (type: ReportType) => {
    return reportTypes.find(r => r.type === type) || { title: type, icon: BarChart3, description: '' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Loading reports...</p>
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate, save and export reports</p>
        </div>
        <Button onClick={handleAddNew} className="gradient-hero text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" /> Create Report
        </Button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        {reportTypes.map(rt => (
          <Button 
            key={rt.type}
            variant={filterType === rt.type ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType(rt.type)}
          >
            {rt.title}
          </Button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No saved reports found</p>
            <div className="flex justify-center gap-2">
              <Button onClick={handleAddNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Create Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const typeInfo = getReportTypeInfo(report.reportType);
            const Icon = typeInfo.icon;
            
            return (
              <Card key={report.id} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-foreground truncate">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{typeInfo.title}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Created: {formatDate(report.createdAt)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(report)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExportExcel(report)}
                    >
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExportPDF(report)}
                    >
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <ReportFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        report={selectedReport}
        onSuccess={fetchReports}
      />

      {/* View Modal */}
      <ReportViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        report={selectedReport || null}
        onEdit={() => selectedReport && handleEdit(selectedReport)}
        onDelete={() => selectedReport && handleDelete(selectedReport)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
        itemName={selectedReport?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
