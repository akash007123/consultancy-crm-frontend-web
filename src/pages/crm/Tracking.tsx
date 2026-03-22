import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { employees } from '@/data/mockData';

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">GPS Tracking</h1>
        <p className="text-sm text-muted-foreground">Real-time employee locations</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="h-[400px] md:h-[500px] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="text-center z-10">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-lg font-heading font-semibold text-foreground">Google Maps Integration</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                Connect your Google Maps API key to enable live employee tracking with moving markers and route history.
              </p>
            </div>
            {/* Mock location dots */}
            {employees.filter(e => e.status === 'active').map((emp, i) => (
              <div
                key={emp.id}
                className="absolute w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-xs font-bold text-primary-foreground shadow-elevated animate-pulse"
                style={{
                  top: `${20 + (i * 15) % 60}%`,
                  left: `${15 + (i * 20) % 70}%`,
                }}
                title={emp.name}
              >
                {emp.name.charAt(0)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.filter(e => e.status === 'active').map(emp => (
          <Card key={emp.id} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                {emp.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.department} • Active</p>
              </div>
              <MapPin className="w-4 h-4 text-success ml-auto shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
