import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Profile</h3>
            </div>
            <div className="space-y-3">
              <Input defaultValue="Rajesh Kumar" placeholder="Name" />
              <Input defaultValue="9876543210" placeholder="Mobile" />
              <Input defaultValue="rajesh@hireedge.com" placeholder="Email" />
              <Button className="gradient-hero text-primary-foreground border-0">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
            </div>
            <p className="text-sm text-muted-foreground">Email and SMS notification preferences will be available here.</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Security</h3>
            </div>
            <p className="text-sm text-muted-foreground">Role management and access control settings will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
