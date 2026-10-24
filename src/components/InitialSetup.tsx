import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Sparkles, AlertCircle, ArrowRight, BookOpen, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const InitialSetup: React.FC = () => {
  const { login, checkSystemStatus } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('M. Atta ur Rehman Khan');
  const [email, setEmail] = useState('admin@hcmlite.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.setupFirstAdmin({
        fullName,
        email,
        password,
      });

      if (res.token && res.user) {
        toast.success(`Organization initialized! Welcome, Administrator ${res.user.fullName}!`);
        login(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize administrator account');
      toast.error(err.message || 'Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setError(null);
    setSeedingLoading(true);
    try {
      await api.seedDemo();
      await checkSystemStatus();
      const res = await api.login({ email: 'admin@hcmlite.com', password: 'admin123' });
      if (res.token && res.user) {
        toast.success('Demonstration organizational structure populated!');
        login(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to seed sample organizational data');
      toast.error(err.message || 'Seeding failed');
    } finally {
      setSeedingLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F8F5] dark:bg-[#061913] px-4 py-8 transition-colors">
      <div className="max-w-xl mx-auto w-full my-auto">
        {/* Brand / Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0B3D2E] to-[#146C43] border border-[#D4AF37]/50 text-[#D4AF37] shadow-lg mb-3 font-black text-2xl">
            HL
          </div>
          <h1 className="text-2xl font-black text-[#0B3D2E] dark:text-white">
            HCM Lite HRMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise Human Capital Management &bull; Clean Slate Initialization
          </p>
        </div>

        {/* Institutional Acknowledgment Banner */}
        <div className="mb-6 p-4 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#F5F8F5] to-amber-50/60 dark:from-[#0B3D2E]/60 dark:to-[#071F17] text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block mb-0.5 text-[#0B3D2E] dark:text-[#D4AF37]">
                Developed by M. Atta ur Rehman Khan &bull; Roll No: 777760
              </span>
              <p className="italic text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-serif">
                "I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today."
              </p>
            </div>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white dark:bg-[#071F17] rounded-3xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#146C43] dark:text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Initial Organization Provisioning
            </div>
            <h2 className="text-lg font-black text-[#0B3D2E] dark:text-white mt-1">
              Create Super Administrator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The system starts with zero dummy data. Configure your primary Administrator credentials to take ownership of this HCM Lite instance.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
                placeholder="e.g. M. Atta ur Rehman Khan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrator Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
                placeholder="admin@organization.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                'Initializing Clean Database...'
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Initialize Clean Admin & Launch System</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Option for Evaluator Convenience */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-3 font-semibold">
              Need sample data to evaluate all 9 modules immediately?
            </span>
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={seedingLoading}
              className="px-4 py-2.5 text-xs font-bold text-[#0B3D2E] dark:text-[#D4AF37] bg-[#F5F8F5] dark:bg-[#0B3D2E]/50 hover:bg-[#146C43]/15 border border-[#146C43]/20 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{seedingLoading ? 'Generating Demonstration Records...' : 'Populate Sample Data for Immediate Review'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        HCM Lite Enterprise &bull; SMIT Saylani Mass IT Training &bull; Instructor: Sir Azeem
      </div>
    </div>
  );
};
