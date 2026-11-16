import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, Edit2, Search, ShieldCheck, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentList = () => {
  const { user } = useAuth();
  const canManageStudents = user?.permissions?.manage_students ?? false;
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [error, setError] = useState('');

  // Bulk Import modal states
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSection, setBulkSection] = useState('');
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    admission_number: '',
    roll_number: '',
    section: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const cleanSecDisplay = (secName) => {
    if (!secName) return 'N/A';
    const clean = secName.replace(/^section\s*/i, '').trim();
    return `Section ${clean}`;
  };

  const fetchSections = async () => {
    try {
      const data = await academicService.getSections();
      const list = data.results || data;
      setSections(list);
      setSelectedSection('');
    } catch (err) {
      console.error("Failed to fetch sections:", err);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSection) params.section = selectedSection;
      if (searchQuery) params.search = searchQuery;
      const data = await studentService.getStudents(params);
      setStudents(data.results || data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSection, searchQuery]);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Calculate next available roll number for a section
  const getNextRollNumber = (secId) => {
    if (!secId) return '1';
    const secStudents = students.filter(
      (s) => (s.section?.toString() === secId.toString() || s.section_details?.id?.toString() === secId.toString())
    );
    if (secStudents.length === 0) return '1';
    const rollNums = secStudents
      .map((s) => parseInt(s.roll_number, 10))
      .filter((num) => !isNaN(num));
    if (rollNums.length === 0) return '1';
    return (Math.max(...rollNums) + 1).toString();
  };

  const openEnrollModal = () => {
    setEditStudent(null);
    const defaultSection = user?.role === 'TEACHER'
      ? (user.class_teacher_sections?.[0]?.id?.toString() || '')
      : (selectedSection || (sections.length > 0 ? sections[0].id.toString() : ''));

    const autoRoll = getNextRollNumber(defaultSection);

    setFormData({
      first_name: '',
      last_name: '',
      admission_number: '',
      roll_number: autoRoll,
      section: defaultSection,
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
    });
    setError('');
    setModalOpen(true);
  };

  // Bulk Modal Actions
  const openBulkModal = () => {
    const defaultSec = user?.role === 'TEACHER'
      ? (user.class_teacher_sections?.[0]?.id?.toString() || '')
      : (selectedSection || (sections.length > 0 ? sections[0].id.toString() : ''));

    setBulkSection(defaultSec);
    setBulkRows([]);
    setBulkError('');
    setBulkSuccessMsg('');
    setBulkModalOpen(true);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = `first_name,last_name,guardian_name,guardian_phone,guardian_email,admission_number
Rahul,Jha,Mukesh Jha,9876543210,parent1@gmail.com,
Anita,Sharma,Sunil Sharma,9876543211,parent2@gmail.com,
Vikram,Singh,Rajesh Singh,9876543212,parent3@gmail.com,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkError('');
    setBulkSuccessMsg('');
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          setBulkError('CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const fnIdx = headers.indexOf('first_name');
        const lnIdx = headers.indexOf('last_name');

        if (fnIdx === -1 || lnIdx === -1) {
          setBulkError('CSV header must contain at least "first_name" and "last_name" columns.');
          return;
        }

        const gnIdx = headers.indexOf('guardian_name');
        const gpIdx = headers.indexOf('guardian_phone');
        const geIdx = headers.indexOf('guardian_email');
        const admIdx = headers.indexOf('admission_number');

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const rowVals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (rowVals.length < 2 || !rowVals[fnIdx]) continue;

          parsed.push({
            first_name: rowVals[fnIdx] || '',
            last_name: rowVals[lnIdx] || '',
            guardian_name: gnIdx !== -1 ? rowVals[gnIdx] || '' : '',
            guardian_phone: gpIdx !== -1 ? rowVals[gpIdx] || '' : '',
            guardian_email: geIdx !== -1 ? rowVals[geIdx] || '' : '',
            admission_number: admIdx !== -1 ? rowVals[admIdx] || '' : '',
          });
        }

        if (parsed.length === 0) {
          setBulkError('No valid student rows found in the uploaded file.');
          return;
        }

        setBulkRows(parsed);
      } catch (err) {
        console.error("Failed to parse CSV:", err);
        setBulkError('Failed to parse CSV file. Please ensure it is formatted correctly.');
      }
    };

    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (!bulkSection) {
      setBulkError('Please select a target Class Section.');
      return;
    }
    if (bulkRows.length === 0) {
      setBulkError('Please upload a valid CSV file containing student records.');
      return;
    }

    setBulkSubmitting(true);
    setBulkError('');
    setBulkSuccessMsg('');

    try {
      const payload = {
        section: parseInt(bulkSection),
        records: bulkRows
      };

      const res = await studentService.bulkCreateStudents(payload);
      setBulkSuccessMsg(`Successfully enrolled ${res.created_count} students into the selected section!`);
      fetchStudents();
      setTimeout(() => {
        setBulkModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error("Failed bulk enrollment:", err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setBulkError(errorData.errors.join(' | '));
        } else {
          setBulkError(errorData.detail || 'Bulk enrollment failed.');
        }
      } else {
        setBulkError('Connection failure. Please try again.');
      }
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleStartEdit = (student) => {
    setEditStudent(student);
    setFormData({
      first_name: student.user?.first_name || '',
      last_name: student.user?.last_name || '',
      admission_number: student.admission_number || '',
      roll_number: student.roll_number || '',
      section: student.section?.toString() || selectedSection || (sections.length > 0 ? sections[0].id.toString() : ''),
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || student.user?.email || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditStudent(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      admission_number: '',
      roll_number: '',
      section: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
    });
  };

  const handleSectionSelectChange = (secId) => {
    const nextRoll = getNextRollNumber(secId);
    setFormData((prev) => ({
      ...prev,
      section: secId,
      roll_number: editStudent ? prev.roll_number : nextRoll,
    }));
  };

  const queueDelete = (id) => {
    setDeleteStudentId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStudentId) return;
    try {
      await studentService.deleteStudent(deleteStudentId);
      setDeleteConfirmOpen(false);
      setDeleteStudentId(null);
      fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Name validations (letters and single spaces only, no numbers/special chars/extra spaces)
    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
    const cleanFn = formData.first_name.trim().replace(/\s+/g, ' ');
    const cleanLn = formData.last_name.trim().replace(/\s+/g, ' ');
    const cleanGn = formData.guardian_name ? formData.guardian_name.trim().replace(/\s+/g, ' ') : '';

    if (!cleanFn || !nameRegex.test(cleanFn)) {
      setError('First Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.');
      setSubmitting(false);
      return;
    }
    if (!cleanLn || !nameRegex.test(cleanLn)) {
      setError('Last Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.');
      setSubmitting(false);
      return;
    }
    if (cleanGn && !nameRegex.test(cleanGn)) {
      setError('Guardian Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.');
      setSubmitting(false);
      return;
    }

    // Guardian phone validation (10-digit Indian phone starting 6-9)
    if (formData.guardian_phone) {
      const cleanPhone = formData.guardian_phone.trim();
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Guardian Phone must be a valid 10-digit mobile number starting with 6–9.');
        setSubmitting(false);
        return;
      }
      const duplicatePhone = students.some(
        (s) => s.id !== editStudent?.id && (s.guardian_phone === cleanPhone || s.user?.phone === cleanPhone)
      );
      if (duplicatePhone) {
        setError('A user with this phone number already exists.');
        setSubmitting(false);
        return;
      }
    }

    // Guardian email validation
    if (formData.guardian_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardian_email.trim())) {
      setError('Please enter a valid Guardian Email Address.');
      setSubmitting(false);
      return;
    }

    // Roll number digits only validation & Sequential Order Check
    if (formData.roll_number) {
      if (!/^\d+$/.test(formData.roll_number.trim())) {
        setError('Roll Number must contain digits only.');
        setSubmitting(false);
        return;
      }
    }

    if (!editStudent && formData.section) {
      const expectedNext = getNextRollNumber(formData.section);
      if (formData.roll_number && formData.roll_number.trim() !== expectedNext) {
        setError(`Roll Numbers must follow sequential order (1, 2, 3...). Next required Roll Number for this section is #${expectedNext}.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        first_name: cleanFn,
        last_name: cleanLn,
        guardian_name: cleanGn,
      };

      if (editStudent) {
        await studentService.updateStudent(editStudent.id, payload);
      } else {
        await studentService.createStudent(payload);
      }
      
      handleCloseModal();
      fetchStudents();
    } catch (err) {
      console.error("Failed to submit student details:", err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const targetErrors = errorData.errors || errorData;
          if (typeof targetErrors === 'object') {
            const messages = Object.entries(targetErrors)
              .map(([key, val]) => {
                const cleanVal = Array.isArray(val)
                  ? val.join(' ')
                  : (typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
                return `${key}: ${cleanVal}`;
              });
            setError(messages.join(' | '));
          } else {
            setError(JSON.stringify(errorData));
          }
        } else {
          setError(err.response.data.detail || 'An error occurred during student registration.');
        }
      } else {
        setError('Connection failure. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const allColumns = [
    {
      header: 'Student Name',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs shadow-xs">
            {row.user?.first_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="font-semibold text-slate-900">
            {row.user?.first_name} {row.user?.last_name}
          </div>
        </div>
      )
    },
    {
      header: 'Admission No.',
      accessor: 'admission_number',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
          {row.admission_number || 'N/A'}
        </span>
      )
    },
    {
      header: 'Roll No.',
      accessor: 'roll_number',
      render: (row) => (
        <span className="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700 border border-slate-200">
          #{row.roll_number || 'N/A'}
        </span>
      )
    },
    {
      header: 'Guardian Contact',
      accessor: 'guardian_name',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.guardian_name || 'N/A'}</div>
          <div className="text-[11px] text-slate-500 font-medium flex flex-col gap-0.5 mt-0.5">
            {row.guardian_phone && <span className="font-mono">📞 {row.guardian_phone}</span>}
            {row.guardian_email && <span className="font-mono text-indigo-600">✉️ {row.guardian_email}</span>}
            {!row.guardian_phone && !row.guardian_email && <span className="italic text-slate-400">No contact details</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        if (!canManageStudents && user?.role !== 'SUPER_ADMIN') {
          return <span className="text-xs text-slate-400 italic">Read-only</span>;
        }

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Edit Student"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => queueDelete(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  const columns = allColumns;

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="flex items-center gap-2 select-none">
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold uppercase tracking-wider">
          Directory
        </span>
        <span className="text-slate-400 text-xs font-semibold">/</span>
        <span className="text-xs font-bold text-slate-900">Students Directory</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage student enrollments, sections, and guardian contacts.</p>
        </div>
        {(canManageStudents || user?.role === 'SUPER_ADMIN') && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="sm" onClick={openBulkModal} className="flex-1 sm:flex-none gap-2 shadow-xs">
              <Upload className="w-4 h-4 text-indigo-600" /> Bulk Upload (CSV)
            </Button>
            <Button variant="primary" size="sm" onClick={openEnrollModal} className="flex-1 sm:flex-none gap-2 shadow-xs">
              <Plus className="w-4 h-4" /> Enroll Student
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or admission no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {user?.role !== 'TEACHER' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider shrink-0">
              Filter Section:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors w-full sm:w-64 cursor-pointer"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.class_name} — {cleanSecDisplay(sec.name)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Table 
        columns={columns} 
        data={students} 
        isLoading={loading} 
        pageSize={25}
        emptyMessage="No enrolled students found in this section." 
      />

      {/* Enroll / Edit Student Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        title={editStudent ? "Edit Student Details" : "Enroll New Student"}
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Row 1: Student Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Alex"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
              required
            />
          </div>

          {/* Row 2: Assigned Class Section & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Class & Section
              </label>
              {user?.role === 'TEACHER' ? (
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 select-none truncate">
                  {user.class_teacher_sections?.[0]
                    ? `${user.class_teacher_sections[0].class_level_name} — ${cleanSecDisplay(user.class_teacher_sections[0].section_name)}`
                    : 'Assigned Section'}
                </div>
              ) : (
                <select
                  value={formData.section}
                  onChange={(e) => handleSectionSelectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.class_name} — {cleanSecDisplay(sec.name)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              label="Roll No. (Numbers Only)"
              placeholder="1"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.replace(/[^0-9]/g, '') })}
            />
          </div>

          {/* Row 3: Admission No. & Guardian Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Admission No. (Optional)"
              placeholder="Auto-generated if left blank"
              value={formData.admission_number}
              onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
            />

            <Input
              label="Guardian Name"
              placeholder="Robert Smith"
              value={formData.guardian_name}
              onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
            />
          </div>

          {/* Row 4: Guardian Phone & Guardian Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Guardian Phone (10-Digit)"
              placeholder="9876543210"
              maxLength={10}
              value={formData.guardian_phone}
              onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value.replace(/[^0-9]/g, '') })}
            />
            <Input
              label="Guardian Email Address"
              type="email"
              placeholder="parent@example.com"
              value={formData.guardian_email}
              onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
            />
          </div>

          {/* Password Email Note Pill */}
          <div className="text-[11px] text-slate-600 bg-indigo-50 px-3.5 py-2.5 rounded-xl border border-indigo-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Temporary login credentials will be automatically emailed to Guardian Email.</span>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
            {editStudent ? "Save Changes" : "Enroll Student Account"}
          </Button>
        </form>
      </Modal>

      {/* Bulk Upload Students Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Enroll Students (CSV Import)"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          
          {bulkError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{bulkError}</span>
            </div>
          )}

          {bulkSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bulkSuccessMsg}</span>
            </div>
          )}

          {/* Top Controls: Section & Sample CSV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                1. Target Class Section
              </label>
              {user?.role === 'TEACHER' ? (
                <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-700 truncate">
                  {user.class_teacher_sections?.[0]
                    ? `${user.class_teacher_sections[0].class_level_name} — ${cleanSecDisplay(user.class_teacher_sections[0].section_name)}`
                    : 'Assigned Section'}
                </div>
              ) : (
                <select
                  value={bulkSection}
                  onChange={(e) => setBulkSection(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="">Select Target Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.class_name} — {cleanSecDisplay(sec.name)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                2. CSV Template
              </label>
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-indigo-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample CSV
              </button>
            </div>
          </div>

          {/* CSV File Upload Zone */}
          {bulkRows.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-white">
              <FileSpreadsheet className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-semibold text-slate-900">Upload your Student List CSV</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Required headers: <code className="font-mono font-semibold text-indigo-600">first_name, last_name</code></p>

              <label className="mt-3 inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-600/20">
                Select CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* Parsed Rows Preview Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Parsed {bulkRows.length} Students for Batch Enrollment:
                </span>
                <button
                  type="button"
                  onClick={() => setBulkRows([])}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear & Re-upload
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Guardian Name</th>
                      <th className="px-3 py-2">Guardian Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-3 py-1.5 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-1.5 font-semibold text-slate-900">{r.first_name} {r.last_name}</td>
                        <td className="px-3 py-1.5 text-slate-500">{r.guardian_name || 'N/A'}</td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-indigo-600">{r.guardian_phone || r.guardian_email || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleBulkSubmit}
              loading={bulkSubmitting}
              disabled={bulkRows.length === 0 || !bulkSection}
            >
              Enroll {bulkRows.length > 0 ? `${bulkRows.length} Students` : 'Batch'}
            </Button>
          </div>

        </div>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Student Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete this student record? This will erase the student profile, grade reports, attendance histories, and suspend their login credentials.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              Delete Student Record
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StudentList;
