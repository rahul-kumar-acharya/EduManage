import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { UserCheck, Plus, Trash2, Mail, Phone, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTeacher, setEditTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('class_teachers');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    employee_id: '',
    department: '',
    qualification: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id: number, name: string }

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data.results || data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

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
      fetchTeachers();
    } catch (err) {
      console.error("Failed to delete teacher:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (teacher) => {
    setEditTeacher(teacher);
    setFormData({
      first_name: teacher.user?.first_name || '',
      last_name: teacher.user?.last_name || '',
      email: teacher.user?.email || '',
      password: '', // Password is not required during edit
      phone: teacher.user?.phone || '',
      employee_id: teacher.employee_id || '',
      department: teacher.department || '',
      qualification: teacher.qualification || '',
      is_active: teacher.user?.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTeacher(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      employee_id: '',
      department: '',
      qualification: '',
      is_active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editTeacher) {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          employee_id: formData.employee_id,
          department: formData.department,
          qualification: formData.qualification,
          is_active: formData.is_active,
        };
        await teacherService.updateTeacher(editTeacher.id, payload);
      } else {
        await teacherService.createTeacher(formData);
      }
      handleCloseModal();
      fetchTeachers();
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

  const classTeachers = teachers.filter((t) => t.is_class_teacher);
  const nonClassTeachers = teachers.filter((t) => !t.is_class_teacher);

  const getColumns = () => {
    const baseColumns = [
      {
        header: 'Teacher Name',
        accessor: 'user',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B2A4A] text-white font-bold flex items-center justify-center text-xs">
              {row.user?.first_name?.charAt(0)}{row.user?.last_name?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-[#1A1918]">{row.user?.first_name} {row.user?.last_name}</div>
              <div className="text-xs text-[#64748B]">{row.user?.email}</div>
            </div>
          </div>
        )
      },
      {
        header: 'Employee ID',
        accessor: 'employee_id',
        render: (row) => <span className="font-mono text-xs text-[#1B2A4A] font-bold">{row.employee_id}</span>
      },
      {
        header: 'Department',
        accessor: 'department',
        render: (row) => <Badge variant="info">{row.department || 'General'}</Badge>
      },
      {
        header: 'Qualification',
        accessor: 'qualification',
        render: (row) => <span className="text-xs text-[#64748B] font-medium">{row.qualification || 'N/A'}</span>
      }
    ];

    if (activeTab === 'class_teachers') {
      baseColumns.push({
        header: 'Assigned Class Section',
        accessor: 'assigned_class_sections',
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.assigned_class_sections && row.assigned_class_sections.length > 0 ? (
              row.assigned_class_sections.map((sec, idx) => (
                <Badge key={idx} variant="success">{sec}</Badge>
              ))
            ) : (
              <span className="text-xs text-[#64748B] italic">No Class Assigned</span>
            )}
          </div>
        )
      });
    }

    baseColumns.push(
      {
        header: 'Status',
        accessor: 'user.is_active',
        render: (row) => (
          <Badge variant={row.user?.is_active ? 'success' : 'danger'}>
            {row.user?.is_active ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
    );

    if (isAdmin) {
      baseColumns.push({
        header: 'Actions',
        accessor: 'actions',
        render: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit(row)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
              title="Edit Teacher"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => initiateDelete(row.id, `${row.user?.first_name} ${row.user?.last_name}`)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
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

  const activeData = activeTab === 'class_teachers' ? classTeachers : nonClassTeachers;

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <UserCheck className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Faculty & Instructors Directory</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Faculty & Teachers</h1>
          <p className="text-xs text-[#64748B] mt-1">Manage teaching staff credentials and departmental assignments.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        )}
      </div>

      {/* Segment Tab Controls */}
      <div className="flex border-b border-[#E5E0D8]">
        <button
          onClick={() => setActiveTab('class_teachers')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'class_teachers'
              ? 'border-[#1B2A4A] text-[#1B2A4A]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1918]'
          }`}
        >
          Class Teachers ({classTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('non_class_teachers')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'non_class_teachers'
              ? 'border-[#1B2A4A] text-[#1B2A4A]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1918]'
          }`}
        >
          Non Class Teachers ({nonClassTeachers.length})
        </button>
      </div>

      {/* Teachers Directory Table */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Synchronizing instructor and credential profiles...
          </div>
        ) : (
          <Table 
            columns={getColumns()} 
            data={activeData} 
            emptyMessage={activeTab === 'class_teachers' ? "No class teachers assigned yet." : "No non-class teachers registered."} 
          />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editTeacher ? "Edit Faculty Instructor" : "Register Faculty Instructor"}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jane"
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
          <div className="grid grid-cols-2 gap-3">
            <div className={editTeacher ? "col-span-2" : ""}>
              <Input
                label="Official Email"
                type="email"
                placeholder="jane.smith@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editTeacher}
              />
            </div>
            {!editTeacher && (
              <Input
                label="Portal Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee ID"
              placeholder="EMP-102"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department"
              placeholder="e.g. Mathematics"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Input
              label="Qualification"
              placeholder="e.g. M.Sc. Mathematics"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>
          {editTeacher && (
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Account Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
              >
                <option value="active">Active (Can Login & Teach)</option>
                <option value="inactive">Inactive (Suspended / Left School)</option>
              </select>
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
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
          <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[#5C1D24] flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#1A1918]">Are you absolutely sure?</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              This will permanently remove the teacher profile of <strong className="text-[#1A1918]">"{deleteTarget?.name}"</strong>. This will also remove them from all assigned sections, timetables, and subjects. This action cannot be undone.
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

export default TeacherList;
