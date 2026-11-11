import React, { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Bell, Plus, Calendar, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const isManageAllowed = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_public: true,
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getNotices();
      setNotices(data.results || data);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFormData({ title: '', content: '', is_public: true });
    setModalOpen(true);
  };

  const openEditModal = (notice) => {
    setEditId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
      is_public: notice.is_public
    });
    setModalOpen(true);
  };

  const queueDelete = (id) => {
    setDeleteNoticeId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteNoticeId) return;
    try {
      await noticeService.deleteNotice(deleteNoticeId);
      setDeleteConfirmOpen(false);
      setDeleteNoticeId(null);
      fetchNotices();
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await noticeService.updateNotice(editId, formData);
      } else {
        await noticeService.createNotice(formData);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ title: '', content: '', is_public: true });
      fetchNotices();
    } catch (err) {
      console.error("Failed to save notice:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <Bell className="w-3.5 h-3.5 text-indigo-600" />
        <span>Notice Board Bulletin</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Notice Board & Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">Publish circulars, holiday announcements, and event updates for students & staff.</p>
        </div>
        {isManageAllowed && (
          <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Post Notice
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-medium animate-pulse">
            Synchronizing notice board records...
          </div>
        ) : notices.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{n.is_public ? 'Public Announcement' : 'Internal Staff Only'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={n.is_public ? 'success' : 'warning'}>
                  {n.is_public ? 'Public' : 'Internal'}
                </Badge>
                {isManageAllowed && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0"
                      title="Edit Notice"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => queueDelete(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-100 font-normal">
              {n.content}
            </p>
          </div>
        ))}

        {notices.length === 0 && !loading && (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 shadow-xs font-medium italic">
            No notices published yet.
          </div>
        )}
      </div>

      {/* Edit / Add Notice Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit School Notice" : "Publish School Circular / Notice"}>
        <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
          <Input
            label="Notice Title"
            placeholder="e.g. Annual Sports Meet Schedule 2026"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Content
            </label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              placeholder="Write the full notice content here..."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="rounded bg-slate-50 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="is_public" className="text-xs text-slate-600 font-medium cursor-pointer">
              Visible publicly on portal & parent dashboard
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
            {editId ? "Save Changes" : "Publish Notice"}
          </Button>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Notice Deletion"
      >
        <div className="space-y-4 font-['Inter']">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently remove this announcement from the notice board? This action cannot be undone and will hide the bulletin from all student, teacher, and parent portal dashboards.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              Delete notice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NoticeBoard;
