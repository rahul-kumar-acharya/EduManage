import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
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
  if (!secName) return 'N/A';
  const clean = secName.replace(/^section\s*/i, '').trim();
  return `Section ${clean}`;
};

const Subjects = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN';

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

  const [formData, setFormData] = useState({ name: '', code: '', section: '' });
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
    return subjects.filter((sub) => sub.section?.toString() === filterSection);
  };

  const getFormSections = () => {
    if (user?.role !== 'TEACHER') {
      return sections;
    }
    return sections.filter((sec) =>
      user.class_teacher_sections?.some((s) => s.id === sec.id)
    );
  };

  const sortedSections = [...sections].sort((a, b) => {
    const rankA = getClassRank(a.class_name);
    const rankB = getClassRank(b.class_name);
    if (rankA !== rankB) return rankA - rankB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const openCreateModal = () => {
    setEditId(null);
    const allowedSecs = getFormSections();
    setFormData({
      name: '',
      code: '',
      section: filterSection || (allowedSecs.length > 0 ? allowedSecs[0].id.toString() : ''),
    });
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      section: subject.section?.toString() || filterSection || '',
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
      const selectedSecObj = sections.find((s) => s.id.toString() === formData.section);

      const autoCode = formData.name ? formData.name.trim().substring(0, 4).toUpperCase() : '';
      const payload = {
        name: formData.name,
        code: autoCode,
        section: formData.section ? parseInt(formData.section) : null,
        class_level: selectedSecObj ? selectedSecObj.class_level : null,
      };

      if (editId) {
        await academicService.updateSubject(editId, payload);
      } else {
        await academicService.createSubject(payload);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ name: '', section: '' });
      fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Evaluate if the logged in user has creation rights for the currently selected section
  let canCreateSubject = false;
  if (isSuperAdmin) {
    canCreateSubject = true;
  } else if (isSchoolAdmin) {
    canCreateSubject = false; // School Admin is Read-Only
  } else if (user?.role === 'TEACHER') {
    if (filterSection) {
      canCreateSubject = user?.class_teacher_sections?.some(
        (sec) => sec.id.toString() === filterSection
      );
    } else {
      canCreateSubject = user?.class_teacher_sections?.length > 0;
    }
  }

  const columns = [
    {
      header: 'Subject Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 font-['Outfit']">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Class & Section',
      accessor: 'class_name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-indigo-600 font-['Outfit']">
            {row.class_name || row.class_level_name || 'Class'}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {formatSectionName(row.section_name)}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        let canEditRow = false;

        if (isSuperAdmin) {
          canEditRow = true;
        } else if (isSchoolAdmin) {
          canEditRow = false; // Read-Only for School Admin
        } else if (user?.role === 'TEACHER') {
          if (filterSection) {
            canEditRow = user?.class_teacher_sections?.some(
              (sec) => sec.id.toString() === filterSection
            );
          } else {
            canEditRow = user?.class_teacher_sections?.some(
              (sec) => sec.id === row.section
            );
          }
        }

        if (!canEditRow) {
          return <span className="text-[10px] text-slate-400 italic font-semibold select-none bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Read-Only</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Edit Subject"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => queueDelete(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="flex items-center gap-2 select-none">
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold uppercase tracking-wider">
          Academics
        </span>
        <span className="text-slate-400 text-xs font-semibold">/</span>
        <span className="text-xs font-bold text-slate-900">Subjects Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">Subjects</h1>
          <p className="text-xs text-slate-500 mt-1">Configure subjects assigned to class sections.</p>
        </div>
        {canCreateSubject && (
          <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        )}
      </div>

      {/* Filter Section Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0 font-['Outfit']">
            Filter Section:
          </label>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors w-full sm:w-64 cursor-pointer"
          >
            <option value="">All Sections</option>
            {sortedSections.map((sec) => (
              <option key={sec.id} value={sec.id.toString()}>
                {sec.class_name || sec.class_level_name} - Section {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 hidden sm:block">
          Total Subjects: <span className="text-indigo-600 font-extrabold">{getDisplaySubjects().length}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-semibold">
            Synchronizing curriculum and syllabus registries...
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={getDisplaySubjects()} 
            emptyMessage="No subjects configured for this section yet." 
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
          {/* Target Class & Section Display */}
          {formData.section ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit']">
                Target Class & Section
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-indigo-700 flex items-center justify-between shadow-xs">
                <span>
                  {sections.find((s) => s.id.toString() === formData.section)?.class_name || 'Class'} — Section {sections.find((s) => s.id.toString() === formData.section)?.name || ''}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ Auto-Bound
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Outfit']">
                Target Class & Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                required
              >
                <option value="">Select Section</option>
                {getFormSections().map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_name || sec.class_level_name} - Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
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
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete this subject? Deleting this subject will remove it from this section's class schedule and homework records.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs shadow-rose-600/20 cursor-pointer"
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

