import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, Activity, User, FileText, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AuditLogModule: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({ action: actionFilter, limit: 200 });
      setLogs(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Governance & Operational Auditing
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            System Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable chronological ledger tracking authentication, payroll execution, and administrative mutations
          </p>
        </div>

        <button
          onClick={() => {
            fetchLogs();
            toast.info('Audit log synchronized');
          }}
          className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 rounded-xl hover:bg-[#F5F8F5] transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37]" />
          <span>Refresh Audit Feed</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 dark:border-[#D4AF37]/20 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, operation, or details..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none"
          >
            <option value="">All Audit Operations</option>
            <option value="USER_LOGIN">User Logins (USER_LOGIN)</option>
            <option value="CREATE_EMPLOYEE">Employee Created (CREATE_EMPLOYEE)</option>
            <option value="CHECK_IN">Shift Punches (CHECK_IN / CHECK_OUT)</option>
            <option value="APPLY_LEAVE">Leaves (APPLY_LEAVE / REVIEW_LEAVE)</option>
            <option value="RUN_PAYROLL">Payroll (RUN_PAYROLL)</option>
            <option value="POST_ANNOUNCEMENT">Announcements (POST_ANNOUNCEMENT)</option>
            <option value="RESET_EMPLOYEE_PASSWORD">Password Resets (RESET_PASSWORD)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading compliance audit trail...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-[#146C43]/40 dark:text-[#D4AF37]/40" />
            <div className="text-base font-bold text-[#0B3D2E] dark:text-white">
              No Audit Events Recorded
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              System operations, attendance checks, and payroll disbursements will be recorded here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#146C43]/15 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Operation Details</th>
                  <th className="py-3 px-4 text-right">Context IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F8F5]/80 dark:hover:bg-[#0B3D2E]/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#182B24] dark:text-white">{log.userName}</div>
                      <div className="text-[10px] font-mono uppercase text-[#D4AF37] font-semibold">{log.userRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-[#146C43]/10 dark:bg-[#146C43]/30 px-2 py-0.5 rounded text-[#146C43] dark:text-[#D4AF37] font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{log.entityType}</div>
                      <span className="font-mono text-[10px] text-slate-400">{log.entityId}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 text-right whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
