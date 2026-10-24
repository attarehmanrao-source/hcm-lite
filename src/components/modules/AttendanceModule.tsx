import React, { useEffect, useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock4,
  UserCheck,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AttendanceRecord } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AttendanceModule: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Adjustment modal for HR/Admin
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<AttendanceRecord | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
    notes: '',
  });

  // Ticking live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, todayRes] = await Promise.all([
        api.getAttendance({ date: selectedDate }),
        api.getTodayAttendance(),
      ]);
      setAttendanceList(list);
      setTodayRecord(todayRes.record || null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.checkIn();
      toast.success(res.message || 'Checked in successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.checkOut();
      toast.success(res.message || 'Checked out successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    try {
      await api.adjustAttendance({
        employeeId: adjustTarget.employeeId,
        date: adjustTarget.date,
        checkInTime: adjustForm.checkInTime,
        checkOutTime: adjustForm.checkOutTime,
        status: adjustForm.status,
        notes: adjustForm.notes,
      });
      toast.success('Attendance punch adjusted successfully');
      setShowAdjustModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Adjustment failed');
    }
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;
  const canAdjust = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shift Presence & Punctuality Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Attendance Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time digital punch clock, working hour calculations, and compliance ledger
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold">Ledger Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Digital Punch Clock & Today's Shift Card */}
      <div className="p-6 rounded-3xl border border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Real-time Clock */}
        <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-6">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block mb-1">
            Official System Time
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-[#0B3D2E] dark:text-[#D4AF37]">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Center: Shift Punch Status */}
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
            Your Shift Status (Today)
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">CHECK IN</span>
              <span className="font-mono font-bold text-[#182B24] dark:text-white">
                {todayRecord?.checkInTime || '--:--'}
              </span>
            </div>
            <div className="text-slate-300 dark:text-slate-700">|</div>
            <div>
              <span className="text-slate-400 block text-[10px]">CHECK OUT</span>
              <span className="font-mono font-bold text-[#182B24] dark:text-white">
                {todayRecord?.checkOutTime || '--:--'}
              </span>
            </div>
            <div className="text-slate-300 dark:text-slate-700">|</div>
            <div>
              <span className="text-slate-400 block text-[10px]">HOURS</span>
              <span className="font-mono font-bold text-[#146C43] dark:text-[#D4AF37]">
                {todayRecord ? `${todayRecord.totalHours}h` : '--'}
              </span>
            </div>
          </div>
          {todayRecord?.status && (
            <div className="text-[11px] text-slate-500 mt-1">
              Status Classification: <strong className="text-[#146C43] dark:text-[#D4AF37] uppercase font-mono">{todayRecord.status}</strong>
            </div>
          )}
        </div>

        {/* Right: Interactive Punch Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn || actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <LogIn className="w-4 h-4 text-[#D4AF37]" />
            <span>{isCheckedIn ? 'Checked In' : 'Punch Check-In'}</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut || actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{isCheckedOut ? 'Shift Logged' : 'Punch Check-Out'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <div className="border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B3D2E] dark:text-white">
              Attendance Records &bull; {selectedDate}
            </h3>
            <span className="text-[11px] text-slate-500">
              {attendanceList.length} total entries recorded
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading attendance records...
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Clock4 className="w-10 h-10 mx-auto text-[#146C43]/40 dark:text-[#D4AF37]/40" />
            <div className="text-sm font-bold text-[#0B3D2E] dark:text-white">
              No Attendance Records for {selectedDate}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check in using the digital punch clock above or pick an alternative date on the ledger filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#146C43]/15 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  {canAdjust && <th className="py-3 px-4 text-right">Adjust</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F5F8F5]/80 dark:hover:bg-[#0B3D2E]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#182B24] dark:text-white">{rec.employeeName}</div>
                      <span className="font-mono text-[10px] text-[#D4AF37] font-semibold">{rec.employeeId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{rec.department}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {rec.checkInTime || '--:--'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {rec.checkOutTime || '--:--'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#146C43] dark:text-[#D4AF37]">
                      {rec.totalHours} hrs
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase font-mono ${
                          rec.status === 'Present'
                            ? 'text-[#146C43] dark:text-emerald-400'
                            : rec.status === 'Late'
                            ? 'text-[#D4AF37]'
                            : 'text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {rec.notes || '-'}
                    </td>
                    {canAdjust && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustTarget(rec);
                            setAdjustForm({
                              checkInTime: rec.checkInTime || '09:00',
                              checkOutTime: rec.checkOutTime || '17:30',
                              status: rec.status,
                              notes: rec.notes || 'Corrected by HR',
                            });
                            setShowAdjustModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#146C43] dark:hover:text-[#D4AF37] rounded-lg hover:bg-slate-100 dark:hover:bg-[#071F17]"
                          title="Adjust punch record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustModal && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B3D2E] dark:text-white">
                Adjust Attendance Record
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 my-2">
              Modifying shift for <strong>{adjustTarget.employeeName}</strong> on {adjustTarget.date}
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Check In (HH:mm)</label>
                  <input
                    type="time"
                    value={adjustForm.checkInTime}
                    onChange={(e) => setAdjustForm({ ...adjustForm, checkInTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Check Out (HH:mm)</label>
                  <input
                    type="time"
                    value={adjustForm.checkOutTime}
                    onChange={(e) => setAdjustForm({ ...adjustForm, checkOutTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={adjustForm.status}
                  onChange={(e) => setAdjustForm({ ...adjustForm, status: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Adjustment Reason / Notes</label>
                <textarea
                  rows={2}
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
