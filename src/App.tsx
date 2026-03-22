import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

import PublicLayout from "@/layouts/PublicLayout";
import CRMLayout from "@/layouts/CRMLayout";

import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import ApplyJob from "./pages/ApplyJob";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/crm/Dashboard";
import Employees from "./pages/crm/Employees";
import AddEmployee from "./pages/crm/AddEmployee";
import Attendance from "./pages/crm/Attendance";
import Tracking from "./pages/crm/Tracking";
import Visits from "./pages/crm/Visits";
import Clients from "./pages/crm/Clients";
import Tasks from "./pages/crm/Tasks";
import Expenses from "./pages/crm/Expenses";
import Stock from "./pages/crm/Stock";
import Orders from "./pages/crm/Orders";
import Settings from "./pages/crm/Settings";
import Profile from "./pages/crm/Profile";
import HRPanel from "./pages/crm/HRPanel";
import TADA from "./pages/crm/TADA";
import PetrolAllowance from "./pages/crm/PetrolAllowance";
import MasterStock from "./pages/crm/MasterStock";
import Invoice from "./pages/crm/Invoice";
import Reports from "./pages/crm/Reports";
import Calendar from "./pages/crm/Calendar";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Inner component that has access to Router context
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to CRM if already authenticated and on login/signup pages
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/signup') {
        navigate('/crm', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/apply-job" element={<ApplyJob />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* CRM routes */}
      <Route path="/crm" element={<ProtectedRoute><CRMLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/add" element={<AddEmployee />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="visits" element={<Visits />} />
        <Route path="clients" element={<Clients />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="hr-panel" element={<HRPanel />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="ta-da" element={<TADA />} />
        <Route path="petrol-allowance" element={<PetrolAllowance />} />
        <Route path="stock" element={<Stock />} />
        <Route path="master-stock" element={<MasterStock />} />
        <Route path="orders" element={<Orders />} />
        <Route path="invoices" element={<Invoice />} />
        <Route path="reports" element={<Reports />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppContent() {
  const { checkAuth, isLoading } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default AppContent;
