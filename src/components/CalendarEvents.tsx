import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, User, Tag } from 'lucide-react';

// Event type definition
export interface CalendarEvent {
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

// New event form type
export interface NewEventForm {
  title: string;
  date: string;
  type: string;
  description: string;
  assignedTo: string;
  location: string;
}

// Props for the CalendarEvents component
interface CalendarEventsProps {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isEventDialogOpen: boolean;
  setIsEventDialogOpen: (open: boolean) => void;
  isAddEventOpen: boolean;
  setIsAddEventOpen: (open: boolean) => void;
  newEvent: NewEventForm;
  setNewEvent: (event: NewEventForm) => void;
  handleAddEvent: () => void;
  handleDeleteEvent: (id: string) => void;
  getEventTypeColor: (type?: string) => string;
  getEventTypeLabel: (type?: string) => string;
}

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

export default function CalendarEvents({
  events,
  selectedEvent,
  isEventDialogOpen,
  setIsEventDialogOpen,
  isAddEventOpen,
  setIsAddEventOpen,
  newEvent,
  setNewEvent,
  handleAddEvent,
  handleDeleteEvent,
}: CalendarEventsProps) {
  return (
    <>
      {/* Upcoming Events Sidebar - Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.filter(e => {
              const eventDate = new Date(e.start);
              const today = new Date();
              return eventDate.toDateString() === today.toDateString();
            }).length === 0 ? (
              <p className="text-sm text-muted-foreground">No events today</p>
            ) : (
              events
                .filter(e => {
                  const eventDate = new Date(e.start);
                  const today = new Date();
                  return eventDate.toDateString() === today.toDateString();
                })
                .map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.extendedProps.type)}`} />
                    <span className="text-sm truncate">{event.title}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events
              .filter(e => new Date(e.start) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 4)
              .map(event => (
                <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.extendedProps.type)}`} />
                  <span className="text-sm truncate flex-1">{event.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { type: 'meeting', label: 'Meetings', color: 'bg-blue-500' },
              { type: 'task', label: 'Tasks', color: 'bg-red-500' },
              { type: 'reminder', label: 'Reminders', color: 'bg-green-500' },
              { type: 'event', label: 'Events', color: 'bg-amber-500' }
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm">{item.label}</span>
                <Badge variant="secondary" className="ml-auto">
                  {events.filter(e => e.extendedProps.type === item.type).length}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <Badge className={`${getEventTypeColor(selectedEvent.extendedProps.type)} text-white`}>
                  {getEventTypeLabel(selectedEvent.extendedProps.type)}
                </Badge>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedEvent.start).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                {selectedEvent.extendedProps.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.extendedProps.location}</span>
                  </div>
                )}
                
                {selectedEvent.extendedProps.assignedTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.extendedProps.assignedTo}</span>
                  </div>
                )}
                
                {selectedEvent.extendedProps.description && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  Delete Event
                </Button>
                <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event, meeting, or task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                placeholder="Enter assignee name"
                value={newEvent.assignedTo}
                onChange={(e) => setNewEvent({ ...newEvent, assignedTo: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
