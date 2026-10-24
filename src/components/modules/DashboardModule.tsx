import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CalendarDays,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Briefcase,
  Activity,
  Calendar,
  Layers,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStats, Announcement } from '../../types';

interface DashboardModuleProps {
  setActiveModule: (m: string) => void;
  onOpenAI: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ setActiveModule, onOpenAI }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, annData] = await Promise.all([
          api.getDashboardStats(),
          api.getAnnouncements(),
        ]);
        setStats(statsData);
        setAnnouncements(annData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-slate-200 dark:bg-[#0B3D2E]/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-[#0B3D2E]/40 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 dark:bg-[#0B3D2E]/40 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-100 dark:bg-[#0B3D2E]/40 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Attendance trend data (fallback to 7 days if empty)
  const trendData = stats?.attendanceTrend && stats.attendanceTrend.length > 0
    ? stats.attendanceTrend
    : [
        { dayLabel: 'Mon', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Tue', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Wed', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Thu', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Fri', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Sat', present: 0, late: 0, absent: 0, total: 0 },
        { dayLabel: 'Sun', present: 0, late: 0, absent: 0, total: 0 },
      ];

  const maxTrendVal = Math.max(1, ...trendData.map((t) => t.present + t.late), stats?.totalEmployees || 1);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Executive Management Overview
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role: <strong className="uppercase font-mono text-[#146C43] dark:text-[#D4AF37]">{user?.role}</strong>
            <span className="mx-2">&bull;</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>

        {/* Quick Action Button Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveModule('attendance')}
            className="px-3 py-1.5 text-xs font-semibold text-[#0B3D2E] dark:text-white bg-white dark:bg-[#0B3D2E] hover:bg-[#F5F8F5] dark:hover:bg-[#146C43]/40 border border-[#146C43]/30 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37]" />
            <span>Punch Clock</span>
          </button>

          <button
            onClick={() => setActiveModule('leaves')}
            className="px-3 py-1.5 text-xs font-semibold text-[#0B3D2E] dark:text-white bg-white dark:bg-[#0B3D2E] hover:bg-[#F5F8F5] dark:hover:bg-[#146C43]/40 border border-[#146C43]/30 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Apply Leave</span>
          </button>

          <button
            onClick={onOpenAI}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#146C43] to-[#0B3D2E] hover:opacity-95 border border-[#D4AF37]/40 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Employees */}
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs hover:border-[#146C43]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Workforce</span>
            <div className="w-8 h-8 rounded-xl bg-[#146C43]/10 dark:bg-[#146C43]/30 flex items-center justify-center text-[#146C43] dark:text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-[#0B3D2E] dark:text-[#F5F8F5]">
            {stats?.totalEmployees || 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Active: <strong className="text-[#146C43] dark:text-[#D4AF37]">{stats?.activeEmployees || 0}</strong></span>
            <span>0 Inactive</span>
          </div>
        </div>

        {/* KPI 2: Present Today */}
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs hover:border-[#146C43]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Present Today</span>
            <div className="w-8 h-8 rounded-xl bg-[#146C43]/10 dark:bg-[#146C43]/30 flex items-center justify-center text-[#146C43] dark:text-[#D4AF37]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-[#0B3D2E] dark:text-[#F5F8F5]">
            {stats?.presentToday || 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Attendance Rate:</span>
            <span className="font-mono font-bold text-[#146C43] dark:text-[#D4AF37]">
              {stats?.attendanceRate || 0}%
            </span>
          </div>
        </div>

        {/* KPI 3: Pending Leave Requests */}
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs hover:border-[#D4AF37]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Leaves</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 flex items-center justify-center text-[#0B3D2E] dark:text-[#D4AF37]">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-[#0B3D2E] dark:text-[#F5F8F5]">
            {stats?.pendingLeaves || 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Awaiting Review</span>
            <button
              onClick={() => setActiveModule('leaves')}
              className="text-[#146C43] dark:text-[#D4AF37] font-semibold hover:underline"
            >
              Process &rarr;
            </button>
          </div>
        </div>

        {/* KPI 4: Monthly Payroll */}
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs hover:border-[#146C43]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-[#146C43]/10 dark:bg-[#146C43]/30 flex items-center justify-center text-[#146C43] dark:text-[#D4AF37]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-[#0B3D2E] dark:text-[#F5F8F5] truncate">
            PKR {(stats?.totalPayrollExpense || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Cycle: {stats?.latestPayrollMonth || 'Current'}</span>
            <button
              onClick={() => setActiveModule('payroll')}
              className="text-[#146C43] dark:text-[#D4AF37] font-semibold hover:underline"
            >
              Details &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Charts & Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Trend Chart & Department Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Trend Chart Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
                  <span>7-Day Attendance Trend</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily presence and punctuality curve across organization
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#146C43]" /> Present
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /> Late
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="h-56 w-full pt-4">
              {stats?.totalEmployees === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Clock3 className="w-8 h-8 opacity-40 text-[#146C43]" />
                  <div className="text-xs font-medium">No Attendance Records Yet</div>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Punches will render a live attendance curve here. Register an employee and record check-ins to track trends.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex-1 flex items-end justify-between gap-3 px-2">
                    {trendData.map((item, idx) => {
                      const presentHeight = Math.min(100, Math.round((item.present / maxTrendVal) * 100));
                      const lateHeight = Math.min(100, Math.round((item.late / maxTrendVal) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                          <div className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.present + item.late}
                          </div>
                          <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-40">
                            {/* Late Portion */}
                            {lateHeight > 0 && (
                              <div
                                style={{ height: `${lateHeight}%` }}
                                className="w-full bg-[#D4AF37] transition-all duration-500"
                                title={`Late: ${item.late}`}
                              />
                            )}
                            {/* Present Portion */}
                            <div
                              style={{ height: `${Math.max(4, presentHeight)}%` }}
                              className="w-full bg-gradient-to-t from-[#0B3D2E] to-[#146C43] transition-all duration-500"
                              title={`Present: ${item.present}`}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2">
                            {item.dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Department-wise Employee Chart */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
                  <span>Departmental Workforce Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Headcount allocation across corporate functional teams
                </p>
              </div>
              <button
                onClick={() => setActiveModule('employees')}
                className="text-xs font-semibold text-[#146C43] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>View Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
              <div className="space-y-3.5 pt-2">
                {stats.departmentDistribution.map((dept) => {
                  const percentage = stats.totalEmployees > 0 ? Math.round((dept.count / stats.totalEmployees) * 100) : 0;
                  return (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#182B24] dark:text-[#F5F8F5]">{dept.name}</span>
                        <span className="font-mono font-bold text-[#146C43] dark:text-[#D4AF37]">
                          {dept.count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0B3D2E] via-[#146C43] to-[#D4AF37] rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 opacity-60" />
                <p>No departmental records available.</p>
                <button
                  onClick={() => setActiveModule('employees')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B3D2E] dark:bg-[#146C43] rounded-lg hover:opacity-90 inline-block"
                >
                  Add First Employee
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Broadcasts & Audit Feed */}
        <div className="space-y-6">
          {/* Upcoming Announcements & Bulletins */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white">
                  Corporate Bulletins
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('announcements')}
                className="text-xs text-[#146C43] dark:text-[#D4AF37] font-semibold hover:underline"
              >
                View Board
              </button>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      ann.isPinned
                        ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10'
                        : 'border-slate-100 dark:border-slate-800 bg-[#F5F8F5]/80 dark:bg-[#071F17]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#182B24] dark:text-white truncate max-w-[180px]">
                        {ann.title}
                      </span>
                      {ann.isPinned && (
                        <span className="text-[10px] font-mono font-bold text-[#D4AF37]">PINNED</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                      <span>{ann.authorName}</span>
                      <span>&bull;</span>
                      <span>{ann.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active announcements published.
              </div>
            )}
          </div>

          {/* Recent Activity & Compliance Audit Log */}
          {user?.role === 'admin' && stats?.recentActivity && stats.recentActivity.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white">
                    Audit Activity Feed
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModule('audit')}
                  className="text-xs text-[#146C43] dark:text-[#D4AF37] font-semibold hover:underline"
                >
                  Full Trail
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {stats.recentActivity.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-[#F5F8F5] dark:bg-[#071F17]/50 border border-slate-100 dark:border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center justify-between font-mono text-slate-400 text-[10px]">
                      <span className="font-bold text-[#146C43] dark:text-[#D4AF37]">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium truncate mt-0.5">
                      {log.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
