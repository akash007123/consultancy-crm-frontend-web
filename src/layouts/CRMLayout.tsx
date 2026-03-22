import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, MapPin, Building2, ListChecks,
  Receipt, CalendarDays, Package, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Briefcase, Menu,
  Fuel, Wallet, UserCheck, BarChart3, ArrowUpDown, Calendar1, User
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import CheckInOutButton from '@/components/CheckInOutButton/CheckInOutButton';
import { attendanceApi } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/crm' },
  { label: 'Employees', icon: Users, path: '/crm/employees' },
  { label: 'Attendance', icon: Clock, path: '/crm/attendance' },
  { label: 'Calendar', icon: Calendar1, path: '/crm/calendar' },
  { label: 'GPS Tracking', icon: MapPin, path: '/crm/tracking' },
  { label: 'Visits & DSR', icon: CalendarDays, path: '/crm/visits' },
  { label: 'Clients', icon: Building2, path: '/crm/clients' },
  { label: 'Tasks', icon: ListChecks, path: '/crm/tasks' },
  { label: 'HR Panel', icon: UserCheck, path: '/crm/hr-panel' },
  { label: 'Expenses', icon: Receipt, path: '/crm/expenses' },
  { label: 'TA / DA', icon: Wallet, path: '/crm/ta-da' },
  { label: 'Petrol Allowance', icon: Fuel, path: '/crm/petrol-allowance' },
  { label: 'Distributor Stock', icon: Package, path: '/crm/stock' },
  { label: 'Master Stock', icon: ArrowUpDown, path: '/crm/master-stock' },
  { label: 'Orders', icon: FileText, path: '/crm/orders' },
  { label: 'Invoices', icon: FileText, path: '/crm/invoices' },
  { label: 'Reports', icon: BarChart3, path: '/crm/reports' },
  { label: 'Settings', icon: Settings, path: '/crm/settings' },
];

export default function CRMLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if user is an employee (not admin/manager/hr)
  const isEmployee = user?.role === 'employee';

  // Handle checkout API call
  const handleCheckout = async (data: {
    report: string;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const payload = {
      employeeId: user.id,
      report: data.report,
    };

    const response = await attendanceApi.checkout(payload);

    if (!response.success) {
      throw new Error(response.message || 'Failed to submit checkout');
    }

    return response;
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-heading font-bold text-sidebar-foreground">HireEdge CRM</span>}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map(item => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
          }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-card hover:shadow-elevated transition-shadow"
          style={{ left: collapsed ? '52px' : '248px' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar flex flex-col shadow-elevated">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-foreground/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Check In/Out Button - Only for employees */}
            {isEmployee && (
              <div className="hidden md:block mr-2">
                <CheckInOutButton onCheckout={handleCheckout} variant="compact" />
              </div>
            )}
            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background overflow-hidden"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setProfileOpen(false); navigate('/crm/profile'); }} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setProfileOpen(false); navigate('/crm/settings'); }} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
