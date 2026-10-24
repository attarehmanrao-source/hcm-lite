import React from 'react';
import { X, Award, User, Code2, BookOpen, CheckCircle2, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3D2E] dark:bg-[#146C43] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-lg shadow-sm">
              HL
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B3D2E] dark:text-white">
                About HCM Lite HRMS
              </h2>
              <p className="text-xs text-slate-500">AI-Assisted Human Resource Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Mandatory Institutional Acknowledgment Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5F8F5] to-emerald-50 dark:from-[#0B3D2E]/50 dark:to-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/40 shadow-xs">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E] dark:text-[#D4AF37]">
                  Institutional Mentorship & Gratitude
                </h3>
                <blockquote className="mt-2 text-sm italic font-serif text-[#182B24] dark:text-[#F5F8F5] leading-relaxed">
                  "I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today."
                </blockquote>
              </div>
            </div>
          </div>

          {/* Developer Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-[#F5F8F5]/60 dark:bg-[#0B3D2E]/30">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <User className="w-4 h-4 text-[#146C43] dark:text-[#D4AF37]" />
                Principal Software Architect
              </div>
              <div className="mt-2 text-base font-black text-[#0B3D2E] dark:text-white">
                M. Atta ur Rehman Khan
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Roll No: <span className="font-mono font-bold text-[#146C43] dark:text-[#D4AF37]">777760</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-[#F5F8F5]/60 dark:bg-[#0B3D2E]/30">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                Mentorship & Academy
              </div>
              <div className="mt-2 text-base font-black text-[#0B3D2E] dark:text-white">
                SMIT (Saylani Mass IT Training)
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Instructor & Guide: <strong className="text-[#146C43] dark:text-[#D4AF37]">Sir Azeem</strong>
              </div>
            </div>
          </div>

          {/* System Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Full-Stack Architecture & Security
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/20">
                <span className="font-bold text-[#0B3D2E] dark:text-[#D4AF37] block mb-1">Backend & RBAC</span>
                <span className="text-slate-600 dark:text-slate-300">FastAPI & Express RESTful APIs, JWT Auth, Strict RBAC (Admin, HR, Employee).</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/20">
                <span className="font-bold text-[#0B3D2E] dark:text-[#D4AF37] block mb-1">Database & ORM</span>
                <span className="text-slate-600 dark:text-slate-300">Clean empty start with zero dummy data on fresh launch, preserving real mutations.</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/20">
                <span className="font-bold text-[#0B3D2E] dark:text-[#D4AF37] block mb-1">AI Assistant</span>
                <span className="text-slate-600 dark:text-slate-300">Gemini 3.8 Flash LLM with direct function execution for live leave and attendance queries.</span>
              </div>
            </div>
          </div>

          {/* 9 Modules Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              9 Certified Enterprise Modules
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>1. Authentication & First-Sign-In Password Flow</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>2. Employee Directory & CSV Import/Export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>3. Attendance Tracking & Digital Punch Clock</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>4. Leave Application & Multi-Level Review</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>5. Payroll Engine & Automated Payslip PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>6. Executive Dashboards & Real-Time KPIs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>7. AI Assistant with Gemini Tool Calling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>8. Broadcast Company Announcements Board</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37] shrink-0" />
                <span>9. Compliance Audit Trail</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0B3D2E] dark:bg-[#146C43] rounded-xl hover:opacity-95"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
