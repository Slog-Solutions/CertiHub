import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Users, BookOpen, CreditCard, Award, ArrowUpRight, Loader, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Dashboard = () => {
  const { api } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-xs text-[var(--text-muted)] font-semibold">Aggregating platform metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 bg-[var(--bg-cream)] flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-sm shadow-md">
          <p className="text-sm text-rose-500 font-semibold">{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  const { cards, charts } = data;

  const cardItems = [
    {
      title: 'Total Candidates',
      value: cards.totalStudents,
      icon: Users,
      color: 'from-emerald-500/10 to-teal-500/5',
      iconColor: 'text-emerald-500',
      label: 'Registrations count'
    },
    {
      title: 'Active Courses',
      value: cards.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500/10 to-cyan-500/5',
      iconColor: 'text-blue-500',
      label: 'Syllabus master records'
    },
    {
      title: 'Total Revenue',
      value: `INR ${cards.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'from-amber-500/10 to-orange-500/5',
      iconColor: 'text-amber-500',
      label: 'Tuition installments logged'
    },
    {
      title: 'Certificates Issued',
      value: cards.totalCertificates,
      icon: Award,
      color: 'from-purple-500/10 to-pink-500/5',
      iconColor: 'text-purple-500',
      label: 'Verification seals'
    }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] p-8 overflow-y-auto space-y-8 transition-colors duration-300">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Real-time aggregate data and analytics</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((card) => (
          <div
            key={card.title}
            className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-start justify-between shadow-sm relative overflow-hidden card-custom"
          >
            {/* Background design glow */}
            <div className={`absolute -right-12 -bottom-12 h-24 w-24 rounded-full bg-gradient-to-tr ${card.color} blur-xl`} />

            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{card.title}</span>
              <h3 className="text-2xl font-extrabold text-[var(--text-dark)] leading-tight">{card.value}</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold">{card.label}</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-cream)] border border-[var(--border-color)] shadow-sm relative z-10">
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Graphical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration trend (Area Chart) */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-dark)]">Candidate Registration Trend</h4>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-semibold">Monthly enrollments aggregated</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="h-72 w-full text-xs">
            {charts.registrations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] font-semibold">No registration history available yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.registrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} fontWeight={600} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={600} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-dark)', fontSize: '11px', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#regGrad)" name="Registered" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payments collection (Bar Chart) */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-dark)]">Revenue Collections Trend</h4>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-semibold">Monthly financial summaries aggregated</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="h-72 w-full text-xs">
            {charts.payments.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] font-semibold">No payment history logged yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.payments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} fontWeight={600} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={600} />
                  <Tooltip formatter={(value) => [`INR ${value}`, 'Amount']} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-dark)', fontSize: '11px', fontWeight: 600 }} />
                  <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} name="Received Fee" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
