import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Lock, 
  Mail, 
  Phone, 
  Save, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi, employeeApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  attendanceAlerts: boolean;
  visitUpdates: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, checkAuth } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    taskReminders: true,
    attendanceAlerts: true,
    visitUpdates: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // Security state
  const [securityData, setSecurityData] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Load saved notification preferences from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {
        // Use default settings if parsing fails
      }
    }
  }, []);
  
  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
      });
      // Load profile photo from user data (for admin users) or employee data
      const employeeId = localStorage.getItem('employeeId');
      if (employeeId && user.isEmployee) {
        // For employees, profilePhoto comes from employee data
        setProfilePhoto(user.profilePhoto || null);
      } else {
        // For admin users, profilePhoto comes from user data
        setProfilePhoto(user.profilePhoto || null);
      }
    }
  }, [user]);
  
  const handleProfileChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSecurityChange = (field: keyof SecuritySettings, value: string) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploadingPhoto(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        
        // Save to backend
        const employeeId = localStorage.getItem('employeeId');
        if (employeeId && user?.isEmployee) {
          try {
            await employeeApi.update(parseInt(employeeId), {
              profilePhoto: base64String,
            });
            
            // Refresh user data to get updated profile photo
            await checkAuth();
            
            toast({
              title: 'Success',
              description: 'Profile photo updated successfully',
            });
          } catch (error) {
            console.error('Error updating profile photo:', error);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to update profile photo',
              variant: 'destructive',
            });
          }
        } else if (user?.id) {
          // For admin users, update via auth API
          try {
            await authApi.updateProfile({
              name: profileData.name,
              email: profileData.email,
              mobile: profileData.mobile,
              profilePhoto: base64String,
            });
            
            // Refresh user data to get updated profile photo
            await checkAuth();
            
            toast({
              title: 'Success',
              description: 'Profile photo updated successfully',
            });
          } catch (error) {
            console.error('Error updating profile photo:', error);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to update profile photo',
              variant: 'destructive',
            });
          }
        } else {
          // For other users, just update locally
          toast({
            title: 'Success',
            description: 'Profile photo updated successfully',
          });
        }
        
        setIsUploadingPhoto(false);
      };
      
      reader.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to read the image file',
          variant: 'destructive',
        });
        setIsUploadingPhoto(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
      setIsUploadingPhoto(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!profileData.mobile.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Mobile number is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSavingProfile(true);
    try {
      // Determine if user is an employee or regular user
      const employeeId = localStorage.getItem('employeeId');
      
      if (employeeId && user?.isEmployee) {
        // Update employee profile
        await employeeApi.update(parseInt(employeeId), {
          firstName: profileData.name.split(' ')[0] || profileData.name,
          lastName: profileData.name.split(' ').slice(1).join(' ') || '',
          email: profileData.email,
          mobile1: profileData.mobile,
        });
        
        // Refresh user data
        await checkAuth();
      } else if (user?.id) {
        // For admin users, update via auth API
        await authApi.updateProfile({
          name: profileData.name,
          email: profileData.email,
          mobile: profileData.mobile,
          profilePhoto: profilePhoto,
        });
        
        // Refresh user data
        await checkAuth();
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      // Save to localStorage (in a real app, this would be saved to backend)
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      
      toast({
        title: 'Success',
        description: 'Notification preferences saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  const handleChangePassword = async () => {
    // Validation
    if (!securityData.currentPassword) {
      toast({
        title: 'Validation Error',
        description: 'Current password is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!securityData.newPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (securityData.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await authApi.changePassword(securityData.currentPassword, securityData.newPassword);
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      
      // Clear password fields
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: 'Administrator',
      'sub-admin': 'Sub Admin',
      manager: 'Manager',
      hr: 'HR',
      employee: 'Employee',
    };
    return roles[role] || role;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <div className="grid gap-6 max-w-3xl">
        {/* Profile Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info Display */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="relative">
                <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground overflow-hidden">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={user?.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{user?.name || 'User'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {getRoleLabel(user?.role || 'employee')}
                  </Badge>
                  {user?.isEmployee && (
                    <Badge variant="outline" className="text-xs">
                      Employee
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the camera icon to update your profile photo
                </p>
              </div>
            </div>
            
            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  value={profileData.mobile}
                  onChange={(e) => handleProfileChange('mobile', e.target.value)}
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSavingProfile}
              className="gradient-hero text-primary-foreground border-0"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Notifications Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="emailNotifications" className="font-medium">
                      Email Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="smsNotifications" className="font-medium">
                      SMS Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                />
              </div>
              
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="pushNotifications" className="font-medium">
                      Push Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              {/* Task Reminders */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="taskReminders" className="font-medium">
                      Task Reminders
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming tasks and deadlines
                  </p>
                </div>
                <Switch
                  id="taskReminders"
                  checked={notifications.taskReminders}
                  onCheckedChange={(checked) => handleNotificationChange('taskReminders', checked)}
                />
              </div>
              
              {/* Attendance Alerts */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="attendanceAlerts" className="font-medium">
                      Attendance Alerts
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for check-in/check-out reminders
                  </p>
                </div>
                <Switch
                  id="attendanceAlerts"
                  checked={notifications.attendanceAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('attendanceAlerts', checked)}
                />
              </div>
              
              {/* Visit Updates */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="visitUpdates" className="font-medium">
                      Visit Updates
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notified about client visit updates
                  </p>
                </div>
                <Switch
                  id="visitUpdates"
                  checked={notifications.visitUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('visitUpdates', checked)}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveNotifications} 
              disabled={isSavingNotifications}
              className="gradient-hero text-primary-foreground border-0"
            >
              {isSavingNotifications ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Security Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">Change Password</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Update your password to keep your account secure
              </p>
              
              <div className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={securityData.confirmPassword}
                      onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleChangePassword} 
              disabled={isChangingPassword}
              className="gradient-hero text-primary-foreground border-0"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Account Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-medium">{user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium capitalize">{user?.isEmployee ? 'Employee' : 'User'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{getRoleLabel(user?.role || 'employee')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
