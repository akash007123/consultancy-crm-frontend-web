import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, UserCheck, Building2, UserPlus, CalendarDays, Clock, ShoppingCart, Receipt,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { dashboardApi, DashboardStats, MonthlyVisit, DailyAttendance, ExpenseByCategory } from '@/lib/api';

const COLORS = ['hsl(217,91%,50%)', 'hsl(172,66%,50%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(142,71%,45%)'];

import { LucideIcon } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyVisits, setMonthlyVisits] = useState<MonthlyVisit[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<DailyAttendance[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [statsRes, monthlyVisitsRes, weeklyAttendanceRes, expenseRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getMonthlyVisits(),
        dashboardApi.getWeeklyAttendance(),
        dashboardApi.getExpenseBreakdown()
      ]);

      if (statsRes.success && statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }

      if (monthlyVisitsRes.success && monthlyVisitsRes.data?.monthlyVisits) {
        setMonthlyVisits(monthlyVisitsRes.data.monthlyVisits);
      }

      if (weeklyAttendanceRes.success && weeklyAttendanceRes.data?.weeklyAttendance) {
        setWeeklyAttendance(weeklyAttendanceRes.data.weeklyAttendance);
      }

      if (expenseRes.success && expenseRes.data?.expenseBreakdown) {
        setExpenseBreakdown(expenseRes.data.expenseBreakdown);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = stats ? [
    { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'text-primary' },
    { label: 'Active Employees', value: stats.activeEmployees, icon: UserCheck, color: 'text-success' },
    { label: 'Total Clients', value: stats.totalClients, icon: Building2, color: 'text-accent' },
    { label: 'Candidates', value: stats.candidates, icon: UserPlus, color: 'text-info' },
    { label: 'Daily Visits', value: stats.dailyVisits, icon: CalendarDays, color: 'text-warning' },
    { label: 'Attendance %', value: `${stats.attendanceRate}%`, icon: Clock, color: 'text-success' },
    { label: 'Sales Orders', value: stats.salesOrders, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Expenses', value: `₹${(stats.expenses / 1000).toFixed(0)}K`, icon: Receipt, color: 'text-destructive' },
  ] : [
    { label: 'Total Employees', value: '...', icon: Users, color: 'text-primary' },
    { label: 'Active Employees', value: '...', icon: UserCheck, color: 'text-success' },
    { label: 'Total Clients', value: '...', icon: Building2, color: 'text-accent' },
    { label: 'Candidates', value: '...', icon: UserPlus, color: 'text-info' },
    { label: 'Daily Visits', value: '...', icon: CalendarDays, color: 'text-warning' },
    { label: 'Attendance %', value: '...', icon: Clock, color: 'text-success' },
    { label: 'Sales Orders', value: '...', icon: ShoppingCart, color: 'text-primary' },
    { label: 'Expenses', value: '...', icon: Receipt, color: 'text-destructive' },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-heading">Monthly Visits</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyVisits.length > 0 ? monthlyVisits : [
                { month: 'Jan', visits: 0 }, { month: 'Feb', visits: 0 }, { month: 'Mar', visits: 0 },
                { month: 'Apr', visits: 0 }, { month: 'May', visits: 0 }, { month: 'Jun', visits: 0 },
                { month: 'Jul', visits: 0 }, { month: 'Aug', visits: 0 }, { month: 'Sep', visits: 0 },
                { month: 'Oct', visits: 0 }, { month: 'Nov', visits: 0 }, { month: 'Dec', visits: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="hsl(217,91%,50%)" fill="hsl(217,91%,50%)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-heading">Attendance This Week</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyAttendance.length > 0 ? weeklyAttendance : [
                { day: 'Sun', present: 0, absent: 0 },
                { day: 'Mon', present: 0, absent: 0 },
                { day: 'Tue', present: 0, absent: 0 },
                { day: 'Wed', present: 0, absent: 0 },
                { day: 'Thu', present: 0, absent: 0 },
                { day: 'Fri', present: 0, absent: 0 },
                { day: 'Sat', present: 0, absent: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-heading">Expenses Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={expenseBreakdown.length > 0 ? expenseBreakdown : [{ category: 'No Data', amount: 1 }]} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  dataKey="amount" 
                  nameKey="category" 
                  label={({ category }) => category}
                >
                  {(expenseBreakdown.length > 0 ? expenseBreakdown : [{ category: 'No Data', amount: 1 }]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
