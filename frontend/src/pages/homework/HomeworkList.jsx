import React, { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homeworkService';
import { academicService } from '../../services/academicService';
import { timetableService } from '../../services/timetableService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { BookOpen, Plus, Calendar, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HomeworkList = () => {
  const { user } = useAuth();
  const isManageAllowed = user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN';

  const [homeworks, setHomeworks] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Custom delete modal confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteHomeworkId, setDeleteHomeworkId] = useState(null);

  const [filterSection, setFilterSection] = useState('');

  const [formData, setFormData] = useState({
    section: '',
    subject: '',
    title: '',
    description: '',
    due_date: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hwRes, secRes, subRes, periodRes] = await Promise.all([
        homeworkService.getHomeworks(),
        academicService.getSections(),
        academicService.getSubjects(),
        timetableService.getPeriods(),
      ]);
      setHomeworks(hwRes.results || hwRes);
      setSections(secRes.results || secRes);
      setSubjects(subRes.results || subRes);
      setPeriods(periodRes.results || periodRes);
    } catch (err) {
      console.error("Failed to fetch homework data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.role === 'TEACHER' && user.class_teacher_sections?.length > 0) {
      setFilterSection(user.class_teacher_sections[0].id.toString());
    }
  }, [user]);

  const getDueDateStatus = (dueDateStr) => {
    if (!dueDateStr) return { label: 'Active', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: 'bg-red-500/10 text-red-700 border-red-500/30' };
    } else if (diffDays === 0) {
      return { label: 'Due Today ⏰', color: 'bg-amber-500/10 text-amber-700 border-amber-500/30' };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' };
    }
    return { label: 'Active', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' };
  };

  const getDisplayHomeworks = () => {
    if (!filterSection) return homeworks;
    return homeworks.filter(
      (hw) => hw.section?.toString() === filterSection || hw.section_details?.id?.toString() === filterSection
    );
  };



  const getFilteredSections = () => {
    if (user?.role !== 'TEACHER') {
      return sections;
    }
    const teacherPeriods = periods.filter((p) => p.teacher?.user?.id === user.id);
    if (teacherPeriods.length === 0) {
      return sections;
    }
    return sections.filter((sec) => {
      const isClassTeacher = sec.class_teacher_details?.user?.id === user.id;
      const teachesInSection = teacherPeriods.some((p) => p.section?.id === sec.id);
      return isClassTeacher || teachesInSection;
    });
  };

  const getFilteredSubjects = (secVal = formData.section) => {
    if (!secVal) return [];
    const secId = parseInt(secVal);
    const selectedSec = sections.find((s) => s.id === secId);
    
    // Filter subjects belonging strictly to the selected Section (or matching class_level if legacy)
    let sectionFilteredSubjects = subjects.filter((sub) => {
      if (sub.section) {
        return sub.section === secId;
      }
      return !sub.class_level || sub.class_level === selectedSec?.class_level;
    });

    if (user?.role !== 'TEACHER') {
      return sectionFilteredSubjects;
    }
    
    const teacherPeriods = periods.filter((p) => p.teacher?.user?.id === user.id);
    if (teacherPeriods.length === 0) {
      return sectionFilteredSubjects;
    }
    const taughtSubjectIds = teacherPeriods
      .filter((p) => p.section?.id === secId)
      .map((p) => p.subject?.id);
    if (taughtSubjectIds.length === 0) {
      return sectionFilteredSubjects;
    }
    return sectionFilteredSubjects.filter((sub) => taughtSubjectIds.includes(sub.id));
  };


  const handleSectionChange = (sectionId) => {
    const filteredSubs = getFilteredSubjects(sectionId);
    setFormData({
      ...formData,
      section: sectionId,
      subject: filteredSubs.length > 0 ? filteredSubs[0].id.toString() : '',
    });
  };

  const openCreateModal = () => {
    setEditId(null);
    const availableSections = getFilteredSections();
    const defaultSection = availableSections.length > 0 ? availableSections[0].id.toString() : '';
    const filteredSubs = getFilteredSubjects(defaultSection);
    const defaultSubject = filteredSubs.length > 0 ? filteredSubs[0].id.toString() : '';
    setFormData({
      section: defaultSection,
      subject: defaultSubject,
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (hw) => {
    setEditId(hw.id);
    setFormData({
      section: hw.section?.toString() || '',
      subject: hw.subject?.toString() || '',
      title: hw.title,
      description: hw.description,
      due_date: hw.due_date,
    });
    setModalOpen(true);
  };

  const queueDelete = (id) => {
    setDeleteHomeworkId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteHomeworkId) return;
    try {
      await homeworkService.deleteHomework(deleteHomeworkId);
      setDeleteConfirmOpen(false);
      setDeleteHomeworkId(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete homework:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await homeworkService.updateHomework(editId, formData);
      } else {
        await homeworkService.createHomework(formData);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ section: '', subject: '', title: '', description: '', due_date: '' });
      fetchData();
    } catch (err) {
      console.error("Failed to save homework:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <BookOpen className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Academic Homework Dashboard</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Homework Assignments</h1>
          <p className="text-xs text-[#64748B] mt-1">Post class assignments, project instructions, and set submission deadlines.</p>
        </div>
        {isManageAllowed && (
          <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Homework
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-[#1A1918] uppercase tracking-wider whitespace-nowrap">
            Filter Class Section:
          </label>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="w-full sm:w-72 bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3.5 py-2 text-xs font-bold text-[#1B2A4A] focus:outline-none focus:border-[#1B2A4A] transition-colors"
          >
            <option value="">All Class Sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id.toString()}>
                {sec.class_name || sec.class_level_name} - Section {sec.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-[11px] text-[#64748B] font-semibold">
          Showing <strong className="text-[#1B2A4A]">{getDisplayHomeworks().length}</strong> homework assignment(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
            Retrieving homework catalogs and subject lists...
          </div>
        ) : (
          getDisplayHomeworks().map((hw) => {
            const dueStatus = getDueDateStatus(hw.due_date);
            return (
              <div key={hw.id} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="info">{hw.subject_name || hw.subject_details?.name || 'Subject'}</Badge>
                      <Badge variant="purple">
                        {hw.section_name || (hw.section_details ? `${hw.section_details.class_name} - ${hw.section_details.name}` : 'Section')}
                      </Badge>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${dueStatus.color}`}>
                      {dueStatus.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1918]">{hw.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 font-medium">{hw.description}</p>
                  
                  {/* Assigned By Teacher Attribution Badge */}
                  <div className="text-[10px] font-semibold text-[#1B2A4A] bg-[#F7F5F0] px-2.5 py-1 rounded-md inline-block">
                    ✍️ Assigned by: <span className="font-bold">{hw.assigned_by_name || 'Faculty / Admin'}</span>
                  </div>
                </div>

                <div className="border-t border-[#F7F5F0] pt-3 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Due: {hw.due_date}
                  </div>

                  {isManageAllowed && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(hw)}
                        className="p-1.5 rounded text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
                        title="Edit Homework"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => queueDelete(hw.id)}
                        className="p-1.5 rounded text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
                        title="Delete Homework"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {getDisplayHomeworks().length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
            No homework assignments posted for this section yet.
          </div>
        )}
      </div>


      {/* Edit / Add Homework Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Homework Assignment" : "Post Homework Assignment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Algebra Chapter 4 Exercises"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Class Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
                required
              >
                <option value="">Select Section</option>
                {getFilteredSections().map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_name} - {sec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
                required
              >
                <option value="">Select Subject</option>
                {getFilteredSubjects().map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Assignment Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
              rows="4"
              placeholder="Provide problem lists, references, or reading tasks..."
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            {editId ? "Save Assignment" : "Post Homework Assignment"}
          </Button>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Homework Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Are you sure you want to delete this homework assignment? Once deleted, the task will be removed from all student agendas and parent tracker feeds.
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
              Delete homework
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomeworkList;
