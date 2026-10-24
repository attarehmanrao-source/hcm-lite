import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { InitialSetup } from './components/InitialSetup';
import { LoginScreen } from './components/LoginScreen';
import { FirstSignInModal } from './components/FirstSignInModal';
import { AboutModal } from './components/AboutModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { Announcement } from './types';
import { api } from './services/api';

// Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { EmployeeDirectoryModule } from './components/modules/EmployeeDirectoryModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { LeaveManagementModule } from './components/modules/LeaveManagementModule';
import { PayrollModule } from './components/modules/PayrollModule';
import { AnnouncementsModule } from './components/modules/AnnouncementsModule';
import { AuditLogModule } from './components/modules/AuditLogModule';

const MainLayout: React.FC = () => {
  const { user, loading, systemInitialized } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Load bulletins for top navbar notification dropdown
  useEffect(() => {
    if (user) {
      api.getAnnouncements()
        .then(setAnnouncements)
        .catch((err) => console.error('Failed to load announcements for notification center:', err));
    }
  }, [user, activeModule]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8F5] dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#146C43]/20 border-t-[#146C43] dark:border-t-[#D4AF37] rounded-full animate-spin" />
          <span className="text-xs font-mono font-medium text-[#182B24] dark:text-slate-300">
            Bootstrapping HCM Lite Enterprise...
          </span>
        </div>
      </div>
    );
  }

  // If system has no admin, show initial clean setup
  if (systemInitialized === false) {
    return <InitialSetup />;
  }

  // If not authenticated, show corporate login
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F5] dark:bg-slate-950 text-[#182B24] dark:text-slate-100 transition-colors">
      {/* Forced First Sign-In Password Reset Modal */}
      <FirstSignInModal />

      {/* Top Bar Header */}
      <Navbar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenAbout={() => setShowAbout(true)}
        onOpenAI={() => setShowAI(true)}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        announcements={announcements}
      />

      {/* Main Container: Sidebar + Content Viewport */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 gap-4 sm:gap-6">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onOpenAbout={() => setShowAbout(true)}
          onOpenAI={() => setShowAI(true)}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-140px)] transition-all duration-300">
          {activeModule === 'dashboard' && (
            <DashboardModule
              setActiveModule={setActiveModule}
              onOpenAI={() => setShowAI(true)}
            />
          )}

          {activeModule === 'employees' && <EmployeeDirectoryModule />}
          {activeModule === 'attendance' && <AttendanceModule />}
          {activeModule === 'leaves' && <LeaveManagementModule />}
          {activeModule === 'payroll' && <PayrollModule />}
          {activeModule === 'announcements' && <AnnouncementsModule />}
          {activeModule === 'audit' && <AuditLogModule />}
        </main>
      </div>

      {/* Global Application Footer with Institutional Acknowledgment */}
      <Footer />

      {/* About & Credentials Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* AI Assistant Drawer with Gemini 3.8 Flash Tool Calling */}
      <AIAssistantDrawer isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
