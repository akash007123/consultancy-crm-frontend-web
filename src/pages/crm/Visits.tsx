import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Clock, Eye, Pencil, Trash2, Loader2, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VisitModal from '@/components/Modal/VisitModal';
import VisitViewModal from '@/components/Modal/VisitViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { visitsApi, VisitListItem, VisitDetail } from '@/lib/api';

export default function VisitsPage() {
  const [visits, setVisits] = useState<VisitListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected visit states
  const [selectedVisit, setSelectedVisit] = useState<VisitDetail | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<VisitListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch visits
  const fetchVisits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: { startDate?: string; endDate?: string } = {};
      if (filterDate) {
        params.startDate = filterDate;
        params.endDate = filterDate;
      }
      
      const response = await visitsApi.getAll(params);
      
      if (response.success && response.data?.visits) {
        setVisits(response.data.visits);
      } else {
        setError('Failed to load visits');
      }
    } catch (err) {
      console.error('Error fetching visits:', err);
      setError('Failed to load visits');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Filter visits by search query
  const filteredVisits = visits.filter(visit => {
    const query = searchQuery.toLowerCase();
    return (
      visit.clientName.toLowerCase().includes(query) ||
      visit.employeeName.toLowerCase().includes(query) ||
      visit.location.toLowerCase().includes(query) ||
      (visit.remarks && visit.remarks.toLowerCase().includes(query))
    );
  });

  // Handlers
  const handleAddNew = () => {
    setSelectedVisit(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (visitItem: VisitListItem) => {
    try {
      const response = await visitsApi.getById(visitItem.id);
      if (response.success && response.data?.visit) {
        setSelectedVisit(response.data.visit);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching visit details:', err);
    }
  };

  const handleView = async (visitItem: VisitListItem) => {
    try {
      const response = await visitsApi.getById(visitItem.id);
      if (response.success && response.data?.visit) {
        setSelectedVisit(response.data.visit);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching visit details:', err);
    }
  };

  const handleDelete = (visitItem: VisitListItem) => {
    setVisitToDelete(visitItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!visitToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await visitsApi.delete(visitToDelete.id);
      
      if (response.success) {
        setIsDeleteModalOpen(false);
        setVisitToDelete(null);
        fetchVisits();
      }
    } catch (err) {
      console.error('Error deleting visit:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchVisits();
  };

  // Format time for display
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Visit Management</h1>
          <p className="text-sm text-muted-foreground">
            {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <Button 
          className="gradient-hero text-primary-foreground border-0"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" /> Log Visit
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search visits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pl-10"
          />
        </div>
        {filterDate && (
          <Button
            variant="outline"
            onClick={() => setFilterDate('')}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading visits...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVisits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery || filterDate 
                ? 'No visits match your search criteria' 
                : 'No visits logged yet. Click "Log Visit" to add one.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Visits List */}
      {!isLoading && filteredVisits.length > 0 && (
        <div className="grid gap-4">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-foreground">
                        {visit.clientName}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(visit.date)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {visit.employeeName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 
                      {visit.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {formatTime(visit.checkIn)}
                      {visit.checkOut && ` – ${formatTime(visit.checkOut)}`}
                    </span>
                  </div>
                </div>
                
                {visit.remarks && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {visit.remarks}
                  </p>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(visit)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(visit)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(visit)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <VisitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
        visit={selectedVisit}
      />

      {/* View Modal */}
      <VisitViewModal
        visit={selectedVisit}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        onEdit={() => {
          setIsViewModalOpen(false);
          if (selectedVisit) {
            const listItem: VisitListItem = {
              id: selectedVisit.id,
              clientId: selectedVisit.clientId,
              clientName: selectedVisit.clientName,
              employeeId: selectedVisit.employeeId,
              employeeName: selectedVisit.employeeName,
              date: selectedVisit.date,
              checkIn: selectedVisit.checkInTime,
              checkOut: selectedVisit.checkOutTime,
              location: selectedVisit.location,
              remarks: selectedVisit.remarks
            };
            handleEdit(listItem);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Visit"
        description="Are you sure you want to delete this visit record? This action cannot be undone."
        itemName={visitToDelete?.clientName}
        isDeleting={isDeleting}
      />
    </div>
  );
}
