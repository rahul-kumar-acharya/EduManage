import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Users, Plus, Trash2, Edit2, Search } from 'lucide-react';

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

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    admission_number: '',
    roll_number: '',
    section: '',
    guardian_name: '',
    guardian_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const fetchStudents = async () => {
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
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedSection, searchQuery]);

  const openEnrollModal = () => {
    setEditStudent(null);
    const defaultSection = user?.role === 'TEACHER'
      ? (user.class_teacher_sections?.[0]?.id?.toString() || '')
      : (selectedSection || (sections.length > 0 ? sections[0].id.toString() : ''));

    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: 'StudentPassword123!',
      phone: '',
      admission_number: '',
      roll_number: '',
      section: defaultSection,
      guardian_name: '',
      guardian_phone: '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleStartEdit = (student) => {
    setEditStudent(student);
    setFormData({
      first_name: student.user?.first_name || '',
      last_name: student.user?.last_name || '',
      email: student.user?.email || '',
      password: '', // Not required during edit
      phone: student.user?.phone || '',
      admission_number: student.admission_number || '',
      roll_number: student.roll_number || '',
      section: student.section || selectedSection || (sections.length > 0 ? sections[0].id.toString() : ''),
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
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
      email: '',
      password: '',
      phone: '',
      admission_number: '',
      roll_number: '',
      section: '',
      guardian_name: '',
      guardian_phone: '',
    });
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
    try {
      // Build request payload
      const payload = { ...formData };
      if (editStudent && !payload.password) {
        delete payload.password; // Do not send blank password to avoid validation errors
      }

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
      header: 'Student Info',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center font-bold text-xs">
            {row.user?.first_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">
              {row.user?.first_name} {row.user?.last_name}
            </div>
            <div className="text-[10px] text-[#64748B] font-mono">{row.admission_number}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Class / Section',
      accessor: 'section_details',
      render: (row) => (
        <Badge variant="purple">
          {row.section_details ? `${row.section_details.class_name} - ${row.section_details.name}` : 'Unassigned'}
        </Badge>
      )
    },
    {
      header: 'Roll No.',
      accessor: 'roll_number',
      render: (row) => <span className="text-xs text-[#64748B] font-bold">#{row.roll_number || 'N/A'}</span>
    },
    {
      header: 'Guardian Info',
      accessor: 'guardian_name',
      render: (row) => (
        <div className="text-xs">
          <div className="text-[#1A1918] font-bold">{row.guardian_name || 'N/A'}</div>
          <div className="text-[#64748B]">{row.guardian_phone}</div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        const isUserAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
        const isAssignedSection = user?.class_teacher_sections?.some((sec) => sec.id === row.section);
        const canEditRow = isUserAdmin || (user?.role === 'TEACHER' && isAssignedSection);

        if (!canEditRow) {
          return <span className="text-[10px] text-[#64748B] italic select-none">Read-Only</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStartEdit(row)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
              title="Edit Student details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => queueDelete(row.id)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
              title="Remove Student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  // Filter columns based on user context
  const columns = allColumns.filter((col) => {
    if (col.accessor === 'actions') {
      const isUserAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
      const isClassTeacher = user?.role === 'TEACHER' && (user.class_teacher_sections?.length > 0);
      return isUserAdmin || isClassTeacher;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <Users className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Institutional Student Roster</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Students Roster</h1>
          <p className="text-xs text-[#64748B] mt-1">Manage student admissions, section assignments, and guardian contacts.</p>
        </div>
        {canManageStudents && (
          <Button variant="primary" size="sm" onClick={openEnrollModal} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Enroll Student
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Search by student name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        {sections.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.class_name} - {sec.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Retrieving enrolled student accounts...
          </div>
        ) : (
          <Table columns={columns} data={students} emptyMessage="No enrolled students found." />
        )}
      </div>

      {/* Enroll / Edit Student Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editStudent ? "Edit Student Details" : "Enroll New Student"}>
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Alex"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="alex.smith@abcschool.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={editStudent ? "New Password (Optional)" : "Default Password"}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editStudent}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Admission No."
              placeholder="ADM-2026-001"
              value={formData.admission_number}
              onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
              required
            />
            <Input
              label="Roll No."
              placeholder="15"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Assigned Section
            </label>
            {user?.role === 'TEACHER' ? (
              <div className="w-full bg-[#F7F5F0]/70 border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-bold text-[#1B2A4A] select-none">
                {user.class_teacher_sections?.[0]
                  ? `${user.class_teacher_sections[0].class_level_name} - ${user.class_teacher_sections[0].section_name}`
                  : 'Assigned Section'}
              </div>
            ) : (
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
                required
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_name} - {sec.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Guardian Name"
              placeholder="Robert Smith"
              value={formData.guardian_name}
              onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
            />
            <Input
              label="Guardian Phone"
              placeholder="+1234567890"
              value={formData.guardian_phone}
              onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            {editStudent ? "Save Changes" : "Enroll Student Account"}
          </Button>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Student Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Are you sure you want to permanently delete this student record? This will erase the student profile, grade reports, attendance histories, and suspend their login credentials.
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
              Delete Student
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentList;
