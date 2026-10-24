import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  Megaphone,
  ShieldCheck,
  Bot,
  Info,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (m: string) => void;
  onOpenAbout: () => void;
  onOpenAI: () => void;
  collapsed: boolean;
  setCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  onOpenAbout,
  onOpenAI,
  collapsed,
  setCollapsed,
}) => {
  const { user, logout, checkSystemStatus, login } = useAuth();
  const toast = useToast();

  const handleResetDB = async () => {
    if (confirm('Are you sure you want to reset the database to a 100% clean empty state? All data will be purged.')) {
      try {
        await api.resetDatabase();
        logout();
        await checkSystemStatus();
        toast.info('Database has been reset to clean empty state.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to reset database');
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'] },
    { id: 'employees', label: 'Employee Directory', icon: Users, roles: ['admin', 'hr', 'employee'] },
    { id: 'attendance', label: 'Attendance Tracking', icon: Clock, roles: ['admin', 'hr', 'employee'] },
    { id: 'leaves', label: 'Leave Management', icon: CalendarDays, roles: ['admin', 'hr', 'employee'] },
    { id: 'payroll', label: 'Payroll & Payslips', icon: Banknote, roles: ['admin', 'hr', 'employee'] },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['admin', 'hr', 'employee'] },
    { id: 'audit', label: 'Compliance Audit Trail', icon: ShieldCheck, roles: ['admin'] },
  ];

  const allowedNav = navItems.filter((item) => !user || item.roles.includes(user.role));

  return (
    <aside
      className={`shrink-0 border-r border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#071F17] flex flex-col justify-between transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-20' : 'w-64'
      } min-h-[calc(100vh-53px)]`}
    >
      {/* Upper Navigation Section */}
      <div className="p-3 space-y-4">
        {/* User Identity / Role pill */}
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/50 border border-[#146C43]/20 dark:border-[#D4AF37]/20 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                Active Session
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-[#0B3D2E] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#0B3D2E] shadow-2xs">
                {user?.role || 'Guest'}
              </span>
            </div>
            <div className="font-bold text-xs text-[#182B24] dark:text-[#F5F8F5] truncate">
              {user?.fullName || 'User'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            {user?.employeeId && (
              <div className="text-[10px] font-mono text-[#146C43] dark:text-[#D4AF37] mt-1 font-semibold">
                ID: {user.employeeId}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-[#0B3D2E] dark:bg-[#146C43] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm shadow-xs"
              title={`${user?.fullName} (${user?.role})`}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider px-3 mb-2">
              HR Modules
            </div>
          )}

          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0B3D2E] to-[#146C43] text-white shadow-sm font-semibold border-l-3 border-[#D4AF37]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-[#F5F8F5] dark:hover:bg-[#0B3D2E]/40 hover:text-[#0B3D2E] dark:hover:text-[#D4AF37]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-[#146C43] dark:group-hover:text-[#D4AF37]'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* AI HR Assistant Button in Sidebar */}
        <div className="pt-2">
          <button
            onClick={onOpenAI}
            title={collapsed ? 'AI HR Assistant' : undefined}
            className={`w-full flex items-center rounded-xl bg-gradient-to-r from-[#146C43]/15 to-[#0B3D2E]/10 dark:from-[#D4AF37]/15 dark:to-[#146C43]/20 border border-[#146C43]/30 dark:border-[#D4AF37]/30 text-[#0B3D2E] dark:text-[#D4AF37] hover:bg-[#146C43]/20 transition-all cursor-pointer text-xs ${
              collapsed ? 'justify-center p-2.5' : 'justify-between p-2.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
              {!collapsed && <span className="font-bold">AI Assistant</span>}
            </div>
            {!collapsed && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
          </button>
        </div>
      </div>

      {/* Lower Actions & Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-[#0B3D2E] dark:hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {/* Reset Database for Admin */}
        {user?.role === 'admin' && (
          <button
            onClick={handleResetDB}
            title={collapsed ? 'Reset Database (Clean Slate)' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Reset Database</span>}
          </button>
        )}

        {/* Institutional Branding Badge */}
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 dark:border-[#D4AF37]/20 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[#0B3D2E] dark:text-[#D4AF37] block">
              M. Atta ur Rehman Khan
            </span>
            <span>Roll No: 777760 &bull; SMIT</span>
          </div>
        )}
      </div>
    </aside>
  );
};
