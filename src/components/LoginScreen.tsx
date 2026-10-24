import React, { useState } from 'react';
import { LogIn, Shield, AlertCircle, BookOpen, Key, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.token && res.user) {
        toast.success(`Welcome back, ${res.user.fullName}!`);
        login(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F8F5] dark:bg-[#061913] px-4 py-8 transition-colors">
      <div className="max-w-md mx-auto w-full my-auto">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0B3D2E] to-[#146C43] border border-[#D4AF37]/50 text-[#D4AF37] shadow-lg mb-3 font-black text-2xl">
            HL
          </div>
          <h1 className="text-2xl font-black text-[#0B3D2E] dark:text-white">
            HCM Lite HRMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI-Assisted Human Resource Management System
          </p>
        </div>

        {/* Institutional Acknowledgment Banner */}
        <div className="mb-6 p-4 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#F5F8F5] to-amber-50/60 dark:from-[#0B3D2E]/60 dark:to-[#071F17] text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block mb-0.5 text-[#0B3D2E] dark:text-[#D4AF37]">
                M. Atta ur Rehman Khan &bull; Roll No: 777760
              </span>
              <p className="italic text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-serif">
                "I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today."
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#071F17] rounded-3xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black text-[#0B3D2E] dark:text-white">
              Corporate Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your corporate credentials to access your designated workspace
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#D4AF37]" />
                  <span>Authenticate & Launch Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helpers */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
              Sample Credentials (if demo seeded):
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => fillQuickLogin('admin@hcmlite.com', 'admin123')}
                className="p-2 text-[11px] rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 hover:bg-[#146C43]/10 border border-[#146C43]/20 font-bold text-[#0B3D2E] dark:text-[#D4AF37] cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('hr@hcmlite.com', 'hr123')}
                className="p-2 text-[11px] rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 hover:bg-[#146C43]/10 border border-[#146C43]/20 font-bold text-[#0B3D2E] dark:text-[#D4AF37] cursor-pointer"
              >
                HR Lead
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('employee@hcmlite.com', 'emp123')}
                className="p-2 text-[11px] rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 hover:bg-[#146C43]/10 border border-[#146C43]/20 font-bold text-[#0B3D2E] dark:text-[#D4AF37] cursor-pointer"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        HCM Lite Enterprise &bull; SMIT Saylani Mass IT Training &bull; Mentor: Sir Azeem
      </div>
    </div>
  );
};
