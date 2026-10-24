import React, { useEffect, useState } from 'react';
import {
  Banknote,
  Play,
  Download,
  Eye,
  Calendar,
  Filter,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PayrollRecord } from '../../types';
import { PayslipModal } from '../PayslipModal';
import { generatePayslipPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';

export const PayrollModule: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = await api.getPayroll({ month: selectedMonth });
      setPayrollList(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth]);

  const canRunPayroll = user?.role === 'admin' || user?.role === 'hr';

  const handleRunPayrollCycle = async () => {
    if (!confirm(`Execute official payroll disbursement run for cycle: ${selectedMonth}? This will calculate net pay, taxes, and provident funds for all active employees.`)) {
      return;
    }

    setRunLoading(true);
    try {
      const res = await api.runPayroll(selectedMonth);
      toast.success(`Payroll cycle ${selectedMonth} processed! ${res.processedCount} payslips compiled.`);
      fetchPayroll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute payroll cycle');
    } finally {
      setRunLoading(false);
    }
  };

  const totalCycleExpense = payrollList.reduce((acc, p) => acc + p.netSalary, 0);
  const totalTaxWithheld = payrollList.reduce((acc, p) => acc + p.taxDeduction, 0);
  const totalProvidentFund = payrollList.reduce((acc, p) => acc + p.providentFund, 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Compensation, Taxes & Benefits Administration
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Payroll & Compensation Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated statutory tax deduction, provident fund accrual, and instant PDF payslip distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Pay Period:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100"
            />
          </div>

          {canRunPayroll && (
            <button
              onClick={handleRunPayrollCycle}
              disabled={runLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
              <span>{runLoading ? 'Computing Cycle...' : 'Run Payroll Cycle'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cycle Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Net Disbursement</span>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-[#D4AF37] truncate">
            PKR {totalCycleExpense.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Cycle: <strong className="font-mono text-[#182B24] dark:text-white">{selectedMonth}</strong></span>
            <span>{payrollList.length} employees</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Statutory Tax Withheld</span>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#146C43] dark:text-emerald-400 truncate">
            PKR {totalTaxWithheld.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>FBR Income Tax Bracket</span>
            <span>Progressive</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Provident Fund Reserve</span>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-white truncate">
            PKR {totalProvidentFund.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Employer Match: 5%</span>
            <span className="font-bold text-[#146C43] dark:text-[#D4AF37]">Accrued</span>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white">
              Salary Statements &bull; Cycle {selectedMonth}
            </h3>
            <span className="text-[11px] text-slate-500">
              {payrollList.length} total payslips compiled
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading payroll ledger...
          </div>
        ) : payrollList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileCheck2 className="w-10 h-10 mx-auto text-[#146C43]/40 dark:text-[#D4AF37]/40" />
            <div className="text-sm font-bold text-[#0B3D2E] dark:text-white">
              No Payroll Statements for {selectedMonth}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Execute a payroll cycle using the button above to calculate gross earnings, deductions, and generate downloadable PDF payslips.
            </p>
            {canRunPayroll && (
              <button
                onClick={handleRunPayrollCycle}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl inline-flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                <span>Execute Payroll for {selectedMonth}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#146C43]/15 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Designation</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Tax & PF</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4 text-right">Payslip Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrollList.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F8F5]/80 dark:hover:bg-[#0B3D2E]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#182B24] dark:text-white">{p.employeeName}</div>
                      <span className="font-mono text-[10px] text-[#D4AF37] font-semibold">{p.employeeId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{p.designation}</div>
                      <div className="text-[11px] text-slate-500">{p.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      PKR {p.baseSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      +PKR {p.allowances.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-rose-600 dark:text-rose-400 text-[11px]">
                      -PKR {(p.taxDeduction + p.providentFund).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-black text-[#146C43] dark:text-[#D4AF37] text-sm">
                      PKR {p.netSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActivePayslip(p)}
                          title="Preview Payslip"
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#071F17] border border-slate-200 dark:border-slate-700 hover:border-[#146C43] rounded-lg flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-[#146C43] dark:text-[#D4AF37]" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => {
                            generatePayslipPDF(p);
                            toast.success(`Payslip for ${p.employeeName} downloaded!`);
                          }}
                          title="Download Official PDF"
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0B3D2E] dark:bg-[#146C43] hover:opacity-90 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3 h-3 text-[#D4AF37]" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal Component */}
      <PayslipModal record={activePayslip} onClose={() => setActivePayslip(null)} />
    </div>
  );
};
