import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building, 
  FileText, 
  TrendingUp,
  AlertCircle,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { VisitDetail, clientsApi, BackendClient } from '@/lib/api';

interface VisitViewModalProps {
  visit: VisitDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export default function VisitViewModal({ visit, open, onOpenChange, onEdit }: VisitViewModalProps) {
  const [clientDetails, setClientDetails] = useState<BackendClient | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  // Fetch client details when visit changes
  useEffect(() => {
    if (visit && visit.clientId) {
      fetchClientDetails(visit.clientId);
    }
  }, [visit?.clientId]);

  const fetchClientDetails = async (clientId: number) => {
    try {
      setLoadingClient(true);
      const response = await clientsApi.getById(clientId);
      if (response.success && response.data?.client) {
        setClientDetails(response.data.client);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoadingClient(false);
    }
  };

  // Helper to get profile photo URL
  const getProfilePhotoUrl = (photo: string | null | undefined): string | null => {
    if (!photo) return null;
    if (photo.startsWith('data:')) {
      return photo;
    }
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photo}`;
  };

  if (!visit) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Convert 24h format to 12h format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Visit Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="gradient-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Client Profile Photo */}
                {clientDetails?.profilePhoto ? (
                  <img 
                    src={getProfilePhotoUrl(clientDetails.profilePhoto)} 
                    alt={visit.clientName}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    {visit.clientName}
                  </h3>
                  {clientDetails && (
                    <div className="space-y-1">
                      {clientDetails.companyName && (
                        <p className="text-sm text-muted-foreground">
                          {clientDetails.companyName}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {clientDetails.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {clientDetails.mobile}
                          </span>
                        )}
                        {clientDetails.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {clientDetails.email}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {loadingClient && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading client details...
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Visited by: <span className="font-medium">{visit.employeeName}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {formatDate(visit.date)}
                  </Badge>
                  {clientDetails?.address && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {clientDetails.address}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check In</p>
                  <p className="font-semibold">{formatTime(visit.checkInTime)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check Out</p>
                  <p className="font-semibold">
                    {visit.checkOutTime ? formatTime(visit.checkOutTime) : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold">{visit.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purpose */}
          {visit.purpose && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Purpose of Visit
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {visit.purpose}
              </p>
            </div>
          )}

          {/* Remarks */}
          {visit.remarks && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Remarks
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {visit.remarks}
              </p>
            </div>
          )}

          {/* Outcome */}
          {visit.outcome && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Outcome
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {visit.outcome}
              </p>
            </div>
          )}

          {/* Next Follow-up */}
          {visit.nextFollowup && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Follow-up
              </h4>
              <Badge variant="secondary" className="text-sm">
                {formatDate(visit.nextFollowup)}
              </Badge>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>Created: {new Date(visit.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(visit.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
