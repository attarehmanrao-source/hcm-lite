import React from 'react';
import { X, Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PayrollRecord } from '../types';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';

interface PayslipModalProps {
  record: PayrollRecord | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ record, onClose }) => {
  const toast = useToast();
  if (!record) return null;

  const totalGross = record.baseSalary + record.allowances + record.overtimeBonus;
  const totalDeductions = record.taxDeduction + record.providentFund + record.otherDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#0B3D2E] dark:text-white uppercase tracking-wider">
              Official Salary Statement &bull; {record.payrollMonth}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#071F17] border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                generatePayslipPDF(record);
                toast.success(`Payslip PDF downloaded for ${record.employeeName}`);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs" id="printable-payslip">
          {/* Company Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-lg font-black text-[#0B3D2E] dark:text-white flex items-center gap-2">
                <span>HCM LITE ENTERPRISE SYSTEMS</span>
                <span className="text-[10px] font-mono font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/15">
                  OFFICIAL
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Department of Compensation &bull; Document Reference: <span className="font-mono">{record.id}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#146C43] dark:text-[#D4AF37] bg-[#146C43]/10 dark:bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#146C43]/20 dark:border-[#D4AF37]/20">
                STATUS: {record.paymentStatus.toUpperCase()}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Processed: {record.processedAt.split('T')[0]}</div>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/30 border border-[#146C43]/15 dark:border-[#D4AF37]/20">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Employee ID</span>
              <span className="font-mono font-bold text-[#D4AF37]">{record.employeeId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Employee Name</span>
              <span className="font-bold text-[#182B24] dark:text-white">{record.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Department</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{record.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Designation</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{record.designation}</span>
            </div>
          </div>

          {/* Earnings & Deductions Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-[#F5F8F5] dark:bg-[#0B3D2E]/50 px-4 py-2 font-bold text-[#0B3D2E] dark:text-[#D4AF37] text-xs">
                Gross Earnings
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Basic Pay</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.baseSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Allowances (Medical/Travel)</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.allowances.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Overtime & Performance Bonus</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.overtimeBonus.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-2 font-bold bg-[#F5F8F5] dark:bg-[#0B3D2E]/30">
                  <span className="text-[#0B3D2E] dark:text-white">Total Gross Earnings</span>
                  <span className="font-mono tabular-nums text-[#146C43] dark:text-[#D4AF37]">
                    PKR {totalGross.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-[#F5F8F5] dark:bg-[#0B3D2E]/50 px-4 py-2 font-bold text-rose-700 dark:text-rose-400 text-xs">
                Statutory Deductions
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Statutory Income Tax</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.taxDeduction.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund (5%)</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.providentFund.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Other Deductions / Advance</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    PKR {record.otherDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-2 font-bold bg-[#F5F8F5] dark:bg-[#0B3D2E]/30">
                  <span className="text-rose-700 dark:text-rose-300">Total Deductions</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    PKR {totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Highlight Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B3D2E] to-[#146C43] text-white flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                Net Disbursed Take-Home Pay
              </span>
              <span className="text-3xl font-black font-mono tabular-nums">
                PKR {record.netSalary.toLocaleString()}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-200">
              <div>Disbursement: Automated Direct Deposit</div>
              <div>Audit Authorized: {record.processedBy}</div>
            </div>
          </div>

          {/* Signatures & Institutional Watermark */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              Developer: <strong className="text-[#0B3D2E] dark:text-white">M. Atta ur Rehman Khan</strong> (Roll No: <strong className="text-[#146C43] dark:text-[#D4AF37]">777760</strong>)
            </div>
            <div className="italic text-center sm:text-right">
              "Deeply thankful to SMIT and instructor Sir Azeem."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
