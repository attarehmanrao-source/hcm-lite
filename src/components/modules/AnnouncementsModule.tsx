import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  PlusCircle,
  Pin,
  Trash2,
  Calendar,
  AlertTriangle,
  FileText,
  Tag,
  X,
  Sparkles,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Announcement } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AnnouncementsModule: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    isPinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const canPost = user?.role === 'admin' || user?.role === 'hr';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.postAnnouncement(formData);
      toast.success('Broadcast announcement published!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        priority: 'Normal',
        isPinned: false,
      });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this broadcast bulletin?')) {
      try {
        await api.deleteAnnouncement(id);
        toast.info('Announcement removed');
        fetchAnnouncements();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete announcement');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Company-Wide Communications
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Announcements & Bulletins
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official executive notices, organizational updates, and policy amendments
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Bulletins Feed */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">
          Loading announcements feed...
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-16 text-center text-slate-500 space-y-3 border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-3xl bg-white dark:bg-[#0B3D2E]/40">
          <div className="w-16 h-16 rounded-full bg-[#146C43]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center mx-auto text-[#146C43] dark:text-[#D4AF37]">
            <Megaphone className="w-8 h-8" />
          </div>
          <div className="text-base font-bold text-[#0B3D2E] dark:text-white">
            No Active Bulletins Published
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no company-wide announcements or policy notices posted.
          </p>
          {canPost && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>Post First Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl border transition-all ${
                ann.isPinned
                  ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 shadow-xs'
                  : 'border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-white dark:bg-[#0B3D2E]/40'
              }`}
            >
              {/* Header metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  {ann.isPinned && (
                    <span className="font-bold text-[#D4AF37] flex items-center gap-1 font-mono text-[11px]">
                      <Pin className="w-3.5 h-3.5 fill-current" />
                      <span>PINNED</span>
                    </span>
                  )}
                  {ann.isPinned && <span aria-hidden="true">&bull;</span>}
                  <span className="font-semibold text-[#0B3D2E] dark:text-[#D4AF37]">{ann.category}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Priority: <strong className="uppercase font-mono text-[10px]">{ann.priority}</strong></span>
                  <span aria-hidden="true">&bull;</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>

                {canPost && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title & Body */}
              <div className="pt-3">
                <h3 className="text-base font-extrabold text-[#0B3D2E] dark:text-white mb-2">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  Posted by <strong className="text-slate-700 dark:text-slate-200">{ann.authorName}</strong> ({ann.authorRole})
                </div>
                <div className="font-mono text-[10px] text-[#D4AF37] font-semibold">ID: {ann.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B3D2E] dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Publish Corporate Bulletin</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Quarterly Town Hall & Performance Reviews Schedule"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                  >
                    <option value="General">General Information</option>
                    <option value="Policy">HR Policy Update</option>
                    <option value="Event">Corporate Event</option>
                    <option value="Alert">Operational Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Full Announcement Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Type the complete bulletin message..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-slate-300 text-[#146C43] focus:ring-[#146C43]"
                />
                <label htmlFor="pinCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Pin this announcement to top of dashboard feed
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
