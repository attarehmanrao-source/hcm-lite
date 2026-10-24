import React from 'react';
import { Award, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white/95 dark:bg-[#071F17]/95 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0B3D2E] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
            HL
          </div>
          <div>
            <span className="font-bold text-[#0B3D2E] dark:text-[#D4AF37]">HCM Lite</span> &mdash; AI-Assisted Human Resource Management System
            <span className="mx-2 hidden sm:inline text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-slate-600 dark:text-slate-300">
              Developer: <strong className="font-semibold text-[#0B3D2E] dark:text-white">M. Atta ur Rehman Khan</strong> (Roll No: <strong className="font-mono text-[#146C43] dark:text-[#D4AF37]">777760</strong>)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 italic font-serif text-[11px] max-w-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 px-3 py-1.5 rounded-lg border border-[#146C43]/15 dark:border-[#D4AF37]/20">
          <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span>
            "I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today."
          </span>
        </div>
      </div>
    </footer>
  );
};
