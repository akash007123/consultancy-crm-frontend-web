import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, UserCheck, Building2, UserPlus, CalendarDays, Clock, ShoppingCart, Receipt,
} from 'lucide-react';
import { dashboardStats, monthlyVisitsData, attendanceData, expenseData } from '@/data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['hsl(217,91%,50%)', 'hsl(172,66%,50%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(142,71%,45%)'];

const statCards = [
  { label: 'Total Employees', value: dashboardStats.totalEmployees, icon: Users, color: 'text-primary' },
  { label: 'Active Employees', value: dashboardStats.activeEmployees, icon: UserCheck, color: 'text-success' },
  { label: 'Total Clients', value: dashboardStats.totalClients, icon: Building2, color: 'text-accent' },
  { label: 'Candidates', value: dashboardStats.candidates, icon: UserPlus, color: 'text-info' },
  { label: 'Daily Visits', value: dashboardStats.dailyVisits, icon: CalendarDays, color: 'text-warning' },
  { label: 'Attendance %', value: `${dashboardStats.attendanceRate}%`, icon: Clock, color: 'text-success' },
  { label: 'Sales Orders', value: dashboardStats.salesOrders, icon: ShoppingCart, color: 'text-primary' },
  { label: 'Expenses', value: `₹${(dashboardStats.expenses / 1000).toFixed(0)}K`, icon: Receipt, color: 'text-destructive' },
];

export default function DashboardPage() {
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
              <AreaChart data={monthlyVisitsData}>
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
              <BarChart data={attendanceData}>
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
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="amount" nameKey="category" label={({ category }) => category}>
                  {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
