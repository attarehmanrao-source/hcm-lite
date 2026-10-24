import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  User,
  LogOut,
  Info,
  Menu,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Announcement } from '../types';

interface NavbarProps {
  activeModule: string;
  setActiveModule: (m: string) => void;
  onOpenAbout: () => void;
  onOpenAI: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void;
  announcements?: Announcement[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  setActiveModule,
  onOpenAbout,
  onOpenAI,
  sidebarCollapsed,
  setSidebarCollapsed,
  announcements = [],
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadAnnouncements = announcements.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('emp') || q.includes('dir') || q.includes('staff')) setActiveModule('employees');
    else if (q.includes('att') || q.includes('clock') || q.includes('punch')) setActiveModule('attendance');
    else if (q.includes('leave') || q.includes('time off') || q.includes('vacation')) setActiveModule('leaves');
    else if (q.includes('pay') || q.includes('salary') || q.includes('slip')) setActiveModule('payroll');
    else if (q.includes('ann') || q.includes('news') || q.includes('broadcast')) setActiveModule('announcements');
    else if (q.includes('audit') || q.includes('log')) setActiveModule('audit');
    else setActiveModule('employees');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white/95 dark:bg-[#071F17]/95 backdrop-blur-md transition-colors">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Zone 1: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#146C43]/10 dark:hover:bg-[#146C43]/20 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5 text-[#0B3D2E] dark:text-[#D4AF37]" />
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('dashboard');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#146C43] dark:from-[#146C43] dark:to-[#0B3D2E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-black text-xs shadow-sm">
              HL
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-[#0B3D2E] dark:text-white flex items-center gap-1.5">
                HCM Lite
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#0B3D2E] dark:text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
                  PRO
                </span>
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Quick Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules, employees, or payroll..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37] transition-all"
            />
          </form>
        </div>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI HR Assistant Trigger */}
          <button
            onClick={onOpenAI}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#146C43] to-[#0B3D2E] hover:from-[#0B3D2E] hover:to-[#146C43] border border-[#D4AF37]/30 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Open Gemini AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline font-medium">Ask AI Assistant</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#146C43]/10 dark:hover:bg-[#146C43]/20 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAnnouncements.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-[#146C43]/40 bg-white dark:bg-[#071F17] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-[#0B3D2E] dark:text-[#D4AF37]">
                    Company Bulletins
                  </span>
                  <button
                    onClick={() => {
                      setActiveModule('announcements');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-[#146C43] dark:text-[#D4AF37] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {unreadAnnouncements.length > 0 ? (
                    unreadAnnouncements.map((ann) => (
                      <div
                        key={ann.id}
                        className="py-2.5 text-xs hover:bg-[#F5F8F5] dark:hover:bg-[#0B3D2E]/30 px-1 rounded transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveModule('announcements');
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#182B24] dark:text-[#F5F8F5] truncate max-w-[180px]">
                            {ann.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#D4AF37]">
                            {ann.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {ann.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No new bulletins
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#146C43]/10 dark:hover:bg-[#146C43]/20 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D4AF37] transition-transform rotate-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#0B3D2E] transition-transform rotate-0" />
            )}
          </button>

          {/* About Modal Trigger */}
          <button
            onClick={onOpenAbout}
            title="Institutional Credentials & About"
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#146C43]/10 dark:hover:bg-[#146C43]/20 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
          </button>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative pl-1">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full border border-[#146C43]/20 dark:border-[#D4AF37]/30 hover:bg-[#146C43]/10 dark:hover:bg-[#146C43]/20 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B3D2E] dark:bg-[#146C43] text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs pr-1">
                  <div className="font-semibold text-[#182B24] dark:text-white leading-tight truncate max-w-[110px]">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-[#146C43]/40 bg-white dark:bg-[#071F17] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-[#182B24] dark:text-white truncate">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <span className="inline-block mt-1 font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-[#146C43]/10 dark:bg-[#146C43]/30 text-[#146C43] dark:text-[#D4AF37] font-bold">
                      {user.role} Privilege
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveModule('employees');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-[#F5F8F5] dark:hover:bg-[#0B3D2E]/40"
                    >
                      <User className="w-4 h-4 text-[#146C43]" />
                      <span>My Profile & Directory</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAbout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-[#F5F8F5] dark:hover:bg-[#0B3D2E]/40"
                    >
                      <Building2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>About SMIT & Mentor</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
