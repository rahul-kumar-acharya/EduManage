import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { UserCheck, Plus, Trash2, Edit2, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CLASS_ORDER = [
  'Nursery', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
];

const getClassRank = (className) => {
  if (!className) return 99;
  const idx = CLASS_ORDER.findIndex(c => c.toLowerCase() === className.trim().toLowerCase());
  return idx !== -1 ? idx : 99;
};

const formatSectionName = (secName) => {
  if (!secName) return '';
  const clean = secName.replace(/^section\s*/i, '').trim();
  return `Section ${clean}`;
};

const TeacherList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Delete Confirmation Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id: number, name: string }

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    assigned_section_id: '',
    is_active: true,
  });
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachersAndSections = async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        teacherService.getTeachers(),
        academicService.getSections(),
      ]);
      setTeachers(tData.results || tData);
      setSections(sData.results || sData);
    } catch (err) {
      console.error("Failed to fetch teachers or sections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersAndSections();
  }, []);

  // Auto-trigger Add Teacher modal if navigated with location.state?.openAddModal
  useEffect(() => {
    if (location.state?.openAddModal && isAdmin) {
      handleOpenCreateModal();
    }
  }, [location.state, isAdmin]);

  const sortedSections = [...sections].sort((a, b) => {
    const rankA = getClassRank(a.class_name);
    const rankB = getClassRank(b.class_name);
    if (rankA !== rankB) return rankA - rankB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const handleOpenCreateModal = () => {
    setError('');
    setEditTeacher(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      qualification: '',
      assigned_section_id: '',
      is_active: true,
    });
    setEmployeeNumber('');
    setModalOpen(true);
  };

  const handleStartEdit = (teacher) => {
    setError('');
    setEditTeacher(teacher);
    const assignedSec = sections.find(s => s.class_teacher === teacher.id);
    setFormData({
      first_name: teacher.user?.first_name || '',
      last_name: teacher.user?.last_name || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      department: teacher.department || '',
      qualification: teacher.qualification || '',
      assigned_section_id: assignedSec ? assignedSec.id.toString() : '',
      is_active: teacher.user?.is_active ?? true,
    });
    const rawEmp = teacher.employee_id || '';
    setEmployeeNumber(rawEmp.replace(/^emp-?\s*/i, '').trim());
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTeacher(null);
    setError('');
    setEmployeeNumber('');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      qualification: '',
      assigned_section_id: '',
      is_active: true,
    });
  };

  const validateForm = () => {
    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
    const cleanFn = formData.first_name.trim().replace(/\s+/g, ' ');
    const cleanLn = formData.last_name.trim().replace(/\s+/g, ' ');

    if (!cleanFn || !nameRegex.test(cleanFn)) {
      setError("First Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.");
      return false;
    }
    if (!cleanLn || !nameRegex.test(cleanLn)) {
      setError("Last Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid official email address (e.g. name@school.com).");
      return false;
    }

    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError("Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).");
        return false;
      }
      const duplicatePhone = teachers.some(
        (t) => t.id !== editTeacher?.id && t.user?.phone === cleanPhone
      );
      if (duplicatePhone) {
        setError("A user with this phone number already exists.");
        return false;
      }
    }

    const cleanEmpNumber = employeeNumber.replace(/[^0-9]/g, '').trim();
    if (!cleanEmpNumber) {
      setError("Employee ID number cannot be empty. Please enter numeric digits (e.g. 102).");
      return false;
    }

    return true;
  };

  const handleAssignSectionToTeacher = async (teacher, newSectionIdStr) => {
    try {
      const newSectionId = newSectionIdStr ? parseInt(newSectionIdStr) : null;
      const currentAssignedSection = sections.find(s => s.class_teacher === teacher.id);

      if (currentAssignedSection && currentAssignedSection.id !== newSectionId) {
        await academicService.assignTeacher(currentAssignedSection.id, null);
      }

      if (newSectionId) {
        await academicService.assignTeacher(newSectionId, teacher.id);
        const targetSec = sections.find(s => s.id === newSectionId);
        const secLabel = `${targetSec?.class_name || 'Class'} — ${formatSectionName(targetSec?.name)}`;
        setSuccessBanner(`${teacher.user?.first_name} ${teacher.user?.last_name} assigned as Class Teacher for ${secLabel}.`);
      } else if (currentAssignedSection) {
        setSuccessBanner(`${teacher.user?.first_name} ${teacher.user?.last_name} unassigned from class teacher role.`);
      }

      fetchTeachersAndSections();
    } catch (err) {
      console.error("Failed to update class teacher assignment:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const cleanEmpNumber = employeeNumber.replace(/[^0-9]/g, '').trim();
      const finalEmployeeId = `EMP-${cleanEmpNumber}`;

      let targetTeacherId = null;

      if (editTeacher) {
        targetTeacherId = editTeacher.id;
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          employee_id: finalEmployeeId,
          department: formData.department,
          qualification: formData.qualification,
          is_active: formData.is_active,
        };
        await teacherService.updateTeacher(editTeacher.id, payload);
        setSuccessBanner(`Faculty profile for ${formData.first_name} ${formData.last_name} updated successfully.`);
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone,
          employee_id: finalEmployeeId,
          department: formData.department,
          qualification: formData.qualification,
        };
        const createdProfile = await teacherService.createTeacher(payload);
        targetTeacherId = createdProfile.id;
        setSuccessBanner(`Faculty instructor ${formData.first_name} ${formData.last_name} registered! A temporary password has been emailed to ${formData.email}.`);
      }

      // Process Class Section assignment if selected in form
      if (targetTeacherId) {
        const selectedSecId = formData.assigned_section_id ? parseInt(formData.assigned_section_id) : null;
        const currentAssignedSec = sections.find(s => s.class_teacher === targetTeacherId);

        if (currentAssignedSec && currentAssignedSec.id !== selectedSecId) {
          await academicService.assignTeacher(currentAssignedSec.id, null);
        }
        if (selectedSecId) {
          await academicService.assignTeacher(selectedSecId, targetTeacherId);
        }
      }

      handleCloseModal();
      fetchTeachersAndSections();
    } catch (err) {
      console.error("Failed to submit teacher form:", err);
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
                return `${key.replace('_', ' ').toUpperCase()}: ${cleanVal}`;
              })
              .join(' | ');
            setError(messages);
          } else {
            setError(JSON.stringify(errorData));
          }
        } else {
          setError(JSON.stringify(errorData));
        }
      } else {
        setError(editTeacher ? "Failed to save changes." : "Failed to create teacher account.");
      }
    } finally {
      setSubmitting(false);
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
      await teacherService.deleteTeacher(deleteTarget.id);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchTeachersAndSections();
      setSuccessBanner(`Teacher profile removed successfully.`);
    } catch (err) {
      console.error("Failed to delete teacher:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const classTeachers = teachers.filter((t) => sections.some(s => s.class_teacher === t.id));
  const nonClassTeachers = teachers.filter((t) => !sections.some(s => s.class_teacher === t.id));

  const getColumns = () => {
    const baseColumns = [
      {
        header: 'Teacher Name',
        accessor: 'user',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs shadow-indigo-600/20">
              {row.user?.first_name?.charAt(0)}{row.user?.last_name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{row.user?.first_name} {row.user?.last_name}</div>
              <div className="text-xs text-slate-500">{row.user?.email}</div>
            </div>
          </div>
        )
      },
      {
        header: 'Employee ID',
        accessor: 'employee_id',
        render: (row) => <span className="font-mono text-xs text-indigo-600 font-semibold">{row.employee_id}</span>
      },
      {
        header: 'Assigned Class Section',
        accessor: 'class_section_assignment',
        render: (row) => {
          const assignedSec = sections.find(s => s.class_teacher === row.id);
          if (!isAdmin) {
            return assignedSec ? (
              <Badge variant="success">{`${assignedSec.class_name} — ${formatSectionName(assignedSec.name)}`}</Badge>
            ) : (
              <span className="text-xs text-slate-400 italic">Subject Teacher</span>
            );
          }

          return (
            <select
              value={assignedSec ? assignedSec.id.toString() : ''}
              onChange={(e) => handleAssignSectionToTeacher(row, e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer max-w-52 truncate shadow-xs transition-colors"
            >
              <option value="">-- Subject Teacher (Not Assigned) --</option>
              {sortedSections.map((sec) => {
                const isCurrentRowSec = sec.class_teacher === row.id;
                const isOtherTeacherAssigned = sec.class_teacher && !isCurrentRowSec;
                const otherTeacher = isOtherTeacherAssigned ? teachers.find(t => t.id === sec.class_teacher) : null;
                const otherTeacherName = otherTeacher ? `${otherTeacher.user?.first_name}` : '';

                return (
                  <option key={sec.id} value={sec.id.toString()}>
                    {sec.class_name} — {formatSectionName(sec.name)} {isOtherTeacherAssigned ? `(${otherTeacherName})` : ''}
                  </option>
                );
              })}
            </select>
          );
        }
      },
      {
        header: 'Department',
        accessor: 'department',
        render: (row) => <Badge variant="info">{row.department || 'General'}</Badge>
      },
      {
        header: 'Qualification',
        accessor: 'qualification',
        render: (row) => <span className="text-xs text-slate-500 font-medium">{row.qualification || 'N/A'}</span>
      },
      {
        header: 'Status',
        accessor: 'user.is_active',
        render: (row) => (
          <Badge variant={row.user?.is_active ? 'success' : 'danger'}>
            {row.user?.is_active ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
    ];

    if (isAdmin) {
      baseColumns.push({
        header: 'Actions',
        accessor: 'actions',
        render: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Edit Teacher"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => initiateDelete(row.id, `${row.user?.first_name} ${row.user?.last_name}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove Teacher"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      });
    }

    return baseColumns;
  };

  const getFilteredData = () => {
    if (activeTab === 'class_teachers') return classTeachers;
    if (activeTab === 'subject_teachers') return nonClassTeachers;
    return teachers;
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
        <span>Faculty & Staff Directory</span>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-medium shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="text-emerald-700 font-bold hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Faculty Members</h1>
          <p className="text-xs text-slate-500 mt-1">Manage teaching staff profiles, employee IDs, and section assignments.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Register Faculty
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-8 text-xs font-semibold overflow-x-auto pb-0.5 whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          All Teachers ({teachers.length})
        </button>
        <button
          onClick={() => setActiveTab('class_teachers')}
          className={`pb-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'class_teachers'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          Class Teachers ({classTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('subject_teachers')}
          className={`pb-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'subject_teachers'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          Subject Teachers ({nonClassTeachers.length})
        </button>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        data={getFilteredData()}
        isLoading={loading}
        pageSize={25}
        emptyMessage="No faculty members found in the directory."
      />

      {/* Register/Edit Teacher Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        title={editTeacher ? "Edit Faculty Profile" : "Register Faculty Instructor"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name *"
              placeholder="Jane"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name *"
              placeholder="Smith"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Input
              label="Official Email *"
              type="email"
              placeholder="jane.smith@school.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!editTeacher}
            />
          </div>

          {!editTeacher && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs flex items-center gap-2.5 text-indigo-900 font-medium">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>A secure temporary password will be auto-generated and emailed to official email automatically.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employee ID *
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 text-indigo-600 text-xs font-bold px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 select-none shrink-0 font-mono">
                  EMP-
                </span>
                <input
                  type="text"
                  required
                  placeholder="102"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">"EMP-" prefix is locked. Type numbers only (e.g. 102).</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210 (starts with 6-9)"
                value={formData.phone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (raw.length > 0 && !['6', '7', '8', '9'].includes(raw[0])) {
                    return;
                  }
                  setFormData({ ...formData, phone: raw.slice(0, 10) });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">10-digit number starting with 6, 7, 8, or 9.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assign Class Section (Optional)
            </label>
            <select
              value={formData.assigned_section_id}
              onChange={(e) => setFormData({ ...formData, assigned_section_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
            >
              <option value="">-- Not Assigned (Subject Teacher) --</option>
              {sortedSections.map((sec) => (
                <option key={sec.id} value={sec.id.toString()}>
                  {sec.class_name} — {formatSectionName(sec.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department (Optional)"
              placeholder="e.g. Mathematics"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Input
              label="Qualification (Optional)"
              placeholder="e.g. M.Sc. Mathematics"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>

          {editTeacher && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
              >
                <option value="active">Active (Can Login & Teach)</option>
                <option value="inactive">Inactive (Suspended / Left School)</option>
              </select>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
            {editTeacher ? "Save Changes" : "Register Faculty"}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Remove Faculty Profile"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Are you absolutely sure?</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              This will permanently remove the teacher profile of <strong className="text-slate-900">"{deleteTarget?.name}"</strong>. This will also remove them from all assigned sections, timetables, and subjects. This action cannot be undone.
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

export default TeacherList;
