import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const FirstSignInModal: React.FC = () => {
  const { user, refreshMe } = useAuth();
  const toast = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !user.isFirstSignIn) return null;

  // Password strength logic
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getStrength(newPassword);

  const getStrengthLabel = (s: number) => {
    if (!newPassword) return { label: 'Empty', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' };
    if (s <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (s <= 3) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (s === 4) return { label: 'Good', color: 'bg-[#146C43]', text: 'text-[#146C43]' };
    return { label: 'Strong', color: 'bg-[#D4AF37]', text: 'text-[#D4AF37]' };
  };

  const strengthInfo = getStrengthLabel(strength);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length');
      toast.error('Password must be at least 6 characters in length');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entry.');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ newPassword });
      toast.success('Password successfully updated. Welcome aboard!');
      await refreshMe();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 relative overflow-hidden">
        {/* Top Gold & Emerald decorative banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B3D2E] via-[#146C43] to-[#D4AF37]" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B3D2E]/10 dark:bg-[#146C43]/20 text-[#146C43] dark:text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#146C43]/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4AF37] bg-[#0B3D2E]/5 dark:bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
              Security Compliance
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
              Set Permanent Password
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Welcome to HCM Lite, <strong className="text-slate-900 dark:text-slate-200">{user.fullName}</strong>. You are logging in with a default or administrative credential. Please configure a confidential personal password to access your dashboard.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Confidential Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#146C43] dark:focus:ring-[#D4AF37] transition-all"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Security Strength:</span>
                  <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full flex-1 transition-all duration-300 ${
                        strength >= lvl ? strengthInfo.color : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#146C43] dark:focus:ring-[#D4AF37] transition-all"
              placeholder="Re-enter your new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:from-[#146C43] hover:to-[#0B3D2E] rounded-xl shadow-md shadow-[#0B3D2E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Securing Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Update Password & Enter Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
