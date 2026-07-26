import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Calendar, Plus, CheckCircle, Trash2, Star } from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id: number, name: string }

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await academicService.getSessions();
      setSessions(data.results || data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSetCurrent = async (id) => {
    try {
      await academicService.setCurrentSession(id);
      fetchSessions();
    } catch (err) {
      console.error("Failed to set active session:", err);
    }
  };

  const initiateDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await academicService.deleteSession(deleteTarget.id);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicService.createSession(formData);
      setModalOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
      fetchSessions();
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Session Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#1A1918]">{row.name}</span>
          {row.is_current && <Badge variant="success">Active Session</Badge>}
        </div>
      )
    },
    { 
      header: 'Start Date', 
      accessor: 'start_date',
      render: (row) => <span className="font-mono text-xs">{row.start_date}</span>
    },
    { 
      header: 'End Date', 
      accessor: 'end_date',
      render: (row) => <span className="font-mono text-xs">{row.end_date}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_current && (
            <Button variant="secondary" size="sm" onClick={() => handleSetCurrent(row.id)} className="gap-1.5 py-1">
              <Star className="w-3.5 h-3.5 text-[#5C1D24]" /> Make Active
            </Button>
          )}
          <button
            onClick={() => initiateDelete(row.id, row.name)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Academic Administration Calendar</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Academic Sessions</h1>
          <p className="text-xs text-[#64748B] mt-1">Define school years (e.g. 2026-2027) and toggle the current active session.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Session
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm">
        <Table columns={columns} data={sessions} emptyMessage="No academic sessions configured yet." />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Academic Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Session Name"
            placeholder="2026 - 2027"
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
          <Button type="submit" variant="primary" className="w-full mt-2 shadow-sm" loading={submitting}>
            Create Session
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Delete Academic Session"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[#5C1D24] flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#1A1918]">Are you absolutely sure?</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              This will permanently delete the academic session <strong className="text-[#1A1918]">"{deleteTarget?.name}"</strong> and all its associated classes, student registers, timetables, fee collections, and report cards. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1 text-xs bg-[#5C1D24] text-white hover:bg-[#5C1D24]/90" 
              onClick={handleConfirmDelete}
              loading={submitting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sessions;
