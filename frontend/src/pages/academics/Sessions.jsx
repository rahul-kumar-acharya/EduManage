import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Calendar, Plus, CheckCircle, Trash2, Star, AlertCircle } from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const currentYear = new Date().getFullYear();

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

  const handleStartDateChange = (val) => {
    setValidationError('');
    let updatedEnd = formData.end_date;
    let updatedName = formData.name;

    if (val) {
      const start = new Date(val);
      if (!isNaN(start.getTime())) {
        const startYr = start.getFullYear();

        if (startYr !== currentYear) {
          setValidationError(`Session start date must be in the current ongoing year (${currentYear}). Past or future start years are not permitted.`);
        } else {
          // Auto-suggest end date (1 year minus 1 day, e.g., 2026-04-01 -> 2027-03-31)
          const suggestedEnd = new Date(startYr + 1, start.getMonth(), start.getDate() - 1);
          const monthStr = String(suggestedEnd.getMonth() + 1).padStart(2, '0');
          const dayStr = String(suggestedEnd.getDate()).padStart(2, '0');
          updatedEnd = `${suggestedEnd.getFullYear()}-${monthStr}-${dayStr}`;

          // Auto-suggest session name
          updatedName = `${startYr} - ${startYr + 1}`;
        }
      }
    }

    setFormData({
      ...formData,
      start_date: val,
      end_date: updatedEnd,
      name: updatedName || formData.name
    });
  };

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

  const validateFormData = () => {
    if (!formData.name || !formData.name.trim()) {
      return "Session name is required.";
    }

    // Check Session Name Year Range (e.g., "2026 - 2028" is invalid)
    const nameMatch = formData.name.match(/(\d{4})\s*[-–/]\s*(\d{4})/);
    if (nameMatch) {
      const y1 = parseInt(nameMatch[1], 10);
      const y2 = parseInt(nameMatch[2], 10);
      if (y2 - y1 !== 1) {
        return `Session name year range must be exactly 1 year (e.g. ${y1} - ${y1 + 1}). Multi-year range '${formData.name}' is not permitted.`;
      }
      if (y1 !== currentYear) {
        return `Session name starting year (${y1}) must be the current ongoing year (${currentYear}).`;
      }
    }

    if (!formData.start_date) {
      return "Start date is required.";
    }
    if (!formData.end_date) {
      return "End date is required.";
    }

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (isNaN(start.getTime())) {
      return "Invalid start date format.";
    }
    if (isNaN(end.getTime())) {
      return "Invalid end date format.";
    }

    // 1. Start date must be in the current ongoing year
    if (start.getFullYear() !== currentYear) {
      return `Session start date must be in the current ongoing year (${currentYear}). Past or future starting years are not permitted.`;
    }

    // 2. End date must be after start date
    if (end <= start) {
      return "End date must be after the start date.";
    }

    // 3. Duration must be exactly 1 year (350 to 366 days)
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays < 350 || diffDays > 366) {
      return `Academic session duration must be exactly 1 year (12 months / ~365 days). Selected range span is ${diffDays} days.`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const errorMsg = validateFormData();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setSubmitting(true);
    try {
      await academicService.createSession(formData);
      setModalOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
      fetchSessions();
    } catch (err) {
      console.error("Failed to create session:", err);
      const resData = err.response?.data;
      if (resData) {
        if (resData.name) {
          setValidationError(Array.isArray(resData.name) ? resData.name.join(' ') : resData.name);
        } else if (resData.start_date) {
          setValidationError(Array.isArray(resData.start_date) ? resData.start_date.join(' ') : resData.start_date);
        } else if (resData.end_date) {
          setValidationError(Array.isArray(resData.end_date) ? resData.end_date.join(' ') : resData.end_date);
        } else if (resData.non_field_errors) {
          setValidationError(Array.isArray(resData.non_field_errors) ? resData.non_field_errors.join(' ') : resData.non_field_errors);
        } else if (typeof resData === 'string') {
          setValidationError(resData);
        } else {
          const firstKey = Object.keys(resData)[0];
          setValidationError(`${firstKey}: ${resData[firstKey]}`);
        }
      } else {
        setValidationError("Failed to create academic session. Please check all fields.");
      }
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
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 font-['Outfit']">{row.name}</span>
          {row.is_current && <Badge variant="success">Active Session</Badge>}
        </div>
      )
    },
    { 
      header: 'Start Date', 
      accessor: 'start_date',
      render: (row) => <span className="font-mono text-xs text-slate-600">{row.start_date}</span>
    },
    { 
      header: 'End Date', 
      accessor: 'end_date',
      render: (row) => <span className="font-mono text-xs text-slate-600">{row.end_date}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_current && (
            <Button variant="secondary" size="sm" onClick={() => handleSetCurrent(row.id)} className="gap-1.5 py-1 text-xs">
              <Star className="w-3.5 h-3.5 text-indigo-600" /> Make Active
            </Button>
          )}
          <button
            onClick={() => initiateDelete(row.id, row.name)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
        <span>Academic Administration Calendar</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">Academic Sessions</h1>
          <p className="text-xs text-slate-500 mt-1">Define school years (e.g. 2026-2027) and toggle the current active session.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setValidationError(''); setModalOpen(true); }} className="gap-2 shadow-xs">
          <Plus className="w-4 h-4" /> Add Session
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <Table columns={columns} data={sessions} emptyMessage="No academic sessions configured yet." />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Academic Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <Input
            label="Session Name (Single Year Range e.g. 2026 - 2027)"
            placeholder={`${currentYear} - ${currentYear + 1}`}
            value={formData.name}
            onChange={(e) => {
              setValidationError('');
              setFormData({ ...formData, name: e.target.value });
            }}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Start Date (Ongoing Year ${currentYear})`}
              type="date"
              min={`${currentYear}-01-01`}
              max={`${currentYear}-12-31`}
              value={formData.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
            <Input
              label="End Date (1 Year Duration)"
              type="date"
              value={formData.end_date}
              onChange={(e) => {
                setValidationError('');
                setFormData({ ...formData, end_date: e.target.value });
              }}
              required
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 uppercase tracking-wider font-['Outfit']">Validation Rules Applied:</div>
            <div>• Session name year range must be <strong>exactly 1 year</strong> (e.g., 2026 - 2027).</div>
            <div>• Multi-year range like <strong>2026 - 2028</strong> is prohibited.</div>
            <div>• Start date must be in the current ongoing year (<strong>{currentYear}</strong>).</div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
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
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Are you absolutely sure?</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              This will permanently delete the academic session <strong className="text-slate-900">"{deleteTarget?.name}"</strong> and all its associated classes, student registers, timetables, fee collections, and report cards. This action cannot be undone.
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
              className="flex-1 text-xs" 
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
