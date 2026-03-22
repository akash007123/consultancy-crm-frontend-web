import { useState, useRef, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Clock, User, Tag, X, Loader2 } from 'lucide-react';
import AttendanceFilter, { ViewType } from '@/components/AttendanceFilter';
import AttendanceModal from '@/components/AttendanceModal';
import CalendarEvents from '@/components/CalendarEvents';
import { attendanceApi, AttendanceRecord, eventsApi, CalendarEvent as ApiCalendarEvent } from '@/lib/api';

// Event type definition
interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    description?: string;
    type?: 'meeting' | 'task' | 'reminder' | 'event';
    assignedTo?: string;
    location?: string;
  };
}

// Color mapping for event types
const eventColors: Record<string, string> = {
  meeting: '#3b82f6',
  task: '#ef4444',
  reminder: '#10b981',
  event: '#8b5cf6'
};

// Convert API event to calendar event format
const convertApiEventToCalendarEvent = (apiEvent: ApiCalendarEvent): CalendarEvent => {
  return {
    id: String(apiEvent.id),
    title: apiEvent.title,
    start: apiEvent.eventDate,
    end: apiEvent.endTime ? `${apiEvent.eventDate}T${apiEvent.endTime}` : undefined,
    allDay: apiEvent.allDay,
    backgroundColor: eventColors[apiEvent.type] || '#6b7280',
    borderColor: eventColors[apiEvent.type] || '#6b7280',
    extendedProps: {
      description: apiEvent.description || '',
      type: apiEvent.type,
      assignedTo: apiEvent.assignedTo || '',
      location: apiEvent.location || ''
    }
  };
};

// Event type badge colors
const getEventTypeColor = (type?: string) => {
  switch (type) {
    case 'meeting':
      return 'bg-blue-500';
    case 'task':
      return 'bg-red-500';
    case 'reminder':
      return 'bg-green-500';
    case 'event':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
};

const getEventTypeLabel = (type?: string) => {
  switch (type) {
    case 'meeting':
      return 'Meeting';
    case 'task':
      return 'Task';
    case 'reminder':
      return 'Reminder';
    case 'event':
      return 'Event';
    default:
      return 'Event';
  }
};

// Attendance event type for calendar
interface AttendanceCalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    type: 'attendance';
    attendance: AttendanceRecord;
  };
}

// Get color for attendance status
const getAttendanceStatusColor = (status: string) => {
  switch (status) {
    case 'Present':
      return { bg: '#10b981', border: '#10b981' };
    case 'Half Day':
      return { bg: '#f59e0b', border: '#f59e0b' };
    case 'Absent':
      return { bg: '#ef4444', border: '#ef4444' };
    default:
      return { bg: '#6b7280', border: '#6b7280' };
  }
};

