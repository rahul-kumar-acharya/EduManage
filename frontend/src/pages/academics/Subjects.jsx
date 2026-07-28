import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Subjects = () => {
  const { user } = useAuth();
  const canManageSubjects = user?.permissions?.manage_subjects ?? false;

  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterSection, setFilterSection] = useState('');

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);

  const [formData, setFormData] = useState({ name: '', code: '', class_level: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const [subData, classRes, secRes] = await Promise.all([
        academicService.getSubjects(),
        academicService.getClasses(),
        academicService.getSections(),
      ]);
      setSubjects(subData.results || subData);
      setClassLevels(classRes.results || classRes);
      setSections(secRes.results || secRes);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (user?.role === 'TEACHER' && user.class_teacher_sections?.length > 0) {
      setFilterSection(user.class_teacher_sections[0].id.toString());
    }
  }, [user]);

  const getDisplaySubjects = () => {
    if (!filterSection) return subjects;
    const targetSec = sections.find((s) => s.id.toString() === filterSection);
    if (!targetSec) return subjects;
    return subjects.filter((sub) => sub.class_level === targetSec.class_level);
  };

  const getFormClassLevels = () => {
    if (user?.role !== 'TEACHER') {
      return classLevels;
    }
    const assignedLevels = [];
    user.class_teacher_sections?.forEach((sec) => {
      if (!assignedLevels.some((lvl) => lvl.id === sec.class_level_id)) {
        assignedLevels.push({
          id: sec.class_level_id,
          name: `${sec.class_level_name} - Section ${sec.section_name}`,
        });
      }
    });
    return assignedLevels;
  };

  const openCreateModal = () => {
    setEditId(null);
    const allowedLevels = getFormClassLevels();
    setFormData({
      name: '',
      code: '',
      class_level: allowedLevels.length > 0 ? allowedLevels[0].id.toString() : '',
    });
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      class_level: subject.class_level?.toString() || '',
    });
    setModalOpen(true);
  };

  const queueDelete = (id) => {
    setDeleteSubjectId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSubjectId) return;
    try {
      await academicService.deleteSubject(deleteSubjectId);
      setDeleteConfirmOpen(false);
      setDeleteSubjectId(null);
      fetchSubjects();
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        class_level: formData.class_level ? parseInt(formData.class_level) : null,
      };

      if (editId) {
        await academicService.updateSubject(editId, payload);
      } else {
        await academicService.createSubject(payload);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ name: '', code: '', class_level: '' });
      fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isUserAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const columns = [
    {
      header: 'Subject Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#1A1918]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Class & Section',
      accessor: 'class_level_name',
      render: (row) => {
        let secNames = '';
        if (filterSection) {
          const selSec = sections.find((s) => s.id.toString() === filterSection);
          if (selSec) {
            secNames = selSec.name;
          }
        }
        if (!secNames) {
          const classSecs = sections.filter((s) => s.class_level === row.class_level);
          secNames = classSecs.length > 0 ? classSecs.map((s) => s.name).join(', ') : '';
        }
        return (
          <div className="flex flex-col">
            <span className="font-bold text-xs text-[#1B2A4A]">
              {row.class_level_name || 'All Classes'}
            </span>
            {secNames && (
              <span className="text-[10px] font-semibold text-[#64748B]">
                Section {secNames}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Subject Code',
      accessor: 'code',
      render: (row) => <span className="font-mono text-xs text-[#1B2A4A] font-bold">{row.code || 'N/A'}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        let canEditRow = false;

        if (isUserAdmin) {
          canEditRow = true;
        } else if (user?.role === 'TEACHER') {
          if (filterSection) {
            canEditRow = user?.class_teacher_sections?.some(
              (sec) => sec.id.toString() === filterSection
            );
          } else {
            canEditRow = user?.class_teacher_sections?.some(
              (sec) => sec.class_level_id === row.class_level
            );
          }
        }

        if (!canEditRow) {
          return <span className="text-[10px] text-[#64748B] italic select-none">Read-Only</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
              title="Edit Subject"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => queueDelete(row.id)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <BookOpen className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Syllabus Curriculum</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Academics Subjects</h1>
          <p className="text-xs text-[#64748B] mt-1">Configure subjects, courses, and syllabus codes for each class level.</p>
        </div>
        {canManageSubjects && (
          <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm max-w-sm flex items-center gap-3">
        <label className="text-xs font-bold text-[#1A1918] uppercase tracking-wider whitespace-nowrap">
          Filter Grade & Section:
        </label>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
        >
          <option value="">All Grades & Sections</option>
          {sections.length > 0 ? (
            sections.map((sec) => (
              <option key={sec.id} value={sec.id.toString()}>
                {sec.class_name} - Section {sec.name}
              </option>
            ))
          ) : (
            classLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id.toString()}>
                {lvl.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Subjects Registry Table */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Synchronizing curriculum and syllabus registries...
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={getDisplaySubjects()} 
            emptyMessage="No subjects configured yet." 
          />
        )}
      </div>

      {/* Edit / Add Subject Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Subject" : "Add New Subject"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Mathematics"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. MATH-10"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          {user?.role !== 'TEACHER' && (
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Class Level assignment
              </label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
                required
              >
                <option value="">Select Class Level</option>
                {getFormClassLevels().map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            {editId ? "Save Changes" : "Create Subject"}
          </Button>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Subject Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Are you sure you want to delete this subject? Deleting this subject will remove it from all class schedules, gradebooks, and homework records.
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
              Delete subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subjects;
