import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertCircle,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRecord } from '../../types';
import { useToast } from '../../context/ToastContext';

export const LeaveManagementModule: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Review modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRecord | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaves({ status: statusFilter });
      setLeaves(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const canReview = user?.role === 'admin' || user?.role === 'hr';

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await api.applyLeave(formData);
      toast.success('Leave application submitted for approval!');
      setShowApplyModal(false);
      setFormData({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit leave application');
      toast.error(err.message || 'Submission failed');
    }
  };

  const handleReviewAction = async (status: 'Approved' | 'Rejected') => {
    if (!reviewingLeave) return;

    try {
      await api.reviewLeave(reviewingLeave.id, {
        status,
        reviewComment,
      });
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      setReviewingLeave(null);
      setReviewComment('');
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Review action failed');
    }
  };

  const balance = user?.employeeProfile?.leaveBalance || { annual: 14, casual: 10, sick: 8 };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Absence & Time-Off Lifecycle
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Absence workflows, quota allocation, and multi-tier approval processing
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Annual Paid Leave</span>
            <CalendarDays className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-white">
            {balance.annual} <span className="text-xs font-sans font-normal text-slate-400">days left</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0B3D2E] to-[#146C43] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (balance.annual / 18) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Casual Leave</span>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-white">
            {balance.casual} <span className="text-xs font-sans font-normal text-slate-400">days left</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (balance.casual / 10) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Medical / Sick Leave</span>
            <AlertCircle className="w-4 h-4 text-[#146C43]" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-white">
            {balance.sick} <span className="text-xs font-sans font-normal text-slate-400">days left</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#146C43] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (balance.sick / 8) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0B3D2E]/40 border border-slate-200 dark:border-[#146C43]/20 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            statusFilter === ''
              ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#0B3D2E]'
          }`}
        >
          All Requests
        </button>
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#0B3D2E]'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('Approved')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            statusFilter === 'Approved'
              ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#0B3D2E]'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            statusFilter === 'Rejected'
              ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#0B3D2E]'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Leaves Ledger Table */}
      <div className="border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading leave requests...
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-[#146C43]/40 dark:text-[#D4AF37]/40" />
            <div className="text-sm font-bold text-[#0B3D2E] dark:text-white">
              No Leave Requests Recorded
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no leave applications submitted yet under this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#146C43]/15 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4">Duration & Dates</th>
                  <th className="py-3 px-4">Reason Statement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reviewer Note</th>
                  {canReview && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F5F8F5]/80 dark:hover:bg-[#0B3D2E]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#182B24] dark:text-white">{l.employeeName}</div>
                      <span className="font-mono text-[10px] text-[#D4AF37] font-semibold">{l.employeeId}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{l.leaveType}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono tabular-nums font-bold text-[#0B3D2E] dark:text-[#D4AF37]">
                        {l.totalDays} day{l.totalDays > 1 ? 's' : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {l.startDate} &rarr; {l.endDate}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase font-mono ${
                          l.status === 'Approved'
                            ? 'text-[#146C43] dark:text-emerald-400'
                            : l.status === 'Rejected'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-[#D4AF37]'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {l.reviewComment || '-'}
                    </td>
                    {canReview && (
                      <td className="py-3 px-4 text-right">
                        {l.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setReviewingLeave(l);
                              setReviewComment('');
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-lg hover:opacity-90 shadow-2xs"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Closed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B3D2E] dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                <span>Submit Leave Application</span>
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-3 mt-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Leave Category
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                >
                  <option value="Annual">Annual Paid Leave (14d quota)</option>
                  <option value="Casual">Casual Leave (10d quota)</option>
                  <option value="Sick">Medical / Sick Leave (8d quota)</option>
                  <option value="Unpaid">Unpaid Personal Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Statement of Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Detail the circumstances for this time-off request..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B3D2E] dark:text-white">
                Review Leave Application
              </h3>
              <button onClick={() => setReviewingLeave(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 my-4 p-3 rounded-2xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/30 border border-[#146C43]/20">
              <div><strong>Applicant:</strong> {reviewingLeave.employeeName} ({reviewingLeave.employeeId})</div>
              <div><strong>Leave Category:</strong> {reviewingLeave.leaveType}</div>
              <div><strong>Duration:</strong> {reviewingLeave.startDate} to {reviewingLeave.endDate} ({reviewingLeave.totalDays} days)</div>
              <div><strong>Reason:</strong> {reviewingLeave.reason}</div>
            </div>

            <div className="space-y-1 mb-4">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Review Comment (Optional)</label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Approved per annual policy / Medical certificate verified"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleReviewAction('Rejected')}
                className="px-4 py-2 font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('Approved')}
                className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95"
              >
                Approve & Deduct Quota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
