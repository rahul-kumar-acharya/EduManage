import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { examService } from '../../services/examService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { FileSpreadsheet, Plus, Calendar, Edit3, Award, Trash2 } from 'lucide-react';

const ExamList = () => {
  const { user } = useAuth();
  const isManageAllowed = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examService.getExams();
      setExams(data.results || data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (ex) => {
    setEditId(ex.id);
    setFormData({
      name: ex.name,
      start_date: ex.start_date,
      end_date: ex.end_date,
    });
    setModalOpen(true);
  };

  const queueDelete = (id) => {
    setDeleteExamId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteExamId) return;
    try {
      await examService.deleteExam(deleteExamId);
      setDeleteConfirmOpen(false);
      setDeleteExamId(null);
      fetchExams();
    } catch (err) {
      console.error("Failed to delete exam:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await examService.updateExam(editId, formData);
      } else {
        await examService.createExam(formData);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ name: '', start_date: '', end_date: '' });
      fetchExams();
    } catch (err) {
      console.error("Failed to save exam:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <FileSpreadsheet className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Academic Assessment Control</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Examinations & Gradebooks</h1>
          <p className="text-xs text-[#64748B] mt-1">Schedule examination terms, log subject marks, and issue report cards.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {user?.role === 'TEACHER' && (
            <Link to="/dashboard/exams/marks-entry" className="flex-1 sm:flex-none">
              <Button variant="secondary" size="sm" className="w-full gap-2 py-2 shadow-sm">
                <Edit3 className="w-4 h-4 text-[#1B2A4A]" /> Gradebook Entry
              </Button>
            </Link>
          )}
          {isManageAllowed && (
            <Button variant="primary" size="sm" onClick={openCreateModal} className="flex-1 sm:flex-none gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Exam
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Retrieving examination catalog rosters...
          </div>
        ) : exams.map((ex) => (
          <div key={ex.id} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <Badge variant="purple">Active Exam</Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1A1918]">{ex.name}</h3>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-1 font-mono font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{ex.start_date} → {ex.end_date}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F7F5F0] pt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {user?.role === 'TEACHER' && (
                  <Link to={`/dashboard/exams/marks-entry?exam=${ex.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 text-[10px] py-1 shadow-sm font-bold">
                      <Edit3 className="w-3 h-3 text-[#1B2A4A]" /> Enter Marks
                    </Button>
                  </Link>
                )}
                <Link to={`/dashboard/exams/report-card?exam=${ex.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1 text-[10px] py-1 shadow-sm font-bold">
                    <Award className="w-3 h-3 text-[#5C1D24]" /> Report Cards
                  </Button>
                </Link>
              </div>
              {isManageAllowed && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(ex)}
                    className="p-1.5 rounded text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
                    title="Edit Exam"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => queueDelete(ex.id)}
                    className="p-1.5 rounded text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors shrink-0"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {exams.length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
            No examination schedules created yet.
          </div>
        )}
      </div>

      {/* Edit / Add Exam Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Examination Term" : "Create New Examination Term"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Exam Term Name"
            placeholder="e.g. Midterm Examination 2026"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            {editId ? "Save Changes" : "Create Exam Term"}
          </Button>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Examination Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Are you sure you want to delete this examination term? Deleting this schedule will permanently erase all student gradebook records and report cards generated for this term.
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
              Delete exam term
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamList;
