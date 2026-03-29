// API client for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('token');
};

// User type from backend
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'sub-admin' | 'manager' | 'hr' | 'employee';
  isActive: boolean;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

// Employee type from backend
export interface BackendEmployee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  joiningDate: string;
  department: string;
  role: 'admin' | 'manager' | 'hr' | 'employee';
  status: 'active' | 'inactive';
  mobile1: string;
  mobile2: string;
  address: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  bankAddress: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  otherSocial: string;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: BackendUser;
    token: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as { message?: string; error?: string };
    throw new Error(errorData.message || errorData.error || 'An error occurred');
  }

  return data;
}

// Auth API functions
export const authApi = {
  // Login
  login: async (mobile: string, password: string): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
    
    // Store token on successful login
    if (response.data?.token) {
      setToken(response.data.token);
    }
    
    return response;
  },

  // Register/Signup
  signup: async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token on successful signup
    if (response.data?.token) {
      setToken(response.data.token);
    }
    
    return response;
  },

  // Get current user (works for both users and employees)
  getMe: async (): Promise<{ success: boolean; data: { user?: BackendUser; employee?: BackendEmployee } }> => {
    return fetchApi<{ success: boolean; data: { user?: BackendUser; employee?: BackendEmployee } }>('/auth/me', {
      method: 'GET',
    });
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await fetchApi<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always remove token, even if API call fails
      removeToken();
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Update user profile
  updateProfile: async (data: { name: string; email: string; mobile: string; profilePhoto?: string | null }): Promise<{ success: boolean; message: string; data: { user: BackendUser } }> => {
    return fetchApi<{ success: boolean; message: string; data: { user: BackendUser } }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Check if user is authenticated (has valid token)
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// Employee API functions
export interface EmployeeApiResponse {
  success: boolean;
  message?: string;
  data: {
    employees: BackendEmployee[];
    employee: BackendEmployee;
    employeeCode?: string;
    token?: string;
  };
}

export const employeeApi = {
  // Get all employees
  getAll: async (params?: { search?: string; department?: string; status?: string }): Promise<EmployeeApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return fetchApi<EmployeeApiResponse>(`/employees${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single employee
  getById: async (id: number): Promise<EmployeeApiResponse> => {
    return fetchApi<EmployeeApiResponse>(`/employees/${id}`, {
      method: 'GET',
    });
  },

  // Create new employee
  create: async (data: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    joiningDate: string;
    department: string;
    role?: 'admin' | 'manager' | 'hr' | 'employee';
    status?: 'active' | 'inactive';
    mobile1: string;
    mobile2?: string;
    address?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    bankAddress?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    otherSocial?: string;
    password: string;
  }): Promise<EmployeeApiResponse> => {
    return fetchApi<EmployeeApiResponse>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update employee
  update: async (id: number, data: Partial<{
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    joiningDate: string;
    department: string;
    role: 'admin' | 'manager' | 'hr' | 'employee';
    status: 'active' | 'inactive';
    mobile1: string;
    mobile2: string;
    address: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
    ifscCode: string;
    bankAddress: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    otherSocial: string;
    password: string;
    profilePhoto: string | null;
  }>): Promise<EmployeeApiResponse> => {
    return fetchApi<EmployeeApiResponse>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete employee
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate employee code
  generateCode: async (): Promise<EmployeeApiResponse> => {
    return fetchApi<EmployeeApiResponse>('/employees/code/generate', {
      method: 'GET',
    });
  },

  // Employee login
  login: async (mobile: string, password: string): Promise<EmployeeApiResponse> => {
    const response = await fetchApi<EmployeeApiResponse>('/employees/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
    
    // Store token on successful login
    if (response.data?.token) {
      setToken(response.data.token);
    }
    
    return response;
  },
};

// Attendance API functions
export interface AttendanceCheckoutPayload {
  employeeId: string;
  report: string;
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data?: {
    attendance: {
      id: number;
      employeeId: string;
      checkInTime: string;
      checkOutTime: string;
      totalTime: string;
      report: string;
      createdAt: string;
    };
    hasCheckedIn: boolean;
    hasCompletedToday: boolean;
  };
}

export interface AttendanceAllResponse {
  success: boolean;
  message?: string;
  data?: {
    attendance: {
      id: number;
      employee_id: string;
      date: string;
      check_in_time: string;
      check_out_time: string | null;
      total_time: string | null;
      report: string | null;
      created_at: string;
      first_name?: string;
      last_name?: string;
      department?: string;
    }[];
  };
}

// Attendance types
export interface AttendanceRecord {
  id: number | null;
  date: string;
  checkIn: string;
  checkOut: string;
  totalTime: string;
  status: 'Present' | 'Half Day' | 'Absent';
  report: string;
}

export interface EmployeeAttendanceResponse {
  success: boolean;
  data?: {
    employee: {
      id: number;
      name: string;
    };
    attendance: AttendanceRecord[];
  };
  message?: string;
}

export const attendanceApi = {
  // Get all attendance records (for admin/manager)
  getAll: async (params?: { date?: string; employeeId?: string; fromDate?: string; toDate?: string }): Promise<AttendanceAllResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    
    const queryString = queryParams.toString();
    return fetchApi<AttendanceAllResponse>(`/attendance${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get employee attendance by month and year
  getEmployeeAttendance: async (employeeId: number, month: number, year: number): Promise<EmployeeAttendanceResponse> => {
    return fetchApi<EmployeeAttendanceResponse>(`/attendance/employee/${employeeId}?month=${month}&year=${year}`, {
      method: 'GET',
    });
  },

  // Check in
  checkIn: async (data: { employeeId: string }): Promise<AttendanceResponse> => {
    return fetchApi<AttendanceResponse>('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Check out with report
  checkout: async (data: AttendanceCheckoutPayload): Promise<AttendanceResponse> => {
    return fetchApi<AttendanceResponse>('/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get today's attendance for current employee
  getTodayAttendance: async (explicitEmployeeId?: string): Promise<AttendanceResponse> => {
    const token = getToken();
    const employeeId = explicitEmployeeId || localStorage.getItem('employeeId');
    
    console.log('getTodayAttendance - token:', token ? 'exists' : 'none', 'employeeId:', employeeId);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (employeeId) {
      (headers as Record<string, string>)['x-employee-id'] = employeeId;
    }

    const response = await fetch(`${API_BASE_URL}/attendance/today`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    console.log('getTodayAttendance response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  },
};

// Visit types
export interface VisitListItem {
  id: number;
  clientId: number;
  clientName: string;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  location: string;
  remarks: string | null;
}

export interface VisitDetail {
  id: number;
  clientId: number;
  clientName: string;
  employeeId: number;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  location: string;
  remarks: string | null;
  purpose: string | null;
  outcome: string | null;
  nextFollowup: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisitApiResponse {
  success: boolean;
  message?: string;
  data?: {
    visits?: VisitListItem[];
    visit?: VisitDetail;
  };
}

export interface ClientItem {
  id: number;
  name: string;
  companyName: string;
  email: string;
  mobile: string;
}

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department: string;
  status: string;
}

export interface ClientsResponse {
  success: boolean;
  data?: {
    clients: ClientItem[];
  };
}

export interface EmployeesListResponse {
  success: boolean;
  data?: {
    employees: EmployeeListItem[];
  };
}

// Visits API functions
export const visitsApi = {
  // Get all visits with optional filters
  getAll: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    employeeId?: string; 
    clientId?: string 
  }): Promise<VisitApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.clientId) queryParams.append('clientId', params.clientId);
    
    const queryString = queryParams.toString();
    return fetchApi<VisitApiResponse>(`/visits${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single visit by ID
  getById: async (id: number): Promise<VisitApiResponse> => {
    return fetchApi<VisitApiResponse>(`/visits/${id}`, {
      method: 'GET',
    });
  },

  // Create new visit
  create: async (data: {
    clientId: number;
    employeeId: number;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    location: string;
    remarks?: string;
    purpose?: string;
    outcome?: string;
    nextFollowup?: string;
  }): Promise<VisitApiResponse> => {
    return fetchApi<VisitApiResponse>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update visit
  update: async (id: number, data: Partial<{
    clientId: number;
    employeeId: number;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    location: string;
    remarks: string;
    purpose: string;
    outcome: string;
    nextFollowup: string;
  }>): Promise<VisitApiResponse> => {
    return fetchApi<VisitApiResponse>(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete visit
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/visits/${id}`, {
      method: 'DELETE',
    });
  },

  // Get clients list for dropdown
  getClients: async (): Promise<ClientsResponse> => {
    return fetchApi<ClientsResponse>('/visits/clients/list', {
      method: 'GET',
    });
  },

  // Get employees list for dropdown
  getEmployees: async (): Promise<EmployeesListResponse> => {
    return fetchApi<EmployeesListResponse>('/visits/employees/list', {
      method: 'GET',
    });
  },
};

// Candidate types
export type CandidateStatus = 'Shortlisted' | 'Pending' | 'Interview Scheduled' | 'Applied' | 'Offer Sent' | 'Accepted Offer';

export interface Candidate {
  id: number;
  name: string;
  position: string;
  status: CandidateStatus;
  email: string;
  phone: string;
  resumeUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateApiResponse {
  success: boolean;
  message?: string;
  data: {
    candidates?: Candidate[];
    candidate?: Candidate;
  };
}

// Candidate API functions
export const candidateApi = {
  // Get all candidates
  getAll: async (): Promise<CandidateApiResponse> => {
    return fetchApi<CandidateApiResponse>('/candidates', {
      method: 'GET',
    });
  },

  // Get single candidate by ID
  getById: async (id: number): Promise<CandidateApiResponse> => {
    return fetchApi<CandidateApiResponse>(`/candidates/${id}`, {
      method: 'GET',
    });
  },

  // Create new candidate
  create: async (data: {
    name: string;
    position: string;
    status?: CandidateStatus;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<CandidateApiResponse> => {
    return fetchApi<CandidateApiResponse>('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update candidate
  update: async (id: number, data: Partial<{
    name: string;
    position: string;
    status: CandidateStatus;
    email: string;
    phone: string;
    notes: string;
  }>): Promise<CandidateApiResponse> => {
    return fetchApi<CandidateApiResponse>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete candidate
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Job Post types
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'Active' | 'Closed';

export interface JobPost {
  id: number;
  title: string;
  date: string;
  type: JobType;
  location: string;
  experience: string;
  description: string;
  position: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostApiResponse {
  success: boolean;
  message?: string;
  data: {
    jobPosts?: JobPost[];
    jobPost?: JobPost;
  };
}

// Job Post API functions
export const jobPostApi = {
  // Get all job posts
  getAll: async (): Promise<JobPostApiResponse> => {
    return fetchApi<JobPostApiResponse>('/job-posts', {
      method: 'GET',
    });
  },

  // Get active job posts (for public listing)
  getActive: async (): Promise<JobPostApiResponse> => {
    return fetchApi<JobPostApiResponse>('/job-posts/active', {
      method: 'GET',
    });
  },

  // Get single job post by ID
  getById: async (id: number): Promise<JobPostApiResponse> => {
    return fetchApi<JobPostApiResponse>(`/job-posts/${id}`, {
      method: 'GET',
    });
  },

  // Create new job post
  create: async (data: {
    title: string;
    date: string;
    type: JobType;
    location: string;
    experience: string;
    description: string;
    position: number;
    status?: JobStatus;
  }): Promise<JobPostApiResponse> => {
    return fetchApi<JobPostApiResponse>('/job-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update job post
  update: async (id: number, data: Partial<{
    title: string;
    date: string;
    type: JobType;
    location: string;
    experience: string;
    description: string;
    position: number;
    status: JobStatus;
  }>): Promise<JobPostApiResponse> => {
    return fetchApi<JobPostApiResponse>(`/job-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete job post
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/job-posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Job Application types
export type JobApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Rejected' | 'Hired';

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  name: string;
  email: string;
  mobile: string;
  education: string;
  address: string;
  resumeUrl: string;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationApiResponse {
  success: boolean;
  message?: string;
  data: {
    jobApplications?: JobApplication[];
    jobApplication?: JobApplication;
  };
}

// Job Application API functions
export const jobApplicationApi = {
  // Get all job applications (requires auth)
  getAll: async (): Promise<JobApplicationApiResponse> => {
    return fetchApi<JobApplicationApiResponse>('/job-applications', {
      method: 'GET',
    });
  },

  // Get single job application by ID
  getById: async (id: number): Promise<JobApplicationApiResponse> => {
    return fetchApi<JobApplicationApiResponse>(`/job-applications/${id}`, {
      method: 'GET',
    });
  },

  // Submit job application (public)
  submit: async (data: {
    jobId: number;
    jobTitle: string;
    name: string;
    email: string;
    mobile: string;
    education: string;
    address: string;
  }): Promise<JobApplicationApiResponse> => {
    return fetchApi<JobApplicationApiResponse>('/job-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update job application status
  updateStatus: async (id: number, status: string): Promise<JobApplicationApiResponse> => {
    return fetchApi<JobApplicationApiResponse>(`/job-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete job application
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/job-applications/${id}`, {
      method: 'DELETE',
    });
  },
};

// Client types
export interface BackendClient {
  id: number;
  clientName: string;
  companyName: string;
  mobile: string;
  email: string | null;
  industry: string | null;
  address: string | null;
  profilePhoto: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Client API response types
interface ClientApiResponse {
  success: boolean;
  message?: string;
  data: {
    client: BackendClient;
    clients: BackendClient[];
    total: number;
  };
}

// Clients API functions
export const clientsApi = {
  // Get all clients with optional search
  getAll: async (params?: { search?: string }): Promise<ClientApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return fetchApi<ClientApiResponse>(`/clients${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single client by ID
  getById: async (id: number): Promise<ClientApiResponse> => {
    return fetchApi<ClientApiResponse>(`/clients/${id}`, {
      method: 'GET',
    });
  },

  // Create new client
  create: async (data: {
    clientName: string;
    companyName: string;
    mobile: string;
    email?: string;
    industry?: string;
    address?: string;
    profilePhoto?: string;
  }): Promise<ClientApiResponse> => {
    return fetchApi<ClientApiResponse>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update client
  update: async (id: number, data: Partial<{
    clientName: string;
    companyName: string;
    mobile: string;
    email: string;
    industry: string;
    address: string;
    profilePhoto: string;
  }>): Promise<ClientApiResponse> => {
    return fetchApi<ClientApiResponse>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete client
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle client active status
  toggleStatus: async (id: number): Promise<ClientApiResponse> => {
    return fetchApi<ClientApiResponse>(`/clients/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};

// Task types
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'in-progress' | 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  assigneeId: number;
  assigneeName: string;
  assignDate: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// Task API response types
interface TaskApiResponse {
  success: boolean;
  message?: string;
  data: {
    tasks?: Task[];
    task?: Task;
    total?: number;
  };
}

// Task API functions
export const tasksApi = {
  // Get all tasks
  getAll: async (): Promise<TaskApiResponse> => {
    return fetchApi<TaskApiResponse>('/tasks', {
      method: 'GET',
    });
  },

  // Get single task by ID
  getById: async (id: number): Promise<TaskApiResponse> => {
    return fetchApi<TaskApiResponse>(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  // Create new task
  create: async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId: number;
    dueDate: string;
    status?: TaskStatus;
  }): Promise<TaskApiResponse> => {
    return fetchApi<TaskApiResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update task
  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: number;
    dueDate: string;
    status: TaskStatus;
  }>): Promise<TaskApiResponse> => {
    return fetchApi<TaskApiResponse>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete task
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Get employees for dropdown
  getEmployees: async (): Promise<EmployeesListResponse> => {
    return fetchApi<EmployeesListResponse>('/employees', {
      method: 'GET',
    });
  },
};

// Expense types
export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseApiResponse {
  success: boolean;
  message?: string;
  data: {
    expenses?: Expense[];
    expense?: Expense;
  };
}

// Expense API functions
export const expenseApi = {
  // Get all expenses
  getAll: async (): Promise<ExpenseApiResponse> => {
    return fetchApi<ExpenseApiResponse>('/expenses', {
      method: 'GET',
    });
  },

  // Get single expense by ID
  getById: async (id: number): Promise<ExpenseApiResponse> => {
    return fetchApi<ExpenseApiResponse>(`/expenses/${id}`, {
      method: 'GET',
    });
  },

  // Create new expense
  create: async (data: {
    category: string;
    amount: number;
    description?: string;
  }): Promise<ExpenseApiResponse> => {
    return fetchApi<ExpenseApiResponse>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update expense
  update: async (id: number, data: Partial<{
    category: string;
    amount: number;
    description: string;
  }>): Promise<ExpenseApiResponse> => {
    return fetchApi<ExpenseApiResponse>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete expense
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// TA/DA types
export type ApprovalStatus = 'Approved' | 'Pending (Manager)' | 'Pending (Admin)';

export interface TADA {
  id: number;
  employeeId: number;
  employeeName: string;
  ta: number;
  da: number;
  total: number;
  date: string;
  approval: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TADAApiResponse {
  success: boolean;
  message?: string;
  data: {
    tadaEntries?: TADA[];
    tadaEntry?: TADA;
  };
}

// TA/DA API functions
export const tadaApi = {
  // Get all TA/DA entries
  getAll: async (): Promise<TADAApiResponse> => {
    return fetchApi<TADAApiResponse>('/tada', {
      method: 'GET',
    });
  },

  // Get single TA/DA by ID
  getById: async (id: number): Promise<TADAApiResponse> => {
    return fetchApi<TADAApiResponse>(`/tada/${id}`, {
      method: 'GET',
    });
  },

  // Create new TA/DA entry
  create: async (data: {
    employeeId: number;
    ta: number;
    da: number;
    date: string;
    approval?: ApprovalStatus;
  }): Promise<TADAApiResponse> => {
    return fetchApi<TADAApiResponse>('/tada', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update TA/DA entry
  update: async (id: number, data: Partial<{
    employeeId: number;
    ta: number;
    da: number;
    date: string;
    approval: ApprovalStatus;
  }>): Promise<TADAApiResponse> => {
    return fetchApi<TADAApiResponse>(`/tada/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete TA/DA entry
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/tada/${id}`, {
      method: 'DELETE',
    });
  },

  // Get employees for dropdown
  getEmployees: async (): Promise<EmployeesListResponse> => {
    return fetchApi<EmployeesListResponse>('/employees', {
      method: 'GET',
    });
  },
};

// Petrol Allowance types
export type PetrolAllowanceStatus = 'Approved' | 'Pending';

export interface PetrolAllowance {
  id: number;
  employeeId: number;
  employeeName: string;
  distance: number;
  rate: number;
  total: number;
  date: string;
  status: PetrolAllowanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PetrolAllowanceApiResponse {
  success: boolean;
  message?: string;
  data: {
    petrolAllowances?: PetrolAllowance[];
    petrolAllowance?: PetrolAllowance;
  };
}

// Petrol Allowance API functions
export const petrolAllowanceApi = {
  // Get all petrol allowances
  getAll: async (): Promise<PetrolAllowanceApiResponse> => {
    return fetchApi<PetrolAllowanceApiResponse>('/petrol-allowance', {
      method: 'GET',
    });
  },

  // Get single petrol allowance by ID
  getById: async (id: number): Promise<PetrolAllowanceApiResponse> => {
    return fetchApi<PetrolAllowanceApiResponse>(`/petrol-allowance/${id}`, {
      method: 'GET',
    });
  },

  // Create new petrol allowance
  create: async (data: {
    employeeId: number;
    distance: number;
    rate: number;
    date: string;
    status?: PetrolAllowanceStatus;
  }): Promise<PetrolAllowanceApiResponse> => {
    return fetchApi<PetrolAllowanceApiResponse>('/petrol-allowance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update petrol allowance
  update: async (id: number, data: Partial<{
    employeeId: number;
    distance: number;
    rate: number;
    date: string;
    status: PetrolAllowanceStatus;
  }>): Promise<PetrolAllowanceApiResponse> => {
    return fetchApi<PetrolAllowanceApiResponse>(`/petrol-allowance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete petrol allowance
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/petrol-allowance/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stock types
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Stock {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  status: StockStatus;
  description: string | null;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockApiResponse {
  success: boolean;
  message?: string;
  data: {
    stock?: Stock[];
    stockItem?: Stock;
  };
}

// Stock API functions
export const stockApi = {
  // Get all stock items
  getAll: async (): Promise<StockApiResponse> => {
    return fetchApi<StockApiResponse>('/stock', {
      method: 'GET',
    });
  },

  // Get single stock item by ID
  getById: async (id: number): Promise<StockApiResponse> => {
    return fetchApi<StockApiResponse>(`/stock/${id}`, {
      method: 'GET',
    });
  },

  // Create new stock item
  create: async (data: {
    name: string;
    quantity: number;
    unit: string;
    description?: string;
    minQuantity?: number;
  }): Promise<StockApiResponse> => {
    return fetchApi<StockApiResponse>('/stock', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update stock item
  update: async (id: number, data: Partial<{
    name: string;
    quantity: number;
    unit: string;
    description: string;
    minQuantity: number;
  }>): Promise<StockApiResponse> => {
    return fetchApi<StockApiResponse>(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete stock item
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/stock/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stock Transaction types (Master Distributor Stock)
export type StockTransactionType = 'IN' | 'OUT';

export interface StockTransaction {
  id: number;
  stockItemId: number;
  stockItemName: string;
  type: StockTransactionType;
  quantity: number;
  date: string;
  sourceDest: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransactionApiResponse {
  success: boolean;
  message?: string;
  data: {
    transactions?: StockTransaction[];
    transaction?: StockTransaction;
  };
}

// Stock Transaction API functions
export const stockTransactionApi = {
  // Get all stock transactions
  getAll: async (): Promise<StockTransactionApiResponse> => {
    return fetchApi<StockTransactionApiResponse>('/stock-transactions', {
      method: 'GET',
    });
  },

  // Get single stock transaction by ID
  getById: async (id: number): Promise<StockTransactionApiResponse> => {
    return fetchApi<StockTransactionApiResponse>(`/stock-transactions/${id}`, {
      method: 'GET',
    });
  },

  // Create new stock transaction
  create: async (data: {
    stockItemId: number;
    type: StockTransactionType;
    quantity: number;
    date: string;
    sourceDest: string;
    remarks?: string;
  }): Promise<StockTransactionApiResponse> => {
    return fetchApi<StockTransactionApiResponse>('/stock-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update stock transaction
  update: async (id: number, data: Partial<{
    stockItemId: number;
    type: StockTransactionType;
    quantity: number;
    date: string;
    sourceDest: string;
    remarks: string;
  }>): Promise<StockTransactionApiResponse> => {
    return fetchApi<StockTransactionApiResponse>(`/stock-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete stock transaction
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/stock-transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice types
export type InvoiceStatus = 'Pending' | 'Paid' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'Credit Card' | 'Debit Card';

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number | null;
  clientId: number;
  clientName: string;
  clientCompany: string;
  date: string;
  dueDate: string | null;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceApiResponse {
  success: boolean;
  message?: string;
  data: {
    invoices?: Invoice[];
    invoice?: Invoice;
    invoiceNumber?: string;
  };
}

// Invoice API functions
export const invoiceApi = {
  // Get all invoices
  getAll: async (): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>('/invoices', {
      method: 'GET',
    });
  },

  // Generate invoice number
  generateNumber: async (): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>('/invoices/generate-number', {
      method: 'GET',
    });
  },

  // Get single invoice by ID
  getById: async (id: number): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>(`/invoices/${id}`, {
      method: 'GET',
    });
  },

  // Generate invoice from order
  generateFromOrder: async (orderId: number, data?: {
    taxRate?: number;
    discount?: number;
    dueDate?: string;
  }): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>(`/invoices/generate/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // Update payment status
  updatePayment: async (id: number, data: {
    paymentMethod: PaymentMethod;
    paidDate?: string;
  }): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>(`/invoices/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Create new invoice
  create: async (data: {
    clientId: number;
    date: string;
    dueDate?: string;
    items: {
      description: string;
      quantity: number;
      rate: number;
    }[];
    tax?: number;
    notes?: string;
    paymentMethod?: PaymentMethod;
    status?: InvoiceStatus;
  }): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update invoice
  update: async (id: number, data: Partial<{
    clientId: number;
    date: string;
    dueDate: string;
    items: {
      description: string;
      quantity: number;
      rate: number;
    }[];
    tax: number;
    notes: string;
    paymentMethod: PaymentMethod;
    status: InvoiceStatus;
  }>): Promise<InvoiceApiResponse> => {
    return fetchApi<InvoiceApiResponse>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete invoice
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Report types
export type ReportType = 'employee' | 'visit' | 'attendance' | 'expense' | 'stock' | 'sales' | 'invoice';

export interface SavedReport {
  id: number;
  name: string;
  reportType: ReportType;
  filters: Record<string, unknown> | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportApiResponse {
  success: boolean;
  message?: string;
  data: {
    reports?: SavedReport[];
    report?: SavedReport;
  };
}

// Report API functions
export const reportApi = {
  // Get all reports
  getAll: async (reportType?: ReportType): Promise<ReportApiResponse> => {
    const params = reportType ? `?reportType=${reportType}` : '';
    return fetchApi<ReportApiResponse>(`/reports${params}`, {
      method: 'GET',
    });
  },

  // Get single report by ID
  getById: async (id: number): Promise<ReportApiResponse> => {
    return fetchApi<ReportApiResponse>(`/reports/${id}`, {
      method: 'GET',
    });
  },

  // Create new report
  create: async (data: {
    name: string;
    reportType: ReportType;
    filters?: Record<string, unknown>;
  }): Promise<ReportApiResponse> => {
    return fetchApi<ReportApiResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update report
  update: async (id: number, data: Partial<{
    name: string;
    reportType: ReportType;
    filters: Record<string, unknown>;
  }>): Promise<ReportApiResponse> => {
    return fetchApi<ReportApiResponse>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/reports/${id}`, {
      method: 'DELETE',
    });
  },

  // Export report to Excel
  exportToExcel: async (report: SavedReport): Promise<void> => {
    // Generate sample data based on report type
    const data = await generateReportData(report.reportType);
    downloadAsExcel(data, report.name);
  },

  // Export report to PDF
  exportToPDF: async (report: SavedReport): Promise<void> => {
    // Generate sample data based on report type
    const data = await generateReportData(report.reportType);
    downloadAsPDF(data, report.name);
  },
};

// Helper function to generate sample report data
async function generateReportData(reportType: ReportType): Promise<Record<string, string>[]> {
  // This would typically fetch real data from the API based on report type
  // For now, returning sample data structure
  switch (reportType) {
    case 'employee':
      return [
        { Name: 'John Doe', Department: 'IT', Role: 'Developer', Status: 'Active' },
        { Name: 'Jane Smith', Department: 'HR', Role: 'Manager', Status: 'Active' },
      ];
    case 'visit':
      return [
        { Date: '2026-03-01', Client: 'ABC Corp', Purpose: 'Meeting', Status: 'Completed' },
        { Date: '2026-03-02', Client: 'XYZ Ltd', Purpose: 'Demo', Status: 'Completed' },
      ];
    case 'attendance':
      return [
        { Date: '2026-03-01', Employee: 'John Doe', Status: 'Present', TimeIn: '09:00', TimeOut: '18:00' },
        { Date: '2026-03-01', Employee: 'Jane Smith', Status: 'Present', TimeIn: '09:15', TimeOut: '18:00' },
      ];
    case 'expense':
      return [
        { Date: '2026-03-01', Category: 'Travel', Amount: '5000', Status: 'Approved' },
        { Date: '2026-03-02', Category: 'Food', Amount: '1500', Status: 'Pending' },
      ];
    case 'stock':
      return [
        { Item: 'Product A', Quantity: '100', Unit: 'pcs', Status: 'In Stock' },
        { Item: 'Product B', Quantity: '50', Unit: 'pcs', Status: 'Low Stock' },
      ];
    case 'sales':
    case 'invoice':
      return [
        { InvoiceNo: 'INV-2026-0001', Client: 'ABC Corp', Amount: '100000', Status: 'Paid' },
        { InvoiceNo: 'INV-2026-0002', Client: 'XYZ Ltd', Amount: '50000', Status: 'Pending' },
      ];
    default:
      return [{ Message: 'No data available' }];
  }
}

// Download as Excel function
function downloadAsExcel(data: Record<string, string>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Download as PDF function
function downloadAsPDF(data: Record<string, string>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .header { text-align: center; margin-bottom: 20px; }
          .date { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${filename}</h1>
          <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

// Dashboard Stats types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalClients: number;
  candidates: number;
  dailyVisits: number;
  attendanceRate: number;
  salesOrders: number;
  expenses: number;
}

export interface MonthlyVisit {
  month: string;
  visits: number;
}

export interface DailyAttendance {
  day: string;
  present: number;
  absent: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
}

export interface DashboardApiResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    monthlyVisits: MonthlyVisit[];
    weeklyAttendance: DailyAttendance[];
    expenseBreakdown: ExpenseByCategory[];
  };
}

// Section Counts types
export interface SectionCounts {
  contacts: number;
  tasks: number;
  orders: number;
  products: number;
}

// Recent Contact types
export interface RecentContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  status: string;
  createdAt: string;
}

// Recent Activity types
export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

// Dashboard API functions
export const dashboardApi = {
  // Get all dashboard data
  getDashboardData: async (): Promise<DashboardApiResponse> => {
    return fetchApi<DashboardApiResponse>('/dashboard/stats', {
      method: 'GET',
    });
  },

  // Get dashboard stats only
  getStats: async (): Promise<{ success: boolean; data: { stats: DashboardStats } }> => {
    return fetchApi<{ success: boolean; data: { stats: DashboardStats } }>('/dashboard/stats', {
      method: 'GET',
    });
  },

  // Get monthly visits
  getMonthlyVisits: async (): Promise<{ success: boolean; data: { monthlyVisits: MonthlyVisit[] } }> => {
    return fetchApi<{ success: boolean; data: { monthlyVisits: MonthlyVisit[] } }>('/dashboard/monthly-visits', {
      method: 'GET',
    });
  },

  // Get weekly attendance
  getWeeklyAttendance: async (): Promise<{ success: boolean; data: { weeklyAttendance: DailyAttendance[] } }> => {
    return fetchApi<{ success: boolean; data: { weeklyAttendance: DailyAttendance[] } }>('/dashboard/weekly-attendance', {
      method: 'GET',
    });
  },

  // Get expense breakdown
  getExpenseBreakdown: async (): Promise<{ success: boolean; data: { expenseBreakdown: ExpenseByCategory[] } }> => {
    return fetchApi<{ success: boolean; data: { expenseBreakdown: ExpenseByCategory[] } }>('/dashboard/expense-breakdown', {
      method: 'GET',
    });
  },

  // Get section counts
  getSectionCounts: async (): Promise<{ success: boolean; data: { sectionCounts: SectionCounts } }> => {
    return fetchApi<{ success: boolean; data: { sectionCounts: SectionCounts } }>('/dashboard/section-counts', {
      method: 'GET',
    });
  },

  // Get recent contacts
  getRecentContacts: async (): Promise<{ success: boolean; data: { recentContacts: RecentContact[] } }> => {
    return fetchApi<{ success: boolean; data: { recentContacts: RecentContact[] } }>('/dashboard/recent-contacts', {
      method: 'GET',
    });
  },

  // Get recent activities
  getRecentActivities: async (): Promise<{ success: boolean; data: { recentActivities: RecentActivity[] } }> => {
    return fetchApi<{ success: boolean; data: { recentActivities: RecentActivity[] } }>('/dashboard/recent-activities', {
      method: 'GET',
    });
  },
};

// Calendar Event types
export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endTime: string | null;
  allDay: boolean;
  type: 'meeting' | 'task' | 'reminder' | 'event';
  assignedTo: string | null;
  location: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  endTime?: string;
  allDay?: boolean;
  type: 'meeting' | 'task' | 'reminder' | 'event';
  assignedTo?: string;
  location?: string;
}

export interface UpdateEventRequest {
  id: number;
  title?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  endTime?: string;
  allDay?: boolean;
  type?: 'meeting' | 'task' | 'reminder' | 'event';
  assignedTo?: string;
  location?: string;
}

// Events API functions
export const eventsApi = {
  // Get all events
  getAll: async (): Promise<{ success: boolean; data: CalendarEvent[] }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent[] }>('/events', {
      method: 'GET',
    });
  },

  // Get event by ID
  getById: async (id: number): Promise<{ success: boolean; data: CalendarEvent }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent }>(`/events/${id}`, {
      method: 'GET',
    });
  },

  // Get events by date
  getByDate: async (date: string): Promise<{ success: boolean; data: CalendarEvent[] }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent[] }>(`/events/date/${date}`, {
      method: 'GET',
    });
  },

  // Get events by date range
  getByDateRange: async (start: string, end: string): Promise<{ success: boolean; data: CalendarEvent[] }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent[] }>(`/events/range?start=${start}&end=${end}`, {
      method: 'GET',
    });
  },

  // Create new event
  create: async (event: CreateEventRequest): Promise<{ success: boolean; data: CalendarEvent; message: string }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent; message: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  // Update event
  update: async (event: UpdateEventRequest): Promise<{ success: boolean; data: CalendarEvent; message: string }> => {
    return fetchApi<{ success: boolean; data: CalendarEvent; message: string }>(`/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  // Delete event
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact types
export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface ContactApiResponse {
  success: boolean;
  message?: string;
  data?: {
    contacts?: Contact[];
    contact?: Contact;
    total?: number;
  };
}

// Contact API functions
export const contactApi = {
  // Submit contact form (public - no auth required)
  submit: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName?: string;
    message?: string;
  }): Promise<ContactApiResponse> => {
    return fetchApi<ContactApiResponse>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all contacts (requires auth)
  getAll: async (params?: { status?: string; search?: string }): Promise<ContactApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return fetchApi<ContactApiResponse>(`/contacts${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single contact (requires auth)
  getById: async (id: number): Promise<ContactApiResponse> => {
    return fetchApi<ContactApiResponse>(`/contacts/${id}`, {
      method: 'GET',
    });
  },

  // Update contact (requires auth)
  update: async (id: number, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    message: string;
    status: 'new' | 'contacted' | 'in-progress' | 'resolved' | 'closed';
  }>): Promise<ContactApiResponse> => {
    return fetchApi<ContactApiResponse>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete contact (requires auth)
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  // Update contact status (requires auth)
  updateStatus: async (id: number, status: 'new' | 'contacted' | 'in-progress' | 'resolved' | 'closed'): Promise<ContactApiResponse> => {
    return fetchApi<ContactApiResponse>(`/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== ORDER MANAGEMENT TYPES ====================

export type OrderStatus = 'Pending' | 'Approved' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderProduct {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  changedAt: string;
  changedBy: number;
  changedByName?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerCompany?: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  createdBy: number;
  createdByName?: string;
  updatedBy?: number;
  statusHistory: OrderStatusHistory[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  minQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
  updatedAt: string;
}

export interface OrderApiResponse {
  success: boolean;
  message?: string;
  data?: {
    orders?: Order[];
    order?: Order;
    products?: Product[];
    total?: number;
  };
  error?: string;
}

// Product API functions
export const productApi = {
  // Get all products
  getAll: async (params?: {
    search?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<OrderApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const queryString = queryParams.toString();
    return fetchApi<OrderApiResponse>(`/products${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single product by ID
  getById: async (id: number): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/products/${id}`, {
      method: 'GET',
    });
  },

  // Create new product
  create: async (data: {
    name: string;
    price: number;
    stock: number;
    unit: string;
    description?: string;
    minQuantity?: number;
  }): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update product
  update: async (id: number, data: Partial<{
    name: string;
    price: number;
    stock: number;
    unit: string;
    description: string;
    minQuantity: number;
  }>): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete product
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle product active status
  toggle: async (id: number): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/products/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};

// Order API functions
export const orderApi = {
  // Get all orders
  getAll: async (params?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    customerId?: number;
  }): Promise<OrderApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.customerId) queryParams.append('customerId', params.customerId.toString());
    
    const queryString = queryParams.toString();
    return fetchApi<OrderApiResponse>(`/orders${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single order by ID
  getById: async (id: number): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/orders/${id}`, {
      method: 'GET',
    });
  },

  // Create new order
  create: async (data: {
    customerId: number;
    products: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    notes?: string;
  }): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update order (only if Pending)
  update: async (id: number, data: Partial<{
    customerId: number;
    products: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    notes: string;
  }>): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update order status
  updateStatus: async (id: number, status: OrderStatus): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Cancel order
  cancel: async (id: number): Promise<OrderApiResponse> => {
    return fetchApi<OrderApiResponse>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Get products list for order
  getProducts: async (search?: string): Promise<OrderApiResponse> => {
    const queryString = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<OrderApiResponse>(`/orders/products/list${queryString}`, {
      method: 'GET',
    });
  },
};

export default authApi;