// Get color based on total time
// Below 3:59 = Red, 04:00-07:59 = Sky Blue, 08:00+ = Green
const getTotalTimeColor = (totalTime: string | undefined, status: string) => {
  // If absent, return red
  if (status === 'Absent') {
    return { bg: '#ef4444', border: '#ef4444' };
  }
  
  // If no total time, use default gray
  if (!totalTime) {
    return { bg: '#6b7280', border: '#6b7280' };
  }

  // Parse total time (format: HH:MM)
  const [hours, minutes] = totalTime.split(':').map(Number);
  const totalMinutes = hours * 60 + (minutes || 0);

  // Below 3:59 (less than 240 minutes) = Red
  if (totalMinutes < 240) {
    return { bg: '#ef4444', border: '#ef4444' };
  }
  
  // 04:00 to 07:59 (240-479 minutes) = Sky Blue
  if (totalMinutes >= 240 && totalMinutes < 480) {
    return { bg: '#0ea5e9', border: '#0ea5e9' };
  }
  
  // 08:00 or above (480+ minutes) = Green
  return { bg: '#10b981', border: '#10b981' };
};

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'event',
    description: '',
    assignedTo: '',
    location: ''
  });

  // Attendance state
  const [viewType, setViewType] = useState<ViewType>('events');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceCalendarEvent[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch attendance when employee is selected and view is attendance
  useEffect(() => {
    if (viewType === 'attendance' && selectedEmployeeId) {
      fetchAttendance();
    }
  }, [viewType, selectedEmployeeId, currentMonth, currentYear]);

  // Fetch events when view is events
  useEffect(() => {
    if (viewType === 'events') {
      fetchEvents();
    }
  }, [viewType]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await eventsApi.getAll();
      if (response.success && response.data) {
        const calendarEvents = response.data.map(convertApiEventToCalendarEvent);
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch attendance data
  const fetchAttendance = async () => {
    if (!selectedEmployeeId) return;

    console.log('Fetching attendance for employee:', selectedEmployeeId, 'month:', currentMonth, 'year:', currentYear);

    try {
      setIsLoadingAttendance(true);
      const response = await attendanceApi.getEmployeeAttendance(
        Number(selectedEmployeeId),
        currentMonth,
        currentYear
      );

      console.log('Attendance response:', response);

      if (response.success && response.data) {
        setAttendanceRecords(response.data.attendance);
        setEmployeeName(response.data.employee.name);
        convertAttendanceToEvents(response.data.attendance);
        console.log('Attendance events set:', response.data.attendance.length);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Convert attendance records to calendar events
  const convertAttendanceToEvents = (records: AttendanceRecord[]) => {
    const events: AttendanceCalendarEvent[] = records
      .map(record => {
        const colors = getTotalTimeColor(record.totalTime, record.status);
        return {
          id: `attendance-${record.date}`,
          title: record.status === 'Absent' ? 'Absent' : `${record.status} - ${record.totalTime}`,
          start: record.date,
          allDay: true,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          extendedProps: {
            type: 'attendance' as const,
            attendance: record,
          },
        };
      });
    setAttendanceEvents(events);
  };

  // Handle calendar date change (month/year)
  const handleDatesSet = (dateInfo: { start: Date; end: Date }) => {
    setCurrentMonth(dateInfo.start.getMonth() + 1);
    setCurrentYear(dateInfo.start.getFullYear());
  };

  // Handle attendance event click
  const handleAttendanceEventClick = (info: { event: { extendedProps: { attendance: AttendanceRecord } } }) => {
    setSelectedAttendance(info.event.extendedProps.attendance);
    setIsAttendanceModalOpen(true);
  };

  // Refresh handler for filter
  const handleRefresh = useCallback(() => {
    fetchAttendance();
  }, [selectedEmployeeId, currentMonth, currentYear]);

  // Handle date click
  const handleDateClick = (info: { date: Date; allDay: boolean }) => {
    setNewEvent({
      ...newEvent,
      date: info.date.toISOString().split('T')[0]
    });
    setIsAddEventOpen(true);
  };

  // Handle event click
  const handleEventClick = (info: { event: { 
    id: string; 
    title: string; 
    start: Date | null; 
    end: Date | null; 
    allDay: boolean;
    backgroundColor: string;
    extendedProps: { 
      description?: string;
      type?: string;
      assignedTo?: string;
      location?: string;
    };
  } }) => {
    const event = info.event;
    const selected: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || undefined,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      extendedProps: {
        ...event.extendedProps,
        type: event.extendedProps.type as 'meeting' | 'task' | 'reminder' | 'event'
      }
    };
    setSelectedEvent(selected);
    setIsEventDialogOpen(true);
  };

  // Handle adding new event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;

    try {
      const response = await eventsApi.create({
        title: newEvent.title,
        description: newEvent.description,
        eventDate: newEvent.date,
        type: newEvent.type as 'meeting' | 'task' | 'reminder' | 'event',
        assignedTo: newEvent.assignedTo,
        location: newEvent.location,
        allDay: true
      });

      if (response.success && response.data) {
        // Refresh events list to get the updated data
        await fetchEvents();
      }
      setIsAddEventOpen(false);
      setNewEvent({
        title: '',
        date: '',
        type: 'event',
        description: '',
        assignedTo: '',
        location: ''
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (id: string) => {
    try {
      await eventsApi.delete(Number(id));
      setEvents(events.filter(e => e.id !== id));
      setIsEventDialogOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Custom event content
  const eventContent = (eventInfo: { event: { 
    title: string; 
    extendedProps: { type?: string; attendance?: AttendanceRecord };
  } }) => {
    // Handle attendance events
    if (eventInfo.event.extendedProps.type === 'attendance') {
      const attendance = eventInfo.event.extendedProps.attendance;
      if (attendance) {
        return (
          <div className="flex flex-col gap-0.5 overflow-hidden p-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-medium text-white">
                {attendance.status === 'Absent' ? 'Absent' : attendance.status}
              </span>
            </div>
            {attendance.status !== 'Absent' && (
              <>
                <div className="text-[10px] text-white/90 truncate">
                  Check In: {attendance.checkIn || '-'}
                </div>
                <div className="text-[10px] text-white/90 truncate">
                  Check Out: {attendance.checkOut || '-'}
                </div>
                {attendance.totalTime && (
                  <div className="text-[10px] text-white/90 truncate mt-0.5">
                    Total: {attendance.totalTime}
                  </div>
                )}
              </>
            )}
          </div>
        );
      }
    }
    
    // Handle regular calendar events
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        <div className={`w-2 h-2 rounded-full shrink-0 ${getEventTypeColor(eventInfo.event.extendedProps.type)}`} />
        <span className="truncate text-xs">{eventInfo.event.title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your events, meetings, and tasks</p>
        </div>
        {viewType === 'events' && (
          <Button onClick={() => setIsAddEventOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        )}
      </div>

      {/* Attendance Filter */}
      <Card>
        <CardContent className="pt-4">
          <AttendanceFilter
            viewType={viewType}
            onViewTypeChange={setViewType}
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {viewType === 'events' && isLoadingEvents && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading events...</span>
        </div>
      )}
      {viewType === 'attendance' && isLoadingAttendance && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading attendance...</span>
        </div>
      )}

      {/* Calendar Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="calendar-wrapper">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={viewType === 'attendance' && selectedEmployeeId ? attendanceEvents : events}
              dateClick={viewType === 'events' ? handleDateClick : undefined}
              eventClick={(info) => {
                if (info.event.extendedProps.type === 'attendance') {
                  handleAttendanceEventClick(info as any);
                } else {
                  handleEventClick(info as any);
                }
              }}
              eventContent={eventContent}
              height="auto"
              aspectRatio={1.5}
              eventDisplay="block"
              dayMaxEvents={3}
              moreLinkClick="popover"
              selectable={viewType === 'events'}
              editable={viewType === 'events'}
              datesSet={handleDatesSet}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Sidebar - Quick View */}
      {viewType === 'events' && (
        <CalendarEvents
          events={events}
          selectedEvent={selectedEvent}
          isEventDialogOpen={isEventDialogOpen}
          setIsEventDialogOpen={setIsEventDialogOpen}
          isAddEventOpen={isAddEventOpen}
          setIsAddEventOpen={setIsAddEventOpen}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleAddEvent={handleAddEvent}
          handleDeleteEvent={handleDeleteEvent}
          getEventTypeColor={getEventTypeColor}
          getEventTypeLabel={getEventTypeLabel}
        />
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        attendance={selectedAttendance}
        employeeName={employeeName}
      />
    </div>
  );
}
