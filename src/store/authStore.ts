import { create } from 'zustand';
import { authApi, employeeApi, BackendUser, BackendEmployee } from '@/lib/api';

export type UserRole = 'admin' | 'sub-admin' | 'manager' | 'hr' | 'employee';

// Frontend user type (matches what the app expects)
export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  email?: string;
  isEmployee?: boolean;
  profilePhoto?: string | null;
}

// Convert backend employee to frontend user
const toFrontendUserFromEmployee = (employee: BackendEmployee): User => ({
  id: String(employee.id),
  name: `${employee.firstName} ${employee.lastName}`,
  mobile: employee.mobile1,
  role: employee.role,
  email: employee.email,
  isEmployee: true,
  profilePhoto: employee.profilePhoto,
});

// Convert backend user to frontend user
const toFrontendUser = (backendUser: BackendUser): User => ({
  id: String(backendUser.id),
  name: backendUser.name,
  mobile: backendUser.mobile,
  role: backendUser.role,
  email: backendUser.email,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (mobile: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, mobile: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature redirects
  error: null,

  login: async (mobile: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // First try admin/sub-admin login
      try {
        const response = await authApi.login(mobile, password);
        
        if (response.success && response.data?.user) {
          const user = toFrontendUser(response.data.user);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          // Store user ID for attendance API calls
          localStorage.setItem('employeeId', response.data.user.id.toString());
          return { success: true };
        }
      } catch {
        // Admin login failed, try employee login
      }
      
      // Try employee login
      try {
        const empResponse = await employeeApi.login(mobile, password);
        
        if (empResponse.success && empResponse.data?.employee) {
          const user = toFrontendUserFromEmployee(empResponse.data.employee);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          // Store employee ID for attendance API calls
          localStorage.setItem('employeeId', empResponse.data.employee.id.toString());
          return { success: true };
        }
      } catch {
        // Employee login failed too
      }
      
      set({ isLoading: false });
      return { success: false, message: 'Invalid mobile number or password' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred during login';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  signup: async (name: string, mobile: string, email: string, password: string, role: UserRole = 'employee') => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup({ name, mobile, email, password, role });
      
      if (response.success && response.data?.user) {
        const user = toFrontendUser(response.data.user);
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return { success: true };
      }
      
      set({ isLoading: false });
      return { success: false, message: 'Signup failed' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred during signup';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors - we still want to clear local state
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
      // Clear employeeId from localStorage
      localStorage.removeItem('employeeId');
    }
  },

  checkAuth: async () => {
    // If no token exists, immediately set not authenticated and stop loading
    if (!authApi.isAuthenticated()) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      
      // Check if it's a regular user
      if (response.success && response.data?.user) {
        const user = toFrontendUser(response.data.user);
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Store user ID for attendance API calls
        localStorage.setItem('employeeId', response.data.user.id.toString());
        return;
      }
      
      // Check if it's an employee
      if (response.success && response.data?.employee) {
        const emp = response.data.employee;
        const user: User = {
          id: String(emp.id),
          name: `${emp.firstName} ${emp.lastName}`,
          mobile: emp.mobile1,
          role: emp.role as UserRole,
          email: emp.email,
          isEmployee: true,
          profilePhoto: emp.profilePhoto,
        };
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Store employee ID for attendance API calls
        localStorage.setItem('employeeId', emp.id.toString());
        return;
      }
      
      // Token is invalid or expired - clear it
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      // Token is invalid or expired - clear it
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
