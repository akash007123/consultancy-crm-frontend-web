import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, UserCheck, Building2, UserPlus, CalendarDays, Clock, ShoppingCart, Receipt,
  Mail, CheckSquare, Package, ShoppingBag, RefreshCw, TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, TooltipProps,
} from 'recharts';
import { dashboardApi, DashboardStats, MonthlyVisit, DailyAttendance, ExpenseByCategory, SectionCounts, RecentContact } from '@/lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Custom tooltip components for charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Skeleton loader component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyVisits, setMonthlyVisits] = useState<MonthlyVisit[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<DailyAttendance[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseByCategory[]>([]);
  const [sectionCounts, setSectionCounts] = useState<SectionCounts | null>(null);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, monthlyVisitsRes, weeklyAttendanceRes, expenseRes, sectionCountsRes, recentContactsRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getMonthlyVisits(),
        dashboardApi.getWeeklyAttendance(),
        dashboardApi.getExpenseBreakdown(),
        dashboardApi.getSectionCounts(),
        dashboardApi.getRecentContacts()
      ]);

      if (statsRes.success && statsRes.data?.stats) setStats(statsRes.data.stats);
      if (monthlyVisitsRes.success && monthlyVisitsRes.data?.monthlyVisits) setMonthlyVisits(monthlyVisitsRes.data.monthlyVisits);
      if (weeklyAttendanceRes.success && weeklyAttendanceRes.data?.weeklyAttendance) setWeeklyAttendance(weeklyAttendanceRes.data.weeklyAttendance);
      if (expenseRes.success && expenseRes.data?.expenseBreakdown) setExpenseBreakdown(expenseRes.data.expenseBreakdown);
      if (sectionCountsRes.success && sectionCountsRes.data?.sectionCounts) setSectionCounts(sectionCountsRes.data.sectionCounts);
      if (recentContactsRes.success && recentContactsRes.data?.recentContacts) setRecentContacts(recentContactsRes.data.recentContacts);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statCards: StatCard[] = stats ? [
    { label: 'Total Employees', value: formatNumber(stats.totalEmployees), icon: Users, color: 'text-blue-500', trend: 12 },
    { label: 'Active Employees', value: formatNumber(stats.activeEmployees), icon: UserCheck, color: 'text-green-500', trend: 8 },
    { label: 'Total Clients', value: formatNumber(stats.totalClients), icon: Building2, color: 'text-orange-500', trend: -3 },
    { label: 'Candidates', value: formatNumber(stats.candidates), icon: UserPlus, color: 'text-purple-500', trend: 5 },
    { label: 'Daily Visits', value: formatNumber(stats.dailyVisits), icon: CalendarDays, color: 'text-yellow-500', trend: 2 },
    { label: 'Attendance %', value: `${stats.attendanceRate}%`, icon: Clock, color: 'text-green-500', trend: 1 },
    { label: 'Sales Orders', value: formatNumber(stats.salesOrders), icon: ShoppingCart, color: 'text-blue-500', trend: 15 },
    { label: 'Expenses', value: `₹${(stats.expenses / 1000).toFixed(0)}K`, icon: Receipt, color: 'text-red-500', trend: -4 },
  ] : [];

  const sectionStatCards: StatCard[] = sectionCounts ? [
    { label: 'Contact Submissions', value: formatNumber(sectionCounts.contacts), icon: Mail, color: 'text-blue-500' },
    { label: 'Tasks', value: formatNumber(sectionCounts.tasks), icon: CheckSquare, color: 'text-green-500' },
    { label: 'Orders', value: formatNumber(sectionCounts.orders), icon: ShoppingBag, color: 'text-orange-500' },
    { label: 'Products', value: formatNumber(sectionCounts.products), icon: Package, color: 'text-purple-500' },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              {greeting}, Admin
            </motion.h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : (
            statCards.map((card, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{card.value}</p>
                        {card.trend && (
                          <div className="flex items-center gap-1 mt-2">
                            {card.trend > 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs ${card.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Math.abs(card.trend)}% from last month
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color.replace('text', 'from')}/10 to-transparent`}>
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Section Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : (
            sectionStatCards.map((card, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color.replace('text', 'from')}/10 to-transparent`}>
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Visits Chart */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Monthly Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyVisits.length ? monthlyVisits : []}>
                    <defs>
                      <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visits" stroke="#3b82f6" fill="url(#visitsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Weekly Attendance Chart */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attendance This Week</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyAttendance.length ? weeklyAttendance : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expenses Pie Chart */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Expenses Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={expenseBreakdown.length ? expenseBreakdown : []}
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      dataKey="amount" 
                      nameKey="category"
                      animationDuration={1000}
                      animationBegin={0}
                    >
                      {expenseBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Section Counts Chart */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Section Counts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectionCounts ? [
                    { name: 'Contacts', count: sectionCounts.contacts },
                    { name: 'Tasks', count: sectionCounts.tasks },
                    { name: 'Orders', count: sectionCounts.orders },
                    { name: 'Products', count: sectionCounts.products },
                  ] : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Contacts Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContacts.length > 0 ? (
                      recentContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{contact.firstName} {contact.lastName}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{contact.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              contact.status === 'in-progress' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                              contact.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {contact.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(contact.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">No recent contacts</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}