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
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <Bell className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Notice Board Bulletin</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Notice Board & Announcements</h1>
          <p className="text-xs text-[#64748B] mt-1">Publish circulars, holiday announcements, and event updates for students & staff.</p>
        </div>
        {isManageAllowed && (
          <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Post Notice
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Synchronizing notice board records...
          </div>
        ) : notices.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1918]">{n.title}</h3>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5 font-semibold">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" /> {new Date(n.created_at).toLocaleDateString()}
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
                      className="p-1.5 rounded text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors shrink-0"
                      title="Edit Notice"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => queueDelete(n.id)}
                      className="p-1.5 rounded text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors shrink-0"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed pt-3 border-t border-[#F7F5F0] font-medium">
              {n.content}
            </p>
          </div>
        ))}

        {notices.length === 0 && !loading && (
          <div className="bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
            No notices published yet.
          </div>
        )}
      </div>

      {/* Edit / Add Notice Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit School Notice" : "Publish School Circular / Notice"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Notice Title"
            placeholder="e.g. Annual Sports Meet Schedule 2026"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Notice Content
            </label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
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
              className="rounded bg-[#F7F5F0] border-[#E5E0D8] text-[#1B2A4A] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="is_public" className="text-xs text-[#64748B] font-semibold cursor-pointer">
              Visible publicly on portal & parent dashboard
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
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
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Are you sure you want to permanently remove this announcement from the notice board? This action cannot be undone and will hide the bulletin from all student, teacher, and parent portal dashboards.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F7F5F0]">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F7F5F0] text-[#64748B] hover:bg-[#E5E0D8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#5C1D24] text-white hover:bg-[#5C1D24]/80 transition-colors shadow-sm"
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
