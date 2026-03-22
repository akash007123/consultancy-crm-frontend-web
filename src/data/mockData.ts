export const employees = [
  { id: '1', name: 'Amit Sharma', mobile: '9876543210', email: 'amit@company.com', role: 'manager' as const, department: 'Sales', status: 'active' as const, joinDate: '2023-01-15', salary: 45000 },
  { id: '2', name: 'Priya Patel', mobile: '9876543211', email: 'priya@company.com', role: 'hr' as const, department: 'HR', status: 'active' as const, joinDate: '2023-03-20', salary: 38000 },
  { id: '3', name: 'Rahul Singh', mobile: '9876543212', email: 'rahul@company.com', role: 'employee' as const, department: 'Sales', status: 'active' as const, joinDate: '2023-06-10', salary: 28000 },
  { id: '4', name: 'Sneha Gupta', mobile: '9876543213', email: 'sneha@company.com', role: 'employee' as const, department: 'Marketing', status: 'inactive' as const, joinDate: '2023-02-28', salary: 30000 },
  { id: '5', name: 'Vikram Reddy', mobile: '9876543214', email: 'vikram@company.com', role: 'manager' as const, department: 'Operations', status: 'active' as const, joinDate: '2022-11-05', salary: 50000 },
  { id: '6', name: 'Neha Joshi', mobile: '9876543215', email: 'neha@company.com', role: 'employee' as const, department: 'Sales', status: 'active' as const, joinDate: '2024-01-12', salary: 25000 },
];

export const clients = [
  { id: '1', company: 'TechVista Solutions', contact: 'Arun Mehta', phone: '9988776655', email: 'arun@techvista.com', industry: 'IT', address: 'Mumbai, MH' },
  { id: '2', company: 'GreenLeaf Pharma', contact: 'Kavita Rao', phone: '9988776656', email: 'kavita@greenleaf.com', industry: 'Pharma', address: 'Pune, MH' },
  { id: '3', company: 'BuildRight Construction', contact: 'Suresh Nair', phone: '9988776657', email: 'suresh@buildright.com', industry: 'Construction', address: 'Bangalore, KA' },
  { id: '4', company: 'FoodChain Retail', contact: 'Meena Iyer', phone: '9988776658', email: 'meena@foodchain.com', industry: 'Retail', address: 'Chennai, TN' },
];

export const tasks = [
  { id: '1', title: 'Follow up with TechVista', description: 'Discuss new requirements for IT staffing', priority: 'high' as const, assignee: 'Amit Sharma', dueDate: '2026-03-15', status: 'in-progress' as const },
  { id: '2', title: 'Screen candidates for GreenLeaf', description: 'Review 20 applications for pharma roles', priority: 'medium' as const, assignee: 'Priya Patel', dueDate: '2026-03-18', status: 'pending' as const },
  { id: '3', title: 'Client visit - BuildRight', description: 'On-site meeting for contract renewal', priority: 'high' as const, assignee: 'Rahul Singh', dueDate: '2026-03-12', status: 'completed' as const },
  { id: '4', title: 'Update candidate database', description: 'Add new candidates from job fair', priority: 'low' as const, assignee: 'Sneha Gupta', dueDate: '2026-03-20', status: 'pending' as const },
];

export const visits = [
  { id: '1', client: 'TechVista Solutions', employee: 'Amit Sharma', date: '2026-03-10', checkIn: '10:30 AM', checkOut: '12:00 PM', location: 'Mumbai', remarks: 'Discussed Q2 hiring plan' },
  { id: '2', client: 'GreenLeaf Pharma', employee: 'Rahul Singh', date: '2026-03-10', checkIn: '02:00 PM', checkOut: '03:30 PM', location: 'Pune', remarks: 'Contract review meeting' },
  { id: '3', client: 'BuildRight Construction', employee: 'Vikram Reddy', date: '2026-03-09', checkIn: '11:00 AM', checkOut: '01:00 PM', location: 'Bangalore', remarks: 'Site visit for new requirements' },
];

export const attendance = [
  { id: '1', employee: 'Amit Sharma', date: '2026-03-10', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'present' as const },
  { id: '2', employee: 'Priya Patel', date: '2026-03-10', checkIn: '09:30 AM', checkOut: '06:00 PM', hours: '8h 30m', status: 'late' as const },
  { id: '3', employee: 'Rahul Singh', date: '2026-03-10', checkIn: '08:55 AM', checkOut: '06:30 PM', hours: '9h 35m', status: 'present' as const },
  { id: '4', employee: 'Sneha Gupta', date: '2026-03-10', checkIn: '-', checkOut: '-', hours: '-', status: 'absent' as const },
  { id: '5', employee: 'Vikram Reddy', date: '2026-03-10', checkIn: '09:00 AM', checkOut: '06:00 PM', hours: '9h 00m', status: 'present' as const },
];

export const dashboardStats = {
  totalEmployees: 48,
  activeEmployees: 42,
  totalClients: 156,
  candidates: 1240,
  dailyVisits: 23,
  attendanceRate: 87,
  salesOrders: 34,
  expenses: 245000,
};

export const monthlyVisitsData = [
  { month: 'Jan', visits: 120 }, { month: 'Feb', visits: 145 }, { month: 'Mar', visits: 168 },
  { month: 'Apr', visits: 132 }, { month: 'May', visits: 190 }, { month: 'Jun', visits: 175 },
  { month: 'Jul', visits: 210 }, { month: 'Aug', visits: 195 }, { month: 'Sep', visits: 220 },
  { month: 'Oct', visits: 198 }, { month: 'Nov', visits: 240 }, { month: 'Dec', visits: 215 },
];

export const expenseData = [
  { category: 'Travel', amount: 85000 }, { category: 'Food', amount: 32000 },
  { category: 'Petrol', amount: 48000 }, { category: 'Accommodation', amount: 45000 },
  { category: 'Misc', amount: 35000 }, { category: 'Travel', amount: 85000 }, { category: 'Food', amount: 32000 },
  { category: 'Petrol', amount: 48000 }, { category: 'Accommodation', amount: 45000 },
  { category: 'Misc', amount: 35000 },
];

export const attendanceData = [
  { day: 'Mon', present: 40, absent: 8 }, { day: 'Tue', present: 42, absent: 6 },
  { day: 'Wed', present: 38, absent: 10 }, { day: 'Thu', present: 44, absent: 4 },
  { day: 'Fri', present: 41, absent: 7 },
];
